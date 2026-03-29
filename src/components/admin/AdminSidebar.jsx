import { LayoutDashboard, Users, Server, LogOut, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Users', id: 'users' },
  { icon: Server, label: 'Servers', id: 'servers' },
];

export default function AdminSidebar({ activePage, onNavigate, onLogout }) {
  const [open, setOpen] = useState(false);

  const handleNav = (id) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0d1120] border border-white/10 text-white"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#080c18] border-r border-white/5 transition-transform duration-300 z-40 flex flex-col ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/60e9935e0_b1efe46e-2927-4692-89eb-53a6f756c8a6.png" alt="VoxVPN" className="h-8 w-auto" />
            <div>
              <div className="text-white font-bold text-sm">VoxVPN</div>
              <div className="text-cyan-400 text-xs">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}