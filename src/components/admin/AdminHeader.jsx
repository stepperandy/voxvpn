import { Bell, Search, User } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-64 lg:left-64 h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-20">
      {/* Search */}
      <div className={`relative flex-1 max-w-md ${searchOpen ? 'block' : 'hidden md:block'}`}>
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <Search size={20} />
        </button>
        <button className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500" />
        </button>
        <button className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}