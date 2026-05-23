import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScanQrDto {
  @ApiProperty({ example: 'sesi-id-disini' })
  @IsString()
  sesiId: string;

  @ApiProperty({ example: 'jwt-token-dari-qr-mahasiswa' })
  @IsString()
  qrToken: string;
}
