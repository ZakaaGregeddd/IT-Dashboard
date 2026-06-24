import { prisma } from '../config/database.js';

interface MemoryDatabaseDetailInput {
  id?: string;
  urutan: number;
  nama_sistem: string;
  memory_gb: number;
  utilisasi_gb: number;
  free_persen?: number;
  utilisasi_persen?: number;
}

export class UtilisasiMemoryDbService {
  private static DEFAULT_SYSTEMS = [
    { urutan: 1, nama_sistem: 'CISEA', memory_gb: 0, utilisasi_gb: 0, free_persen: 100, utilisasi_persen: 0 },
    { urutan: 2, nama_sistem: 'Ellipse', memory_gb: 0, utilisasi_gb: 0, free_persen: 100, utilisasi_persen: 0 },
  ];

  static async getUtilisasi(bulan: number, tahun: number) {
    const latestMaster = await prisma.laporan_infrastruktur_master.findFirst({
      where: {
        tipe_infrastruktur: 'MEMORY_DATABASE',
      },
      orderBy: [
        { tahun: 'desc' },
        { bulan: 'desc' },
      ],
      include: {
        detail_memory_db_aplikasi: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    const currentMaster = await prisma.laporan_infrastruktur_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_infrastruktur: 'MEMORY_DATABASE',
      },
      include: {
        detail_memory_db_aplikasi: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    if (!currentMaster && !latestMaster) {
      return {
        bulan,
        tahun,
        tipe_infrastruktur: 'MEMORY_DATABASE',
        detail_memory_db_aplikasi: this.DEFAULT_SYSTEMS,
      };
    }

    const activeMaster = (currentMaster || latestMaster)!;
    const detail_memory_db_aplikasi = activeMaster.detail_memory_db_aplikasi.map((s) => {
      const currentMatch = currentMaster?.detail_memory_db_aplikasi.find(
        (c) => c.nama_sistem.toLowerCase() === s.nama_sistem.toLowerCase()
      );

      if (currentMatch) {
        return {
          id: currentMatch.id,
          urutan: currentMatch.urutan,
          nama_sistem: currentMatch.nama_sistem,
          memory_gb: Number(currentMatch.memory_gb) || 0,
          utilisasi_gb: Number(currentMatch.utilisasi_gb) || 0,
          free_persen: Number(currentMatch.free_persen) || 0,
          utilisasi_persen: Number(currentMatch.utilisasi_persen) || 0,
        };
      } else {
        const defaultMatch = this.DEFAULT_SYSTEMS.find(
          (d) => d.nama_sistem.toLowerCase() === s.nama_sistem.toLowerCase()
        );
        return {
          urutan: s.urutan,
          nama_sistem: s.nama_sistem,
          memory_gb: defaultMatch ? defaultMatch.memory_gb : 0,
          utilisasi_gb: defaultMatch ? defaultMatch.utilisasi_gb : 0,
          free_persen: defaultMatch ? defaultMatch.free_persen : 100,
          utilisasi_persen: defaultMatch ? defaultMatch.utilisasi_persen : 0,
        };
      }
    });

    return {
      id: currentMaster?.id,
      bulan,
      tahun,
      tipe_infrastruktur: 'MEMORY_DATABASE',
      detail_memory_db_aplikasi,
    };
  }

  static async getAllUtilisasi() {
    return await prisma.laporan_infrastruktur_master.findMany({
      where: {
        tipe_infrastruktur: 'MEMORY_DATABASE',
      },
      include: {
        detail_memory_db_aplikasi: {
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

  static async saveUtilisasi(
    bulan: number,
    tahun: number,
    details: MemoryDatabaseDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      let master = await tx.laporan_infrastruktur_master.findFirst({
        where: {
          bulan,
          tahun,
          tipe_infrastruktur: 'MEMORY_DATABASE',
        },
      });

      if (!master) {
        master = await tx.laporan_infrastruktur_master.create({
          data: {
            bulan,
            tahun,
            tipe_infrastruktur: 'MEMORY_DATABASE',
          },
        });
      } else {
        master = await tx.laporan_infrastruktur_master.update({
          where: { id: master.id },
          data: {
            updated_at: new Date(),
          },
        });
      }

      const existingDetails = await tx.detail_memory_db_aplikasi.findMany({
        where: {
          laporan_infrastruktur_id: master.id,
          tipe_infrastruktur: 'MEMORY_DATABASE',
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_memory_db_aplikasi.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        const memGb = Number(detail.memory_gb) || 0;
        const utilisasiGb = Number(detail.utilisasi_gb) || 0;
        const utilisasiPersen = memGb > 0 ? (utilisasiGb / memGb) * 100 : 0;
        const freePersen = 100 - utilisasiPersen;

        if (detail.id) {
          return tx.detail_memory_db_aplikasi.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              memory_gb: memGb,
              utilisasi_gb: utilisasiGb,
              free_persen: freePersen,
              utilisasi_persen: utilisasiPersen,
            },
          });
        } else {
          return tx.detail_memory_db_aplikasi.create({
            data: {
              laporan_infrastruktur_id: master.id,
              tipe_infrastruktur: 'MEMORY_DATABASE',
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              memory_gb: memGb,
              utilisasi_gb: utilisasiGb,
              free_persen: freePersen,
              utilisasi_persen: utilisasiPersen,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_infrastruktur_master.findUnique({
        where: { id: master.id },
        include: {
          detail_memory_db_aplikasi: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
