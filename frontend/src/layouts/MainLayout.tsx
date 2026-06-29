import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Sembunyikan (collapse) sidebar secara default pada layar mobile (<1024px)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [sidebarWidth, setSidebarWidth] = useState(230);
  const [isResizing, setIsResizing] = useState(false);

  // Sembunyikan sidebar secara otomatis saat resize jika berada di bawah ambang batas tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
    mouseDownEvent.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        // Batasi lebar antara 180px dan 400px untuk kegunaan (usability)
        const newWidth = Math.max(180, Math.min(400, mouseMoveEvent.clientX));
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const showMobileOverlay = !isSidebarCollapsed && typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div className="flex h-screen overflow-hidden text-slate-800 bg-white relative">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        width={sidebarWidth}
        isResizing={isResizing}
        onMouseDownResize={startResizing}
        onCollapse={() => setIsSidebarCollapsed(true)}
      />
      
      {/* Overlay Latar Belakang Sidebar Mobile */}
      {showMobileOverlay && (
        <div 
          onClick={() => setIsSidebarCollapsed(true)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden cursor-pointer animate-in fade-in duration-200"
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white relative z-10">
        <Header 
          isSidebarCollapsed={isSidebarCollapsed} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <div className="flex-1 min-h-0 bg-slate-50 lg:overflow-hidden overflow-y-auto flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};
