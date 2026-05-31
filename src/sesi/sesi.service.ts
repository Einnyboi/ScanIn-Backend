import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BukaSesiDto } from './dto/buka-sesi.dto';
import { Pengguna, StatusSesi, StatusKehadiran, MetodeInput } from '@prisma/client';
import { randomUUID } from 'crypto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Injectable()
export class SesiService {
  constructor(
    private prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
    private enrollmentsService: EnrollmentsService,
  ) {}

  async bukaSesi(dto: BukaSesiDto, pengguna: Pengguna) {
    // 1. Cari pengajar
    const pengajar = await this.prisma.pengajar.findUnique({
      where: { penggunaId: pengguna.id },
    });
    if (!pengajar) throw new ForbiddenException('Hanya pengajar yang bisa membuka sesi')

    // 2. Cari jadwal
    const jadwal = await this.prisma.jadwal.findUnique({
      where: { id: dto.jadwalId },
      include: { kelas: { include: { mataKuliah: true } }, ruangan: true },
    });
    if (!jadwal) throw new NotFoundException('Jadwal tidak ditemukan');

    // 3. Cek apakah sudah ada sesi aktif untuk jadwal ini
    const sesiAktif = await this.prisma.sesiPresensi.findFirst({
      where: { jadwalId: dto.jadwalId, statusSesi: StatusSesi.AKTIF },
    });
    if (sesiAktif) throw new BadRequestException('Sesi presensi untuk jadwal ini sudah aktif');

    // 4. Validasi waktu — boleh buka 30 menit sebelum jam mulai
    const sekarang = new Date();
    const batasBuka = new Date(jadwal.jamMulai);
    batasBuka.setMinutes(batasBuka.getMinutes() - 30);
    if (sekarang < batasBuka) {
      throw new BadRequestException(
        'Belum waktunya membuka sesi. Maksimal 30 menit sebelum jam mulai.',
      );
    }

    // 5. Hitung autoCloseAt = jamSelesai + 15 menit
    const autoCloseAt = new Date(jadwal.jamSelesai);
    autoCloseAt.setMinutes(autoCloseAt.getMinutes() + 15);

    // 6. Generate QR token unik per sesi
    const qrToken = randomUUID();

    // 7. Simpan sesi ke database
    const sesi = await this.prisma.sesiPresensi.create({
      data: {
        jadwalId: dto.jadwalId,
        pengajarId: pengajar.id,
        qrToken,
        waktuBuka: sekarang,
        autoCloseAt,
        statusSesi: StatusSesi.AKTIF,
      },
      include: {
        jadwal: {
          include: {
            kelas: { include: { mataKuliah: true } },
            ruangan: true,
          },
        },
      },
    });

    // 8. Set auto-close timeout
    this.jadwalkanAutoClose(sesi.id, autoCloseAt);

    return sesi;
  }

  async tutupSesi(sesiId: string, pengguna: Pengguna) {
    const sesi = await this.prisma.sesiPresensi.findUnique({
      where: { id: sesiId },
      include: { pengajar: true },
    });
    if (!sesi) throw new NotFoundException('Sesi tidak ditemukan');
    if (sesi.statusSesi !== StatusSesi.AKTIF) {
      throw new BadRequestException('Sesi sudah tidak aktif');
    }

    // Verifikasi pengajar yang buka adalah yang menutup
    const pengajar = await this.prisma.pengajar.findUnique({
      where: { penggunaId: pengguna.id },
    });
    if (!pengajar || sesi.pengajarId !== pengajar.id) {
      throw new ForbiddenException('Kamu tidak berhak menutup sesi ini');
    }

    // Tutup sesi
    const sesiDitutup = await this.prisma.sesiPresensi.update({
      where: { id: sesiId },
      data: { statusSesi: StatusSesi.DITUTUP_MANUAL },
    });

    // Tandai mahasiswa yang belum scan sebagai TIDAK_HADIR
    await this.tandaiTidakHadir(sesiId);

    // Hapus auto-close timeout kalau masih ada
    this.hapusAutoClose(sesiId);

    return sesiDitutup;
  }

