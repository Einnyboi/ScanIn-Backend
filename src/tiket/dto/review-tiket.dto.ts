import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusPermohonan } from '@prisma/client';

export class ReviewTiketDto {
  @ApiProperty({ enum: ['SELESAI', 'DITOLAK'] })
  @IsIn(['SELESAI', 'DITOLAK'])
  status: StatusPermohonan;

  @ApiPropertyOptional({ example: 'Dispensasi disetujui karena ada surat resmi' })
  @IsOptional()
  @IsString()
  catatanReview?: string;
}
