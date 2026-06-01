import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { Role } from '@prisma/client';

export class AdminUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @Transform(({ value }) => {
    switch (value) {
      case 'Mahasiswa': return Role.MAHASISWA;
      case 'Pengajar': return Role.DOSEN;
      case 'Admin': return Role.ADMIN;
      default: return Role.MAHASISWA;
    }
  })
  role: Role;

  @Transform(({ value }) => value === 'Aktif')
  status: boolean;
}