require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const users = await prisma.pengguna.findMany({ select: { id: true, username: true, nama: true, password: true } });
  console.log('pengguna rows:', users.length);
  console.dir(users, { depth: 2 });

  const mahasiswa = await prisma.mahasiswa.findMany({ select: { id: true, nim: true, penggunaId: true } });
  console.log('\nmahasiswa rows:', mahasiswa.length);
  console.dir(mahasiswa, { depth: 2 });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
