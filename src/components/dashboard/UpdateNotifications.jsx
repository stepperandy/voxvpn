import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, X, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UpdateNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vox_dismissed_notifs') || '[]'); }
    catch { return []; }
  });
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    base44.entities.AppNotification.list('-created_date', 10)
      .then(records => {
        const active = (records || []).filter(r => r.is_active !== false);
        setNotifications(active);
      })
      .catch(() => {});
  }, []);

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('vox_dismissed_notifs', JSON.stringify(next));
  };

  const visible = notifications.filter(n => !dismissed.includes(n.id));

  if (visible.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden mb-5"
      style={{ border: '1px solid rgba(0,212,255,0.2)', background: 'linear-gradient(135deg, #0a1628, #060c1a)' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}>
          <Bell size={12} style={{ color: '#00d4ff' }} />
        </div>
        <span className="text-white font-bold text-sm flex-1 text-left">What's New</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>
          {visible.length}
        </span>
        {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {visible.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                    <Download size={14} style={{ color: '#00d4ff' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-bold text-sm leading-tight">{n.title}</p>
                      <button onClick={() => dismiss(n.id)} className="text-slate-600 hover:text-slate-400 flex-shrink-0 transition-colors mt-0.5">
                        <X size={13} />
                      </button>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-slate-600 text-[10px] mt-1.5">
                      {new Date(n.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}