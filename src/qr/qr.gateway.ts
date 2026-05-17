import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QrService } from './qr.service';
import { JwtService } from '@nestjs/jwt';

interface QrSession {
  mahasiswaId: string;
  interval: NodeJS.Timeout;
}

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
  namespace: '/qr',
})
export class QrGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Map socketId → QrSession
  private sessions = new Map<string, QrSession>();

  constructor(
    private qrService: QrService,
    private jwt: JwtService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`[QR Gateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.stopSession(client.id);
    console.log(`[QR Gateway] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('minta_qr')
  handleMintaQr(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { lat: number; lng: number; authToken: string },
  ) {
    // 1. Validasi JWT auth token mahasiswa
    let mahasiswaId: string;
    try {
      const decoded = this.jwt.verify(payload.authToken) as unknown;
      mahasiswaId = (decoded as Record<string, unknown>).sub as string;
    } catch {
      client.emit('qr_error', { pesan: 'Token autentikasi tidak valid.' });
      return;
    }

    // 2. Validasi lokasi
    const lokasiValid = this.qrService.validasiLokasi(payload.lat, payload.lng);
    if (!lokasiValid) {
      client.emit('qr_error', {
        pesan:
          'Kamu tidak berada di lokasi FTI. Presensi hanya bisa dilakukan di dalam kampus.',
      });
      return;
    }

    // 3. Stop session lama jika ada
    this.stopSession(client.id);

    // 4. Kirim token pertama langsung
    this.kirimToken(client, mahasiswaId);

    // 5. Setup interval refresh setiap 30 detik
    const interval = setInterval(() => {
      // Cek apakah client masih terhubung
      if (!this.server.sockets.sockets.get(client.id)) {
        this.stopSession(client.id);
        return;
      }
      this.kirimToken(client, mahasiswaId);
    }, 30000);

    this.sessions.set(client.id, { mahasiswaId, interval });
  }

  @SubscribeMessage('stop_qr')
  handleStopQr(@ConnectedSocket() client: Socket) {
    this.stopSession(client.id);
    client.emit('qr_stopped');
  }

  private kirimToken(client: Socket, mahasiswaId: string) {
    const token = this.qrService.buatQrToken(mahasiswaId);
    client.emit('qr_token_baru', {
      token,
      refreshAt: Date.now() + 30000, // timestamp kapan token berikutnya dikirim
    });
  }

  private stopSession(socketId: string) {
    const session = this.sessions.get(socketId);
    if (session) {
      clearInterval(session.interval);
      this.sessions.delete(socketId);
    }
  }
}
