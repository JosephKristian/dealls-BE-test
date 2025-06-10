import { Injectable } from '@nestjs/common';
import { Attendance } from 'src/domain/entities/attendance.entity';
import { Overtime } from 'src/domain/entities/overtime.entity';
import { Payroll } from 'src/domain/entities/payroll.entity';
import { Reimbursement } from 'src/domain/entities/reimbursement.entity';
import { User } from 'src/domain/entities/user.entity';
import { IPayrollRepository } from 'src/domain/repositories/payroll.repository';
import { PrismaService } from 'src/shared/database/prisma.service';

@Injectable()
export class PayrollRepository implements IPayrollRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(payroll: Payroll): Promise<Payroll> {
        const created = await this.prisma.payroll.create({
            data: this.toPrismaData(payroll),
        });
        return this.toDomain(created);
    }

    async findByUserAndPeriod(userId: string, start: Date, end: Date): Promise<Payroll | null> {
        const found = await this.prisma.payroll.findFirst({
            where: {
                userId,
                periodStart: new Date(start),
                periodEnd: new Date(end),
                isDeleted: false,
            },
        });

        return found ? this.toDomain(found) : null;
    }

    async getPayRollWithAllRelationById(
        userId: string,
        periodStart: Date,
        periodEnd: Date,
    ): Promise<Payroll | null> {

        const payroll = await this.prisma.payroll.findFirst({
            where: {
                userId: userId,
                periodStart: {
                    gte: periodStart,
                    lte: periodEnd,
                },
            },
            include: {
                attendances: true,
                overtimes: true,
                reimbursements: true,
                user: true,
            },
        });

        return this.toDomainWithRelations(payroll);
    }

    private toDomain(raw: any): Payroll {
        return new Payroll({
            id: raw.id,
            userId: raw.userId,
            periodStart: raw.periodStart,
            periodEnd: raw.periodEnd,
            baseSalary: raw.baseSalary,
            proratedSalary: raw.proratedSalary,
            overtimePay: raw.overtimePay,
            totalOvertime: raw.totalOvertime,
            reimbursementTotal: raw.reimbursementTotal,
            totalReimbursement: raw.totalReimbursement,
            totalPay: raw.totalPay,
            takeHomePay: raw.takeHomePay,
            isLocked: raw.isLocked,
            isDeleted: raw.isDeleted,
            createdBy: raw.createdBy,
            createdAt: raw.createdAt,
            updatedBy: raw.updatedBy,
            updatedAt: raw.updatedAt,
            deletedBy: raw.deletedBy,
            deletedAt: raw.deletedAt,
        });
    }

    private toDomainWithRelations(raw: any): Payroll {
        const payroll = new Payroll({
            id: raw.id,
            userId: raw.userId,
            periodStart: raw.periodStart,
            periodEnd: raw.periodEnd,
            baseSalary: raw.baseSalary,
            proratedSalary: raw.proratedSalary,
            overtimePay: raw.overtimePay,
            totalOvertime: raw.totalOvertime,
            reimbursementTotal: raw.reimbursementTotal,
            totalReimbursement: raw.totalReimbursement,
            totalPay: raw.totalPay,
            takeHomePay: raw.takeHomePay,
            isLocked: raw.isLocked,
            isDeleted: raw.isDeleted,
            createdBy: raw.createdBy,
            createdAt: raw.createdAt,
            updatedBy: raw.updatedBy,
            updatedAt: raw.updatedAt,
            deletedBy: raw.deletedBy,
            deletedAt: raw.deletedAt,
        });

        if (raw.attendances) {
            payroll.attendances = raw.attendances.map(att => new Attendance({
                id: att.id,
                userId: att.userId,
                date: new Date(att.date),
                isDeleted: att.isDeleted ?? false,
                isLocked: att.isLocked ?? false,
                createdBy: att.createdBy,
                createdAt: new Date(att.createdAt),
                updatedBy: att.updatedBy,
                updatedAt: att.updatedAt ? new Date(att.updatedAt) : undefined,
                deletedBy: att.deletedBy,
                deletedAt: att.deletedAt ? new Date(att.deletedAt) : undefined,
            }));
        }

        if (raw.overtimes) {
            payroll.overtimes = raw.overtimes.map(ot => new Overtime({
                id: ot.id,
                userId: ot.userId,
                date: new Date(ot.date),
                hours: ot.hours,
                isDeleted: ot.isDeleted ?? false,
                isLocked: ot.isLocked ?? false,
                createdBy: ot.createdBy,
                createdAt: new Date(ot.createdAt),
                updatedBy: ot.updatedBy,
                updatedAt: ot.updatedAt ? new Date(ot.updatedAt) : undefined,
                deletedBy: ot.deletedBy,
                deletedAt: ot.deletedAt ? new Date(ot.deletedAt) : undefined,
            }));
        }


        if (raw.reimbursements) {
            payroll.reimbursements = raw.reimbursements.map(re => new Reimbursement({
                userId: re.userId,
                amount: re.amount,
                description: re.description,
                date: new Date(re.date),
                createdBy: re.createdBy,
                createdAt: new Date(re.createdAt),
                updatedBy: re.updatedBy,
                updatedAt: re.updatedAt ? new Date(re.updatedAt) : undefined,
                deletedBy: re.deletedBy,
                deletedAt: re.deletedAt ? new Date(re.deletedAt) : undefined,
                isDeleted: re.isDeleted ?? false,
                isLocked: re.isLocked ?? false,
            }));
        }

        if (raw.user) {
            payroll.user = {
                id: raw.user.id,
                username: raw.user.username,
                email: raw.user.email ?? '',
                password: raw.user.password ?? '',
                role: raw.user.role ?? 'user',
                createdBy: raw.user.createdBy ?? null,
                createdAt: raw.user.createdAt ?? null,
                updatedBy: raw.user.updatedBy ?? null,
                updatedAt: raw.user.updatedAt ?? null,
                deletedBy: raw.user.deletedBy ?? null,
                deletedAt: raw.user.deletedAt ?? null,
                isDeleted: raw.user.isDeleted ?? false,
                salary: raw.user.salary ?? null,
            };
        }

        return payroll;
    }

    private toPrismaData(payroll: Payroll) {
        return {
            user: {
                connect: { id: payroll.userId },
            },
            periodStart: payroll.periodStart,
            periodEnd: payroll.periodEnd,
            baseSalary: payroll.baseSalary ?? 0,
            proratedSalary: isNaN(payroll.proratedSalary) ? 0 : payroll.proratedSalary,
            totalOvertime: payroll.totalOvertime ?? 0,
            totalReimbursement: payroll.totalReimbursement ?? 0,
            overtimePay: isNaN(payroll.overtimePay) ? 0 : payroll.overtimePay,
            totalPay: isNaN(payroll.totalPay) ? 0 : payroll.totalPay,
            takeHomePay: isNaN(payroll.takeHomePay) ? 0 : payroll.takeHomePay,
            isLocked: payroll.isLocked ?? false,
            isDeleted: payroll.isDeleted ?? false,
            createdAt: payroll.createdAt,
            createdBy: payroll.createdBy,

        };
    }


}
