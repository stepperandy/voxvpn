import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Globe, Settings, Info, Shield, Power, ChevronDown,
  Loader2, LogOut, Star, Search, WifiOff
} from 'lucide-react';

const FLAG_MAP = {
  US: '🇺🇸', GB: '🇬🇧', UK: '🇬🇧', DE: '🇩🇪', NL: '🇳🇱', SG: '🇸🇬',
  JP: '🇯🇵', AU: '🇦🇺', CA: '🇨🇦', FR: '🇫🇷', ZA: '🇿🇦', BR: '🇧🇷',
  IN: '🇮🇳', SE: '🇸🇪', CH: '🇨🇭', IE: '🇮🇪', IT: '🇮🇹', ES: '🇪🇸',
};

function countryFlag(code) {
  return FLAG_MAP[code?.toUpperCase()] || '🌐';
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'locations', label: 'Locations', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'about', label: 'About', icon: Info },
];

export default function VoxVPNApp() {
  const [user, setUser] = useState(null);
  const [servers, setServers] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServer, setSelectedServer] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('windows');

  const platformFileLabel = {
    windows: 'VoxVPN-Setup.ps1',
    macos: 'VoxVPN-Setup.sh',
    linux: 'VoxVPN-Setup.sh',
    ios: 'VoxVPN.ovpn',
    android: 'VoxVPN.ovpn',
  };

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) setPlatform('ios');
    else if (/Android/.test(ua)) setPlatform('android');
    else if (/Mac/.test(ua)) setPlatform('macos');
    else if (/Linux/.test(ua)) setPlatform('linux');
    else setPlatform('windows');
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const res = await base44.functions.invoke('getVpnServersForUser', {});
        const data = res.data;
        setServers(data.servers || []);
        setSubscription(data.subscription || null);
        if (data.servers && data.servers.length > 0) {
          const best = [...data.servers].sort((a, b) => (a.current_load || 0) - (b.current_load || 0))[0];
          setSelectedServer(best);
        }
      } catch (err) {
        const msg = err.message || '';
        if (msg.includes('subscription') || msg.includes('404') || msg.includes('Unauthorized')) {
          setError('You need an active VoxVPN subscription to access the app.');
        } else {
          setError(msg || 'Failed to load. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return servers;
    const q = search.toLowerCase();
    return servers.filter(s =>
      (s.region || '').toLowerCase().includes(q) ||
      (s.city || '').toLowerCase().includes(q) ||
      (s.country || '').toLowerCase().includes(q)
    );
  }, [servers, search]);

  const handleConnect = async () => {
    if (!selectedServer) return;
    setConnecting(true);
    // Simulate connection attempt, then trigger download
    await new Promise(r => setTimeout(r, 1200));
    setConnecting(false);
    // Download config
    setDownloading(true);
    try {
      const res = await base44.functions.invoke('downloadVpnConfigForServer', {
        serverId: selectedServer.id,
        platform,
      });
      const blob = new Blob([res.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const label = (selectedServer.city || selectedServer.region || 'Server').replace(/\s+/g, '-');
      a.download = platformFileLabel[platform] || `VoxVPN-${label}.conf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setConnected(true);
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={28} className="text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading VoxVPN…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <WifiOff size={32} className="text-rose-400 mx-auto" />
          <h2 className="text-white font-bold text-xl">Cannot Connect</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={() => { window.location.href = '/'; setTimeout(() => { const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 300); }}
              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all"
            >
              View Plans & Subscribe
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex" onClick={() => setShowServerDropdown(false)}>

      {/* ── Sidebar ── */}
      <aside className="w-52 flex-shrink-0 bg-[#080c18] border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="px-5 pt-7 pb-6 flex flex-col items-center gap-2">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="h-14 w-auto"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activePage === id;
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#1a2a6c] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={17} className={active ? 'text-cyan-400' : ''} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Bottom promo card */}
        <div className="m-3 p-4 rounded-2xl border border-cyan-500/20 bg-[#0d1a2e]">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={15} className="text-cyan-400" />
            <span className="text-cyan-400 text-xs font-bold">Secure.</span>
          </div>
          <p className="text-cyan-300 text-xs font-bold leading-snug mb-3">Fast.<br />Global.</p>
          {/* Mini world map dots */}
          <div className="relative h-12 opacity-40">
            {[
              { top: '20%', left: '18%' }, { top: '35%', left: '45%' },
              { top: '55%', left: '70%' }, { top: '25%', left: '75%' },
              { top: '60%', left: '30%' },
            ].map((pos, i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full bg-cyan-400"
                style={{ top: pos.top, left: pos.left }} />
            ))}
          </div>
        </div>

        {/* User + logout */}
        <div className="px-4 pb-5 pt-2 border-t border-white/5">
          {user && <p className="text-slate-500 text-xs truncate mb-2">{user.full_name || user.email}</p>}
          <button
            onClick={() => base44.auth.logout('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-rose-400 text-xs transition-colors"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">

        {/* Background world map glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a40]/80 via-[#0a0f1e] to-[#0a0f1e]" />
          {/* Globe grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="400" cy="250" rx="300" ry="200" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
            <ellipse cx="400" cy="250" rx="200" ry="200" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
            <ellipse cx="400" cy="250" rx="100" ry="200" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
            <ellipse cx="400" cy="250" rx="300" ry="100" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
            <ellipse cx="400" cy="250" rx="300" ry="150" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
            <ellipse cx="400" cy="250" rx="300" ry="50" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
            <line x1="100" y1="250" x2="700" y2="250" stroke="#22d3ee" strokeWidth="0.5" />
            <line x1="400" y1="50" x2="400" y2="450" stroke="#22d3ee" strokeWidth="0.5" />
          </svg>
          {/* Glow center */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ${
            connected ? 'bg-emerald-500/15' : 'bg-blue-600/10'
          }`} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-8"
          >
            {/* Shield icon */}
            <div className="w-24 h-24 mb-4 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <path d="M50 5 L90 20 L90 50 C90 72 72 88 50 95 C28 88 10 72 10 50 L10 20 Z"
                  fill="url(#shieldGrad)" opacity="0.9" />
                <path d="M50 18 L78 30 L78 50 C78 65 66 77 50 83 C34 77 22 65 22 50 L22 30 Z"
                  fill="#0a0f1e" opacity="0.6" />
                <path d="M38 50 L46 58 L64 40" stroke="#22d3ee" strokeWidth="4" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white">
              Vox<span className="text-cyan-400">VPN</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Secure. Fast. Global.</p>
          </motion.div>

          {/* Server Selector */}
          <div className="w-full relative mb-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowServerDropdown(!showServerDropdown)}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border border-white/10 bg-[#0d1120]/80 backdrop-blur-sm text-white font-medium transition-all hover:border-cyan-500/30"
            >
              <span className="text-xl">{selectedServer ? countryFlag(selectedServer.country) : '🌐'}</span>
              <span className="flex-1 text-left text-sm">
                {selectedServer
                  ? `${selectedServer.city || selectedServer.region}, ${selectedServer.region}`
                  : 'Select a server'}
              </span>
              <ChevronDown size={18} className={`text-slate-400 transition-transform ${showServerDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {showServerDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-2 w-full bg-[#0d1120] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl"
                >
                  <div className="p-2 border-b border-white/5">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search servers…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white/5 rounded-lg text-white text-xs placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filtered.map(server => (
                      <button
                        key={server.id}
                        onClick={() => { setSelectedServer(server); setShowServerDropdown(false); setConnected(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                          selectedServer?.id === server.id ? 'bg-cyan-500/10' : ''
                        }`}
                      >
                        <span className="text-lg">{countryFlag(server.country)}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{server.city || server.region}</p>
                          <p className="text-slate-500 text-xs">{server.region}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${server.status === 'online' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          <span className="text-xs text-slate-500">{Math.round(server.current_load || 0)}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Connect Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConnect}
            disabled={connecting || downloading || !selectedServer}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-3 transition-all disabled:opacity-60 mb-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1a3a8f, #2563eb)' }}
          >
            {connecting || downloading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Shield size={20} />
            )}
            {connecting ? 'Connecting…' : downloading ? 'Downloading…' : 'Connect'}
          </motion.button>

          {/* Disconnect Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDisconnect}
            disabled={!connected}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-3 transition-all disabled:opacity-40 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7f1d1d, #dc2626)' }}
          >
            <Power size={20} />
            Disconnect
          </motion.button>

          {/* Status */}
          <div className="mt-5 flex items-center gap-2">
            <motion.div
              animate={{ scale: connected ? [1, 1.3, 1] : 1 }}
              transition={{ repeat: connected ? Infinity : 0, duration: 2 }}
              className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-500'}`}
            />
            <span className={`text-sm font-semibold ${connected ? 'text-emerald-400' : 'text-slate-400'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Platform note */}
          {connected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-slate-500 text-xs text-center"
            >
              Config downloaded — open {platform === 'windows' ? 'OpenVPN GUI' : platform === 'ios' || platform === 'android' ? 'OpenVPN Connect' : 'your VPN client'} to complete connection
            </motion.p>
          )}
        </div>
      </main>
    </div>
  );
}