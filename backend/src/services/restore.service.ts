import { prisma } from '../config/database.js';

interface RestoreDetailInput {
  id?: string;
  urutan: number;
  bulan_teks: string;
  wo_masuk: number;
  wo_selesai: number;
}

export class RestoreService {
  private static DEFAULT_MONTHS = [
    { urutan: 1, bulan_teks: 'Januari', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 2, bulan_teks: 'Februari', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 3, bulan_teks: 'Maret', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 4, bulan_teks: 'April', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 5, bulan_teks: 'Mei', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 6, bulan_teks: 'Juni', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 7, bulan_teks: 'Juli', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 8, bulan_teks: 'Agustus', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 9, bulan_teks: 'September', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 10, bulan_teks: 'Oktober', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 11, bulan_teks: 'November', wo_masuk: 0, wo_selesai: 0 },
    { urutan: 12, bulan_teks: 'Desember', wo_masuk: 0, wo_selesai: 0 }
  ];

  static async getWorkOrder(tahun: number) {
    const master = await prisma.laporan_work_order.findFirst({
      where: {
        tahun,
        kategori_layanan: 'RESTORE_ELLIPSE',
      },
      include: {
        detail_realisasi_restore: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    if (!master) {
      const details = this.DEFAULT_MONTHS.map(m => ({
        urutan: m.urutan,
        bulan_teks: m.bulan_teks,
        wo_masuk: 0,
        wo_selesai: 0
      }));

      return {
        tahun,
        kategori_layanan: 'RESTORE_ELLIPSE',
        total_wo_masuk: 0,
        total_wo_selesai: 0,
        detail_realisasi_restore: details,
      };
    }

    const detail_realisasi_restore = master.detail_realisasi_restore.map(d => ({
      id: d.id,
      urutan: d.urutan,
      bulan_teks: d.bulan_teks,
      wo_masuk: Number(d.wo_masuk) || 0,
      wo_selesai: Number(d.wo_selesai) || 0
    }));

    return {
      id: master.id,
      tahun: master.tahun,
      kategori_layanan: 'RESTORE_ELLIPSE',
      total_wo_masuk: master.total_wo_masuk,
      total_wo_selesai: master.total_wo_selesai,
      detail_realisasi_restore,
    };
  }

  static async getAllWorkOrders() {
    return await prisma.laporan_work_order.findMany({
      where: {
        kategori_layanan: 'RESTORE_ELLIPSE',
      },
      include: {
        detail_realisasi_restore: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
      orderBy: [
        { tahun: 'asc' },
      ],
    });
  }

  static async saveWorkOrder(
    tahun: number,
    details: RestoreDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      const totalMasuk = details.reduce((acc, cur) => acc + (cur.wo_masuk || 0), 0);
      const totalSelesai = details.reduce((acc, cur) => acc + (cur.wo_selesai || 0), 0);

      let master = await tx.laporan_work_order.findFirst({
        where: {
          tahun,
          kategori_layanan: 'RESTORE_ELLIPSE',
        },
      });

      if (!master) {
        master = await tx.laporan_work_order.create({
          data: {
            tahun,
            kategori_layanan: 'RESTORE_ELLIPSE',
            total_wo_masuk: totalMasuk,
            total_wo_selesai: totalSelesai,
          },
        });
      } else {
        master = await tx.laporan_work_order.update({
          where: { id: master.id },
          data: {
            total_wo_masuk: totalMasuk,
            total_wo_selesai: totalSelesai,
            updated_at: new Date(),
          },
        });
      }

      const existingDetails = await tx.detail_realisasi_restore.findMany({
        where: {
          laporan_wo_id: master.id,
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_realisasi_restore.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        if (detail.id) {
          return tx.detail_realisasi_restore.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              bulan_teks: detail.bulan_teks,
              wo_masuk: detail.wo_masuk,
              wo_selesai: detail.wo_selesai,
            },
          });
        } else {
          return tx.detail_realisasi_restore.create({
            data: {
              laporan_wo_id: master.id,
              kategori_layanan: 'RESTORE_ELLIPSE',
              urutan: detail.urutan,
              bulan_teks: detail.bulan_teks,
              wo_masuk: detail.wo_masuk,
              wo_selesai: detail.wo_selesai,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_work_order.findUnique({
        where: { id: master.id },
        include: {
          detail_realisasi_restore: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
