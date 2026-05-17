import { useState, useEffect, useRef, useMemo } from 'react';
import { Shield, Loader2, WifiOff, Lock, CheckCircle2, AlertTriangle, Minus, X, Search, LogOut, Download } from 'lucide-react';
import { api } from './api';
import { useAuth } from './AuthContext';

const HEARTBEAT_INTERVAL_MS = 60_000; // 60 seconds

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [servers, setServers]       = useState([]);
  const [server, setServer]         = useState(null);
  const [serverListOpen, setServerListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus]         = useState('idle'); // idle | connecting | connected | disconnecting
  const [error, setError]           = useState('');
  const [log, setLog]               = useState('');
  const [forceLogout, setForceLogout] = useState(''); // message shown when heartbeat forces disconnect

  const [updateInfo, setUpdateInfo] = useState(null); // { latest, downloadUrl }

  const listRef       = useRef(null);
  const heartbeatRef  = useRef(null);
  const sessionStart  = useRef(null);
  const activeServer  = useRef(null);
  const vpn = window.electronVPN;

  // Check for updates on mount
  useEffect(() => {
    vpn?.checkUpdate?.().then(res => {
      if (res?.hasUpdate) setUpdateInfo(res);
    }).catch(() => {});
  }, []);

  // ── Load servers on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    api.getServers(user.token, user.device_id)
      .then(res => {
        const list = res.servers || [];
        setServers(list);
        if (list.length > 0) setServer(list[0]);
      })
      .catch(() => {
        // Fallback static list if API fails
        const fallback = [
          { id: 'us-new-york',   region: 'New York',    country: 'US', flag: '🇺🇸' },
          { id: 'uk-london',     region: 'London',      country: 'GB', flag: '🇬🇧' },
          { id: 'de-frankfurt',  region: 'Frankfurt',   country: 'DE', flag: '🇩🇪' },
          { id: 'sg-singapore',  region: 'Singapore',   country: 'SG', flag: '🇸🇬' },
          { id: 'jp-tokyo',      region: 'Tokyo',       country: 'JP', flag: '🇯🇵' },
          { id: 'au-sydney',     region: 'Sydney',      country: 'AU', flag: '🇦🇺' },
          { id: 'nl-amsterdam',  region: 'Amsterdam',   country: 'NL', flag: '🇳🇱' },
        ];
        setServers(fallback);
        setServer(fallback[0]);
      });
  }, [user]);

  // ── VPN status listener ───────────────────────────────────────────────────
  useEffect(() => {
    if (!vpn) return;
    vpn.onStatus(s => setStatus(s));
    vpn.onLog(line => setLog(prev => (prev + '\n' + line).split('\n').slice(-30).join('\n')));
    vpn.getStatus().then(({ connected }) => setStatus(connected ? 'connected' : 'idle'));

    const handleClick = (e) => {
      if (listRef.current && !listRef.current.contains(e.target)) setServerListOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      vpn?.off('vpn-status');
      vpn?.off('vpn-log');
    };
  }, []);

  // ── Heartbeat ─────────────────────────────────────────────────────────────
  function startHeartbeat(serverId) {
    stopHeartbeat();
    heartbeatRef.current = setInterval(async () => {
      try {
        const res = await api.heartbeat(user.token, user.device_id, serverId);
        if (res.disconnect) {
          // Subscription expired / cancelled — force disconnect
          await forceDisconnect(res.reason || 'Session terminated by server.');
        }
      } catch {
        // Network hiccup — keep trying
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  function stopHeartbeat() {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }

  async function forceDisconnect(reason) {
    stopHeartbeat();
    if (vpn) await vpn.disconnect();
    setStatus('idle');
    setForceLogout(reason);
    // Log the user out after a brief moment
    setTimeout(() => {
      logout();
    }, 3000);
  }

  // ── Connect ───────────────────────────────────────────────────────────────
  const handleConnect = async () => {
    if (!vpn || !server) return;
    setError('');
    setForceLogout('');
    setStatus('connecting');

    try {
      // 1. Download .ovpn config
      const ovpnContent = await api.downloadConfig(user.token, user.device_id, server.id);
      if (!ovpnContent || typeof ovpnContent !== 'string') {
        throw new Error('Could not fetch VPN config. Please try again.');
      }

      // 2. Launch OpenVPN
      const result = await vpn.connect(ovpnContent);
      if (!result.ok) throw new Error(result.error || 'Connection failed.');

      // 3. Notify backend session started
      activeServer.current = server;
      sessionStart.current = Date.now();
      await api.sessionStart(user.token, user.device_id, server.id).catch(() => {});

      // 4. Start heartbeat
      startHeartbeat(server.id);

    } catch (err) {
      setError(err.message || 'Connection error.');
      setStatus('idle');
    }
  };

  // ── Disconnect ────────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    if (!vpn) return;
    setStatus('disconnecting');
    stopHeartbeat();

    const duration = sessionStart.current ? Math.round((Date.now() - sessionStart.current) / 1000) : 0;
    const srv = activeServer.current;

    await vpn.disconnect();
    setStatus('idle');

    // Notify backend
    if (srv) {
      api.sessionEnd(user.token, user.device_id, srv.id, 0, 0, duration).catch(() => {});
    }
    activeServer.current = null;
    sessionStart.current = null;
  };

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => stopHeartbeat();
  }, []);

  const filteredServers = useMemo(() =>
    servers.filter(s =>
      (s.region || s.label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.country || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [servers, searchTerm]);

  const isConnected     = status === 'connected';
  const isConnecting    = status === 'connecting';
  const isDisconnecting = status === 'disconnecting';
  const busy = isConnecting || isDisconnecting;

  const displayLabel   = server?.region || server?.label || 'Select Server';
  const displayCountry = server?.country || '';
  const displayFlag    = server?.flag || '🌐';

  return (
    <div className="w-full h-screen bg-[#080c18] flex flex-col select-none overflow-hidden">

      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5" style={{ WebkitAppRegion: 'drag' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cyan-400 rounded-md flex items-center justify-center">
            <Shield size={13} className="text-black" />
          </div>
          <span className="text-white font-bold text-sm">VoxVPN</span>
        </div>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
          <button onClick={logout} title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors">
            <LogOut size={13} />
          </button>
          <button onClick={() => vpn?.minimize()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
            <Minus size={13} />
          </button>
          <button onClick={() => vpn?.close()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Update available banner */}
      {updateInfo && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs">
          <Download size={13} className="flex-shrink-0" />
          <span className="flex-1">V{updateInfo.latest} available</span>
          {updateInfo.downloadUrl && (
            <a href={updateInfo.downloadUrl} target="_blank" rel="noreferrer"
              className="font-bold underline hover:text-cyan-300">Download</a>
          )}
          <button onClick={() => setUpdateInfo(null)} className="ml-1 hover:text-cyan-200">✕</button>
        </div>
      )}

      {/* Force-logout banner */}
      {forceLogout && (
        <div className="mx-4 mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs">
          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
          <span>{forceLogout} Signing out…</span>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">

        {/* Status Ring */}
        <div className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500
          ${isConnected ? 'bg-cyan-500/10 border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'bg-white/3 border-2 border-white/10'}`}>
          {busy && <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />}
          <Shield size={44} className={`transition-colors duration-300 ${isConnected ? 'text-cyan-400' : 'text-slate-600'}`} />
        </div>

        {/* Status text */}
        <div className="text-center">
          {isConnecting    && <p className="text-cyan-400 font-bold text-sm animate-pulse">Connecting to {displayLabel}…</p>}
          {isDisconnecting && <p className="text-amber-400 font-bold text-sm animate-pulse">Disconnecting…</p>}
          {isConnected && (
            <div className="flex items-center gap-1.5 justify-center">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <p className="text-emerald-400 font-bold text-sm">Protected · {displayLabel}</p>
            </div>
          )}
          {status === 'idle' && <p className="text-slate-500 text-sm">Not Connected</p>}
        </div>

        {/* Server selector */}
        <div ref={listRef} className="w-full space-y-2">
          <button
            onClick={() => !busy && setServerListOpen(v => !v)}
            disabled={busy}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-[#0d1120] hover:border-cyan-500/30 transition-all disabled:opacity-50"
          >
            <span className="text-xl">{displayFlag}</span>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">{displayLabel}</p>
              <p className="text-slate-500 text-xs">{displayCountry}</p>
            </div>
          </button>

          {serverListOpen && (
            <div className="space-y-2 pb-1 max-h-48 overflow-y-auto">
              <div className="px-2 relative">
                <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#0d1120] border border-white/10 text-white focus:outline-none focus:border-cyan-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {filteredServers.map(s => (
                  <button key={s.id}
                    onClick={() => {
                      setServer(s);
                      setServerListOpen(false);
                      setSearchTerm('');
                      if (isConnected) handleDisconnect();
                    }}
                    className={`p-2 rounded-lg border transition-all text-left text-xs
                      ${s.id === server?.id
                        ? 'bg-cyan-500/10 border-cyan-500/40'
                        : 'bg-[#0d1120] border-white/10 hover:border-white/20'}`}
                  >
                    <p className={`font-bold ${s.id === server?.id ? 'text-cyan-400' : 'text-white'}`}>
                      {s.region || s.label}
                    </p>
                    <p className="text-slate-500 text-[10px]">{s.country}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Connect / Disconnect */}
        {!isConnected ? (
          <button onClick={handleConnect} disabled={busy}
            className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2
              bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20
              disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {isConnecting
              ? <><Loader2 size={16} className="animate-spin" /> Connecting…</>
              : <><Lock size={16} /> Connect</>}
          </button>
        ) : (
          <button onClick={handleDisconnect} disabled={busy}
            className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2
              bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400
              disabled:opacity-50 transition-all">
            {isDisconnecting
              ? <><Loader2 size={16} className="animate-spin" /> Disconnecting…</>
              : <><WifiOff size={16} /> Disconnect</>}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="w-full flex items-start gap-2 px-3 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* User info */}
        {user && (
          <p className="text-slate-700 text-xs">{user.email} · {user.plan || 'VoxVPN'} · v2.0.0</p>
        )}
      </div>

      {/* Log panel */}
      {log && (
        <div className="border-t border-white/5 px-4 py-2 max-h-24 overflow-y-auto">
          <pre className="text-slate-700 text-[10px] leading-relaxed whitespace-pre-wrap">{log}</pre>
        </div>
      )}
    </div>
  );
}