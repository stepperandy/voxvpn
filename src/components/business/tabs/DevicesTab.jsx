import { motion } from 'framer-motion';
import { Monitor, Smartphone, Tablet, Router, Loader2, Wifi, WifiOff } from 'lucide-react';

const deviceIcons = {
  windows: Monitor, macos: Monitor, linux: Monitor,
  ios: Smartphone, android: Smartphone, router: Router,
};

const deviceColors = {
  windows: '#00d4ff', macos: '#94a3b8', linux: '#f97316',
  ios: '#a78bfa', android: '#34A853', router: '#8b5cf6',
};

export default function DevicesTab({ data }) {
  const { devices, stats } = data;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-white font-black text-xl">Team Devices</h2>
        <p className="text-slate-500 text-xs mt-1">
          {stats?.activeDevices || 0} active · {stats?.totalDevices || 0} total registered
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/5 bg-[#0d1420] p-4 text-center">
          <p className="text-2xl font-black text-white">{stats?.totalDevices || 0}</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Total</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{stats?.activeDevices || 0}</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Active</p>
        </div>
        <div className="rounded-xl border border-slate-500/10 bg-slate-500/5 p-4 text-center">
          <p className="text-2xl font-black text-slate-400">{(stats?.totalDevices || 0) - (stats?.activeDevices || 0)}</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Inactive</p>
        </div>
      </div>

      {/* Device list */}
      {devices?.length > 0 ? (
        <div className="space-y-2">
          {devices.map((d, i) => {
            const Icon = deviceIcons[d.device_type] || Monitor;
            const color = deviceColors[d.device_type] || '#94a3b8';
            const isActive = d.status === 'active';
            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-[#0d1420]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{d.device_name || 'Unnamed Device'}</p>
                  <p className="text-slate-500 text-xs truncate">
                    {d.device_type} · {d.owner_email || 'Unknown user'}
                  </p>
                  {d.last_connected && (
                    <p className="text-slate-600 text-[10px] mt-0.5">
                      Last connected: {new Date(d.last_connected).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: isActive ? 'rgba(52,168,83,0.1)' : 'rgba(100,116,139,0.1)' }}>
                  {isActive ? <Wifi size={12} className="text-emerald-400" /> : <WifiOff size={12} className="text-slate-500" />}
                  <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isActive ? 'Active' : 'Offline'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-[#0d1420] py-16 text-center">
          <Monitor size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No devices registered yet.</p>
          <p className="text-slate-600 text-xs mt-1">Team devices will appear here once members install and connect.</p>
        </div>
      )}
    </div>
  );
}