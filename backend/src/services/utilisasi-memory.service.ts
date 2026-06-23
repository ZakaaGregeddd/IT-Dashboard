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
    { urutan: 1, nama_server: 'steppl-esxi1', memory_gb: 1024, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 2, nama_server: 'steppl-esxi2', memory_gb: 1024, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 3, nama_server: 'steppl-esxi3', memory_gb: 1024, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 4, nama_server: 'steppl-esxi4', memory_gb: 1024, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 5, nama_server: 'tjevmerp1', memory_gb: 1024, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 6, nama_server: 'tjevmerp2', memory_gb: 1024, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 7, nama_server: 'tjevmerp3', memory_gb: 1024, utilisasi_gb: 0, utilisasi_persen: 0 },
    { urutan: 8, nama_server: 'tjevmerp4', memory_gb: 1024, utilisasi_gb: 0, utilisasi_persen: 0 },
  ];

  /**
   * Fetch master and details for memory server utilization by month & year.
   */
  static async getKetersediaan(bulan: number, tahun: number) {
    const currentMaster = await prisma.laporan_utilisasi_server_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_utilisasi: 'SERVER_MEMORY',
      },
      include: {
        detail_utilisasi_memory: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    const target_utilisasi_persen = currentMaster?.target_utilisasi_persen 
      ? Number(currentMaster.target_utilisasi_persen)
      : 90;

    if (!currentMaster) {
      return {
        bulan,
        tahun,
        tipe_utilisasi: 'SERVER_MEMORY',
        rata_rata_utilisasi_persen: 0,
        total_kapasitas: 0,
        total_utilisasi: 0,
        total_free: 0,
        target_utilisasi_persen,
        detail_utilisasi_memory: [],
      };
    }

    const detail_utilisasi_memory = currentMaster.detail_utilisasi_memory.map((item) => ({
      id: item.id,
      urutan: item.urutan,
      nama_server: item.nama_server,
      memory_gb: Number(item.memory_gb) ?? 0,
      utilisasi_gb: Number(item.utilisasi_gb) ?? 0,
      utilisasi_persen: Number(item.utilisasi_persen) ?? 0,
    }));

    const totalMemory = detail_utilisasi_memory.reduce((acc, cur) => acc + cur.memory_gb, 0);
    const totalUtilMemory = detail_utilisasi_memory.reduce((acc, cur) => acc + cur.utilisasi_gb, 0);
    const avgUtil = totalMemory > 0 ? (totalUtilMemory / totalMemory) * 100 : 0;

    return {
      id: currentMaster.id,
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
   * Fetch all historical Memory records for YTD chart
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
   * Save (Upsert Master and Sync Details) Memory server utilization data
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
