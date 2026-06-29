import { prisma } from '../config/database.js';

interface CPUDetailInput {
  id?: string;
  urutan: number;
  nama_server: string;
  cpu_cores: number;
  utilisasi_ghz: number;
  utilisasi_persen: number;
}

export class UtilisasiCpuService {
  private static DEFAULT_SERVERS = [
    { urutan: 1, nama_server: 'steppl-esxi1', cpu_cores: 0, utilisasi_ghz: 0, utilisasi_persen: 0 },
    { urutan: 2, nama_server: 'steppl-esxi2', cpu_cores: 0, utilisasi_ghz: 0, utilisasi_persen: 0 },
    { urutan: 3, nama_server: 'steppl-esxi3', cpu_cores: 0, utilisasi_ghz: 0, utilisasi_persen: 0 },
    { urutan: 4, nama_server: 'steppl-esxi4', cpu_cores: 0, utilisasi_ghz: 0, utilisasi_persen: 0 },
    { urutan: 5, nama_server: 'tjevmerp1', cpu_cores: 0, utilisasi_ghz: 0, utilisasi_persen: 0 },
    { urutan: 6, nama_server: 'tjevmerp2', cpu_cores: 0, utilisasi_ghz: 0, utilisasi_persen: 0 },
    { urutan: 7, nama_server: 'tjevmerp3', cpu_cores: 0, utilisasi_ghz: 0, utilisasi_persen: 0 },
    { urutan: 8, nama_server: 'tjevmerp4', cpu_cores: 0, utilisasi_ghz: 0, utilisasi_persen: 0 },
  ];

