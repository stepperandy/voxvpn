import { useNavigate } from 'react-router-dom';
import { Shield, Settings, CreditCard, LogOut, ChevronRight, Wifi } from 'lucide-react';

const API_BASE = 'https://voxvpn-backend.onrender.com';

const SERVERS = [
  { id: 1, city: 'Amsterdam',  country: 'Netherlands', flag: '🇳🇱', ping: '12ms',  load: 32 },
  { id: 2, city: 'London',     country: 'UK',          flag: '🇬🇧', ping: '18ms',  load: 45 },
  { id: 3, city: 'USA',        country: 'United States', flag: '🇺🇸', ping: '89ms',  load: 67 },
  { id: 4, city: 'Singapore',  country: 'Singapore',   flag: '🇸🇬', ping: '134ms', load: 28 },
];

function LoadBar({ load }) {
  const color = load < 50 ? 'bg-emerald-400' : load < 75 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${load}%` }} />
    </div>
  );
}

export default function ServerList() {
  const navigate = useNavigate();
  const email = localStorage.getItem('vpn_email') || '';

  const handleSelect = (server) => {
    navigate(`/app/connect/${server.id}`, { state: { server } });
  };

  const handleLogout = () => {
    localStorage.removeItem('vpn_token');
    localStorage.removeItem('vpn_email');
    navigate('/app/login');
  };

  return (
    <div className="min-h-screen bg-[#060d1a] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-white font-black text-lg">VoxVPN</span>
          </div>
          {email && <p className="text-slate-600 text-xs mt-1 ml-9">{email}</p>}
        </div>
        <button onClick={handleLogout} className="p-2 rounded-xl text-slate-500 hover:text-white transition-colors">
          <LogOut size={18} />
        </button>
      </div>

      {/* Status Banner */}
      <div className="mx-5 mb-6 p-4 rounded-2xl bg-[#0d1a20] border border-cyan-500/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
          <Wifi size={18} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Not Connected</p>
          <p className="text-slate-500 text-xs">Select a server below to get started</p>
        </div>
        <div className="ml-auto w-2.5 h-2.5 rounded-full bg-slate-600" />
      </div>

      {/* Server list */}
      <div className="px-5 flex-1">
        <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">Select Location</p>
        <div className="space-y-2">
          {SERVERS.map((server) => (
            <button
              key={server.id}
              onClick={() => handleSelect(server)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/30 hover:bg-[#0d1a20] transition-all active:scale-[0.98] text-left"
            >
              <span className="text-3xl">{server.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{server.city}</p>
                <p className="text-slate-500 text-xs">{server.country}</p>
                <LoadBar load={server.load} />
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-slate-400 text-xs font-mono">{server.ping}</p>
                <p className="text-slate-600 text-xs">{server.load}% load</p>
              </div>
              <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mx-5 mb-8 mt-6 flex items-center justify-around p-3 rounded-2xl border border-white/5 bg-[#0d1120]">
        <button className="flex flex-col items-center gap-1 text-cyan-400">
          <Shield size={20} />
          <span className="text-xs font-semibold">Servers</span>
        </button>
        <button onClick={() => navigate('/app/subscription')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <CreditCard size={20} />
          <span className="text-xs font-semibold">Plans</span>
        </button>
        <button onClick={() => navigate('/app/settings')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <Settings size={20} />
          <span className="text-xs font-semibold">Settings</span>
        </button>
      </div>
    </div>
  );
}