import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Download, MapPin } from 'lucide-react';

const API_BASE = 'https://voxvpn-backend.onrender.com';

const SERVERS = [
  { id: 1, city: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱' },
  { id: 2, city: 'London',    country: 'United Kingdom', flag: '🇬🇧' },
  { id: 3, city: 'USA',       country: 'United States',  flag: '🇺🇸' },
  { id: 4, city: 'Singapore', country: 'Singapore',      flag: '🇸🇬' },
];

export default function VpnDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) navigate('/vpn-login');
  }, []);

  const handleConnect = (server) => {
    const url = `${API_BASE}/download-config/${server.id}`;
    window.open(url, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/vpn-login';
  };

  return (
    <div className="min-h-screen bg-[#080c18] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Shield size={18} className="text-cyan-400" />
          </div>
          <span className="text-white font-black text-lg">VoxVPN</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors"
        >
          <LogOut size={15} />
          Log Out
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-1">Select a Server</h1>
            <p className="text-slate-400 text-sm">Choose a location to download your VPN config</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {SERVERS.map((server) => (
              <button
                key={server.id}
                onClick={() => handleConnect(server)}
                className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/30 hover:bg-[#0d1a20] transition-all group"
              >
                <span className="text-3xl">{server.flag}</span>
                <div className="text-left flex-1">
                  <p className="text-white font-bold">{server.city}</p>
                  <p className="text-slate-500 text-xs flex items-center gap-1">
                    <MapPin size={10} /> {server.country}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300 transition-colors text-sm font-semibold">
                  <Download size={15} />
                  Download
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}