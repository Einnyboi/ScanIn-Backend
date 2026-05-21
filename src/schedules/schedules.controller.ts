import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import type { ScheduleDto } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @Put()
  replaceAll(@Body() schedules: ScheduleDto[]) {
    return this.schedulesService.replaceAll(schedules);
  }

  @Post()
  create(@Body() schedule: ScheduleDto) {
    return this.schedulesService.create(schedule);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() schedule: ScheduleDto) {
    return this.schedulesService.update(id, schedule);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
