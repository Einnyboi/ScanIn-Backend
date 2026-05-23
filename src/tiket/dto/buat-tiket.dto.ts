import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JenisPermohonan } from '@prisma/client';

export class BuatTiketDto {
  @ApiProperty({ enum: JenisPermohonan })
  @IsEnum(JenisPermohonan)
  jenisPermohonan: JenisPermohonan;

  @ApiProperty({ example: 'Saya hadir tapi presensi tidak terekam' })
  @IsString()
  deskripsiMasalah: string;

  @ApiProperty({ example: '2026-04-21T08:00:00.000Z' })
  @IsDateString()
  tanggalKelas: string;

  @ApiPropertyOptional({ example: 'sesi-id-opsional' })
  @IsOptional()
  @IsString()
  sesiId?: string;
}
