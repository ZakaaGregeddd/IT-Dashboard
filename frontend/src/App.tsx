import React, { useState, useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage, OverallPage, RealisasiProgramKerjaPage, RealisasiRkapPage, SdmItPage, LisensiPage, KetersediaanScmcPage, TingkatKetersediaanSistemPage, UtilisasiCpuServerPage, UtilisasiMemoryServerPage, UtilisasiStorageServerPage, UtilisasiCpuAplikasiPage, UtilisasiCpuDbAplikasiPage, UtilisasiBandwidthPage, UtilisasiMemoryDbApkPage, UtilisasiStorageDbApkPage, UtilisasiWanBackupPage, KetersediaanKeamananPage, PcSupportPage, RestorePage, OperasionalTiPage, LayananAppPage, UtilisasiMemoryAplikasiPage } from '@/pages';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('navigate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleLocationChange);
    };
  }, []);

  const renderPage = () => {
    if (currentPath === '/' || currentPath === '/dashboard') {
      return <DashboardPage />;
    }
    if (currentPath === '/data-overall') {
      return <OverallPage />;
    }
    if (currentPath === '/realisasi-program-kerja-ti') {
      return <RealisasiProgramKerjaPage />;
    }
    if (currentPath === '/realisasi-rkap-ti') {
      return <RealisasiRkapPage />;
    }
    if (currentPath === '/sdm-it-outsource-pegawai') {
      return <SdmItPage />;
    }
    if (currentPath === '/lisensi') {
      return <LisensiPage />;
    }
    if (currentPath === '/ketersediaan-report-aplikasi-scmc') {
      return <KetersediaanScmcPage />;
    }
    if (currentPath === '/tingkat-ketersediaan-sistem') {
      return <TingkatKetersediaanSistemPage />;
    }
    if (currentPath === '/utilisasi-cpu-server') {
      return <UtilisasiCpuServerPage />;
    }
    if (currentPath === '/utilisasi-memory-server') {
      return <UtilisasiMemoryServerPage />;
    }
    if (currentPath === '/utilisasi-storage-server') {
      return <UtilisasiStorageServerPage />;
    }
    if (currentPath === '/utilisasi-cpu-aplikasi') {
      return <UtilisasiCpuAplikasiPage />;
    }
    if (currentPath === '/utilisasi-memory-aplikasi') {
      return <UtilisasiMemoryAplikasiPage />;
    }
    if (currentPath === '/utilisasi-cpu-database') {
      return <UtilisasiCpuDbAplikasiPage />;
    }
    if (currentPath === '/utilisasi-memory-database') {
      return <UtilisasiMemoryDbApkPage />;
    }
    if (currentPath === '/utilisasi-storage-database') {
      return <UtilisasiStorageDbApkPage />;
    }
    if (currentPath === '/rata-rata-utilisasi-bandwidth-jaringan') {
      return <UtilisasiBandwidthPage />;
    }
    if (currentPath === '/ketersedian-sistem-backup') {
      return <UtilisasiWanBackupPage />;
    }
    if (currentPath === '/ketersediaan-sistem-keamanan-ti') {
      return <KetersediaanKeamananPage />;
    }
    if (currentPath === '/penyelesaian-pekerjaan-pc-support') {
      return <PcSupportPage />;
    }
    if (currentPath === '/realisasi-restore-ellipse-dan-email') {
      return <RestorePage />;
    }
    if (currentPath === '/penyelesaian-permintaan-layanan-ti') {
      return <OperasionalTiPage />;
    }
    if (currentPath === '/penyelesaian-permintaan-layanan-aplikasi-ti') {
      return <LayananAppPage />;
    }
    // Default fallback to Dashboard
    return <DashboardPage />;
  };

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  );
};

export default App;
