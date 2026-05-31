import { Module } from '@nestjs/common';
import { PasswordResetsController } from './password-resets.controller';
import { PasswordResetsService } from './password-resets.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [PasswordResetsController],
  providers: [PasswordResetsService],
})
export class PasswordResetsModule {}
