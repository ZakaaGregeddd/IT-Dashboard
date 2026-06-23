import { prisma } from '../config/database.js';

interface LicenseDetailInput {
  id?: string;
  urutan: number;
  principle: string;
  nama_produk: string;
  total_lisensi: number;
  tanggal_expired: string | Date;
  status: string;
}

export class LicenseService {
  private static DEFAULT_LICENSES = [
    { urutan: 1, principle: 'Check Point', nama_produk: 'Insider Firewall (Tanjung Enim)', total_lisensi: 2, tanggal_expired: new Date('2026-06-30'), status: 'Proses Renewal' },
    { urutan: 2, principle: 'Qontak', nama_produk: 'Whatsapp for Business', total_lisensi: 2, tanggal_expired: new Date('2026-05-21'), status: 'Autodebet' },
    { urutan: 3, principle: 'Only Office', nama_produk: 'Docu Tools CISEA', total_lisensi: 1, tanggal_expired: new Date('2026-05-31'), status: 'Autodebet' },
    { urutan: 4, principle: 'Digicert', nama_produk: 'SSL Certificate CISEA', total_lisensi: 1, tanggal_expired: new Date('2026-08-09'), status: 'Aktif' },
    { urutan: 5, principle: 'Imperva', nama_produk: 'Web Application Firewall', total_lisensi: 1, tanggal_expired: new Date('2026-08-20'), status: 'Aktif' }
  ];

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
        total_keseluruhan_lisensi: this.DEFAULT_LICENSES.reduce((acc, r) => acc + r.total_lisensi, 0),
        detail_lisensi: this.DEFAULT_LICENSES,
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
        const expDate = new Date(detail.tanggal_expired);
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
