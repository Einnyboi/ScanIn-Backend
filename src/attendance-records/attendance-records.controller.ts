import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AttendanceRecordsService } from './attendance-records.service';

@Controller('attendance-records')
export class AttendanceRecordsController {
  constructor(
    private readonly attendanceRecordsService: AttendanceRecordsService,
  ) {}

  @Get()
  findAll() {
    return this.attendanceRecordsService.findAll();
  }

  @Put()
  replaceAll() {
    return this.attendanceRecordsService.replaceAll();
  }

  @Post()
  create(@Body() record: any) {
    return this.attendanceRecordsService.create(record);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceRecordsService.remove(id);
  }
}
