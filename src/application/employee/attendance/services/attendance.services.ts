import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { isValid } from 'date-fns';
import { Attendance } from 'src/domain/entities/attendance.entity';
import { AttendanceRepository } from 'src/infrastructure/employee/attendance/attendance.repository.prisma';
import { UserRepository } from 'src/infrastructure/user/repositories/user.repository.prisma';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly userRepository: UserRepository,
    private readonly auditLogService: AuditLogService,
  ) { }

  async submitAttendance(userId: string, createdBy: string, customDate?: Date, requestId?: string): Promise<Attendance> {
    console.log('[submitAttendance] userId:', userId);
    console.log('[submitAttendance] createdBy:', createdBy);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
    }

    if (user.isDeleted || user.role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only active employees can submit attendance');
    }

    let today: Date;
    if (customDate) {
      const parsed = new Date(customDate);
      if (!isValid(parsed)) {
        throw new BadRequestException('Invalid custom date format');
      }
      today = parsed;
    } else {
      today = new Date();
    }

    const day = today.getDay();
    console.log('[submitAttendance] Today is:', today.toDateString(), 'Day:', day);

    if (day === 0 || day === 6) {
      console.warn('[submitAttendance] Attempt to submit on weekend');
      throw new BadRequestException('Cannot submit attendance on weekends');
    }

    const existing = await this.attendanceRepository.findByUserIdAndDate(userId, today);
    console.log('[submitAttendance] Existing attendance record:', existing);

    if (existing) {
      console.info('[submitAttendance] Attendance already submitted today, updating timestamp...');
      const updated = await this.attendanceRepository.updateTimestamp(existing.id!, createdBy);
      await this.auditLogService.log({
        entity: 'Attendance',
        entityId: updated.id!,
        action: 'UPDATE',
        performedBy: createdBy,
        ipAddress: createdBy.split('|')[1] ?? null,
        requestId: requestId,
        oldData: existing,
        newData: {
          userId: updated.userId,
          date: updated.date,
          createdBy: updated.createdBy,
        },
      });
      return updated
    }

    const attendance = new Attendance({
      userId,
      date: new Date(today.toDateString()), // jam 00:00:00
      createdBy,
      createdAt: new Date(),
      isDeleted: false,
    });

    console.log('[submitAttendance] New attendance to be saved:', attendance);

    const saved = await this.attendanceRepository.create(attendance);
    console.log('[submitAttendance] Attendance saved successfully:', saved);

    await this.auditLogService.log({
      entity: 'Attendance',
      entityId: saved.id!,
      action: 'CREATE',
      performedBy: createdBy,
      ipAddress: createdBy.split('|')[1] ?? null,
      requestId: requestId,
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
