import { Module } from '@nestjs/common';
import { TiketService } from './tiket.service';
import { TiketController } from './tiket.controller';

@Module({
  providers: [TiketService],
  controllers: [TiketController],
  exports: [TiketService],
})
export class TiketModule {}
