import { useState, useEffect, useRef } from 'react';
import {
  Shield, LogOut, WifiOff, Loader2, AlertTriangle,
  ChevronDown, RefreshCw, CheckCircle2, Lock, Globe, ExternalLink
} from 'lucide-react';
import { api } from './api';
import { useAuth } from './AuthContext';

const FALLBACK_SERVERS = [
  { id: 'amsterdam',    city: 'Amsterdam',    country: 'Netherlands',    flag: '🇳🇱' },
  { id: 'atlanta',      city: 'Atlanta',      country: 'United States',  flag: '🇺🇸' },
  { id: 'chicago',      city: 'Chicago',      country: 'United States',  flag: '🇺🇸' },
  { id: 'frankfurt',    city: 'Frankfurt',    country: 'Germany',        flag: '🇩🇪' },
  { id: 'johannesburg', city: 'Johannesburg', country: 'South Africa',   flag: '🇿🇦' },
  { id: 'london',       city: 'London',       country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'losangeles',   city: 'Los Angeles',  country: 'United States',  flag: '🇺🇸' },
  { id: 'madrid',       city: 'Madrid',       country: 'Spain',          flag: '🇪🇸' },
  { id: 'manchester',   city: 'Manchester',   country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'melbourne',    city: 'Melbourne',    country: 'Australia',      flag: '🇦🇺' },
  { id: 'miami',        city: 'Miami',        country: 'United States',  flag: '🇺🇸' },
  { id: 'milan',        city: 'Milan',        country: 'Italy',          flag: '🇮🇹' },
  { id: 'newjersey',    city: 'New Jersey',   country: 'United States',  flag: '🇺🇸' },
  { id: 'paris',        city: 'Paris',        country: 'France',         flag: '🇫🇷' },
  { id: 'seattle',      city: 'Seattle',      country: 'United States',  flag: '🇺🇸' },
  { id: 'siliconvalley',city: 'Silicon Valley',country: 'United States', flag: '🇺🇸' },
  { id: 'singapore',    city: 'Singapore',    country: 'Singapore',      flag: '🇸🇬' },
  { id: 'sydney',       city: 'Sydney',       country: 'Australia',      flag: '🇦🇺' },
  { id: 'tokyo',        city: 'Tokyo',        country: 'Japan',          flag: '🇯🇵' },
  { id: 'toronto',      city: 'Toronto',      country: 'Canada',         flag: '🇨🇦' },
];

