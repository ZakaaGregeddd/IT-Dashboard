import { prisma } from '../config/database.js';

interface PcSupportDetailInput {
  id?: string;
  urutan: number;
  bulan_teks: string;
  wo_masuk: number;
  wo_selesai: number;
}

export class PcSupportService {
  private static DEFAULT_MONTHS = [
    { urutan: 1, bulan_teks: 'Januari', wo_masuk: 46, wo_selesai: 46 },
    { urutan: 2, bulan_teks: 'Februari', wo_masuk: 22, wo_selesai: 22 },
    { urutan: 3, bulan_teks: 'Maret', wo_masuk: 219, wo_selesai: 219 },
    { urutan: 4, bulan_teks: 'April', wo_masuk: 61, wo_selesai: 61 },
    { urutan: 5, bulan_teks: 'Mei', wo_masuk: 221, wo_selesai: 221 },
    { urutan: 6, bulan_teks: 'Juni', wo_masuk: 282, wo_selesai: 282 },
    { urutan: 7, bulan_teks: 'Juli', wo_masuk: 312, wo_selesai: 312 },
    { urutan: 8, bulan_teks: 'Agustus', wo_masuk: 288, wo_selesai: 288 },
    { urutan: 9, bulan_teks: 'September', wo_masuk: 290, wo_selesai: 290 },
    { urutan: 10, bulan_teks: 'Oktober', wo_masuk: 302, wo_selesai: 302 },
    { urutan: 11, bulan_teks: 'November', wo_masuk: 903, wo_selesai: 903 },
    { urutan: 12, bulan_teks: 'Desember', wo_masuk: 312, wo_selesai: 312 }
  ];

  static async getWorkOrder(tahun: number) {
    const master = await prisma.laporan_work_order.findFirst({
      where: {
        tahun,
        kategori_layanan: 'PC_SUPPORT',
      },
      include: {
        detail_pc_support: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    if (!master) {
      // Seed with default data for 2024, or empty (0) for other years
      const isDefaultYear = tahun === 2024;
      const details = this.DEFAULT_MONTHS.map(m => ({
        urutan: m.urutan,
        bulan_teks: m.bulan_teks,
        wo_masuk: isDefaultYear ? m.wo_masuk : 0,
        wo_selesai: isDefaultYear ? m.wo_selesai : 0
      }));

      return {
        tahun,
        kategori_layanan: 'PC_SUPPORT',
        total_wo_masuk: details.reduce((acc, c) => acc + c.wo_masuk, 0),
        total_wo_selesai: details.reduce((acc, c) => acc + c.wo_selesai, 0),
        detail_pc_support: details,
      };
    }

    const detail_pc_support = master.detail_pc_support.map(d => ({
      id: d.id,
      urutan: d.urutan,
      bulan_teks: d.bulan_teks,
      wo_masuk: Number(d.wo_masuk) || 0,
      wo_selesai: Number(d.wo_selesai) || 0
    }));

    return {
      id: master.id,
      tahun: master.tahun,
      kategori_layanan: 'PC_SUPPORT',
      total_wo_masuk: master.total_wo_masuk,
      total_wo_selesai: master.total_wo_selesai,
      detail_pc_support,
    };
  }

  static async getAllWorkOrders() {
    return await prisma.laporan_work_order.findMany({
      where: {
        kategori_layanan: 'PC_SUPPORT',
      },
      include: {
        detail_pc_support: {
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
    details: PcSupportDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      const totalMasuk = details.reduce((acc, cur) => acc + (cur.wo_masuk || 0), 0);
      const totalSelesai = details.reduce((acc, cur) => acc + (cur.wo_selesai || 0), 0);

      let master = await tx.laporan_work_order.findFirst({
        where: {
          tahun,
          kategori_layanan: 'PC_SUPPORT',
        },
      });

      if (!master) {
        master = await tx.laporan_work_order.create({
          data: {
            tahun,
            kategori_layanan: 'PC_SUPPORT',
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

      const existingDetails = await tx.detail_pc_support.findMany({
        where: {
          laporan_wo_id: master.id,
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_pc_support.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        if (detail.id) {
          return tx.detail_pc_support.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              bulan_teks: detail.bulan_teks,
              wo_masuk: detail.wo_masuk,
              wo_selesai: detail.wo_selesai,
            },
          });
        } else {
          return tx.detail_pc_support.create({
            data: {
              laporan_wo_id: master.id,
              kategori_layanan: 'PC_SUPPORT',
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
          detail_pc_support: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
