
import { Module } from "@nestjs/common";
import { AuthModule } from "src/presentation/auth/auth.module";
import { PayrollService } from "src/application/admin/payroll/services/payroll.service";
import { PrismaClient } from "@prisma/client";
import { AuditLogService } from "src/shared/audit-log/services/audit-log.service";
import { UserRepository } from "src/infrastructure/user/repositories/user.repository.prisma";
import { AttendanceRepository } from "src/infrastructure/employee/attendance/attendance.repository.prisma";
import { OvertimeRepository } from "src/infrastructure/employee/overtime/overtime.repository.prisma";
import { ReimbursementRepository } from "src/infrastructure/employee/reimbursement/reimbursement.repository.prisma";
import { PayrollRepository } from "src/infrastructure/admin/payroll/payroll.repository.prisma";
import { DatabaseModule } from "src/shared/database/database.module";
import { IPayrollRepositoryToken } from "src/domain/repositories/payroll.repository";
import { IAttendanceRepositoryToken } from "src/domain/repositories/attendance.repository";
import { IOvertimeRepositoryToken } from "src/domain/repositories/overtime.repository";
import { IReimbursementRepositoryToken } from "src/domain/repositories/reimbursement.repository";
import { IUserRepositoryToken } from "src/domain/repositories/user.repository";
import { PayslipController } from "./payslip.controller";
import { IPayrollPeriodRepositoryToken } from "src/domain/repositories/payroll-period.repository";
import { PayrollPeriodRepository } from "src/infrastructure/admin/payroll/payroll-period.repository.prisma";

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
    ],
    controllers: [PayslipController],
    providers: [
        PayrollService,
        PrismaClient,
        AuditLogService,
        {
            provide: IPayrollRepositoryToken,
            useClass: PayrollRepository,
        },
        {
            provide: IPayrollPeriodRepositoryToken,
            useClass: PayrollPeriodRepository,
        },
        {
            provide: IAttendanceRepositoryToken,
            useClass: AttendanceRepository,
        },
        {
            provide: IOvertimeRepositoryToken,
            useClass: OvertimeRepository,
        },
        {
            provide: IReimbursementRepositoryToken,
            useClass: ReimbursementRepository,
        },
        {
            provide: IUserRepositoryToken,
            useClass: UserRepository,
        },

    ],
})
export class PayslipModule { }