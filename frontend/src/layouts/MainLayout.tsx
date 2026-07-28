import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const MainLayout = () => {
  const { user, token } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} role={user.role} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar Component */}
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
