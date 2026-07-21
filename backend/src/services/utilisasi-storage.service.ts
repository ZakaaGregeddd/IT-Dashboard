import { prisma } from '../config/database.js';

interface StorageDetailInput {
  id?: string;
  urutan: number;
  nama_storage: string;
  capacity_tb: number;
  utilisasi_tb: number;
  free_tb: number;
  utilisasi_persen: number;
}

export class UtilisasiStorageService {
  private static DEFAULT_DETAILS = [
    { urutan: 1, nama_storage: 'TJE-UNITY-DATA-1', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 2, nama_storage: 'TJE-UNITY-DATA-2', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 3, nama_storage: 'TJE-UNITY-DATA-3', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 4, nama_storage: 'TJE-UNITY-DATA-4', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 5, nama_storage: 'TJE-UNITY-DATA-5', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 6, nama_storage: 'STEVPS-LNV1', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 7, nama_storage: 'STEVPS-LNV2', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 8, nama_storage: 'STEVPS-LNV3', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 9, nama_storage: 'STEVPS-LNV4', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 10, nama_storage: 'STEVPS-LNV5', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 11, nama_storage: 'STEVPS-LNV6', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 12, nama_storage: 'STEVPS-LNV7', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 13, nama_storage: 'STEVPS-LNV8', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 14, nama_storage: 'STEVPS-SQL1', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 15, nama_storage: 'STEVPS-EXCH1', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
    { urutan: 16, nama_storage: 'STEVPS-EXCH2', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  ];

  /**
   * Ambil data master dan detail untuk utilisasi storage server berdasarkan bulan & tahun.
   */
  static async getKetersediaan(bulan: number, tahun: number) {
    const master = await prisma.laporan_utilisasi_server_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_utilisasi: 'SERVER_STORAGE',
      },
      include: {
        detail_utilisasi_storage: true,
      },
    });

    const target_utilisasi_persen = master?.target_utilisasi_persen 
      ? Number(master.target_utilisasi_persen)
      : 90;

    if (!master) {
      const latestMaster = await prisma.laporan_utilisasi_server_master.findFirst({
        where: {
          tipe_utilisasi: 'SERVER_STORAGE',
        },
        orderBy: [
          { tahun: 'desc' },
          { bulan: 'desc' },
        ],
        include: {
          detail_utilisasi_storage: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });

      if (latestMaster) {
        const details = latestMaster.detail_utilisasi_storage.map(d => ({
          urutan: d.urutan,
          nama_storage: d.nama_storage,
          capacity_tb: 0,
          utilisasi_tb: 0,
          free_tb: 0,
          utilisasi_persen: 0,
        }));

        return {
          bulan,
          tahun,
          tipe_utilisasi: 'SERVER_STORAGE',
          rata_rata_utilisasi_persen: 0,
          total_kapasitas: 0,
          total_utilisasi: 0,
          total_free: 0,
          target_utilisasi_persen: Number(latestMaster.target_utilisasi_persen) || 90,
          detail_utilisasi_storage: details,
        };
      }

      return {
        bulan,
        tahun,
        tipe_utilisasi: 'SERVER_STORAGE',
        rata_rata_utilisasi_persen: 0,
        total_kapasitas: 0,
        total_utilisasi: 0,
        total_free: 0,
        target_utilisasi_persen,
        detail_utilisasi_storage: this.DEFAULT_DETAILS,
      };
    }

    const detail_utilisasi_storage = this.DEFAULT_DETAILS.map((def) => {
      const match = master.detail_utilisasi_storage.find(
        (d) => d.nama_storage.toLowerCase() === def.nama_storage.toLowerCase()
      );

      const capacity = match ? (Number(match.capacity_tb) ?? def.capacity_tb) : def.capacity_tb;
      const utilisasi = match ? (Number(match.utilisasi_tb) ?? 0) : 0;
      const free = capacity - utilisasi;
      const p = capacity > 0 ? (utilisasi / capacity) * 100 : 0;

      return {
        id: match?.id,
        urutan: def.urutan,
        nama_storage: def.nama_storage,
        capacity_tb: capacity,
        utilisasi_tb: utilisasi,
        free_tb: free,
        utilisasi_persen: p,
      };
    });

    const totalCapacity = detail_utilisasi_storage.reduce((acc, cur) => acc + cur.capacity_tb, 0);
    const totalUtil = detail_utilisasi_storage.reduce((acc, cur) => acc + cur.utilisasi_tb, 0);
    const avgUtil = totalCapacity > 0 ? (totalUtil / totalCapacity) * 100 : 0;

    return {
      id: master.id,
      bulan,
      tahun,
      tipe_utilisasi: 'SERVER_STORAGE',
      rata_rata_utilisasi_persen: avgUtil,
      total_kapasitas: totalCapacity,
      total_utilisasi: totalUtil,
      total_free: totalCapacity - totalUtil,
      target_utilisasi_persen,
      detail_utilisasi_storage,
    };
  }

