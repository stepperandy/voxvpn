import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, WifiOff, Bug, AlertTriangle, ChevronRight, X } from 'lucide-react';

export default function AlertsBanner({ onNavigate }) {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.functions.invoke('getBusinessAlerts', {});
        // Only show critical + warning alerts in the banner
        const urgent = (res.data?.alerts || []).filter(a => a.severity === 'critical' || a.severity === 'warning');
        setAlerts(urgent);
      } catch { /* non-fatal */ }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const iconMap = {
    device_disconnect: WifiOff,
    device_offline: WifiOff,
    antivirus_update: Bug,
    threat_detected: ShieldAlert,
    policy_violation: AlertTriangle,
  };

  if (loading || dismissed || alerts.length === 0) return null;

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-2xl border p-5 ${
          criticalCount > 0
            ? 'border-rose-500/30 bg-gradient-to-r from-rose-500/10 to-rose-500/5'
            : 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-500/5'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            criticalCount > 0 ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-amber-500/10 border border-amber-500/20'
          }`}>
            <ShieldAlert size={20} className={criticalCount > 0 ? 'text-rose-400' : 'text-amber-400'} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold text-sm">
                {criticalCount > 0 ? 'Critical Security Alerts' : 'Security Attention Required'}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                criticalCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {criticalCount > 0 ? `${criticalCount} critical` : `${warningCount} warnings`}
              </span>
            </div>

            {/* Compact alert list (max 3) */}
            <div className="space-y-1.5 mt-2">
              {alerts.slice(0, 3).map((alert, i) => {
                const Icon = iconMap[alert.type] || AlertTriangle;
                return (
                  <div key={alert.id || i} className="flex items-center gap-2 text-xs">
                    <Icon size={12} className={alert.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'} />
                    <span className="text-slate-300 truncate flex-1">{alert.message}</span>
                    {alert.device_name && <span className="text-slate-600 text-[10px]">{alert.device_name}</span>}
                  </div>
                );
              })}
              {alerts.length > 3 && (
                <p className="text-slate-600 text-[10px] ml-5">+ {alerts.length - 3} more alerts</p>
              )}
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('security')}
                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Review all alerts <ChevronRight size={12} />
              </button>
            )}
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}