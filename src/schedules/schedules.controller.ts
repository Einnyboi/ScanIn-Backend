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
  Request,
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
  findAll(@Request() req) {
    return this.schedulesService.findAll(req.user);
  }

  @Get('hierarchy')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  getHierarchy() {
    return this.schedulesService.getHierarchy();
  }

  @Post('courses')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  createCourse(@Body() data: { kodeMatkul: string; namaMatkul: string; sks: number }) {
    return this.schedulesService.createCourse(data);
  }

  @Post('classes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  createClass(@Body() data: { namaKelas: string; idMatkul: string }) {
    return this.schedulesService.createClass(data);
  }

  @Patch('classes/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  updateClass(@Param('id') id: string, @Body() data: { namaKelas: string }) {
    return this.schedulesService.updateClass(id, data.namaKelas);
  }

  @Post('sessions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  createSession(@Body() data: { kelasId: string; hari: string; time: string; room: string; lecturer?: string }) {
    return this.schedulesService.createSession(data);
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

  @Post('mock-test')
  // Dibiarkan tanpa guard sementara agar mudah dipanggil untuk testing,
  // atau bisa ditambahkan @UseGuards dan @Roles jika ingin restriksi.
  createMockTest() {
    return this.schedulesService.createMockTestSchedule();
  }
}