  /**
   * Ambil data master dan detail untuk utilisasi CPU server berdasarkan bulan & tahun.
   * Selalu mengambil nama server dari bulan terbaru, tetapi nilainya dari bulan yang dipilih.
   */
  static async getKetersediaan(bulan: number, tahun: number) {
    // 1. Dapatkan record terbaru secara absolut untuk menentukan daftar nama server
    const latestMaster = await prisma.laporan_utilisasi_server_master.findFirst({
      where: {
        tipe_utilisasi: 'SERVER_CPU',
      },
      orderBy: [
        { tahun: 'desc' },
        { bulan: 'desc' },
      ],
      include: {
        detail_utilisasi_cpu: {
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
        tipe_utilisasi: 'SERVER_CPU',
      },
      include: {
        detail_utilisasi_cpu: true,
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
        tipe_utilisasi: 'SERVER_CPU',
        rata_rata_utilisasi_persen: 0,
        total_kapasitas: 0,
        total_utilisasi: 0,
        total_free: 0,
        total_cpu_cores: 0,
        total_utilisasi_ghz: 0,
        target_utilisasi_persen,
        detail_utilisasi_cpu: this.DEFAULT_SERVERS,
      };
    }

    // Bangun daftar detail berdasarkan daftar server terbaru
    const detail_utilisasi_cpu = latestMaster.detail_utilisasi_cpu.map((latestServer) => {
      // Temukan server yang cocok di periode saat ini
      const matchingCurrent = currentMaster?.detail_utilisasi_cpu.find(
        (c) => c.nama_server.toLowerCase() === latestServer.nama_server.toLowerCase()
      );

      return {
        id: matchingCurrent?.id, // sertakan ID jika ada agar frontend dapat memperbaruinya
        urutan: latestServer.urutan,
        nama_server: latestServer.nama_server,
        cpu_cores: currentMaster 
          ? (matchingCurrent ? (matchingCurrent.cpu_cores ?? 0) : 0)
          : 0,
        utilisasi_ghz: currentMaster
          ? (matchingCurrent ? (Number(matchingCurrent.utilisasi_ghz) ?? 0) : 0)
          : 0,
        utilisasi_persen: currentMaster
          ? (matchingCurrent ? (Number(matchingCurrent.utilisasi_persen) ?? 0) : 0)
          : 0,
      };
    });

    // Hitung total berdasarkan detail periode saat ini
    const totalCpuCores = detail_utilisasi_cpu.reduce((acc, cur) => acc + cur.cpu_cores, 0);
    const totalUtilisasiGhz = detail_utilisasi_cpu.reduce((acc, cur) => acc + cur.utilisasi_ghz, 0);
    const avgUtil = totalCpuCores > 0 ? (totalUtilisasiGhz / totalCpuCores) * 100 : 0;

    return {
      id: currentMaster?.id,
      bulan,
      tahun,
      tipe_utilisasi: 'SERVER_CPU',
      rata_rata_utilisasi_persen: avgUtil,
      total_kapasitas: totalCpuCores,
      total_utilisasi: totalUtilisasiGhz,
      total_free: totalCpuCores - totalUtilisasiGhz,
      total_cpu_cores: totalCpuCores,
      total_utilisasi_ghz: totalUtilisasiGhz,
      target_utilisasi_persen,
      detail_utilisasi_cpu,
    };
  }

  // Ubah nama getUtilisasi di service agar sesuai dengan ekspektasi controller
  static async getUtilisasi(bulan: number, tahun: number) {
    return this.getKetersediaan(bulan, tahun);
  }

  /**
   * Ambil semua riwayat record CPU server (diurutkan secara kronologis) untuk chart YTD
   */
  static async getAllUtilisasi() {
    return await prisma.laporan_utilisasi_server_master.findMany({
      where: {
        tipe_utilisasi: 'SERVER_CPU',
      },
      include: {
        detail_utilisasi_cpu: {
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
   * Simpan (Upsert Master dan Sinkronisasi Detail) data utilisasi CPU server
   */
  static async saveUtilisasi(
    bulan: number,
    tahun: number,
    target_utilisasi_persen: number,
    details: CPUDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // Hitung total
      const totalCpuCores = details.reduce((acc, cur) => acc + (cur.cpu_cores || 0), 0);
      const totalUtilisasiGhz = details.reduce((acc, cur) => acc + (cur.utilisasi_ghz || 0), 0);
      
      // avg utilisasi % = (total GHz / total CPU Cores) * 100
      const avgUtilisasiPercent = totalCpuCores > 0 ? (totalUtilisasiGhz / totalCpuCores) * 100 : 0;
      const totalFree = totalCpuCores - totalUtilisasiGhz; // kapasitas sisa CPU

      // Temukan atau buat master
      let master = await tx.laporan_utilisasi_server_master.findFirst({
        where: {
          bulan,
          tahun,
          tipe_utilisasi: 'SERVER_CPU',
        },
      });

      if (!master) {
        master = await tx.laporan_utilisasi_server_master.create({
          data: {
            bulan,
            tahun,
            tipe_utilisasi: 'SERVER_CPU',
            rata_rata_utilisasi_persen: avgUtilisasiPercent,
            total_kapasitas: totalCpuCores,
            total_utilisasi: totalUtilisasiGhz,
            total_free: totalFree,
            total_cpu_cores: totalCpuCores,
            total_utilisasi_ghz: totalUtilisasiGhz,
            target_utilisasi_persen,
          },
        });
      } else {
        master = await tx.laporan_utilisasi_server_master.update({
          where: { id: master.id },
          data: {
            rata_rata_utilisasi_persen: avgUtilisasiPercent,
            total_kapasitas: totalCpuCores,
            total_utilisasi: totalUtilisasiGhz,
            total_free: totalFree,
            total_cpu_cores: totalCpuCores,
            total_utilisasi_ghz: totalUtilisasiGhz,
            target_utilisasi_persen,
            updated_at: new Date(),
          },
        });
      }

      // Sinkronisasi detail
      const existingDetails = await tx.detail_utilisasi_cpu.findMany({
        where: {
          laporan_utilisasi_id: master.id,
          tipe_utilisasi: 'SERVER_CPU',
        },
      });

      const incomingIds = details.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_utilisasi_cpu.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = details.map((detail) => {
        // persentase tingkat detail
        const p = detail.cpu_cores > 0 ? (detail.utilisasi_ghz / detail.cpu_cores) * 100 : 0;
        if (detail.id) {
          return tx.detail_utilisasi_cpu.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              nama_server: detail.nama_server,
              cpu_cores: detail.cpu_cores,
              utilisasi_ghz: detail.utilisasi_ghz,
              utilisasi_persen: p,
            },
          });
        } else {
          return tx.detail_utilisasi_cpu.create({
            data: {
              laporan_utilisasi_id: master.id,
              tipe_utilisasi: 'SERVER_CPU',
              urutan: detail.urutan,
              nama_server: detail.nama_server,
              cpu_cores: detail.cpu_cores,
              utilisasi_ghz: detail.utilisasi_ghz,
              utilisasi_persen: p,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_utilisasi_server_master.findUnique({
        where: { id: master.id },
        include: {
          detail_utilisasi_cpu: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
