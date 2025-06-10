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
} from '@nestjs/common';
import { RunPayrollDto } from 'src/application/admin/payroll/dto/payroll-submit.dto';
import { PayrollService } from 'src/application/admin/payroll/services/payroll.services';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/shared/jwt/guard/jwt-auth.guard';
import { RolesGuard } from 'src/shared/jwt/guard/roles.guard';
import { Request } from 'express';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) { }

    @Post('run-payroll')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.OK)
    async runPayroll(
        @Body() dto: RunPayrollDto,
        @Req() req: Request,
    ): Promise<{ success: boolean; details?: any }> {
        try {
            // Validate input dates
            if (!dto.periodStart || !dto.periodEnd) {
                throw new BadRequestException('Start and end dates are required');
            }

            const startDate = new Date(dto.periodStart);
            const endDate = new Date(dto.periodEnd);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new BadRequestException('Invalid date format');
            }

            if (startDate > endDate) {
                throw new BadRequestException('Start date must be before end date');
            }

            const user = req.user as { id: string; role: string };
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
            const userAgent = req.headers['user-agent'] || null;
            const requestId = Array.isArray(req.headers['x-request-id'])
                ? req.headers['x-request-id'][0]
                : req.headers['x-request-id'];
            const performedBy = `${user.id}|${ipAddress}|${userAgent}`;

            const result = await this.payrollService.runPayroll(
                startDate,
                endDate,
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
}
