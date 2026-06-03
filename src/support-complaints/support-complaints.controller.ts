import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SupportComplaintsService } from './support-complaints.service';
import type { SupportComplaintDto } from './support-complaints.service';

@Controller('support-complaints')
export class SupportComplaintsController {
  constructor(
    private readonly supportComplaintsService: SupportComplaintsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.supportComplaintsService.findAll();
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  replaceAll(@Body() complaints: SupportComplaintDto[]) {
    return this.supportComplaintsService.replaceAll(complaints);
  }

  @Post()
  create(@Body() complaint: SupportComplaintDto) {
    return this.supportComplaintsService.create(complaint);
  }
}
