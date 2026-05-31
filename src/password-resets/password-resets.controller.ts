import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { PasswordResetsService } from './password-resets.service';
import type {
  PasswordResetDto,
  ResetPasswordDto,
} from './password-resets.service';

@Controller('password-resets')
export class PasswordResetsController {
  constructor(private readonly passwordResetsService: PasswordResetsService) {}

  @Get()
  findAll() {
    return this.passwordResetsService.findAll();
  }

  @Get('smtp-status')
  getSmtpStatus() {
    return this.passwordResetsService.getSmtpStatus();
  }

  @Put()
  replaceAll(@Body() requests: PasswordResetDto[]) {
    return this.passwordResetsService.replaceAll(requests);
  }

  @Post()
  create(@Body() request: PasswordResetDto) {
    return this.passwordResetsService.create(request);
  }

  @Post('request')
  requestReset(@Body() request: PasswordResetDto) {
    return this.passwordResetsService.requestReset(request);
  }

  @Patch(':id/send')
  markAsSent(@Param('id') id: string) {
    return this.passwordResetsService.markAsSent(id);
  }

  @Post(':id/reset')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.passwordResetsService.resetPassword(id, dto);
  }
}
