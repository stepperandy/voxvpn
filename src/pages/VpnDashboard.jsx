import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Loader2, Download, MapPin, User, Lock, Copy, Check } from 'lucide-react';

const API_BASE = 'https://package-manager-setup.replit.app';

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1 text-slate-500 hover:text-cyan-400 transition-colors">
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

export default function VpnDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vpnData, setVpnData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) navigate('/vpn-login');
  }, []);

  const handleConnect = async () => {
    const token = localStorage.getItem('auth_token');
    setError('');
    setLoading(true);
    setVpnData(null);
    const url = `${API_BASE}/api/vpn/provision`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const rawText = await res.text();
      let data;
      try { data = JSON.parse(rawText); } catch { data = null; }
      if (!res.ok) {
        setError(`URL: ${url}\nStatus: ${res.status}\nResponse: ${rawText}`);
        return;
      }
      if (!data || !data.ok) {
        setError(`URL: ${url}\nStatus: ${res.status}\nResponse: ${rawText}`);
        return;
      }
      setVpnData(data);
    } catch (err) {
      setError(`URL: ${url}\nError: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
          {/* Welcome */}
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-1">VoxVPN Dashboard</h1>
            <p className="text-slate-400 text-sm">Your secure VPN connection</p>
          </div>

          {/* Connect Card */}
          {!vpnData && (
            <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-500/20 flex items-center justify-center">
                <Shield size={38} className="text-cyan-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-1">Ready to connect</p>
                <p className="text-slate-500 text-sm">Click below to provision your VPN profile</p>
              </div>

              {error && (
                <div className="w-full px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-left whitespace-pre-wrap font-mono break-all">
                  {error}
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Connecting...</> : '⚡ Connect VPN'}
              </button>
            </div>
          )}

          {/* VPN Credentials Card */}
          {vpnData && (
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-semibold">VPN Provisioned Successfully</span>
              </div>

              {/* Location */}
              <div className="rounded-xl bg-[#0a1020] border border-white/5 p-4 space-y-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Server Location</p>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-white font-bold">
                    {vpnData.server?.city}, {vpnData.server?.country}
                  </span>
                </div>
              </div>

              {/* Credentials */}
              <div className="rounded-xl bg-[#0a1020] border border-white/5 p-4 space-y-3">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Your Credentials</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-500" />
                    <span className="text-slate-400 text-sm">Username</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white text-sm font-mono">{vpnData.credentials?.username}</span>
                    <CopyButton value={vpnData.credentials?.username} />
                  </div>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-slate-500" />
                    <span className="text-slate-400 text-sm">Password</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white text-sm font-mono">{vpnData.credentials?.password}</span>
                    <CopyButton value={vpnData.credentials?.password} />
                  </div>
                </div>
              </div>

              {/* Download */}
              <a
                href={vpnData.download?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                <Download size={16} />
                Download VoxVPN Profile
              </a>

              {vpnData.download?.fileName && (
                <p className="text-slate-600 text-xs text-center">{vpnData.download.fileName}</p>
              )}

              <button
                onClick={() => { setVpnData(null); setError(''); }}
                className="w-full py-2.5 border border-white/10 text-slate-400 hover:text-white text-sm rounded-xl transition-all"
              >
                Provision Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}