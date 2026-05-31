/* eslint-disable @typescript-eslint/no-unsafe-return */
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

type ScheduleDto = {
  day?: string;
  title?: string;
  time?: string;
  room?: string;
  lecturer?: string;
  students?: number;
  status?: string;
};

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @Put()
  replaceAll() {
    return this.schedulesService.replaceAll();
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
  remove() {
    return this.schedulesService.remove();
  }
}
