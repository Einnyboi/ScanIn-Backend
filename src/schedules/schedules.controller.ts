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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { SchedulesService } from './schedules.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

type ScheduleDto = {
  day?: string;
  title?: string;
  time?: string;
  room?: string;
  lecturer?: string;
  className?: string;
  students?: number;
  status?: string;
};

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.DOSEN, Role.ASDOS, Role.MAHASISWA)
  findAll() {
    return this.schedulesService.findAll();
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  replaceAll() {
    return this.schedulesService.replaceAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() schedule: ScheduleDto) {
    return this.schedulesService.create(schedule);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() schedule: ScheduleDto) {
    return this.schedulesService.update(id, schedule);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
