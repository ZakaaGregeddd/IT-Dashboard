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
   * Fetch master and details for CPU server utilization by month & year.
   * Always retrieves the server names from the latest month, but values from the selected month.
   */
  static async getKetersediaan(bulan: number, tahun: number) {
    // 1. Get the absolute latest record to define the list of server names
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

    // 2. Get the record for the current selected month & year
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

    // If there are no records at all in the database, return hardcoded default
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

    // Build the details list based on the latest servers list
    const detail_utilisasi_cpu = latestMaster.detail_utilisasi_cpu.map((latestServer) => {
      // Find matching server in current period
      const matchingCurrent = currentMaster?.detail_utilisasi_cpu.find(
        (c) => c.nama_server.toLowerCase() === latestServer.nama_server.toLowerCase()
      );

      return {
        id: matchingCurrent?.id, // include ID if exists so frontend can update it
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

    // Compute totals based on current period details
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

  // Rename getUtilisasi in service to match controller expectations
  static async getUtilisasi(bulan: number, tahun: number) {
    return this.getKetersediaan(bulan, tahun);
  }

  /**
   * Fetch all historical CPU server records (sorted chronologically) for YTD chart
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
   * Save (Upsert Master and Sync Details) CPU server utilization data
   */
  static async saveUtilisasi(
    bulan: number,
    tahun: number,
    target_utilisasi_persen: number,
    details: CPUDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // Calculate totals
      const totalCpuCores = details.reduce((acc, cur) => acc + (cur.cpu_cores || 0), 0);
      const totalUtilisasiGhz = details.reduce((acc, cur) => acc + (cur.utilisasi_ghz || 0), 0);
      
      // avg utilisasi % = (total GHz / total CPU Cores) * 100
      const avgUtilisasiPercent = totalCpuCores > 0 ? (totalUtilisasiGhz / totalCpuCores) * 100 : 0;
      const totalFree = totalCpuCores - totalUtilisasiGhz; // CPU free headroom

      // Find or create master
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

      // Sync details
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
        // detail-level percentage
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
