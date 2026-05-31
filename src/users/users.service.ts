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
    return this.prisma.pengguna.create({
      data: {
        username: dto.username,
        password: hashed,
        nama: dto.nama,
        role: dto.role,
      },
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
