import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PayslipResponseDto } from "src/application/employee/payslip/dto/payslip-response.dto";
import { Payroll } from "src/domain/entities/payroll.entity";
import { IAttendanceRepositoryToken } from "src/domain/repositories/attendance.repository";
import { IOvertimeRepositoryToken } from "src/domain/repositories/overtime.repository";
import { IPayrollRepositoryToken } from "src/domain/repositories/payroll.repository";
import { IReimbursementRepositoryToken } from "src/domain/repositories/reimbursement.repository";
import { IUserRepositoryToken } from "src/domain/repositories/user.repository";
import { PayrollRepository } from "src/infrastructure/admin/payroll/payroll.repository.prisma";
import { AttendanceRepository } from "src/infrastructure/employee/attendance/attendance.repository.prisma";
import { OvertimeRepository } from "src/infrastructure/employee/overtime/overtime.repository.prisma";
import { ReimbursementRepository } from "src/infrastructure/employee/reimbursement/reimbursement.repository.prisma";
import { UserRepository } from "src/infrastructure/user/repositories/user.repository.prisma";
import { AuditLogService } from "src/shared/audit-log/services/audit-log.service";
import { CreatePayrollPeriodDto } from "../dto/payroll-period-submit.dto";
import { IPayrollPeriodRepositoryToken } from "src/domain/repositories/payroll-period.repository";
import { PayrollPeriodRepository } from "src/infrastructure/admin/payroll/payroll-period.repository.prisma";
import { PayrollPeriod } from "src/domain/entities/payroll-period.entity";
import { User } from "@prisma/client";

@Injectable()
export class PayrollService {
    constructor(
        @Inject(IPayrollRepositoryToken)
        private readonly payrollRepo: PayrollRepository,
        @Inject(IPayrollPeriodRepositoryToken)
        private readonly payrollPeriodRepo: PayrollPeriodRepository,
        @Inject(IAttendanceRepositoryToken)
        private readonly attendanceRepo: AttendanceRepository,
        @Inject(IOvertimeRepositoryToken)
        private readonly overtimeRepo: OvertimeRepository,
        @Inject(IReimbursementRepositoryToken)
        private readonly reimbursementRepo: ReimbursementRepository,
        @Inject(IUserRepositoryToken)
        private readonly userRepo: UserRepository,
        private readonly auditLogService: AuditLogService,
    ) { }


    async findAllEmployees(): Promise<any[]> {
        return await this.userRepo.findAllByRole('EMPLOYEE');
    }
    async createPayrollPeriod(dto: CreatePayrollPeriodDto, requestId: string, performedBy: string) {
        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);

        const overlapping = await this.payrollPeriodRepo.findOverlap(start, end);

        if (overlapping) {
            throw new ConflictException('Overlapping payroll period already exists');
        }

        const payrollPeriod = new PayrollPeriod({
            periodStart: start,
            periodEnd: end,
            isLocked: false,
            createdBy: 'system',
            isDeleted: false,
        });

