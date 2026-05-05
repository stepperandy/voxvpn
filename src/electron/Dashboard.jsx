import { useState, useEffect, useRef, useMemo } from 'react';
import { Shield, Loader2, WifiOff, Lock, CheckCircle2, AlertTriangle, Minus, X, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SERVERS = [
  { id: 'us-new-york',    label: 'New York',     country: 'United States', flag: '🇺🇸' },
  { id: 'us-losangeles',  label: 'Los Angeles',  country: 'United States', flag: '🇺🇸' },
  { id: 'uk-london',      label: 'London',       country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'de-frankfurt',   label: 'Frankfurt',    country: 'Germany',        flag: '🇩🇪' },
  { id: 'sg-singapore',   label: 'Singapore',    country: 'Singapore',      flag: '🇸🇬' },
  { id: 'jp-tokyo',       label: 'Tokyo',        country: 'Japan',          flag: '🇯🇵' },
  { id: 'au-sydney',      label: 'Sydney',       country: 'Australia',      flag: '🇦🇺' },
  { id: 'nl-amsterdam',   label: 'Amsterdam',    country: 'Netherlands',    flag: '🇳🇱' },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [server, setServer] = useState(SERVERS[0]);
  const [serverListOpen, setServerListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | disconnecting
  const [error, setError] = useState('');
  const [log, setLog] = useState('');
  const listRef = useRef(null);
  const vpn = window.electronVPN;

  const filteredServers = useMemo(() => {
    return SERVERS.filter(s => 
      s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});

    if (vpn) {
      vpn.onStatus((s) => setStatus(s));
      vpn.onLog((line) => setLog(prev => (prev + '\n' + line).split('\n').slice(-30).join('\n')));
      vpn.getStatus().then(({ connected }) => setStatus(connected ? 'connected' : 'idle'));
    }

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

  const handleConnect = async () => {
    if (!vpn) return;
    setError('');
    setStatus('connecting');
    try {
      // Fetch the .ovpn config from our backend
      const res = await base44.functions.invoke('generateVpnConfig', {
        server_id: server.id,
        proto: 'udp',
      });
      const ovpnContent = res.data;
      if (!ovpnContent || typeof ovpnContent !== 'string') {
        setError('Could not fetch VPN config. Please try again.');
        setStatus('idle');
        return;
      }
      const result = await vpn.connect(ovpnContent);
      if (!result.ok) {
        setError(result.error || 'Connection failed.');
        setStatus('idle');
      }
    } catch (err) {
      setError(err.message || 'Connection error.');
      setStatus('idle');
    }
  };

  const handleDisconnect = async () => {
    if (!vpn) return;
    setStatus('disconnecting');
    await vpn.disconnect();
    setStatus('idle');
  };

  const isConnected    = status === 'connected';
  const isConnecting   = status === 'connecting';
  const isDisconnecting = status === 'disconnecting';
  const busy = isConnecting || isDisconnecting;

  return (
    <div className="w-full h-screen bg-[#080c18] flex flex-col select-none overflow-hidden">

      {/* Title bar (draggable) */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/5"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cyan-400 rounded-md flex items-center justify-center">
            <Shield size={13} className="text-black" />
          </div>
          <span className="text-white font-bold text-sm">VoxVPN</span>
        </div>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
          <button onClick={() => vpn?.minimize()} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
            <Minus size={13} />
          </button>
          <button onClick={() => vpn?.close()} className="w-7 h-7 flex items-center justify-center rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">

        {/* Status Ring */}
        <div className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500
          ${isConnected ? 'bg-cyan-500/10 border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'bg-white/3 border-2 border-white/10'}`}
        >
          {busy && <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />}
          <Shield size={44} className={`transition-colors duration-300 ${isConnected ? 'text-cyan-400' : 'text-slate-600'}`} />
        </div>

        {/* Status text */}
        <div className="text-center">
          {isConnecting   && <p className="text-cyan-400 font-bold text-sm animate-pulse">Connecting to {server.label}…</p>}
          {isDisconnecting && <p className="text-amber-400 font-bold text-sm animate-pulse">Disconnecting…</p>}
          {isConnected && (
            <div className="flex items-center gap-1.5 justify-center">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <p className="text-emerald-400 font-bold text-sm">Protected · {server.label}</p>
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
             <span className="text-xl">{server.flag}</span>
             <div className="flex-1 text-left">
               <p className="text-white font-bold text-sm">{server.label}</p>
               <p className="text-slate-500 text-xs">{server.country}</p>
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
                     onClick={() => { setServer(s); setServerListOpen(false); setSearchTerm(''); if (isConnected) handleDisconnect(); }}
                     className={`p-2 rounded-lg border transition-all text-left text-xs
                       ${s.id === server.id
                         ? 'bg-cyan-500/10 border-cyan-500/40'
                         : 'bg-[#0d1120] border-white/10 hover:border-white/20'}`}
                   >
                     <p className={`font-bold ${s.id === server.id ? 'text-cyan-400' : 'text-white'}`}>{s.label}</p>
                     <p className="text-slate-500 text-[10px]">{s.country}</p>
                   </button>
                 ))}
               </div>
             </div>
           )}
         </div>

        {/* Connect / Disconnect button */}
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
          <p className="text-slate-700 text-xs">{user.email}</p>
        )}
      </div>

      {/* Log panel (collapsed) */}
      {log && (
        <div className="border-t border-white/5 px-4 py-2 max-h-24 overflow-y-auto">
          <pre className="text-slate-700 text-[10px] leading-relaxed whitespace-pre-wrap">{log}</pre>
        </div>
      )}
    </div>
  );
}