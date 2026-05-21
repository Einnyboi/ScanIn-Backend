import { Module } from '@nestjs/common';
import { SupportComplaintsController } from './support-complaints.controller';
import { SupportComplaintsService } from './support-complaints.service';

@Module({
  controllers: [SupportComplaintsController],
  providers: [SupportComplaintsService],
})
export class SupportComplaintsModule {}
