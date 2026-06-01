import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Pastikan path ini sesuai dengan project Anda
import { AdminUserDto } from './dto/admin-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  private formatForFrontend(user: any) {
    const roleMap: Record<Role, string> = {
      MAHASISWA: 'Mahasiswa',
      DOSEN: 'Pengajar',
      ASDOS: 'Mahasiswa',
      ADMIN: 'Admin',
    };

    return {
      id: user.id,
      idNumber: user.id,
      name: user.nama,
      email: user.username,
      role: roleMap[user.role as Role] || 'Mahasiswa',
      status: user.isAktif ? 'Aktif' : 'Nonaktif',
    };
  }

  async findAll() {
    const users = await this.prisma.pengguna.findMany();
    return users.map((user) => this.formatForFrontend(user));
  }

  async createUser(data: AdminUserDto) {
    const newUser = await this.prisma.pengguna.create({
      data: {
        id: data.id,
        nama: data.name,
        username: data.email,
        role: data.role,
        isAktif: data.status,
        password: 'password123',
      },
    });
    return this.formatForFrontend(newUser);
  }

  async updateUser(id: string, data: AdminUserDto) {
    if (!id) throw new NotFoundException('User ID is required');

    const updatedUser = await this.prisma.pengguna.update({
      where: { id },
      data: {
        nama: data.name,
        username: data.email,
        role: data.role,
        isAktif: data.status
      },
    });
    return this.formatForFrontend(updatedUser);
  }

  async deleteUser(id: string) {
    await this.prisma.pengguna.delete({ where: { id } });
    return { success: true };
  }
}
