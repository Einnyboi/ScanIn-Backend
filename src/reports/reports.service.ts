import { Injectable } from '@nestjs/common';

export type GeneratedReportDto = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  month: string;
  averageAttendance: number;
  latePercentage: number;
  absentPercentage: number;
  totalSessions: number;
};

@Injectable()
export class ReportsService {
  private reports: GeneratedReportDto[] = [
    {
      id: 'laporan-mei-2026',
      title: 'Laporan Kehadiran Bulanan - Mei 2026',
      description: 'Ringkasan kehadiran semua kelas untuk bulan Mei',
      createdAt: '2026-05-20T08:00:00.000Z',
      month: 'Mei 2026',
      averageAttendance: 84,
      latePercentage: 11,
      absentPercentage: 5,
      totalSessions: 245,
    },
  ];

  findAll() {
    return this.reports;
  }

  replaceAll(reports: GeneratedReportDto[]) {
    this.reports = reports;
    return this.reports;
  }

  create(report: GeneratedReportDto) {
    this.reports = [report, ...this.reports];
    return report;
  }
}
