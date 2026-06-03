import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReportsService } from './reports.service';
import type { GeneratedReportDto } from './reports.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Put()
  replaceAll(@Body() reports: GeneratedReportDto[]) {
    return this.reportsService.replaceAll(reports);
  }

  @Post()
  create(@Body() report: GeneratedReportDto) {
    return this.reportsService.create(report);
  }
}
