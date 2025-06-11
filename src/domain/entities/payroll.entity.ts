import { Attendance, Overtime, Reimbursement, User } from "@prisma/client";

export class Payroll {
  id?: string;
  userId: string;
  payrollPeriodId: string;

  baseSalary: number;
  proratedSalary: number;
  totalPay: number;
  overtimePay: number;
  totalOvertime: number;
  totalReimbursement: number;
  takeHomePay: number;

  isLocked: boolean;
  isDeleted: boolean;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;

  user?: User;
  attendances?: Attendance[];
  overtimes?: Overtime[];
  reimbursements?: Reimbursement[];

  constructor(props: Payroll) {
    Object.assign(this, props);
    this.isDeleted = props.isDeleted ?? false;
    this.isLocked = props.isLocked ?? false;
  }
}
