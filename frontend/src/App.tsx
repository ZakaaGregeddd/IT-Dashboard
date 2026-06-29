import React, { useState, useEffect } from 'react';
import { UploadFilePage } from '@/features/dashboard/pages/UploadFilePage';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage, OverallPage, RealisasiProgramKerjaPage, RealisasiRkapPage, SdmItPage, LisensiPage, KetersediaanScmcPage, TingkatKetersediaanSistemPage, UtilisasiCpuServerPage, UtilisasiMemoryServerPage, UtilisasiStorageServerPage, UtilisasiCpuAplikasiPage, UtilisasiCpuDbAplikasiPage, UtilisasiBandwidthPage, UtilisasiMemoryDbApkPage, UtilisasiStorageDbApkPage, UtilisasiWanBackupPage, KetersediaanKeamananPage, PcSupportPage, RestorePage, OperasionalTiPage, LayananAppPage, UtilisasiMemoryAplikasiPage, TestPage } from '@/pages';

import { checkIsDirty, setIsDirtyCheck, navigateTo, setGlobalDirty } from '@/utils/navigation';
import { AlertTriangle } from 'lucide-react';

const playWarningSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Mainkan nada pemberitahuan hangat premium menggunakan gelombang sinus ganda dengan peluruhan eksponensial
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(360, now); // Nada fundamental rendah
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(450, now + 0.04); // Lonceng harmonik hangat, sedikit bergeser
    gain2.gain.setValueAtTime(0.06, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.65);
    
    osc2.start(now + 0.04);
    osc2.stop(now + 0.65);
  } catch (e) {
    console.warn('Web Audio warning sound play blocked or unsupported:', e);
  }
};

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState('');

  useEffect(() => {
    let lastPath = window.location.pathname;

    const handleLocationChange = () => {
      if (window.location.pathname !== lastPath) {
        if (checkIsDirty()) {
          const targetPath = window.location.pathname;
          window.history.pushState({}, '', lastPath);
          setPendingPath(targetPath);
          setIsWarningOpen(true);
          playWarningSound();
          return;
        }
      }
      lastPath = window.location.pathname;
      setCurrentPath(window.location.pathname);
      // Reset state dirty global setelah navigasi berhasil
      setGlobalDirty(false);
    };

    const handleShowWarning = (e: any) => {
      const path = e.detail?.path;
      if (path) {
        setPendingPath(path);
        setIsWarningOpen(true);
        playWarningSound();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (checkIsDirty()) {
        e.preventDefault();
        e.returnValue = 'Ada perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?';
        return e.returnValue;
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('navigate', handleLocationChange);
    window.addEventListener('show-unsaved-warning' as any, handleShowWarning);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleLocationChange);
      window.removeEventListener('show-unsaved-warning' as any, handleShowWarning);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleConfirmLeave = () => {
    setIsWarningOpen(false);
    setIsDirtyCheck(null);
    setGlobalDirty(false);
    navigateTo(pendingPath);
  };

  const renderPage = () => {
    if (currentPath === '/upload-file') {
      return <UploadFilePage />;
    }
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
    if (currentPath === '/testpage'){
      return <TestPage />;
    }
    // Fallback default ke Dashboard
    return <DashboardPage />;
  };

  return (
    <>
      <MainLayout>
        {renderPage()}
      </MainLayout>

      {/* Modal Peringatan Perubahan Belum Disimpan Kustom */}
      {isWarningOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-slate-800">Perubahan Belum Disimpan</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Terdapat perubahan data yang belum Anda simpan. Apakah Anda yakin ingin meninggalkan halaman ini dan membatalkan semua perubahan?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-2 pt-3 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setIsWarningOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-[10px] uppercase tracking-wider"
              >
                Tetap di Sini
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm text-[10px] uppercase tracking-wider"
              >
                Tinggalkan Halaman
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
