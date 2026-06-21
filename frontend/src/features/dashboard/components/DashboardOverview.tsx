import React from 'react';
import { KpiChartCard } from './KpiChartCard';
import { RkapDonutChart } from './RkapDonutChart';
import { LicenseUrgencyCard } from './LicenseUrgencyCard';
import { ChartOptions } from 'chart.js';

const monthsAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const getRelativeDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const stackedBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { stacked: true, beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { size: 9 } } },
    x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45, font: {size: 9} } }
  },
  plugins: { legend: { display: false } }
};

const angledLabelsOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { size: 9 } } },
    x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45, font: {size: 9} } }
  },
  plugins: { legend: { display: false } }
};

const defaultOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { size: 9 } } },
    x: { grid: { display: false }, ticks: { font: { size: 9 } } }
  },
  plugins: { legend: { display: false } }
};

// Data mock passed down via props to simulate real-time integrability
const mockDashboardData = {
  programKerja: {
    labels: ['TW III s.d Okt 2024'],
    datasets: [
      { label: 'Target', data: [100], backgroundColor: '#0f2e60', barThickness: 40 },
      { label: 'Realisasi', data: [92], backgroundColor: '#f59e0b', barThickness: 40 }
    ]
  },
  rkapPercentage: 89,
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

interface DashboardOverviewProps {
  data?: typeof mockDashboardData;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ data = mockDashboardData }) => {
  return (
    <div className="w-full h-full p-3 flex flex-col gap-3 lg:overflow-hidden overflow-y-auto">
      {/* Baris 1: 4 Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:flex-1 lg:min-h-0">
        <KpiChartCard 
          title="Realisasi Program Kerja TI" 
          options={defaultOptions}
          data={data.programKerja} 
          onClick={() => window.location.href = '/realisasi-program-kerja-ti'}
        />
        
        <RkapDonutChart 
          percentage={data.rkapPercentage} 
          onClick={() => window.location.href = '/realisasi-rkap-ti'}
        />

        <LicenseUrgencyCard 
          licenses={data.licenses} 
          onClick={() => window.location.href = '/lisensi'}
        />

        <KpiChartCard 
          title="Ketersediaan Report Aplikasi SCMC" 
          options={defaultOptions}
          data={data.reportScmc} 
          onClick={() => window.location.href = '/ketersediaan-report-aplikasi-scmc'}
        />
      </div>

      {/* Baris 2: 3 Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:flex-1 lg:min-h-0">
        <KpiChartCard 
          title="Tingkat Ketersediaan Sistem" 
          options={defaultOptions}
          data={data.ketersediaanSistem} 
          onClick={() => window.location.href = '/tingkat-ketersediaan-sistem'}
        />

        <KpiChartCard 
          title="Visualisasi Utilisasi Bandwidth Jaringan" 
          options={stackedBarOptions}
          data={data.bandwidthJaringan} 
          onClick={() => window.location.href = '/rata-rata-utilisasi-bandwidth-jaringan'}
        />

        <KpiChartCard 
          title="Penyelesaian Pekerjaan PC Support" 
          options={angledLabelsOptions}
          data={data.pcSupport} 
          onClick={() => window.location.href = '/penyelesaian-pekerjaan-pc-support'}
        />
      </div>

      {/* Baris 3: 3 Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:flex-1 lg:min-h-0">
        <KpiChartCard 
          title="Penyelesaian Permintaan Layanan Aplikasi TI" 
          options={angledLabelsOptions}
          data={data.layananAplikasi} 
          onClick={() => window.location.href = '/penyelesaian-permintaan-layanan-aplikasi-ti'}
        />

        <KpiChartCard 
          title="Penyelesaian Permintaan Layanan TI di Operasional TI" 
          options={angledLabelsOptions}
          data={data.layananOperasional} 
          onClick={() => window.location.href = '/penyelesaian-permintaan-layanan-ti-di-operasional-ti'}
        />

        <KpiChartCard 
          title="Realisasi Restore Ellipse dan Email" 
          options={defaultOptions}
          data={data.restoreEllipse} 
          onClick={() => window.location.href = '/realisasi-restore-ellipse-dan-email-sesuai-kebutuhan'}
        />
      </div>
    </div>
  );
};
