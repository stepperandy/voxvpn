import { useState, useEffect } from 'react';
import { Shield, LogOut, MapPin, Wifi, WifiOff, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

export default function VpnDashboard() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [servers, setServers] = useState([]);
  const [connected, setConnected] = useState(null); // server id currently connected
  const [loadingAction, setLoadingAction] = useState(null); // server id being acted on
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoadingInit(true);
    setError('');
    try {
      // 1. Get Base44 user
      const me = await base44.auth.me();
      if (!me) {
        base44.auth.redirectToLogin('/vpn-dashboard');
        return;
      }
      setUser(me);

      // 2. Check subscription in Base44 DB
      const subs = await base44.entities.VPNSubscription.filter({ user_email: me.email });
      const active = subs.find(s => s.status === 'active') || null;
      setSubscription(active);

      // 3. Load servers from VoxVPN backend
      const res = await base44.functions.invoke('voxvpnProxy', { action: 'servers' });
      const data = res.data;
      if (Array.isArray(data)) {
        setServers(data);
      } else if (data?.servers) {
        setServers(data.servers);
      }
    } catch (err) {
      setError('Failed to load dashboard. Please refresh.');
    } finally {
      setLoadingInit(false);
    }
  };

  const handleConnect = async (server) => {
    if (!subscription) return;
    setLoadingAction(server.id);
    setError('');
    try {
      const res = await base44.functions.invoke('voxvpnProxy', {
        action: 'connect',
        user_email: user.email,
        server_id: server.id,
      });
      if (res.data?.error) {
        setError(res.data.error);
      } else {
        setConnected(server.id);
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDisconnect = async () => {
    setLoadingAction('disconnect');
    setError('');
    try {
      await base44.functions.invoke('voxvpnProxy', {
        action: 'disconnect',
        user_email: user.email,
      });
      setConnected(null);
    } catch (err) {
      setError('Disconnect failed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Loading state
  if (loadingInit) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <Loader2 size={32} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  const hasSubscription = !!subscription;

  return (
    <div className="min-h-screen bg-[#080c18] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Shield size={18} className="text-cyan-400" />
          </div>
          <span className="text-white font-black text-lg">VoxVPN</span>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-slate-500 text-sm hidden sm:block">{user.email}</span>}
          <button
            onClick={() => base44.auth.logout('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors"
          >
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">

          {/* Subscription status */}
          {!hasSubscription && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-bold text-sm mb-1">Subscription Required</p>
                <p className="text-amber-200/60 text-xs mb-3">You need an active subscription to connect to VPN servers.</p>
                <Link
                  to="/#pricing"
                  className="inline-block px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold rounded-lg transition-all"
                >
                  View Plans →
                </Link>
              </div>
            </div>
          )}

          {hasSubscription && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-emerald-400 font-bold text-sm">{subscription.plan} Plan — Active</span>
                {subscription.renewal_date && (
                  <p className="text-emerald-300/50 text-xs">Renews {new Date(subscription.renewal_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}

          {/* Connected status */}
          {connected && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi size={20} className="text-cyan-400" />
                <div>
                  <p className="text-white font-bold text-sm">Connected</p>
                  <p className="text-slate-400 text-xs">
                    {servers.find(s => s.id === connected)?.city || 'VPN Server'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={loadingAction === 'disconnect'}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {loadingAction === 'disconnect' ? <Loader2 size={13} className="animate-spin" /> : <WifiOff size={13} />}
                Disconnect
              </button>
            </div>
          )}

          {/* Server list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-white font-black text-xl">Select a Server</h1>
              <button onClick={init} className="text-slate-500 hover:text-white transition-colors">
                <RefreshCw size={15} />
              </button>
            </div>

            {servers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No servers available. Check your connection.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {servers.map((server) => {
                  const isConnected = connected === server.id;
                  const isLoading = loadingAction === server.id;
                  return (
                    <button
                      key={server.id}
                      onClick={() => isConnected ? handleDisconnect() : handleConnect(server)}
                      disabled={!hasSubscription || isLoading || (connected && !isConnected)}
                      className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl border transition-all group
                        ${isConnected
                          ? 'border-cyan-500/40 bg-cyan-500/5'
                          : 'border-white/5 bg-[#0d1120] hover:border-cyan-500/30 hover:bg-[#0d1a20]'}
                        disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <span className="text-2xl">{server.flag || '🌐'}</span>
                      <div className="text-left flex-1">
                        <p className="text-white font-bold">{server.city || server.name}</p>
                        <p className="text-slate-500 text-xs flex items-center gap-1">
                          <MapPin size={10} /> {server.country || server.region}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors
                        ${isConnected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
                        {isLoading
                          ? <Loader2 size={14} className="animate-spin text-cyan-400" />
                          : isConnected
                            ? <><Wifi size={14} /> Connected</>
                            : <><Wifi size={14} /> Connect</>
                        }
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}