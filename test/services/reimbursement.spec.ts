import { BadRequestException } from '@nestjs/common';

import { Reimbursement } from 'src/domain/entities/reimbursement.entity';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';
import { ReimbursementRepository } from 'src/infrastructure/employee/reimbursement/reimbursement.repository.prisma';
import { ReimbursementService } from 'src/application/employee/reimbursement/services/reimbursement.service';

describe('ReimbursementService', () => {
  let service: ReimbursementService;
  let repo: jest.Mocked<ReimbursementRepository>;
  let auditLog: jest.Mocked<AuditLogService>;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
    } as any;

    auditLog = {
      log: jest.fn(),
    } as any;

    service = new ReimbursementService(repo, auditLog);
  });

  it('should submit reimbursement successfully', async () => {
    const date = new Date('2025-06-11T10:00:00Z');
    const reimbursement: Reimbursement = {
      id: 'rmb1',
      userId: 'user123',
      amount: 100,
      description: 'Transport',
      date,
      createdBy: 'admin',
      createdAt: new Date(),
      isDeleted: false,
      isLocked: false
    };

    repo.create.mockResolvedValue(reimbursement);

    const result = await service.submitReimbursement(
      reimbursement.userId,
      reimbursement.amount,
      reimbursement.description,
      reimbursement.createdBy,
      'req123',
      date
    );

    expect(repo.create).toHaveBeenCalled();
    expect(auditLog.log).toHaveBeenCalled();
    expect(result).toEqual(reimbursement);
  });

  it('should throw error if amount is zero or less', async () => {
    await expect(
      service.submitReimbursement('user1', 0, 'Invalid amount', 'admin', 'req123', new Date())
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw error if customDate is invalid', async () => {
    const invalidDate: any = new Date('invalid-date');
    await expect(
      service.submitReimbursement('user1', 100, 'Transport', 'admin', 'req123', invalidDate)
    ).rejects.toThrow(BadRequestException);
  });
});
