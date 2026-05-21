import { Injectable } from '@nestjs/common';

export type AdminUserRole = 'Mahasiswa' | 'Pengajar' | 'Admin';

export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: 'Aktif' | 'Nonaktif';
};

@Injectable()
export class AdminUsersService {
  private users: AdminUserDto[] = [];

  findAll() {
    return this.users;
  }

  replaceAll(users: AdminUserDto[]) {
    this.users = users.map((user) => this.normalizeUser(user));
    return this.users;
  }

  create(user: AdminUserDto) {
    const nextUser = this.normalizeUser(user);
    this.users = [
      nextUser,
      ...this.users.filter(
        (item) => this.getKey(item) !== this.getKey(nextUser),
      ),
    ];
    return nextUser;
  }

  update(role: AdminUserRole, id: string, user: AdminUserDto) {
    const key = `${role}:${id}`;
    const nextUser = this.normalizeUser({ ...user, id, role });
    this.users = this.users.map((item) =>
      this.getKey(item) === key ? nextUser : item,
    );
    return nextUser;
  }

  remove(role: AdminUserRole, id: string) {
    const key = `${role}:${id}`;
    this.users = this.users.filter((item) => this.getKey(item) !== key);
    return { deleted: true, id, role };
  }

  private normalizeUser(user: AdminUserDto): AdminUserDto {
    return {
      id: user.id.trim(),
      name: user.name.trim(),
      email: user.email.trim().toLowerCase(),
      role: user.role,
      status: user.status,
    };
  }

  private getKey(user: Pick<AdminUserDto, 'id' | 'role'>) {
    return `${user.role}:${user.id}`;
  }
}
