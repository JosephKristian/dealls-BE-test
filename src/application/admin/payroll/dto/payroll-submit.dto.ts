import { IsNotEmpty, IsNumber } from 'class-validator';

export class RunPayrollDto {
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsNumber()
  month: number;
}