
import React, { useState, useEffect } from 'react';
import { ChevronDown, Database, LayoutDashboard, Monitor, ShieldCheck } from 'lucide-react';
import { cn } from '@/components/ui/Card';
import { navigateTo } from '@/utils/navigation';

interface SidebarMenuItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ label, icon, active, onClick, children }) => {
  const [isOpen, setIsOpen] = useState(active || false);
  const hasChildren = !!children;

  useEffect(() => {
    if (active) {
      setIsOpen(true);
    }
  }, [active]);

  if (!hasChildren) {
    return (
      <a 
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(
          "flex items-center gap-2.5 px-4 py-2 transition-colors",
          active 
            ? "bg-primary-800 border-l-4 border-amber-500 text-white" 
            : "text-slate-300 hover:text-white hover:bg-white/5"
        )} 
        href="#"
      >
        <div className={cn("w-4 h-4", active ? "text-amber-500" : "text-slate-300")}>
          {icon}
        </div>
        <span className="font-medium text-[11px] uppercase tracking-wide">{label}</span>
      </a>
    );
  }

  return (
    <div className="mt-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2 transition-colors",
          active 
            ? "bg-primary-800 border-l-4 border-amber-500 text-white" 
            : "text-slate-300 hover:text-white hover:bg-white/5"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn("w-4 h-4", active ? "text-amber-500" : "text-white")}>{icon}</div>
          <span className="font-medium text-[10px] uppercase tracking-wide">{label}</span>
        </div>
        <ChevronDown className={cn("w-3 h-3 text-white transition-transform", isOpen ? "" : "transform rotate-180")} />
      </button>
      {isOpen && (
        <div className="flex flex-col py-1">
          {children}
        </div>
      )}
    </div>
  );
};

const convertToSlug = (text: string): string => {
  return '/' + text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters
    .trim()
    .replace(/\s+/g, '-');   // Replace spaces with dash
};

export const SidebarSubItem: React.FC<{ label: string; currentPath: string; to?: string; isNested?: boolean }> = ({ label, currentPath, to, isNested }) => {
  const slug = to || convertToSlug(label);
  const isActive = currentPath === slug;
  return (
    <a 
      onClick={(e) => {
        e.preventDefault();
        navigateTo(slug);
      }}
      className={cn(
        "pr-4 py-1.5 text-[10px] transition-colors leading-snug cursor-pointer block",
        isNested ? "pl-12 ml-6 font-medium" : "pl-9 ml-6",
        isActive ? "text-amber-500 font-semibold" : "text-slate-300 hover:text-white"
      )}
      href={slug}
    >
      {label}
    </a>
  );
};

interface SidebarSubCategoryProps {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}

const SidebarSubCategory: React.FC<SidebarSubCategoryProps> = ({ label, active, children }) => {
  const [isOpen, setIsOpen] = useState(active || false);

  useEffect(() => {
    if (active) {
      setIsOpen(true);
    }
  }, [active]);

  return (
    <div className="flex flex-col mt-0.5 mb-0.5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-start pl-9 pr-4 py-1.5 text-[10px] transition-colors leading-snug ml-6 cursor-pointer text-left relative",
          active ? "text-amber-500 font-semibold" : "text-slate-300 hover:text-white"
        )}
      >
        <ChevronDown className={cn("w-2.5 h-2.5 shrink-0 transition-transform absolute left-3.5 top-[7px]", isOpen ? "" : "transform -rotate-90")} />
        <span className="leading-tight pr-2">{label}</span>
      </button>
      {isOpen && (
        <div className="flex flex-col py-0.5">
          {children}
        </div>
      )}
    </div>
  );
};

const appDevItems = [
  "Ketersediaan report aplikasi SCMC",
  "Tingkat ketersediaan sistem"
];

