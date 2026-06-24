import { prisma } from '../config/database.js';

interface LicenseDetailInput {
  id?: string;
  urutan: number;
  principle: string;
  nama_produk: string;
  total_lisensi: number;
  tanggal_expired: string | Date;
  status: string;
  catatan?: string | null;
}

export class LicenseService {

  /**
   * Fetch master and details of licenses for a specific month and year
   */
  static async getLicenses(bulan: number, tahun: number) {
    const master = await prisma.laporan_lisensi.findFirst({
      where: {
        bulan,
        tahun,
      },
      include: {
        detail_lisensi: true,
      },
    });

    if (!master) {
      return {
        bulan,
        tahun,
        total_keseluruhan_lisensi: 0,
        detail_lisensi: [],
      };
    }

    return {
      id: master.id,
      bulan: master.bulan,
      tahun: master.tahun,
      total_keseluruhan_lisensi: master.detail_lisensi.reduce((acc, r) => acc + (r.total_lisensi ?? 0), 0),
      detail_lisensi: master.detail_lisensi.sort((a, b) => a.urutan - b.urutan),
    };
  }

  /**
   * Fetch all master and details of licenses for history/YTD Chart
   */
  static async getAllLicenses() {
    const masters = await prisma.laporan_lisensi.findMany({
      include: {
        detail_lisensi: {
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
   * Save (Upsert Master and Sync Details) licenses
   */
  static async saveLicenses(
    bulan: number,
    tahun: number,
    total_keseluruhan_lisensi: number,
    details: LicenseDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Find or Create the Master Record
      let master = await tx.laporan_lisensi.findFirst({
        where: {
          bulan,
          tahun,
        },
      });

      if (!master) {
        master = await tx.laporan_lisensi.create({
          data: {
            bulan,
            tahun,
            total_keseluruhan_lisensi,
          },
        });
      } else {
        master = await tx.laporan_lisensi.update({
          where: { id: master.id },
          data: {
            total_keseluruhan_lisensi,
            updated_at: new Date(),
          },
        });
      }

      // 2. Identify existing details in the database for this master
      const existingDetails = await tx.detail_lisensi.findMany({
        where: {
          laporan_lisensi_id: master.id,
        },
      });

      const incomingIds = details.filter(d => d.id).map(d => d.id as string);
      const detailsToRemove = existingDetails.filter(d => !incomingIds.includes(d.id));

      // 3. Delete details that were removed
      if (detailsToRemove.length > 0) {
        await tx.detail_lisensi.deleteMany({
          where: {
            id: {
              in: detailsToRemove.map(d => d.id),
            },
          },
        });
      }

      // 4. Upsert the incoming details
      const upsertPromises = details.map((detail) => {
        let expDate = new Date(detail.tanggal_expired);
        if (isNaN(expDate.getTime())) {
          expDate = new Date();
        }
        if (detail.id) {
          return tx.detail_lisensi.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              principle: detail.principle,
              nama_produk: detail.nama_produk,
              total_lisensi: detail.total_lisensi,
              tanggal_expired: expDate,
              status: detail.status,
              catatan: detail.catatan ?? null,
              updated_at: new Date(),
            },
          });
        } else {
          return tx.detail_lisensi.create({
            data: {
              laporan_lisensi_id: master.id,
              urutan: detail.urutan,
              principle: detail.principle,
              nama_produk: detail.nama_produk,
              total_lisensi: detail.total_lisensi,
              tanggal_expired: expDate,
              status: detail.status,
              catatan: detail.catatan ?? null,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      // 5. Fetch and return the fully updated master with its details
      return await tx.laporan_lisensi.findUnique({
        where: { id: master.id },
        include: {
          detail_lisensi: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
