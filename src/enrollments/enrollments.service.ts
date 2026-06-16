import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

export type EnrollmentDto = {
  id: string;
  mahasiswaId: string;
  mahasiswaNim: string;
  mahasiswaName: string;
  mahasiswaUsername: string;
  kelasId: string;
  kelasCode: string;
  kelasName: string;
  courseTitle: string;
  isOverride: boolean;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EnrollmentDto[]> {
    const enrollments = await this.prisma.mahasiswaKelas.findMany({
      include: {
        mahasiswa: { include: { pengguna: true } },
        kelas: { include: { mataKuliah: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map((item) => this.toDto(item));
  }

  async findByMahasiswa(identifier: string): Promise<EnrollmentDto[]> {
    const mahasiswa = await this.resolveMahasiswaByIdentifier(identifier);
    if (!mahasiswa) {
      return [];
    }

    const enrollments = await this.prisma.mahasiswaKelas.findMany({
      where: { mahasiswaId: mahasiswa.id },
      include: {
        mahasiswa: { include: { pengguna: true } },
        kelas: { include: { mataKuliah: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map((item) => this.toDto(item));
  }

  async findByKelas(identifier: string): Promise<EnrollmentDto[]> {
    const kelas = await this.resolveKelasByIdentifier(identifier);
    if (!kelas) {
      return [];
    }

    const enrollments = await this.prisma.mahasiswaKelas.findMany({
      where: { kelasId: kelas.id },
      include: {
        mahasiswa: { include: { pengguna: true } },
        kelas: { include: { mataKuliah: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map((item) => this.toDto(item));
  }

  async create(dto: CreateEnrollmentDto): Promise<EnrollmentDto> {
    const mahasiswa = await this.resolveMahasiswaByIdentifier(dto.mahasiswaId);
    if (!mahasiswa) {
      throw new NotFoundException('Mahasiswa tidak ditemukan');
    }

    const kelas = await this.resolveKelasByIdentifier(dto.kelasId);
    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    const enrollment = await this.prisma.mahasiswaKelas.upsert({
      where: {
        mahasiswaId_kelasId: {
          mahasiswaId: mahasiswa.id,
          kelasId: kelas.id,
        },
      },
      update: {
        isOverride: dto.isOverride ?? false,
      },
      create: {
        mahasiswaId: mahasiswa.id,
        kelasId: kelas.id,
        isOverride: dto.isOverride ?? false,
      },
      include: {
        mahasiswa: { include: { pengguna: true } },
        kelas: { include: { mataKuliah: true } },
      },
    });

    return this.toDto(enrollment);
  }

  async update(id: string, dto: UpdateEnrollmentDto): Promise<EnrollmentDto> {
    const existing = await this.prisma.mahasiswaKelas.findUnique({
      where: { id },
      include: {
        mahasiswa: { include: { pengguna: true } },
        kelas: { include: { mataKuliah: true } },
      },
    });
    if (!existing) {
      throw new NotFoundException('Enrollment tidak ditemukan');
    }

    const updated = await this.prisma.mahasiswaKelas.update({
      where: { id },
      data: {
        isOverride: dto.isOverride ?? existing.isOverride,
      },
      include: {
        mahasiswa: { include: { pengguna: true } },
        kelas: { include: { mataKuliah: true } },
      },
    });

    return this.toDto(updated);
  }

  async remove(id: string) {
    await this.prisma.mahasiswaKelas.delete({ where: { id } });
    return { deleted: true, id };
  }

  async enrollBulk(kelasId: string, angkatan: string, tipeKelas?: string, kelasRombel?: string) {
    const kelas = await this.resolveKelasByIdentifier(kelasId);
    if (!kelas) throw new NotFoundException('Kelas tidak ditemukan');

    const mahasiswaList = await this.prisma.mahasiswa.findMany({
      where: {
        angkatan,
        ...(tipeKelas ? { tipeKelas: tipeKelas as any } : {}),
        ...(kelasRombel ? { kelasRombel } : {}),
      },
    });

    if (!mahasiswaList.length) {
      return { count: 0, message: 'Tidak ada mahasiswa yang cocok' };
    }

    const data = mahasiswaList.map((m) => ({
      mahasiswaId: m.id,
      kelasId: kelas.id,
      isOverride: false,
    }));

    // Use transaction to ignore duplicates
    let count = 0;
    for (const item of data) {
      try {
        await this.prisma.mahasiswaKelas.upsert({
          where: {
            mahasiswaId_kelasId: {
              mahasiswaId: item.mahasiswaId,
              kelasId: item.kelasId,
            },
          },
          update: {},
          create: item,
        });
        count++;
      } catch (e) {
        // ignore
      }
    }

    return { count, message: `Berhasil enroll ${count} mahasiswa` };
  }

  async enrollManual(kelasId: string, mahasiswaIds: string[]) {
    const kelas = await this.resolveKelasByIdentifier(kelasId);
    if (!kelas) throw new NotFoundException('Kelas tidak ditemukan');

    let count = 0;
    for (const mId of mahasiswaIds) {
      const m = await this.resolveMahasiswaByIdentifier(mId);
      if (!m) continue;

      try {
        await this.prisma.mahasiswaKelas.upsert({
          where: {
            mahasiswaId_kelasId: {
              mahasiswaId: m.id,
              kelasId: kelas.id,
            },
          },
          update: {},
          create: {
            mahasiswaId: m.id,
            kelasId: kelas.id,
            isOverride: true,
          },
        });
        count++;
      } catch (e) {
        // ignore
      }
    }

    return { count, message: `Berhasil manual enroll ${count} mahasiswa` };
  }

  async searchStudents(query: string) {
    const q = query.trim();
    if (!q) return [];

    const students = await this.prisma.mahasiswa.findMany({
      where: {
        OR: [
          { nim: { contains: q, mode: 'insensitive' } },
          { pengguna: { nama: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { pengguna: true },
      take: 20,
    });

    return students.map((s) => ({
      id: s.id,
      nim: s.nim,
      nama: s.pengguna.nama,
      angkatan: s.angkatan,
      tipeKelas: s.tipeKelas,
    }));
  }

  async getAvailableRombels(angkatan?: string) {
    const where = angkatan ? { angkatan } : {};
    const rombels = await this.prisma.mahasiswa.findMany({
      where: {
        ...where,
        kelasRombel: { not: null },
      },
      distinct: ['kelasRombel'],
      select: { kelasRombel: true },
      orderBy: { kelasRombel: 'asc' },
    });
    return rombels.map((r) => r.kelasRombel).filter(Boolean);
  }

  async resolveMahasiswaByIdentifier(identifier: string) {
    return this.prisma.mahasiswa.findFirst({
      where: {
        OR: [
          { id: identifier },
          { nim: identifier },
          { penggunaId: identifier },
        ],
      },
      include: { pengguna: true },
    });
  }

  async resolveKelasByIdentifier(identifier: string) {
    return this.prisma.kelas.findFirst({
      where: {
        OR: [{ id: identifier }, { idKelas: identifier }],
      },
      include: { mataKuliah: true },
    });
  }

  async isMahasiswaTerdaftarDiKelas(
    mahasiswaIdentifier: string,
    kelasIdentifier: string,
  ): Promise<boolean> {
    const mahasiswa =
      await this.resolveMahasiswaByIdentifier(mahasiswaIdentifier);
    const kelas = await this.resolveKelasByIdentifier(kelasIdentifier);

    if (!mahasiswa || !kelas) {
      return false;
    }

    if (mahasiswa.kelasRombel && mahasiswa.kelasRombel === kelas.namaKelas) {
      return true;
    }

    const enrollment = await this.prisma.mahasiswaKelas.findFirst({
      where: {
        mahasiswaId: mahasiswa.id,
        kelasId: kelas.id,
      },
      select: { id: true },
    });

    return Boolean(enrollment);
  }

  async getMahasiswaIdsForKelas(kelasIdentifier: string): Promise<string[]> {
    const kelas = await this.resolveKelasByIdentifier(kelasIdentifier);
    if (!kelas) {
      return [];
    }

    const mahasiswa = await this.prisma.mahasiswa.findMany({
      where: {
        OR: [
          { kelasRombel: kelas.namaKelas },
          {
            kelasAssignments: {
              some: { kelasId: kelas.id },
            },
          },
        ],
      },
      select: { id: true },
    });

    return mahasiswa.map((item) => item.id);
  }

  async countMahasiswaForKelas(kelasIdentifier: string): Promise<number> {
    const kelas = await this.resolveKelasByIdentifier(kelasIdentifier);
    if (!kelas) {
      return 0;
    }

    return this.prisma.mahasiswa.count({
      where: {
        OR: [
          { kelasRombel: kelas.namaKelas },
          {
            kelasAssignments: {
              some: { kelasId: kelas.id },
            },
          },
        ],
      },
    });
  }

  async getMahasiswaIdsForSesi(kelasIdentifier: string): Promise<string[]> {
    return this.getMahasiswaIdsForKelas(kelasIdentifier);
  }

  private toDto(
    item: Prisma.MahasiswaKelasGetPayload<{
      include: {
        mahasiswa: { include: { pengguna: true } };
        kelas: { include: { mataKuliah: true } };
      };
    }>,
  ): EnrollmentDto {
    return {
      id: item.id,
      mahasiswaId: item.mahasiswaId,
      mahasiswaNim: item.mahasiswa.nim,
      mahasiswaName: item.mahasiswa.pengguna.nama,
      mahasiswaUsername: item.mahasiswa.pengguna.username,
      kelasId: item.kelasId,
      kelasCode: item.kelas.idKelas,
      kelasName: item.kelas.namaKelas,
      courseTitle: item.kelas.mataKuliah.namaMatkul,
      isOverride: item.isOverride,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
