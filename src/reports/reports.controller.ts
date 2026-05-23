import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { GeneratedReportDto } from './reports.service';

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
