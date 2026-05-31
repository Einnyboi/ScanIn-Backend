import { Injectable } from '@nestjs/common';

export type SupportComplaintDto = {
  id: string;
  name: string;
  identity: string;
  role: 'mahasiswa' | 'pengajar' | 'admin';
  category: string;
  message: string;
  status: 'Baru' | 'Diproses';
  createdAt: string;
};

@Injectable()
export class SupportComplaintsService {
  private complaints: SupportComplaintDto[] = [
    {
      id: 'SC001',
      name: 'Naisya Yuen Ra\'af',
      identity: '535240187',
      role: 'mahasiswa',
      category: 'Absensi',
      message: 'Saya tidak bisa scan QR karena kamera error.',
      status: 'Baru',
      createdAt: new Date('2026-05-19T09:00:00.000Z').toISOString(),
    },
    {
      id: 'SC002',
      name: 'Ahmad Rizki',
      identity: '535240156',
      role: 'mahasiswa',
      category: 'Terlambat',
      message: 'Terlambat karena transportasi umum terlambat.',
      status: 'Diproses',
      createdAt: new Date('2026-05-18T11:30:00.000Z').toISOString(),
    },
  ];

  findAll() {
    return this.complaints;
  }

  replaceAll(complaints: SupportComplaintDto[]) {
    this.complaints = complaints;
    return this.complaints;
  }

  create(complaint: SupportComplaintDto) {
    const exists = this.complaints.some((item) => item.id === complaint.id);

    if (!exists) {
      this.complaints = [complaint, ...this.complaints];
    }

    return complaint;
  }
}
