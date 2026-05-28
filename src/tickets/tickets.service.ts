/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return permohonan.map((p) => this.toTicketDto(p));
  }

  async create(ticket: any) {
    const created = await this.prisma.permohonan.create({
      data: {
        penggunaId: ticket.studentId,
        jenisPermohonan: JenisPermohonan.KELUHAN_ABSENSI,
        deskripsiMasalah: ticket.reason,
        tanggalKelas: new Date(ticket.date),
        status: StatusPermohonan.MENUNGGU_DIPROSES,
      },
      include: {
        pengguna: { select: { id: true, nama: true, username: true } },
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
        pengguna: { select: { id: true, nama: true, username: true } },
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
    return {
      id: p.id,
      studentId: p.penggunaId,
      studentName: p.pengguna?.nama ?? '',
      courseTitle: p.deskripsiMasalah ?? '',
      date: p.tanggalKelas?.toISOString().split('T')[0] ?? '',
      reason: p.deskripsiMasalah ?? '',
      status: this.mapStatusToFrontend(p.status),
      submittedAt: p.createdAt?.toISOString(),
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
