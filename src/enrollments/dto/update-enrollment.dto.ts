import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isOverride?: boolean;
}
