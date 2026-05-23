import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AttendanceRecordsService } from './attendance-records.service';
import type { ScanRecordDto } from './attendance-records.service';

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
  replaceAll(@Body() records: ScanRecordDto[]) {
    return this.attendanceRecordsService.replaceAll(records);
  }

  @Post()
  create(@Body() record: ScanRecordDto) {
    return this.attendanceRecordsService.create(record);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceRecordsService.remove(id);
  }
}
