import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: RegisterDto) {
    const existing = await this.prisma.pengguna.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException('Username sudah terdaftar');

    const hashed = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const pengguna = await tx.pengguna.create({
        data: {
          username: dto.username,
          password: hashed,
          nama: dto.nama,
          role: dto.role,
        },
      });

      if (dto.role === 'MAHASISWA') {
        const emailPrefix = dto.username.split('@')[0] || '';
        const nim = emailPrefix.replace(/[^0-9]/g, '');
        const angkatan = nim.length >= 5 ? nim.substring(3, 5) : '00';
        await tx.mahasiswa.create({
          data: {
            nim: nim || `MHS${Date.now()}`,
            angkatan,
            penggunaId: pengguna.id,
            tipeKelas: 'PAGI', // Default, bisa diubah nanti
          },
        });
      } else if (dto.role === 'DOSEN' || dto.role === 'ASDOS') {
        const emailPrefix = dto.username.split('@')[0] || '';
        const nip = emailPrefix.replace(/[^0-9]/g, '');
        await tx.pengajar.create({
          data: {
            nip: nip || `NIP${Date.now()}`,
            penggunaId: pengguna.id,
          },
        });
      }

      return pengguna;
    });
  }

  async findByUsername(username: string) {
    return this.prisma.pengguna.findUnique({ where: { username } });
  }

  async findById(id: string) {
    return this.prisma.pengguna.findUnique({ where: { id } });
  }

  async updatePasswordByEmail(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);

    return this.prisma.pengguna.update({
      where: { username: email.trim().toLowerCase() },
      data: { password: hashed },
    });
  }
}
