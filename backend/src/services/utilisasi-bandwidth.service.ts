import { prisma } from '../config/database.js';

interface BandwidthDetailInput {
  id?: string;
  urutan: number;
  lokasi: string;
  bandwidth_mbps: number;
  utilisasi_mbps: number;
  sisa_persen?: number;
  utilisasi_persen?: number;
}

export class UtilisasiBandwidthService {
  private static DEFAULT_DETAILS = [
    { urutan: 1, lokasi: 'M.Kadin - Tanjung Enim', bandwidth_mbps: 0, utilisasi_mbps: 0, sisa_persen: 0, utilisasi_persen: 0 },
    { urutan: 2, lokasi: 'Tarahan - Tanjung Enim', bandwidth_mbps: 0, utilisasi_mbps: 0, sisa_persen: 0, utilisasi_persen: 0 },
    { urutan: 3, lokasi: 'Kertapati - Tanjung Enim', bandwidth_mbps: 0, utilisasi_mbps: 0, sisa_persen: 0, utilisasi_persen: 0 },
    { urutan: 4, lokasi: 'Griya Puncak Sekuning - Tanjung Enim', bandwidth_mbps: 0, utilisasi_mbps: 0, sisa_persen: 0, utilisasi_persen: 0 },
    { urutan: 5, lokasi: 'Bukit Kecil - Tanjung Enim', bandwidth_mbps: 0, utilisasi_mbps: 0, sisa_persen: 0, utilisasi_persen: 0 },
    { urutan: 6, lokasi: 'UPO - Tanjung Enim', bandwidth_mbps: 0, utilisasi_mbps: 0, sisa_persen: 0, utilisasi_persen: 0 }
  ];

