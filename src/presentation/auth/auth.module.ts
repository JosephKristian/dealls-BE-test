import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from 'src/application/auth/services/auth.service';

import { PrismaService } from 'src/shared/database/prisma.service';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';

import { JwtStrategy } from 'src/shared/jwt/strategies/jwt.strategy';
import { RefreshJwtStrategy } from 'src/shared/jwt/strategies/refresh-jwt.strategy';
import { LocalStrategy } from 'src/shared/jwt/strategies/local.strategy';
import { SECRET } from 'src/common/constants/constanta';
import { RolesGuard } from 'src/shared/jwt/guard/roles.guard';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({})
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        PrismaService,
        AuditLogService,
        JwtStrategy,
        RefreshJwtStrategy,
        LocalStrategy,
        RolesGuard
    ],
    exports: [
        AuthService,
        JwtStrategy,
        RolesGuard,
        RefreshJwtStrategy,
        LocalStrategy,
        JwtModule.register({})
    ],
})
export class AuthModule { }
