import React, { useState, useEffect } from 'react';
import { KpiChartCard } from '@/features/dashboard/components/KpiChartCard';
import { RkapDonutChart } from '@/features/dashboard/components/RkapDonutChart';
import { SdmDistributionCard } from '@/features/dashboard/components/SdmDistributionCard';
import { KeamananSistemCard } from '@/features/dashboard/components/KeamananSistemCard';
import { ChartOptions } from 'chart.js';

// Date helper
const getRelativeDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Chart options configurations
const defaultOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { size: 9 } } },
    x: { grid: { display: false }, ticks: { font: { size: 9 } } }
  },
  plugins: { legend: { display: false } }
};

const commonLegendOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { size: 9 } } },
    x: { grid: { display: false }, ticks: { font: { size: 9 } } }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

const horizontalStackedOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  scales: {
    x: { stacked: true, max: 100, ticks: { font: { size: 9 } } },
    y: { stacked: true, ticks: { font: { size: 9 } } }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

const doubleStackedOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: false, ticks: { font: { size: 9 } } },
    y: { stacked: false, ticks: { font: { size: 9 } } }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

// Mock fallback payload (only used if API fetches FAIL/network down)
const mockOverallData = {
  programKerja: {
    labels: ['TW III s.d Okt 2024'],
    datasets: [
      { label: 'Target', data: [100], backgroundColor: '#0f2e60', barThickness: 30 },
      { label: 'Realisasi', data: [92], backgroundColor: '#f59e0b', barThickness: 30 }
    ]
  },
  rkapPercentage: 89,
  sdm: {
    labels: ['Join Dev', 'Network', 'Noc', 'Office Boy', 'PC Support', 'Admin', 'Data Scientist', 'Driver'],
    values: [29, 11, 9, 2, 11, 2, 4, 3]
  },
  licenses: [
    { nama_aplikasi: 'Docu', expiry_date: getRelativeDate(15) },
    { nama_aplikasi: 'Whatsapp', expiry_date: getRelativeDate(30) },
    { nama_aplikasi: 'Insider', expiry_date: getRelativeDate(40) },
    { nama_aplikasi: 'App A', expiry_date: getRelativeDate(45) },
    { nama_aplikasi: 'App B', expiry_date: getRelativeDate(55) },
    { nama_aplikasi: 'App C', expiry_date: getRelativeDate(75) },
    { nama_aplikasi: 'App D', expiry_date: getRelativeDate(95) },
    { nama_aplikasi: 'App E', expiry_date: getRelativeDate(110) },
    { nama_aplikasi: 'SSL', expiry_date: getRelativeDate(150) },
    { nama_aplikasi: 'Web', expiry_date: getRelativeDate(180) },
    { nama_aplikasi: 'App F', expiry_date: getRelativeDate(190) },
    { nama_aplikasi: 'App G', expiry_date: getRelativeDate(200) }
  ],
  reportScmc: {
    labels: ['JUNI 2024', 'OKTOBER 2024'],
    datasets: [
      { label: 'Realisasi Laporan yang Beroperasi Normal', data: [51, 51], backgroundColor: '#0f2e60' },
      { label: 'Jumlah Laporan Tersedia', data: [51, 51], backgroundColor: '#f59e0b' }
    ]
  },
  ketersediaanSistem: {
    labels: ['Ellipse', 'Email', 'CISEA', 'SIMKES'],
    datasets: [
      { label: 'Rencana', data: [100, 100, 100, 100], backgroundColor: '#0f2e60' },
      { label: 'Realisasi', data: [99.5, 99.9, 98, 100], backgroundColor: '#f59e0b' }
    ]
  },
  cpuServer: {
    labels: ['sgspp-esx1', 'sgspp-esx2', 'sgspp-esx3', 'sgspp-esx4', 'tp-esx-01', 'tp-esx-02', 'tp-esx-03', 'tp-esx-04'],
    datasets: [
      { label: 'CPU Cores', data: [140, 140, 140, 140, 140, 140, 140, 140], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (GHz)', data: [40, 35, 45, 50, 60, 45, 55, 40], backgroundColor: '#f59e0b' }
    ]
  },
  memoryServer: {
    labels: ['sgspp-esx1', 'sgspp-esx2', 'sgspp-esx3', 'sgspp-esx4', 'tp-esx-01', 'tp-esx-02', 'tp-esx-03', 'tp-esx-04'],
    datasets: [
      { label: 'Memory (GB)', data: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (GB)', data: [400, 500, 450, 600, 550, 480, 520, 450], backgroundColor: '#f59e0b' }
    ]
  },
  storageServer: {
    labels: ['STE-UNITY-DATA-1', 'STE-UNITY-DATA-2', 'STE-UNITY-DATA-3', 'STE-UNITY-DATA-4', 'STE-VPS-U-1', 'STE-VPS-U-2', 'STE-VPS-U-3', 'STE-VPS-U-4', 'STE-VPS-U-5', 'STE-VPS-U-6', 'STE-VPS-U-7', 'STE-VPS-U-8', 'STE-VPS-EXCH1', 'STE-VPS-EXCH2'],
    datasets: [
      { label: 'Capacity (TB)', data: [12, 10, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 10, 10], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (TB)', data: [10, 8, 6, 7, 6, 6, 7, 5, 6, 6, 7, 6, 8, 8], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiCpu: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [70, 80], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [30, 20], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiMemApp: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [75, 85], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [25, 15], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiCpuDb: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [60, 85], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [40, 15], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiMemDb: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [50, 65], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [50, 35], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiStorageDb: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [80, 90], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [20, 10], backgroundColor: '#f59e0b' }
    ]
  },
  bandwidth: {
    labels: ['Unit. TE - PLG', 'Unit. TRH - TE', 'Unit. KPT - TE', 'Unit. KPT - PLG', 'Unit. LPG - TE', 'Unit. LPG - PLG'],
    datasets: [
      { label: 'Bandwidth (Mbps)', data: [35, 18, 5, 2, 8, 2], backgroundColor: '#0f2e60', grouped: false, barPercentage: 0.8, order: 2 },
      { label: 'Rata-rata Utilisasi (Mbps)', data: [5, 2, 1, 0.5, 1, 0.2], backgroundColor: '#f59e0b', grouped: false, barPercentage: 0.5, order: 1 }
    ]
  },
  wan: {
    labels: ['Unit. TE - PLG', 'Unit. TRH - TE', 'Unit. KPT - TE', 'Unit. KPT - PLG', 'Unit. LPG - TE', 'Unit. LPG - PLG'],
    datasets: [
      { label: 'Target (%)', data: [100, 100, 100, 100, 100, 100], backgroundColor: '#0f2e60', grouped: false, barPercentage: 0.8, order: 2 },
      { label: 'Ketersediaan (%)', data: [100, 100, 100, 100, 100, 100], backgroundColor: '#f59e0b', grouped: false, barPercentage: 0.5, order: 1 }
    ]
  },
  keamanan: [
    { item: 'Proxy Tanjung Enim', rencana: 100, realisasi: 100 },
    { item: 'Security Jaringan', rencana: 100, realisasi: 100 },
    { item: 'Antivirus', rencana: 100, realisasi: 100 }
  ],
  pcSupport: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      { label: 'WO Masuk', data: [10, 15, 20, 80, 50, 40, 60, 40, 45, 50, 900, 100], backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: [9, 14, 19, 75, 48, 38, 55, 38, 42, 48, 850, 95], backgroundColor: '#f59e0b' }
    ]
  },
  layananAplikasi: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      { label: 'WO Masuk', data: [10, 20, 40, 80, 120, 250, 180, 120, 110, 80, 70, 50], backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: [9, 18, 38, 75, 115, 240, 175, 118, 105, 78, 65, 48], backgroundColor: '#f59e0b' }
    ]
  },
  layananOperasional: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      { label: 'WO Masuk', data: [40, 50, 80, 180, 220, 210, 180, 140, 120, 120, 120, 80], backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: [38, 48, 75, 175, 215, 205, 175, 138, 118, 118, 115, 78], backgroundColor: '#f59e0b' }
    ]
  },
  restore: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      { label: 'WO Masuk', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3], backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3], backgroundColor: '#f59e0b' }
    ]
  }
};

