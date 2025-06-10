import { Injectable, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { isValid, parseISO } from 'date-fns';
import { Overtime } from 'src/domain/entities/overtime.entity';
import { IOvertimeRepository, IOvertimeRepositoryToken } from 'src/domain/repositories/overtime.repository';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';

@Injectable()
export class OvertimeService {
  constructor(
    @Inject(IOvertimeRepositoryToken)
    private readonly overtimeRepository: IOvertimeRepository,

    private readonly auditLogService: AuditLogService,
  ) {}

  async submitOvertime(
    userId: string,
    hours: number,
    createdBy: string,
    customDate: Date | string,
    requestId?: string,
  ): Promise<Overtime> {
    if (hours > 3) {
      throw new BadRequestException('Overtime cannot exceed 3 hours per day.');
    }

    let date: Date;
    try {
      date = typeof customDate === 'string' ? parseISO(customDate) : customDate;
      if (!isValid(date)) throw new Error();
    } catch {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
    }

    const dateOnly = new Date(date.toDateString());

    const existing = await this.overtimeRepository.findByUserIdAndDate(userId, dateOnly);
    if (existing) {
      const updated = await this.overtimeRepository.updateTimestamp(existing.id!, createdBy, hours);

      await this.auditLogService.log({
        entity: 'Overtime',
        entityId: updated.id!,
        action: 'UPDATE',
        performedBy: createdBy,
        ipAddress: createdBy.split('|')[1] ?? null,
        requestId,
        oldData: existing,
        newData: {
          userId: updated.userId,
          date: updated.date,
          hours: updated.hours,
          createdBy: updated.createdBy,
        },
      });

      return updated;
    }

    const overtime = new Overtime({
      userId,
      date: dateOnly,
      hours,
      createdBy,
      createdAt: new Date(),
      isDeleted: false,
    });

    const saved = await this.overtimeRepository.create(overtime);

    await this.auditLogService.log({
      entity: 'Overtime',
      entityId: saved.id!,
      action: 'CREATE',
      performedBy: createdBy,
      ipAddress: createdBy.split('|')[1] ?? null,
      requestId,
      oldData: null,
      newData: {
        userId: saved.userId,
        date: saved.date,
        hours: saved.hours,
        createdBy: saved.createdBy,
      },
    });

    return saved;
  }
}
