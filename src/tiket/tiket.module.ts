import { Module } from '@nestjs/common';
import { TiketController } from './tiket.controller';
import { TiketService } from './tiket.service';

@Module({
  controllers: [TiketController],
  providers: [TiketService]
})
export class TiketModule {}
