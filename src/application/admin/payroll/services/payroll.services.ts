import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
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

@Injectable()
export class PayrollService {
    constructor(
        @Inject(IPayrollRepositoryToken)
        private readonly payrollRepo: PayrollRepository,
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

    async runPayroll(
        periodStart: Date,
        periodEnd: Date,
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
            const users = await this.userRepo.findAllEmployees();
            if (!users || users.length === 0) {
                throw new NotFoundException('No employees found');
            }

            const totalWorkingDays = this.countWeekdays(periodStart, periodEnd);
            if (totalWorkingDays <= 0) {
                throw new BadRequestException('No working days in the specified period');
            }

            for (const user of users) {
                try {
                    if (!user.salary || user.salary <= 0) {
                        throw new Error(`Invalid salary for user ${user.id}`);
                    }

                    const [attendances, overtimes, reimbursements] = await Promise.all([
                        this.attendanceRepo.findByUserAndPeriod(user.id, periodStart, periodEnd),
                        this.overtimeRepo.findByUserAndPeriod(user.id, periodStart, periodEnd),
                        this.reimbursementRepo.findByUserAndPeriod(user.id, periodStart, periodEnd),
                    ]);

                    const existing = await this.payrollRepo.findByUserAndPeriod(user.id, periodStart, periodEnd);
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
                        periodStart,
                        periodEnd,
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

                    console.log("reimburse", reimbursements)
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

    async getPayslipByMonth(userId: string, year: Date, month: Date) {
        const periodStart = new Date(year.getFullYear(), month.getMonth(), 1);
        const periodEnd = new Date(year.getFullYear(), month.getMonth() + 1, 0);
        const payroll = await this.payrollRepo.getPayRollWithAllRelationById(userId, periodStart, periodEnd);

        return payroll
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
