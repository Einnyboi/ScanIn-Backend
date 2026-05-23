import { Injectable } from '@nestjs/common';

export type CorrectionTicketDto = {
  id: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  lecturer?: string;
  date: string;
  reason: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  submittedAt?: string;
};

@Injectable()
export class TicketsService {
  private tickets: CorrectionTicketDto[] = [];

  findAll() {
    return this.tickets;
  }

  replaceAll(tickets: CorrectionTicketDto[]) {
    this.tickets = tickets.map((ticket) => this.normalizeTicket(ticket));
    return this.tickets;
  }

  create(ticket: CorrectionTicketDto) {
    const nextTicket = this.normalizeTicket(ticket);
    this.tickets = [
      nextTicket,
      ...this.tickets.filter((item) => item.id !== nextTicket.id),
    ];
    return nextTicket;
  }

  update(id: string, ticket: CorrectionTicketDto) {
    const nextTicket = this.normalizeTicket({ ...ticket, id });
    this.tickets = this.tickets.map((item) =>
      item.id === id ? nextTicket : item,
    );
    return nextTicket;
  }

  remove(id: string) {
    this.tickets = this.tickets.filter((ticket) => ticket.id !== id);
    return { deleted: true, id };
  }

  private normalizeTicket(ticket: CorrectionTicketDto): CorrectionTicketDto {
    return {
      ...ticket,
      id: ticket.id.trim(),
      studentId: ticket.studentId.trim(),
      studentName: ticket.studentName.trim(),
      courseTitle: ticket.courseTitle.trim(),
      reason: ticket.reason.trim(),
      date: ticket.date.trim(),
      lecturer: ticket.lecturer?.trim(),
    };
  }
}
