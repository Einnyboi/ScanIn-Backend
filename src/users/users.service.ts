import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: RegisterDto) {
    const existing = await this.prisma.pengguna.findUnique({
      where: { username: dto.email },
    });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.pengguna.create({
      data: {
        username: dto.email,
        password: hashed,
        nama: dto.name,
        role: dto.role,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.pengguna.findUnique({ where: { username: email } });
  }

  async findById(id: string) {
    return this.prisma.pengguna.findUnique({ where: { id } });
  }
}
