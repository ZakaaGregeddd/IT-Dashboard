import { prisma } from '../config/database.js';

interface CPUAppDetailInput {
  id?: string;
  urutan: number;
  nama_sistem: string;
  cpu_ghz: number;
  utilisasi_ghz: number;
  free_persen: number;
  utilisasi_persen: number;
}

export class UtilisasiCpuAppService {
  private static DEFAULT_DETAILS = [
    { urutan: 1, nama_sistem: 'CISEA', cpu_ghz: 0, utilisasi_ghz: 0, free_persen: 0, utilisasi_persen: 0 },
    { urutan: 2, nama_sistem: 'Ellipse', cpu_ghz: 0, utilisasi_ghz: 0, free_persen: 0, utilisasi_persen: 0 }
  ];

  /**
   * Fetch master and details for application CPU utilization by month & year.
   */
  static async getKetersediaan(bulan: number, tahun: number) {
    const master = await prisma.laporan_infrastruktur_master.findFirst({
      where: {
        bulan,
        tahun,
        tipe_infrastruktur: 'CPU',
      },
      include: {
        detail_cpu_aplikasi: true,
      },
    });

    if (!master) {
      return {
        bulan,
        tahun,
        tipe_infrastruktur: 'CPU',
        detail_cpu_aplikasi: this.DEFAULT_DETAILS,
      };
    }

    const detail_cpu_aplikasi = this.DEFAULT_DETAILS.map((def) => {
      const match = master.detail_cpu_aplikasi.find(
        (d) => d.nama_sistem.toLowerCase() === def.nama_sistem.toLowerCase()
      );

      const cpu = match ? (Number(match.cpu_ghz) ?? 0) : 0;
      const utilisasi = match ? (Number(match.utilisasi_ghz) ?? 0) : 0;
      const p = cpu > 0 ? (utilisasi / cpu) * 100 : 0;
      const f = 100 - p;

      return {
        id: match?.id,
        urutan: def.urutan,
        nama_sistem: def.nama_sistem,
        cpu_ghz: cpu,
        utilisasi_ghz: utilisasi,
        free_persen: f,
        utilisasi_persen: p,
      };
    });

    return {
      id: master.id,
      bulan,
      tahun,
      tipe_infrastruktur: 'CPU',
      detail_cpu_aplikasi,
    };
  }

  static async getUtilisasi(bulan: number, tahun: number) {
    return this.getKetersediaan(bulan, tahun);
  }

  /**
   * Fetch all historical Application CPU records for YTD chart
   */
  static async getAllUtilisasi() {
    return await prisma.laporan_infrastruktur_master.findMany({
      where: {
        tipe_infrastruktur: 'CPU',
      },
      include: {
        detail_cpu_aplikasi: {
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
   * Save (Upsert Master and Sync Details) Application CPU utilization data
   */
  static async saveUtilisasi(
    bulan: number,
    tahun: number,
    details: CPUAppDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      let master = await tx.laporan_infrastruktur_master.findFirst({
        where: {
          bulan,
          tahun,
          tipe_infrastruktur: 'CPU',
        },
      });

      if (!master) {
        master = await tx.laporan_infrastruktur_master.create({
          data: {
            bulan,
            tahun,
            tipe_infrastruktur: 'CPU',
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

      const existingDetails = await tx.detail_cpu_aplikasi.findMany({
        where: {
          laporan_infrastruktur_id: master.id,
          tipe_infrastruktur: 'CPU',
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_cpu_aplikasi.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        const p = detail.cpu_ghz > 0 ? (detail.utilisasi_ghz / detail.cpu_ghz) * 100 : 0;
        const f = 100 - p;

        if (detail.id) {
          return tx.detail_cpu_aplikasi.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              cpu_ghz: detail.cpu_ghz,
              utilisasi_ghz: detail.utilisasi_ghz,
              free_persen: f,
              utilisasi_persen: p,
            },
          });
        } else {
          return tx.detail_cpu_aplikasi.create({
            data: {
              laporan_infrastruktur_id: master.id,
              tipe_infrastruktur: 'CPU',
              urutan: detail.urutan,
              nama_sistem: detail.nama_sistem,
              cpu_ghz: detail.cpu_ghz,
              utilisasi_ghz: detail.utilisasi_ghz,
              free_persen: f,
              utilisasi_persen: p,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_infrastruktur_master.findUnique({
        where: { id: master.id },
        include: {
          detail_cpu_aplikasi: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
