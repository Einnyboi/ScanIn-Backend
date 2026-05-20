import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SesiService } from './sesi.service';
import { SesiController } from './sesi.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SesiService],
  controllers: [SesiController],
  exports: [SesiService],
})
export class SesiModule {}
