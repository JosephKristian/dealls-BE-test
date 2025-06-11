import { Test, TestingModule } from '@nestjs/testing';

import { IOvertimeRepository, IOvertimeRepositoryToken } from 'src/domain/repositories/overtime.repository';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';
import { BadRequestException } from '@nestjs/common';
import { Overtime } from 'src/domain/entities/overtime.entity';
import { OvertimeService } from 'src/application/employee/overtime/services/overtime.service';

describe('OvertimeService', () => {
    let service: OvertimeService;
    let repo: jest.Mocked<IOvertimeRepository>;
    let auditLog: jest.Mocked<AuditLogService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OvertimeService,
                {
                    provide: IOvertimeRepositoryToken,
                    useValue: {
                        findByUserIdAndDate: jest.fn(),
                        updateTimestamp: jest.fn(),
                        create: jest.fn(),
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

        service = module.get<OvertimeService>(OvertimeService);
        repo = module.get(IOvertimeRepositoryToken);
        auditLog = module.get(AuditLogService);
    });

    it('should create new overtime record if none exists', async () => {
        const overtime = new Overtime({
            userId: 'user1',
            date: new Date('2024-06-10'),
            hours: 2,
            createdBy: 'admin|127.0.0.1',
            createdAt: new Date(),
            isDeleted: false,
        });

        repo.findByUserIdAndDate.mockResolvedValue(null);
        repo.create.mockResolvedValue({ ...overtime, id: 'ot1' });

        const result = await service.submitOvertime(
            'user1',
            2,
            'admin|127.0.0.1',
            '2024-06-10',
            'req-123',
        );

        expect(result).toHaveProperty('id', 'ot1');
        expect(repo.create).toHaveBeenCalled();
        expect(auditLog.log).toHaveBeenCalled();
    });

    it('should update existing overtime record if already submitted', async () => {
        const existing = {
            id: 'ot1',
            userId: 'user1',
            date: new Date('2024-06-10'),
            hours: 2,
            createdBy: 'admin',
        };
        const updated = { ...existing, hours: 3 };

        repo.findByUserIdAndDate.mockResolvedValue(existing as any);
        repo.updateTimestamp.mockResolvedValue(updated as any);

        const result = await service.submitOvertime(
            'user1',
            3,
            'admin|127.0.0.1',
            '2024-06-10',
            'req-456',
        );

        expect(result.hours).toBe(3);
        expect(repo.updateTimestamp).toHaveBeenCalledWith('ot1', 'admin|127.0.0.1', 3);
        expect(auditLog.log).toHaveBeenCalled();
    });

    it('should throw if overtime exceeds 3 hours', async () => {
        await expect(
            service.submitOvertime('user1', 4, 'admin', '2024-06-10'),
        ).rejects.toThrow(BadRequestException);
    });

    it('should throw if date format is invalid', async () => {
        await expect(
            service.submitOvertime('user1', 2, 'admin', 'not-a-date'),
        ).rejects.toThrow(BadRequestException);
    });

    it('should parse and accept Date object instead of string', async () => {
        const date = new Date('2024-06-10');
        repo.findByUserIdAndDate.mockResolvedValue(null);
        repo.create.mockResolvedValue({
            id: 'ot1',
            userId: 'user1',
            date,
            hours: 2,
            createdBy: 'admin',
            createdAt: new Date(),
            isDeleted: false,
            isLocked: false, 
        });


        const result = await service.submitOvertime('user1', 2, 'admin', date);
        expect(result.id).toBe('ot1');
    });
});