  static async getUtilisasi(bulan: number, tahun: number) {
    return this.getKetersediaan(bulan, tahun);
  }

  /**
   * Ambil semua riwayat record Storage untuk chart YTD
   */
  static async getAllUtilisasi() {
    return await prisma.laporan_utilisasi_server_master.findMany({
      where: {
        tipe_utilisasi: 'SERVER_STORAGE',
      },
      include: {
        detail_utilisasi_storage: {
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
   * Simpan (Upsert Master dan Sinkronisasi Detail) data utilisasi storage server
   */
  static async saveUtilisasi(
    bulan: number,
    tahun: number,
    target_utilisasi_persen: number,
    details: StorageDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      const totalCapacity = details.reduce((acc, cur) => acc + (cur.capacity_tb || 0), 0);
      const totalUtil = details.reduce((acc, cur) => acc + (cur.utilisasi_tb || 0), 0);
      const avgUtil = totalCapacity > 0 ? (totalUtil / totalCapacity) * 100 : 0;
      const totalFree = totalCapacity - totalUtil;

      let master = await tx.laporan_utilisasi_server_master.findFirst({
        where: {
          bulan,
          tahun,
          tipe_utilisasi: 'SERVER_STORAGE',
        },
      });

      if (!master) {
        master = await tx.laporan_utilisasi_server_master.create({
          data: {
            bulan,
            tahun,
            tipe_utilisasi: 'SERVER_STORAGE',
            rata_rata_utilisasi_persen: avgUtil,
            total_kapasitas: totalCapacity,
            total_utilisasi: totalUtil,
            total_free: totalFree,
            target_utilisasi_persen,
          },
        });
      } else {
        master = await tx.laporan_utilisasi_server_master.update({
          where: { id: master.id },
          data: {
            rata_rata_utilisasi_persen: avgUtil,
            total_kapasitas: totalCapacity,
            total_utilisasi: totalUtil,
            total_free: totalFree,
            target_utilisasi_persen,
            updated_at: new Date(),
          },
        });
      }

      const existingDetails = await tx.detail_utilisasi_storage.findMany({
        where: {
          laporan_utilisasi_id: master.id,
          tipe_utilisasi: 'SERVER_STORAGE',
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_utilisasi_storage.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        const p = detail.capacity_tb > 0 ? (detail.utilisasi_tb / detail.capacity_tb) * 100 : 0;
        const f = detail.capacity_tb - detail.utilisasi_tb;

        if (detail.id) {
          return tx.detail_utilisasi_storage.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_storage: detail.nama_storage,
              capacity_tb: detail.capacity_tb,
              utilisasi_tb: detail.utilisasi_tb,
              free_tb: f,
              utilisasi_persen: p,
            },
          });
        } else {
          return tx.detail_utilisasi_storage.create({
            data: {
              laporan_utilisasi_id: master.id,
              tipe_utilisasi: 'SERVER_STORAGE',
              urutan: detail.urutan,
              nama_storage: detail.nama_storage,
              capacity_tb: detail.capacity_tb,
              utilisasi_tb: detail.utilisasi_tb,
              free_tb: f,
              utilisasi_persen: p,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_utilisasi_server_master.findUnique({
        where: { id: master.id },
        include: {
          detail_utilisasi_storage: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }

  /**
   * Hapus data utilisasi Storage server berdasarkan bulan & tahun
   */
  static async deleteUtilisasi(bulan: number, tahun: number) {
    const master = await prisma.laporan_utilisasi_server_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_utilisasi: 'SERVER_STORAGE',
      },
    });

    if (!master) {
      return false;
    }

    await prisma.laporan_utilisasi_server_master.delete({
      where: { id: master.id },
    });

    return true;
  }
}