// Title Case formatter with rules for prepositions and acronyms
const formatDropdownText = (text: string): string => {
  const lowercaseWords = ['dan', 'di'];
  const acronyms = ['CPU', 'IT', 'SCMC', 'CISEA', 'WAN', 'DR', 'PC', 'TI', 'UPO'];
  
  return text
    .split(' ')
    .map((word, index) => {
      const cleanWord = word.replace(/[(),.!?]/g, '');
      const cleanLower = cleanWord.toLowerCase();
      
      const matchedAcronym = acronyms.find(a => a.toLowerCase() === cleanLower);
      if (matchedAcronym) {
        return word.replace(cleanWord, matchedAcronym);
      }
      
      if (index > 0 && lowercaseWords.includes(cleanLower)) {
        return word.replace(cleanWord, cleanLower);
      }
      
      if (cleanWord.length > 0) {
        let capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
        if (cleanLower === 'ellipse') {
          capitalized = 'Ellipse';
        } else if (cleanLower === 'opernasional' || cleanLower === 'opernasionalnya') {
          capitalized = 'Operasional';
        } else if (cleanLower === 'perkerjaan') {
          capitalized = 'Pekerjaan';
        }
        return word.replace(cleanWord, capitalized);
      }
      return word;
    })
    .join(' ');
};

