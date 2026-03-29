import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardView from '@/components/admin/DashboardView';
import UsersView from '@/components/admin/UsersView';
import ServersView from '@/components/admin/ServersView';

export default function Admin() {
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'users': return <UsersView />;
      case 'servers': return <ServersView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060910]">
      <AdminSidebar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
      <AdminHeader activePage={activePage} />
      <main className="lg:ml-64 pt-16 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}