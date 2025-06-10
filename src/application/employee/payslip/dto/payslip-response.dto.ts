import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class UserDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  salary: number;
}

@Exclude()
export class AttendanceDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  date: Date;

  @Expose()
  isLocked: boolean;
}

@Exclude()
export class OvertimeDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  date: Date;

  @Expose()
  hours: number;

  @Expose()
  isLocked: boolean;
}

@Exclude()
export class ReimbursementDto {
  @Expose()
  userId: string;

  @Expose()
  amount: number;

  @Expose()
  description: string;

  @Expose()
  date: Date;

  @Expose()
  isLocked: boolean;
}

@Exclude()
export class PayslipResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  periodStart: Date;

  @Expose()
  periodEnd: Date;

  @Expose()
  baseSalary: number;

  @Expose()
  proratedSalary: number;

  @Expose()
  overtimePay: number;

  @Expose()
  totalOvertime: number;

  @Expose()
  totalReimbursement: number;

  @Expose()
  totalPay: number;

  @Expose()
  takeHomePay: number;

  @Expose()
  isLocked: boolean;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  @Type(() => AttendanceDto)
  attendances: AttendanceDto[];

  @Expose()
  @Type(() => OvertimeDto)
  overtimes: OvertimeDto[];

  @Expose()
  @Type(() => ReimbursementDto)
  reimbursements: ReimbursementDto[];
}
