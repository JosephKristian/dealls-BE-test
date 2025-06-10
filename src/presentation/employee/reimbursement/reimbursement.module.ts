// src/modules/attendance/attendance.module.ts
import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { UserRepository } from 'src/infrastructure/user/repositories/user.repository.prisma';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';

import { DatabaseModule } from 'src/shared/database/database.module';

import { ReimbursementController } from './reimbursement.controller';
import { ReimbursementService } from 'src/application/employee/reimbursement/services/reimbursement.service';
import { ReimbursementRepository } from 'src/infrastructure/employee/reimbursement/reimbursement.repository.prisma';
import { AuthModule } from 'src/presentation/auth/auth.module';
import { IReimbursementRepositoryToken } from 'src/domain/repositories/reimbursement.repository';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
  ],
  controllers: [ReimbursementController],
  providers: [
    ReimbursementService,
    {
      provide: IReimbursementRepositoryToken,
      useClass: ReimbursementRepository,
    },
    UserRepository,
    PrismaClient,
    AuditLogService,
  ],
})
export class ReimbursementModule { }

