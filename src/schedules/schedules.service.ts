import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';

type ScheduleDto = {
  className?: string;
  day?: string;
  lecturer?: string;
  room?: string;
  status?: string;
  students?: number;
  time?: string;
  title?: string;
};

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
        pengajar: { include: { pengguna: true } },
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
        lecturer: j.pengajar?.pengguna?.nama || '',
        students: await this.enrollmentsService.countMahasiswaForKelas(
          j.kelas.id,
        ),
        status: j.sesiPresensi.length > 0 ? 'active' : 'upcoming',
      })),
    );
  }

  async create(schedule: ScheduleDto) {
    this.validateSchedule(schedule);

    const mataKuliah = await this.findOrCreateMataKuliah(schedule.title!);
    const ruangan = await this.findOrCreateRuangan(schedule.room!);
    const kelas = await this.prisma.kelas.create({
      data: {
        idKelas: this.createCode('KEL'),
        namaKelas: schedule.className?.trim() || schedule.title!.trim(),
        mataKuliahId: mataKuliah.id,
      },
    });
    const { jamMulai, jamSelesai } = this.parseTimeRange(
      schedule.time!,
      schedule.day,
    );

    const pengajarId = schedule.lecturer
      ? (await this.findPengajarByName(schedule.lecturer))?.id
      : null;

    const created = await this.prisma.jadwal.create({
      data: {
        idJadwal: this.createCode('JAD'),
        hari: schedule.day?.trim() || this.getDayName(jamMulai),
        jamMulai,
        jamSelesai,
        kelasId: kelas.id,
        ruanganId: ruangan.id,
        ...(pengajarId ? { pengajarId } : {}),
      },
      include: {
        kelas: { include: { mataKuliah: true } },
        ruangan: true,
        pengajar: { include: { pengguna: true } },
        sesiPresensi: { where: { statusSesi: 'AKTIF' }, take: 1 },
      },
    });

    return this.toDto(created as any, 0, schedule.lecturer);
  }

  async update(id: string, schedule: ScheduleDto) {
    const existing = await this.prisma.jadwal.findUnique({
      where: { id },
      include: { kelas: true },
    });
    if (!existing) throw new NotFoundException('Jadwal tidak ditemukan');

    const mataKuliah = schedule.title
      ? await this.findOrCreateMataKuliah(schedule.title)
      : null;
    const ruangan = schedule.room
      ? await this.findOrCreateRuangan(schedule.room)
      : null;
    const parsedTime = schedule.time
      ? this.parseTimeRange(schedule.time, schedule.day ?? existing.hari)
      : null;

    if (mataKuliah || schedule.className) {
      await this.prisma.kelas.update({
        where: { id: existing.kelasId },
        data: {
          ...(mataKuliah ? { mataKuliahId: mataKuliah.id } : {}),
          ...(schedule.className || schedule.title
            ? {
                namaKelas:
                  schedule.className?.trim() ||
                  schedule.title?.trim() ||
                  existing.kelas.namaKelas,
              }
            : {}),
        },
      });
    }

    const pengajarId =
      schedule.lecturer !== undefined
        ? (await this.findPengajarByName(schedule.lecturer))?.id || null
        : undefined;

    const updated = await this.prisma.jadwal.update({
      where: { id },
      data: {
        ...(schedule.day ? { hari: schedule.day.trim() } : {}),
        ...(parsedTime
          ? {
              jamMulai: parsedTime.jamMulai,
              jamSelesai: parsedTime.jamSelesai,
            }
          : {}),
        ...(ruangan ? { ruanganId: ruangan.id } : {}),
        ...(pengajarId !== undefined ? { pengajarId } : {}),
      },
      include: {
        kelas: { include: { mataKuliah: true } },
        ruangan: true,
        pengajar: { include: { pengguna: true } },
        sesiPresensi: { where: { statusSesi: 'AKTIF' }, take: 1 },
      },
    });

    return this.toDto(
      updated as any,
      await this.enrollmentsService.countMahasiswaForKelas(updated.kelas.id),
      updated.pengajar?.pengguna?.nama || schedule.lecturer,
    );
  }

  async remove(id: string) {
    const existing = await this.prisma.jadwal.findUnique({
      where: { id },
      include: { sesiPresensi: { select: { id: true }, take: 1 } },
    });
    if (!existing) throw new NotFoundException('Jadwal tidak ditemukan');
    if (existing.sesiPresensi.length) {
      throw new BadRequestException(
        'Jadwal yang sudah memiliki sesi presensi tidak bisa dihapus.',
      );
    }

    await this.prisma.jadwal.delete({ where: { id } });
    return { deleted: true, id };
  }

  replaceAll() {
    return this.findAll();
  }

  async createMockTestSchedule() {
    const today = new Date();
    const currentDay = this.getDayName(today);

    const mockSchedule: ScheduleDto = {
      title: 'Testing QR Malam (Dev)',
      className: 'TEST-NIGHT-01',
      day: currentDay,
      time: '00:00 - 23:59',
      room: 'Lab Virtual',
      lecturer: 'Dosen Tester',
    };

    return this.create(mockSchedule);
  }

  private formatTime(date: Date): string {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private async findPengajarByName(name: string) {
    const normalized = name.trim();
    if (!normalized) return null;
    return this.prisma.pengajar.findFirst({
      where: {
        pengguna: { nama: { equals: normalized, mode: 'insensitive' } },
      },
    });
  }

  private async findOrCreateMataKuliah(title: string) {
    const normalizedTitle = title.trim();
    const existing = await this.prisma.mataKuliah.findFirst({
      where: { namaMatkul: { equals: normalizedTitle, mode: 'insensitive' } },
    });
    if (existing) return existing;

    const code = this.createCode('MK');
    return this.prisma.mataKuliah.create({
      data: {
        idMatkul: code,
        kodeMatkul: code,
        namaMatkul: normalizedTitle,
        sks: 3,
      },
    });
  }

  private async findOrCreateRuangan(room: string) {
    const normalizedRoom = room.trim();
    const existing = await this.prisma.ruangan.findFirst({
      where: { namaRuangan: { equals: normalizedRoom, mode: 'insensitive' } },
    });
    if (existing) return existing;

    return this.prisma.ruangan.create({
      data: {
        idRuangan: this.createCode('R'),
        namaRuangan: normalizedRoom,
      },
    });
  }

  private parseTimeRange(time: string, day?: string) {
    const [start, end] = time.split(' - ').map((part) => part.trim());
    if (!start || !end) {
      throw new BadRequestException('Format jam harus seperti 08:00 - 10:00');
    }

    return {
      jamMulai: this.createDateForDayAndTime(day, start),
      jamSelesai: this.createDateForDayAndTime(day, end),
    };
  }

  private createDateForDayAndTime(day: string | undefined, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new BadRequestException('Jam tidak valid');
    }

    const date = new Date();
    const targetDayIndex = this.getDayIndex(day);
    if (targetDayIndex != null) {
      const currentDayIndex = date.getDay();
      const daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7;
      date.setDate(date.getDate() + daysUntilTarget);
    }
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private getDayIndex(day?: string) {
    if (!day) return null;
    const days: Record<string, number> = {
      minggu: 0,
      senin: 1,
      selasa: 2,
      rabu: 3,
      kamis: 4,
      jumat: 5,
      sabtu: 6,
    };
    return days[day.trim().toLowerCase()] ?? null;
  }

  private getDayName(date: Date) {
    return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][
      date.getDay()
    ];
  }

  private validateSchedule(schedule: ScheduleDto) {
    if (!schedule.title?.trim()) {
      throw new BadRequestException('Mata kuliah wajib diisi');
    }
    if (!schedule.time?.trim()) {
      throw new BadRequestException('Jam wajib diisi');
    }
    if (!schedule.room?.trim()) {
      throw new BadRequestException('Ruangan wajib diisi');
    }
  }

  private async toDto(
    jadwal: Awaited<ReturnType<PrismaService['jadwal']['findMany']>>[number] & {
      kelas: {
        id: string;
        namaKelas: string;
        mataKuliah: { namaMatkul: string };
      };
      ruangan: { namaRuangan: string };
      pengajar?: { pengguna: { nama: string } } | null;
      sesiPresensi: Array<{ id: string }>;
    },
    students?: number,
    lecturer = '',
  ) {
    const studentCount =
      students ??
      (await this.enrollmentsService.countMahasiswaForKelas(jadwal.kelas.id));

    return {
      id: jadwal.id,
      day: jadwal.hari,
      title: jadwal.kelas.mataKuliah.namaMatkul,
      className: jadwal.kelas.namaKelas,
      time: `${this.formatTime(jadwal.jamMulai)} - ${this.formatTime(jadwal.jamSelesai)}`,
      room: jadwal.ruangan.namaRuangan,
      lecturer: lecturer || jadwal.pengajar?.pengguna?.nama || '',
      students: studentCount,
      status: jadwal.sesiPresensi.length > 0 ? 'active' : 'upcoming',
    };
  }

  private createCode(prefix: string) {
    return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
}
