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
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!children;

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
        <span className="font-medium text-[10px] uppercase tracking-wide">{label}</span>
      </a>
    );
  }

  return (
    <div className="mt-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4">{icon}</div>
          <span className="font-medium text-[9px] text-white uppercase tracking-wide">{label}</span>
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

export const SidebarSubItem: React.FC<{ label: string }> = ({ label }) => (
  <a className="pl-9 pr-4 py-1.5 text-[9px] text-slate-300 hover:text-white transition-colors leading-snug ml-6" href="#">
    {label}
  </a>
);

const appDevItems = [
  "Ketersediaan report aplikasi SCMC",
  "Tingkat ketersediaan sistem"
];

const itOperationItems = [
  "utilisasi CPU server",
  "utilisasi memory server",
  "utilisasi storage server",
  "utilisasi CPU aplikasi Ellipse dan CISEA",
  "utilisasi CPU database aplikasi ellipse dan CISEA",
  "utilisasi memory database Ellipse dan CISEA",
  "utilisasi storage database Ellipse dan CISEA",
  "rata-rata utilisasi bandwidth jaringan",
  "ketersedian sistem backup Ellipse, email, DR Ellipse, jaringan (WAN) dan CISEA",
  "Tingkat ketersediaan sistem keamanan TI",
  "Penyelesaian perkerjaan PC support",
  "penyelesaian permintaan layanan aplikasi TI",
  "penyelesaian permintaan layanan TI di opernasional TI",
  "Realisasi restore ellipse dan email sesuai kebutuhan"
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
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
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

  return (
    <aside className={cn(
      "bg-primary-900 text-white flex flex-col flex-shrink-0 relative z-20 transition-all duration-300 ease-in-out overflow-hidden",
      isCollapsed ? "w-0" : "w-48"
    )}>
      <div className="w-48 h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="h-11 flex items-center px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
              <div className="w-2 h-2 border border-white rounded-sm"></div>
              <div className="w-2 h-2 border border-white rounded-sm"></div>
            </div>
            <span className="font-semibold text-xs leading-tight tracking-wide">
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

          <SidebarMenuItem label="IT Planning & Security" icon={<ShieldCheck className="w-full h-full" />}>
            <SidebarSubItem label="Realisasi Program Kerja TI" />
            <SidebarSubItem label="Realisasi RKAP TI" />
            <SidebarSubItem label="SDM IT (Outsource & Pegawai)" />
            <SidebarSubItem label="Lisensi" />
          </SidebarMenuItem>

          <SidebarMenuItem label="App Dev & Services / EIS" icon={<Monitor className="w-full h-full" />}>
            {appDevItems.map((item, idx) => (
              <SidebarSubItem key={idx} label={formatDropdownText(item)} />
            ))}
          </SidebarMenuItem>

          <SidebarMenuItem label="IT Operation" icon={<Database className="w-full h-full" />}>
            {itOperationItems.map((item, idx) => (
              <SidebarSubItem key={idx} label={formatDropdownText(item)} />
            ))}
          </SidebarMenuItem>
        </nav>
      </div>
    </aside>
  );
};
