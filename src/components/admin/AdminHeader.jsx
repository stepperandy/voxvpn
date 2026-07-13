import { Bell, Settings, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const pageMeta = {
  dashboard: { title: 'Dashboard', sub: 'Overview of your VPN infrastructure', breadcrumb: 'Home / Dashboard' },
  users: { title: 'User Management', sub: 'View, invite and manage registered users', breadcrumb: 'Home / Users' },
  servers: { title: 'Server Infrastructure', sub: 'Live Vultr server status & configuration', breadcrumb: 'Home / Servers' },
  setups: { title: 'Setup Portals', sub: 'Manage customer setup portal entries', breadcrumb: 'Home / Setups' },
  downloads: { title: 'Downloads & Payments', sub: 'Manage VPN setup files with pricing', breadcrumb: 'Home / Downloads' },
  'marketing-performance': { title: 'Marketing Performance', sub: 'Track SEO and PPC campaign results by plan', breadcrumb: 'Home / Marketing / Performance' },
  'search-console': { title: 'Google Search Console', sub: 'Search performance, queries, and indexing status', breadcrumb: 'Home / Search Console' },
};

export default function AdminHeader({ activePage }) {
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const page = pageMeta[activePage] || pageMeta.dashboard;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-[#060910]/98 backdrop-blur border-b border-white/5 flex items-center justify-between px-6 z-20">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-slate-600 text-xs">{page.breadcrumb}</span>
        </div>
        <h1 className="text-white font-bold text-base leading-tight">{page.title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Live clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/3 rounded-lg border border-white/5 mr-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-400 text-xs font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        </button>

        <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
          <Settings size={17} />
        </button>

        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-xs font-semibold leading-tight">{user?.full_name || 'Admin'}</p>
            <p className="text-cyan-400/70 text-[10px]">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}