import { LayoutDashboard, Users, Server, LogOut, Menu, X, Shield, ChevronRight, Home, Download, Link, Radio, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', desc: 'Overview & metrics' },
  { icon: Users, label: 'Users', id: 'users', desc: 'Manage accounts' },
  { icon: Server, label: 'Servers', id: 'servers', desc: 'Live infrastructure' },
  { icon: Radio, label: 'VPN Servers', id: 'vpn-servers', desc: 'VPN nodes & Vultr' },
  { icon: Link, label: 'Setups', id: 'setups', desc: 'Setup portals' },
  { icon: Download, label: 'Downloads', id: 'downloads', desc: 'Setup files & payments' },
  { icon: TrendingUp, label: 'Analytics', id: 'analytics', desc: 'Real-time traffic & trends' },
];

export default function AdminSidebar({ activePage, onNavigate, onLogout }) {
  const [open, setOpen] = useState(false);

  const handleNav = (id) => { onNavigate(id); setOpen(false); };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0d1120] border border-white/10 text-white"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#060910] border-r border-white/5 transition-transform duration-300 z-40 flex flex-col ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="h-12 w-auto"
          />
        </div>

        {/* Section label */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest">Navigation</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${
                  isActive
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-white'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/4 border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActive ? 'bg-cyan-500/20' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</p>
                  <p className="text-slate-600 text-[10px] truncate">{item.desc}</p>
                </div>
                {isActive && <ChevronRight size={14} className="text-cyan-500 flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all text-sm font-medium group border border-transparent hover:border-cyan-500/10"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-cyan-500/10 flex items-center justify-center transition-colors">
              <Home size={16} />
            </div>
            Back to Homepage
          </a>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all text-sm font-medium group border border-transparent hover:border-rose-500/10"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-rose-500/10 flex items-center justify-center transition-colors">
              <LogOut size={16} />
            </div>
            Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}