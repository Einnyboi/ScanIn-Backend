import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UploadBuktiDto {
  @ApiProperty({ example: 'sesi-id-disini' })
  @IsString()
  sesiId: string;

  @ApiPropertyOptional({ example: -6.1275 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  geoLat?: number;

  @ApiPropertyOptional({ example: 106.7963 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  geoLng?: number;
}
