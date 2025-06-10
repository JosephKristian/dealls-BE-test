import { Attendance, Overtime, Reimbursement, User } from "@prisma/client";

export class Payroll {
  id?: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  baseSalary: number;
  proratedSalary: number;
  overtimePay: number;
  totalOvertime: number;
  reimbursementTotal: number;
  totalReimbursement: number;
  totalPay: number;
  takeHomePay: number;
  isLocked: boolean;
  isDeleted: boolean;

  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;

  attendances?: Attendance[];  
  overtimes?: Overtime[];
  reimbursements?: Reimbursement[];
  user?: User;

  

  constructor(props: Payroll) {
    Object.assign(this, props);
    this.isDeleted = props.isDeleted ?? false;
    this.isLocked = props.isLocked ?? false;
  }
}