interface SidebarProps {
  isCollapsed: boolean;
  width: number;
  isResizing: boolean;
  onMouseDownResize?: (e: React.MouseEvent) => void;
  onCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, width, isResizing, onMouseDownResize, onCollapse }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && onCollapse) {
        onCollapse();
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('navigate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleLocationChange);
    };
  }, [onCollapse]);

  const isItPlanningActive = [
    "Realisasi Program Kerja TI",
    "Realisasi RKAP TI",
    "SDM IT (Outsource & Pegawai)",
    "Lisensi"
  ].some(item => convertToSlug(item) === currentPath);

  const isAppDevActive = appDevItems.some(item => convertToSlug(item) === currentPath);

  const isItOperationActive = [
    '/utilisasi-cpu-server',
    '/utilisasi-memory-server',
    '/utilisasi-storage-server',
    '/utilisasi-cpu-aplikasi',
    '/utilisasi-memory-aplikasi',
    '/utilisasi-cpu-database',
    '/utilisasi-memory-database',
    '/utilisasi-storage-database',
    '/rata-rata-utilisasi-bandwidth-jaringan',
    '/ketersedian-sistem-backup',
    '/ketersediaan-sistem-keamanan-ti',
    '/penyelesaian-pekerjaan-pc-support',
    '/penyelesaian-permintaan-layanan-aplikasi-ti',
    '/penyelesaian-permintaan-layanan-ti',
    '/realisasi-restore-ellipse-dan-email'
  ].includes(currentPath);

  return (
    <aside 
      style={{ width: isCollapsed ? 0 : width }}
      className={cn(
        "bg-primary-900 text-white flex flex-col flex-shrink-0 z-50 overflow-hidden select-none",
        "fixed lg:relative top-0 bottom-0 left-0 h-screen lg:h-auto border-r border-white/5",
        isResizing ? "" : "transition-all duration-300 ease-in-out"
      )}
    >
      <div style={{ width }} className="h-full flex flex-col relative">
        {/* Sidebar Header */}
        <div className="h-11 flex items-center px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
              <div className="w-2 h-2 border border-white rounded-sm"></div>
              <div className="w-2 h-2 border border-white rounded-sm"></div>
            </div>
            <span className="font-semibold text-xs leading-tight tracking-wide whitespace-nowrap">
              Sistem Pelaporan<br/>Bulanan Terpusat
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 flex flex-col gap-1">
          <SidebarMenuItem 
            label="Dashboard" 
            icon={<LayoutDashboard className="w-full h-full" />} 
            active={currentPath === '/' || currentPath === '/dashboard'} 
            onClick={() => navigateTo('/')}
          />
          <SidebarMenuItem 
            label="Data Overall" 
            icon={<Database className="w-full h-full" />} 
            active={currentPath === '/data-overall'}
            onClick={() => navigateTo('/data-overall')}
          />

          <SidebarMenuItem 
            label="IT Planning & Security" 
            icon={<ShieldCheck className="w-full h-full" />}
            active={isItPlanningActive}
          >
            <SidebarSubItem label="Realisasi Program Kerja TI" currentPath={currentPath} />
            <SidebarSubItem label="Realisasi RKAP TI" currentPath={currentPath} />
            <SidebarSubItem label="SDM IT (Outsource & Pegawai)" currentPath={currentPath} />
            <SidebarSubItem label="Lisensi" currentPath={currentPath} />
          </SidebarMenuItem>
 
          <SidebarMenuItem 
            label="App Dev & Services / EIS" 
            icon={<Monitor className="w-full h-full" />}
            active={isAppDevActive}
          >
            {appDevItems.map((item, idx) => (
              <SidebarSubItem key={idx} label={formatDropdownText(item)} currentPath={currentPath} />
            ))}
          </SidebarMenuItem>
 
          <SidebarMenuItem 
            label="IT Operation" 
            icon={<Database className="w-full h-full" />}
            active={isItOperationActive}
          >
            <SidebarSubItem label="Utilisasi CPU Server" currentPath={currentPath} to="/utilisasi-cpu-server" />
            <SidebarSubItem label="Utilisasi Memory Server" currentPath={currentPath} to="/utilisasi-memory-server" />
            <SidebarSubItem label="Utilisasi Storage Server" currentPath={currentPath} to="/utilisasi-storage-server" />
            {/* Sub-Category: Aplikasi */}
            <SidebarSubCategory 
              label="Utilisasi CPU & Memory Aplikasi Ellipse, Eproc (Cisea-Spend) & Minemarket"
              active={[
                '/utilisasi-cpu-aplikasi',
                '/utilisasi-memory-aplikasi'
              ].includes(currentPath)}
            >
              <SidebarSubItem label="CPU" currentPath={currentPath} to="/utilisasi-cpu-aplikasi" isNested />
              <SidebarSubItem label="Memory" currentPath={currentPath} to="/utilisasi-memory-aplikasi" isNested />
            </SidebarSubCategory>
            
            {/* Sub-Category: Database */}
            <SidebarSubCategory 
              label="Utilisasi CPU & Memory Database Ellipse, Minemarket & Eproc (CISEA - SPEND)"
              active={[
                '/utilisasi-cpu-database',
                '/utilisasi-memory-database',
                '/utilisasi-storage-database'
              ].includes(currentPath)}
            >
              <SidebarSubItem label="CPU Database" currentPath={currentPath} to="/utilisasi-cpu-database" isNested />
              <SidebarSubItem label="Memory Database" currentPath={currentPath} to="/utilisasi-memory-database" isNested />
              <SidebarSubItem label="Storage" currentPath={currentPath} to="/utilisasi-storage-database" isNested />
            </SidebarSubCategory>

            <SidebarSubItem label="Rata-rata Utilisasi Bandwidth Jaringan" currentPath={currentPath} to="/rata-rata-utilisasi-bandwidth-jaringan" />
            <SidebarSubItem label="Ketersedian Sistem Backup Ellipse, Email, DR Ellipse, Jaringan (WAN) dan CISEA" currentPath={currentPath} to="/ketersedian-sistem-backup" />
            <SidebarSubItem label="Tingkat Ketersediaan Sistem Keamanan TI" currentPath={currentPath} to="/ketersediaan-sistem-keamanan-ti" />
            <SidebarSubItem label="Penyelesaian Pekerjaan PC Support" currentPath={currentPath} to="/penyelesaian-pekerjaan-pc-support" />
            <SidebarSubItem label="Penyelesaian Permintaan Layanan Aplikasi TI" currentPath={currentPath} to="/penyelesaian-permintaan-layanan-aplikasi-ti" />
            <SidebarSubItem label="Penyelesaian Permintaan Layanan TI di Operasional TI" currentPath={currentPath} to="/penyelesaian-permintaan-layanan-ti" />
            <SidebarSubItem label="Realisasi Restore Ellipse dan Email Sesuai Kebutuhan" currentPath={currentPath} to="/realisasi-restore-ellipse-dan-email" />
          </SidebarMenuItem>
        </nav>
        
        {/* Resize Handle */}
        {!isCollapsed && onMouseDownResize && (
          <div 
            onMouseDown={onMouseDownResize}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-amber-500/40 active:bg-amber-500/70 transition-colors z-30 group lg:flex hidden items-center justify-center"
          >
            <div className="w-0.5 h-8 bg-white/10 group-hover:bg-white/40 rounded transition-colors" />
          </div>
        )}
      </div>
    </aside>
  );
};
