import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
    Req,
    HttpException,
    BadRequestException,
    Get,
    Param,
    NotFoundException,
    Query,
} from '@nestjs/common';
import { RunPayrollDto } from 'src/application/admin/payroll/dto/payroll-submit.dto';
import { PayrollService } from 'src/application/admin/payroll/services/payroll.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/shared/jwt/guard/jwt-auth.guard';
import { RolesGuard } from 'src/shared/jwt/guard/roles.guard';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { PayslipResponseDto } from 'src/application/employee/payslip/dto/payslip-response.dto';
import { CreatePayrollPeriodDto } from 'src/application/admin/payroll/dto/payroll-period-submit.dto';
import { EmployeeSimpleDto } from 'src/application/user/dto/user-employee-list.dto';
import { E } from '@faker-js/faker/dist/airline-BUL6NtOJ';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
    constructor(
        private readonly payrollService: PayrollService
    ) { }

    @Get('employees')
    @Roles('ADMIN') // opsional jika perlu auth/role check
    async getAllEmployees() {
        const employees = await this.payrollService.findAllEmployees();
        return plainToInstance(EmployeeSimpleDto, employees, {
            excludeExtraneousValues: true,
        });
    }

    @Post('payroll-period')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.OK)
    async createPayrollPeriod(
        @Body() dto: CreatePayrollPeriodDto,
        @Req() req: Request,
    ): Promise<any> {
        const user = req.user as { id: string; role: string };
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
        const userAgent = req.headers['user-agent'] || null;
        const rawRequestId = req.headers['x-request-id'];
        const requestId = Array.isArray(rawRequestId) ? rawRequestId[0] : rawRequestId || '';
        const performedBy = `${user.id}|${ipAddress}|${userAgent}`;

        return this.payrollService.createPayrollPeriod(dto, requestId, performedBy);
    }


    @Post('run-payroll')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.OK)
    async runPayroll(
        @Body() dto: RunPayrollDto,
        @Req() req: Request,
    ): Promise<{ success: boolean; details?: any }> {
        try {
            // Validate input dates
            if (!dto.month) {
                throw new BadRequestException('Start and end dates are required');
            }

            const user = req.user as { id: string; role: string };
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
            const userAgent = req.headers['user-agent'] || null;
            const requestId = Array.isArray(req.headers['x-request-id'])
                ? req.headers['x-request-id'][0]
                : req.headers['x-request-id'];
            const performedBy = `${user.id}|${ipAddress}|${userAgent}`;


            const result = await this.payrollService.runPayroll(
                dto.year,
                dto.month,
                performedBy,
                requestId
            );

            return {
                success: true,
                details: {
                    processedUsers: result.processedUsers,
                    skippedUsers: result.skippedUsers,
                    failedUsers: result.failedUsers
                }
            };
        } catch (error) {
            console.error('Error in runPayroll controller:', error);
            throw new HttpException(
                {
                    message: error.response?.message || 'Failed to process payroll',
                    success: false,
                    details: error.response?.details || error.message
                },
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('payslip-summary/:year/:month')
    @UseGuards(JwtAuthGuard)
    async getPayslip(
        @Param('year') year: number,
        @Param('month') month: number,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        const parsedYear = Number(year);
        const parsedMonth = Number(month);
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            throw new BadRequestException('Invalid year or month');
        }
        console.log("=== DEBUG ===")
        const payroll = await this.payrollService.getAllPayslipByMonth(
            year,
            month,
            parsedPage,
            parsedLimit
        );

        if (!payroll) {
            throw new NotFoundException('Payslip not found for the given month');
        }

        return payroll;
    }

}
