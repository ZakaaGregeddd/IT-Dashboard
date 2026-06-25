import { prisma } from '../config/database.js';

interface RKAPDetailInput {
  id?: string;
  urutan: number;
  nama_metrik: string;
  nilai_nominal: number;
}

export class RKAPService {
  /**
   * Fetch master and details of RKAP TI for a specific month and year
   */
  static async getRKAP(bulan: number, tahun: number) {
    const master = await prisma.laporan_rkap_ti.findFirst({
      where: {
        bulan,
        tahun,
      },
      include: {
        detail_rkap_ti: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    if (!master) {
      const latestMaster = await prisma.laporan_rkap_ti.findFirst({
        orderBy: [
          { tahun: 'desc' },
          { bulan: 'desc' },
        ],
        include: {
          detail_rkap_ti: {
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
          kalkulasi_cost_reduction_rp: Number(latestMaster.kalkulasi_cost_reduction_rp) || 0,
          kalkulasi_persentase_realisasi: Number(latestMaster.kalkulasi_persentase_realisasi) || 0,
          detail_rkap_ti: latestMaster.detail_rkap_ti.map(d => ({
            urutan: d.urutan,
            nama_metrik: d.nama_metrik,
            nilai_nominal: Number(d.nilai_nominal) || 0,
          })),
        };
      }
    }

    return master;
  }

  /**
   * Fetch all master and details of RKAP TI
   */
  static async getAllRKAP() {
    const masters = await prisma.laporan_rkap_ti.findMany({
      include: {
        detail_rkap_ti: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
      orderBy: [
        { tahun: 'asc' },
        { bulan: 'asc' }
      ]
    });

    return masters;
  }

  /**
   * Save (Upsert Master and Sync Details) RKAP TI
   */
  static async saveRKAP(
    bulan: number,
    tahun: number,
    kalkulasi_cost_reduction_rp: number,
    kalkulasi_persentase_realisasi: number,
    details: RKAPDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Find or Create the Master Record
      let master = await tx.laporan_rkap_ti.findFirst({
        where: {
          bulan,
          tahun,
        },
      });

      if (!master) {
        master = await tx.laporan_rkap_ti.create({
          data: {
            bulan,
            tahun,
            kalkulasi_cost_reduction_rp,
            kalkulasi_persentase_realisasi,
          },
        });
      } else {
        master = await tx.laporan_rkap_ti.update({
          where: { id: master.id },
          data: {
            kalkulasi_cost_reduction_rp,
            kalkulasi_persentase_realisasi,
            updated_at: new Date(),
          },
        });
      }

      // 2. Identify existing details in the database for this master
      const existingDetails = await tx.detail_rkap_ti.findMany({
        where: {
          laporan_rkap_id: master.id,
        },
      });

      const incomingIds = details.filter(d => d.id).map(d => d.id as string);
      const detailsToRemove = existingDetails.filter(d => !incomingIds.includes(d.id));

      // 3. Delete details that were removed
      if (detailsToRemove.length > 0) {
        await tx.detail_rkap_ti.deleteMany({
          where: {
            id: {
              in: detailsToRemove.map(d => d.id),
            },
          },
        });
      }

      // 4. Upsert the incoming details
      const upsertPromises = details.map((detail) => {
        if (detail.id) {
          return tx.detail_rkap_ti.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_metrik: detail.nama_metrik,
              nilai_nominal: detail.nilai_nominal,
              updated_at: new Date(),
            },
          });
        } else {
          return tx.detail_rkap_ti.create({
            data: {
              laporan_rkap_id: master.id,
              urutan: detail.urutan,
              nama_metrik: detail.nama_metrik,
              nilai_nominal: detail.nilai_nominal,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      // 5. Fetch and return the fully updated master with its details
      return await tx.laporan_rkap_ti.findUnique({
        where: { id: master.id },
        include: {
          detail_rkap_ti: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
