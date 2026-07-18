import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, WifiOff, Loader2, LogOut,
  ChevronDown, ChevronUp, Check, Activity,
} from 'lucide-react';
import { SERVER_CONFIG_MAP } from '@/lib/vpnNativePlugin';

// ── constants ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Shield },
  { id: 'servers', label: 'Servers', icon: Activity },
  { id: 'settings', label: 'Settings', icon: LogOut },
];

export default function ServerList() {
  const navigate = useNavigate();
  const email = localStorage.getItem('vpn_email') || '';

  // connection state
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | disconnecting
  const [selectedServer, setSelectedServer] = useState(SERVER_CONFIG_MAP[5]); // London
  const [showPicker, setShowPicker] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  // stats
  const [elapsed, setElapsed] = useState(0);
  const [upload, setUpload] = useState(0);
  const [download, setDownload] = useState(0);
  const timerRef = useRef(null);
  const statsRef = useRef(null);

  const connected = status === 'connected';
  const connecting = status === 'connecting' || status === 'disconnecting';

  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
      statsRef.current = setInterval(() => {
        setUpload(v => parseFloat((v + Math.random() * 0.4).toFixed(1)));
        setDownload(v => parseFloat((v + Math.random() * 1.2).toFixed(1)));
      }, 1800);
    } else {
      clearInterval(timerRef.current);
      clearInterval(statsRef.current);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(statsRef.current);
    };
  }, [connected]);

  const fmt = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sc = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sc}`;
  };

  const handleToggle = async () => {
    if (connecting) return;
    if (connected) {
      setStatus('disconnecting');
      await delay(900);
      setStatus('idle');
      setElapsed(0); setUpload(0); setDownload(0);
    } else {
      setStatus('connecting');
      await delay(2200);
      setStatus('connected');
    }
  };

  const handleSelectServer = (s) => {
    if (connected) { setStatus('idle'); setElapsed(0); setUpload(0); setDownload(0); }
    setSelectedServer(s);
    setShowPicker(false);
  };

  const handleLogout = () => {
    setStatus('idle');
    localStorage.removeItem('vpn_token');
    localStorage.removeItem('vpn_email');
    navigate('/app/login');
  };

  const handleNav = (id) => {
    setActiveNav(id);
    if (id === 'settings') handleLogout();
  };

  // ── orb colour tokens ──────────────────────────────────────────────────────
  const orbBg = connected
    ? 'radial-gradient(circle at 40% 38%, rgba(0,255,150,0.22), rgba(0,180,255,0.12))'
    : connecting
      ? 'radial-gradient(circle at 40% 38%, rgba(0,180,255,0.14), rgba(0,40,80,0.2))'
      : 'rgba(255,255,255,0.03)';

  const orbBorder = connected
    ? 'rgba(0,255,150,0.55)'
    : connecting
      ? 'rgba(0,212,255,0.55)'
      : 'rgba(255,255,255,0.1)';

  const orbGlow = connected
    ? '0 0 70px rgba(0,255,150,0.3), 0 0 35px rgba(0,212,255,0.18), inset 0 0 40px rgba(0,255,150,0.06)'
    : connecting
      ? '0 0 50px rgba(0,212,255,0.25), inset 0 0 20px rgba(0,212,255,0.05)'
      : '0 0 20px rgba(0,0,0,0.5)';

  const statusColor = connected ? '#00ff96' : connecting ? '#00d4ff' : '#475569';
  const statusText = status === 'connected' ? 'Protected' : status === 'connecting' ? 'Connecting…' : status === 'disconnecting' ? 'Disconnecting…' : 'Not Protected';

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden select-none" style={S.bg}>
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={S.grid} />

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[380px] pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${connected ? 'rgba(0,255,150,0.12)' : 'rgba(0,180,255,0.09)'} 0%, transparent 70%)`,
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

        {/* Connection Orb */}
        <div className="flex flex-col items-center py-8">
          <div className="relative flex items-center justify-center" style={{ width: 196, height: 196 }}>
            {/* Animated rings */}
            {connected && (
              <>
                <div className="absolute w-full h-full rounded-full animate-ping opacity-[0.08]" style={{ background: 'rgba(0,255,150,0.5)', animationDuration: '2.4s' }} />
                <div className="absolute w-[82%] h-[82%] rounded-full animate-ping opacity-[0.12]" style={{ background: 'rgba(0,212,255,0.4)', animationDuration: '2.4s', animationDelay: '0.7s' }} />
              </>
            )}
            {connecting && (
              <div
                className="absolute w-full h-full rounded-full animate-spin"
                style={{ border: '2px solid transparent', borderTopColor: '#00d4ff', borderRightColor: 'rgba(0,212,255,0.3)' }}
              />
            )}

            {/* Core orb button */}
            <button
              onClick={handleToggle}
              disabled={connecting}
              className="w-[86%] h-[86%] rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-500 active:scale-95"
              style={{ background: orbBg, border: `2px solid ${orbBorder}`, boxShadow: orbGlow, backdropFilter: 'blur(20px)' }}
            >
              {status === 'connected' ? (
                <Shield size={38} style={{ color: '#00ff96', filter: 'drop-shadow(0 0 14px rgba(0,255,150,0.9))' }} />
              ) : connecting ? (
                <Loader2 size={34} className="animate-spin" style={{ color: '#00d4ff' }} />
              ) : (
                <WifiOff size={32} className="text-slate-600" />
              )}
              <span
                className="font-black text-[11px] uppercase tracking-widest"
                style={{ color: statusColor, textShadow: connected ? '0 0 12px rgba(0,255,150,0.8)' : 'none' }}
              >
                {statusText}
              </span>
            </button>
          </div>

          {/* Live timer */}
          <div className="flex items-center gap-2 mt-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: connected ? '#00ff96' : '#334155', boxShadow: connected ? '0 0 8px #00ff96' : 'none' }}
            />
            <span className="font-bold text-sm" style={{ color: connected ? '#00ff96' : '#475569' }}>
              {connected ? fmt(elapsed) : 'Not connected'}
            </span>
          </div>
        </div>

        {/* Stats row — only when connected */}
        {connected && (
          <div className="px-5 mb-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Status', value: 'Secure', color: '#00ff96' },
                { label: 'Upload', value: `${upload} MB`, color: '#00d4ff' },
                { label: 'Download', value: `${download} MB`, color: '#a78bfa' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="font-black text-sm" style={{ color }}>{value}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-600 mt-0.5">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Server selector card */}
        <div className="px-5 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-2 ml-1">Selected Server</p>
          <button
            onClick={() => setShowPicker(v => !v)}
            className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all active:scale-[0.98]"
            style={S.card}
          >
            <span className="text-2xl leading-none">{selectedServer.flag}</span>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm leading-none">{selectedServer.name}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">{selectedServer.country}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 5px #10b981' }} />
              <span className="text-slate-500 text-[11px]">Online</span>
              {showPicker ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
            </div>
          </button>

          {/* Server list dropdown */}
          {showPicker && (
            <div
              className="mt-2 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(8,12,22,0.97)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {SERVER_CONFIG_MAP.map((s) => {
                const sel = s.name === selectedServer.name;
                return (
                  <button
                    key={s.name}
                    onClick={() => handleSelectServer(s)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-white/5"
                    style={{
                      background: sel ? 'rgba(0,212,255,0.07)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span className="text-xl w-7 leading-none flex-shrink-0">{s.flag}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: sel ? '#00d4ff' : '#e2e8f0' }}>{s.name}</p>
                      <p className="text-[11px] text-slate-600">{s.country}</p>
                    </div>
                    {sel && <Check size={14} className="text-cyan-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Connect / Disconnect button */}
        <div className="px-5">
          <button
            onClick={handleToggle}
            disabled={connecting}
            className="w-full py-4 font-black text-base rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
            style={
              connected
                ? { background: 'rgba(239,68,68,0.13)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', boxShadow: '0 4px 20px rgba(239,68,68,0.1)' }
                : { background: 'linear-gradient(135deg, #00d4ff 0%, #00c47a 100%)', boxShadow: '0 8px 30px rgba(0,212,255,0.35)', color: '#000' }
            }
          >
            {status === 'connecting' && <><Loader2 size={18} className="animate-spin" /> Connecting…</>}
            {status === 'disconnecting' && <><Loader2 size={18} className="animate-spin" /> Disconnecting…</>}
            {status === 'connected' && <><WifiOff size={18} /> Disconnect</>}
            {status === 'idle' && <><Shield size={18} /> Connect Now</>}
          </button>
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

const delay = (ms) => new Promise(r => setTimeout(r, ms));

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
};