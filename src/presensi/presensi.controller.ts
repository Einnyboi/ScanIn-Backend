import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { PresensiService } from './presensi.service';
import { ScanQrDto } from './dto/scan-qr.dto';
import { UploadBuktiDto } from './dto/upload-bukti.dto';
import { PresensiManualDto } from './dto/presensi-manual.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Presensi')
@ApiBearerAuth()
@Controller('presensi')
export class PresensiController {
  constructor(private presensiService: PresensiService) {}

  @ApiOperation({ summary: 'Scan QR untuk absen (Mahasiswa)' })
  @UseGuards(AuthGuard('jwt'))
  @Post('scan')
  scanQr(@Body() dto: ScanQrDto, @Request() req) {
    return this.presensiService.scanQr(dto, req.user);
  }

  @ApiOperation({ summary: 'Upload bukti presensi (Mahasiswa)' })
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  uploadBukti(
    @Body() dto: UploadBuktiDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.presensiService.uploadBukti(dto, req.user, file);
  }

  @ApiOperation({ summary: 'Validasi bukti presensi (Pengajar)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.DOSEN, Role.ASDOS)
  @Patch('validasi/:id')
  validasiBukti(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.presensiService.validasiBukti(id, body.aksi, req.user, body.alasan);
  }

  @ApiOperation({ summary: 'Input presensi manual (Pengajar)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.DOSEN, Role.ASDOS)
  @Post('manual')
  presensiManual(@Body() dto: PresensiManualDto, @Request() req) {
    return this.presensiService.presensiManual(dto, req.user);
  }

  @ApiOperation({ summary: 'Lihat daftar presensi sesi (Pengajar/Admin)' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.DOSEN, Role.ASDOS, Role.ADMIN)
  @Get('sesi/:id')
  getPresensiSesi(@Param('id') id: string) {
    return this.presensiService.getPresensiSesi(id);
  }

  @ApiOperation({ summary: 'Lihat riwayat presensi mahasiswa (Mahasiswa)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getPresensiMahasiswa(@Request() req) {
    return this.presensiService.getPresensiMahasiswa(req.user);
  }
}
