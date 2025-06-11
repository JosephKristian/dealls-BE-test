import { Test, TestingModule } from '@nestjs/testing';

import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';
import { PayrollRepository } from 'src/infrastructure/admin/payroll/payroll.repository.prisma';
import { PayrollPeriodRepository } from 'src/infrastructure/admin/payroll/payroll-period.repository.prisma';
import { AttendanceRepository } from 'src/infrastructure/employee/attendance/attendance.repository.prisma';
import { OvertimeRepository } from 'src/infrastructure/employee/overtime/overtime.repository.prisma';
import { ReimbursementRepository } from 'src/infrastructure/employee/reimbursement/reimbursement.repository.prisma';
import { UserRepository } from 'src/infrastructure/user/repositories/user.repository.prisma';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PayrollService } from 'src/application/admin/payroll/services/payroll.service';

describe('PayrollService', () => {
    let service: PayrollService;
    let payrollRepo: PayrollRepository;
    let payrollPeriodRepo: PayrollPeriodRepository;
    let attendanceRepo: AttendanceRepository;
    let overtimeRepo: OvertimeRepository;
    let reimbursementRepo: ReimbursementRepository;
    let userRepo: UserRepository;
    let auditLogService: AuditLogService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PayrollService,
                { provide: PayrollRepository, useValue: { findByUserAndPeriod: jest.fn(), create: jest.fn(), existsByPeriodId: jest.fn(), getPayRollWithAllRelationById: jest.fn(), getAllPayrollsWithAllRelationsByPeriod: jest.fn() } },
                { provide: PayrollPeriodRepository, useValue: { findOneByMonthAndYear: jest.fn(), findOverlap: jest.fn(), create: jest.fn() } },
                { provide: AttendanceRepository, useValue: { findByUserAndPeriod: jest.fn(), lockAttendanceById: jest.fn() } },
                { provide: OvertimeRepository, useValue: { findByUserAndPeriod: jest.fn(), lockOvertimeById: jest.fn() } },
                { provide: ReimbursementRepository, useValue: { findByUserAndPeriod: jest.fn(), lockReimbursementById: jest.fn() } },
                { provide: UserRepository, useValue: { findAllEmployees: jest.fn() } },
                { provide: AuditLogService, useValue: { log: jest.fn() } },
            ],
        }).compile();

        service = module.get<PayrollService>(PayrollService);
        payrollRepo = module.get(PayrollRepository);
        payrollPeriodRepo = module.get(PayrollPeriodRepository);
        attendanceRepo = module.get(AttendanceRepository);
        overtimeRepo = module.get(OvertimeRepository);
        reimbursementRepo = module.get(ReimbursementRepository);
        userRepo = module.get(UserRepository);
        auditLogService = module.get(AuditLogService);
    });

    describe('findAllEmployees', () => {
        it('should return all employees', async () => {
            const mockUsers = [
                {
                    id: 'user1',
                    username: 'userone',
                    email: 'user1@example.com',
                    password: 'hashedpassword',
                    role: 'EMPLOYEE',
                    salary: 5000000,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'user2',
                    username: 'usertwo',
                    email: 'user2@example.com',
                    password: 'hashedpassword',
                    role: 'EMPLOYEE',
                    salary: 4500000,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            jest.spyOn(userRepo, 'findAllEmployees').mockResolvedValue(mockUsers as any); // or cast to User[] if imported

            const result = await service.findAllEmployees();

            expect(result).toEqual(mockUsers);
        });

    });

    describe('createPayrollPeriod', () => {
        it('should throw ConflictException if period overlaps', async () => {
            jest.spyOn(payrollPeriodRepo, 'findOverlap').mockResolvedValue({
                id: 'period1',
                periodStart: new Date('2024-01-01'),
                periodEnd: new Date('2024-01-31'),
                isLocked: false,
                isDeleted: false,
                createdBy: 'system',
                createdAt: new Date(),
                updatedAt: new Date(),
                updatedBy: 'system',
            } as any);

            await expect(
                service.createPayrollPeriod({ startDate: '2024-01-01', endDate: '2024-01-31' }, 'req1', 'admin')
            ).rejects.toThrow(ConflictException);
        });

        it('should create payroll period if no overlap', async () => {
            jest.spyOn(payrollPeriodRepo, 'findOverlap').mockResolvedValue(null);

            jest.spyOn(payrollPeriodRepo, 'create').mockResolvedValue({
                id: 'pp1',
                periodStart: new Date('2024-01-01'),
                periodEnd: new Date('2024-01-31'),
                isLocked: false,
                isDeleted: false,
                createdBy: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
                updatedBy: 'admin',
            } as any);

            const result = await service.createPayrollPeriod(
                { startDate: '2024-01-01', endDate: '2024-01-31' },
                'req1',
                'admin',
            );

            expect(result.id).toEqual('pp1');
        });

    });

    describe('runPayroll', () => {
        it('should throw NotFoundException if period not found', async () => {
            jest.spyOn(payrollPeriodRepo, 'findOneByMonthAndYear').mockResolvedValue(null);
            await expect(service.runPayroll(2024, 1, 'admin')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if no employees found', async () => {
            jest.spyOn(payrollPeriodRepo, 'findOneByMonthAndYear').mockResolvedValue({
                id: 'pp1',
                periodStart: new Date(),
                periodEnd: new Date(),
                isLocked: false,
                createdBy: 'admin',
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                updatedBy: 'admin',
            } as any); // atau cast ke PayrollPeriod jika tipe tersedia

            jest.spyOn(userRepo, 'findAllEmployees').mockResolvedValue([]);

            await expect(service.runPayroll(2024, 1, 'admin')).rejects.toThrow(NotFoundException);
        });

    });

    describe('getPayslipByMonth', () => {
        it('should throw NotFoundException if period not found', async () => {
            jest.spyOn(payrollPeriodRepo, 'findOneByMonthAndYear').mockResolvedValue(null);
            await expect(service.getPayslipByMonth('user1', 2024, 1)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if no payroll exists for period', async () => {
            jest.spyOn(payrollPeriodRepo, 'findOneByMonthAndYear').mockResolvedValue({
                id: 'pp1',
                periodStart: new Date('2024-01-01'),
                periodEnd: new Date('2024-01-31'),
                isLocked: false,
                createdBy: 'admin',
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                updatedBy: 'admin',
            } as any); // atau cast ke PayrollPeriod jika kamu punya tipe class-nya

            jest.spyOn(payrollRepo, 'existsByPeriodId').mockResolvedValue(false);

            await expect(service.getPayslipByMonth('user1', 2024, 1)).rejects.toThrow(NotFoundException);
        });

    });
});
