import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ example: '535240187' })
  @IsString()
  mahasiswaId: string;

  @ApiProperty({ example: 'KEL001' })
  @IsString()
  kelasId: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isOverride?: boolean;
}
