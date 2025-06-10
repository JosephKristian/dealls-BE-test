import { Payroll } from 'src/domain/entities/payroll.entity';

export interface IPayrollRepository {
  create(payroll: Payroll): Promise<Payroll>;
  getPayRollWithAllRelationById(payrollId: string, periodStart: Date, periodEnd: Date): Promise<Payroll | null>;
  findByUserAndPeriod(userId: string, start: Date, end: Date): Promise<Payroll | null>;
}

export const IPayrollRepositoryToken = Symbol('IPayrollRepository');
