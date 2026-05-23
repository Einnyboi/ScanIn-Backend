import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type EmailStatus = 'SENT' | 'SMTP_NOT_CONFIGURED' | 'FAILED';
type SmtpStatus = 'READY' | 'NOT_CONFIGURED';

export type PasswordResetDto = {
  id: string;
  role: 'mahasiswa' | 'pengajar' | 'admin';
  identity: string;
  name: string;
  registeredEmail: string;
  status: 'Baru' | 'Dikirim';
  createdAt: string;
  sentAt?: string;
  resetUrl?: string;
  emailStatus?: EmailStatus;
};

@Injectable()
export class PasswordResetsService {
  private requests: PasswordResetDto[] = [];
  constructor(private readonly configService: ConfigService) {}

  findAll() {
    return this.requests;
  }

  replaceAll(requests: PasswordResetDto[]) {
    this.requests = requests;
    return this.requests;
  }

  create(request: PasswordResetDto) {
    const exists = this.requests.some((item) => item.id === request.id);

    if (!exists) {
      this.requests = [{ ...request, status: 'Baru' }, ...this.requests];
    }

    return request;
  }

  requestReset(request: PasswordResetDto) {
    return this.create({
      ...request,
      status: 'Baru',
      sentAt: undefined,
      emailStatus: undefined,
      resetUrl: undefined,
    });
  }

  async markAsSent(id: string) {
    const sentAt = new Date().toISOString();
    const request = this.requests.find((item) => item.id === id);
    const delivery = request
      ? await this.sendResetEmail(request)
      : { emailStatus: 'FAILED' as const };

    this.requests = this.requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status: delivery.emailStatus === 'SENT' ? 'Dikirim' : 'Baru',
            sentAt: delivery.emailStatus === 'SENT' ? sentAt : request.sentAt,
            resetUrl: delivery.resetUrl ?? request.resetUrl,
            emailStatus: delivery.emailStatus,
          }
        : request,
    );
    return this.requests.find((request) => request.id === id);
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

  private async sendResetEmail(request: PasswordResetDto): Promise<{
    emailStatus: EmailStatus;
    resetUrl?: string;
  }> {
    const config = this.getSmtpConfig();

    if (!config) {
      return { emailStatus: 'SMTP_NOT_CONFIGURED' };
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://127.0.0.1:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(
      request.id,
    )}`;
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
    const secure =
      this.getCleanEnv('SMTP_SECURE') === 'true' || Number(port) === 465;

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
