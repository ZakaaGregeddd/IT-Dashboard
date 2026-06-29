import { prisma } from '../config/database.js';

interface MemoryDetailInput {
  id?: string;
  urutan: number;
  nama_server: string;
  memory_gb: number;
  utilisasi_gb: number;
  utilisasi_persen: number;
}

export class UtilisasiMemoryService {
  private static DEFAULT_SERVERS = [
    { urutan: 1, nama_server: 'steppl-esxi1', memory_gb: 0, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 2, nama_server: 'steppl-esxi2', memory_gb: 0, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 3, nama_server: 'steppl-esxi3', memory_gb: 0, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 4, nama_server: 'steppl-esxi4', memory_gb: 0, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 5, nama_server: 'tjevmerp1', memory_gb: 0, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 6, nama_server: 'tjevmerp2', memory_gb: 0, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 7, nama_server: 'tjevmerp3', memory_gb: 0, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 8, nama_server: 'tjevmerp4', memory_gb: 0, utilisasi_gb: 0, utilisasi_persen: 0 },
  ];

  /**
   * Ambil data master dan detail untuk utilisasi memori server berdasarkan bulan & tahun.
   * Selalu mengambil nama server dari bulan terbaru, tetapi nilainya dari bulan yang dipilih.
   */
  static async getKetersediaan(bulan: number, tahun: number) {
    // 1. Dapatkan record terbaru secara absolut untuk menentukan daftar nama server
    const latestMaster = await prisma.laporan_utilisasi_server_master.findFirst({
      where: {
        tipe_utilisasi: 'SERVER_MEMORY',
      },
      orderBy: [
        { tahun: 'desc' },
        { bulan: 'desc' },
      ],
      include: {
        detail_utilisasi_memory: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    // 2. Dapatkan record untuk bulan & tahun terpilih saat ini
    const currentMaster = await prisma.laporan_utilisasi_server_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_utilisasi: 'SERVER_MEMORY',
      },
      include: {
        detail_utilisasi_memory: true,
      },
    });

    const target_utilisasi_persen = currentMaster?.target_utilisasi_persen 
      ? Number(currentMaster.target_utilisasi_persen)
      : (latestMaster?.target_utilisasi_persen ? Number(latestMaster.target_utilisasi_persen) : 90);

    // Jika tidak ada record sama sekali di database, kembalikan default hardcoded
    if (!latestMaster) {
      return {
        bulan,
        tahun,
        tipe_utilisasi: 'SERVER_MEMORY',
        rata_rata_utilisasi_persen: 0,
        total_kapasitas: 0,
        total_utilisasi: 0,
        total_free: 0,
        target_utilisasi_persen,
        detail_utilisasi_memory: this.DEFAULT_SERVERS,
      };
    }

    // Bangun daftar detail berdasarkan daftar server terbaru
    const detail_utilisasi_memory = latestMaster.detail_utilisasi_memory.map((latestServer) => {
      // Temukan server yang cocok di periode saat ini
      const matchingCurrent = currentMaster?.detail_utilisasi_memory.find(
        (c) => c.nama_server.toLowerCase() === latestServer.nama_server.toLowerCase()
      );

      return {
        id: matchingCurrent?.id, // sertakan ID jika ada agar frontend dapat memperbaruinya
        urutan: latestServer.urutan,
        nama_server: latestServer.nama_server,
        memory_gb: currentMaster
          ? (matchingCurrent ? (Number(matchingCurrent.memory_gb) ?? 0) : 0)
          : 0,
        utilisasi_gb: currentMaster
          ? (matchingCurrent ? (Number(matchingCurrent.utilisasi_gb) ?? 0) : 0)
          : 0,
        utilisasi_persen: currentMaster
          ? (matchingCurrent ? (Number(matchingCurrent.utilisasi_persen) ?? 0) : 0)
          : 0,
      };
    });

    const totalMemory = detail_utilisasi_memory.reduce((acc, cur) => acc + cur.memory_gb, 0);
    const totalUtilMemory = detail_utilisasi_memory.reduce((acc, cur) => acc + cur.utilisasi_gb, 0);
    const avgUtil = totalMemory > 0 ? (totalUtilMemory / totalMemory) * 100 : 0;

    return {
      id: currentMaster?.id,
      bulan,
      tahun,
      tipe_utilisasi: 'SERVER_MEMORY',
      rata_rata_utilisasi_persen: avgUtil,
      total_kapasitas: totalMemory,
      total_utilisasi: totalUtilMemory,
      total_free: totalMemory - totalUtilMemory,
      target_utilisasi_persen,
      detail_utilisasi_memory,
    };
  }

