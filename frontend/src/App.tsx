import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardPage, OverallPage } from '@/pages';

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
    switch (currentPath) {
      case '/data-overall':
        return <OverallPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  );
};

export default App;
