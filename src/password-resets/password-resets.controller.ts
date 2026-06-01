import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { PasswordResetsService } from './password-resets.service';

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
  replaceAll(@Body() requests: any[]) {
    return this.passwordResetsService.replaceAll(requests);
  }

  @Post()
  create(@Body() request: any) {
    return this.passwordResetsService.create(request);
  }

  @Post('request')
  requestReset(@Body() request: any) {
    return this.passwordResetsService.requestReset(request);
  }

  @Post(':id/send')
  markAsSent(@Param('id') id: string) {
    return this.passwordResetsService.markAsSent(id);
  }

  @Post(':id/complete')
  completeReset(@Param('id') id: string, @Body('password') password: string) {
    return this.passwordResetsService.completeReset(id, password);
  }
}
