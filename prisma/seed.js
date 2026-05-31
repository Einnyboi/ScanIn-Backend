require('dotenv').config();

const { PrismaClient, Role, TipeKelas } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const demoPassword = process.env.SEED_PASSWORD || 'Password123!';

const users = [
  {
    id: '535240187',
    email: '535240187@stu.untar.ac.id',
    name: "Naisya Yuen Ra'af",
    role: Role.MAHASISWA,
    student: { nim: '535240187', tipeKelas: TipeKelas.PAGI },
  },
  {
    id: '535240156',
    email: '535240156@stu.untar.ac.id',
    name: 'Ahmad Rizki',
    role: Role.MAHASISWA,
    student: { nim: '535240156', tipeKelas: TipeKelas.PAGI },
  },
  {
    id: '535240145',
    email: '535240145@stu.untar.ac.id',
    name: 'Siti Nurhaliza',
    role: Role.MAHASISWA,
    student: { nim: '535240145', tipeKelas: TipeKelas.PAGI },
  },
  {
    id: '198503152010121001',
    email: '198503152010121001@untar.ac.id',
    name: 'Dr. Ahmad Santoso',
    role: Role.DOSEN,
    lecturer: { nip: '198503152010121001' },
  },
  {
    id: '198903152010121002',
    email: '198903152010121002@untar.ac.id',
    name: 'Ir. Siti Nurhaliza',
    role: Role.DOSEN,
    lecturer: { nip: '198903152010121002' },
  },
  {
    id: 'admin',
    email: 'admin.fti@untar.ac.id',
    name: 'Admin Fakultas',
    role: Role.ADMIN,
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  for (const user of users) {
    const pengguna = await prisma.pengguna.upsert({
      where: { username: user.email },
      update: {
        nama: user.name,
        password: hashedPassword,
        role: user.role,
        isAktif: true,
        deletedAt: null,
      },
      create: {
        id: user.id,
        username: user.email,
        nama: user.name,
        password: hashedPassword,
        role: user.role,
        isAktif: true,
      },
    });

    if (user.student) {
      await prisma.mahasiswa.upsert({
        where: { nim: user.student.nim },
        update: {
          penggunaId: pengguna.id,
          tipeKelas: user.student.tipeKelas,
        },
        create: {
          nim: user.student.nim,
          penggunaId: pengguna.id,
          tipeKelas: user.student.tipeKelas,
        },
      });
    }

    if (user.lecturer) {
      await prisma.pengajar.upsert({
        where: { nip: user.lecturer.nip },
        update: { penggunaId: pengguna.id },
        create: {
          nip: user.lecturer.nip,
          penggunaId: pengguna.id,
        },
      });
    }
  }

  console.log(`Seed selesai. Password demo: ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
