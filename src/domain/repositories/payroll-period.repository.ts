
import { PayrollPeriod } from 'src/domain/entities/payroll-period.entity';

export interface IPayrollPeriodRepository {
  create(payroll: PayrollPeriod): Promise<PayrollPeriod>
}

export const IPayrollPeriodRepositoryToken = Symbol('IPayrollPeriodRepository')
