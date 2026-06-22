import React, { useState, useEffect } from 'react';
import { DashboardOverview, DashboardData } from '../components/DashboardOverview';

const monthsAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Centralized aggregated dashboard response mock payload
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
    over4: 12
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

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate dynamic API fetching
    const timer = setTimeout(() => {
      setData(mockDashboardPayload);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
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
