import { prisma } from '../config/database.js';

interface ProgramKerjaDetailInput {
  id?: string;
  urutan: number;
  nama_program: string;
  target_persen: number;
  realisasi_persen: number;
}

export class ProgramKerjaService {
  /**
   * Ambil data master dan detail dari Program Kerja TI untuk bulan dan tahun tertentu
   */
  static async getProgramKerja(bulan: number, tahun: number) {
    const master = await prisma.laporan_infrastruktur_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_infrastruktur: 'PROGRAM_KERJA_TI',
      },
      include: {
        detail_program_kerja_ti: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    if (!master) {
      const latestMaster = await prisma.laporan_infrastruktur_master.findFirst({
        where: {
          tipe_infrastruktur: 'PROGRAM_KERJA_TI',
        },
        orderBy: [
          { tahun: 'desc' },
          { bulan: 'desc' },
        ],
        include: {
          detail_program_kerja_ti: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });

      if (latestMaster) {
        return {
          bulan,
          tahun,
          tipe_infrastruktur: 'PROGRAM_KERJA_TI',
          detail_program_kerja_ti: latestMaster.detail_program_kerja_ti.map(d => ({
            urutan: d.urutan,
            nama_program: d.nama_program,
            target_persen: 0,
            realisasi_persen: 0,
          })),
        };
      }
    }

    return master;
  }

  /**
   * Ambil semua data master dan detail dari Program Kerja TI
   */
  static async getAllProgramKerja() {
    const masters = await prisma.laporan_infrastruktur_master.findMany({
      where: {
        tipe_infrastruktur: 'PROGRAM_KERJA_TI',
      },
      include: {
        detail_program_kerja_ti: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    return masters;
  }

  /**
   * Simpan (Upsert Master dan Sinkronisasi Detail) Program Kerja TI
   */
  static async saveProgramKerja(
    bulan: number,
    tahun: number,
    details: ProgramKerjaDetailInput[]
  ) {
    // Gunakan transaksi untuk memastikan semua operasi database bersifat atomik
    return await prisma.$transaction(async (tx) => {
      // 1. Temukan atau Buat Record Master
      let master = await tx.laporan_infrastruktur_master.findFirst({
        where: {
          bulan,
          tahun,
          tipe_infrastruktur: 'PROGRAM_KERJA_TI',
        },
      });

      if (!master) {
        master = await tx.laporan_infrastruktur_master.create({
          data: {
            bulan,
            tahun,
            tipe_infrastruktur: 'PROGRAM_KERJA_TI',
          },
        });
      }

      // 2. Identifikasi detail yang sudah ada di database untuk master ini
      const existingDetails = await tx.detail_program_kerja_ti.findMany({
        where: {
          laporan_infrastruktur_id: master.id,
          tipe_infrastruktur: 'PROGRAM_KERJA_TI',
        },
      });

      const incomingIds = details.filter(d => d.id).map(d => d.id as string);
      const detailsToRemove = existingDetails.filter(d => !incomingIds.includes(d.id));

      // 3. Hapus detail yang dihapus dari frontend
      if (detailsToRemove.length > 0) {
        await tx.detail_program_kerja_ti.deleteMany({
          where: {
            id: {
              in: detailsToRemove.map(d => d.id),
            },
          },
        });
      }

      // 4. Upsert (buat/perbarui) detail yang masuk
      const upsertPromises = details.map((detail) => {
        if (detail.id) {
          return tx.detail_program_kerja_ti.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_program: detail.nama_program,
              target_persen: detail.target_persen,
              realisasi_persen: detail.realisasi_persen,
              updated_at: new Date(),
            },
          });
        } else {
          return tx.detail_program_kerja_ti.create({
            data: {
              laporan_infrastruktur_id: master.id,
              tipe_infrastruktur: 'PROGRAM_KERJA_TI',
              urutan: detail.urutan,
              nama_program: detail.nama_program,
              target_persen: detail.target_persen,
              realisasi_persen: detail.realisasi_persen,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      // 5. Ambil dan kembalikan master yang telah diperbarui sepenuhnya beserta detailnya
      return await tx.laporan_infrastruktur_master.findUnique({
        where: { id: master.id },
        include: {
          detail_program_kerja_ti: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }

  static async deleteProgramKerja(bulan: number, tahun: number) {
    const master = await prisma.laporan_infrastruktur_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_infrastruktur: 'PROGRAM_KERJA_TI',
      },
    });

    if (!master) {
      return false;
    }

    await prisma.laporan_infrastruktur_master.delete({
      where: { id: master.id },
    });

    return true;
  }
}

