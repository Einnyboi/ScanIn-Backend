-- AlterTable
ALTER TABLE "mahasiswa" ADD COLUMN "kelasRombel" TEXT;

-- CreateTable
CREATE TABLE "mahasiswa_kelas" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "isOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mahasiswa_kelas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_kelas_mahasiswaId_kelasId_key" ON "mahasiswa_kelas"("mahasiswaId", "kelasId");

-- AddForeignKey
ALTER TABLE "mahasiswa_kelas" ADD CONSTRAINT "mahasiswa_kelas_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa_kelas" ADD CONSTRAINT "mahasiswa_kelas_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
