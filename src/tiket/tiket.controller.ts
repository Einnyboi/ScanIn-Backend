import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TiketService } from './tiket.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role, StatusPermohonan, Pengguna } from '@prisma/client';
import type { Request as ExpressRequest } from 'express';

@ApiTags('Tiket (DB)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tiket')
export class TiketController {
  constructor(private tiketService: TiketService) {}

  @ApiOperation({ summary: 'Ajukan tiket baru' })
  @Roles(Role.MAHASISWA, Role.DOSEN, Role.ASDOS)
  @Post()
  buatTiket(
    @Body()
    body: {
      jenisPermohonan: any;
      deskripsiMasalah: string;
      tanggalKelas: string;
      fileBukti?: string;
    },
    @Req() req: ExpressRequest & { user: Pengguna },
  ) {
    return this.tiketService.buatTiket(body, req.user);
  }

  @ApiOperation({ summary: 'Tiket milik saya' })
  @Roles(Role.MAHASISWA, Role.DOSEN, Role.ASDOS)
  @Get('saya')
  getTiketSaya(@Req() req: ExpressRequest & { user: Pengguna }) {
    return this.tiketService.getTiketSaya(req.user);
  }

  @ApiOperation({ summary: 'Semua tiket (Admin)' })
  @Roles(Role.ADMIN)
  @Get()
  getAllTiket(@Query('status') status?: StatusPermohonan) {
    return this.tiketService.getAllTiket(status);
  }

  @ApiOperation({ summary: 'Statistik tiket (Admin)' })
  @Roles(Role.ADMIN)
  @Get('statistik')
  getStatistik() {
    return this.tiketService.getStatistik();
  }

  @ApiOperation({ summary: 'Review tiket (Admin)' })
  @Roles(Role.ADMIN)
  @Patch(':id/review')
  reviewTiket(
    @Param('id') id: string,
    @Body() body: { status: StatusPermohonan; catatanReview?: string },
  ) {
    return this.tiketService.reviewTiket(id, body);
  }
}
