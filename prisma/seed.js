const { PrismaClient, Role, TipeKelas } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')

// Instantiate with an explicit (possibly empty) options object to satisfy
// newer Prisma runtime requirements when constructing PrismaClient.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const defaultPassword = 'Password123!'

const seedUsers = [
  {
    pengguna: {
      id: '535240187',
      username: 'naisya@stu.untar.ac.id',
      nama: "Naisya Yuen Ra'af",
      role: Role.MAHASISWA,
      isAktif: true,
    },
    mahasiswa: {
      nim: '535240187',
      tipeKelas: TipeKelas.PAGI,
    },
  },
  {
    pengguna: {
      id: '535240156',
      username: 'ahmad@stu.untar.ac.id',
      nama: 'Ahmad Rizki',
      role: Role.MAHASISWA,
      isAktif: true,
    },
    mahasiswa: {
      nim: '535240156',
      tipeKelas: TipeKelas.SORE,
    },
  },
  {
    pengguna: {
      id: '198503152010121001',
      username: 'ahmad.santoso@untar.ac.id',
      nama: 'Dr. Ahmad Santoso',
      role: Role.DOSEN,
      isAktif: true,
    },
    pengajar: {
      nip: '198503152010121001',
    },
  },
  {
    pengguna: {
      id: '198808122015032002',
      username: 'siti.nurhaliza@untar.ac.id',
      nama: 'Ir. Siti Nurhaliza',
      role: Role.DOSEN,
      isAktif: true,
    },
    pengajar: {
      nip: '198808122015032002',
    },
  },
  {
    pengguna: {
      id: 'admin-fti',
      username: 'admin.fti@untar.ac.id',
      nama: 'Admin Fakultas',
      role: Role.ADMIN,
      isAktif: true,
    },
  },
]

async function main() {
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  for (const entry of seedUsers) {
    await prisma.pengguna.upsert({
      where: { id: entry.pengguna.id },
      update: {
        username: entry.pengguna.username,
        nama: entry.pengguna.nama,
        role: entry.pengguna.role,
        isAktif: entry.pengguna.isAktif,
        password: hashedPassword,
        deletedAt: null,
      },
      create: {
        id: entry.pengguna.id,
        username: entry.pengguna.username,
        nama: entry.pengguna.nama,
        role: entry.pengguna.role,
        isAktif: entry.pengguna.isAktif,
        password: hashedPassword,
      },
    })

    if (entry.mahasiswa) {
      await prisma.mahasiswa.upsert({
        where: { nim: entry.mahasiswa.nim },
        update: {
          tipeKelas: entry.mahasiswa.tipeKelas,
          penggunaId: entry.pengguna.id,
        },
        create: {
          nim: entry.mahasiswa.nim,
          tipeKelas: entry.mahasiswa.tipeKelas,
          penggunaId: entry.pengguna.id,
        },
      })
    }

    if (entry.pengajar) {
      await prisma.pengajar.upsert({
        where: { nip: entry.pengajar.nip },
        update: {
          penggunaId: entry.pengguna.id,
        },
        create: {
          nip: entry.pengajar.nip,
          penggunaId: entry.pengguna.id,
        },
      })
    }
  }

  console.log('Seed pengguna backend selesai. Password default: Password123!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })