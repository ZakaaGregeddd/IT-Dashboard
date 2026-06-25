import { prisma } from '../config/database.js';

interface SistemDetailInput {
  id?: string;
  urutan: number;
  nama_sistem: string;
  rencana_persen: number;
  realisasi_persen: number;
}

export class KetersediaanSistemService {
  private static DEFAULT_DETAILS = [
    { urutan: 1, nama_sistem: 'Ellipse', rencana_persen: 0, realisasi_persen: 0 },
    { urutan: 2, nama_sistem: 'Email', rencana_persen: 0, realisasi_persen: 0 },
    { urutan: 3, nama_sistem: 'CISEA', rencana_persen: 0, realisasi_persen: 0 },
    { urutan: 4, nama_sistem: 'SIMKES', rencana_persen: 0, realisasi_persen: 0 },
  ];

  /**
   * Fetch master and details for system availability by month & year
   */
  static async getKetersediaan(bulan: number, tahun: number) {
    const master = await prisma.laporan_ketersediaan_master.findFirst({
      where: {
        bulan,
        tahun,
        kategori_ketersediaan: 'SISTEM_APLIKASI',
      },
      include: {
        detail_ketersediaan_sistem: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    if (!master) {
      const latestMaster = await prisma.laporan_ketersediaan_master.findFirst({
        where: {
          kategori_ketersediaan: 'SISTEM_APLIKASI',
        },
        orderBy: [
          { tahun: 'desc' },
          { bulan: 'desc' },
        ],
        include: {
          detail_ketersediaan_sistem: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });

      if (latestMaster) {
        const details = latestMaster.detail_ketersediaan_sistem.map(d => ({
          urutan: d.urutan,
          nama_sistem: d.nama_sistem,
          rencana_persen: 0,
          realisasi_persen: 0,
        }));

        return {
          bulan,
          tahun,
          kategori_ketersediaan: 'SISTEM_APLIKASI',
          rata_rata_rencana_persen: 0,
          rata_rata_realisasi_persen: 0,
          detail_ketersediaan_sistem: details,
        };
      }

      return {
        bulan,
        tahun,
        kategori_ketersediaan: 'SISTEM_APLIKASI',
        detail_ketersediaan_sistem: this.DEFAULT_DETAILS,
      };
    }

    const detail_ketersediaan_sistem = this.DEFAULT_DETAILS.map((def) => {
      const match = master.detail_ketersediaan_sistem.find(
        (d) => d.nama_sistem.toLowerCase() === def.nama_sistem.toLowerCase()
      );
      return {
        id: match?.id,
        urutan: def.urutan,
        nama_sistem: def.nama_sistem,
        rencana_persen: match ? (match.rencana_persen ?? 0) : 0,
        realisasi_persen: match ? (match.realisasi_persen ?? 0) : 0,
      };
    });

    return {
      id: master.id,
      bulan: master.bulan,
      tahun: master.tahun,
      kategori_ketersediaan: 'SISTEM_APLIKASI',
      rata_rata_rencana_persen: master.rata_rata_rencana_persen,
      rata_rata_realisasi_persen: master.rata_rata_realisasi_persen,
      detail_ketersediaan_sistem,
    };
  }

  /**
   * Fetch all historical system availability data (sorted chronologically) for YTD chart
   */
  static async getAllKetersediaan() {
    return await prisma.laporan_ketersediaan_master.findMany({
      where: {
        kategori_ketersediaan: 'SISTEM_APLIKASI',
      },
      include: {
        detail_ketersediaan_sistem: {
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
   * Save (Upsert Master and Sync Details) system availability data
   */
  static async saveKetersediaan(
    bulan: number,
    tahun: number,
    details: SistemDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // Calculate averages to store in master if required
      const totalRencana = details.reduce((acc, cur) => acc + (cur.rencana_persen || 0), 0);
      const totalRealisasi = details.reduce((acc, cur) => acc + (cur.realisasi_persen || 0), 0);
      const avgRencana = details.length > 0 ? (totalRencana / details.length) : 0;
      const avgRealisasi = details.length > 0 ? (totalRealisasi / details.length) : 0;

      // Find or create master
      let master = await tx.laporan_ketersediaan_master.findFirst({
        where: {
          bulan,
          tahun,
          kategori_ketersediaan: 'SISTEM_APLIKASI',
        },
      });

      if (!master) {
        master = await tx.laporan_ketersediaan_master.create({
          data: {
            bulan,
            tahun,
            kategori_ketersediaan: 'SISTEM_APLIKASI',
            rata_rata_rencana_persen: avgRencana,
            rata_rata_realisasi_persen: avgRealisasi,
          },
        });
      } else {
        master = await tx.laporan_ketersediaan_master.update({
          where: { id: master.id },
          data: {
            rata_rata_rencana_persen: avgRencana,
            rata_rata_realisasi_persen: avgRealisasi,
            updated_at: new Date(),
          },
        });
      }

      // Sync details
      const existingDetails = await tx.detail_ketersediaan_sistem.findMany({
        where: {
          laporan_ketersediaan_id: master.id,
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_ketersediaan_sistem.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        if (detail.id) {
          return tx.detail_ketersediaan_sistem.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              rencana_persen: detail.rencana_persen,
              realisasi_persen: detail.realisasi_persen,
            },
          });
        } else {
          return tx.detail_ketersediaan_sistem.create({
            data: {
              laporan_ketersediaan_id: master.id,
              kategori_ketersediaan: 'SISTEM_APLIKASI',
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              rencana_persen: detail.rencana_persen,
              realisasi_persen: detail.realisasi_persen,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_ketersediaan_master.findUnique({
        where: { id: master.id },
        include: {
          detail_ketersediaan_sistem: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
