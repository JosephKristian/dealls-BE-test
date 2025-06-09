import { Module } from '@nestjs/common';

import { OvertimeService } from 'src/application/employee/overtime/services/overtime.service';
import { DatabaseModule } from 'src/shared/database/database.module';
import { IOvertimeRepositoryToken } from 'src/domain/user/repositories/overtime.repository';
import { OvertimeRepository } from 'src/infrastructure/employee/overtime/overtime.repository.prisma';
import { OvertimeController } from 'src/presentation/overtime/overtime.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';
@Module({
    imports: [
        DatabaseModule,
        AuthModule,
    ],
    controllers: [OvertimeController],
    providers: [
        OvertimeService,
        {
            provide: IOvertimeRepositoryToken,
            useClass: OvertimeRepository,
        },
        AuditLogService,
    ],
})
export class OvertimeModule { }
