import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, Users, Smartphone, Activity, ShieldAlert, Gauge } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="p-5 rounded-2xl bg-[#0d1120] border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-black text-white mb-1">
        {loading ? <span className="text-slate-700">—</span> : value}
      </p>
      <p className="text-slate-500 text-xs">{label}</p>
    </div>
  );
}

function severityColor(sev) {
  if (sev === 'critical') return 'text-red-400 bg-red-500/10 border-red-500/20';
  if (sev === 'warning') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
}

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, users: 0, devices: 0, sessions: 0, threats: 0, riskScore: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [clients, devices, securityLogs, dnsLogs] = await Promise.all([
          base44.entities.Client.list('-created_date', 500).catch(() => []),
          base44.entities.LinkedDevice.filter({ status: 'active' }, '-created_date', 500).catch(() => []),
          base44.entities.SecurityLog.list('-created_date', 10).catch(() => []),
          base44.entities.DNSFilterLog.filter({ blocked: true }, '-created_date', 500).catch(() => []),
        ]);
        setStats({
          clients: clients.length,
          users: 0,
          devices: devices.length,
          sessions: devices.filter(d => d.last_connected && new Date(d.last_connected) > new Date(Date.now() - 3600000)).length,
          threats: dnsLogs.length,
          riskScore: clients.length > 0 ? Math.min(100, Math.round(dnsLogs.length / Math.max(clients.length, 1) * 2)) : 0,
        });
        setLogs(securityLogs);
      } catch (e) {
        // fallback to static sample if entities are empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-black">Security Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your VPN + security posture</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Building2} label="Total Clients" value={stats.clients} color="bg-cyan-500/10 text-cyan-400" loading={loading} />
        <StatCard icon={Users} label="Active Users" value={stats.users} color="bg-violet-500/10 text-violet-400" loading={loading} />
        <StatCard icon={Smartphone} label="Connected Devices" value={stats.devices} color="bg-blue-500/10 text-blue-400" loading={loading} />
        <StatCard icon={Activity} label="VPN Sessions" value={stats.sessions} color="bg-green-500/10 text-green-400" loading={loading} />
        <StatCard icon={ShieldAlert} label="Threats Blocked" value={stats.threats} color="bg-red-500/10 text-red-400" loading={loading} />
        <StatCard icon={Gauge} label="Risk Score" value={stats.riskScore} color="bg-amber-500/10 text-amber-400" loading={loading} />
      </div>

      {/* Recent activity + Threats breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0d1120] border border-white/5">
          <h2 className="text-white font-bold text-sm mb-4">Recent Activity</h2>
          {logs.length === 0 && !loading && (
            <p className="text-slate-600 text-sm text-center py-8">No activity logged yet</p>
          )}
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityColor(log.severity)}`}>
                  {log.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm truncate">{log.message}</p>
                  <p className="text-slate-600 text-[10px]">
                    {log.event_type.replace(/_/g, ' ')} · {log.user_email || 'system'}
                    {log.timestamp && ` · ${new Date(log.timestamp).toLocaleString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat summary */}
        <div className="p-5 rounded-2xl bg-[#0d1120] border border-white/5">
          <h2 className="text-white font-bold text-sm mb-4">Threat Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">DNS Blocks</span>
              <span className="text-white font-bold text-lg">{stats.threats}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Risk Level</span>
              <span className={`font-bold text-lg ${stats.riskScore < 30 ? 'text-green-400' : stats.riskScore < 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {stats.riskScore < 30 ? 'Low' : stats.riskScore < 60 ? 'Medium' : 'High'}
              </span>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-slate-600 text-xs">
                {user?.role === 'super_admin'
                  ? 'You have full platform access across all agencies.'
                  : user?.role === 'agency_admin'
                  ? 'Manage your clients, users, and security settings.'
                  : 'View your client security overview.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}