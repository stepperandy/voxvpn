import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, ShieldAlert, WifiOff, Bug, AlertTriangle, X, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function BusinessAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, critical: 0, warning: 0, info: 0 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const loadAlerts = async () => {
    try {
      const res = await base44.functions.invoke('getBusinessAlerts', {});
      setAlerts(res.data?.alerts || []);
      setSummary(res.data?.summary || { total: 0, critical: 0, warning: 0, info: 0 });
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const count = summary.total;
  const isCritical = summary.critical > 0;

  const iconMap = {
    device_disconnect: WifiOff,
    device_offline: WifiOff,
    antivirus_update: Bug,
    threat_detected: ShieldAlert,
    policy_violation: AlertTriangle,
  };

  const colorMap = {
    critical: { icon: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-400' },
    warning: { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
    info: { icon: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  };

  const resolveAlert = async (alertId) => {
    try {
      await base44.entities.BusinessAlert.update(alertId, { is_resolved: true, resolved_at: new Date().toISOString() });
      loadAlerts();
    } catch { /* non-fatal */ }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
        <Bell size={18} className="text-slate-400" />
        {count > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
            isCritical ? 'bg-rose-500 text-white animate-pulse' : summary.warning > 0 ? 'bg-amber-500 text-black' : 'bg-cyan-500 text-black'
          }`}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#0d1120] shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-cyan-400" />
              <h3 className="text-white font-bold text-sm">Security Alerts</h3>
              {count > 0 && <span className="text-slate-500 text-xs">({count})</span>}
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading alerts…</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
                <p className="text-slate-400 text-sm font-medium">All clear</p>
                <p className="text-slate-600 text-xs mt-1">No security alerts. Your team is protected.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {alerts.map((alert, i) => {
                  const Icon = iconMap[alert.type] || AlertTriangle;
                  const colors = colorMap[alert.severity] || colorMap.info;
                  return (
                    <div key={alert.id || i} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}>
                          <Icon size={16} className={colors.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-white text-xs font-bold truncate">{alert.title}</p>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${colors.bg} ${colors.icon}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed">{alert.message}</p>
                          {alert.device_name && (
                            <p className="text-slate-600 text-[10px] mt-1 flex items-center gap-1">
                              <ChevronRight size={8} /> {alert.device_name}
                            </p>
                          )}
                          <p className="text-slate-700 text-[10px] mt-1">
                            {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : ''}
                          </p>
                        </div>
                        {alert.resolvable && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-600 hover:text-emerald-400 transition-colors flex-shrink-0"
                            title="Resolve"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}