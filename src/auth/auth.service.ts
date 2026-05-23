import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const pengguna = await this.users.create(dto);
    return this.signToken(pengguna.id, pengguna.username, pengguna.role);
  }

  async login(dto: LoginDto) {
    const pengguna = await this.users.findByUsername(dto.username);
    if (!pengguna)
      throw new UnauthorizedException('Username atau password salah');

    if (!pengguna.isAktif)
      throw new UnauthorizedException('Akun dinonaktifkan, hubungi Admin');

    const valid = await bcrypt.compare(dto.password, pengguna.password);
    if (!valid) throw new UnauthorizedException('Username atau password salah');

    return this.signToken(pengguna.id, pengguna.username, pengguna.role);
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    const { password: omittedPassword, ...result } = user;
    void omittedPassword;
    return result;
  }

  private signToken(userId: string, username: string, role: string) {
    return {
      access_token: this.jwt.sign({ sub: userId, username, role }),
      role,
    };
  }
}
