import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden text-slate-800 bg-white">
      <Sidebar isCollapsed={isSidebarCollapsed} />
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
