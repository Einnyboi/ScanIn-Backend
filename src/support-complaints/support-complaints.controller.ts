import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { SupportComplaintsService } from './support-complaints.service';
import type { SupportComplaintDto } from './support-complaints.service';

@Controller('support-complaints')
export class SupportComplaintsController {
  constructor(
    private readonly supportComplaintsService: SupportComplaintsService,
  ) {}

  @Get()
  findAll() {
    return this.supportComplaintsService.findAll();
  }

  @Put()
  replaceAll(@Body() complaints: SupportComplaintDto[]) {
    return this.supportComplaintsService.replaceAll(complaints);
  }

  @Post()
  create(@Body() complaint: SupportComplaintDto) {
    return this.supportComplaintsService.create(complaint);
  }
}