  static async getUtilisasi(bulan: number, tahun: number) {
    const latestMaster = await prisma.laporan_utilisasi_bandwidth.findFirst({
      orderBy: [
        { tahun: 'desc' },
        { bulan: 'desc' },
      ],
      include: {
        detail_utilisasi_bandwidth: {
          orderBy: {
            urutan: 'asc',
          },
        },
      },
    });

    const currentMaster = await prisma.laporan_utilisasi_bandwidth.findFirst({
      where: {
        bulan,
        tahun,
      },
      include: {
        detail_utilisasi_bandwidth: {
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
        total_bandwidth_mbps: 0,
        total_utilisasi_mbps: 0,
        rata_rata_utilisasi_persen: 0,
        detail_utilisasi_bandwidth: this.DEFAULT_DETAILS,
      };
    }

    const activeMaster = (currentMaster || latestMaster)!;
    const detail_utilisasi_bandwidth = activeMaster.detail_utilisasi_bandwidth.map((s) => {
      const currentMatch = currentMaster?.detail_utilisasi_bandwidth.find(
        (c) => c.lokasi.toLowerCase() === s.lokasi.toLowerCase()
      );

      if (currentMatch) {
        return {
          id: currentMatch.id,
          urutan: currentMatch.urutan,
          lokasi: currentMatch.lokasi,
          bandwidth_mbps: Number(currentMatch.bandwidth_mbps) || 0,
          utilisasi_mbps: Number(currentMatch.utilisasi_mbps) || 0,
          sisa_persen: Number(currentMatch.sisa_persen) || 0,
          utilisasi_persen: Number(currentMatch.utilisasi_persen) || 0,
        };
      } else {
        const defaultMatch = this.DEFAULT_DETAILS.find(
          (d) => d.lokasi.toLowerCase() === s.lokasi.toLowerCase()
        );
        return {
          urutan: s.urutan,
          lokasi: s.lokasi,
          bandwidth_mbps: defaultMatch ? defaultMatch.bandwidth_mbps : 0,
          utilisasi_mbps: defaultMatch ? defaultMatch.utilisasi_mbps : 0,
          sisa_persen: defaultMatch ? defaultMatch.sisa_persen : 100,
          utilisasi_persen: defaultMatch ? defaultMatch.utilisasi_persen : 0,
        };
      }
    });

    return {
      id: currentMaster?.id,
      bulan,
      tahun,
      total_bandwidth_mbps: currentMaster ? Number(currentMaster.total_bandwidth_mbps) : 0,
      total_utilisasi_mbps: currentMaster ? Number(currentMaster.total_utilisasi_mbps) : 0,
      rata_rata_utilisasi_persen: currentMaster ? Number(currentMaster.rata_rata_utilisasi_persen) : 0,
      detail_utilisasi_bandwidth,
    };
  }

  static async getAllUtilisasi() {
    return await prisma.laporan_utilisasi_bandwidth.findMany({
      include: {
        detail_utilisasi_bandwidth: {
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
    details: BandwidthDetailInput[]
  ) {
    return await prisma.$transaction(async (tx) => {
      let totalBandwidth = 0;
      let totalUtilisasi = 0;

      const parsedDetails = details.map((detail) => {
        const bw = Number(detail.bandwidth_mbps) || 0;
        const util = Number(detail.utilisasi_mbps) || 0;
        const utilP = bw > 0 ? (util / bw) * 100 : 0;
        const sisaP = 100 - utilP;

        totalBandwidth += bw;
        totalUtilisasi += util;

        return {
          ...detail,
          bandwidth_mbps: bw,
          utilisasi_mbps: util,
          utilisasi_persen: utilP,
          sisa_persen: sisaP,
        };
      });

      const avgUtilPercent = totalBandwidth > 0 ? (totalUtilisasi / totalBandwidth) * 100 : 0;

      let master = await tx.laporan_utilisasi_bandwidth.findFirst({
        where: {
          bulan,
          tahun,
        },
      });

      if (!master) {
        master = await tx.laporan_utilisasi_bandwidth.create({
          data: {
            bulan,
            tahun,
            total_bandwidth_mbps: totalBandwidth,
            total_utilisasi_mbps: totalUtilisasi,
            rata_rata_utilisasi_persen: avgUtilPercent,
          },
        });
      } else {
        master = await tx.laporan_utilisasi_bandwidth.update({
          where: { id: master.id },
          data: {
            total_bandwidth_mbps: totalBandwidth,
            total_utilisasi_mbps: totalUtilisasi,
            rata_rata_utilisasi_persen: avgUtilPercent,
            updated_at: new Date(),
          },
        });
      }

      const existingDetails = await tx.detail_utilisasi_bandwidth.findMany({
        where: {
          laporan_bandwidth_id: master.id,
        },
      });

      const incomingIds = parsedDetails.filter((d) => d.id).map((d) => d.id as string);
      const toRemove = existingDetails.filter((d) => !incomingIds.includes(d.id));

      if (toRemove.length > 0) {
        await tx.detail_utilisasi_bandwidth.deleteMany({
          where: {
            id: { in: toRemove.map((r) => r.id) },
          },
        });
      }

      const upsertPromises = parsedDetails.map((detail) => {
        if (detail.id) {
          return tx.detail_utilisasi_bandwidth.update({
            where: { id: detail.id },
            data: {
              urutan: detail.urutan,
              lokasi: detail.lokasi,
              bandwidth_mbps: detail.bandwidth_mbps,
              utilisasi_mbps: detail.utilisasi_mbps,
              sisa_persen: detail.sisa_persen,
              utilisasi_persen: detail.utilisasi_persen,
            },
          });
        } else {
          return tx.detail_utilisasi_bandwidth.create({
            data: {
              laporan_bandwidth_id: master.id,
              urutan: detail.urutan,
              lokasi: detail.lokasi,
              bandwidth_mbps: detail.bandwidth_mbps,
              utilisasi_mbps: detail.utilisasi_mbps,
              sisa_persen: detail.sisa_persen,
              utilisasi_persen: detail.utilisasi_persen,
            },
          });
        }
      });

      await Promise.all(upsertPromises);

      return await tx.laporan_utilisasi_bandwidth.findUnique({
        where: { id: master.id },
        include: {
          detail_utilisasi_bandwidth: {
            orderBy: {
              urutan: 'asc',
            },
          },
        },
      });
    });
  }
}
