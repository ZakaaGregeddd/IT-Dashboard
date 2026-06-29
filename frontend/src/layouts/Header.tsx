import React, { useState, useEffect } from 'react';
import { Home, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { navigateTo } from '@/utils/navigation';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const breadcrumbMapping: Record<string, string> = {
  '/upload-file': 'Upload File Excel (Beta)',
  '/': 'Dashboard Utama',
  '/dashboard': 'Dashboard Utama',
  '/data-overall': 'Data Overall',
  // Perencanaan & Keamanan TI
  '/realisasi-program-kerja-ti': 'IT Planning & Security / Realisasi Program Kerja TI',
  '/realisasi-rkap-ti': 'IT Planning & Security / Realisasi RKAP TI',
  '/sdm-it-outsource-pegawai': 'IT Planning & Security / SDM IT (Outsource & Pegawai)',
  '/lisensi': 'IT Planning & Security / Lisensi',
  // Pengembangan & Layanan Aplikasi
  '/ketersediaan-report-aplikasi-scmc': 'App Dev & Services / Ketersediaan Report SCMC',
  '/tingkat-ketersediaan-sistem': 'App Dev & Services / Tingkat Ketersediaan Sistem',
  // Operasional TI
  '/utilisasi-cpu-server': 'IT Operation / Utilisasi CPU Server',
  '/utilisasi-memory-server': 'IT Operation / Utilisasi Memori Server',
  '/utilisasi-storage-server': 'IT Operation / Utilisasi Storage Server',
  '/utilisasi-cpu-aplikasi': 'IT Operation / utilisasi CPU & memory aplikasi Ellipse & CISEA / CPU',
  '/utilisasi-memory-aplikasi': 'IT Operation / utilisasi CPU & memory aplikasi Ellipse & CISEA / Memory',
  '/utilisasi-cpu-database': 'IT Operation / Utilisasi CPU, memory & storage database Ellipse & CISEA / CPU Database',
  '/utilisasi-memory-database': 'IT Operation / Utilisasi CPU, memory & storage database Ellipse & CISEA / Memory Database',
  '/utilisasi-storage-database': 'IT Operation / Utilisasi CPU, memory & storage database Ellipse & CISEA / Storage',
  '/rata-rata-utilisasi-bandwidth-jaringan': 'IT Operation / Rata-rata Utilisasi Bandwidth Jaringan',
  '/ketersedian-sistem-backup': 'IT Operation / Ketersediaan Sistem Backup Ellipse, Email, DR Ellipse, Jaringan WAN dan CISEA',
  '/ketersediaan-sistem-keamanan-ti': 'IT Operation / Tingkat Ketersediaan Sistem Keamanan TI',
  '/penyelesaian-pekerjaan-pc-support': 'IT Operation / Penyelesaian Pekerjaan PC Support',
  '/penyelesaian-permintaan-layanan-aplikasi-ti': 'IT Operation / Penyelesaian Permintaan Layanan Aplikasi TI',
  '/penyelesaian-permintaan-layanan-ti': 'IT Operation / Penyelesaian Permintaan Layanan TI di Operasional TI',
  '/realisasi-restore-ellipse-dan-email': 'IT Operation / Realisasi Restore Ellipse dan Email'
};

export const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, onToggleSidebar }) => {
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

  const getBreadcrumbs = () => {
    const fullText = breadcrumbMapping[currentPath] || 'Dashboard Utama';
    return fullText.split(' / ').map((segment, index, array) => (
      <React.Fragment key={index}>
        {index > 0 && <span className="text-slate-300">/</span>}
        <span className={index === array.length - 1 ? "font-medium text-slate-700" : "text-slate-400"}>
          {segment}
        </span>
      </React.Fragment>
    ));
  };

  return (
    <header className="flex-none h-11 flex items-center justify-between px-6 border-b border-slate-200 bg-white z-20">
      <div className="flex items-center gap-4 text-sm">
        <button 
          onClick={onToggleSidebar}
          className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors flex items-center justify-center"
          aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <a 
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
            className="text-slate-400 hover:text-slate-600 flex items-center cursor-pointer" 
            href="/"
          >
            <Home className="w-4 h-4" />
          </a>
          <span className="text-slate-300">/</span>
          {getBreadcrumbs()}
        </div>
      </div>
      
      {/* Avatar Pengguna */}
      <div className="flex items-center">
        <Avatar fallback="A" />
      </div>
    </header>
  );
};
