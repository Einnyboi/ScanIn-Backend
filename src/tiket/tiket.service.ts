import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pengguna, StatusPermohonan, JenisPermohonan } from '@prisma/client';

@Injectable()
export class TiketService {
  constructor(private prisma: PrismaService) {}

  async buatTiket(
    data: {
      jenisPermohonan: JenisPermohonan;
      deskripsiMasalah: string;
      tanggalKelas: string;
      fileBukti?: string;
    },
    pengguna: Pengguna,
  ) {
    return this.prisma.permohonan.create({
      data: {
        penggunaId: pengguna.id,
        jenisPermohonan: data.jenisPermohonan,
        deskripsiMasalah: data.deskripsiMasalah,
        tanggalKelas: new Date(data.tanggalKelas),
        fileBukti: data.fileBukti ?? null,
        status: StatusPermohonan.MENUNGGU_DIPROSES,
      },
      include: {
        pengguna: {
          select: { id: true, nama: true, username: true, role: true },
        },
      },
    });
  }

  async getTiketSaya(pengguna: Pengguna) {
    return this.prisma.permohonan.findMany({
      where: { penggunaId: pengguna.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllTiket(status?: StatusPermohonan) {
    return this.prisma.permohonan.findMany({
      where: status ? { status } : undefined,
      include: {
        pengguna: {
          select: { id: true, nama: true, username: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewTiket(
    tiketId: string,
    data: { status: StatusPermohonan; catatanReview?: string },
  ) {
    const tiket = await this.prisma.permohonan.findUnique({
      where: { id: tiketId },
    });
    if (!tiket) throw new NotFoundException('Tiket tidak ditemukan');
    if (tiket.status !== StatusPermohonan.MENUNGGU_DIPROSES) {
      throw new BadRequestException('Tiket ini sudah direview');
    }

    return this.prisma.permohonan.update({
      where: { id: tiketId },
      data: { status: data.status, catatanReview: data.catatanReview },
    });
  }

  async getStatistik() {
    const [menunggu, selesai, ditolak, total] = await Promise.all([
      this.prisma.permohonan.count({
        where: { status: StatusPermohonan.MENUNGGU_DIPROSES },
      }),
      this.prisma.permohonan.count({
        where: { status: StatusPermohonan.SELESAI },
      }),
      this.prisma.permohonan.count({
        where: { status: StatusPermohonan.DITOLAK },
      }),
      this.prisma.permohonan.count(),
    ]);
    return { total, menunggu, selesai, ditolak };
  }
}
