import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(
    mataKuliahId?: string,
    kelasId?: string,
    pengajarId?: string,
  ) {
    const where: any = {};
    if (mataKuliahId) {
      where.kelas = { mataKuliahId };
    }
    if (kelasId) {
      where.kelasId = kelasId;
    }
    if (pengajarId) {
      where.pengajarId = pengajarId;
    }

    const jadwals = await this.prisma.jadwal.findMany({
      where,
      include: {
        kelas: { include: { mataKuliah: true } },
        pengajar: { include: { pengguna: true } },
        sesiPresensi: {
          include: { dataPresensi: true },
        },
      },
    });

    const reportPerMatkul = new Map<string, any>();

    for (const jadwal of jadwals) {
      const matkulId = jadwal.kelas.mataKuliah.idMatkul;
      if (!reportPerMatkul.has(matkulId)) {
        reportPerMatkul.set(matkulId, {
          mataKuliah: jadwal.kelas.mataKuliah.namaMatkul,
          kode: jadwal.kelas.mataKuliah.kodeMatkul,
          dosen: jadwal.pengajar?.pengguna?.nama || '-',
          kelas: new Set<string>(),
          totalSesi: 0,
          totalHadir: 0,
          totalTerlambat: 0,
          totalTidakHadir: 0,
          totalPresensi: 0,
        });
      }

      const report = reportPerMatkul.get(matkulId)!;
      report.kelas.add(jadwal.kelas.namaKelas);

      for (const sesi of jadwal.sesiPresensi) {
        report.totalSesi++;
        for (const presensi of sesi.dataPresensi) {
          report.totalPresensi++;
          if (presensi.statusKehadiran === 'HADIR') report.totalHadir++;
          else if (presensi.statusKehadiran === 'TERLAMBAT')
            report.totalTerlambat++;
          else report.totalTidakHadir++; // Alpa, sakit, izin, belum ada keterangan
        }
      }
    }

    return Array.from(reportPerMatkul.values()).map((r) => ({
      ...r,
      kelas: Array.from(r.kelas).join(', '),
      averageAttendance:
        r.totalPresensi > 0
          ? Math.round(
              ((r.totalHadir + r.totalTerlambat) / r.totalPresensi) * 100,
            )
          : 0,
    }));
  }
}
