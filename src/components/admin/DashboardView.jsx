import { useEffect, useState } from 'react';
import { Users, Server, ShieldCheck, Activity, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

function MetricCard({ icon: Icon, label, value, sub, color, loading }) {
  const colors = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/5 bg-[#0d1120]"
    >
      <div className={`inline-flex p-3 rounded-xl border mb-4 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      {loading ? (
        <div className="h-8 w-20 bg-white/5 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-white">{value}</p>
      )}
      {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function DashboardView() {
  const [users, setUsers] = useState([]);
  const [servers, setServers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingServers, setLoadingServers] = useState(true);

  useEffect(() => {
    base44.entities.User.list().then(setUsers).finally(() => setLoadingUsers(false));
    base44.functions.invoke('getVultrServers', {})
      .then((r) => setServers(r.data.servers || []))
      .finally(() => setLoadingServers(false));
  }, []);

  const onlineServers = servers.filter(s => s.status === 'active' && s.power === 'running').length;
  const activeUsers = users.filter(u => u.role !== 'admin').length;

  return (
    <div className="space-y-8">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon={Users} label="Total Users" value={loadingUsers ? '—' : users.length} sub="Registered accounts" color="cyan" loading={loadingUsers} />
        <MetricCard icon={Activity} label="Regular Users" value={loadingUsers ? '—' : activeUsers} sub="Non-admin accounts" color="emerald" loading={loadingUsers} />
        <MetricCard icon={Server} label="Servers Online" value={loadingServers ? '—' : `${onlineServers}/${servers.length}`} sub="Live Vultr instances" color="violet" loading={loadingServers} />
        <MetricCard icon={ShieldCheck} label="Uptime" value="99.8%" sub="Last 30 days" color="rose" loading={false} />
      </div>

      {/* Server Status Summary */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
        <h3 className="text-white font-semibold mb-5">Server Status</h3>
        {loadingServers ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 size={16} className="animate-spin text-cyan-400" /> Loading...</div>
        ) : (
          <div className="space-y-3">
            {servers.map((s) => {
              const online = s.status === 'active' && s.power === 'running';
              return (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${online ? 'bg-cyan-400' : 'bg-rose-500'}`} />
                    <span className="text-white text-sm font-medium">{s.name}</span>
                    <span className="text-slate-600 text-xs font-mono">{s.location.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 text-xs font-mono">{s.ip}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${online ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {online ? 'Running' : 'Offline'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Users */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
        <h3 className="text-white font-semibold mb-5">Recent Users</h3>
        {loadingUsers ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 size={16} className="animate-spin text-cyan-400" /> Loading...</div>
        ) : (
          <div className="space-y-3">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {u.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{u.full_name}</p>
                    <p className="text-slate-500 text-xs">{u.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-violet-500/10 text-violet-400' : 'bg-white/5 text-slate-400'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}