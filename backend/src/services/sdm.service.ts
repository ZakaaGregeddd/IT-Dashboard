import { prisma } from '../config/database.js';

interface SDMDetailInput {
  id?: string;
  urutan: number;
  role_divisi: string;
  jumlah: number;
}

export class SDMService {
  private static DEFAULT_ROLES = [
    { urutan: 1, role_divisi: 'Join Dev', jumlah: 0 },
    { urutan: 2, role_divisi: 'Network', jumlah: 0 },
    { urutan: 3, role_divisi: 'Noc', jumlah: 0 },
    { urutan: 4, role_divisi: 'Office Boy', jumlah: 0 },
    { urutan: 5, role_divisi: 'PC Support', jumlah: 0 },
    { urutan: 6, role_divisi: 'Admin', jumlah: 0 },
    { urutan: 7, role_divisi: 'Data Scientist', jumlah: 0 },
    { urutan: 8, role_divisi: 'Driver', jumlah: 0 },
  ];

  /**
   * Fetch master and details of SDM IT for a specific month and year
   */
  static async getSDM(bulan: number, tahun: number) {
    const master = await prisma.laporan_sdm_it.findFirst({
      where: {
        bulan,
        tahun,
      },
      include: {
        detail_sdm_it: true,
      },
    });

    if (!master) {
      const latestMaster = await prisma.laporan_sdm_it.findFirst({
        orderBy: [
          { tahun: 'desc' },
          { bulan: 'desc' },
        ],
        include: {
          detail_sdm_it: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });

      if (latestMaster) {
        const details = latestMaster.detail_sdm_it.map(d => ({
          urutan: d.urutan,
          role_divisi: d.role_divisi,
          jumlah: 0,
        }));

        return {
          bulan,
          tahun,
          total_keseluruhan_sdm: 0,
          detail_sdm_it: details,
        };
      }

      return {
        bulan,
        tahun,
        total_keseluruhan_sdm: 0,
        detail_sdm_it: this.DEFAULT_ROLES,
      };
    }

    const detail_sdm_it = this.DEFAULT_ROLES.map((role) => {
      const match = master.detail_sdm_it.find(
        (d) => d.role_divisi.toLowerCase() === role.role_divisi.toLowerCase()
      );
      return {
        id: match?.id,
        urutan: role.urutan,
        role_divisi: role.role_divisi,
        jumlah: match ? (match.jumlah ?? 0) : 0,
      };
    });

    return {
      id: master.id,
      bulan: master.bulan,
      tahun: master.tahun,
      total_keseluruhan_sdm: detail_sdm_it.reduce((acc, r) => acc + r.jumlah, 0),
      detail_sdm_it,
    };
  }

  /**
   * Fetch all master and details of SDM IT
   */
  static async getAllSDM() {
    const masters = await prisma.laporan_sdm_it.findMany({
      include: {
        detail_sdm_it: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
      orderBy: [
        { tahun: 'asc' },
        { bulan: 'asc' }
      ]
    });

    return masters;
  }

  /**
   * Save (Upsert Master and Sync Details) SDM IT
   */
  static async saveSDM(
    bulan: number,
    tahun: number,
    total_keseluruhan_sdm: number,
    details: SDMDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Find or Create the Master Record
      let master = await tx.laporan_sdm_it.findFirst({
        where: {
          bulan,
          tahun,
        },
      });

      if (!master) {
        master = await tx.laporan_sdm_it.create({
          data: {
            bulan,
            tahun,
            total_keseluruhan_sdm,
          },
        });
      } else {
        master = await tx.laporan_sdm_it.update({
          where: { id: master.id },
          data: {
            total_keseluruhan_sdm,
            updated_at: new Date(),
          },
        });
      }

      // 2. Identify existing details in the database for this master
      const existingDetails = await tx.detail_sdm_it.findMany({
        where: {
          laporan_sdm_id: master.id,
        },
      });

      const incomingIds = details.filter(d => d.id).map(d => d.id as string);
      const detailsToRemove = existingDetails.filter(d => !incomingIds.includes(d.id));

      // 3. Delete details that were removed
      if (detailsToRemove.length > 0) {
        await tx.detail_sdm_it.deleteMany({
          where: {
            id: {
              in: detailsToRemove.map(d => d.id),
            },
          },
        });
      }

      // 4. Upsert the incoming details
      const upsertPromises = details.map((detail) => {
        if (detail.id) {
          return tx.detail_sdm_it.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              role_divisi: detail.role_divisi,
              jumlah: detail.jumlah,
              updated_at: new Date(),
            },
          });
        } else {
          return tx.detail_sdm_it.create({
            data: {
              laporan_sdm_id: master.id,
              urutan: detail.urutan,
              role_divisi: detail.role_divisi,
              jumlah: detail.jumlah,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      // 5. Fetch and return the fully updated master with its details
      return await tx.laporan_sdm_it.findUnique({
        where: { id: master.id },
        include: {
          detail_sdm_it: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }

  static async deleteSdm(bulan: number, tahun: number) {
    const master = await prisma.laporan_sdm_it.findFirst({
      where: { bulan, tahun },
    });

    if (!master) {
      return false;
    }

    await prisma.laporan_sdm_it.delete({
      where: { id: master.id },
    });

    return true;
  }
}

