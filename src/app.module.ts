import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { UserModule } from 'src/presentation/user/user.module';
import { AuthModule } from 'src/presentation/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AttendanceModule } from 'src/presentation/attendance/attendance.module';
import { OvertimeModule } from 'src/presentation/overtime/overtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    AttendanceModule,
    OvertimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
