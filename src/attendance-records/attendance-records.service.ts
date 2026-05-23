import { Injectable } from '@nestjs/common';

export type ScanRecordDto = {
  id: string;
  studentName: string;
  studentId: string;
  courseTitle: string;
  scannedAt: string;
  recordedAt: string;
  method: 'QR Code' | 'Manual';
  status:
    | 'Terverifikasi'
    | 'Terlambat'
    | 'Tidak Hadir'
    | 'Kedaluwarsa'
    | 'Tidak Valid';
};

@Injectable()
export class AttendanceRecordsService {
  private records: ScanRecordDto[] = [];

  findAll() {
    return this.records;
  }

  replaceAll(records: ScanRecordDto[]) {
    this.records = records.map((record) => this.normalizeRecord(record));
    return this.records;
  }

  create(record: ScanRecordDto) {
    const nextRecord = this.normalizeRecord(record);
    this.records = [
      nextRecord,
      ...this.records.filter((item) => item.id !== nextRecord.id),
    ];
    return nextRecord;
  }

  remove(id: string) {
    this.records = this.records.filter((record) => record.id !== id);
    return { deleted: true, id };
  }

  private normalizeRecord(record: ScanRecordDto): ScanRecordDto {
    return {
      ...record,
      id: record.id.trim(),
      studentName: record.studentName.trim(),
      studentId: record.studentId.trim(),
      courseTitle: record.courseTitle.trim(),
    };
  }
}
