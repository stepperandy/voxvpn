import { motion } from 'framer-motion';
import { Users, Monitor, Shield, Bug, ArrowRight, Clock, Activity, TrendingUp } from 'lucide-react';
import AlertsBanner from '@/components/business/AlertsBanner';

const STAT_CARDS = [
  { key: 'totalMembers', label: 'Team Members', icon: Users, color: '#00d4ff', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.2)' },
  { key: 'activeDevices', label: 'Active Devices', icon: Monitor, color: '#34A853', bg: 'rgba(52,168,83,0.08)', border: 'rgba(52,168,83,0.2)' },
  { key: 'threatsBlocked', label: 'Threats Blocked', icon: Bug, color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)' },
  { key: 'totalLogs', label: 'Security Events', icon: Activity, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
];

export default function OverviewTab({ data, onNavigate }) {
  const { stats, client, securityLogs, teamMembers } = data;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#0d1420] to-[#060c1a] p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Shield size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl">{client?.name}</h1>
            <p className="text-slate-500 text-xs">
              {client?.vpn_plan?.toUpperCase()} plan · {client?.status === 'trial' ? 'Trial' : 'Active'} ·
              Max {client?.max_users} users · {client?.max_devices} devices
            </p>
          </div>
        </div>
      </div>

      {/* Security alerts banner */}
      <AlertsBanner onNavigate={onNavigate} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border p-5" style={{ borderColor: card.border, background: card.bg }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                <Icon size={18} style={{ color: card.color }} />
              </div>
              <p className="text-3xl font-black text-white">{stats?.[card.key] ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button onClick={() => onNavigate('members')}
          className="flex items-center gap-4 p-5 rounded-2xl border border-cyan-500/20 bg-[#0d1420] hover:border-cyan-500/40 transition-all group text-left">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Users size={20} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Invite Team Members</p>
            <p className="text-slate-500 text-xs mt-0.5">Add users and assign devices</p>
          </div>
          <ArrowRight size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
        </button>

        <button onClick={() => onNavigate('installer')}
          className="flex items-center gap-4 p-5 rounded-2xl border border-emerald-500/20 bg-[#0d1420] hover:border-emerald-500/40 transition-all group text-left">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Monitor size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Download Team Installer</p>
            <p className="text-slate-500 text-xs mt-0.5">VPN + Vox Antivirus for deployment</p>
          </div>
          <ArrowRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>

      {/* Recent security events */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Clock size={14} className="text-slate-500" /> Recent Security Events
          </h3>
          <button onClick={() => onNavigate('security')} className="text-cyan-400 text-xs font-semibold hover:text-cyan-300">
            View All →
          </button>
        </div>
        {securityLogs?.length > 0 ? (
          <div className="space-y-2">
            {securityLogs.slice(0, 5).map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  log.severity === 'critical' ? 'bg-rose-400' : log.severity === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{log.message}</p>
                  <p className="text-slate-600 text-[10px]">{log.user_email} · {log.event_type}</p>
                </div>
                <span className="text-slate-600 text-[10px] flex-shrink-0">
                  {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp size={24} className="text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-xs">No security events yet. Your team is secure!</p>
          </div>
        )}
      </div>
    </div>
  );
}