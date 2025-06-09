// src/modules/attendance/attendance.module.ts
import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { AttendanceService } from 'src/application/attendance/services/attendance.services';
import { AttendanceRepository } from 'src/infrastructure/user/repositories/attendance.repository.prisma';
import { UserRepository } from 'src/infrastructure/user/repositories/user.repository.prisma';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';

import { AttendanceController } from 'src/presentation/attendance/attendance.controller';
import { DatabaseModule } from 'src/shared/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { SECRET } from 'src/common/constants/constanta';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceRepository,
    UserRepository,
    PrismaClient,
    AuditLogService,
  ],
})
export class AttendanceModule { }

