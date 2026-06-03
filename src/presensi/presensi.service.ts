import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScanQrDto } from './dto/scan-qr.dto';
import { UploadBuktiDto } from './dto/upload-bukti.dto';
import { PresensiManualDto } from './dto/presensi-manual.dto';
import {
  Pengguna,
  StatusSesi,
  StatusKehadiran,
  MetodeInput,
} from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { EnrollmentsService } from '../enrollments/enrollments.service';

const BATAS_HADIR_MENIT = 30;

@Injectable()
export class PresensiService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  // ==================== SCAN QR ====================
  async scanQr(dto: ScanQrDto, pengguna: Pengguna) {
    // 1. Verifikasi mahasiswa
    const mahasiswa = await this.prisma.mahasiswa.findUnique({
      where: { penggunaId: pengguna.id },
    });
    if (!mahasiswa) {
      throw new ForbiddenException('Hanya mahasiswa yang bisa scan QR');
    }

    // 2. Decode QR token — cek sub sama dengan mahasiswa yang scan
    let decoded: any;
    try {
      decoded = this.jwt.verify(dto.qrToken);
    } catch {
      throw new BadRequestException(
        'QR Code tidak valid atau sudah kedaluwarsa',
      );
    }

    if (decoded.sub !== pengguna.id) {
      throw new ForbiddenException('QR Code bukan milik kamu');
    }

    if (decoded.type !== 'QR_PRESENSI') {
      throw new BadRequestException('QR Code tidak valid');
    }

    // 3. Cek sesi aktif
    const sesi = await this.prisma.sesiPresensi.findUnique({
      where: { id: dto.sesiId },
      include: { jadwal: { include: { kelas: true } } },
    });
    if (!sesi) throw new NotFoundException('Sesi tidak ditemukan');
    if (sesi.statusSesi !== StatusSesi.AKTIF) {
      throw new BadRequestException('Sesi presensi sudah tidak aktif');
    }

    const terdaftar = await this.enrollmentsService.isMahasiswaTerdaftarDiKelas(
      mahasiswa.id,
      sesi.jadwal.kelas.id,
    );
    if (!terdaftar) {
      throw new ForbiddenException('Mahasiswa tidak terdaftar di kelas ini');
    }

    // 4. Cek apakah sudah presensi di sesi ini
    const sudahPresensi = await this.prisma.dataPresensi.findUnique({
      where: {
        mahasiswaId_sesiId: {
          mahasiswaId: mahasiswa.id,
          sesiId: dto.sesiId,
        },
      },
    });
    if (sudahPresensi) {
      throw new BadRequestException(
        'Kamu sudah melakukan presensi di sesi ini',
      );
    }

    // 5. Tentukan status HADIR atau TERLAMBAT
    const sekarang = new Date();
    const selisihMenit =
      (sekarang.getTime() - sesi.waktuBuka.getTime()) / 1000 / 60;
    const status =
      selisihMenit <= BATAS_HADIR_MENIT
        ? StatusKehadiran.HADIR
        : StatusKehadiran.TERLAMBAT;

    // 6. Simpan presensi
    const presensi = await this.prisma.dataPresensi.create({
      data: {
        mahasiswaId: mahasiswa.id,
        sesiId: dto.sesiId,
        statusKehadiran: status,
        metodeInput: MetodeInput.QR,
        waktuAbsen: sekarang,
      },
      include: {
        mahasiswa: { include: { pengguna: true } },
        sesiPresensi: true,
      },
    });

    return {
      pesan: status === StatusKehadiran.HADIR
        ? 'Presensi berhasil — HADIR'
        : 'Presensi berhasil — TERLAMBAT',
      status,
      waktuAbsen: sekarang,
      presensi,
    };
  }

  // ==================== UPLOAD BUKTI KELAS SORE ====================
  async uploadBukti(
    dto: UploadBuktiDto,
    pengguna: Pengguna,
    file: Express.Multer.File,
  ) {
    // 1. Verifikasi mahasiswa
    const mahasiswa = await this.prisma.mahasiswa.findUnique({
      where: { penggunaId: pengguna.id },
    });
    if (!mahasiswa)
      throw new ForbiddenException('Hanya mahasiswa yang bisa upload bukti');

    // 2. Cek sesi aktif
    const sesi = await this.prisma.sesiPresensi.findUnique({
      where: { id: dto.sesiId },
      include: { jadwal: { include: { kelas: true } } },
    });
    if (!sesi) throw new NotFoundException('Sesi tidak ditemukan');
    if (sesi.statusSesi !== StatusSesi.AKTIF) {
      throw new BadRequestException('Sesi presensi sudah tidak aktif');
    }

    const terdaftar = await this.enrollmentsService.isMahasiswaTerdaftarDiKelas(
      mahasiswa.id,
      sesi.jadwal.kelas.id,
    );
    if (!terdaftar) {
      throw new ForbiddenException('Mahasiswa tidak terdaftar di kelas ini');
    }

    // 3. Cek sudah presensi belum
    const sudahPresensi = await this.prisma.dataPresensi.findUnique({
      where: {
        mahasiswaId_sesiId: {
          mahasiswaId: mahasiswa.id,
          sesiId: dto.sesiId,
        },
      },
    });
    if (sudahPresensi) {
      throw new BadRequestException('Kamu sudah melakukan presensi di sesi ini')
    }

    // 4. Simpan file path
    if (!file?.filename) {
      throw new BadRequestException('File bukti tidak valid');
    }

    const filePath = `/uploads/${file.filename}`;

    // 5. Simpan presensi dengan status MENUNGGU_VALIDASI
    const presensi = await this.prisma.dataPresensi.create({
      data: {
        mahasiswaId: mahasiswa.id,
        sesiId: dto.sesiId,
        statusKehadiran: StatusKehadiran.MENUNGGU_VALIDASI,
        metodeInput: MetodeInput.UPLOAD,
        waktuAbsen: new Date(),
        fileBukti: filePath,
        geoLat: dto.geoLat,
        geoLng: dto.geoLng,
      },
    });

    return {
      pesan: 'Upload berhasil. Menunggu validasi dari pengajar.',
      presensi,
    };
  }

  // ==================== VALIDASI BUKTI (Pengajar) ====================
  async validasiBukti(
    presensiId: string,
    aksi: 'SETUJUI' | 'TOLAK',
    pengguna: Pengguna,
    alasan?: string,
  ) {
    const presensi = await this.prisma.dataPresensi.findUnique({
      where: { id: presensiId },
    });
    if (!presensi) throw new NotFoundException('Data presensi tidak ditemukan');
    if (presensi.statusKehadiran !== StatusKehadiran.MENUNGGU_VALIDASI) {
      throw new BadRequestException('Presensi ini sudah divalidasi');
    }

    const status =
      aksi === 'SETUJUI' ? StatusKehadiran.HADIR : StatusKehadiran.DITOLAK;

    return this.prisma.dataPresensi.update({
      where: { id: presensiId },
      data: { statusKehadiran: status },
    });
  }

  // ==================== PRESENSI MANUAL ====================
  async presensiManual(dto: PresensiManualDto, pengguna: Pengguna) {
    // 1. Verifikasi pengajar
    const pengajar = await this.prisma.pengajar.findUnique({
      where: { penggunaId: pengguna.id },
    });
    if (!pengajar)
      throw new ForbiddenException(
        'Hanya pengajar yang bisa input presensi manual',
      );

    // 2. Validasi minimal 1 mahasiswa
    if (!dto.daftarHadir || dto.daftarHadir.length === 0) {
      throw new BadRequestException('Pilih minimal satu mahasiswa');
    }

    // 3. Cek sesi
    const sesi = await this.prisma.sesiPresensi.findUnique({
      where: { id: dto.sesiId },
      include: { jadwal: { include: { kelas: true } } },
    });
    if (!sesi) throw new NotFoundException('Sesi tidak ditemukan');
    if (sesi.statusSesi !== StatusSesi.AKTIF) {
      throw new BadRequestException('Sesi presensi sudah tidak aktif');
    }

    const resolvedItems = [] as Array<{ mahasiswaId: string; status: StatusKehadiran }>;

    for (const item of dto.daftarHadir) {
      const mahasiswa = await this.enrollmentsService.resolveMahasiswaByIdentifier(
        item.mahasiswaId,
      );
      if (!mahasiswa) {
        throw new NotFoundException(
          `Mahasiswa ${item.mahasiswaId} tidak ditemukan`,
        );
      }

      const terdaftar = await this.enrollmentsService.isMahasiswaTerdaftarDiKelas(
        mahasiswa.id,
        sesi.jadwal.kelas.id,
      );
      if (!terdaftar) {
        throw new ForbiddenException(
          `Mahasiswa ${mahasiswa.nim} tidak terdaftar di kelas ini`,
        );
      }

      resolvedItems.push({ mahasiswaId: mahasiswa.id, status: item.status });
    }

    // 4. Upsert presensi manual untuk setiap mahasiswa
    const hasil = await Promise.all(
      resolvedItems.map((item) =>
        this.prisma.dataPresensi.upsert({
          where: {
            mahasiswaId_sesiId: {
              mahasiswaId: item.mahasiswaId,
              sesiId: dto.sesiId,
            },
          },
          update: {
            statusKehadiran: item.status,
            metodeInput: MetodeInput.MANUAL,
            waktuAbsen: new Date(),
          },
          create: {
            mahasiswaId: item.mahasiswaId,
            sesiId: dto.sesiId,
            statusKehadiran: item.status,
            metodeInput: MetodeInput.MANUAL,
            waktuAbsen: new Date(),
          },
        }),
      ),
    );

    return {
      pesan: `Presensi manual berhasil disimpan untuk ${hasil.length} mahasiswa`,
      data: hasil,
    };
  }

  // ==================== GET PRESENSI SESI ====================
  async getPresensiSesi(sesiId: string) {
    return this.prisma.dataPresensi.findMany({
      where: { sesiId },
      include: {
        mahasiswa: { include: { pengguna: true } },
      },
      orderBy: { waktuAbsen: 'asc' },
    });
  }

  // ==================== GET PRESENSI MAHASISWA ====================
  async getPresensiMahasiswa(pengguna: Pengguna) {
    const mahasiswa = await this.prisma.mahasiswa.findUnique({
      where: { penggunaId: pengguna.id },
    });
    if (!mahasiswa) throw new NotFoundException('Data mahasiswa tidak ditemukan');

    return this.prisma.dataPresensi.findMany({
      where: { mahasiswaId: mahasiswa.id },
      include: {
        sesiPresensi: {
          include: {
            jadwal: {
              include: {
                kelas: { include: { mataKuliah: true } },
              },
            },
          },
        },
      },
      orderBy: { waktuAbsen: 'desc' },
    });
  }
}
