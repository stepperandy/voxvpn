import { useState, useEffect, useRef } from 'react';
import { VPN_SERVERS } from '@/lib/vpnServers';
import { VPN_CONFIGS } from '@/lib/vpnConfigs';
import { connectToVpn, disconnectVpn, STATES } from '@/lib/vpnConnectionService';
import { Shield, Server, FileText, Wifi, WifiOff, Loader2, AlertCircle, X, Search, Zap } from 'lucide-react';

function useTimer(running) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (running) {
      setSeconds(0);
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(ref.current);
      setSeconds(0);
    }
    return () => clearInterval(ref.current);
  }, [running]);
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function StatusDot({ state, isSelected, isConnected }) {
  if (isConnected) return <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] flex-shrink-0" />;
  if (isSelected) return <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />;
  return <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />;
}

export default function VpnServers() {
  const [selectedServer, setSelectedServer] = useState(null);
  const [connState, setConnState] = useState(STATES.IDLE);
  const [connectedServer, setConnectedServer] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [missingConfig, setMissingConfig] = useState(false);
  const [search, setSearch] = useState('');
  const timer = useTimer(connState === STATES.CONNECTED);

  const filteredServers = VPN_SERVERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnectClick = (server) => {
    const config = VPN_CONFIGS[server.id];
    setSelectedServer(server);
    setMissingConfig(!config || config.trim().length === 0);
    setConnState(!config || config.trim().length === 0 ? STATES.IDLE : STATES.READY);
    setShowPanel(true);
  };

  const handleQuickConnect = () => {
    const target = selectedServer || VPN_SERVERS[0];
    handleConnectClick(target);
  };

  const startConnection = async () => {
    setConnState(STATES.CONNECTING);
    const config = VPN_CONFIGS[selectedServer.id];
    const result = await connectToVpn(selectedServer, config);
    if (result.success) {
      setConnState(STATES.CONNECTED);
      setConnectedServer(selectedServer);
    } else {
      setConnState(STATES.FAILED);
    }
  };

  const disconnect = async () => {
    await disconnectVpn();
    setConnState(STATES.DISCONNECTED);
    setConnectedServer(null);
    setShowPanel(false);
  };

  const config = selectedServer ? VPN_CONFIGS[selectedServer.id] : '';
  const configPreview = config ? config.split('\n').slice(0, 10).join('\n') : '';

  return (
    <div className="min-h-screen bg-[#060d1a] px-5 pt-14 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Shield size={18} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-white font-black text-xl leading-none">VPN Servers</h1>
          <p className="text-slate-500 text-xs mt-0.5">{VPN_SERVERS.length} locations available</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className={`mb-5 p-4 rounded-2xl border transition-all ${
        connState === STATES.CONNECTED
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : connState === STATES.CONNECTING
          ? 'bg-cyan-500/10 border-cyan-500/20'
          : 'bg-[#0d1120] border-white/5'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              connState === STATES.CONNECTED ? 'bg-emerald-500/20' : 'bg-white/5'
            }`}>
              {connState === STATES.CONNECTED && <Wifi size={18} className="text-emerald-400" />}
              {connState === STATES.CONNECTING && <Loader2 size={18} className="text-cyan-400 animate-spin" />}
              {(connState === STATES.IDLE || connState === STATES.READY) && <Shield size={18} className="text-slate-500" />}
              {connState === STATES.DISCONNECTED && <WifiOff size={18} className="text-slate-500" />}
            </div>
            <div>
              <p className={`font-bold text-sm ${connState === STATES.CONNECTED ? 'text-emerald-300' : connState === STATES.CONNECTING ? 'text-cyan-300' : 'text-slate-400'}`}>
                {connState === STATES.IDLE && 'Not Connected'}
                {connState === STATES.READY && `Ready — ${selectedServer?.name}`}
                {connState === STATES.CONNECTING && 'Connecting...'}
                {connState === STATES.CONNECTED && connectedServer?.name}
                {connState === STATES.DISCONNECTED && 'Disconnected'}
                {connState === STATES.FAILED && 'Connection Failed'}
              </p>
              <p className="text-slate-600 text-xs">
                {connState === STATES.CONNECTED ? timer : `${VPN_SERVERS.length} servers available`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {connState === STATES.CONNECTED ? (
              <button
                onClick={disconnect}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:bg-rose-500/30 transition-all active:scale-95"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleQuickConnect}
                disabled={connState === STATES.CONNECTING}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/30 transition-all active:scale-95 disabled:opacity-40"
              >
                <Zap size={12} />
                Quick Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search servers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0d1120] border border-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 transition-colors"
        />
      </div>

      {/* Server list */}
      <div className="space-y-2.5">
        {filteredServers.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-8">No servers match "{search}"</p>
        )}
        {filteredServers.map((server) => {
          const isSelected = selectedServer?.id === server.id;
          const isConnected = connState === STATES.CONNECTED && connectedServer?.id === server.id;
          return (
            <div
              key={server.id}
              onClick={() => setSelectedServer(server)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isConnected
                  ? 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/10'
                  : isSelected
                  ? 'border-cyan-500/40 bg-cyan-500/5 ring-1 ring-cyan-500/10'
                  : 'border-white/5 bg-[#0d1120] hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <StatusDot isSelected={isSelected} isConnected={isConnected} />
                  <div className="min-w-0">
                    <p className={`font-bold text-sm ${isConnected || isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {server.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-0.5">
                      <FileText size={10} />
                      <span className="font-mono truncate">{server.file}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {isConnected ? 'Connected' : server.status}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConnectClick(server); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                      isConnected
                        ? 'bg-emerald-400 hover:bg-emerald-300 text-black'
                        : isSelected
                        ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    {isConnected ? 'Manage' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Panel (bottom sheet) */}
      {showPanel && selectedServer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 px-4 pb-6">
          <div className="w-full max-w-md bg-[#0d1120] border border-white/10 rounded-3xl p-6 space-y-5">
            {/* Panel header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Server size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-black text-base">{selectedServer.name}</p>
                  <p className="text-slate-500 text-xs font-mono">{selectedServer.file}</p>
                </div>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-slate-500 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            {missingConfig ? (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-rose-300 font-bold text-sm">Config not added yet</p>
                  <p className="text-rose-500 text-xs mt-0.5">This server's .ovpn config hasn't been loaded into the app.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Status row */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  {connState === STATES.CONNECTING && <Loader2 size={18} className="text-cyan-400 animate-spin flex-shrink-0" />}
                  {connState === STATES.CONNECTED && <Wifi size={18} className="text-emerald-400 flex-shrink-0" />}
                  {connState === STATES.DISCONNECTED && <WifiOff size={18} className="text-slate-500 flex-shrink-0" />}
                  {(connState === STATES.READY || connState === STATES.IDLE) && <Shield size={18} className="text-cyan-400 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${
                      connState === STATES.CONNECTED ? 'text-emerald-300' :
                      connState === STATES.CONNECTING ? 'text-cyan-300' :
                      connState === STATES.DISCONNECTED ? 'text-slate-400' : 'text-white'
                    }`}>
                      {connState === STATES.READY && 'Ready to connect'}
                      {connState === STATES.CONNECTING && 'Connecting...'}
                      {connState === STATES.CONNECTED && 'Connected'}
                      {connState === STATES.DISCONNECTED && 'Disconnected'}
                      {connState === STATES.FAILED && 'Connection Failed'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {connState === STATES.CONNECTED ? timer : 'OpenVPN · AES-256-CBC'}
                    </p>
                  </div>
                </div>

                {/* Config preview */}
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Config Preview</p>
                  <pre className="text-xs text-slate-400 bg-black/30 rounded-xl p-3 overflow-hidden leading-relaxed border border-white/5 whitespace-pre-wrap break-all max-h-32">
                    {configPreview}
                  </pre>
                </div>

                {/* Action button */}
                {connState === STATES.READY && (
                  <button onClick={startConnection} className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20">
                    Connect Now
                  </button>
                )}
                {connState === STATES.CONNECTING && (
                  <button disabled className="w-full py-3.5 bg-cyan-400/50 text-black/60 font-black rounded-2xl text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                    <Loader2 size={16} className="animate-spin" /> Connecting...
                  </button>
                )}
                {connState === STATES.CONNECTED && (
                  <button onClick={disconnect} className="w-full py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 font-black rounded-2xl text-sm transition-all active:scale-[0.98]">
                    Disconnect
                  </button>
                )}
                {connState === STATES.DISCONNECTED && (
                  <button onClick={startConnection} className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-2xl text-sm transition-all active:scale-[0.98]">
                    Reconnect
                  </button>
                )}
                {connState === STATES.FAILED && (
                  <button onClick={startConnection} className="w-full py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 font-black rounded-2xl text-sm transition-all active:scale-[0.98]">
                    Retry Connection
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}