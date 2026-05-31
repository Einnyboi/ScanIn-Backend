/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  async findAll() {
    const jadwal = await this.prisma.jadwal.findMany({
      include: {
        kelas: { include: { mataKuliah: true } },
        ruangan: true,
        sesiPresensi: {
          where: { statusSesi: 'AKTIF' },
          take: 1,
        },
      },
      orderBy: { jamMulai: 'asc' },
    });

    return Promise.all(
      jadwal.map(async (j) => ({
        id: j.id,
        day: j.hari,
        title: j.kelas.mataKuliah.namaMatkul,
        className: j.kelas.namaKelas,
        time: `${this.formatTime(j.jamMulai)} - ${this.formatTime(j.jamSelesai)}`,
        room: j.ruangan.namaRuangan,
        lecturer: '',
        students: await this.enrollmentsService.countMahasiswaForKelas(
          j.kelas.id,
        ),
        status: j.sesiPresensi.length > 0 ? 'active' : 'upcoming',
      })),
    );
  }

  create(schedule: any) {
    // Jadwal dibuat via Admin module
    return schedule;
  }

  update(id: string, schedule: any) {
    return schedule;
  }

  remove() {
    return { success: true };
  }

  replaceAll() {
    return this.findAll();
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}
