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

const seedUsers = [{
        pengguna: {
            id: '535240187',
            username: 'naisya.535240187@stu.untar.ac.id',
            nama: "Naisya Yuen Ra'af",
            role: Role.MAHASISWA,
            isAktif: true,
        },
        mahasiswa: {
            nim: '535240187',
            angkatan: '2024',
            tipeKelas: TipeKelas.PAGI,
            kelasRombel: 'TI A',
        },
    },
    {
        pengguna: {
            id: '535240075',
            username: 'cathrine.535240075@stu.untar.ac.id',
            nama: 'Cathrine Sandrina',
            role: Role.MAHASISWA,
            isAktif: true,
        },
        mahasiswa: {
            nim: '535240075',
            angkatan: '2024',
            tipeKelas: TipeKelas.SORE,
            kelasRombel: 'TI S',
        },
    },
    {
        pengguna: {
            id: '198503152010121001',
            username: 'ahmad.santoso@fti.untar.ac.id',
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
            id: '198505202012122003',
            username: 'lina@fti.untar.ac.id',
            nama: 'Prof. Lina',
            role: Role.DOSEN,
            isAktif: true,
        },
        pengajar: {
            nip: '198505202012122003',
        },
    },
    {
        pengguna: {
            id: '198702152011022001',
            username: 'novariojp@fti.untar.ac.id',
            nama: 'Novario Jaya Perdana',
            role: Role.DOSEN,
            isAktif: true,
        },
        pengajar: {
            nip: '198702152011022001',
        },
    },
    {
        pengguna: {
            id: '198808122015032002',
            username: 'siti.nurhaliza@fti.untar.ac.id',
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
    {
        pengguna: { id: '535240064', username: 'vincen.535240064@stu.untar.ac.id', nama: 'VINCEN OKTA RAMADHAN', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240064', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240066', username: 'gian.535240066@stu.untar.ac.id', nama: 'GIAN KENAR JAVIER', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240066', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240067', username: 'darrel.535240067@stu.untar.ac.id', nama: 'DARREL YOSEPH', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240067', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240068', username: 'charless.535240068@stu.untar.ac.id', nama: 'CHARLESS', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240068', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240069', username: 'martin.535240069@stu.untar.ac.id', nama: 'MARTIN CAHYADI', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240069', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240070', username: 'christy.535240070@stu.untar.ac.id', nama: 'CHRISTY JONES', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240070', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240071', username: 'vanesa.535240071@stu.untar.ac.id', nama: 'VANESA YOLANDA', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240071', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240073', username: 'advendra.535240073@stu.untar.ac.id', nama: 'ADVENDRA DESWANTA', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240073', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240076', username: 'cornelius.535240076@stu.untar.ac.id', nama: 'CORNELIUS CLARENCE TANUSULISTYO', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240076', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240077', username: 'fabio.535240077@stu.untar.ac.id', nama: 'FABIO FRANCISCO', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240077', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240078', username: 'naomi.535240078@stu.untar.ac.id', nama: 'NAOMI WILLIAM SUGIANTARA', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240078', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240079', username: 'joe.535240079@stu.untar.ac.id', nama: 'JOE NICKSON LIE', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240079', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240080', username: 'michael.535240080@stu.untar.ac.id', nama: 'MICHAEL ANDRE ANTORO', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240080', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240081', username: 'castillo.535240081@stu.untar.ac.id', nama: 'CASTILLO D`ARTAGNAN ALDRIN', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240081', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240082', username: 'james.535240082@stu.untar.ac.id', nama: 'JAMES WILLIAM WIJAYA', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240082', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240083', username: 'adelia.535240083@stu.untar.ac.id', nama: 'ADELIA SASSY MULYA', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240083', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240084', username: 'kyeth.535240084@stu.untar.ac.id', nama: 'KYETH FERNANDO', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240084', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240085', username: 'excell.535240085@stu.untar.ac.id', nama: 'EXCELL HANZOVIN HAKIM', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240085', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240086', username: 'priscilla.535240086@stu.untar.ac.id', nama: 'PRISCILLA REBEKAH TEDJA', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240086', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240087', username: 'ferdinand.535240087@stu.untar.ac.id', nama: 'FERDINAND GOUWADI', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240087', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240088', username: 'jeremias.535240088@stu.untar.ac.id', nama: 'JEREMIAS DEVANO SARUMPAET', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240088', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240089', username: 'thendy.535240089@stu.untar.ac.id', nama: 'THENDY HOSE', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240089', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240090', username: 'delvyn.535240090@stu.untar.ac.id', nama: 'DELVYN PUTRA', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240090', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240091', username: 'jeffly.535240091@stu.untar.ac.id', nama: 'JEFFLY', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240091', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240092', username: 'andrean.535240092@stu.untar.ac.id', nama: 'ANDREAN', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240092', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240093', username: 'christoforus.535240093@stu.untar.ac.id', nama: 'CHRISTOFORUS VIENCENT HENDRIANUS', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240093', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240143', username: 'axel.535240143@stu.untar.ac.id', nama: 'AXEL CHRISDY SANJAYA', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240143', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240144', username: 'nicholas.535240144@stu.untar.ac.id', nama: 'NICHOLAS ISAIAH', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240144', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240145', username: 'davina.535240145@stu.untar.ac.id', nama: 'DAVINA POSH', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240145', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240175', username: 'kaming.535240175@stu.untar.ac.id', nama: 'KAMING', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240175', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240176', username: 'tandwiyan.535240176@stu.untar.ac.id', nama: 'TANDWIYAN TALENTA', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240176', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240179', username: 'juan.535240179@stu.untar.ac.id', nama: 'JUAN CHRISTIAN HANDOKO', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240179', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240180', username: 'rendy.535240180@stu.untar.ac.id', nama: 'RENDY DENNY', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240180', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240183', username: 'affan.535240183@stu.untar.ac.id', nama: 'AFFAN MOSHE', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240183', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240184', username: 'yohanan.535240184@stu.untar.ac.id', nama: 'YOHANAN PANONDANG MARULITUA PASARIBU', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240184', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    },
    {
        pengguna: { id: '535240188', username: 'jessica.535240188@stu.untar.ac.id', nama: 'JESSICA PEREZ CHEN', role: Role.MAHASISWA, isAktif: true },
        mahasiswa: { nim: '535240188', angkatan: '2024', tipeKelas: TipeKelas.PAGI, kelasRombel: 'TI C' }
    }
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
                    angkatan: entry.mahasiswa.angkatan,
                    tipeKelas: entry.mahasiswa.tipeKelas,
                    kelasRombel: entry.mahasiswa.kelasRombel,
                    penggunaId: entry.pengguna.id,
                },
                create: {
                    nim: entry.mahasiswa.nim,
                    angkatan: entry.mahasiswa.angkatan,
                    tipeKelas: entry.mahasiswa.tipeKelas,
                    kelasRombel: entry.mahasiswa.kelasRombel,
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



    // Seed some MataKuliah (courses)
    const mataKuliahSeed = [{
            idMatkul: 'MAT001',
            kodeMatkul: 'IF101',
            namaMatkul: 'Pemrograman Dasar',
            sks: 3,
        },
        {
            idMatkul: 'MAT002',
            kodeMatkul: 'IF102',
            namaMatkul: 'Struktur Data',
            sks: 3,
        },
        {
            idMatkul: 'MAT003',
            kodeMatkul: 'IF201',
            namaMatkul: 'Basis Data',
            sks: 3,
        },
        {
            idMatkul: 'MAT004',
            kodeMatkul: 'IF301',
            namaMatkul: 'Backend Development',
            sks: 3,
        },
    ]

    for (const mk of mataKuliahSeed) {
        await prisma.mataKuliah.upsert({
            where: { idMatkul: mk.idMatkul },
            update: {
                kodeMatkul: mk.kodeMatkul,
                namaMatkul: mk.namaMatkul,
                sks: mk.sks,
            },
            create: {
                idMatkul: mk.idMatkul,
                kodeMatkul: mk.kodeMatkul,
                namaMatkul: mk.namaMatkul,
                sks: mk.sks,
            },
        })
    }

    // Seed Ruangan
    const ruanganSeed = [
        { idRuangan: 'R001', namaRuangan: 'Lab A' },
        { idRuangan: 'R002', namaRuangan: 'Lab B' },
    ]

    for (const r of ruanganSeed) {
        await prisma.ruangan.upsert({
            where: { idRuangan: r.idRuangan },
            update: { namaRuangan: r.namaRuangan },
            create: { idRuangan: r.idRuangan, namaRuangan: r.namaRuangan },
        })
    }

    // Seed Kelas (connect to mataKuliah via unique idMatkul)
    const kelasSeed = [
        { idKelas: 'KEL001', namaKelas: 'TI A', mataMatkulIdMatkul: 'MAT001' },
        { idKelas: 'KEL002', namaKelas: 'TI B', mataMatkulIdMatkul: 'MAT001' },
        { idKelas: 'KEL003', namaKelas: 'TI S', mataMatkulIdMatkul: 'MAT001' },
        { idKelas: 'KEL004', namaKelas: 'TI A', mataMatkulIdMatkul: 'MAT002' },
        { idKelas: 'KEL005', namaKelas: 'TI B', mataMatkulIdMatkul: 'MAT002' },
        { idKelas: 'KEL006', namaKelas: 'TI S', mataMatkulIdMatkul: 'MAT002' },
        { idKelas: 'KEL007', namaKelas: 'TI A', mataMatkulIdMatkul: 'MAT003' },
        { idKelas: 'KEL008', namaKelas: 'TI B', mataMatkulIdMatkul: 'MAT003' },
        { idKelas: 'KEL009', namaKelas: 'TI S', mataMatkulIdMatkul: 'MAT003' },
        { idKelas: 'KEL010', namaKelas: 'TI A', mataMatkulIdMatkul: 'MAT004' },
        { idKelas: 'KEL011', namaKelas: 'TI B', mataMatkulIdMatkul: 'MAT004' },
        { idKelas: 'KEL012', namaKelas: 'TI S', mataMatkulIdMatkul: 'MAT004' },
    ]

    for (const k of kelasSeed) {
        await prisma.kelas.upsert({
            where: { idKelas: k.idKelas },
            update: {
                namaKelas: k.namaKelas,
                mataKuliahId: (await prisma.mataKuliah.findUnique({ where: { idMatkul: k.mataMatkulIdMatkul } })).id,
            },
            create: {
                idKelas: k.idKelas,
                namaKelas: k.namaKelas,
                mataKuliah: { connect: { idMatkul: k.mataMatkulIdMatkul } },
            },
        })
    }

    // Seed Jadwal (connect to kelas and ruangan via their unique keys)
    const dosenNips = ['198503152010121001', '198505202012122003', '198702152011022001', '198808122015032002'];
    const jadwalSeed = [];
    let kId = 1;
    for (let i = 0; i < 4; i++) {
        const nip = dosenNips[i];
        jadwalSeed.push({
            idJadwal: `JAD00${kId}`,
            hari: 'Senin',
            jamMulai: new Date('2026-06-01T09:00:00.000Z'),
            jamSelesai: new Date('2026-06-01T11:00:00.000Z'),
            kelasIdKelas: `KEL0${kId < 10 ? '0' + kId : kId}`,
            ruanganIdRuangan: 'R001',
            pengajarNip: nip,
        });
        kId++;
        jadwalSeed.push({
            idJadwal: `JAD00${kId}`,
            hari: 'Selasa',
            jamMulai: new Date('2026-06-02T13:00:00.000Z'),
            jamSelesai: new Date('2026-06-02T15:00:00.000Z'),
            kelasIdKelas: `KEL0${kId < 10 ? '0' + kId : kId}`,
            ruanganIdRuangan: 'R002',
            pengajarNip: nip,
        });
        kId++;
    }

    for (const j of jadwalSeed) {
        await prisma.jadwal.upsert({
            where: { idJadwal: j.idJadwal },
            update: {
                hari: j.hari,
                jamMulai: j.jamMulai,
                jamSelesai: j.jamSelesai,
                kelasId: (await prisma.kelas.findUnique({ where: { idKelas: j.kelasIdKelas } })).id,
                ruanganId: (await prisma.ruangan.findUnique({ where: { idRuangan: j.ruanganIdRuangan } })).id,
                pengajarId: j.pengajarNip ? (await prisma.pengajar.findUnique({ where: { nip: j.pengajarNip } })).id : null,
            },
            create: {
                idJadwal: j.idJadwal,
                hari: j.hari,
                jamMulai: j.jamMulai,
                jamSelesai: j.jamSelesai,
                kelas: { connect: { idKelas: j.kelasIdKelas } },
                ruangan: { connect: { idRuangan: j.ruanganIdRuangan } },
                pengajar: j.pengajarNip ? { connect: { nip: j.pengajarNip } } : undefined,
            },
        })
    }

    // Seed SesiPresensi (connect to jadwal by idJadwal and pengajar by nip)
    const sesiSeed = [{
            idSesi: 'S001',
            jadwalIdJadwal: 'JAD001',
            pengajarNip: '198503152010121001',
            qrToken: 'QRTOKEN-TEST-001',
            waktuBuka: new Date(),
            autoCloseAt: new Date(Date.now() + 1000 * 60 * 60),
        },
        {
            idSesi: 'S002',
            jadwalIdJadwal: 'JAD002',
            pengajarNip: '198808122015032002',
            qrToken: 'QRTOKEN-TEST-002',
            waktuBuka: new Date(),
            autoCloseAt: new Date(Date.now() + 1000 * 60 * 60),
        },
    ]

    // Seed enrollment overrides (for repeat or special class placement)
    const enrollmentSeed = [
        { mahasiswaNim: '535240187', kelasIdKelas: 'KEL001', isOverride: false },
        { mahasiswaNim: '535240075', kelasIdKelas: 'KEL012', isOverride: true },
    ]

    for (const s of sesiSeed) {
        await prisma.sesiPresensi.upsert({
            where: { idSesi: s.idSesi },
            update: {
                qrToken: s.qrToken,
                waktuBuka: s.waktuBuka,
                autoCloseAt: s.autoCloseAt,
                jadwalId: (await prisma.jadwal.findUnique({ where: { idJadwal: s.jadwalIdJadwal } })).id,
                pengajarId: (await prisma.pengajar.findUnique({ where: { nip: s.pengajarNip } })).id,
            },
            create: {
                idSesi: s.idSesi,
                jadwal: { connect: { idJadwal: s.jadwalIdJadwal } },
                pengajar: { connect: { nip: s.pengajarNip } },
                qrToken: s.qrToken,
                waktuBuka: s.waktuBuka,
                autoCloseAt: s.autoCloseAt,
            },
        })
    }

    for (const enrollment of enrollmentSeed) {
        const mahasiswa = await prisma.mahasiswa.findUnique({
            where: { nim: enrollment.mahasiswaNim },
        })
        const kelas = await prisma.kelas.findUnique({
            where: { idKelas: enrollment.kelasIdKelas },
        })

        if (!mahasiswa || !kelas) {
            continue
        }

        await prisma.mahasiswaKelas.upsert({
            where: {
                mahasiswaId_kelasId: {
                    mahasiswaId: mahasiswa.id,
                    kelasId: kelas.id,
                },
            },
            update: {
                isOverride: enrollment.isOverride,
            },
            create: {
                mahasiswaId: mahasiswa.id,
                kelasId: kelas.id,
                isOverride: enrollment.isOverride,
            },
        })
    }

    // Seed DataPresensi (attendance) for two mahasiswa
    const presensiSeed = [{
            idPresensi: 'PRES001',
            mahasiswaNim: '535240187',
            sesiIdSesi: 'S001',
            statusKehadiran: 'HADIR',
            metodeInput: 'QR',
            waktuAbsen: new Date(),
        },
        {
            idPresensi: 'PRES002',
            mahasiswaNim: '535240075',
            sesiIdSesi: 'S001',
            statusKehadiran: 'TERLAMBAT',
            metodeInput: 'QR',
            waktuAbsen: new Date(Date.now() + 1000 * 60 * 5),
        },
    ]

    for (const p of presensiSeed) {
        await prisma.dataPresensi.upsert({
            where: { idPresensi: p.idPresensi },
            update: {
                statusKehadiran: p.statusKehadiran,
                metodeInput: p.metodeInput,
                waktuAbsen: p.waktuAbsen,
                mahasiswaId: (await prisma.mahasiswa.findUnique({ where: { nim: p.mahasiswaNim } })).id,
                sesiId: (await prisma.sesiPresensi.findUnique({ where: { idSesi: p.sesiIdSesi } })).id,
            },
            create: {
                idPresensi: p.idPresensi,
                statusKehadiran: p.statusKehadiran,
                metodeInput: p.metodeInput,
                waktuAbsen: p.waktuAbsen,
                mahasiswa: { connect: { nim: p.mahasiswaNim } },
                sesiPresensi: { connect: { idSesi: p.sesiIdSesi } },
            },
        })
    }

    // Additional seed from frontend mockAttendance
    // MataKuliah for frontend demo courses
    const demoCourses = [
        { idMatkul: 'MAT104', kodeMatkul: 'SD101', namaMatkul: 'Software Development', sks: 3 },
        { idMatkul: 'MAT105', kodeMatkul: 'PW101', namaMatkul: 'Pemrograman Web', sks: 3 },
        { idMatkul: 'MAT106', kodeMatkul: 'KB101', namaMatkul: 'Kecerdasan Buatan', sks: 3 },
        { idMatkul: 'MAT107', kodeMatkul: 'BDL101', namaMatkul: 'Basis Data Lanjut', sks: 3 },
    ]

    for (const c of demoCourses) {
        await prisma.mataKuliah.upsert({
            where: { idMatkul: c.idMatkul },
            update: { kodeMatkul: c.kodeMatkul, namaMatkul: c.namaMatkul, sks: c.sks },
            create: { idMatkul: c.idMatkul, kodeMatkul: c.kodeMatkul, namaMatkul: c.namaMatkul, sks: c.sks },
        })
    }



    // Kelas and Jadwal for demo courses
    const demoKelas = [
        { idKelas: 'KEL103', namaKelas: 'SD-01 (TI C)', matkulId: 'MAT104', ruanganId: 'R001' },
        { idKelas: 'KEL104', namaKelas: 'PW-01', matkulId: 'MAT105', ruanganId: 'R002' },
        { idKelas: 'KEL105', namaKelas: 'KB-01', matkulId: 'MAT106', ruanganId: 'R002' },
        { idKelas: 'KEL106', namaKelas: 'BDL-01', matkulId: 'MAT107', ruanganId: 'R001' },
    ]

    for (const k of demoKelas) {
        await prisma.kelas.upsert({
            where: { idKelas: k.idKelas },
            update: {
                namaKelas: k.namaKelas,
                mataKuliah: { connect: { idMatkul: k.matkulId } },
            },
            create: {
                idKelas: k.idKelas,
                namaKelas: k.namaKelas,
                mataKuliah: { connect: { idMatkul: k.matkulId } },
            },
        })
    }

    const demoJadwal = [];
    const demoSesi = [];
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const demoClasses = ['KEL103', 'KEL104', 'KEL105', 'KEL106'];
    const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
    let dJadwalId = 100;
    
    for (let d = 0; d < 7; d++) {
        const schedDate = new Date();
        const diff = d - schedDate.getDay() + (schedDate.getDay() === 0 ? -6 : 1);
        schedDate.setDate(schedDate.getDate() + diff);
        
        for (let c = 0; c < 4; c++) {
            dJadwalId++;
            const nip = dosenNips[(d + c) % 4];
            
            demoJadwal.push({
                idJadwal: `JAD${dJadwalId}`,
                hari: days[d],
                jamMulai: new Date(new Date(schedDate).setHours(8 + c, 0, 0, 0)),
                jamSelesai: new Date(new Date(schedDate).setHours(11 + c, 0, 0, 0)),
                kelasId: demoClasses[c],
                ruanganId: 'R001',
                pengajarNip: nip
            });
            
            if (days[d] === todayStr) {
                demoSesi.push({
                    idSesi: `S${dJadwalId}`,
                    jadwalId: `JAD${dJadwalId}`,
                    pengajarNip: nip,
                    qrToken: `QRTOKEN-DEMO-${dJadwalId}`,
                });
            }
        }
    }

    for (const j of demoJadwal) {
        await prisma.jadwal.upsert({
            where: { idJadwal: j.idJadwal },
            update: {
                hari: j.hari,
                jamMulai: j.jamMulai,
                jamSelesai: j.jamSelesai,
                kelas: { connect: { idKelas: j.kelasId } },
                ruangan: { connect: { idRuangan: j.ruanganId } },
                pengajar: j.pengajarNip ? { connect: { nip: j.pengajarNip } } : undefined,
            },
            create: {
                idJadwal: j.idJadwal,
                hari: j.hari,
                jamMulai: j.jamMulai,
                jamSelesai: j.jamSelesai,
                kelas: { connect: { idKelas: j.kelasId } },
                ruangan: { connect: { idRuangan: j.ruanganId } },
                pengajar: j.pengajarNip ? { connect: { nip: j.pengajarNip } } : undefined,
            },
        })
    }

    for (const s of demoSesi) {
        await prisma.sesiPresensi.upsert({
            where: { idSesi: s.idSesi },
            update: {
                qrToken: s.qrToken,
                jadwal: { connect: { idJadwal: s.jadwalId } },
                pengajar: { connect: { nip: s.pengajarNip } },
            },
            create: {
                idSesi: s.idSesi,
                jadwal: { connect: { idJadwal: s.jadwalId } },
                pengajar: { connect: { nip: s.pengajarNip } },
                qrToken: s.qrToken,
                waktuBuka: new Date(),
                autoCloseAt: new Date(Date.now() + 1000 * 60 * 60 * 5),
            },
        })
    }



    // Seed correction tickets (permohonan) from frontend mock
    const mockTickets = [
        { id: 'TICKET001', mahasiswaNim: '535240187', jenisPermohonan: 'KELUHAN_ABSENSI', deskripsiMasalah: 'Sistem error saat scan QR', tanggalKelas: '2026-05-17' },
        { id: 'TICKET002', mahasiswaNim: '535240075', jenisPermohonan: 'KELUHAN_ABSENSI', deskripsiMasalah: 'Terlambat karena macet', tanggalKelas: '2026-05-16' },
    ]

    for (const t of mockTickets) {
        const mahasiswa = await prisma.mahasiswa.findUnique({ where: { nim: t.mahasiswaNim } })
        if (!mahasiswa) continue
        await prisma.permohonan.upsert({
            where: { id: t.id },
            update: {
                deskripsiMasalah: t.deskripsiMasalah,
                tanggalKelas: new Date(t.tanggalKelas),
                penggunaId: mahasiswa.penggunaId,
                jenisPermohonan: t.jenisPermohonan,
                status: 'MENUNGGU_DIPROSES',
            },
            create: {
                id: t.id,
                idPermohonan: t.id,
                penggunaId: mahasiswa.penggunaId,
                jenisPermohonan: t.jenisPermohonan,
                deskripsiMasalah: t.deskripsiMasalah,
                tanggalKelas: new Date(t.tanggalKelas),
                status: 'MENUNGGU_DIPROSES',
            },
        })
    }

    // Auto-enroll all 'TI C' students into all demo classes (KEL103, KEL104, KEL105, KEL106)
    const allTIC = await prisma.mahasiswa.findMany({ where: { kelasRombel: 'TI C' } })
    const demoClassIds = ['KEL103', 'KEL104', 'KEL105', 'KEL106']
    
    if (allTIC.length > 0) {
        for (const m of allTIC) {
            for (const kId of demoClassIds) {
                const k = await prisma.kelas.findUnique({ where: { idKelas: kId } })
                if (k) {
                    await prisma.mahasiswaKelas.upsert({
                        where: {
                            mahasiswaId_kelasId: {
                                mahasiswaId: m.id,
                                kelasId: k.id,
                            }
                        },
                        update: {},
                        create: {
                            mahasiswaId: m.id,
                            kelasId: k.id,
                        }
                    })
                }
            }
        }
    }

    console.log('Seed pengguna backend selesai. Password default: Password123!')
}

main()
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
    .finally(async() => {
        await prisma.$disconnect()
    })