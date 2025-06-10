import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { UserModule } from 'src/presentation/user/user.module';
import { AuthModule } from 'src/presentation/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AttendanceModule } from 'src/presentation/employee/attendance/attendance.module';
import { OvertimeModule } from 'src/presentation/employee/overtime/overtime.module';
import { ReimbursementModule } from 'src/presentation/employee/reimbursement/reimbursement.module';
import { PayrollModule } from './presentation/admin/payroll/payroll.module';
import { PayslipModule } from './presentation/employee/payslip/payslip.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    AttendanceModule,
    OvertimeModule,
    ReimbursementModule,
    PayrollModule,
    PayslipModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
