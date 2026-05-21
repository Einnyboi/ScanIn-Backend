import { Injectable } from '@nestjs/common';

export type ScheduleDto = {
  id: string;
  day?: string;
  title: string;
  time: string;
  room: string;
  lecturer: string;
  students: number;
  status: 'active' | 'upcoming' | 'closed';
};

@Injectable()
export class SchedulesService {
  private schedules: ScheduleDto[] = [
    {
      id: 'software-development',
      day: 'Senin',
      title: 'Software Development',
      time: '08:00 - 10:00',
      room: 'Lab. Pemrograman 905',
      lecturer: 'Lina, S.T., M.Kom., Ph.D.',
      students: 38,
      status: 'active',
    },
    {
      id: 'pemrograman-web',
      day: 'Senin',
      title: 'Pemrograman Web',
      time: '10:30 - 12:30',
      room: 'R-705',
      lecturer: 'Novario Jaya Perdana, S.Kom., M.T.',
      students: 48,
      status: 'upcoming',
    },
    {
      id: 'kecerdasan-buatan',
      day: 'Rabu',
      title: 'Kecerdasan Buatan',
      time: '13:00 - 15:00',
      room: 'R-805',
      lecturer: 'Lely Hiryanto, S.T., M.Sc., Ph.D.',
      students: 25,
      status: 'upcoming',
    },
  ];

  findAll() {
    return this.schedules;
  }

  replaceAll(schedules: ScheduleDto[]) {
    this.schedules = schedules;
    return this.schedules;
  }

  create(schedule: ScheduleDto) {
    this.schedules = [schedule, ...this.schedules];
    return schedule;
  }

  update(id: string, schedule: ScheduleDto) {
    this.schedules = this.schedules.map((currentSchedule) =>
      currentSchedule.id === id ? { ...schedule, id } : currentSchedule,
    );
    return this.schedules.find((currentSchedule) => currentSchedule.id === id);
  }

  remove(id: string) {
    this.schedules = this.schedules.filter((schedule) => schedule.id !== id);
    return { success: true };
  }
}
