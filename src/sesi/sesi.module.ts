import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SesiService } from './sesi.service';
import { SesiController } from './sesi.controller';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [ScheduleModule.forRoot(), EnrollmentsModule],
  providers: [SesiService],
  controllers: [SesiController],
  exports: [SesiService],
})
export class SesiModule {}
