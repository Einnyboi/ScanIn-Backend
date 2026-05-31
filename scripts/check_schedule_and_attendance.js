require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const matakuliah = await prisma.mataKuliah.findMany();
  console.log('mata_kuliah:', matakuliah.length);
  console.dir(matakuliah, { depth: 2 });

  const kelas = await prisma.kelas.findMany({ include: { mataKuliah: true } });
  console.log('\nkelas:', kelas.length);
  console.dir(kelas, { depth: 2 });

  const jadwal = await prisma.jadwal.findMany({ include: { kelas: true, ruangan: true } });
  console.log('\njadwal:', jadwal.length);
  console.dir(jadwal, { depth: 2 });

  const sesi = await prisma.sesiPresensi.findMany({ include: { jadwal: true, pengajar: true } });
  console.log('\nsesi_presensi:', sesi.length);
  console.dir(sesi, { depth: 2 });

  const presensi = await prisma.dataPresensi.findMany({ include: { mahasiswa: true, sesiPresensi: true } });
  console.log('\ndata_presensi:', presensi.length);
  console.dir(presensi, { depth: 2 });

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
