/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, TipeKelas } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export type AdminUserRole = 'Mahasiswa' | 'Pengajar' | 'Admin';

export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: 'Aktif' | 'Nonaktif';
  kelasRombel?: string | null;
  tipeKelas?: TipeKelas | null;
};

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<AdminUserDto[]> {
    const users = await this.prisma.pengguna.findMany({
      include: {
        mahasiswa: true,
      },
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.toDto(u));
  }

  async create(user: AdminUserDto): Promise<AdminUserDto> {
    const hashed = await bcrypt.hash('Password123!', 10);
    const created = await this.prisma.pengguna.create({
      data: {
        username: user.email,
        password: hashed,
        nama: user.name,
        role: this.mapRole(user.role),
        isAktif: user.status === 'Aktif',
      },
    });

    if (created.role === Role.MAHASISWA) {
      await this.prisma.mahasiswa.upsert({
        where: { penggunaId: created.id },
        update: {
          nim: user.id,
          kelasRombel: user.kelasRombel ?? null,
          tipeKelas: user.tipeKelas ?? TipeKelas.PAGI,
        },
        create: {
          nim: user.id,
          penggunaId: created.id,
          kelasRombel: user.kelasRombel ?? null,
          tipeKelas: user.tipeKelas ?? TipeKelas.PAGI,
        },
      });
    }

    const createdWithProfile = await this.prisma.pengguna.findUnique({
      where: { id: created.id },
      include: { mahasiswa: true },
    });

    return this.toDto(createdWithProfile ?? created);
  }

  async update(
    role: AdminUserRole,
    id: string,
    user: AdminUserDto,
  ): Promise<AdminUserDto> {
    const updated = await this.prisma.pengguna.update({
      where: { id },
      data: {
        nama: user.name,
        username: user.email,
        isAktif: user.status === 'Aktif',
        role: this.mapRole(user.role),
      },
    });

    if (updated.role === Role.MAHASISWA) {
      await this.prisma.mahasiswa.upsert({
        where: { penggunaId: updated.id },
        update: {
          nim: user.id,
          ...(user.kelasRombel !== undefined
            ? { kelasRombel: user.kelasRombel }
            : {}),
          ...(user.tipeKelas != null ? { tipeKelas: user.tipeKelas } : {}),
        },
        create: {
          nim: user.id,
          penggunaId: updated.id,
          kelasRombel: user.kelasRombel ?? null,
          tipeKelas: user.tipeKelas ?? TipeKelas.PAGI,
        },
      });
    }

    const updatedWithProfile = await this.prisma.pengguna.findUnique({
      where: { id: updated.id },
      include: { mahasiswa: true },
    });

    return this.toDto(updatedWithProfile ?? updated);
  }

  async remove(role: AdminUserRole, id: string) {
    await this.prisma.pengguna.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { deleted: true, id, role };
  }

  async replaceAll(): Promise<AdminUserDto[]> {
    // replaceAll tidak aman untuk production — return data DB aja
    return this.findAll();
  }

  private toDto(p: any): AdminUserDto {
    return {
      id: p.id,
      name: p.nama,
      email: p.username,
      role: this.mapRoleToFrontend(p.role),
      status: p.isAktif ? 'Aktif' : 'Nonaktif',
      kelasRombel: p.mahasiswa?.kelasRombel ?? null,
      tipeKelas: p.mahasiswa?.tipeKelas ?? null,
    };
  }

  private mapRole(role: AdminUserRole): Role {
    if (role === 'Mahasiswa') return Role.MAHASISWA;
    if (role === 'Pengajar') return Role.DOSEN;
    return Role.ADMIN;
  }

  private mapRoleToFrontend(role: Role): AdminUserRole {
    if (role === Role.MAHASISWA) return 'Mahasiswa';
    if (role === Role.DOSEN || role === Role.ASDOS) return 'Pengajar';
    return 'Admin';
  }
}
