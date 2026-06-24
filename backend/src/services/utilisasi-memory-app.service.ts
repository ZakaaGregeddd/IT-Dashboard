import { prisma } from '../config/database.js';

interface MemoryAppDetailInput {
  id?: string;
  urutan: number;
  nama_sistem: string;
  memory_gb: number;
  utilisasi_gb: number;
  free_persen: number;
  utilisasi_persen: number;
}

export class UtilisasiMemoryAppService {
  private static DEFAULT_DETAILS = [
    { urutan: 1, nama_sistem: 'CISEA', memory_gb: 0, utilisasi_gb: 0, free_persen: 0, utilisasi_persen: 0 },
    { urutan: 2, nama_sistem: 'Ellipse', memory_gb: 0, utilisasi_gb: 0, free_persen: 0, utilisasi_persen: 0 }
  ];

  /**
   * Fetch master and details for application Memory utilization by month & year.
   */
  static async getKetersediaan(bulan: number, tahun: number) {
    const master = await prisma.laporan_infrastruktur_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_infrastruktur: 'MEMORY_APLIKASI',
      },
      include: {
        detail_memory_aplikasi: true,
      },
    });

    if (!master) {
      return {
        bulan,
        tahun,
        tipe_infrastruktur: 'MEMORY_APLIKASI',
        detail_memory_aplikasi: this.DEFAULT_DETAILS,
      };
    }

    const detail_memory_aplikasi = this.DEFAULT_DETAILS.map((def) => {
      const match = master.detail_memory_aplikasi.find(
        (d) => d.nama_sistem.toLowerCase() === def.nama_sistem.toLowerCase()
      );

      const memory = match ? (Number(match.memory_gb) ?? 0) : 0;
      const utilisasi = match ? (Number(match.utilisasi_gb) ?? 0) : 0;
      const p = memory > 0 ? (utilisasi / memory) * 100 : 0;
      const f = 100 - p;

      return {
        id: match?.id,
        urutan: def.urutan,
        nama_sistem: def.nama_sistem,
        memory_gb: memory,
        utilisasi_gb: utilisasi,
        free_persen: f,
        utilisasi_persen: p,
      };
    });

    return {
      id: master.id,
      bulan,
      tahun,
      tipe_infrastruktur: 'MEMORY_APLIKASI',
      detail_memory_aplikasi,
    };
  }

  static async getUtilisasi(bulan: number, tahun: number) {
    return this.getKetersediaan(bulan, tahun);
  }

  /**
   * Fetch all historical Application Memory records for YTD chart
   */
  static async getAllUtilisasi() {
    const records = await prisma.laporan_infrastruktur_master.findMany({
      where: {
        tipe_infrastruktur: 'MEMORY_APLIKASI',
      },
      include: {
        detail_memory_aplikasi: {
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

    return records.map(rec => ({
      id: rec.id,
      bulan: rec.bulan,
      tahun: rec.tahun,
      tipe_infrastruktur: rec.tipe_infrastruktur,
      created_at: rec.created_at,
      updated_at: rec.updated_at,
      detail_memory_aplikasi: rec.detail_memory_aplikasi.map(d => ({
        id: d.id,
        urutan: d.urutan,
        nama_sistem: d.nama_sistem,
        memory_gb: Number(d.memory_gb) || 0,
        utilisasi_gb: Number(d.utilisasi_gb) || 0,
        free_persen: Number(d.free_persen) || 0,
        utilisasi_persen: Number(d.utilisasi_persen) || 0
      }))
    }));
  }

  /**
   * Save (Upsert Master and Sync Details) Application Memory utilization data
   */
  static async saveUtilisasi(
    bulan: number,
    tahun: number,
    details: MemoryAppDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      let master = await tx.laporan_infrastruktur_master.findFirst({
        where: {
          bulan,
          tahun,
          tipe_infrastruktur: 'MEMORY_APLIKASI',
        },
      });

      if (!master) {
        master = await tx.laporan_infrastruktur_master.create({
          data: {
            bulan,
            tahun,
            tipe_infrastruktur: 'MEMORY_APLIKASI',
          },
        });
      } else {
        await tx.laporan_infrastruktur_master.update({
          where: { id: master.id },
          data: {
            updated_at: new Date(),
          },
        });
      }

      const existingDetails = await tx.detail_memory_aplikasi.findMany({
        where: {
          laporan_infrastruktur_id: master.id,
          tipe_infrastruktur: 'MEMORY_APLIKASI',
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_memory_aplikasi.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        const p = detail.memory_gb > 0 ? (detail.utilisasi_gb / detail.memory_gb) * 100 : 0;
        const f = 100 - p;

        if (detail.id) {
          return tx.detail_memory_aplikasi.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              memory_gb: detail.memory_gb,
              utilisasi_gb: detail.utilisasi_gb,
              free_persen: f,
              utilisasi_persen: p,
            },
          });
        } else {
          return tx.detail_memory_aplikasi.create({
            data: {
              laporan_infrastruktur_id: master.id,
              tipe_infrastruktur: 'MEMORY_APLIKASI',
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              memory_gb: detail.memory_gb,
              utilisasi_gb: detail.utilisasi_gb,
              free_persen: f,
              utilisasi_persen: p,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      const updatedMaster = await tx.laporan_infrastruktur_master.findUnique({
        where: { id: master.id },
        include: {
          detail_memory_aplikasi: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });

      if (!updatedMaster) return null;

      return {
        id: updatedMaster.id,
        bulan: updatedMaster.bulan,
        tahun: updatedMaster.tahun,
        tipe_infrastruktur: updatedMaster.tipe_infrastruktur,
        detail_memory_aplikasi: updatedMaster.detail_memory_aplikasi.map(d => ({
          id: d.id,
          urutan: d.urutan,
          nama_sistem: d.nama_sistem,
          memory_gb: Number(d.memory_gb) || 0,
          utilisasi_gb: Number(d.utilisasi_gb) || 0,
          free_persen: Number(d.free_persen) || 0,
          utilisasi_persen: Number(d.utilisasi_persen) || 0
        }))
      };
    });
  }
}
