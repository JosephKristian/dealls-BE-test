import { Injectable, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Reimbursement } from 'src/domain/entities/reimbursement.entity';
import { IReimbursementRepositoryToken } from 'src/domain/repositories/reimbursement.repository';
import { ReimbursementRepository } from 'src/infrastructure/employee/reimbursement/reimbursement.repository.prisma';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';




@Injectable()
export class ReimbursementService {
  constructor(
    @Inject(IReimbursementRepositoryToken)
    private readonly reimbursementRepository: ReimbursementRepository,
    private readonly auditLogService: AuditLogService,
  ) { }

  async submitReimbursement(
    userId: string,
    amount: number,
    description: string,
    createdBy: string,
    requestId: string,
    customDate: Date,
  ): Promise<Reimbursement> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero.');
    }

    let date: Date;
    const now = new Date(); 

    if (customDate) {
      const parsed = new Date(customDate);
      if (isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid custom date format');
      }

      
      date = new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );
    } else {
      date = now; 
    }


    const reimbursement = new Reimbursement({
      userId,
      amount,
      description,
      date,
      createdBy,
      createdAt: new Date(),
      isDeleted: false,
    });

    const saved = await this.reimbursementRepository.create(reimbursement);

    await this.auditLogService.log({
      entity: 'Reimbursement',
      entityId: saved.id!,
      action: 'CREATE',
      performedBy: createdBy,
      ipAddress: createdBy.split('|')[1] ?? null,
      requestId,
      oldData: null,
      newData: {
        userId: saved.userId,
        date: saved.date,
        createdBy: saved.createdBy,
      },
    });

    return saved;
  }

}
