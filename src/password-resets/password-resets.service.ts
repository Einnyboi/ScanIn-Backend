import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';

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
  otpExpiresAt?: string;
  emailStatus?: EmailStatus;
  emailError?: string;
};

export type ResetPasswordDto = {
  otp: string;
  password: string;
};

@Injectable()
export class PasswordResetsService {
  private requests: PasswordResetDto[] = [];
  private otpHashes = new Map<
    string,
    { hash: string; expiresAt: Date; email: string }
  >();

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

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
      otpExpiresAt: undefined,
    });
  }

  async markAsSent(id: string, fallbackRequest?: PasswordResetDto) {
    const sentAt = new Date().toISOString();
    let request = this.requests.find((item) => item.id === id);

    if (!request && fallbackRequest) {
      request = this.create({
        ...fallbackRequest,
        id,
        status: 'Baru',
        sentAt: undefined,
        emailStatus: undefined,
        emailError: undefined,
        resetUrl: undefined,
        otpExpiresAt: undefined,
      });
    }

    const delivery = request
      ? await this.sendResetEmail(request)
      : {
          emailStatus: 'FAILED' as const,
          emailError: 'Permintaan reset tidak ditemukan di backend.',
        };

    this.requests = this.requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status: delivery.emailStatus === 'SENT' ? 'Dikirim' : 'Baru',
            sentAt: delivery.emailStatus === 'SENT' ? sentAt : request.sentAt,
            resetUrl: delivery.resetUrl ?? request.resetUrl,
            otpExpiresAt: delivery.otpExpiresAt ?? request.otpExpiresAt,
            emailStatus: delivery.emailStatus,
            emailError:
              delivery.emailStatus === 'SENT'
                ? undefined
                : (delivery.emailError ?? request.emailError),
          }
        : request,
    );
    return this.requests.find((request) => request.id === id);
  }

  async resetPassword(id: string, dto: ResetPasswordDto) {
    const request = this.requests.find((item) => item.id === id);
    const otpRecord = this.otpHashes.get(id);

    if (!request || !otpRecord) {
      throw new BadRequestException('Kode OTP tidak valid atau belum dikirim.');
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      this.otpHashes.delete(id);
      throw new BadRequestException('Kode OTP sudah kedaluwarsa.');
    }

    const isOtpValid = await bcrypt.compare(dto.otp.trim(), otpRecord.hash);

    if (!isOtpValid) {
      throw new BadRequestException('Kode OTP salah.');
    }

    if (!this.isStrongPassword(dto.password)) {
      throw new BadRequestException(
        'Password minimal 8 karakter dan wajib berisi huruf besar, huruf kecil, serta simbol.',
      );
    }

    try {
      await this.usersService.updatePasswordByEmail(
        otpRecord.email,
        dto.password,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BadRequestException(
          'Akun belum ditemukan di database backend. Pastikan data pengguna sudah dibuat admin.',
        );
      }

      throw error;
    }

    this.otpHashes.delete(id);
    this.requests = this.requests.filter((request) => request.id !== id);

    return { success: true };
  }

  getSmtpStatus() {
    const smtp = this.getSmtpConfigWithDiagnostics();
    const config = smtp.config;

    return {
      status: config
        ? ('READY' as SmtpStatus)
        : ('NOT_CONFIGURED' as SmtpStatus),
      host: config?.host ?? null,
      port: config?.port ?? null,
      from: config?.from ?? null,
      missing: smtp.missing,
    };
  }

  private async sendResetEmail(request: PasswordResetDto): Promise<{
    emailStatus: EmailStatus;
    emailError?: string;
    resetUrl?: string;
    otpExpiresAt?: string;
  }> {
    const smtp = this.getSmtpConfigWithDiagnostics();
    const config = smtp.config;

    if (!config) {
      return {
        emailStatus: 'SMTP_NOT_CONFIGURED',
        emailError: smtp.missing.length
          ? `Konfigurasi SMTP belum lengkap: ${smtp.missing.join(', ')}.`
          : 'Konfigurasi SMTP belum lengkap.',
      };
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://127.0.0.1:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(
      request.id,
    )}`;
    const otp = this.createOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

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
        subject: 'Kode OTP Reset Password ScanIn FTI UNTAR',
        text: [
          `Yth. ${request.name},`,
          '',
          'Admin Fakultas Teknologi Informasi UNTAR telah menyetujui permintaan reset password akun ScanIn Anda.',
          `Kode OTP reset password Anda: ${otp}`,
          `Kode berlaku sampai: ${otpExpiresAt.toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
          })}`,
          '',
          `Buka halaman ini untuk membuat password baru: ${resetUrl}`,
          '',
          'Demi keamanan akun, jangan membagikan kode OTP ini kepada pihak mana pun.',
          'Apabila Anda tidak mengajukan permintaan reset password, abaikan email ini atau hubungi Admin Fakultas Teknologi Informasi UNTAR.',
          '',
          'Hormat kami,',
          'Admin Fakultas Teknologi Informasi UNTAR',
        ].join('\n'),
        html: `
          <div style="margin:0; padding:0; background:#f6f7fb; font-family: Inter, Arial, sans-serif; color:#111827; line-height:1.6;">
            <div style="max-width:640px; margin:0 auto; padding:32px 20px;">
              <div style="background:#5c3386; border-radius:14px 14px 0 0; padding:24px 28px; color:white;">
                <p style="margin:0; font-size:13px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase;">ScanIn FTI UNTAR</p>
                <h1 style="margin:8px 0 0; font-size:24px; line-height:1.25;">Reset Password Akun</h1>
              </div>
              <div style="background:white; border:1px solid #e5e7eb; border-top:0; border-radius:0 0 14px 14px; padding:28px;">
                <p>Yth. <strong>${request.name}</strong>,</p>
                <p>Admin Fakultas Teknologi Informasi UNTAR telah menyetujui permintaan reset password akun ScanIn Anda.</p>
                <div style="margin:24px 0; padding:22px; border-radius:12px; background:#f3eef9; text-align:center; border:1px solid #dfd2ee;">
                  <p style="margin:0 0 8px; color:#5c3386; font-size:13px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase;">Kode OTP Reset Password</p>
                  <p style="margin:0; color:#5c3386; font-size:34px; font-weight:900; letter-spacing:8px;">${otp}</p>
                  <p style="margin:8px 0 0; color:#6b7280; font-size:13px;">Kode berlaku selama 10 menit.</p>
                </div>
                <p>Silakan tekan tombol berikut untuk membuka halaman pembuatan password baru.</p>
                <p style="margin:22px 0;"><a href="${resetUrl}" style="display:inline-block; padding:12px 18px; border-radius:8px; background:#5c3386; color:white; text-decoration:none; font-weight:800;">Buat Password Baru</a></p>
                <p style="margin-bottom:8px;">Jika tombol tidak dapat dibuka, salin tautan berikut ke browser:</p>
                <p style="word-break:break-all; color:#5c3386; font-size:13px;">${resetUrl}</p>
                <div style="margin-top:24px; padding:14px 16px; border-radius:10px; background:#fff7ed; color:#7c2d12; font-size:13px;">
                  Demi keamanan akun, jangan membagikan kode OTP ini kepada pihak mana pun.
                </div>
                <p style="margin-top:24px;">Apabila Anda tidak mengajukan permintaan reset password, abaikan email ini atau hubungi Admin Fakultas Teknologi Informasi UNTAR.</p>
                <p style="margin-top:24px;">Hormat kami,<br /><strong>Admin Fakultas Teknologi Informasi UNTAR</strong></p>
              </div>
            </div>
          </div>
        `,
      });

      this.otpHashes.set(request.id, {
        hash: await bcrypt.hash(otp, 10),
        expiresAt: otpExpiresAt,
        email: request.registeredEmail.trim().toLowerCase(),
      });

      return {
        emailStatus: 'SENT',
        resetUrl,
        otpExpiresAt: otpExpiresAt.toISOString(),
      };
    } catch (error) {
      const emailError = this.getErrorMessage(error);
      console.error('Failed to send reset password email', error);
      return { emailStatus: 'FAILED', resetUrl, emailError };
    }
  }

  private getSmtpConfig() {
    return this.getSmtpConfigWithDiagnostics().config;
  }

  private getSmtpConfigWithDiagnostics(): {
    config: null | {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
      from: string;
    };
    missing: string[];
  } {
    const service = this.getFirstCleanEnv([
      'SMTP_SERVICE',
      'MAIL_SERVICE',
      'EMAIL_SERVICE',
    ])?.toLowerCase();
    const user = this.getFirstCleanEnv([
      'SMTP_USER',
      'SMTP_EMAIL',
      'MAIL_USER',
      'MAIL_USERNAME',
      'EMAIL_USER',
    ]);
    const pass = this.getFirstSecretEnv([
      'SMTP_PASS',
      'SMTP_PASSWORD',
      'MAIL_PASS',
      'MAIL_PASSWORD',
      'EMAIL_PASS',
      'EMAIL_PASSWORD',
    ]);
    const host =
      this.getFirstCleanEnv(['SMTP_HOST', 'MAIL_HOST', 'EMAIL_HOST']) ??
      this.getServiceHost(service);
    const port = Number(
      this.getFirstCleanEnv(['SMTP_PORT', 'MAIL_PORT', 'EMAIL_PORT']) ?? 587,
    );
    const configuredFrom = this.getFirstCleanEnv([
      'SMTP_FROM',
      'MAIL_FROM',
      'EMAIL_FROM',
    ]);
    const senderName =
      this.getFirstCleanEnv(['SMTP_FROM_NAME', 'MAIL_FROM_NAME']) ??
      'Admin Fakultas Teknologi Informasi UNTAR';
    const from =
      configuredFrom ?? (user ? `${senderName} <${user}>` : undefined);
    const secure =
      this.getFirstCleanEnv(['SMTP_SECURE', 'MAIL_SECURE', 'EMAIL_SECURE']) ===
        'true' || Number(port) === 465;
    const missing = [
      !host ? 'SMTP_HOST' : null,
      !user ? 'SMTP_USER' : null,
      !pass ? 'SMTP_PASS' : null,
    ].filter(Boolean) as string[];

    if (missing.length || !host || !user || !pass || !from) {
      return { config: null, missing };
    }

    return {
      config: {
        host,
        port,
        secure,
        user,
        pass,
        from,
      },
      missing: [],
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

  private getFirstCleanEnv(keys: string[]) {
    for (const key of keys) {
      const value = this.getCleanEnv(key);

      if (value) return value;
    }

    return undefined;
  }

  private getSecretEnv(key: string) {
    const value = this.getCleanEnv(key);

    return value?.replace(/\s/g, '');
  }

  private getFirstSecretEnv(keys: string[]) {
    for (const key of keys) {
      const value = this.getSecretEnv(key);

      if (value) return value;
    }

    return undefined;
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Email gagal dikirim oleh SMTP.';
  }

  private createOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private isStrongPassword(password: string) {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }
}
