import { useState, useEffect } from 'react';
import {
  Shield, LogOut, Loader2, AlertTriangle,
  RefreshCw, Download
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ServerSelector from '@/components/vpn/ServerSelector';

// Fallback static servers if backend is unreachable (matches lib/vpnServers.js)
const FALLBACK_SERVERS = [
  { id: 'chicago',      city: 'Chicago',      country: 'United States',  flag: '🇺🇸' },
  { id: 'london',       city: 'London',       country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'amsterdam',    city: 'Amsterdam',    country: 'Netherlands',    flag: '🇳🇱' },
  { id: 'singapore',    city: 'Singapore',    country: 'Singapore',      flag: '🇸🇬' },
  { id: 'losangeles',   city: 'Los Angeles',  country: 'United States',  flag: '🇺🇸' },
  { id: 'newjersey',    city: 'New Jersey',   country: 'United States',  flag: '🇺🇸' },
  { id: 'frankfurt',    city: 'Frankfurt',    country: 'Germany',        flag: '🇩🇪' },
  { id: 'sydney',       city: 'Sydney',       country: 'Australia',      flag: '🇦🇺' },
  { id: 'siliconvalley',city: 'Silicon Valley',country: 'United States', flag: '🇺🇸' },
  { id: 'johannesburg', city: 'Johannesburg', country: 'South Africa',   flag: '🇿🇦' },
];

function normalizeServers(raw) {
  if (!raw || !Array.isArray(raw)) return FALLBACK_SERVERS;
  return raw.map((s, i) => ({
    id: s.id || s.server_id || `srv-${i}`,
    city: s.city || s.name || s.location || `Server ${i + 1}`,
    country: s.country || s.region || '',
    flag: s.flag || (s.source === 'own' ? '⭐' : '🌐'),
    tier: s.tier || 'standard',
    source: s.source || 'provider',
    provider_name: s.provider_name || 'VoxVPN',
    load: s.load || 0,
  }));
}

export default function VpnDashboard() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [servers, setServers] = useState(FALLBACK_SERVERS);
  const [selectedServer, setSelectedServer] = useState(FALLBACK_SERVERS[0]);
  const [status, setStatus] = useState('idle');
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoadingInit(true);
    setError('');
    try {
      const me = await base44.auth.me();
      if (!me) {
        base44.auth.redirectToLogin('/vpn-dashboard');
        return;
      }
      setUser(me);

      // Parallel: subscription + hybrid server list
      const [subs, hybridServers] = await Promise.allSettled([
        base44.entities.VPNSubscription.filter({ user_email: me.email }),
        base44.functions.invoke('getServersHybrid', {}),
      ]);

      if (me.role === 'admin') {
        setSubscription({ plan: 'Admin', renewal_date: null });
      } else if (subs.status === 'fulfilled') {
        const active = subs.value.find(s => s.status === 'active') || null;
        setSubscription(active);
      }

      if (hybridServers.status === 'fulfilled' && hybridServers.value?.data?.servers?.length > 0) {
        const normalized = normalizeServers(hybridServers.value.data.servers);
        setServers(normalized);
        setSelectedServer(normalized[0]);
      }
    } catch {
      setError('Could not load dashboard.');
    } finally {
      setLoadingInit(false);
    }
  };

  const handleConnect = () => {
    // Redirect to the setup portal to download VoxVPN configs.
    window.location.href = '/setup';
  };

  if (loadingInit) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Shield size={22} className="text-cyan-400" />
          </div>
          <Loader2 size={20} className="text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  const hasSubscription = !!subscription;

  return (
    <div className="min-h-screen bg-[#080c18] flex flex-col">

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Flying + blinking tech objects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating particles */}
        {[
          { x: '8%',  y: '15%', size: 4,  color: '#00d4ff', delay: 0,    dur: 7  },
          { x: '18%', y: '55%', size: 3,  color: '#7c3aed', delay: 1.2,  dur: 9  },
          { x: '12%', y: '80%', size: 5,  color: '#00d4ff', delay: 0.5,  dur: 8  },
          { x: '25%', y: '30%', size: 2,  color: '#a855f7', delay: 2,    dur: 6  },
          { x: '35%', y: '70%', size: 4,  color: '#06b6d4', delay: 0.8,  dur: 10 },
          { x: '72%', y: '20%', size: 3,  color: '#00d4ff', delay: 1.5,  dur: 7  },
          { x: '80%', y: '60%', size: 5,  color: '#7c3aed', delay: 0.3,  dur: 9  },
          { x: '90%', y: '35%', size: 2,  color: '#a855f7', delay: 2.5,  dur: 6  },
          { x: '88%', y: '78%', size: 4,  color: '#06b6d4', delay: 1,    dur: 8  },
          { x: '60%', y: '85%', size: 3,  color: '#00d4ff', delay: 1.8,  dur: 11 },
          { x: '45%', y: '10%', size: 2,  color: '#7c3aed', delay: 0.6,  dur: 7  },
          { x: '55%', y: '75%', size: 4,  color: '#a855f7', delay: 3,    dur: 9  },
          { x: '5%',  y: '45%', size: 3,  color: '#06b6d4', delay: 2.2,  dur: 8  },
          { x: '95%', y: '50%', size: 5,  color: '#00d4ff', delay: 0.4,  dur: 10 },
        ].map((p, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute rounded-full"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}` }}
            animate={{ y: [0, -30, 10, -20, 0], x: [0, 15, -10, 20, 0], opacity: [0.4, 1, 0.2, 0.9, 0.4], scale: [1, 1.5, 0.8, 1.3, 1] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Flying emoji icons */}
        {[
          { x: '7%',  y: '20%', delay: 0,   dur: 8,  label: '🔒' },
          { x: '85%', y: '25%', delay: 1.5, dur: 10, label: '⚡' },
          { x: '6%',  y: '65%', delay: 0.8, dur: 7,  label: '🌍' },
          { x: '88%', y: '70%', delay: 2,   dur: 9,  label: '🛡️' },
          { x: '50%', y: '90%', delay: 1,   dur: 11, label: '🔑' },
          { x: '30%', y: '8%',  delay: 2.5, dur: 8,  label: '✨' },
          { x: '70%', y: '5%',  delay: 0.3, dur: 6,  label: '🌐' },
          { x: '15%', y: '90%', delay: 1.7, dur: 9,  label: '📡' },
          { x: '92%', y: '12%', delay: 0.9, dur: 7,  label: '💻' },
        ].map((f, i) => (
          <motion.div
            key={`f-${i}`}
            className="absolute select-none text-lg"
            style={{ left: f.x, top: f.y }}
            animate={{ y: [0, -25, 8, -18, 0], x: [0, 10, -8, 12, 0], rotate: [0, 10, -8, 5, 0], opacity: [0.4, 0.9, 0.2, 0.8, 0.4] }}
            transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {f.label}
          </motion.div>
        ))}

        {/* Blinking ring pulses */}
        {[
          { x: '15%', y: '40%', color: '#00d4ff', delay: 0,   size: 40 },
          { x: '80%', y: '45%', color: '#7c3aed', delay: 1.2, size: 30 },
          { x: '50%', y: '88%', color: '#06b6d4', delay: 0.6, size: 35 },
          { x: '30%', y: '60%', color: '#a855f7', delay: 2,   size: 25 },
          { x: '70%', y: '30%', color: '#00d4ff', delay: 1.5, size: 45 },
          { x: '20%', y: '15%', color: '#7c3aed', delay: 0.9, size: 28 },
          { x: '85%', y: '80%', color: '#06b6d4', delay: 2.3, size: 32 },
        ].map((ring, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border"
            style={{ left: ring.x, top: ring.y, width: ring.size, height: ring.size, marginLeft: -ring.size / 2, marginTop: -ring.size / 2, borderColor: ring.color }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 3, delay: ring.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        {/* Flying lines / streaks */}
        {[
          { x: '10%', y: '30%', delay: 0,   dur: 4  },
          { x: '75%', y: '55%', delay: 1.5, dur: 5  },
          { x: '40%', y: '75%', delay: 0.7, dur: 3.5},
          { x: '60%', y: '20%', delay: 2.1, dur: 4.5},
        ].map((s, i) => (
          <motion.div
            key={`streak-${i}`}
            className="absolute rounded-full"
            style={{ left: s.x, top: s.y, width: 60, height: 1.5, background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.6), transparent)' }}
            animate={{ x: [-60, 120], opacity: [0, 1, 0] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="h-12 w-auto"
          />
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-slate-500 text-xs hidden sm:block truncate max-w-[160px]">{user.email}</span>
          )}
          <button
            onClick={() => base44.auth.logout('/')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-4">

          {/* Logo / status ring */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center bg-white/3 border-2 border-white/10">
              <Shield size={48} className="text-slate-600" />
            </div>
            <div className="mt-3 text-center">
              <p className="text-slate-500 text-sm">Connect using the VoxVPN app</p>
            </div>
          </div>

          {/* Subscription warning */}
          {!hasSubscription && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-bold text-sm">Subscription Required</p>
                <p className="text-amber-200/50 text-xs mt-0.5 mb-2">You need an active plan to connect.</p>
                <a href="https://voxvpn.net/#pricing" className="text-cyan-400 text-xs font-bold hover:text-cyan-300 transition-colors">
                  View Plans →
                </a>
              </div>
            </div>
          )}

          {/* Active plan badge */}
          {hasSubscription && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-emerald-400 text-xs font-semibold">{subscription.plan} Plan — Active</span>
              {subscription.renewal_date && (
                <span className="text-emerald-300/40 text-xs ml-auto">
                  Renews {new Date(subscription.renewal_date).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Server selector */}
          <ServerSelector
            servers={servers}
            selectedServer={selectedServer}
            onSelect={(server) => {
              setSelectedServer(server);
              setStatus('idle');
            }}
          />

          {/* How to connect */}
          <div className="rounded-xl border border-white/5 bg-[#0d1120] p-4 space-y-2">
            <p className="text-white text-xs font-bold mb-2">How to Connect</p>
            <ol className="text-slate-400 text-xs space-y-2 list-decimal list-inside">
              <li>Go to the Setup Portal below.</li>
              <li>Download the <span className="text-white font-semibold">VoxVPN</span> config for your device.</li>
              <li>Open the <span className="text-white font-semibold">VoxVPN</span> app and import your config.</li>
              <li>Select a server and tap <span className="text-cyan-400 font-semibold">Connect</span>.</li>
            </ol>
          </div>

          {/* CTA */}
          <button
            onClick={handleConnect}
            disabled={!hasSubscription}
            className="w-full py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2
              bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Download size={18} /> Go to Setup Portal
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm">
              <AlertTriangle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Refresh servers */}
          <div className="flex justify-center pt-1">
            <button
              onClick={init}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-3 text-center">
        <p className="text-slate-700 text-xs">VoxVPN — Military-grade privacy</p>
      </footer>
    </div>
  );
}