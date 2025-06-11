import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/jwt/guard/jwt-auth.guard';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';
import { AttendanceResponseDto } from 'src/application/employee/attendance/dto/attendance-response.dto';
import { AttendanceService } from 'src/application/employee/attendance/services/attendance.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';


@Controller('employee')
export class AttendanceController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly attendanceService: AttendanceService,
  ) { }

  @Post('attendance')
  @UseGuards(JwtAuthGuard)
  async submitAttendance(
    @CurrentUser() user,
    @Request() req,
  ): Promise<AttendanceResponseDto> {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
    const userAgent = req.headers['user-agent'] || null;
    const createdBy = `${user.id}|${ipAddress}|${userAgent}`;
    const requestId = req.headers['x-request-id'];

    const attendance = await this.attendanceService.submitAttendance(user.id, createdBy, req.body.date, requestId);
    return new AttendanceResponseDto(attendance);
  }
}
