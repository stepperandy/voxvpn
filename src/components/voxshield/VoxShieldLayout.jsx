import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Building2, Users, Globe, FileText, BarChart3, Settings, LogOut, Home, LayoutDashboard } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/shield', icon: BarChart3, roles: ['super_admin', 'agency_admin', 'client_admin'] },
  { label: 'Agency', path: '/shield/agency', icon: LayoutDashboard, roles: ['super_admin', 'agency_admin'] },
  { label: 'Agencies', path: '/shield/agencies', icon: Building2, roles: ['super_admin'] },
  { label: 'Clients', path: '/shield/clients', icon: Users, roles: ['super_admin', 'agency_admin'] },
  { label: 'DNS Filtering', path: '/shield/dns-filtering', icon: Globe, roles: ['super_admin', 'agency_admin', 'client_admin'] },
  { label: 'Security Logs', path: '/shield/security-logs', icon: Shield, roles: ['super_admin', 'agency_admin', 'client_admin'] },
  { label: 'Reports', path: '/shield/reports', icon: FileText, roles: ['super_admin', 'agency_admin', 'client_admin'] },
  { label: 'Settings', path: '/shield/settings', icon: Settings, roles: ['super_admin', 'agency_admin', 'client_admin'] },
];

export default function VoxShieldLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const userRole = user?.role || 'user';
  const visibleNav = navItems.filter(item => item.roles.includes(userRole));

  const isActive = (path) => {
    if (path === '/shield') return location.pathname === '/shield';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => base44.auth.logout('/');

  return (
    <div className="min-h-screen bg-[#080c18] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-64'} transition-all duration-300 overflow-hidden bg-[#0d1120] border-r border-white/5 flex-shrink-0 flex flex-col`}>
        <div className="p-5 border-b border-white/5">
          <Link to="/shield" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Shield size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">VoxShield</p>
              <p className="text-slate-500 text-[10px]">Security Dashboard</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNav.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}>
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all">
            <Home size={16} /> Main Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-[#0d1120]/80 backdrop-blur border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-20">
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <div className="hidden md:block">
            <p className="text-slate-500 text-xs">VoxShield Security Platform</p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs hidden sm:block">{user.full_name || user.email}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {userRole.replace('_', ' ')}
              </span>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}