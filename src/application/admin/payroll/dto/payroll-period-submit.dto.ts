import { IsDateString, IsNotEmpty } from "class-validator";

export class CreatePayrollPeriodDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
