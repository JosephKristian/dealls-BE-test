import { IsDateString, IsNotEmpty } from 'class-validator';

export class RunPayrollDto {
  @IsNotEmpty()
  @IsDateString()
  periodStart: Date;

  @IsNotEmpty()
  @IsDateString()
  periodEnd: Date;
}