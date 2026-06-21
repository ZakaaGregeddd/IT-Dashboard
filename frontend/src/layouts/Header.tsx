import React from 'react';
import { Home, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed, onToggleSidebar }) => {
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
          <a className="text-slate-400 hover:text-slate-600 flex items-center" href="#">
            <Home className="w-4 h-4" />
          </a>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-700">Dashboard Utama</span>
        </div>
      </div>
      
      {/* User Avatar */}
      <div className="flex items-center">
        <Avatar fallback="A" />
      </div>
    </header>
  );
};
