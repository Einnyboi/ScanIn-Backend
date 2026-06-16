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
                    penggunaId: entry.pengguna.id,
                },
                create: {
                    nim: entry.mahasiswa.nim,
                    angkatan: entry.mahasiswa.angkatan,
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
    const jadwalSeed = [{
            idJadwal: 'JAD001',
            hari: 'Senin',
            jamMulai: new Date('2026-06-01T09:00:00.000Z'),
            jamSelesai: new Date('2026-06-01T11:00:00.000Z'),
            kelasIdKelas: 'KEL001',
            ruanganIdRuangan: 'R001',
            pengajarNip: '198503152010121001',
        },
        {
            idJadwal: 'JAD002',
            hari: 'Selasa',
            jamMulai: new Date('2026-06-02T13:00:00.000Z'),
            jamSelesai: new Date('2026-06-02T15:00:00.000Z'),
            kelasIdKelas: 'KEL012',
            ruanganIdRuangan: 'R002',
            pengajarNip: '198808122015032002',
        },
    ]

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
        { idMatkul: 'MAT004', kodeMatkul: 'SD101', namaMatkul: 'Software Development', sks: 3 },
        { idMatkul: 'MAT005', kodeMatkul: 'PW101', namaMatkul: 'Pemrograman Web', sks: 3 },
        { idMatkul: 'MAT006', kodeMatkul: 'KB101', namaMatkul: 'Kecerdasan Buatan', sks: 3 },
        { idMatkul: 'MAT007', kodeMatkul: 'BDL101', namaMatkul: 'Basis Data Lanjut', sks: 3 },
    ]

    for (const c of demoCourses) {
        await prisma.mataKuliah.upsert({
            where: { idMatkul: c.idMatkul },
            update: { kodeMatkul: c.kodeMatkul, namaMatkul: c.namaMatkul, sks: c.sks },
            create: { idMatkul: c.idMatkul, kodeMatkul: c.kodeMatkul, namaMatkul: c.namaMatkul, sks: c.sks },
        })
    }

    // Ensure additional mahasiswa/pengguna referenced by frontend mock exist
    await prisma.pengguna.upsert({
        where: { id: '535240075' },
        update: {
            username: 'guest075@stu.untar.ac.id',
            nama: 'Guest Mahasiswa 075',
            role: Role.MAHASISWA,
            isAktif: true,
            password: hashedPassword,
            deletedAt: null,
        },
        create: {
            id: '535240075',
            username: 'guest075@stu.untar.ac.id',
            nama: 'Guest Mahasiswa 075',
            role: Role.MAHASISWA,
            isAktif: true,
            password: hashedPassword,
        },
    })

    await prisma.mahasiswa.upsert({
        where: { nim: '535240075' },
        update: { angkatan: '2024', tipeKelas: TipeKelas.PAGI, penggunaId: '535240075' },
        create: { nim: '535240075', angkatan: '2024', tipeKelas: TipeKelas.PAGI, penggunaId: '535240075' },
    })

    // Kelas and Jadwal for demo courses
    const demoKelas = [
        { idKelas: 'KEL003', namaKelas: 'SD-01', matkulId: 'MAT004', ruanganId: 'R001' },
        { idKelas: 'KEL004', namaKelas: 'PW-01', matkulId: 'MAT005', ruanganId: 'R002' },
        { idKelas: 'KEL005', namaKelas: 'KB-01', matkulId: 'MAT006', ruanganId: 'R002' },
        { idKelas: 'KEL006', namaKelas: 'BDL-01', matkulId: 'MAT007', ruanganId: 'R001' },
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

    const demoJadwal = [
        { idJadwal: 'JAD002', hari: 'Senin', jamMulai: new Date('2026-05-29T08:00:00.000Z'), jamSelesai: new Date('2026-05-29T10:00:00.000Z'), kelasId: 'KEL003', ruanganId: 'R001', pengajarNip: '198808122015032002' },
        { idJadwal: 'JAD003', hari: 'Senin', jamMulai: new Date('2026-05-29T10:30:00.000Z'), jamSelesai: new Date('2026-05-29T12:30:00.000Z'), kelasId: 'KEL004', ruanganId: 'R002', pengajarNip: '198503152010121001' },
        { idJadwal: 'JAD004', hari: 'Rabu', jamMulai: new Date('2026-05-31T13:00:00.000Z'), jamSelesai: new Date('2026-05-31T15:00:00.000Z'), kelasId: 'KEL005', ruanganId: 'R002', pengajarNip: '198808122015032002' },
        { idJadwal: 'JAD005', hari: 'Rabu', jamMulai: new Date('2026-05-19T08:00:00.000Z'), jamSelesai: new Date('2026-05-19T10:00:00.000Z'), kelasId: 'KEL006', ruanganId: 'R001', pengajarNip: '198503152010121001' },
    ]

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

    // Create sessions for demo jadwal
    const demoSesi = [
        { idSesi: 'S002', jadwalId: 'JAD002', pengajarNip: '198808122015032002', qrToken: 'QRTOKEN-SD-001' },
        { idSesi: 'S003', jadwalId: 'JAD003', pengajarNip: '198503152010121001', qrToken: 'QRTOKEN-PW-001' },
        { idSesi: 'S004', jadwalId: 'JAD004', pengajarNip: '198808122015032002', qrToken: 'QRTOKEN-KB-001' },
        { idSesi: 'S005', jadwalId: 'JAD005', pengajarNip: '198503152010121001', qrToken: 'QRTOKEN-BDL-001' },
    ]

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
                autoCloseAt: new Date(Date.now() + 1000 * 60 * 60),
            },
        })
    }

    // Map attendanceHistory from frontend mock to DataPresensi entries
    const mockAttendance = [
        { idPresensi: 'HIST001', mahasiswaNim: '535240187', sesiId: 'S005', statusKehadiran: 'HADIR', metodeInput: 'MANUAL', waktuAbsen: new Date('2026-05-19T08:05:00.000Z') },
        { idPresensi: 'HIST002', mahasiswaNim: '535240075', sesiId: 'S003', statusKehadiran: 'HADIR', metodeInput: 'QR', waktuAbsen: new Date('2026-05-18T10:28:00.000Z') },
        { idPresensi: 'HIST003', mahasiswaNim: '535240187', sesiId: 'S004', statusKehadiran: 'TERLAMBAT', metodeInput: 'QR', waktuAbsen: new Date('2026-05-17T13:17:00.000Z') },
        { idPresensi: 'HIST004', mahasiswaNim: '535240075', sesiId: 'S002', statusKehadiran: 'HADIR', metodeInput: 'QR', waktuAbsen: new Date('2026-05-16T08:02:00.000Z') },
        { idPresensi: 'HIST005', mahasiswaNim: '535240075', sesiId: 'S004', statusKehadiran: 'TERLAMBAT', metodeInput: 'MANUAL', waktuAbsen: new Date('2026-05-17T13:22:00.000Z') },
    ]

    for (const p of mockAttendance) {
        await prisma.dataPresensi.upsert({
            where: { idPresensi: p.idPresensi },
            update: {
                statusKehadiran: p.statusKehadiran,
                metodeInput: p.metodeInput,
                waktuAbsen: p.waktuAbsen,
                mahasiswa: { connect: { nim: p.mahasiswaNim } },
                sesiPresensi: { connect: { idSesi: p.sesiId } },
            },
            create: {
                idPresensi: p.idPresensi,
                statusKehadiran: p.statusKehadiran,
                metodeInput: p.metodeInput,
                waktuAbsen: p.waktuAbsen,
                mahasiswa: { connect: { nim: p.mahasiswaNim } },
                sesiPresensi: { connect: { idSesi: p.sesiId } },
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