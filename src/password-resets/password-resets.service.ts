import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

type EmailStatus = 'SENT' | 'SMTP_NOT_CONFIGURED' | 'FAILED';
type SmtpStatus = 'READY' | 'NOT_CONFIGURED';

@Injectable()
export class PasswordResetsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return (this.prisma as any).passwordReset.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async replaceAll(requests: any[]) {
    // Replace all: delete existing and create new (careful in production)
    await (this.prisma as any).passwordReset.deleteMany();
    const created = await Promise.all(
      requests.map((r) => (this.prisma as any).passwordReset.create({ data: { ...r } as any })),
    );
    return created;
  }

  async create(request: any) {
    const exists = await (this.prisma as any).passwordReset.findUnique({ where: { id: request.id } });

    if (!exists) {
      return (this.prisma as any).passwordReset.create({ data: { ...request, status: 'Baru' } as any });
    }

    return exists;
  }

  async requestReset(request: any) {
    return this.create({
      ...request,
      status: 'Baru',
      sentAt: undefined,
      emailStatus: undefined,
      resetUrl: undefined,
    });
  }

  async markAsSent(id: string) {
    const sentAt = new Date();
    const request = await (this.prisma as any).passwordReset.findUnique({ where: { id } });
    if (!request) {
      return null;
    }

    const delivery = await this.sendResetEmail(request as any);

    const updated = await (this.prisma as any).passwordReset.update({
      where: { id },
      data: {
        status: delivery.emailStatus === 'SENT' ? 'Dikirim' : 'Baru',
        sentAt: delivery.emailStatus === 'SENT' ? sentAt : request.sentAt,
        resetUrl: delivery.resetUrl ?? request.resetUrl,
        emailStatus: delivery.emailStatus,
      },
    });

    return updated;
  }

  async completeReset(id: string, password: string) {
    const request = await (this.prisma as any).passwordReset.findUnique({ where: { id } });

    if (!request) throw new NotFoundException('Password reset request not found');

    if (request.usedAt) throw new BadRequestException('Reset token already used');

    if (!password) throw new BadRequestException('Password baru tidak boleh kosong.');

    const pengguna = await this.prisma.pengguna.findUnique({ where: { username: request.registeredEmail } });

    if (!pengguna) throw new NotFoundException('Associated user not found');

    const hashed = await bcrypt.hash(password, 10);

    await this.prisma.pengguna.update({ where: { id: pengguna.id }, data: { password: hashed } });

    const usedAt = new Date();
    const updated = await (this.prisma as any).passwordReset.update({ where: { id }, data: { usedAt } });

    return { success: true, updated };
  }

  getSmtpStatus() {
    const config = this.getSmtpConfig();

    return {
      status: config ? ('READY' as SmtpStatus) : ('NOT_CONFIGURED' as SmtpStatus),
      host: config?.host ?? null,
      port: config?.port ?? null,
      from: config?.from ?? null,
    };
  }

  private async sendResetEmail(request: any): Promise<{
    emailStatus: EmailStatus;
    resetUrl?: string;
  }> {
    const config = this.getSmtpConfig();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://127.0.0.1:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(request.id)}`;

    if (!config) {
      // Return resetUrl so admin can copy it even when SMTP not configured
      return { emailStatus: 'SMTP_NOT_CONFIGURED', resetUrl };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    try {
      await transporter.sendMail({
        from: config.from,
        to: request.registeredEmail,
        subject: 'Reset Password ScanIn FTI UNTAR',
        text: [
          `Halo ${request.name},`,
          '',
          'Admin menerima permintaan reset password akun ScanIn kamu.',
          `Buka link ini untuk reset password: ${resetUrl}`,
          '',
          'Jika kamu tidak meminta reset password, abaikan email ini.',
        ].join('\n'),
        html: `
          <p>Halo <strong>${request.name}</strong>,</p>
          <p>Admin menerima permintaan reset password akun ScanIn kamu.</p>
          <p><a href="${resetUrl}">Klik di sini untuk reset password</a>.</p>
          <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
        `,
      });

      return { emailStatus: 'SENT', resetUrl };
    } catch (error) {
      console.error('Failed to send reset password email', error);
      return { emailStatus: 'FAILED', resetUrl };
    }
  }

  private getSmtpConfig() {
    const service = this.getCleanEnv('SMTP_SERVICE')?.toLowerCase();
    const user = this.getCleanEnv('SMTP_USER');
    const pass = this.getCleanEnv('SMTP_PASS');
    const host = this.getCleanEnv('SMTP_HOST') ?? this.getServiceHost(service);
    const port = Number(this.getCleanEnv('SMTP_PORT') ?? 587);
    const from = this.getCleanEnv('SMTP_FROM') ?? user;
    const secure = this.getCleanEnv('SMTP_SECURE') === 'true' || Number(port) === 465;

    if (!host || !user || !pass || !from) {
      return null;
    }

    return {
      host,
      port,
      secure,
      user,
      pass,
      from,
    };
  }

  private getServiceHost(service?: string) {
    if (service === 'gmail') return 'smtp.gmail.com';
    if (service === 'outlook' || service === 'office365') {
      return 'smtp.office365.com';
    }

    return undefined;
  }

  private getCleanEnv(key: string) {
    const value = this.configService.get<string>(key)?.trim();

    if (!value || value.startsWith('isi_') || value.includes('your_')) {
      return undefined;
    }

    return value;
  }
}
