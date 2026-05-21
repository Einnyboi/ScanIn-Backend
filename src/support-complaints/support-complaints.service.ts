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
  private complaints: SupportComplaintDto[] = [];

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
