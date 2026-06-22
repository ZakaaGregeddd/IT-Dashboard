import React, { useState, useEffect } from 'react';
import { KpiChartCard } from '@/features/dashboard/components/KpiChartCard';
import { RkapDonutChart } from '@/features/dashboard/components/RkapDonutChart';
import { LicenseUrgencyCard } from '@/features/dashboard/components/LicenseUrgencyCard';
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
    x: { stacked: true, ticks: { font: { size: 9 } } },
    y: { stacked: true, ticks: { font: { size: 9 } } }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

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
    // <= 2 Bulan (5 items)
    { nama_aplikasi: 'Docu', expiry_date: getRelativeDate(15) },
    { nama_aplikasi: 'Whatsapp', expiry_date: getRelativeDate(30) },
    { nama_aplikasi: 'Insider', expiry_date: getRelativeDate(40) },
    { nama_aplikasi: 'App A', expiry_date: getRelativeDate(45) },
    { nama_aplikasi: 'App B', expiry_date: getRelativeDate(55) },
    
    // 2 - 4 Bulan (3 items)
    { nama_aplikasi: 'App C', expiry_date: getRelativeDate(75) },
    { nama_aplikasi: 'App D', expiry_date: getRelativeDate(95) },
    { nama_aplikasi: 'App E', expiry_date: getRelativeDate(110) },

    // > 4 Bulan (12 items)
    { nama_aplikasi: 'SSL', expiry_date: getRelativeDate(150) },
    { nama_aplikasi: 'Web', expiry_date: getRelativeDate(180) },
    { nama_aplikasi: 'App F', expiry_date: getRelativeDate(190) },
    { nama_aplikasi: 'App G', expiry_date: getRelativeDate(200) },
    { nama_aplikasi: 'App H', expiry_date: getRelativeDate(210) },
    { nama_aplikasi: 'App I', expiry_date: getRelativeDate(220) },
    { nama_aplikasi: 'App J', expiry_date: getRelativeDate(230) },
    { nama_aplikasi: 'App K', expiry_date: getRelativeDate(240) },
    { nama_aplikasi: 'App L', expiry_date: getRelativeDate(250) },
    { nama_aplikasi: 'App M', expiry_date: getRelativeDate(260) },
    { nama_aplikasi: 'App N', expiry_date: getRelativeDate(270) },
    { nama_aplikasi: 'App O', expiry_date: getRelativeDate(280) }
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
      { label: 'Bandwidth (Mbps)', data: [35, 18, 5, 2, 8, 2], backgroundColor: '#0f2e60' },
      { label: 'Rata-rata Utilisasi (Mbps)', data: [5, 2, 1, 0.5, 1, 0.2], backgroundColor: '#f59e0b' }
    ]
  },
  wan: {
    labels: ['Unit. TE - PLG', 'Unit. TRH - TE', 'Unit. KPT - TE', 'Unit. KPT - PLG', 'Unit. LPG - TE', 'Unit. LPG - PLG'],
    datasets: [{ label: 'Ketersediaan (%)', data: [100, 100, 100, 100, 100, 100], backgroundColor: '#0f2e60' }]
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

export const OverallPage: React.FC = () => {
  const [data, setData] = useState<typeof mockOverallData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate dynamic API fetching
    const timer = setTimeout(() => {
      setData(mockOverallData);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
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
          <KpiChartCard 
            title="Realisasi Program Kerja TI" 
            options={defaultOptions} 
            data={data.programKerja} 
            onClick={() => window.location.href = '/realisasi-program-kerja-ti'}
          />
          <RkapDonutChart 
            title="Realisasi RKAP TI" 
            percentage={data.rkapPercentage} 
            onClick={() => window.location.href = '/realisasi-rkap-ti'}
          />
          <SdmDistributionCard 
            data={data.sdm} 
            onClick={() => window.location.href = '/sdm-it-outsource-pegawai'}
          />
          <LicenseUrgencyCard 
            data={aggregatedLicenses} 
            onClick={() => window.location.href = '/lisensi'}
          />
        </div>
      </section>

      {/* SECTION 2: App Dev & Services */}
      <section className="flex flex-col gap-3">
        <div className="border-b border-slate-200 pb-1.5">
          <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">App Dev &amp; Services</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KpiChartCard 
            title="Ketersediaan Report Aplikasi SCMC" 
            options={commonLegendOptions} 
            data={data.reportScmc} 
            onClick={() => window.location.href = '/ketersediaan-report-aplikasi-scmc'}
          />
          <KpiChartCard 
            title="Tingkat Ketersediaan Sistem" 
            options={commonLegendOptions} 
            data={data.ketersediaanSistem} 
            onClick={() => window.location.href = '/tingkat-ketersediaan-sistem'}
          />
        </div>
      </section>

      {/* SECTION 3: IT Operation */}
      <section className="flex flex-col gap-3">
        <div className="border-b border-slate-200 pb-1.5">
          <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">IT Operation</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KpiChartCard 
            title="Visualisasi - CPU Cores vs Utilisasi" 
            options={commonLegendOptions} 
            data={data.cpuServer} 
            onClick={() => window.location.href = '/utilisasi-cpu-server'}
          />
          <KpiChartCard 
            title="Visualisasi - Memory Capacity vs Utilisasi" 
            options={commonLegendOptions} 
            data={data.memoryServer} 
            onClick={() => window.location.href = '/utilisasi-memory-server'}
          />
          
          <div className="md:col-span-2">
            <KpiChartCard 
              title="Visualisasi - Storage Capacity vs Utilization" 
              options={commonLegendOptions} 
              data={data.storageServer} 
              onClick={() => window.location.href = '/utilisasi-storage-server'}
            />
          </div>

          {/* Sub-grid of Horizontal Stacked Charts */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiChartCard 
              title="Visualisasi Utilisasi CPU" 
              options={horizontalStackedOptions} 
              data={data.utilisasiCpu} 
              onClick={() => window.location.href = '/utilisasi-cpu-aplikasi-ellipse-dan-cisea'}
            />
            <KpiChartCard 
              title="Visualisasi Utilisasi CPU Database" 
              options={horizontalStackedOptions} 
              data={data.utilisasiCpuDb} 
              onClick={() => window.location.href = '/utilisasi-cpu-database-aplikasi-ellipse-dan-cisea'}
            />
            <KpiChartCard 
              title="Visualisasi Utilisasi Memory Database" 
              options={horizontalStackedOptions} 
              data={data.utilisasiMemDb} 
              onClick={() => window.location.href = '/utilisasi-memory-database-ellipse-dan-cisea'}
            />
            <KpiChartCard 
              title="Visualisasi Storage Database" 
              options={horizontalStackedOptions} 
              data={data.utilisasiStorageDb} 
              onClick={() => window.location.href = '/utilisasi-storage-database-ellipse-dan-cisea'}
            />
          </div>

          <KpiChartCard 
            title="Visualisasi Utilisasi Bandwidth Jaringan" 
            options={doubleStackedOptions} 
            data={data.bandwidth} 
            onClick={() => window.location.href = '/rata-rata-utilisasi-bandwidth-jaringan'}
          />
          <KpiChartCard 
            title="Visualisasi Ketersediaan Jaringan (WAN) PTBA" 
            options={defaultOptions} 
            data={data.wan} 
            onClick={() => window.location.href = '/ketersediaan-sistem-backup-ellipse-email-dr-ellipse-jaringan-wan-dan-cisea'}
          />
          <KeamananSistemCard 
            data={data.keamanan} 
            onClick={() => window.location.href = '/tingkat-ketersediaan-sistem-keamanan-ti'}
          />
          <KpiChartCard 
            title="Visualisasi Penyelesaian Pekerjaan PC Support" 
            options={commonLegendOptions} 
            data={data.pcSupport} 
            onClick={() => window.location.href = '/penyelesaian-pekerjaan-pc-support'}
          />
          <KpiChartCard 
            title="Visualisasi Penyelesaian Permintaan Layanan Aplikasi TI" 
            options={commonLegendOptions} 
            data={data.layananAplikasi} 
            onClick={() => window.location.href = '/penyelesaian-permintaan-layanan-aplikasi-ti'}
          />
          <KpiChartCard 
            title="Visualisasi Penyelesaian Permintaan Layanan TI di Operasional TI" 
            options={commonLegendOptions} 
            data={data.layananOperasional} 
            onClick={() => window.location.href = '/penyelesaian-permintaan-layanan-ti-di-operasional-ti'}
          />

          <div className="md:col-span-2 max-w-4xl w-full mx-auto">
            <KpiChartCard 
              title="Visualisasi Realisasi Restore Ellipse dan Email sesuai kebutuhan" 
              options={commonLegendOptions} 
              data={data.restore} 
              onClick={() => window.location.href = '/realisasi-restore-ellipse-dan-email-sesuai-kebutuhan'}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
