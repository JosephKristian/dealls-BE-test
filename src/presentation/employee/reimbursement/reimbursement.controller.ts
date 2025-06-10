import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/jwt/guard/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { ReimbursementService } from 'src/application/employee/reimbursement/services/reimbursement.service';
import { SubmitReimbursementDto } from 'src/application/employee/reimbursement/dto/reimbusement-submit.dto';
import { ReimbursementResponseDto } from 'src/application/employee/reimbursement/dto/reimbusement-response.dto';

@Controller('employee')
export class ReimbursementController {
  constructor(
    private readonly reimbursementService: ReimbursementService,
  ) { }

  @Post('reimbursement')
  @UseGuards(JwtAuthGuard)
  async submitReimbursement(
    @CurrentUser() user,
    @Request() req,
    @Body() dto: SubmitReimbursementDto,
  ): Promise<ReimbursementResponseDto> {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
    const userAgent = req.headers['user-agent'] || null;
    const createdBy = `${user.id}|${ipAddress}|${userAgent}`;
    const requestId = req.headers['x-request-id'];
    const customDate = req.body.date
    const reimbursement = await this.reimbursementService.submitReimbursement(
      user.id,
      dto.amount,
      dto.description,
      createdBy,
      requestId,
      customDate
    );
    return new ReimbursementResponseDto(reimbursement);
  }
}
