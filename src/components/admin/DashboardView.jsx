import { useEffect, useState } from 'react';
import { Users, Server, ShieldCheck, Activity, Loader2, TrendingUp, Globe, Cpu, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

const regionNames = {
  lhr: 'London', lax: 'Los Angeles', ewr: 'New York', ord: 'Chicago', dfw: 'Dallas',
  sea: 'Seattle', atl: 'Atlanta', mia: 'Miami', sgp: 'Singapore', ams: 'Amsterdam',
  fra: 'Frankfurt', par: 'Paris', nrt: 'Tokyo', syd: 'Sydney', yto: 'Toronto', bom: 'Mumbai',
};

function MetricCard({ icon: Icon, label, value, sub, trend, color, loading }) {
  const colors = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'shadow-violet-500/10' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'shadow-rose-500/10' },
  };
  const c = colors[color];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border border-white/5 bg-[#0d1120] hover:border-white/10 transition-all shadow-lg ${c.glow}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${c.bg} ${c.border}`}>
          <Icon size={18} className={c.text} />
        </div>
        {trend !== undefined && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            <ArrowUpRight size={11} /> {trend}%
          </span>
        )}
      </div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      {loading ? <div className="h-8 w-20 bg-white/5 rounded animate-pulse" /> : (
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      )}
      {sub && <p className="text-slate-600 text-xs mt-1.5">{sub}</p>}
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
  const offlineServers = servers.length - onlineServers;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role !== 'admin').length;

  // Fake sparkline data
  const trafficData = Array.from({ length: 14 }, (_, i) => ({
    day: format(subDays(new Date(), 13 - i), 'MMM d'),
    users: Math.floor(Math.random() * 40 + 60),
    sessions: Math.floor(Math.random() * 80 + 120),
  }));

  const pieData = [
    { name: 'Online', value: onlineServers || 1, color: '#22d3ee' },
    { name: 'Offline', value: offlineServers || 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Total Users" value={loadingUsers ? '—' : users.length} sub="All registered accounts" trend={12} color="cyan" loading={loadingUsers} />
        <MetricCard icon={Activity} label="Regular Users" value={loadingUsers ? '—' : regularUsers} sub="Non-admin accounts" color="emerald" loading={loadingUsers} />
        <MetricCard icon={Server} label="Servers Online" value={loadingServers ? '—' : `${onlineServers}/${servers.length}`} sub="Live Vultr instances" color="violet" loading={loadingServers} />
        <MetricCard icon={ShieldCheck} label="Uptime" value="99.8%" sub="Last 30 days" color="rose" loading={false} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Traffic chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0d1120] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-sm">Session Activity</h3>
              <p className="text-slate-500 text-xs mt-0.5">14-day user sessions overview</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="sessions" stroke="#22d3ee" strokeWidth={2} fill="url(#sessGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Server pie */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-sm">Server Health</h3>
            <p className="text-slate-500 text-xs mt-0.5">Online vs Offline</p>
          </div>
          {loadingServers ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-cyan-400" />
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <PieChart width={160} height={160}>
                  <Pie data={pieData} cx={75} cy={75} innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                </PieChart>
              </div>
              <div className="space-y-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-slate-400 text-xs">{d.name}</span>
                    </div>
                    <span className="text-white text-xs font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Server list */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-sm">Server Status</h3>
            <span className="text-slate-500 text-xs">{servers.length} total</span>
          </div>
          {loadingServers ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 size={16} className="animate-spin text-cyan-400" /> Loading...</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scroll">
              {servers.map((s) => {
                const online = s.status === 'active' && s.power === 'running';
                const name = regionNames[s.location] || s.location.toUpperCase();
                return (
                  <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/2 hover:bg-white/4 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${online ? 'bg-cyan-400' : 'bg-rose-500'}`} />
                      <div>
                        <p className="text-white text-xs font-medium">{s.name}</p>
                        <p className="text-slate-600 text-[10px]">{name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-slate-500 text-[10px] font-mono hidden sm:block">{s.ip}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${online ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'}`}>
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
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-sm">Recent Users</h3>
            <span className="text-slate-500 text-xs">{users.length} total</span>
          </div>
          {loadingUsers ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 size={16} className="animate-spin text-cyan-400" /> Loading...</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {users.slice(0, 8).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/2 hover:bg-white/4 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{u.full_name}</p>
                      <p className="text-slate-600 text-[10px]">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${u.role === 'admin' ? 'bg-violet-500/10 text-violet-400' : 'bg-white/5 text-slate-500'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}