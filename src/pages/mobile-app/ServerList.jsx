import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, LogOut, Download, Server, CreditCard,
  Check, ExternalLink, Info, Loader2, ChevronRight,
} from 'lucide-react';
import { SERVER_CONFIG_MAP } from '@/lib/vpnNativePlugin';
import { base44 } from '@/api/base44Client';

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: Shield },
  { id: 'subscription', label: 'Plans', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: LogOut },
];

export default function ServerList() {
  const navigate = useNavigate();
  const email = localStorage.getItem('vpn_email') || '';
  const [activeNav, setActiveNav] = useState('home');
  const [downloadingConfig, setDownloadingConfig] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('subscription');
    if (raw) {
      try { setSubscription(JSON.parse(raw)); } catch {}
    }
    setLoadingSub(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vpn_token');
    localStorage.removeItem('vpn_email');
    localStorage.removeItem('subscription');
    navigate('/app/login');
  };

  const handleNav = (id) => {
    setActiveNav(id);
    if (id === 'settings') handleLogout();
    if (id === 'subscription') navigate('/app/subscription');
  };

  const handleDownloadConfig = async (server) => {
    setDownloadingConfig(server.name);
    try {
      const response = await base44.functions.invoke('downloadVpnConfig', {
        email,
        config_name: server.config,
        server_name: server.name,
      });
      const data = response?.data || response;
      const configUrl = data?.file_url || data?.url;
      if (configUrl) {
        window.open(configUrl, '_blank');
      } else if (data?.config_content) {
        // Fallback: create a blob from raw config content
        const blob = new Blob([data.config_content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${server.config}.ovpn`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Could not download config. Please try again or contact support.');
    } finally {
      setDownloadingConfig(null);
    }
  };

  const handleOpenExternalClient = () => {
    window.open('https://apps.apple.com/us/app/openvpn-connect/id590379981', '_blank');
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden select-none" style={S.bg}>
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={S.grid} />

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[380px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,180,255,0.09) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2 z-20 relative">
        <div className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="h-9 w-auto"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.55))' }}
          />
          <div>
            <p className="text-white font-black text-sm leading-none">VoxVPN</p>
            <p className="text-slate-600 text-[10px] mt-0.5 max-w-[155px] truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-300 text-[11px] font-semibold transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <LogOut size={12} /> Log Out
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto pb-24 z-10 relative">

        {/* Info banner — external client required */}
        <div className="mx-5 mb-4 p-4 rounded-2xl" style={S.infoBanner}>
          <div className="flex items-start gap-3">
            <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white text-sm font-bold leading-snug">Companion App</p>
              <p className="text-slate-400 text-[12px] mt-1 leading-relaxed">
                This app manages your account and server configs. To connect, use a
                compatible external client like{' '}
                <button onClick={handleOpenExternalClient} className="text-cyan-400 font-semibold underline">
                  OpenVPN Connect
                </button>{' '}or WireGuard.
              </p>
            </div>
          </div>
        </div>

        {/* Account/Subscription card */}
        <div className="px-5 mb-4">
          <div className="p-4 rounded-2xl" style={S.card}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(0,212,255,0.3)' }}>
                <Shield size={20} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Subscription</p>
                {loadingSub ? (
                  <p className="text-slate-500 text-xs">Loading…</p>
                ) : subscription ? (
                  <>
                    <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                      {subscription.plan} · {subscription.status}
                    </p>
                    {subscription.renewal_date && (
                      <p className="text-slate-600 text-[10px] mt-0.5">
                        Renews: {new Date(subscription.renewal_date).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-slate-500 text-xs">No active plan</p>
                )}
              </div>
              <button
                onClick={() => navigate('/app/subscription')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                Plans <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Server list — config downloads */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2 mb-3 ml-1">
            <Server size={14} className="text-slate-600" />
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
              Server Configurations
            </p>
          </div>
          <p className="text-slate-600 text-[11px] mb-3 ml-1 leading-relaxed">
            Download a configuration file, then import it into OpenVPN Connect or WireGuard
            on your device to connect.
          </p>

          <div className="rounded-2xl overflow-hidden" style={S.card}>
            {SERVER_CONFIG_MAP.map((s, idx) => (
              <div
                key={s.name}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: idx < SERVER_CONFIG_MAP.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <span className="text-xl w-7 leading-none flex-shrink-0">{s.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-none">{s.name}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{s.country}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 5px #10b981' }} />
                  <span className="text-slate-600 text-[10px]">Online</span>
                </div>
                <button
                  onClick={() => handleDownloadConfig(s)}
                  disabled={downloadingConfig === s.name}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    background: downloadingConfig === s.name ? 'rgba(0,212,255,0.05)' : 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    color: '#00d4ff',
                  }}
                >
                  {downloadingConfig === s.name ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {downloadingConfig === s.name ? '…' : 'Config'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* External client links */}
        <div className="px-5 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-2 ml-1">
            Get a VPN Client
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => window.open('https://apps.apple.com/us/app/openvpn-connect/id590379981', '_blank')}
              className="flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.98]"
              style={S.card}
            >
              <div className="flex items-center gap-3">
                <ExternalLink size={16} className="text-cyan-400" />
                <span className="text-white text-sm font-semibold">OpenVPN Connect</span>
              </div>
              <ChevronRight size={14} className="text-slate-600" />
            </button>
            <button
              onClick={() => window.open('https://apps.apple.com/us/app/wireguard/id1441195209', '_blank')}
              className="flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.98]"
              style={S.card}
            >
              <div className="flex items-center gap-3">
                <ExternalLink size={16} className="text-cyan-400" />
                <span className="text-white text-sm font-semibold">WireGuard</span>
              </div>
              <ChevronRight size={14} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-around px-4 pt-3 pb-6"
        style={{
          background: 'rgba(6,9,18,0.92)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors"
              style={{ color: active ? '#00d4ff' : '#475569' }}
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold">{label}</span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 5px #00d4ff' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const S = {
  bg: {
    background: 'radial-gradient(ellipse at 50% 0%, #0b1a2e 0%, #060b16 55%, #030609 100%)',
  },
  grid: {
    backgroundImage:
      'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
  },
  card: {
    background: 'rgba(10,14,26,0.85)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
  },
  infoBanner: {
    background: 'rgba(180,120,20,0.08)',
    border: '1px solid rgba(250,204,21,0.2)',
    backdropFilter: 'blur(10px)',
  },
};