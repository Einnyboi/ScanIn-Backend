import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QrModule } from './qr/qr.module';
import { SesiModule } from './sesi/sesi.module';
import { PresensiModule } from './presensi/presensi.module';
import { TiketModule } from './tiket/tiket.module';

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
    SesiModule,
    PresensiModule,
    TiketModule,
  ],
})
export class AppModule {}
