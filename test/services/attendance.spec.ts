import { Test, TestingModule } from '@nestjs/testing'
import { AttendanceRepository } from 'src/infrastructure/employee/attendance/attendance.repository.prisma';
import { UserRepository } from 'src/infrastructure/user/repositories/user.repository.prisma';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Attendance } from 'src/domain/entities/attendance.entity';
import { AttendanceService } from 'src/application/employee/attendance/services/attendance.services';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let attendanceRepository: jest.Mocked<AttendanceRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let auditLogService: jest.Mocked<AuditLogService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: AttendanceRepository,
          useValue: {
            findByUserIdAndDate: jest.fn(),
            updateTimestamp: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: AuditLogService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    attendanceRepository = module.get(AttendanceRepository);
    userRepository = module.get(UserRepository);
    auditLogService = module.get(AuditLogService);
  });

  it('should create a new attendance if none exists for today', async () => {
    const user = { id: '1', isDeleted: false, role: 'EMPLOYEE' };
    const attendance = new Attendance({
      userId: '1',
      date: new Date('2024-06-10'),
      createdBy: 'admin|127.0.0.1',
      createdAt: new Date(),
      isDeleted: false,
    });

    userRepository.findById.mockResolvedValue(user as any);
    attendanceRepository.findByUserIdAndDate.mockResolvedValue(null);
    attendanceRepository.create.mockResolvedValue({ ...attendance, id: '123' });

    const result = await service.submitAttendance(
      '1',
      'admin|127.0.0.1',
      new Date('2024-06-10'),
      'req-1',
    );

    expect(result).toHaveProperty('id', '123');
    expect(attendanceRepository.create).toHaveBeenCalled();
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('should update timestamp if attendance already exists', async () => {
    const user = { id: '1', isDeleted: false, role: 'EMPLOYEE' };
    const existing = { id: '123', userId: '1', date: new Date('2024-06-10'), createdBy: 'admin' };
    const updated = { ...existing, updatedAt: new Date() };

    userRepository.findById.mockResolvedValue(user as any);
    attendanceRepository.findByUserIdAndDate.mockResolvedValue(existing as any);
    attendanceRepository.updateTimestamp.mockResolvedValue(updated as any);

    const result = await service.submitAttendance('1', 'admin|127.0.0.1', new Date('2024-06-10'), 'req-1');

    expect(result).toEqual(updated);
    expect(attendanceRepository.updateTimestamp).toHaveBeenCalledWith('123', 'admin|127.0.0.1');
    expect(auditLogService.log).toHaveBeenCalled();
  });

  it('should throw NotFoundException if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(service.submitAttendance('404', 'admin')).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is deleted or not EMPLOYEE', async () => {
    userRepository.findById.mockResolvedValue({ id: '1', isDeleted: true, role: 'EMPLOYEE' } as any);
    await expect(service.submitAttendance('1', 'admin')).rejects.toThrow(ForbiddenException);

    userRepository.findById.mockResolvedValue({ id: '1', isDeleted: false, role: 'ADMIN' } as any);
    await expect(service.submitAttendance('1', 'admin')).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException if custom date is invalid', async () => {
    userRepository.findById.mockResolvedValue({ id: '1', isDeleted: false, role: 'EMPLOYEE' } as any);

    await expect(service.submitAttendance('1', 'admin', new Date('invalid'))).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if trying to submit on weekend', async () => {
    userRepository.findById.mockResolvedValue({ id: '1', isDeleted: false, role: 'EMPLOYEE' } as any);

    // Sunday: 2024-06-09
    await expect(service.submitAttendance('1', 'admin', new Date('2024-06-09'))).rejects.toThrow(BadRequestException);
  });
});
