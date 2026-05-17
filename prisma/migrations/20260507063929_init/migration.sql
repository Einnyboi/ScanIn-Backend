-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOSEN', 'ASDOS', 'MAHASISWA');

-- CreateEnum
CREATE TYPE "TipeKelas" AS ENUM ('PAGI', 'SORE');

-- CreateEnum
CREATE TYPE "StatusKehadiran" AS ENUM ('HADIR', 'TERLAMBAT', 'TIDAK_HADIR', 'MENUNGGU_VALIDASI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "MetodeInput" AS ENUM ('QR', 'MANUAL', 'UPLOAD');

-- CreateEnum
CREATE TYPE "StatusSesi" AS ENUM ('AKTIF', 'DITUTUP_MANUAL', 'DITUTUP_SISTEM');

-- CreateEnum
CREATE TYPE "StatusPermohonan" AS ENUM ('MENUNGGU_DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "JenisPermohonan" AS ENUM ('KELUHAN_ABSENSI', 'DATA_ERROR', 'DISPENSASI', 'LAINNYA');

-- CreateTable
CREATE TABLE "pengguna" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "tipeKelas" "TipeKelas" NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajar" (
    "id" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,

    CONSTRAINT "pengajar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_kuliah" (
    "id" TEXT NOT NULL,
    "idMatkul" TEXT NOT NULL,
    "kodeMatkul" TEXT NOT NULL,
    "namaMatkul" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,

    CONSTRAINT "mata_kuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruangan" (
    "id" TEXT NOT NULL,
    "idRuangan" TEXT NOT NULL,
    "namaRuangan" TEXT NOT NULL,

    CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL,
    "idKelas" TEXT NOT NULL,
    "namaKelas" TEXT NOT NULL,
    "mataKuliahId" TEXT NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal" (
    "id" TEXT NOT NULL,
    "idJadwal" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "jamMulai" TIMESTAMP(3) NOT NULL,
    "jamSelesai" TIMESTAMP(3) NOT NULL,
    "kelasId" TEXT NOT NULL,
    "ruanganId" TEXT NOT NULL,

    CONSTRAINT "jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesi_presensi" (
    "id" TEXT NOT NULL,
    "idSesi" TEXT NOT NULL,
    "jadwalId" TEXT NOT NULL,
    "pengajarId" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "waktuBuka" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autoCloseAt" TIMESTAMP(3) NOT NULL,
    "statusSesi" "StatusSesi" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesi_presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_presensi" (
    "id" TEXT NOT NULL,
    "idPresensi" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "sesiId" TEXT NOT NULL,
    "statusKehadiran" "StatusKehadiran" NOT NULL,
    "metodeInput" "MetodeInput" NOT NULL,
    "waktuAbsen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileBukti" TEXT,
    "geoLat" DOUBLE PRECISION,
    "geoLng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permohonan" (
    "id" TEXT NOT NULL,
    "idPermohonan" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "jenisPermohonan" "JenisPermohonan" NOT NULL,
    "deskripsiMasalah" TEXT NOT NULL,
    "tanggalKelas" TIMESTAMP(3) NOT NULL,
    "fileBukti" TEXT,
    "status" "StatusPermohonan" NOT NULL DEFAULT 'MENUNGGU_DIPROSES',
    "catatanReview" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permohonan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "tabel" TEXT NOT NULL,
    "dataLama" JSONB,
    "dataBaru" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_username_key" ON "pengguna"("username");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_penggunaId_key" ON "mahasiswa"("penggunaId");

-- CreateIndex
CREATE UNIQUE INDEX "pengajar_nip_key" ON "pengajar"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "pengajar_penggunaId_key" ON "pengajar"("penggunaId");

-- CreateIndex
CREATE UNIQUE INDEX "mata_kuliah_idMatkul_key" ON "mata_kuliah"("idMatkul");

-- CreateIndex
CREATE UNIQUE INDEX "mata_kuliah_kodeMatkul_key" ON "mata_kuliah"("kodeMatkul");

-- CreateIndex
CREATE UNIQUE INDEX "ruangan_idRuangan_key" ON "ruangan"("idRuangan");

-- CreateIndex
CREATE UNIQUE INDEX "kelas_idKelas_key" ON "kelas"("idKelas");

-- CreateIndex
CREATE UNIQUE INDEX "jadwal_idJadwal_key" ON "jadwal"("idJadwal");

-- CreateIndex
CREATE UNIQUE INDEX "sesi_presensi_idSesi_key" ON "sesi_presensi"("idSesi");

-- CreateIndex
CREATE UNIQUE INDEX "sesi_presensi_qrToken_key" ON "sesi_presensi"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "data_presensi_idPresensi_key" ON "data_presensi"("idPresensi");

-- CreateIndex
CREATE UNIQUE INDEX "data_presensi_mahasiswaId_sesiId_key" ON "data_presensi"("mahasiswaId", "sesiId");

-- CreateIndex
CREATE UNIQUE INDEX "permohonan_idPermohonan_key" ON "permohonan"("idPermohonan");

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajar" ADD CONSTRAINT "pengajar_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_mataKuliahId_fkey" FOREIGN KEY ("mataKuliahId") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_ruanganId_fkey" FOREIGN KEY ("ruanganId") REFERENCES "ruangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesi_presensi" ADD CONSTRAINT "sesi_presensi_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesi_presensi" ADD CONSTRAINT "sesi_presensi_pengajarId_fkey" FOREIGN KEY ("pengajarId") REFERENCES "pengajar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_presensi" ADD CONSTRAINT "data_presensi_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_presensi" ADD CONSTRAINT "data_presensi_sesiId_fkey" FOREIGN KEY ("sesiId") REFERENCES "sesi_presensi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permohonan" ADD CONSTRAINT "permohonan_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
