import React from 'react';
import { KpiChartCard } from './KpiChartCard';
import { RkapDonutChart } from './RkapDonutChart';
import { LicenseUrgencyCard } from './LicenseUrgencyCard';
import { ChartOptions } from 'chart.js';

const defaultOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { size: 9 } } },
    x: { grid: { display: false }, ticks: { font: { size: 9 } } }
  },
  plugins: { legend: { display: false } }
};

const stackedBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true, grid: { display: false }, ticks: { font: { size: 9 } } },
    y: { stacked: true, beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { size: 9 } } }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

const angledLabelsOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { size: 9 } } },
    x: { 
      grid: { display: false }, 
      ticks: { 
        font: { size: 9 },
        maxRotation: 45,
        minRotation: 45
      } 
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

export interface DashboardData {
  programKerja: any;
  rkap: { title: string; percentage: number };
  licenses: { under2: number; between2and4: number; over4: number };
  reportScmc: any;
  ketersediaanSistem: any;
  bandwidthJaringan: any;
  pcSupport: any;
  layananAplikasi: any;
  layananOperasional: any;
  restoreEllipse: any;
}

interface DashboardOverviewProps {
  data: DashboardData;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ data }) => {
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
          title={data.rkap.title}
          percentage={data.rkap.percentage} 
          onClick={() => window.location.href = '/realisasi-rkap-ti'}
        />

        <LicenseUrgencyCard 
          data={data.licenses} 
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
