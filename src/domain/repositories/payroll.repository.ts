import { Payroll } from 'src/domain/entities/payroll.entity';

export interface IPayrollRepository {
  create(payroll: Payroll): Promise<Payroll>;
}

export const IPayrollRepositoryToken = Symbol('IPayrollRepository');