  static async getUtilisasi(bulan: number, tahun: number) {
    return this.getKetersediaan(bulan, tahun);
  }

  /**
   * Ambil semua riwayat record memori untuk chart YTD
   */
  static async getAllUtilisasi() {
    return await prisma.laporan_utilisasi_server_master.findMany({
      where: {
        tipe_utilisasi: 'SERVER_MEMORY',
      },
      include: {
        detail_utilisasi_memory: {
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
   * Simpan (Upsert Master dan Sinkronisasi Detail) data utilisasi memori server
   */
  static async saveUtilisasi(
    bulan: number,
    tahun: number,
    target_utilisasi_persen: number,
    details: MemoryDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      const totalMemory = details.reduce((acc, cur) => acc + (cur.memory_gb || 0), 0);
      const totalUtilMemory = details.reduce((acc, cur) => acc + (cur.utilisasi_gb || 0), 0);
      const avgUtil = totalMemory > 0 ? (totalUtilMemory / totalMemory) * 100 : 0;
      const totalFree = totalMemory - totalUtilMemory;

      let master = await tx.laporan_utilisasi_server_master.findFirst({
        where: {
          bulan,
          tahun,
          tipe_utilisasi: 'SERVER_MEMORY',
        },
      });

      if (!master) {
        master = await tx.laporan_utilisasi_server_master.create({
          data: {
            bulan,
            tahun,
            tipe_utilisasi: 'SERVER_MEMORY',
            rata_rata_utilisasi_persen: avgUtil,
            total_kapasitas: totalMemory,
            total_utilisasi: totalUtilMemory,
            total_free: totalFree,
            target_utilisasi_persen,
          },
        });
      } else {
        master = await tx.laporan_utilisasi_server_master.update({
          where: { id: master.id },
          data: {
            rata_rata_utilisasi_persen: avgUtil,
            total_kapasitas: totalMemory,
            total_utilisasi: totalUtilMemory,
            total_free: totalFree,
            target_utilisasi_persen,
            updated_at: new Date(),
          },
        });
      }

      const existingDetails = await tx.detail_utilisasi_memory.findMany({
        where: {
          laporan_utilisasi_id: master.id,
          tipe_utilisasi: 'SERVER_MEMORY',
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_utilisasi_memory.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        const p = detail.memory_gb > 0 ? (detail.utilisasi_gb / detail.memory_gb) * 100 : 0;
        if (detail.id) {
          return tx.detail_utilisasi_memory.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_server: detail.nama_server,
              memory_gb: detail.memory_gb,
              utilisasi_gb: detail.utilisasi_gb,
              utilisasi_persen: p,
            },
          });
        } else {
          return tx.detail_utilisasi_memory.create({
            data: {
              laporan_utilisasi_id: master.id,
              tipe_utilisasi: 'SERVER_MEMORY',
              urutan: detail.urutan,
              nama_server: detail.nama_server,
              memory_gb: detail.memory_gb,
              utilisasi_gb: detail.utilisasi_gb,
              utilisasi_persen: p,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_utilisasi_server_master.findUnique({
        where: { id: master.id },
        include: {
          detail_utilisasi_memory: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
