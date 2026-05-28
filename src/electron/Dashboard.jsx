import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Shield, Loader2, WifiOff, Lock, CheckCircle2, AlertTriangle, Minus, X, Search, LogOut, Download, Zap, Gauge, ToggleLeft, ToggleRight, Activity } from 'lucide-react';
import { api } from './api';
import { useAuth } from './AuthContext';

const HEARTBEAT_INTERVAL_MS = 60_000;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [servers, setServers]           = useState([]);
  const [server, setServer]             = useState(null);
  const [serverListOpen, setServerListOpen] = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [status, setStatus]             = useState('idle'); // idle | connecting | connected | disconnecting
  const [error, setError]               = useState('');
  const [log, setLog]                   = useState('');
  const [forceLogout, setForceLogout]   = useState('');
  const [updateInfo, setUpdateInfo]     = useState(null);

  // Kill Switch
  const [killSwitch, setKillSwitch]         = useState(() => localStorage.getItem('voxvpn_kill_switch') === 'true');
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const prevStatus = useRef('idle');

  // Fastest Server
  const [fastestLoading, setFastestLoading] = useState(false);

  // Speed Test
  const [speedData, setSpeedData]     = useState(null);
  const [speedTesting, setSpeedTesting] = useState(false);

  const listRef      = useRef(null);
  const heartbeatRef = useRef(null);
  const sessionStart = useRef(null);
  const activeServer = useRef(null);
  const vpn = window.electronVPN;

  // Check for updates on mount
  useEffect(() => {
    vpn?.checkUpdate?.().then(res => {
      if (res?.hasUpdate) setUpdateInfo({
        ...res,
        downloadUrl: res.downloadUrl || 'https://github.com/stepperandy/voxvpn/releases/download/v2.0.0/VoxVPN-Setup-v2.0.exe',
      });
    }).catch(() => {});
  }, []);

  // Load servers on mount
  useEffect(() => {
    if (!user) return;
    api.getServers(user.token, user.device_id)
      .then(res => {
        const list = res.servers || [];
        setServers(list);
        if (list.length > 0) setServer(list[0]);
      })
      .catch(() => {
        const fallback = [
          { id: 'us-new-york',  region: 'New York',   country: 'US', flag: '🇺🇸' },
          { id: 'uk-london',    region: 'London',     country: 'GB', flag: '🇬🇧' },
          { id: 'de-frankfurt', region: 'Frankfurt',  country: 'DE', flag: '🇩🇪' },
          { id: 'sg-singapore', region: 'Singapore',  country: 'SG', flag: '🇸🇬' },
          { id: 'jp-tokyo',     region: 'Tokyo',      country: 'JP', flag: '🇯🇵' },
          { id: 'au-sydney',    region: 'Sydney',      country: 'AU', flag: '🇦🇺' },
          { id: 'nl-amsterdam', region: 'Amsterdam',  country: 'NL', flag: '🇳🇱' },
        ];
        setServers(fallback);
        setServer(fallback[0]);
      });
  }, [user]);

  // VPN status listener
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

  // Kill switch: detect unexpected VPN drop
  useEffect(() => {
    if (prevStatus.current === 'connected' && status === 'idle' && killSwitch) {
      setKillSwitchActive(true);
      vpn?.killSwitch?.(true);
    }
    if (status === 'connected') {
      setKillSwitchActive(false);
      vpn?.killSwitch?.(false);
    }
    prevStatus.current = status;
  }, [status, killSwitch]);

  const toggleKillSwitch = useCallback(() => {
    const next = !killSwitch;
    setKillSwitch(next);
    localStorage.setItem('voxvpn_kill_switch', String(next));
    if (!next) {
      setKillSwitchActive(false);
      vpn?.killSwitch?.(false);
    }
  }, [killSwitch]);

  // Fastest Server
  const handleFastestServer = useCallback(async () => {
    setFastestLoading(true);
    try {
      const res = await api.recommendServer(user.token, user.device_id);
      const best = servers.find(s => s.id === res?.server_id) || servers[0];
      if (best) {
        setServer(best);
        setServerListOpen(false);
      }
    } catch { /* keep current */ }
    finally { setFastestLoading(false); }
  }, [user, servers]);

  // Speed Test
  const handleSpeedTest = useCallback(async () => {
    setSpeedTesting(true);
    try {
      const res = await api.runSpeedTest(user.token, user.device_id);
      setSpeedData({
        download: res?.download_mbps ?? res?.download ?? 0,
        upload:   res?.upload_mbps   ?? res?.upload   ?? 0,
        ping:     res?.ping_ms       ?? res?.ping      ?? 0,
      });
    } catch { /* ignore */ }
    finally { setSpeedTesting(false); }
  }, [user]);

  // Heartbeat
  function startHeartbeat(serverId) {
    stopHeartbeat();
    heartbeatRef.current = setInterval(async () => {
      try {
        const res = await api.heartbeat(user.token, user.device_id, serverId);
        if (res.disconnect) await forceDisconnect(res.reason || 'Session terminated by server.');
      } catch { /* network hiccup */ }
    }, HEARTBEAT_INTERVAL_MS);
  }

  function stopHeartbeat() {
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
  }

  async function forceDisconnect(reason) {
    stopHeartbeat();
    if (vpn) await vpn.disconnect();
    setStatus('idle');
    setForceLogout(reason);
    setTimeout(() => logout(), 3000);
  }

  // Connect
  const handleConnect = async () => {
    if (!vpn || !server) return;
    setError('');
    setForceLogout('');
    setStatus('connecting');
    try {
      const ovpnContent = await api.downloadConfig(user.token, user.device_id, server.id);
      if (!ovpnContent || typeof ovpnContent !== 'string') throw new Error('Could not fetch VPN config. Please try again.');
      const result = await vpn.connect(ovpnContent);
      if (!result.ok) throw new Error(result.error || 'Connection failed.');
      activeServer.current = server;
      sessionStart.current = Date.now();
      await api.sessionStart(user.token, user.device_id, server.id).catch(() => {});
      startHeartbeat(server.id);
    } catch (err) {
      setError(err.message || 'Connection error.');
      setStatus('idle');
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    if (!vpn) return;
    setStatus('disconnecting');
    stopHeartbeat();
    const duration = sessionStart.current ? Math.round((Date.now() - sessionStart.current) / 1000) : 0;
    const srv = activeServer.current;
    await vpn.disconnect();
    setStatus('idle');
    if (srv) api.sessionEnd(user.token, user.device_id, srv.id, 0, 0, duration).catch(() => {});
    activeServer.current = null;
    sessionStart.current = null;
  };

  useEffect(() => () => stopHeartbeat(), []);

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

      {/* Banners */}
      {updateInfo && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs">
          <Download size={13} className="flex-shrink-0" />
          <span className="flex-1">V{updateInfo.latest} available</span>
          {updateInfo.downloadUrl && (
            <a href={updateInfo.downloadUrl} target="_blank" rel="noreferrer" className="font-bold underline hover:text-cyan-300">Download</a>
          )}
          <button onClick={() => setUpdateInfo(null)} className="ml-1 hover:text-cyan-200">✕</button>
        </div>
      )}
      {forceLogout && (
        <div className="mx-4 mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs">
          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
          <span>{forceLogout} Signing out…</span>
        </div>
      )}
      {killSwitchActive && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold">
          <AlertTriangle size={13} className="flex-shrink-0" />
          Kill switch active — internet blocked until you reconnect.
        </div>
      )}

      {/* Main — scrollable so all controls fit */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

        {/* Status Ring */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500
            ${isConnected ? 'bg-cyan-500/10 border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'bg-white/3 border-2 border-white/10'}`}>
            {busy && <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />}
            <Shield size={38} className={`transition-colors duration-300 ${isConnected ? 'text-cyan-400' : 'text-slate-600'}`} />
          </div>
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
        </div>

        {/* Server selector */}
        <div ref={listRef} className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => !busy && setServerListOpen(v => !v)}
              disabled={busy}
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-[#0d1120] hover:border-cyan-500/30 transition-all disabled:opacity-50"
            >
              <span className="text-xl">{displayFlag}</span>
              <div className="flex-1 text-left">
                <p className="text-white font-bold text-sm">{displayLabel}</p>
                <p className="text-slate-500 text-xs">{displayCountry}</p>
              </div>
            </button>
            {/* Fastest Server button */}
            <button onClick={handleFastestServer} disabled={busy || fastestLoading}
              title="Auto-select fastest server"
              className="px-3 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all disabled:opacity-40">
              {fastestLoading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            </button>
          </div>
          {fastestLoading && (
            <p className="text-violet-400 text-[10px] text-center">Finding fastest server for your location…</p>
          )}

          {serverListOpen && (
            <div className="space-y-2 pb-1 max-h-40 overflow-y-auto">
              <div className="px-2 relative">
                <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#0d1120] border border-white/10 text-white focus:outline-none focus:border-cyan-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {filteredServers.map(s => (
                  <button key={s.id}
                    onClick={() => { setServer(s); setServerListOpen(false); setSearchTerm(''); if (isConnected) handleDisconnect(); }}
                    className={`p-2 rounded-lg border transition-all text-left text-xs
                      ${s.id === server?.id ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-[#0d1120] border-white/10 hover:border-white/20'}`}
                  >
                    <p className={`font-bold ${s.id === server?.id ? 'text-cyan-400' : 'text-white'}`}>{s.region || s.label}</p>
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
            className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {isConnecting ? <><Loader2 size={16} className="animate-spin" /> Connecting…</> : <><Lock size={16} /> Connect</>}
          </button>
        ) : (
          <button onClick={handleDisconnect} disabled={busy}
            className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 disabled:opacity-50 transition-all">
            {isDisconnecting ? <><Loader2 size={16} className="animate-spin" /> Disconnecting…</> : <><WifiOff size={16} /> Disconnect</>}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Kill Switch toggle */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/8 bg-[#0d1120]">
          <div>
            <p className="text-white text-xs font-bold">Kill Switch</p>
            <p className="text-slate-600 text-[10px]">Block all traffic if VPN drops</p>
          </div>
          <button onClick={toggleKillSwitch} className="transition-colors">
            {killSwitch
              ? <ToggleRight size={26} className="text-cyan-400" />
              : <ToggleLeft  size={26} className="text-slate-600" />}
          </button>
        </div>

        {/* Speed Test */}
        <button onClick={handleSpeedTest} disabled={speedTesting || !isConnected}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-40">
          {speedTesting ? <Loader2 size={13} className="animate-spin" /> : <Gauge size={13} />}
          {speedTesting ? 'Running speed test…' : isConnected ? 'Run Speed Test' : 'Connect to run speed test'}
        </button>

        {speedData && (
          <div className="rounded-xl border border-white/8 bg-[#0d1120] p-3 space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity size={11} className="text-slate-500" />
              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Speed Test Results</p>
            </div>
            {[
              { label: '↓ Download', value: speedData.download, max: 200, color: 'bg-cyan-400' },
              { label: '↑ Upload',   value: speedData.upload,   max: 200, color: 'bg-violet-400' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-400 text-[10px]">{m.label}</span>
                  <span className="text-white text-[10px] font-bold">{Number(m.value).toFixed(1)} Mbps</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
            <p className="text-slate-600 text-[10px] text-right">Ping: {speedData.ping} ms</p>
          </div>
        )}

        {/* User info */}
        {user && <p className="text-slate-700 text-xs text-center pb-1">{user.email} · {user.plan || 'VoxVPN'} · v2.0.0</p>}
      </div>

      {/* Log panel */}
      {log && (
        <div className="border-t border-white/5 px-4 py-2 max-h-20 overflow-y-auto">
          <pre className="text-slate-700 text-[10px] leading-relaxed whitespace-pre-wrap">{log}</pre>
        </div>
      )}
    </div>
  );
}