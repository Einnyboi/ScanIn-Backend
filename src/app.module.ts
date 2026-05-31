import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QrModule } from './qr/qr.module';
import { UsersModule } from './users/users.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ReportsModule } from './reports/reports.module';
import { SupportComplaintsModule } from './support-complaints/support-complaints.module';
import { PasswordResetsModule } from './password-resets/password-resets.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { TicketsModule } from './tickets/tickets.module';
import { AttendanceRecordsModule } from './attendance-records/attendance-records.module';
import { SesiModule } from './sesi/sesi.module';
import { PresensiModule } from './presensi/presensi.module';
import { TiketModule } from './tiket/tiket.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    QrModule,
    UsersModule,
    SchedulesModule,
    ReportsModule,
    SupportComplaintsModule,
    PasswordResetsModule,
    AdminUsersModule,
    TicketsModule,
    AttendanceRecordsModule,
    SesiModule,
    PresensiModule,
    TiketModule,
    EnrollmentsModule,
  ],
})
export class AppModule {}
