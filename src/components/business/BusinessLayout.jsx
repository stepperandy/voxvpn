import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import BusinessAlerts from '@/components/business/BusinessAlerts';
import { Shield, LayoutDashboard, Users, Monitor, Lock, Download, CreditCard, LogOut, Home, Building2, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Team & Subscriptions', icon: Users, tab: 'team' },
  { label: 'Overview', icon: LayoutDashboard, tab: 'overview' },
  { label: 'Devices', icon: Monitor, tab: 'devices' },
  { label: 'Security', icon: Lock, tab: 'security' },
  { label: 'Billing', icon: CreditCard, tab: 'billing' },
  { label: 'Installer', icon: Download, tab: 'installer' },
];

export default function BusinessLayout({ activeTab, onTabChange, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      if (!u) { navigate('/auth-login?next=/business/dashboard'); return; }
      if (!['client_admin', 'agency_admin', 'super_admin', 'admin'].includes(u.role)) {
        navigate('/business'); return;
      }
      setUser(u);
      // Fetch client info + subscription status
      try {
        const res = await base44.functions.invoke('getTeamData', {});
        if (res.data?.client) setClient(res.data.client);
        // Payment must be confirmed (active subscription) before installer access
        setHasActiveSubscription((res.data?.subscriptions || []).some(s => s.status === 'active'));
      } catch { /* non-fatal */ }
      setLoading(false);
    }).catch(() => navigate('/auth-login?next=/business/dashboard'));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => base44.auth.logout('/');

  return (
    <div className="min-h-screen bg-[#080c18] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-64'} transition-all duration-300 overflow-hidden bg-[#0d1120] border-r border-white/5 flex-shrink-0 flex flex-col`}>
        <div className="p-5 border-b border-white/5">
          <Link to="/business/dashboard" className="flex flex-col gap-1" onClick={() => setSidebarOpen(false)}>
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/9d3567c74_image.png"
              alt="VoxVPN Business Shield"
              className="w-full max-w-[160px] h-auto"
            />
            {client?.name && (
              <p className="text-slate-500 text-[10px] truncate">{client.name}</p>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.filter(item => {
            // Hide the Installer tab until payment is confirmed (admins always see it)
            if (item.tab === 'installer' && !hasActiveSubscription && user?.role !== 'admin' && user?.role !== 'super_admin') return false;
            return true;
          }).map(item => {
            const Icon = item.icon;
            const active = activeTab === item.tab;
            return (
              <button key={item.tab} onClick={() => { onTabChange?.(item.tab); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}>
                <Icon size={16} /> {item.label}
              </button>
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
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden md:flex items-center gap-2">
            <Building2 size={14} className="text-slate-500" />
            <p className="text-slate-500 text-xs">{client?.name || 'Business'} — Team Dashboard</p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <BusinessAlerts />
              <span className="text-slate-400 text-xs hidden sm:block">{user.full_name || user.email}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}