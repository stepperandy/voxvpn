import { Bell, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const pageTitles = {
  dashboard: { title: 'Dashboard', sub: 'Overview of your VPN infrastructure' },
  users: { title: 'Users', sub: 'Manage registered users' },
  servers: { title: 'Servers', sub: 'Live Vultr server status' },
};

export default function AdminHeader({ activePage }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const page = pageTitles[activePage] || pageTitles.dashboard;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-[#080c18]/95 backdrop-blur border-b border-white/5 flex items-center justify-between px-6 z-20">
      <div>
        <h1 className="text-white font-bold text-lg leading-tight">{page.title}</h1>
        <p className="text-slate-500 text-xs">{page.sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <span className="text-white text-sm font-medium hidden sm:block">{user?.full_name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}