  async getSesi(sesiId: string) {
    const sesi = await this.prisma.sesiPresensi.findUnique({
      where: { id: sesiId },
      include: {
        jadwal: {
          include: {
            kelas: { include: { mataKuliah: true } },
            ruangan: true,
          },
        },
        pengajar: { include: { pengguna: true } },
        dataPresensi: {
          include: { mahasiswa: { include: { pengguna: true } } },
        },
      },
    });
    if (!sesi) throw new NotFoundException('Sesi tidak ditemukan');
    return sesi;
  }

  async getSesiAktifByJadwal(jadwalId: string) {
    return this.prisma.sesiPresensi.findFirst({
      where: { jadwalId, statusSesi: StatusSesi.AKTIF },
      include: {
        jadwal: {
          include: {
            kelas: { include: { mataKuliah: true } },
            ruangan: true,
          },
        },
      },
    });
  }

  // Auto-close logic
  private jadwalkanAutoClose(sesiId: string, autoCloseAt: Date) {
    const msHinggaTutup = autoCloseAt.getTime() - Date.now();
    if (msHinggaTutup <= 0) {
      this.autoTutupSesi(sesiId);
      return;
    }

    const timeout = setTimeout(() => {
      this.autoTutupSesi(sesiId);
    }, msHinggaTutup);

    try {
      this.schedulerRegistry.addTimeout(`autoclose-${sesiId}`, timeout);
    } catch {
      // Timeout sudah ada, skip
    }
  }

  private async autoTutupSesi(sesiId: string) {
    const sesi = await this.prisma.sesiPresensi.findUnique({
      where: { id: sesiId },
    });
    if (!sesi || sesi.statusSesi !== StatusSesi.AKTIF) return;

    await this.prisma.sesiPresensi.update({
      where: { id: sesiId },
      data: { statusSesi: StatusSesi.DITUTUP_SISTEM },
    });

    await this.tandaiTidakHadir(sesiId);
    console.log(`[AutoClose] Sesi ${sesiId} ditutup otomatis oleh sistem`);
  }

  private async tandaiTidakHadir(sesiId: string) {
    // Ambil semua mahasiswa yang terdaftar di jadwal sesi ini
    const sesi = await this.prisma.sesiPresensi.findUnique({
      where: { id: sesiId },
      include: {
        jadwal: {
          include: {
            kelas: true,
          },
        },
      },
    });
    if (!sesi) return;

    // Ambil semua presensi yang sudah ada di sesi ini
    const sudahPresensi = await this.prisma.dataPresensi.findMany({
      where: { sesiId },
      select: { mahasiswaId: true },
    });
    const sudahPresensiIds = sudahPresensi.map((p) => p.mahasiswaId);

    const mahasiswaIds = await this.enrollmentsService.getMahasiswaIdsForSesi(
      sesi.jadwal.kelas.id,
    );
    const belumPresensiIds = mahasiswaIds.filter(
      (mahasiswaId) => !sudahPresensiIds.includes(mahasiswaId),
    );

    if (belumPresensiIds.length) {
      await this.prisma.dataPresensi.createMany({
        data: belumPresensiIds.map((mahasiswaId) => ({
          mahasiswaId,
          sesiId,
          statusKehadiran: StatusKehadiran.TIDAK_HADIR,
          metodeInput: MetodeInput.MANUAL,
          waktuAbsen: new Date(),
        })),
        skipDuplicates: true,
      });
    }

    console.log(
      `[TandaiTidakHadir] Sesi ${sesiId} — ${sudahPresensiIds.length} mahasiswa sudah presensi, ${belumPresensiIds.length} ditandai tidak hadir`,
    );
  }

  private hapusAutoClose(sesiId: string) {
    try {
      this.schedulerRegistry.deleteTimeout(`autoclose-${sesiId}`);
    } catch {
      // Timeout tidak ada, skip
    }
  }
}
