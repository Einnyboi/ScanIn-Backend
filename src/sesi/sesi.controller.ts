import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SesiService } from './sesi.service';
import { BukaSesiDto } from './dto/buka-sesi.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Sesi Presensi')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('sesi')
export class SesiController {
  constructor(private sesiService: SesiService) {}

  @ApiOperation({ summary: 'Buka sesi presensi baru (Pengajar)' })
  @Roles(Role.DOSEN, Role.ASDOS)
  @Post()
  bukaSesi(@Body() dto: BukaSesiDto, @Request() req) {
    return this.sesiService.bukaSesi(dto, req.user)
  }

  @ApiOperation({ summary: 'Tutup sesi presensi manual (Pengajar)' })
  @Roles(Role.DOSEN, Role.ASDOS)
  @Patch(':id/tutup')
  tutupSesi(@Param('id') id: string, @Request() req) {
    return this.sesiService.tutupSesi(id, req.user)
  }

  @ApiOperation({ summary: 'Lihat detail sesi dan daftar kehadiran' })
  @Roles(Role.DOSEN, Role.ASDOS, Role.ADMIN)
  @Get(':id')
  getSesi(@Param('id') id: string) {
    return this.sesiService.getSesi(id);
  }

  @ApiOperation({ summary: 'Cek sesi aktif berdasarkan jadwal' })
  @Roles(Role.DOSEN, Role.ASDOS, Role.MAHASISWA)
  @Get('aktif/:jadwalId')
  getSesiAktif(@Param('jadwalId') jadwalId: string) {
    return this.sesiService.getSesiAktifByJadwal(jadwalId);
  }
}
