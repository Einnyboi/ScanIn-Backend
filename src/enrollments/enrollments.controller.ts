import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('search-students')
  searchStudents(@Query('q') q: string) {
    return this.enrollmentsService.searchStudents(q || '');
  }

  @Get('mahasiswa/:identifier')
  findByMahasiswa(@Param('identifier') identifier: string) {
    return this.enrollmentsService.findByMahasiswa(identifier);
  }

  @Get('kelas/:identifier')
  findByKelas(@Param('identifier') identifier: string) {
    return this.enrollmentsService.findByKelas(identifier);
  }

  @Post()
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, dto);
  }

  @Post('classes/:id/enroll/bulk')
  enrollBulk(
    @Param('id') kelasId: string,
    @Body('angkatan') angkatan: string,
    @Body('tipeKelas') tipeKelas?: string,
  ) {
    return this.enrollmentsService.enrollBulk(kelasId, angkatan, tipeKelas);
  }

  @Post('classes/:id/enroll/manual')
  enrollManual(
    @Param('id') kelasId: string,
    @Body('mahasiswaIds') mahasiswaIds: string[],
  ) {
    return this.enrollmentsService.enrollManual(kelasId, mahasiswaIds);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}
