import { Controller, Post, Body, Request, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/jwt/guard/jwt-auth.guard';     // guard jwt untuk proteksi route
import { AuthService } from 'src/application/auth/services/auth.service';
import { CreateUserDto } from 'src/application/user/dto/user.dto';
import { AuditLogService } from 'src/shared/audit-log/services/audit-log.service';
import { LocalAuthGuard } from 'src/shared/jwt/guard/local-auth.guard';
import { JwtRefreshGuard } from 'src/shared/jwt/guard/jwt-refresh.guard';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const user = await this.authService.login(req.user);

    const requestId = req.headers['x-request-id'] || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
    const userAgent = req.headers['user-agent'] || null;

    const createdBy = `${req.user.id}|${ipAddress}|${userAgent}}`;

    await this.auditLogService.log({
      entity: 'User',
      entityId: req.user.id,
      action: 'LOGIN',
      performedBy: createdBy,
      ipAddress,
      requestId,
      oldData: null,
      newData: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });


    return user

  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    const user = req.user;
    return this.authService.generateAccessToken(user);
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto, @Request() req) {
    const userId = req.user?.id ?? 'system';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
    const requestId = req.headers['x-request-id'] || null;
    const userAgent = req.headers['user-agent'] || null;

    const createdBy = `${userId}|${ipAddress}|${userAgent}}`;

    const user = await this.authService.register({
      ...dto,
      createdBy,
      requestId,
    });

    await this.auditLogService.log({
      entity: 'User',
      entityId: user.id,
      action: 'CREATE',
      performedBy: createdBy,
      ipAddress,
      requestId,
      oldData: null,
      newData: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

    return user;
  }


  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
