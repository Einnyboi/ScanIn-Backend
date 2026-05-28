/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusKehadiran } from '@prisma/client';

@Injectable()
export class AttendanceRecordsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const records = await this.prisma.dataPresensi.findMany({
      include: {
        mahasiswa: { include: { pengguna: true } },
        sesiPresensi: {
          include: {
            jadwal: { include: { kelas: { include: { mataKuliah: true } } } },
          },
        },
      },
      orderBy: { waktuAbsen: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      studentName: r.mahasiswa.pengguna.nama,
      studentId: r.mahasiswa.nim,
      courseTitle: r.sesiPresensi.jadwal.kelas.mataKuliah.namaMatkul,
      scannedAt: r.waktuAbsen.toISOString(),
      recordedAt: r.createdAt.toISOString(),
      method: r.metodeInput === 'QR' ? 'QR Code' : 'Manual',
      status: this.mapStatus(r.statusKehadiran),
    }));
  }
  create(record: any) {
    return record;
  }

  remove(id: string) {
    return { deleted: true, id };
  }

  replaceAll() {
    return this.findAll();
  }

  private mapStatus(status: StatusKehadiran): string {
    if (status === StatusKehadiran.HADIR) return 'Terverifikasi';
    if (status === StatusKehadiran.TERLAMBAT) return 'Terlambat';
    if (status === StatusKehadiran.TIDAK_HADIR) return 'Tidak Hadir';
    if (status === StatusKehadiran.MENUNGGU_VALIDASI) return 'Tidak Valid';
    return 'Kedaluwarsa';
  }
}
