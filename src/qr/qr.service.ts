import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Koordinat pusat FTI Untar — sesuaikan dengan koordinat asli
const FTI_LAT = -6.1275;
const FTI_LNG = 106.7963;
const RADIUS_METER = 200; // radius 200 meter

@Injectable()
export class QrService {
  constructor(private jwt: JwtService) {}

  // Hitung jarak antara dua koordinat (Haversine formula)
  private hitungJarak(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371000; // radius bumi dalam meter
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  validasiLokasi(lat: number, lng: number): boolean {
    const jarak = this.hitungJarak(lat, lng, FTI_LAT, FTI_LNG);
    return jarak <= RADIUS_METER;
  }

  buatQrToken(mahasiswaId: string): string {
    return this.jwt.sign(
      {
        sub: mahasiswaId,
        type: 'QR_PRESENSI',
        iat: Math.floor(Date.now() / 1000),
      },
      { expiresIn: '35s' }, // sedikit lebih dari interval refresh 30 detik
    );
  }
}
