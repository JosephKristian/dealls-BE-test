import { BadRequestException, Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PayrollService } from 'src/application/admin/payroll/services/payroll.service';
import { PayslipResponseDto } from 'src/application/employee/payslip/dto/payslip-response.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/jwt/guard/jwt-auth.guard';

@Controller('employee')
export class PayslipController {
    constructor(private readonly payrollService: PayrollService) { }

    @Get('payslip/:year/:month')
    @UseGuards(JwtAuthGuard)
    async getPayslip(
        @CurrentUser() user,
        @Param('year') year: number,
        @Param('month') month: number,
    ) {
        console.log('User:', user);

        const parsedYear = Number(year);
        const parsedMonth = Number(month);

        if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            throw new BadRequestException('Invalid year or month');
        }

        const payroll = await this.payrollService.getPayslipByMonth(
            user.id,
            year,
            month,
        );

        if (!payroll) {
            throw new NotFoundException('Payslip not found for the given month');
        }

        return plainToInstance(PayslipResponseDto, payroll, {
            excludeExtraneousValues: true,
        });
    }
}
