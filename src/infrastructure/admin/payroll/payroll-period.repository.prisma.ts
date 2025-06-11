import { Injectable } from '@nestjs/common';
import { PayrollPeriod } from 'src/domain/entities/payroll-period.entity';
import { IPayrollPeriodRepository } from 'src/domain/repositories/payroll-period.repository';
import { PrismaService } from 'src/shared/database/prisma.service';

@Injectable()
export class PayrollPeriodRepository implements IPayrollPeriodRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(payrollPeriod: PayrollPeriod): Promise<PayrollPeriod> {
    const created = await this.prisma.payrollPeriod.create({
      data: this.toPrismaData(payrollPeriod),
    });
    return this.toDomain(created);
  }
  async findOneByMonthAndYear(year: number, month: number): Promise<PayrollPeriod | null> {
    console.log("year", year)
    console.log("month", month)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    console.log('🔍 Mencari payroll period dengan rentang:');
    console.log('Start Date:', startDate.toISOString());
    console.log('End Date:', endDate.toISOString());

    const period = await this.prisma.payrollPeriod.findFirst({
      where: {
        periodStart: {
          gte: startDate,
          lte: endDate,
        },
        isDeleted: false,
      },
      orderBy: {
        periodStart: 'asc',
      },
    });

    console.log('🧾 Payroll Period ditemukan:', period);

    return period ? this.toDomain(period) : null;
  }




  async findOverlap(start: Date, end: Date): Promise<PayrollPeriod | null> {
    const overlap = await this.prisma.payrollPeriod.findFirst({
      where: {
        AND: [
          { periodStart: { lte: end } },
          { periodEnd: { gte: start } },
          { isDeleted: false },
        ],
      },
    });

    return overlap ? this.toDomain(overlap) : null;
  }

  private toPrismaData(entity: PayrollPeriod) {
    return {
      periodStart: entity.periodStart,
      periodEnd: entity.periodEnd,
      isLocked: entity.isLocked ?? false,
      createdBy: entity.createdBy,
      isDeleted: entity.isDeleted ?? false,
      updatedAt: entity.updatedAt ?? undefined,
      updatedBy: entity.updatedBy ?? undefined,
    };
  }

  private toDomain(model: any): PayrollPeriod {
    return new PayrollPeriod({
      id: model.id,
      periodStart: model.periodStart,
      periodEnd: model.periodEnd,
      isLocked: model.isLocked,
      isDeleted: model.isDeleted,
      createdBy: model.createdBy,
      createdAt: model.createdAt,
      updatedBy: model.updatedBy ?? undefined,
      updatedAt: model.updatedAt ?? undefined,
    });
  }
}
