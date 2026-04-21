import { useState } from 'react';
import { VPN_SERVERS } from '@/lib/vpnServers';
import {
  Shield, Server, FileText, Wifi, WifiOff, Download,
  AlertCircle, X, Search, CheckCircle2, Info
} from 'lucide-react';

// Flow states (no longer uses vpnConnectionService simulation)
const FLOW = {
  IDLE: 'idle',
  CONFIG_READY: 'config_ready',
  DOWNLOADED: 'downloaded',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
};

function downloadOvpn(server) {
  const blob = new Blob([server.config], { type: 'application/x-openvpn-profile' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VoxVPN-${server.name}.ovpn`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function StatusDot({ isConnected, isSelected }) {
  if (isConnected) return <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] flex-shrink-0" />;
  if (isSelected) return <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />;
  return <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />;
}

const STATUS_META = {
  [FLOW.IDLE]:         { label: 'Idle',               color: 'text-slate-400',   bg: 'bg-[#0d1120] border-white/5' },
  [FLOW.CONFIG_READY]: { label: 'Config Ready',        color: 'text-cyan-300',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
  [FLOW.DOWNLOADED]:   { label: 'Downloaded',          color: 'text-yellow-300',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
  [FLOW.CONNECTED]:    { label: 'Connected Externally',color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  [FLOW.DISCONNECTED]: { label: 'Disconnected',        color: 'text-slate-400',   bg: 'bg-[#0d1120] border-white/5' },
};

export default function VpnServers() {
  const [selectedServer, setSelectedServer] = useState(null);
  const [flow, setFlow] = useState(FLOW.IDLE);
  const [search, setSearch] = useState('');

  const filteredServers = VPN_SERVERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openPanel = (server) => {
    setSelectedServer(server);
    if (!selectedServer || selectedServer.id !== server.id) {
      setFlow(server.config?.trim() ? FLOW.CONFIG_READY : FLOW.IDLE);
    }
  };

  const handleDownload = () => {
    downloadOvpn(selectedServer);
    setFlow(FLOW.DOWNLOADED);
  };

  const handleMarkConnected = () => setFlow(FLOW.CONNECTED);
  const handleDisconnect = () => { setFlow(FLOW.DISCONNECTED); setSelectedServer(null); };
  const handleReconnect = () => { openPanel(selectedServer); };

  const isConnected = flow === FLOW.CONNECTED && selectedServer;
  const status = STATUS_META[flow];
  const configPreview = selectedServer?.config?.split('\n').slice(0, 10).join('\n') ?? '';

  return (
    <div className="min-h-screen bg-[#060d1a] px-5 pt-14 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-10 w-auto" />
        <div>
          <h1 className="text-white font-black text-xl leading-none">VoxVPN Servers</h1>
          <p className="text-slate-500 text-xs mt-0.5">{VPN_SERVERS.length} secure locations available</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={`mb-5 p-4 rounded-2xl border transition-all ${status.bg}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            {flow === FLOW.CONNECTED && <Wifi size={16} className="text-emerald-400" />}
            {flow === FLOW.DOWNLOADED && <CheckCircle2 size={16} className="text-yellow-400" />}
            {flow === FLOW.CONFIG_READY && <FileText size={16} className="text-cyan-400" />}
            {(flow === FLOW.IDLE || flow === FLOW.DISCONNECTED) && <WifiOff size={16} className="text-slate-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${status.color}`}>{status.label}</p>
            <p className="text-slate-600 text-xs truncate">
              {flow === FLOW.CONNECTED && selectedServer ? `VoxVPN connected via ${selectedServer.name}` : `${VPN_SERVERS.length} VoxVPN servers available`}
            </p>
          </div>
          {flow === FLOW.CONNECTED && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:bg-rose-500/30 transition-all active:scale-95 flex-shrink-0"
            >
              Disconnect
            </button>
          )}
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
          <p className="text-slate-600 text-sm text-center py-8">No VoxVPN servers match "{search}"</p>
        )}
        {filteredServers.map((server) => {
          const isSel = selectedServer?.id === server.id;
          const isConn = isConnected && isSel;
          return (
            <div
              key={server.id}
              onClick={() => setSelectedServer(server)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isConn
                  ? 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/10'
                  : isSel
                  ? 'border-cyan-500/40 bg-cyan-500/5 ring-1 ring-cyan-500/10'
                  : 'border-white/5 bg-[#0d1120] hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <StatusDot isSelected={isSel} isConnected={isConn} />
                  <div className="min-w-0">
                    <p className={`font-bold text-sm ${isConn || isSel ? 'text-white' : 'text-slate-200'}`}>
                      {server.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-0.5">
                      <FileText size={10} />
                      <span className="font-mono truncate">VoxVPN-{server.name}.ovpn</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    isConn ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'
                  }`}>
                    {isConn ? 'Connected' : 'Ready'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openPanel(server); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 whitespace-nowrap ${
                      isConn
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/30'
                        : isSel
                        ? 'bg-cyan-400 hover:bg-cyan-300 text-black'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    {isConn ? 'Manage' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Server Details Panel */}
      {selectedServer && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1120] p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Server size={16} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-black text-base leading-none">{selectedServer.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">VoxVPN Secure Access</p>
              </div>
            </div>
            <button onClick={() => setSelectedServer(null)} className="text-slate-500 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Info rows */}
          <div className="space-y-2.5">
            {/* Status */}
            <div className="flex items-center justify-between py-2.5 border-b border-white/5">
              <span className="text-slate-500 text-xs uppercase tracking-wider">Status</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${flow === FLOW.CONNECTED ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                <span className={`text-xs font-bold ${STATUS_META[flow].color}`}>{STATUS_META[flow].label}</span>
              </div>
            </div>

            {/* Config file */}
            <div className="flex items-center justify-between py-2.5 border-b border-white/5">
              <span className="text-slate-500 text-xs uppercase tracking-wider">Config File</span>
              <div className="flex items-center gap-1.5">
                <FileText size={12} className="text-slate-400" />
                <span className="text-slate-200 text-xs font-mono">VoxVPN-{selectedServer.name}.ovpn</span>
              </div>
            </div>

            {/* Config available */}
            <div className="flex items-center justify-between py-2.5 border-b border-white/5">
              <span className="text-slate-500 text-xs uppercase tracking-wider">Config Available</span>
              {selectedServer.config?.trim() ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 size={13} /> Yes
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <AlertCircle size={13} /> Not loaded
                </span>
              )}
            </div>
          </div>

          {/* Usage hint */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
            <Info size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-cyan-200/70 text-xs leading-relaxed">
              Download your VoxVPN profile and open it with <span className="font-bold text-cyan-300">OpenVPN Connect</span>
            </p>
          </div>

          {/* Actions */}
          {selectedServer.config?.trim() ? (
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Download size={15} />
                {flow === FLOW.DOWNLOADED ? 'Re-download VoxVPN Profile' : 'Download VoxVPN Profile'}
              </button>

              {flow === FLOW.DOWNLOADED && (
                <button
                  onClick={handleMarkConnected}
                  className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-black rounded-xl text-sm transition-all active:scale-[0.98]"
                >
                  ✓ I'm Connected
                </button>
              )}

              {flow === FLOW.CONNECTED && (
                <button
                  onClick={handleDisconnect}
                  className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 font-black rounded-xl text-sm transition-all active:scale-[0.98]"
                >
                  Disconnect
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-rose-300 text-xs">VoxVPN profile not available for this server yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}