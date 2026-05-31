import { Module } from '@nestjs/common';
import { PresensiController } from './presensi.controller';
import { PresensiService } from './presensi.service';
import { JwtModule } from '@nestjs/jwt';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [
    EnrollmentsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [PresensiController],
  providers: [PresensiService],
})
export class PresensiModule {}