        return await this.payrollPeriodRepo.create(payrollPeriod);
    }
    async runPayroll(
        year: number,
        month: number,
        performedBy: string,
        requestId?: string
    ): Promise<{
        processedUsers: number;
        skippedUsers: number;
        failedUsers: number;
        errors?: Array<{ userId: string; error: string }>;
    }> {
        const result = {
            processedUsers: 0,
            skippedUsers: 0,
            failedUsers: 0,
            errors: [] as Array<{ userId: string; error: string }>
        };

        try {
            const period = await this.payrollPeriodRepo.findOneByMonthAndYear(year, month   );

            if (!period) {
                throw new NotFoundException(`No payroll period found for ${month}/${year}`);
            }

            if (!period || !period.id) {
                throw new NotFoundException('Payroll period not found or invalid');
            }

            const users = await this.userRepo.findAllEmployees();
            if (!users || users.length === 0) {
                throw new NotFoundException('No employees found');
            }

            const totalWorkingDays = this.countWeekdays(period.periodStart, period.periodEnd);
            if (totalWorkingDays <= 0) {
                throw new BadRequestException('No working days in the specified period');
            }

            for (const user of users) {
                try {
                    if (!user.salary || user.salary <= 0) {
                        throw new Error(`Invalid salary for user ${user.id}`);
                    }

                    const [attendances, overtimes, reimbursements] = await Promise.all([
                        this.attendanceRepo.findByUserAndPeriod(user.id, period.periodStart, period.periodEnd),
                        this.overtimeRepo.findByUserAndPeriod(user.id, period.periodStart, period.periodEnd),
                        this.reimbursementRepo.findByUserAndPeriod(user.id, period.periodStart, period.periodEnd),
                    ]);

                    const existing = await this.payrollRepo.findByUserAndPeriod(user.id, period.id);
                    if (existing) {
                        result.skippedUsers++;
                        continue;
                    }

                    const totalAttendances = attendances.length;
                    const proratedSalary = Math.round((user.salary * totalAttendances) / totalWorkingDays);

                    const totalOvertimeHours = overtimes.reduce((sum, o) => sum + o.hours, 0);
                    const hourlyRate = user.salary / totalWorkingDays / 8;
                    const overtimePay = Math.round(totalOvertimeHours * hourlyRate * 2);

                    const totalReimbursement = reimbursements.reduce((sum, r) => sum + r.amount, 0);

                    const payrollData = {
                        userId: user.id,
                        payrollPeriodId: period.id!,
                        baseSalary: user.salary,
                        proratedSalary,
                        overtimePay,
                        reimbursementTotal: totalReimbursement,
                        totalPay: proratedSalary + overtimePay + totalReimbursement,
                        totalOvertime: totalOvertimeHours,
                        totalReimbursement,
                        takeHomePay: proratedSalary + overtimePay + totalReimbursement,
                        isLocked: true,
                        isDeleted: false,
                        createdAt: new Date(),
                        createdBy: performedBy,
                        updatedAt: new Date(),
                        updatedBy: performedBy,

                    };

                    const saved = await this.payrollRepo.create(new Payroll(payrollData));

                    await Promise.all([
                        ...attendances.map(async att => {
                            try {
                                await this.attendanceRepo.lockAttendanceById(att.id!, performedBy, saved.id!);
                                await this.auditLogService.log({
                                    entity: 'Attendance',
                                    entityId: att.id!,
                                    action: 'UPDATE',
                                    performedBy,
                                    ipAddress: performedBy.split('|')[1] ?? null,
                                    requestId,
                                    oldData: { locked: false },
                                    newData: {
                                        locked: true,
                                        payrollId: saved.id,
                                    }
                                });
                            } catch (e) {
                                console.error(`Error locking attendance ${att.id!}:`, e);
                            }
                        }),
                        ...overtimes.map(async ot => {
                            try {
                                await this.overtimeRepo.lockOvertimeById(ot.id!, performedBy, saved.id!);
                                await this.auditLogService.log({
                                    entity: 'Overtime',
                                    entityId: ot.id!,
                                    action: 'UPDATE',
                                    performedBy,
                                    ipAddress: performedBy.split('|')[1] ?? null,
                                    requestId,
                                    oldData: { locked: false },
                                    newData: {
                                        locked: true,
                                        payrollId: saved.id,
                                    }
                                });
                            } catch (e) {
                                console.error(`Error locking overtime ${ot.id!}:`, e);
                            }
                        }),
                        ...reimbursements.map(async reimb => {
                            try {
                                await this.reimbursementRepo.lockReimbursementById(reimb.id!, performedBy, saved.id!);
                                await this.auditLogService.log({
                                    entity: 'Reimbursement',
                                    entityId: reimb.id!,
                                    action: 'UPDATE',
                                    performedBy,
                                    ipAddress: performedBy.split('|')[1] ?? null,
                                    requestId,
                                    oldData: { locked: false },
                                    newData: {
                                        locked: true,
                                        payrollId: saved.id,
                                    }
                                });
                            } catch (e) {
                                console.error(`Error locking reimbursement ${reimb.id!}:`, e);
                            }
                        })
                    ]);

                    await this.auditLogService.log({
                        entity: 'Payroll',
                        entityId: saved.id!,
                        action: 'CREATE',
                        performedBy,
                        ipAddress: performedBy.split('|')[1] ?? null,
                        requestId,
                        oldData: null,
                        newData: payrollData
                    });

                    result.processedUsers++;
                } catch (userError) {
                    result.failedUsers++;
                    result.errors.push({
                        userId: user.id,
                        error: userError.message
                    });
                    console.error(`Error processing payroll for user ${user.id}:`, userError);
                }
            }

            return result;
        } catch (globalError) {
            console.error("Global error in runPayroll:", globalError);
            throw globalError;
        }
    }

    async getPayslipByMonth(userId: string, year: number, month: number) {
        console.log('📅 getPayslipByMonth dipanggil dengan:');
        console.log('UserID:', userId);
        console.log('Year:', year);
        console.log('Month:', month);

        const period = await this.payrollPeriodRepo.findOneByMonthAndYear(year, month); // ⚠️ Pastikan urutan benar!
        console.log('🧾 Payroll Period ditemukan:', period);

        if (!period) {
            console.warn(`⚠️ Tidak ditemukan payroll period untuk ${month}/${year}`);
            throw new NotFoundException(`No payroll period found for ${month}/${year}`);
        }
        const checkPayrol = await this.payrollRepo.existsByPeriodId(period.id!)
        if (!checkPayrol) {
            throw new NotFoundException(`Payslip for ${month}/${year} is not available yet. Please contact the admin.`);
        }
        const payroll = await this.payrollRepo.getPayRollWithAllRelationById(userId, period.id!);


        console.log('💰 Payroll ditemukan:', payroll);

        return payroll;
    }

    async getAllPayslipByMonth(
        year: number,
        month: number,
        page: number = 1,
        limit: number = 10
    ) {
        const period = await this.payrollPeriodRepo.findOneByMonthAndYear(year, month);
        if (!period) {
            throw new NotFoundException(`No payroll period found for ${month}/${year}`);
        }

        const checkPayrol = await this.payrollRepo.existsByPeriodId(period.id!)
        if (!checkPayrol) {
            throw new NotFoundException(`Payslip for ${month}/${year} is not available yet. Please contact the admin.`);
        }

        const allPayrolls = await this.payrollRepo.getAllPayrollsWithAllRelationsByPeriod(period.id!);

        const allSummaries = allPayrolls.map(p => ({
            userId: p.userId,
            username: p.user?.username ?? '-',
            baseSalary: p.baseSalary,
            proratedSalary: p.proratedSalary,
            overtimePay: p.overtimePay,
            totalReimbursement: p.totalReimbursement,
            takeHomePay: p.takeHomePay,
        }));

        // Hitung total keseluruhan
        const totalTakeHomePay = allSummaries.reduce((sum, p) => sum + (p.takeHomePay ?? 0), 0);
        const totalProratedSalary = allSummaries.reduce((sum, p) => sum + (p.proratedSalary ?? 0), 0);
        const totalOvertime = allSummaries.reduce((sum, p) => sum + (p.overtimePay ?? 0), 0);
        const totalReimbursement = allSummaries.reduce((sum, p) => sum + (p.totalReimbursement ?? 0), 0);

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedSummaries = allSummaries.slice(startIndex, endIndex);

        return {
            totalTakeHomePay,
            totalProratedSalary,
            totalOvertime,
            totalReimbursement,
            pagination: {
                page,
                limit,
                total: allSummaries.length,
            },
            summaries: paginatedSummaries,
        };
    }

    private countWeekdays(startDate: Date, endDate: Date): number {
        let count = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);

        while (start <= end) {
            const day = start.getDay();
            if (day !== 0 && day !== 6) count++;
            start.setDate(start.getDate() + 1);
        }
        return count;
    }
}