function normalizeServers(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return FALLBACK_SERVERS;
  return raw.map((s, i) => ({
    id:      s.id || s.server_id || `srv-${i}`,
    city:    s.city || s.name || s.location || `Server ${i + 1}`,
    country: s.country || s.region || '',
    flag:    s.flag || '🌐',
  }));
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [servers, setServers]           = useState(FALLBACK_SERVERS);
  const [selected, setSelected]         = useState(FALLBACK_SERVERS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [status, setStatus]             = useState('idle'); // idle | connecting | connected | disconnecting
  const [hasAccess, setHasAccess]       = useState(user?.hasAccess === true);
  const [plan, setPlan]                 = useState(user?.plan || null);
  const [error, setError]               = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadAll();
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const loadAll = async () => {
    try {
      // Check live access status from backend (source of truth)
      const [accessRes, serversRes] = await Promise.allSettled([
        api.checkAccess(user.token, user.email),
        api.servers(user.token),
      ]);

      if (accessRes.status === 'fulfilled') {
        setHasAccess(accessRes.value.access === true);
        setPlan(accessRes.value.plan || null);
      }

      if (serversRes.status === 'fulfilled') {
        const list = normalizeServers(serversRes.value?.servers || serversRes.value);
        setServers(list);
        setSelected(list[0]);
      }
    } catch {
      // Keep cached values if network fails
    }
  };

  const handleConnect = async () => {
    if (!hasAccess) return;
    setStatus('connecting');
    setError('');
    try {
      await api.connect(user.token, user.email, selected.id);
      setStatus('connected');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  const handleDisconnect = async () => {
    setStatus('disconnecting');
    setError('');
    try {
      await api.disconnect(user.token, user.email);
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  const isConnected     = status === 'connected';
  const isConnecting    = status === 'connecting';
  const isDisconnecting = status === 'disconnecting';

  return (
    <div className="min-h-screen bg-[#080c18] flex flex-col" style={gridBg}>

      {/* Header */}
      <header className="border-b border-white/5 px-6 py-3.5 flex items-center justify-between">
        <img
          src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
          alt="VoxVPN"
          className="h-10 w-auto"
        />
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-xs truncate max-w-[180px] hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-4">

          {/* Shield status ring */}
          <div className="flex flex-col items-center mb-2">
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500
              ${isConnected
                ? 'bg-cyan-500/10 shadow-[0_0_48px_rgba(6,182,212,0.3)] border-2 border-cyan-500/50'
                : 'bg-white/3 border-2 border-white/8'}`}>
              {(isConnecting || isDisconnecting) && (
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
              )}
              <Shield size={48} className={`transition-colors duration-300 ${isConnected ? 'text-cyan-400' : 'text-slate-600'}`} />
            </div>

            <div className="mt-3 text-center h-6">
              {isConnecting    && <p className="text-cyan-400 text-sm font-semibold animate-pulse">Connecting…</p>}
              {isDisconnecting && <p className="text-amber-400 text-sm font-semibold animate-pulse">Disconnecting…</p>}
              {isConnected     && (
                <span className="flex items-center gap-1.5 justify-center text-emerald-400 text-sm font-bold">
                  <CheckCircle2 size={14} /> Protected
                </span>
              )}
              {status === 'idle' && <p className="text-slate-500 text-sm">Not Connected</p>}
            </div>
          </div>

          {/* Subscription warning — backend controls this */}
          {!hasAccess && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-bold text-sm">Subscription Required</p>
                <p className="text-amber-200/50 text-xs mt-0.5 mb-2">You need an active plan to connect.</p>
                <a
                  href="https://voxvpn.net/#pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 text-xs font-bold hover:text-cyan-300 transition-colors"
                >
                  View Plans <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}

          {/* Active plan badge */}
          {hasAccess && plan && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-emerald-400 text-xs font-semibold">{plan} Plan — Active</span>
            </div>
          )}

          {/* Server dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(v => !v)}
              disabled={!hasAccess}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-[#0d1120] hover:border-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="text-xl leading-none">{selected.flag}</span>
              <div className="flex-1 text-left">
                <p className="text-white font-bold text-sm">{selected.city}</p>
                <p className="text-slate-500 text-xs flex items-center gap-1">
                  <Globe size={9} /> {selected.country}
                </p>
              </div>
              <ChevronDown size={16} className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#0d1120] border border-white/8 rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
                {servers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelected(s); setDropdownOpen(false); if (isConnected) setStatus('idle'); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-cyan-500/5 transition-colors text-left
                      ${selected.id === s.id ? 'bg-cyan-500/10' : ''}`}
                  >
                    <span className="text-lg leading-none">{s.flag}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${selected.id === s.id ? 'text-cyan-400' : 'text-white'}`}>{s.city}</p>
                      <p className="text-slate-500 text-xs">{s.country}</p>
                    </div>
                    {selected.id === s.id && <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Connect / Disconnect — blocked if no access */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={!hasAccess || isConnecting}
              className="w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2
                bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isConnecting
                ? <><Loader2 size={18} className="animate-spin" /> Connecting…</>
                : <><Lock size={18} /> Connect</>}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2
                bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDisconnecting
                ? <><Loader2 size={18} className="animate-spin" /> Disconnecting…</>
                : <><WifiOff size={18} /> Disconnect</>}
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm">
              <AlertTriangle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          {/* Connected info tiles */}
          {isConnected && (
            <div className="grid grid-cols-2 gap-3">
              <div className="px-4 py-3 rounded-xl border border-white/5 bg-[#0d1120] text-center">
                <p className="text-slate-500 text-xs mb-1">Server</p>
                <p className="text-white font-bold text-sm">{selected.city}</p>
              </div>
              <div className="px-4 py-3 rounded-xl border border-white/5 bg-[#0d1120] text-center">
                <p className="text-slate-500 text-xs mb-1">Protocol</p>
                <p className="text-white font-bold text-sm">WireGuard</p>
              </div>
            </div>
          )}

          {/* Refresh */}
          <div className="flex justify-center">
            <button
              onClick={loadAll}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

        </div>
      </main>

      <footer className="border-t border-white/5 py-3 text-center">
        <p className="text-slate-700 text-xs">VoxVPN · Military-grade privacy</p>
      </footer>
    </div>
  );
}

const gridBg = {
  backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.03) 1px,transparent 1px)',
  backgroundSize: '40px 40px',
};