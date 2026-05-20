import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BukaSesiDto {
  @ApiProperty({ example: 'jadwal-id-disini' })
  @IsString()
  jadwalId!: string;
}
