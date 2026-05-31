-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registeredEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "resetUrl" TEXT,
    "emailStatus" TEXT,
    "usedAt" TIMESTAMP(3),
    "penggunaId" TEXT,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;
