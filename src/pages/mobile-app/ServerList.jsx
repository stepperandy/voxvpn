import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Shield, Settings, CreditCard, LogOut, ChevronRight, Wifi, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ServerList() {
  const navigate = useNavigate();
  const email = localStorage.getItem('vpn_email') || '';
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServers = async () => {
      try {
        const res = await base44.functions.invoke('getServers', {});
        setServers(res.data?.servers || []);
      } catch (err) {
        console.error('Failed to load servers:', err);
        setServers([]);
      } finally {
        setLoading(false);
      }
    };
    loadServers();
  }, []);

  const handleSelect = (server) => {
    navigate(`/app/connect/${server.id}`);
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
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Select Location</p>
          {!loading && <p className="text-slate-600 text-xs">{servers.length} servers</p>}
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-cyan-400 animate-spin" />
            </div>
          ) : (
            servers.map((server) => (
              <button
                key={server.id}
                onClick={() => handleSelect(server)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/30 hover:bg-[#0d1a20] transition-all active:scale-[0.98] text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{server.name}</p>
                  <p className="text-slate-500 text-xs font-mono">{server.city}, {server.country}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${server.status === 'online' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span className="text-xs text-slate-600">{server.load || 0}% load</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
              </button>
            ))
          )}
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