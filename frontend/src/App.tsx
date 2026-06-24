import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { TemplateLoader } from '@/components/TemplateLoader';
import { DashboardPage, OverallPage, RealisasiProgramKerjaPage, RealisasiRkapPage, SdmItPage, LisensiPage, KetersediaanScmcPage, TingkatKetersediaanSistemPage, UtilisasiCpuServerPage, UtilisasiMemoryServerPage, UtilisasiStorageServerPage, UtilisasiCpuAplikasiPage, UtilisasiCpuDbAplikasiPage, UtilisasiBandwidthPage, UtilisasiMemoryDbApkPage, UtilisasiStorageDbApkPage, UtilisasiWanBackupPage, KetersediaanKeamananPage, PcSupportPage, RestorePage, OperasionalTiPage, LayananAppPage, UtilisasiMemoryAplikasiPage } from '@/pages';

const templatePaths: Record<string, string> = {
  '/': '1dashboard',
  '/dashboard': '1dashboard',
  '/data-overall': '2dataoverall',
  '/realisasi-program-kerja-ti': '3realisasi',
  '/realisasi-rkap-ti': '4rkap',
  '/lisensi': '6lisensi',
  '/ketersediaan-report-aplikasi-scmc': '7scmc',
  '/tingkat-ketersediaan-sistem': '8sistem',
  '/utilisasi-cpu-server': '9cpuserver',
  '/utilisasi-memory-server': '10memoryerver',
  '/utilisasi-storage-server': '11storageserver',
  '/utilisasi-cpu-aplikasi': '12cpuapp',
  '/utilisasi-memory-aplikasi': '23memoryapp',
  '/utilisasi-cpu-database': '13cpudb',
  '/utilisasi-memory-database': '14memorydb',
  '/utilisasi-storage-database': '15storagedb',
  '/rata-rata-utilisasi-bandwidth-jaringan': '16jaringan',
  '/ketersedian-sistem-backup': '17wan',
  '/ketersediaan-sistem-keamanan-ti': '18keamanan',
  '/penyelesaian-pekerjaan-pc-support': '19pcsupport',
  '/penyelesaian-permintaan-layanan-aplikasi-ti': '20layananapp',
  '/penyelesaian-permintaan-layanan-ti': '21operasiTI',
  '/realisasi-restore-ellipse-dan-email': '22restore'
};

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
    // Find the mapped folder name for the current path or fallback to dashboard
    const folderName = templatePaths[currentPath] || '1dashboard';
    return <TemplateLoader folderName={folderName} />;
  };

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  );
};

export default App;
