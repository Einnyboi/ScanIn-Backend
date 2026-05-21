import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type EmailStatus = 'SENT' | 'SMTP_NOT_CONFIGURED' | 'FAILED';

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
      this.requests = [request, ...this.requests];
    }

    return request;
  }

  async requestReset(request: PasswordResetDto) {
    const storedRequest = this.create(request);
    const emailStatus = await this.sendResetEmail(storedRequest);

    this.requests = this.requests.map((item) =>
      item.id === storedRequest.id ? { ...item, emailStatus } : item,
    );

    return { ...storedRequest, emailStatus };
  }

  async markAsSent(id: string) {
    const sentAt = new Date().toISOString();
    const request = this.requests.find((item) => item.id === id);
    const emailStatus = request ? await this.sendResetEmail(request) : 'FAILED';

    this.requests = this.requests.map((request) =>
      request.id === id
        ? { ...request, status: 'Dikirim', sentAt, emailStatus }
        : request,
    );
    return this.requests.find((request) => request.id === id);
  }

  private async sendResetEmail(
    request: PasswordResetDto,
  ): Promise<EmailStatus> {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM') ?? user;

    if (!host || !user || !pass || !from) {
      return 'SMTP_NOT_CONFIGURED';
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://127.0.0.1:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(
      request.id,
    )}`;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    try {
      await transporter.sendMail({
        from,
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

      return 'SENT';
    } catch {
      return 'FAILED';
    }
  }
}
