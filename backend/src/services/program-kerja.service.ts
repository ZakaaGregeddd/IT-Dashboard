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
   * Fetch master and details of Program Kerja TI for a specific month and year
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

    return master;
  }

  /**
   * Fetch all master and details of Program Kerja TI
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
   * Save (Upsert Master and Sync Details) Program Kerja TI
   */
  static async saveProgramKerja(
    bulan: number,
    tahun: number,
    details: ProgramKerjaDetailInput[]
  ) {
    // We use a transaction to ensure all db operations are atomic
    return await prisma.$transaction(async (tx) => {
      // 1. Find or Create the Master Record
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

      // 2. Identify existing details in the database for this master
      const existingDetails = await tx.detail_program_kerja_ti.findMany({
        where: {
          laporan_infrastruktur_id: master.id,
          tipe_infrastruktur: 'PROGRAM_KERJA_TI',
        },
      });

      const incomingIds = details.filter(d => d.id).map(d => d.id as string);
      const detailsToRemove = existingDetails.filter(d => !incomingIds.includes(d.id));

      // 3. Delete details that were removed in the frontend
      if (detailsToRemove.length > 0) {
        await tx.detail_program_kerja_ti.deleteMany({
          where: {
            id: {
              in: detailsToRemove.map(d => d.id),
            },
          },
        });
      }

      // 4. Upsert (create/update) the incoming details
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

      // 5. Fetch and return the fully updated master with its details
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
}
