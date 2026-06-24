import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Default to expanded (false) to match user screenshot
  const [sidebarWidth, setSidebarWidth] = useState(230); // Increased default width slightly (from 192px to 230px)
  const [isResizing, setIsResizing] = useState(false);

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
        // Limit width between 180px and 400px for usability
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

  return (
    <div className="flex h-screen overflow-hidden text-slate-800 bg-white">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        width={sidebarWidth}
        isResizing={isResizing}
        onMouseDownResize={startResizing}
      />
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
