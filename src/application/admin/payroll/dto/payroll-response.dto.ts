export class PayrollResponseDto {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  baseSalary: number;
  proratedSalary: number;
  totalOvertime: number;
  overtimePay: number;
  totalReimbursement: number;
  reimbursementTotal: number;
  totalPay: number;
  takeHomePay: number;
  isLocked: boolean;
  isDeleted: boolean;

  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;

  constructor(partial: Partial<PayrollResponseDto>) {
    Object.assign(this, partial);
  }
}