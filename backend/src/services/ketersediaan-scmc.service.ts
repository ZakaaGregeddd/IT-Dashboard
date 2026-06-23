import { prisma } from '../config/database.js';

interface SCMCDetailInput {
  id?: string;
  urutan: number;
  keterangan: string;
  jumlah: number;
}

export class KetersediaanScmcService {
  private static DEFAULT_DETAILS = [
    { urutan: 1, keterangan: 'Realisasi Jumlah Laporan', jumlah: 0 },
    { urutan: 2, keterangan: 'Jumlah Laporan Tersedia', jumlah: 0 },
  ];

  /**
   * Fetch master and details for SCMC report availability by month & year
   */
  static async getKetersediaan(bulan: number, tahun: number) {
    const master = await prisma.laporan_ketersediaan_master.findFirst({
      where: {
        bulan,
        tahun,
        kategori_ketersediaan: 'REPORT_SCMC',
      },
      include: {
        detail_ketersediaan_scmc: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    if (!master) {
      return {
        bulan,
        tahun,
        kategori_ketersediaan: 'REPORT_SCMC',
        detail_ketersediaan_scmc: this.DEFAULT_DETAILS,
      };
    }

    return master;
  }

  /**
   * Fetch all historical SCMC data (sorted chronologically) for YTD chart
   */
  static async getAllKetersediaan() {
    return await prisma.laporan_ketersediaan_master.findMany({
      where: {
        kategori_ketersediaan: 'REPORT_SCMC',
      },
      include: {
        detail_ketersediaan_scmc: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
      orderBy: [
        { tahun: 'asc' },
        { bulan: 'asc' },
      ],
    });
  }

  /**
   * Save (Upsert Master and Sync Details) SCMC report availability data
   */
  static async saveKetersediaan(
    bulan: number,
    tahun: number,
    details: SCMCDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // Find or create master
      let master = await tx.laporan_ketersediaan_master.findFirst({
        where: {
          bulan,
          tahun,
          kategori_ketersediaan: 'REPORT_SCMC',
        },
      });

      if (!master) {
        master = await tx.laporan_ketersediaan_master.create({
          data: {
            bulan,
            tahun,
            kategori_ketersediaan: 'REPORT_SCMC',
            rata_rata_rencana_persen: 0,
            rata_rata_realisasi_persen: 0,
          },
        });
      } else {
        master = await tx.laporan_ketersediaan_master.update({
          where: { id: master.id },
          data: {
            updated_at: new Date(),
          },
        });
      }

      // Sync details
      const existingDetails = await tx.detail_ketersediaan_scmc.findMany({
        where: {
          laporan_ketersediaan_id: master.id,
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_ketersediaan_scmc.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        if (detail.id) {
          return tx.detail_ketersediaan_scmc.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              keterangan: detail.keterangan,
              jumlah: detail.jumlah,
            },
          });
        } else {
          return tx.detail_ketersediaan_scmc.create({
            data: {
              laporan_ketersediaan_id: master.id,
              kategori_ketersediaan: 'REPORT_SCMC',
              urutan: detail.urutan,
              keterangan: detail.keterangan,
              jumlah: detail.jumlah,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_ketersediaan_master.findUnique({
        where: { id: master.id },
        include: {
          detail_ketersediaan_scmc: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