// Zeroed default datasets for empty database state
const zeroOverallData = {
  programKerja: {
    labels: ['Program Kerja TI'],
    datasets: [
      { label: 'Target', data: [0], backgroundColor: '#0f2e60', barThickness: 30 },
      { label: 'Realisasi', data: [0], backgroundColor: '#f59e0b', barThickness: 30 }
    ]
  },
  rkapPercentage: 0,
  sdm: {
    labels: ['Join Dev', 'Network', 'Noc', 'Office Boy', 'PC Support', 'Admin', 'Data Scientist', 'Driver'],
    values: [0, 0, 0, 0, 0, 0, 0, 0]
  },
  licenses: [] as any[],
  reportScmc: {
    labels: ['-'],
    datasets: [
      { label: 'Realisasi Laporan yang Beroperasi Normal', data: [0], backgroundColor: '#0f2e60' },
      { label: 'Jumlah Laporan Tersedia', data: [0], backgroundColor: '#f59e0b' }
    ]
  },
  ketersediaanSistem: {
    labels: ['Ellipse', 'Email', 'CISEA', 'SIMKES'],
    datasets: [
      { label: 'Rencana', data: [0, 0, 0, 0], backgroundColor: '#0f2e60' },
      { label: 'Realisasi', data: [0, 0, 0, 0], backgroundColor: '#f59e0b' }
    ]
  },
  cpuServer: {
    labels: ['steppl-esxi1', 'steppl-esxi2', 'steppl-esxi3', 'steppl-esxi4', 'tjevmerp1', 'tjevmerp2', 'tjevmerp3', 'tjevmerp4'],
    datasets: [
      { label: 'CPU Cores', data: [0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (GHz)', data: [0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#f59e0b' }
    ]
  },
  memoryServer: {
    labels: ['steppl-esxi1', 'steppl-esxi2', 'steppl-esxi3', 'steppl-esxi4', 'tjevmerp1', 'tjevmerp2', 'tjevmerp3', 'tjevmerp4'],
    datasets: [
      { label: 'Memory (GB)', data: [0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (GB)', data: [0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#f59e0b' }
    ]
  },
  storageServer: {
    labels: ['STE-UNITY-DATA-1', 'STE-UNITY-DATA-2', 'STE-UNITY-DATA-3', 'STE-UNITY-DATA-4', 'STE-VPS-U-1', 'STE-VPS-U-2', 'STE-VPS-U-3', 'STE-VPS-U-4'],
    datasets: [
      { label: 'Capacity (TB)', data: [0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (TB)', data: [0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiCpu: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [0, 0], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [0, 0], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiMemApp: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [0, 0], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [0, 0], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiCpuDb: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [0, 0], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [0, 0], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiMemDb: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [0, 0], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [0, 0], backgroundColor: '#f59e0b' }
    ]
  },
  utilisasiStorageDb: {
    labels: ['CISEA', 'Ellipse'],
    datasets: [
      { label: 'Free (%)', data: [0, 0], backgroundColor: '#0f2e60' },
      { label: 'Utilisasi (%)', data: [0, 0], backgroundColor: '#f59e0b' }
    ]
  },
  bandwidth: {
    labels: ['M.Kadin', 'Tarahan', 'Kertapati', 'Griya Puncak', 'Bukit Kecil', 'UPO'],
    datasets: [
      { label: 'Bandwidth (Mbps)', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#0f2e60', grouped: false, barPercentage: 0.8, order: 2 },
      { label: 'Rata-rata Utilisasi (Mbps)', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#f59e0b', grouped: false, barPercentage: 0.5, order: 1 }
    ]
  },
  wan: {
    labels: ['M.Kadin', 'Tarahan', 'Kertapati', 'Griya Puncak', 'Bukit Kecil', 'UPO'],
    datasets: [
      { label: 'Target (%)', data: [100, 100, 100, 100, 100, 100], backgroundColor: '#0f2e60', grouped: false, barPercentage: 0.8, order: 2 },
      { label: 'Ketersediaan (%)', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#f59e0b', grouped: false, barPercentage: 0.5, order: 1 }
    ]
  },
  keamanan: [
    { item: 'Proxy Tanjung Enim', rencana: 0, realisasi: 0 },
    { item: 'Security Jaringan', rencana: 0, realisasi: 0 },
    { item: 'Antivirus', rencana: 0, realisasi: 0 }
  ],
  pcSupport: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      { label: 'WO Masuk', data: Array(12).fill(0), backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: Array(12).fill(0), backgroundColor: '#f59e0b' }
    ]
  },
  layananAplikasi: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      { label: 'WO Masuk', data: Array(12).fill(0), backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: Array(12).fill(0), backgroundColor: '#f59e0b' }
    ]
  },
  layananOperasional: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      { label: 'WO Masuk', data: Array(12).fill(0), backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: Array(12).fill(0), backgroundColor: '#f59e0b' }
    ]
  },
  restore: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      { label: 'WO Masuk', data: Array(12).fill(0), backgroundColor: '#0f2e60' },
      { label: 'WO Selesai', data: Array(12).fill(0), backgroundColor: '#f59e0b' }
    ]
  }
};

const monthsAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const monthsList: string[] = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const OverallPage: React.FC = () => {
  const [data, setData] = useState<typeof mockOverallData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLicenseMiniTable, setShowLicenseMiniTable] = useState(false);
  const [licensePage, setLicensePage] = useState(0);

  useEffect(() => {
    const fetchOverallData = async () => {
      try {
        const urls = [
          'http://localhost:5000/api/program-kerja',
          'http://localhost:5000/api/rkap',
          'http://localhost:5000/api/sdm',
          'http://localhost:5000/api/licenses',
          'http://localhost:5000/api/ketersediaan/scmc',
          'http://localhost:5000/api/ketersediaan/sistem',
          'http://localhost:5000/api/utilisasi/cpu',
          'http://localhost:5000/api/utilisasi/memory',
          'http://localhost:5000/api/utilisasi/storage',
          'http://localhost:5000/api/utilisasi/cpu-app',
          'http://localhost:5000/api/utilisasi/memory-app',
          'http://localhost:5000/api/utilisasi/cpu-database',
          'http://localhost:5000/api/utilisasi/memory-database',
          'http://localhost:5000/api/utilisasi/storage-database',
          'http://localhost:5000/api/utilisasi/bandwidth',
          'http://localhost:5000/api/utilisasi/wan-backup',
          'http://localhost:5000/api/ketersediaan/keamanan',
          'http://localhost:5000/api/work-order/pc-support',
          'http://localhost:5000/api/work-order/layanan-app',
          'http://localhost:5000/api/work-order/operasional',
          'http://localhost:5000/api/work-order/restore'
        ];

        const [
          resProg,
          resRkap,
          resSdm,
          resLic,
          resScmc,
          resSist,
          resCpu,
          resMem,
          resStor,
          resCpuApp,
          resMemApp,
          resCpuDb,
          resMemDb,
          resStorDb,
          resBand,
          resWan,
          resKeam,
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
          resProg, resRkap, resSdm, resLic, resScmc, resSist, resCpu, resMem, resStor,
          resCpuApp, resMemApp, resCpuDb, resMemDb, resStorDb, resBand, resWan, resKeam,
          resPc, resApp, resOper, resRest
        ].every((r: any) => r.networkError);

        if (isNetworkOffline) {
          setData(mockOverallData);
          return;
        }

        // 1. Program Kerja
        let programKerja = zeroOverallData.programKerja;
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
                { label: 'Target', data: [parseFloat(targetDetail.target_persen) || 0], backgroundColor: '#0f2e60', barThickness: 30 },
                { label: 'Realisasi', data: [parseFloat(targetDetail.realisasi_persen) || 0], backgroundColor: '#f59e0b', barThickness: 30 }
              ]
            };
          }
        } else if (!resProg.success && resProg.networkError) {
          programKerja = mockOverallData.programKerja;
        }

        // 2. RKAP
        let rkapPercentage = zeroOverallData.rkapPercentage;
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
          rkapPercentage = Math.round(percentageVal);
        } else if (!resRkap.success && resRkap.networkError) {
          rkapPercentage = mockOverallData.rkapPercentage;
        }

        // 3. SDM IT
        let sdm = zeroOverallData.sdm;
        if (resSdm.success && Array.isArray(resSdm.data) && resSdm.data.length > 0) {
          const sorted = [...resSdm.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_sdm_it || [];
          if (details.length > 0) {
            sdm = {
              labels: details.map((d: any) => d.role_divisi),
              values: details.map((d: any) => d.jumlah || 0)
            };
          }
        } else if (!resSdm.success && resSdm.networkError) {
          sdm = mockOverallData.sdm;
        }

        // 4. Licenses
        let licenses = zeroOverallData.licenses;
        if (resLic.success && Array.isArray(resLic.data) && resLic.data.length > 0) {
          const sorted = [...resLic.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_lisensi || [];
          if (details.length > 0) {
            licenses = details.map((d: any) => ({
              nama_aplikasi: d.nama_produk,
              expiry_date: d.tanggal_expired
            }));
          }
        } else if (!resLic.success && resLic.networkError) {
          licenses = mockOverallData.licenses;
        }

        // 5. SCMC
        let reportScmc = zeroOverallData.reportScmc;
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
                { label: 'Realisasi Laporan yang Beroperasi Normal', data: dataNormal, backgroundColor: '#0f2e60' },
                { label: 'Jumlah Laporan Tersedia', data: dataTersedia, backgroundColor: '#f59e0b' }
              ]
            };
          }
        } else if (!resScmc.success && resScmc.networkError) {
          reportScmc = mockOverallData.reportScmc;
        }

        // 6. Ketersediaan Sistem
        let ketersediaanSistem = zeroOverallData.ketersediaanSistem;
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
                { label: 'Rencana', data: details.map((d: any) => parseFloat(d.rencana_persen) || 0), backgroundColor: '#0f2e60' },
                { label: 'Realisasi', data: details.map((d: any) => parseFloat(d.realisasi_persen) || 0), backgroundColor: '#f59e0b' }
              ]
            };
          }
        } else if (!resSist.success && resSist.networkError) {
          ketersediaanSistem = mockOverallData.ketersediaanSistem;
        }

        // 7. CPU Server
        let cpuServer = zeroOverallData.cpuServer;
        if (resCpu.success && Array.isArray(resCpu.data) && resCpu.data.length > 0) {
          const sorted = [...resCpu.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_utilisasi_cpu || [];
          if (details.length > 0) {
            cpuServer = {
              labels: details.map((d: any) => d.nama_server),
              datasets: [
                { label: 'CPU Cores', data: details.map((d: any) => parseInt(d.cpu_cores, 10) || 0), backgroundColor: '#0f2e60' },
                { label: 'Utilisasi (GHz)', data: details.map((d: any) => parseFloat(d.utilisasi_ghz) || 0), backgroundColor: '#f59e0b' }
              ]
            };
          }
        } else if (!resCpu.success && resCpu.networkError) {
          cpuServer = mockOverallData.cpuServer;
        }

        // 8. Memory Server
        let memoryServer = zeroOverallData.memoryServer;
        if (resMem.success && Array.isArray(resMem.data) && resMem.data.length > 0) {
          const sorted = [...resMem.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_utilisasi_memory || [];
          if (details.length > 0) {
            memoryServer = {
              labels: details.map((d: any) => d.nama_server),
              datasets: [
                { label: 'Memory (GB)', data: details.map((d: any) => parseFloat(d.memory_gb) || 0), backgroundColor: '#0f2e60' },
                { label: 'Utilisasi (GB)', data: details.map((d: any) => parseFloat(d.utilisasi_gb) || 0), backgroundColor: '#f59e0b' }
              ]
            };
          }
        } else if (!resMem.success && resMem.networkError) {
          memoryServer = mockOverallData.memoryServer;
        }

        // 9. Storage Server
        let storageServer = zeroOverallData.storageServer;
        if (resStor.success && Array.isArray(resStor.data) && resStor.data.length > 0) {
          const sorted = [...resStor.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_utilisasi_storage || [];
          if (details.length > 0) {
            storageServer = {
              labels: details.map((d: any) => d.nama_storage),
              datasets: [
                { label: 'Capacity (TB)', data: details.map((d: any) => parseFloat(d.capacity_tb) || 0), backgroundColor: '#0f2e60' },
                { label: 'Utilisasi (TB)', data: details.map((d: any) => parseFloat(d.utilisasi_tb) || 0), backgroundColor: '#f59e0b' }
              ]
            };
          }
        } else if (!resStor.success && resStor.networkError) {
          storageServer = mockOverallData.storageServer;
        }

        // 10-13. Horizontal Stacked Apps
        const mapHorizontalStacked = (resObj: any, zeroVal: any, mockVal: any, relationKey: string) => {
          if (resObj.success && Array.isArray(resObj.data) && resObj.data.length > 0) {
            const sorted = [...resObj.data].sort((a: any, b: any) => {
              if (a.tahun !== b.tahun) return b.tahun - a.tahun;
              return b.bulan - a.bulan;
            });
            const latest = sorted[0];
            const details = latest[relationKey] || [];
            if (details.length > 0) {
              return {
                labels: details.map((d: any) => d.nama_sistem),
                datasets: [
                  { label: 'Free (%)', data: details.map((d: any) => parseFloat(d.free_persen) || 0), backgroundColor: '#0f2e60' },
                  { label: 'Utilisasi (%)', data: details.map((d: any) => parseFloat(d.utilisasi_persen) || 0), backgroundColor: '#f59e0b' }
                ]
              };
            }
          } else if (!resObj.success && resObj.networkError) {
            return mockVal;
          }
          return zeroVal;
        };

        const utilisasiCpu = mapHorizontalStacked(resCpuApp, zeroOverallData.utilisasiCpu, mockOverallData.utilisasiCpu, 'detail_cpu_aplikasi');
        const utilisasiMemApp = mapHorizontalStacked(resMemApp, zeroOverallData.utilisasiMemApp, mockOverallData.utilisasiMemApp, 'detail_memory_aplikasi');
        const utilisasiCpuDb = mapHorizontalStacked(resCpuDb, zeroOverallData.utilisasiCpuDb, mockOverallData.utilisasiCpuDb, 'detail_cpu_db_aplikasi');
        const utilisasiMemDb = mapHorizontalStacked(resMemDb, zeroOverallData.utilisasiMemDb, mockOverallData.utilisasiMemDb, 'detail_memory_db_aplikasi');
        const utilisasiStorageDb = mapHorizontalStacked(resStorDb, zeroOverallData.utilisasiStorageDb, mockOverallData.utilisasiStorageDb, 'detail_storage_db_aplikasi');

        // 14. Bandwidth
        let bandwidth = zeroOverallData.bandwidth;
        if (resBand.success && Array.isArray(resBand.data) && resBand.data.length > 0) {
          const sorted = [...resBand.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_utilisasi_bandwidth || [];
          if (details.length > 0) {
            bandwidth = {
              labels: details.map((d: any) => d.lokasi.replace(' - Tanjung Enim', '')),
              datasets: [
                { label: 'Bandwidth (Mbps)', data: details.map((d: any) => parseFloat(d.bandwidth_mbps) || 0), backgroundColor: '#0f2e60', grouped: false, barPercentage: 0.8, order: 2 },
                { label: 'Rata-rata Utilisasi (Mbps)', data: details.map((d: any) => parseFloat(d.utilisasi_mbps) || 0), backgroundColor: '#f59e0b', grouped: false, barPercentage: 0.5, order: 1 }
              ]
            };
          }
        } else if (!resBand.success && resBand.networkError) {
          bandwidth = mockOverallData.bandwidth;
        }

        // 15. WAN
        let wan = zeroOverallData.wan;
        if (resWan.success && Array.isArray(resWan.data) && resWan.data.length > 0) {
          const sorted = [...resWan.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_ketersediaan_backup || [];
          if (details.length > 0) {
            wan = {
              labels: details.map((d: any) => d.lokasi.replace(' - Tanjung Enim', '')),
              datasets: [
                { label: 'Target (%)', data: details.map(() => 100), backgroundColor: '#0f2e60', grouped: false, barPercentage: 0.8, order: 2 },
                { label: 'Ketersediaan (%)', data: details.map((d: any) => parseFloat(d.ketersediaan_persen) || 0), backgroundColor: '#f59e0b', grouped: false, barPercentage: 0.5, order: 1 }
              ]
            };
          }
        } else if (!resWan.success && resWan.networkError) {
          wan = mockOverallData.wan;
        }

        // 16. Keamanan
        let keamanan = zeroOverallData.keamanan;
        if (resKeam.success && Array.isArray(resKeam.data) && resKeam.data.length > 0) {
          const sorted = [...resKeam.data].sort((a: any, b: any) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
          const latest = sorted[0];
          const details = latest.detail_ketersediaan_keamanan || [];
          if (details.length > 0) {
            keamanan = details.map((d: any) => ({
              item: d.nama_sistem,
              rencana: parseFloat(d.rencana_persen) || 0,
              realisasi: parseFloat(d.realisasi_persen) || 0
            }));
          }
        } else if (!resKeam.success && resKeam.networkError) {
          keamanan = mockOverallData.keamanan;
        }

        // 17-20. Work Orders
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

        const pcSupport = mapWorkOrderData(resPc, zeroOverallData.pcSupport, mockOverallData.pcSupport, 'detail_pc_support');
        const layananAplikasi = mapWorkOrderData(resApp, zeroOverallData.layananAplikasi, mockOverallData.layananAplikasi, 'detail_layanan_aplikasi');
        const layananOperasional = mapWorkOrderData(resOper, zeroOverallData.layananOperasional, mockOverallData.layananOperasional, 'detail_layanan_operasional');
        const restore = mapWorkOrderData(resRest, zeroOverallData.restore, mockOverallData.restore, 'detail_realisasi_restore');

        setData({
          programKerja,
          rkapPercentage,
          sdm,
          licenses,
          reportScmc,
          ketersediaanSistem,
          cpuServer,
          memoryServer,
          storageServer,
          utilisasiCpu,
          utilisasiMemApp,
          utilisasiCpuDb,
          utilisasiMemDb,
          utilisasiStorageDb,
          bandwidth,
          wan,
          keamanan,
          pcSupport,
          layananAplikasi,
          layananOperasional,
          restore
        });
      } catch (err) {
        console.error('Failed to fetch Overall page data:', err);
        setData(mockOverallData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverallData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-900 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Memuat Data Overall...</span>
        </div>
      </div>
    );
  }

  const today = new Date();
  const aggregatedLicenses = data.licenses.reduce(
    (acc, item) => {
      const expiry = new Date(item.expiry_date);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      const months = diffDays <= 0 ? 0 : diffDays / 30;

      if (months <= 2) {
        acc.under2++;
      } else if (months <= 4) {
        acc.between2and4++;
      } else {
        acc.over4++;
      }
      return acc;
    },
    { under2: 0, between2and4: 0, over4: 0 }
  );

  return (
    <div className="w-full flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold text-slate-800">Data Overall</h2>
      </div>

      {/* SECTION 1: IT Planning & Security */}
      <section className="flex flex-col gap-3">
        <div className="border-b border-slate-200 pb-1.5">
          <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">IT Planning &amp; Security</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[240px]">
            <KpiChartCard
              title="Realisasi Program Kerja TI"
              options={defaultOptions}
              data={data.programKerja}
              onClick={() => window.location.href = '/realisasi-program-kerja-ti'}
            />
          </div>
          <div className="h-[240px]">
            <RkapDonutChart
              title="Realisasi RKAP TI"
              percentage={data.rkapPercentage}
              onClick={() => window.location.href = '/realisasi-rkap-ti'}
            />
          </div>
          <div className="h-[240px]">
            <SdmDistributionCard
              data={data.sdm}
              onClick={() => window.location.href = '/sdm-it-outsource-pegawai'}
            />
          </div>
          <div
            onClick={() => window.location.href = '/lisensi'}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[240px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 shrink-0">
              <span className="text-xs font-semibold text-slate-800">Ringkasan Urgensi Kedaluwarsa Lisensi</span>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-slate-400 select-none uppercase tracking-wide bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  Klik Kartu untuk Rincian
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLicenseMiniTable(!showLicenseMiniTable);
                    setLicensePage(0); // Reset page on toggle
                  }}
                  className="text-[9px] font-bold text-primary-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-all select-none"
                >
                  {showLicenseMiniTable ? 'Kembali' : 'Detail'}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex items-center min-h-0 py-2.5">
              {!showLicenseMiniTable ? (
                /* DEFAULT STATE: 3 columns side-by-side */
                <div className="grid grid-cols-3 gap-3 w-full">
                  {/* Urgensi */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 border border-red-100 text-center h-[110px]">
                    <span className="text-2xl font-extrabold text-red-600 leading-none">{aggregatedLicenses.under2}</span>
                    <span className="text-[10px] font-bold text-red-700 uppercase mt-1.5">Urgensi</span>
                    <span className="text-[8px] text-slate-400 font-medium mt-0.5">&lt;= 2 Bulan</span>
                  </div>
                  {/* Peringatan */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 border border-amber-100 text-center h-[110px]">
                    <span className="text-2xl font-extrabold text-amber-600 leading-none">{aggregatedLicenses.between2and4}</span>
                    <span className="text-[10px] font-bold text-amber-700 uppercase mt-1.5">Peringatan</span>
                    <span className="text-[8px] text-slate-400 font-medium mt-0.5">2 - 4 Bulan</span>
                  </div>
                  {/* Aman */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 border border-blue-100 text-center h-[110px]">
                    <span className="text-2xl font-extrabold text-primary-900 leading-none">{aggregatedLicenses.over4}</span>
                    <span className="text-[10px] font-bold text-slate-700 uppercase mt-1.5">Aman</span>
                    <span className="text-[8px] text-slate-400 font-medium mt-0.5">&gt; 4 Bulan</span>
                  </div>
                </div>
              ) : (
                /* EXPANDED STATE: Left stack (col-span-4) + Right table (col-span-8) */
                <div className="grid grid-cols-12 gap-3 w-full items-stretch h-full">
                  {/* Left Column Stack (col-span-4) */}
                  <div className="col-span-4 flex flex-col gap-2 justify-center">
                    {/* Urgensi */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-red-50 border border-red-100">
                      <span className="text-2xl font-black text-red-600 leading-none min-w-[22px] text-center">{aggregatedLicenses.under2}</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-red-700 uppercase leading-none">Urgensi</span>
                        <span className="text-[8px] text-slate-400 font-semibold mt-0.5">&lt;= 2 Bulan</span>
                      </div>
                    </div>
                    {/* Peringatan */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                      <span className="text-2xl font-black text-amber-600 leading-none min-w-[22px] text-center">{aggregatedLicenses.between2and4}</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-amber-700 uppercase leading-none">Peringatan</span>
                        <span className="text-[8px] text-slate-400 font-semibold mt-0.5">2 - 4 Bulan</span>
                      </div>
                    </div>
                    {/* Aman */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                      <span className="text-2xl font-black text-primary-900 leading-none min-w-[22px] text-center">{aggregatedLicenses.over4}</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700 uppercase leading-none">Aman</span>
                        <span className="text-[8px] text-slate-400 font-semibold mt-0.5">&gt; 4 Bulan</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Mini Table (col-span-8) */}
                  <div className="col-span-8 flex flex-col justify-between h-full border border-slate-150 rounded-lg bg-slate-50 p-2.5 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1 min-h-0 overflow-hidden">
                      {data.licenses && data.licenses.length > 0 ? (
                        <table className="w-full text-left border-collapse table-fixed">
                          <thead>
                            <tr className="text-[9px] font-bold text-slate-400 border-b border-slate-200 uppercase tracking-wider bg-white">
                              <th className="py-1 px-2 w-7/12">Produk</th>
                              <th className="py-1 px-2 text-right w-5/12">Exp Date</th>
                            </tr>
                          </thead>
                          <tbody className="text-[10px] text-slate-700 divide-y divide-slate-100 bg-white">
                            {data.licenses
                              .slice(licensePage * 4, (licensePage + 1) * 4)
                              .map((lic: any, idx: number) => {
                                const expDate = new Date(lic.expiry_date);
                                const diffTime = expDate.getTime() - new Date().getTime();
                                const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);

                                let dateColorClass = 'text-slate-500';
                                if (diffMonths <= 2) dateColorClass = 'text-red-600 font-extrabold';
                                else if (diffMonths <= 4) dateColorClass = 'text-amber-600 font-extrabold';

                                const formattedDate = isNaN(expDate.getTime()) ? lic.expiry_date : expDate.toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                });

                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="py-1.5 px-2 font-semibold truncate">{lic.nama_aplikasi}</td>
                                    <td className={`py-1.5 px-2 text-right font-mono ${dateColorClass}`}>{formattedDate}</td>
                                  </tr>
                                );
                              })}
                            {/* Empty rows to maintain size if less than 4 items on last page */}
                            {Array.from({ length: Math.max(0, 4 - data.licenses.slice(licensePage * 4, (licensePage + 1) * 4).length) }).map((_, i) => (
                              <tr key={`empty-${i}`} className="opacity-0">
                                <td className="py-1.5 px-2">-</td>
                                <td className="py-1.5 px-2">-</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-[10px] text-center text-slate-400 py-4">Tidak ada data lisensi</div>
                      )}
                    </div>

                    {/* Mini Table Pagination */}
                    {data.licenses && data.licenses.length > 4 && (
                      <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 shrink-0 mt-1">
                        <button
                          type="button"
                          disabled={licensePage === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLicensePage(prev => Math.max(0, prev - 1));
                          }}
                          className="text-[9px] font-extrabold text-slate-600 hover:text-primary-900 disabled:opacity-30 disabled:cursor-not-allowed select-none px-2 py-0.5 bg-white border border-slate-200 rounded transition-colors"
                        >
                          Prev
                        </button>
                        <span className="text-[9px] font-bold text-slate-400">
                          {licensePage + 1} / {Math.ceil(data.licenses.length / 4)}
                        </span>
                        <button
                          type="button"
                          disabled={(licensePage + 1) * 4 >= data.licenses.length}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLicensePage(prev => prev + 1);
                          }}
                          className="text-[9px] font-extrabold text-slate-600 hover:text-primary-900 disabled:opacity-30 disabled:cursor-not-allowed select-none px-2 py-0.5 bg-white border border-slate-200 rounded transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: App Dev & Services */}
      <section className="flex flex-col gap-3">
        <div className="border-b border-slate-200 pb-1.5">
          <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">App Dev &amp; Services</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[240px]">
            <KpiChartCard
              title="Ketersediaan Report Aplikasi SCMC"
              options={commonLegendOptions}
              data={data.reportScmc}
              onClick={() => window.location.href = '/ketersediaan-report-aplikasi-scmc'}
            />
          </div>
          <div className="h-[240px]">
            <KpiChartCard
              title="Tingkat Ketersediaan Sistem"
              options={commonLegendOptions}
              data={data.ketersediaanSistem}
              onClick={() => window.location.href = '/tingkat-ketersediaan-sistem'}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: IT Operation */}
      <section className="flex flex-col gap-3">
        <div className="border-b border-slate-200 pb-1.5">
          <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">IT Operation</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[240px]">
            <KpiChartCard
              title="Visualisasi - CPU Cores vs Utilisasi"
              options={commonLegendOptions}
              data={data.cpuServer}
              onClick={() => window.location.href = '/utilisasi-cpu-server'}
            />
          </div>
          <div className="h-[240px]">
            <KpiChartCard
              title="Visualisasi - Memory Capacity vs Utilisasi"
              options={commonLegendOptions}
              data={data.memoryServer}
              onClick={() => window.location.href = '/utilisasi-memory-server'}
            />
          </div>

          <div className="md:col-span-2 h-[240px]">
            <KpiChartCard
              title="Visualisasi - Storage Capacity vs Utilization"
              options={commonLegendOptions}
              data={data.storageServer}
              onClick={() => window.location.href = '/utilisasi-storage-server'}
            />
          </div>

          {/* Sub-grid of Horizontal Stacked Charts */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="h-[240px]">
              <KpiChartCard
                title="Visualisasi Utilisasi CPU"
                options={horizontalStackedOptions}
                data={data.utilisasiCpu}
                onClick={() => window.location.href = '/utilisasi-cpu-aplikasi'}
              />
            </div>
            <div className="h-[240px]">
              <KpiChartCard
                title="Visualisasi Utilisasi Memory"
                options={horizontalStackedOptions}
                data={data.utilisasiMemApp}
                onClick={() => window.location.href = '/utilisasi-memory-aplikasi'}
              />
            </div>
            <div className="h-[240px]">
              <KpiChartCard
                title="Visualisasi Utilisasi CPU Database"
                options={horizontalStackedOptions}
                data={data.utilisasiCpuDb}
                onClick={() => window.location.href = '/utilisasi-cpu-database'}
              />
            </div>
            <div className="h-[240px]">
              <KpiChartCard
                title="Visualisasi Utilisasi Memory Database"
                options={horizontalStackedOptions}
                data={data.utilisasiMemDb}
                onClick={() => window.location.href = '/utilisasi-memory-database'}
              />
            </div>
            <div className="h-[240px]">
              <KpiChartCard
                title="Visualisasi Storage Database"
                options={horizontalStackedOptions}
                data={data.utilisasiStorageDb}
                onClick={() => window.location.href = '/utilisasi-storage-database'}
              />
            </div>
          </div>

          <div className="h-[240px]">
            <KpiChartCard
              title="Visualisasi Utilisasi Bandwidth Jaringan"
              options={doubleStackedOptions}
              data={data.bandwidth}
              onClick={() => window.location.href = '/rata-rata-utilisasi-bandwidth-jaringan'}
            />
          </div>
          <div className="h-[240px]">
            <KpiChartCard
              title="Visualisasi Ketersediaan Jaringan (WAN) PTBA"
              options={doubleStackedOptions}
              data={data.wan}
              onClick={() => window.location.href = '/ketersediaan-sistem-backup-ellipse-email-dr-ellipse-jaringan-wan-dan-cisea'}
            />
          </div>
          <div className="h-[240px]">
            <KeamananSistemCard
              data={data.keamanan}
              onClick={() => window.location.href = '/ketersediaan-sistem-keamanan-ti'}
            />
          </div>
          <div className="h-[240px]">
            <KpiChartCard
              title="Visualisasi Penyelesaian Pekerjaan PC Support"
              options={commonLegendOptions}
              data={data.pcSupport}
              onClick={() => window.location.href = '/penyelesaian-pekerjaan-pc-support'}
            />
          </div>
          <div className="h-[240px]">
            <KpiChartCard
              title="Visualisasi Penyelesaian Permintaan Layanan Aplikasi TI"
              options={commonLegendOptions}
              data={data.layananAplikasi}
              onClick={() => window.location.href = '/penyelesaian-permintaan-layanan-aplikasi-ti'}
            />
          </div>
          <div className="h-[240px]">
            <KpiChartCard
              title="Visualisasi Penyelesaian Permintaan Layanan TI di Operasional TI"
              options={commonLegendOptions}
              data={data.layananOperasional}
              onClick={() => window.location.href = '/penyelesaian-permintaan-layanan-ti'}
            />
          </div>

          <div className="md:col-span-2 max-w-4xl w-full mx-auto h-[240px]">
            <KpiChartCard
              title="Visualisasi Realisasi Restore Ellipse dan Email sesuai kebutuhan"
              options={commonLegendOptions}
              data={data.restore}
              onClick={() => window.location.href = '/realisasi-restore-ellipse-dan-email'}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
