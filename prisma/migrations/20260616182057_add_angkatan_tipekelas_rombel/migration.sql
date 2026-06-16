/*
  Warnings:

  - Added the required column `angkatan` to the `mahasiswa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "jadwal" ADD COLUMN     "pengajarId" TEXT;

-- AlterTable
ALTER TABLE "mahasiswa" ADD COLUMN     "angkatan" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_pengajarId_fkey" FOREIGN KEY ("pengajarId") REFERENCES "pengajar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
