import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SubmitOvertimeDto } from 'src/application/employee/overtime/dto/overtime-submit.dto';
import { OvertimeService } from 'src/application/employee/overtime/services/overtime.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/jwt/guard/jwt-auth.guard';


@Controller('employee')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) { }

  @Post('overtime')
  @UseGuards(JwtAuthGuard)
  async submitOvertime(
    @CurrentUser() user,
    @Req() req,
    @Body() dto: SubmitOvertimeDto
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
    const userAgent = req.headers['user-agent'] || null;
    const createdBy = `${user.id}|${ipAddress}|${userAgent}`;
    const customDate = req.body.date
    const requestId = req.headers['x-request-id'];
    const overtime = await this.overtimeService.submitOvertime(user.id, dto.hours, createdBy, customDate, requestId);
    return {
      statusCode: 201,
      message: 'Overtime submitted successfully',
      data: overtime,
    };
  }
}
