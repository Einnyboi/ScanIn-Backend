/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusPermohonan, JenisPermohonan } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const permohonan = await this.prisma.permohonan.findMany({
      include: {
        pengguna: {
          select: {
            id: true,
            nama: true,
            username: true,
            role: true,
            mahasiswa: { select: { nim: true } },
            pengajar: { select: { nip: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return permohonan.map((p) => this.toTicketDto(p));
  }

  async create(ticket: any) {
    const identifier = String(ticket.studentId ?? '').trim();
    const pengguna = await this.prisma.pengguna.findFirst({
      where: {
        OR: [
          { id: identifier },
          { username: identifier },
          { mahasiswa: { is: { nim: identifier } } },
          { pengajar: { is: { nip: identifier } } },
        ],
      },
    });

    if (!pengguna) {
      throw new BadRequestException(
        `Akun dengan identitas ${identifier || '-'} belum terdaftar di backend`,
      );
    }

    const created = await this.prisma.permohonan.create({
      data: {
        penggunaId: pengguna.id,
        jenisPermohonan: JenisPermohonan.KELUHAN_ABSENSI,
        deskripsiMasalah: this.serializeTicketDetails(ticket),
        tanggalKelas: new Date(ticket.date),
        status: StatusPermohonan.MENUNGGU_DIPROSES,
      },
      include: {
        pengguna: {
          select: {
            id: true,
            nama: true,
            username: true,
            mahasiswa: { select: { nim: true } },
            pengajar: { select: { nip: true } },
          },
        },
      },
    });
    return this.toTicketDto(created);
  }

  async update(id: string, ticket: any) {
    const updated = await this.prisma.permohonan.update({
      where: { id },
      data: {
        status: this.mapStatus(ticket.status),
        catatanReview: ticket.reason,
      },
      include: {
        pengguna: {
          select: {
            id: true,
            nama: true,
            username: true,
            mahasiswa: { select: { nim: true } },
            pengajar: { select: { nip: true } },
          },
        },
      },
    });
    return this.toTicketDto(updated);
  }

  async remove(id: string) {
    await this.prisma.permohonan.delete({ where: { id } });
    return { deleted: true, id };
  }

  async replaceAll() {
    // replaceAll dari frontend — skip, tidak aman untuk production
    // Return data dari DB aja
    return this.findAll();
  }

  private toTicketDto(p: any) {
    const details = this.parseTicketDetails(p.deskripsiMasalah);

    return {
      id: p.id,
      studentId:
        p.pengguna?.mahasiswa?.nim ??
        p.pengguna?.pengajar?.nip ??
        p.pengguna?.username ??
        p.penggunaId,
      studentName: p.pengguna?.nama ?? '',
      courseTitle: details.courseTitle,
      date: p.tanggalKelas?.toISOString().split('T')[0] ?? '',
      reason: details.reason,
      status: this.mapStatusToFrontend(p.status),
      submittedAt: p.createdAt?.toISOString(),
    };
  }

  private serializeTicketDetails(ticket: any) {
    return JSON.stringify({
      courseTitle: String(ticket.courseTitle ?? '').trim(),
      reason: String(ticket.reason ?? '').trim(),
    });
  }

  private parseTicketDetails(value: unknown): {
    courseTitle: string;
    reason: string;
  } {
    if (typeof value !== 'string') {
      return { courseTitle: '', reason: '' };
    }

    try {
      const parsed = JSON.parse(value) as {
        courseTitle?: unknown;
        reason?: unknown;
      };

      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.reason === 'string'
      ) {
        return {
          courseTitle:
            typeof parsed.courseTitle === 'string'
              ? parsed.courseTitle
              : 'Koreksi Presensi',
          reason: parsed.reason,
        };
      }
    } catch {
      // Data tiket lama masih menggunakan deskripsi teks biasa.
    }

    return {
      courseTitle: 'Koreksi Presensi',
      reason: value,
    };
  }

  private mapStatus(status: string): StatusPermohonan {
    if (status === 'Disetujui') return StatusPermohonan.SELESAI;
    if (status === 'Ditolak') return StatusPermohonan.DITOLAK;
    return StatusPermohonan.MENUNGGU_DIPROSES;
  }

  private mapStatusToFrontend(status: StatusPermohonan): string {
    if (status === StatusPermohonan.SELESAI) return 'Disetujui';
    if (status === StatusPermohonan.DITOLAK) return 'Ditolak';
    return 'Menunggu';
  }
}
