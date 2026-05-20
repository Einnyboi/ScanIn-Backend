import { IsString, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StatusKehadiran } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ItemPresensiManualDto {
  @ApiProperty({ example: 'mahasiswa-id-disini' })
  @IsString()
  mahasiswaId: string;

  @ApiProperty({ enum: StatusKehadiran })
  @IsEnum(StatusKehadiran)
  status: StatusKehadiran;
}

export class PresensiManualDto {
  @ApiProperty({ example: 'sesi-id-disini' })
  @IsString()
  sesiId: string;

  @ApiProperty({ type: [ItemPresensiManualDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPresensiManualDto)
  daftarHadir: ItemPresensiManualDto[];
}
