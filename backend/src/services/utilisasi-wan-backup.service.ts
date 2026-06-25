import { prisma } from '../config/database.js';

interface WanBackupDetailInput {
  id?: string;
  urutan: number;
  lokasi: string;
  ketersediaan_persen: number;
}

export class UtilisasiWanBackupService {
  private static DEFAULT_SYSTEMS = [
    { urutan: 1, lokasi: 'M.Kadin - Tanjung Enim', ketersediaan_persen: 0 },
    { urutan: 2, lokasi: 'Tarahan - Tanjung Enim', ketersediaan_persen: 0 },
    { urutan: 3, lokasi: 'Kertapati - Tanjung Enim', ketersediaan_persen: 0 },
    { urutan: 4, lokasi: 'Mess Puncak - Tanjung Enim', ketersediaan_persen: 0 },
    { urutan: 5, lokasi: 'Bukit Kecil - Tanjung Enim', ketersediaan_persen: 0 },
    { urutan: 6, lokasi: 'UPO - Tanjung Enim', ketersediaan_persen: 0 },
  ];

  static async getUtilisasi(bulan: number, tahun: number) {
    const latestMaster = await prisma.laporan_infrastruktur_master.findFirst({
      where: {
        tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
      },
      orderBy: [
        { tahun: 'desc' },
        { bulan: 'desc' },
      ],
      include: {
        detail_ketersediaan_backup: {
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
        tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
      },
      include: {
        detail_ketersediaan_backup: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    if (!currentMaster) {
      if (latestMaster) {
        const detail_ketersediaan_backup = latestMaster.detail_ketersediaan_backup.map((s) => ({
          urutan: s.urutan,
          lokasi: s.lokasi,
          ketersediaan_persen: Number(s.ketersediaan_persen) || 0,
        }));

        return {
          bulan,
          tahun,
          tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
          detail_ketersediaan_backup,
        };
      }

      return {
        bulan,
        tahun,
        tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
        detail_ketersediaan_backup: this.DEFAULT_SYSTEMS,
      };
    }

    const detail_ketersediaan_backup = currentMaster.detail_ketersediaan_backup.map((s) => ({
      id: s.id,
      urutan: s.urutan,
      lokasi: s.lokasi,
      ketersediaan_persen: Number(s.ketersediaan_persen) || 0,
    }));

    return {
      id: currentMaster.id,
      bulan,
      tahun,
      tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
      detail_ketersediaan_backup,
    };
  }

  static async getAllUtilisasi() {
    return await prisma.laporan_infrastruktur_master.findMany({
      where: {
        tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
      },
      include: {
        detail_ketersediaan_backup: {
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
    details: WanBackupDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      let master = await tx.laporan_infrastruktur_master.findFirst({
        where: {
          bulan,
          tahun,
          tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
        },
      });

      if (!master) {
        master = await tx.laporan_infrastruktur_master.create({
          data: {
            bulan,
            tahun,
            tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
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

      const existingDetails = await tx.detail_ketersediaan_backup.findMany({
        where: {
          laporan_infrastruktur_id: master.id,
          tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_ketersediaan_backup.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        const ketPersen = Number(detail.ketersediaan_persen) || 0;

        if (detail.id) {
          return tx.detail_ketersediaan_backup.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              lokasi: detail.lokasi,
              ketersediaan_persen: ketPersen,
            },
          });
        } else {
          return tx.detail_ketersediaan_backup.create({
            data: {
              laporan_infrastruktur_id: master.id,
              tipe_infrastruktur: 'KETERSEDIAAN_BACKUP',
              urutan: detail.urutan,
              lokasi: detail.lokasi,
              ketersediaan_persen: ketPersen,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_infrastruktur_master.findUnique({
        where: { id: master.id },
        include: {
          detail_ketersediaan_backup: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
