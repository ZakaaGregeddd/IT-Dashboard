import React, { useState, useEffect } from 'react';
import { DashboardOverview, DashboardData } from '../components/DashboardOverview';

const monthsAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const monthsList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const getRelativeDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Fallback aggregated dashboard response mock payload (only used if API fetches FAIL/network down)
const mockDashboardPayload: DashboardData = {
  programKerja: {
    labels: ['TW III s.d Okt 2024'],
    datasets: [
      { label: 'Target', data: [100], backgroundColor: '#0f2e60', barThickness: 40 },
      { label: 'Realisasi', data: [92], backgroundColor: '#f59e0b', barThickness: 40 }
    ]
  },
  rkap: {
    title: 'Realisasi RKAP TI',
    percentage: 89
  },
  licenses: {
    under2: 5,
    between2and4: 3,
    over4: 12,
    rawList: [
      { nama_aplikasi: 'Microsoft Office 365 Enterprise', expiry_date: getRelativeDate(15) },
      { nama_aplikasi: 'VMware vSphere Suite', expiry_date: getRelativeDate(35) },
      { nama_aplikasi: 'Kaspersky Endpoint Security', expiry_date: getRelativeDate(75) },
      { nama_aplikasi: 'Adobe Creative Cloud Pro', expiry_date: getRelativeDate(120) },
      { nama_aplikasi: 'Oracle Database Enterprise', expiry_date: getRelativeDate(210) }
    ]
  },
  reportScmc: {
    labels: ['JUN 2024', 'OKT 2024'],
    datasets: [
      { label: 'Laporan Beroperasi Normal', data: [58, 58], backgroundColor: '#0f2e60', barThickness: 30 },
      { label: 'Jumlah Laporan Tersedia', data: [58, 58], backgroundColor: '#f59e0b', barThickness: 30 }
    ]
  },
  ketersediaanSistem: {
    labels: ['Ellipse', 'Email', 'CISEA', 'SIMKES'],
    datasets: [
      { label: 'Rencana', data: [100, 100, 100, 100], backgroundColor: '#0f2e60', barThickness: 30 },
      { label: 'Realisasi', data: [99.5, 99.8, 98.5, 100], backgroundColor: '#f59e0b', barThickness: 30 }
    ]
  },
  bandwidthJaringan: {
    labels: ['M.Kadin', 'Tarahan', 'Kertapati', 'Griya Puncak', 'Bukit Kecil', 'UPO'],
    datasets: [
      { label: 'Bandwidth (Mbps)', data: [32.41, 17.76, 8.82, 3.97, 9.83, 1.91], backgroundColor: '#0f2e60', barThickness: 20 },
      { label: 'Rata-rata Utilisasi (Mbps)', data: [7.59, 2.24, 1.18, 0.03, 0.17, 0.09], backgroundColor: '#f59e0b', barThickness: 20 }
    ]
  },
  pcSupport: {
    labels: monthsAbbr,
    datasets: [
      { label: 'WO Masuk', data: [10, 15, 80, 50, 45, 60, 50, 50, 50, 50, 850, 80], backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: [9, 14, 75, 48, 45, 58, 48, 48, 48, 48, 700, 75], backgroundColor: '#f59e0b' }
    ]
  },
  layananAplikasi: {
    labels: monthsAbbr,
    datasets: [
      { label: 'WO Masuk', data: [10, 20, 40, 80, 120, 250, 180, 120, 110, 80, 70, 50], backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: [9, 18, 38, 75, 115, 240, 175, 118, 108, 78, 68, 48], backgroundColor: '#f59e0b' }
    ]
  },
  layananOperasional: {
    labels: monthsAbbr,
    datasets: [
      { label: 'WO Masuk', data: [50, 60, 80, 220, 250, 240, 210, 160, 140, 140, 140, 130], backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: [48, 58, 75, 215, 245, 235, 205, 155, 135, 138, 138, 128], backgroundColor: '#f59e0b' }
    ]
  },
  restoreEllipse: {
    labels: monthsAbbr,
    datasets: [
      { label: 'WO Masuk', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 28], backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 28], backgroundColor: '#f59e0b' }
    ]
  }
};

