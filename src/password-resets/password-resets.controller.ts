import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PasswordResetsService } from './password-resets.service';
import type {
  PasswordResetDto,
  ResetPasswordDto,
} from './password-resets.service';

@Controller('password-resets')
export class PasswordResetsController {
  constructor(private readonly passwordResetsService: PasswordResetsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.passwordResetsService.findAll();
  }

  @Get('smtp-status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  getSmtpStatus() {
    return this.passwordResetsService.getSmtpStatus();
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  replaceAll(@Body() requests: PasswordResetDto[]) {
    return this.passwordResetsService.replaceAll(requests);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() request: PasswordResetDto) {
    return this.passwordResetsService.create(request);
  }

  @Post('request')
  requestReset(@Body() request: PasswordResetDto) {
    return this.passwordResetsService.requestReset(request);
  }

  @Post(':id/send')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  markAsSent(@Param('id') id: string, @Body() request?: PasswordResetDto) {
    return this.passwordResetsService.markAsSent(id, request);
  }

  @Post(':id/reset')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.passwordResetsService.resetPassword(id, dto);
  }
}
