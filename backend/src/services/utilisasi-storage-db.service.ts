import { prisma } from '../config/database.js';

interface StorageDatabaseDetailInput {
  id?: string;
  urutan: number;
  nama_sistem: string;
  storage_tb: number;
  utilisasi_tb: number;
  free_persen?: number;
  utilisasi_persen?: number;
}

export class UtilisasiStorageDbService {
  private static DEFAULT_SYSTEMS = [
    { urutan: 1, nama_sistem: 'CISEA', storage_tb: 0, utilisasi_tb: 0, free_persen: 100, utilisasi_persen: 0 },
    { urutan: 2, nama_sistem: 'Ellipse', storage_tb: 0, utilisasi_tb: 0, free_persen: 100, utilisasi_persen: 0 },
  ];

  static async getUtilisasi(bulan: number, tahun: number) {
    const latestMaster = await prisma.laporan_infrastruktur_master.findFirst({
      where: {
        tipe_infrastruktur: 'STORAGE_DATABASE',
      },
      orderBy: [
        { tahun: 'desc' },
        { bulan: 'desc' },
      ],
      include: {
        detail_storage_db_aplikasi: {
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
        tipe_infrastruktur: 'STORAGE_DATABASE',
      },
      include: {
        detail_storage_db_aplikasi: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    if (!currentMaster) {
      if (latestMaster) {
        const detail_storage_db_aplikasi = latestMaster.detail_storage_db_aplikasi.map((s) => ({
          urutan: s.urutan,
          nama_sistem: s.nama_sistem,
          storage_tb: 0,
          utilisasi_tb: 0,
          free_persen: 0,
          utilisasi_persen: 0,
        }));

        return {
          bulan,
          tahun,
          tipe_infrastruktur: 'STORAGE_DATABASE',
          detail_storage_db_aplikasi,
        };
      }

      return {
        bulan,
        tahun,
        tipe_infrastruktur: 'STORAGE_DATABASE',
        detail_storage_db_aplikasi: this.DEFAULT_SYSTEMS,
      };
    }

    const detail_storage_db_aplikasi = currentMaster.detail_storage_db_aplikasi.map((s) => ({
      id: s.id,
      urutan: s.urutan,
      nama_sistem: s.nama_sistem,
      storage_tb: Number(s.storage_tb) || 0,
      utilisasi_tb: Number(s.utilisasi_tb) || 0,
      free_persen: Number(s.free_persen) || 0,
      utilisasi_persen: Number(s.utilisasi_persen) || 0,
    }));

    return {
      id: currentMaster.id,
      bulan,
      tahun,
      tipe_infrastruktur: 'STORAGE_DATABASE',
      detail_storage_db_aplikasi,
    };
  }

  static async getAllUtilisasi() {
    return await prisma.laporan_infrastruktur_master.findMany({
      where: {
        tipe_infrastruktur: 'STORAGE_DATABASE',
      },
      include: {
        detail_storage_db_aplikasi: {
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
    details: StorageDatabaseDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      let master = await tx.laporan_infrastruktur_master.findFirst({
        where: {
          bulan,
          tahun,
          tipe_infrastruktur: 'STORAGE_DATABASE',
        },
      });

      if (!master) {
        master = await tx.laporan_infrastruktur_master.create({
          data: {
            bulan,
            tahun,
            tipe_infrastruktur: 'STORAGE_DATABASE',
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

      const existingDetails = await tx.detail_storage_db_aplikasi.findMany({
        where: {
          laporan_infrastruktur_id: master.id,
          tipe_infrastruktur: 'STORAGE_DATABASE',
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_storage_db_aplikasi.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        const storeTb = Number(detail.storage_tb) || 0;
        const utilisasiTb = Number(detail.utilisasi_tb) || 0;
        const utilisasiPersen = storeTb > 0 ? (utilisasiTb / storeTb) * 100 : 0;
        const freePersen = 100 - utilisasiPersen;

        if (detail.id) {
          return tx.detail_storage_db_aplikasi.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              storage_tb: storeTb,
              utilisasi_tb: utilisasiTb,
              free_persen: freePersen,
              utilisasi_persen: utilisasiPersen,
            },
          });
        } else {
          return tx.detail_storage_db_aplikasi.create({
            data: {
              laporan_infrastruktur_id: master.id,
              tipe_infrastruktur: 'STORAGE_DATABASE',
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              storage_tb: storeTb,
              utilisasi_tb: utilisasiTb,
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
          detail_storage_db_aplikasi: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }

  static async deleteUtilisasi(bulan: number, tahun: number) {
    const master = await prisma.laporan_infrastruktur_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_infrastruktur: 'STORAGE_DATABASE',
      },
    });

    if (!master) {
      return false;
    }

    await prisma.laporan_infrastruktur_master.delete({
      where: { id: master.id },
    });

    return true;
  }
}