// Zeroed default datasets for empty database state
const zeroDashboardPayload: DashboardData = {
  programKerja: {
    labels: ['Program Kerja TI'],
    datasets: [
      { label: 'Target', data: [0], backgroundColor: '#0f2e60', barThickness: 40 },
      { label: 'Realisasi', data: [0], backgroundColor: '#f59e0b', barThickness: 40 }
    ]
  },
  rkap: {
    title: 'Realisasi RKAP TI',
    percentage: 0
  },
  licenses: {
    under2: 0,
    between2and4: 0,
    over4: 0,
    rawList: []
  },
  reportScmc: {
    labels: ['-'],
    datasets: [
      { label: 'Laporan Beroperasi Normal', data: [0], backgroundColor: '#0f2e60', barThickness: 30 },
      { label: 'Jumlah Laporan Tersedia', data: [0], backgroundColor: '#f59e0b', barThickness: 30 }
    ]
  },
  ketersediaanSistem: {
    labels: ['Ellipse', 'Email', 'CISEA', 'SIMKES'],
    datasets: [
      { label: 'Rencana', data: [0, 0, 0, 0], backgroundColor: '#0f2e60', barThickness: 30 },
      { label: 'Realisasi', data: [0, 0, 0, 0], backgroundColor: '#f59e0b', barThickness: 30 }
    ]
  },
  bandwidthJaringan: {
    labels: ['M.Kadin', 'Tarahan', 'Kertapati', 'Griya Puncak', 'Bukit Kecil', 'UPO'],
    datasets: [
      { label: 'Bandwidth (Mbps)', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#0f2e60', barThickness: 20 },
      { label: 'Rata-rata Utilisasi (Mbps)', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#f59e0b', barThickness: 20 }
    ]
  },
  pcSupport: {
    labels: monthsAbbr,
    datasets: [
      { label: 'WO Masuk', data: Array(12).fill(0), backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: Array(12).fill(0), backgroundColor: '#f59e0b' }
    ]
  },
  layananAplikasi: {
    labels: monthsAbbr,
    datasets: [
      { label: 'WO Masuk', data: Array(12).fill(0), backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: Array(12).fill(0), backgroundColor: '#f59e0b' }
    ]
  },
  layananOperasional: {
    labels: monthsAbbr,
    datasets: [
      { label: 'WO Masuk', data: Array(12).fill(0), backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: Array(12).fill(0), backgroundColor: '#f59e0b' }
    ]
  },
  restoreEllipse: {
    labels: monthsAbbr,
    datasets: [
      { label: 'WO Masuk', data: Array(12).fill(0), backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: Array(12).fill(0), backgroundColor: '#f59e0b' }
    ]
  }
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const urls = [
          'http://localhost:5000/api/program-kerja',
          'http://localhost:5000/api/rkap',
          'http://localhost:5000/api/licenses',
          'http://localhost:5000/api/ketersediaan/scmc',
          'http://localhost:5000/api/ketersediaan/sistem',
          'http://localhost:5000/api/utilisasi/bandwidth',
          'http://localhost:5000/api/work-order/pc-support',
          'http://localhost:5000/api/work-order/layanan-app',
          'http://localhost:5000/api/work-order/operasional',
          'http://localhost:5000/api/work-order/restore'
        ];

        const [
          resProg,
          resRkap,
          resLic,
          resScmc,
          resSist,
          resBand,
          resPc,
          resApp,
          resOper,
          resRest
        ] = await Promise.all(
          urls.map(url =>
            fetch(url)
              .then(r => r.json())
              .catch(() => ({ success: false, networkError: true }))
          )
        );

        // Check if all calls suffered a network error
        const isNetworkOffline = [
          resProg, resRkap, resLic, resScmc, resSist, resBand, resPc, resApp, resOper, resRest
        ].every((r: any) => r.networkError);

        if (isNetworkOffline) {
          setData(mockDashboardPayload);
          return;
        }

        // 1. Program Kerja
        let programKerja = zeroDashboardPayload.programKerja;
        if (resProg.success && Array.isArray(resProg.data) && resProg.data.length > 0) {
          const sorted = [...resProg.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const tw = latest.bulan === 3 ? 'TW I' : latest.bulan === 6 ? 'TW II' : latest.bulan === 10 ? 'TW III' : 'TW IV';
          const monthText = monthsList[latest.bulan - 1] || '';
          const targetDetail = latest.detail_program_kerja_ti?.[0];
          if (targetDetail) {
            programKerja = {
              labels: [`${tw} s.d ${monthText} ${latest.tahun}`],
              datasets: [
                { label: 'Target', data: [parseFloat(targetDetail.target_persen) || 0], backgroundColor: '#0f2e60', barThickness: 40 },
                { label: 'Realisasi', data: [parseFloat(targetDetail.realisasi_persen) || 0], backgroundColor: '#f59e0b', barThickness: 40 }
              ]
            };
          }
        } else if (!resProg.success && resProg.networkError) {
          programKerja = mockDashboardPayload.programKerja;
        }

        // 2. RKAP
        let rkap = zeroDashboardPayload.rkap;
        if (resRkap.success && Array.isArray(resRkap.data) && resRkap.data.length > 0) {
          const sorted = [...resRkap.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_rkap_ti || [];
          const relDetail = details.find((d: any) => d.urutan === 1);
          const costDetail = details.find((d: any) => d.urutan === 2);
          const rVal = relDetail ? parseFloat(relDetail.nilai_nominal) : 0;
          const cVal = costDetail ? parseFloat(costDetail.nilai_nominal) : 0;
          const percentageVal = cVal > 0 ? (rVal / cVal) * 100 : 0;
          const mText = monthsList[latest.bulan - 1] || '';
          rkap = {
            title: `Realisasi RKAP TI (${mText} ${latest.tahun})`,
            percentage: Math.round(percentageVal)
          };
        } else if (!resRkap.success && resRkap.networkError) {
          rkap = mockDashboardPayload.rkap;
        }

        // 3. Licenses
        let licenses = zeroDashboardPayload.licenses;
        if (resLic.success && Array.isArray(resLic.data) && resLic.data.length > 0) {
          let under2 = 0;
          let between2and4 = 0;
          let over4 = 0;

          const sorted = [...resLic.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_lisensi || [];

          details.forEach((detail: any) => {
            const expDate = new Date(detail.tanggal_expired);
            const diffTime = expDate.getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffMonths = diffDays / 30.44;
            if (diffMonths < 2) {
              under2++;
            } else if (diffMonths >= 2 && diffMonths <= 4) {
              between2and4++;
            } else {
              over4++;
            }
          });

          if (details.length > 0) {
            licenses = { 
              under2, 
              between2and4, 
              over4,
              rawList: details.map((d: any) => ({
                nama_aplikasi: d.nama_produk,
                expiry_date: d.tanggal_expired
              }))
            };
          }
        } else if (!resLic.success && resLic.networkError) {
          licenses = mockDashboardPayload.licenses;
        }

        // 4. Report SCMC
        let reportScmc = zeroDashboardPayload.reportScmc;
        if (resScmc.success && Array.isArray(resScmc.data) && resScmc.data.length > 0) {
          const sorted = [...resScmc.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return a.tahun - b.tahun;
            return a.bulan - b.bulan;
          });
          const lastTwo = sorted.slice(-2);
          if (lastTwo.length > 0) {
            const labels = lastTwo.map((rec: any) => {
              const mTextAbbr = monthsAbbr[rec.bulan - 1]?.toUpperCase() || '';
              return `${mTextAbbr} ${rec.tahun}`;
            });
            const dataNormal = lastTwo.map((rec: any) => {
              const detail = rec.detail_ketersediaan_scmc?.find((d: any) => d.urutan === 1);
              return detail ? parseFloat(detail.jumlah) || 0 : 0;
            });
            const dataTersedia = lastTwo.map((rec: any) => {
              const detail = rec.detail_ketersediaan_scmc?.find((d: any) => d.urutan === 2);
              return detail ? parseFloat(detail.jumlah) || 0 : 0;
            });
            reportScmc = {
              labels,
              datasets: [
                { label: 'Laporan Beroperasi Normal', data: dataNormal, backgroundColor: '#0f2e60', barThickness: 30 },
                { label: 'Jumlah Laporan Tersedia', data: dataTersedia, backgroundColor: '#f59e0b', barThickness: 30 }
              ]
            };
          }
        } else if (!resScmc.success && resScmc.networkError) {
          reportScmc = mockDashboardPayload.reportScmc;
        }

        // 5. Ketersediaan Sistem
        let ketersediaanSistem = zeroDashboardPayload.ketersediaanSistem;
        if (resSist.success && Array.isArray(resSist.data) && resSist.data.length > 0) {
          const sorted = [...resSist.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_ketersediaan_sistem || [];
          if (details.length > 0) {
            ketersediaanSistem = {
              labels: details.map((d: any) => d.nama_sistem),
              datasets: [
                { label: 'Rencana', data: details.map((d: any) => parseFloat(d.rencana_persen) || 0), backgroundColor: '#0f2e60', barThickness: 30 },
                { label: 'Realisasi', data: details.map((d: any) => parseFloat(d.realisasi_persen) || 0), backgroundColor: '#f59e0b', barThickness: 30 }
              ]
            };
          }
        } else if (!resSist.success && resSist.networkError) {
          ketersediaanSistem = mockDashboardPayload.ketersediaanSistem;
        }

        // 6. Bandwidth Jaringan
        let bandwidthJaringan = zeroDashboardPayload.bandwidthJaringan;
        if (resBand.success && Array.isArray(resBand.data) && resBand.data.length > 0) {
          const sorted = [...resBand.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_utilisasi_bandwidth || [];
          if (details.length > 0) {
            bandwidthJaringan = {
              labels: details.map((d: any) => d.lokasi.replace(' - Tanjung Enim', '')),
              datasets: [
                { label: 'Bandwidth (Mbps)', data: details.map((d: any) => parseFloat(d.bandwidth_mbps) || 0), backgroundColor: '#0f2e60', barThickness: 20 },
                { label: 'Rata-rata Utilisasi (Mbps)', data: details.map((d: any) => parseFloat(d.rata_utilisasi_mbps) || 0), backgroundColor: '#f59e0b', barThickness: 20 }
              ]
            };
          }
        } else if (!resBand.success && resBand.networkError) {
          bandwidthJaringan = mockDashboardPayload.bandwidthJaringan;
        }

        // Helper to map work order records to 12-month datasets
        const mapWorkOrderData = (resObj: any, zeroPayload: any, mockPayload: any, detailsKey: string) => {
          if (resObj.success && Array.isArray(resObj.data) && resObj.data.length > 0) {
            const sorted = [...resObj.data].sort((a: any, b: any) => b.tahun - a.tahun);
            const latestYear = sorted[0].tahun;
            const yearRecords = resObj.data.filter((r: any) => r.tahun === latestYear);

            const masukData = Array(12).fill(0);
            const selesaiData = Array(12).fill(0);

            yearRecords.forEach((rec: any) => {
              const details = rec[detailsKey] || [];
              details.forEach((d: any) => {
                const mIndex = monthsList.findIndex(m => m.toLowerCase() === d.bulan_teks.toLowerCase());
                if (mIndex >= 0 && mIndex < 12) {
                  masukData[mIndex] = parseInt(d.wo_masuk, 10) || 0;
                  selesaiData[mIndex] = parseInt(d.wo_selesai, 10) || 0;
                }
              });
            });

            return {
              labels: monthsAbbr.map(m => `${m} ${latestYear}`),
              datasets: [
                { label: 'WO Masuk', data: masukData, backgroundColor: '#0f2e60' },
                { label: 'WO Selesai', data: selesaiData, backgroundColor: '#f59e0b' }
              ]
            };
          } else if (!resObj.success && resObj.networkError) {
            return mockPayload;
          }
          return zeroPayload;
        };

        // 7. PC Support
        const pcSupport = mapWorkOrderData(
          resPc,
          zeroDashboardPayload.pcSupport,
          mockDashboardPayload.pcSupport,
          'detail_pc_support'
        );

        // 8. Layanan Aplikasi
        const layananAplikasi = mapWorkOrderData(
          resApp,
          zeroDashboardPayload.layananAplikasi,
          mockDashboardPayload.layananAplikasi,
          'detail_layanan_aplikasi'
        );

        // 9. Layanan Operasional
        const layananOperasional = mapWorkOrderData(
          resOper,
          zeroDashboardPayload.layananOperasional,
          mockDashboardPayload.layananOperasional,
          'detail_layanan_operasional'
        );

        // 10. Restore Ellipse
        const restoreEllipse = mapWorkOrderData(
          resRest,
          zeroDashboardPayload.restoreEllipse,
          mockDashboardPayload.restoreEllipse,
          'detail_realisasi_restore'
        );

        setData({
          programKerja,
          rkap,
          licenses,
          reportScmc,
          ketersediaanSistem,
          bandwidthJaringan,
          pcSupport,
          layananAplikasi,
          layananOperasional,
          restoreEllipse
        });
      } catch (err) {
        console.error('Failed to fetch dashboard overview data:', err);
        setData(mockDashboardPayload);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-900 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Memuat Dashboard Utama...</span>
        </div>
      </div>
    );
  }

  return <DashboardOverview data={data} />;
};
