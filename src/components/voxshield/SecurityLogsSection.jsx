import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, ShieldAlert, ShieldCheck, Loader2, AlertTriangle, Activity, Eye, Ban, Wifi, LogIn, LogOut, Smartphone, Cpu, ChevronDown, ChevronUp } from 'lucide-react';

const severityColor = {
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const eventTypeIcon = {
  vpn_connect: Wifi,
  vpn_disconnect: LogOut,
  dns_block: Ban,
  device_register: Smartphone,
  device_remove: Cpu,
  login: LogIn,
  login_failed: AlertTriangle,
  threat_detected: ShieldAlert,
  policy_change: Shield,
  subscription_change: Activity,
};

const categoryColor = {
  malware: 'text-red-400 bg-red-500/10 border-red-500/20',
  phishing: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  adult: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  gambling: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  social_media: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  streaming: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  custom: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  allowed: 'text-green-400 bg-green-500/10 border-green-500/20',
};

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SecurityLogsSection({ clients }) {
  const [logs, setLogs] = useState([]);
  const [dnsLogs, setDnsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);
  const [view, setView] = useState('events'); // 'events' | 'dns'

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.SecurityLog.list('-created_date', 100).catch(() => []),
      base44.entities.DNSFilterLog.list('-created_date', 100).catch(() => []),
    ]).then(([logData, dnsData]) => {
      setLogs(logData);
      setDnsLogs(dnsData);
    }).finally(() => setLoading(false));
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub1 = base44.entities.SecurityLog.subscribe(() => {
      base44.entities.SecurityLog.list('-created_date', 100).then(setLogs).catch(() => {});
    });
    const unsub2 = base44.entities.DNSFilterLog.subscribe(() => {
      base44.entities.DNSFilterLog.list('-created_date', 100).then(setDnsLogs).catch(() => {});
    });
    return () => { unsub1?.(); unsub2?.(); };
  }, []);

  const clientName = (id) => clients.find((c) => c.id === id)?.name || 'Unknown Client';

  const filteredLogs = useMemo(() => {
    if (selectedClient === 'all') return logs;
    return logs.filter((l) => l.client_id === selectedClient);
  }, [logs, selectedClient]);

  const filteredDns = useMemo(() => {
    if (selectedClient === 'all') return dnsLogs;
    return dnsLogs.filter((l) => l.client_id === selectedClient);
  }, [dnsLogs, selectedClient]);

  const threatCount = filteredLogs.filter((l) => l.event_type === 'threat_detected' || l.severity === 'critical').length;
  const blockedDns = filteredDns.filter((l) => l.blocked).length;
  const warningCount = filteredLogs.filter((l) => l.severity === 'warning').length;

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-[#0d1120] border border-white/5 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 size={18} className="animate-spin text-cyan-400" />
        <span className="text-sm">Loading security logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20">
            <ShieldAlert size={16} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Security Logs & Threat Reports</h2>
            <p className="text-slate-600 text-xs">Real-time security events across client accounts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Client filter */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="bg-[#0d1120] border border-white/10 rounded-lg text-slate-300 text-xs px-3 py-1.5 focus:outline-none focus:border-cyan-500/30"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {/* View toggle */}
          <div className="flex bg-[#0d1120] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setView('events')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${view === 'events' ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Events
            </button>
            <button
              onClick={() => setView('dns')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${view === 'dns' ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              DNS Filters
            </button>
          </div>
        </div>
      </div>

      {/* Threat summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20 flex-shrink-0">
            <ShieldAlert size={14} className="text-red-400" />
          </div>
          <div>
            <p className="text-red-400 font-black text-lg leading-none">{threatCount}</p>
            <p className="text-slate-600 text-[10px] mt-1">Threats Detected</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
            <AlertTriangle size={14} className="text-amber-400" />
          </div>
          <div>
            <p className="text-amber-400 font-black text-lg leading-none">{warningCount}</p>
            <p className="text-slate-600 text-[10px] mt-1">Warnings</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0">
            <Ban size={14} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-cyan-400 font-black text-lg leading-none">{blockedDns}</p>
            <p className="text-slate-600 text-[10px] mt-1">DNS Blocked</p>
          </div>
        </div>
      </div>

      {/* Logs list */}
      <div className="rounded-2xl bg-[#0d1120] border border-white/5 overflow-hidden">
        {view === 'events' ? (
          filteredLogs.length === 0 ? (
            <div className="p-10 text-center">
              <ShieldCheck size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No security events logged.</p>
              <p className="text-slate-700 text-xs mt-1">All clear — no threats detected.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {filteredLogs.map((log) => {
                const Icon = eventTypeIcon[log.event_type] || Activity;
                const isExpanded = expandedLog === log.id;
                return (
                  <div key={log.id}>
                    <button
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${severityColor[log.severity] || severityColor.info}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-xs truncate">{log.message}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border flex-shrink-0 ${severityColor[log.severity] || severityColor.info}`}>
                            {log.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-slate-600 text-[10px]">{clientName(log.client_id)}</span>
                          {log.user_email && <span className="text-slate-700 text-[10px]">· {log.user_email}</span>}
                          {log.device_name && <span className="text-slate-700 text-[10px]">· {log.device_name}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-700 text-[10px]">{timeAgo(log.timestamp || log.created_date)}</span>
                        {isExpanded ? <ChevronUp size={12} className="text-slate-600" /> : <ChevronDown size={12} className="text-slate-600" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 pl-15 space-y-1.5">
                        {log.ip_address && (
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-600">IP:</span>
                            <code className="text-slate-400 font-mono">{log.ip_address}</code>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-slate-600">Event Type:</span>
                          <span className="text-slate-300 font-mono">{log.event_type}</span>
                        </div>
                        {log.timestamp && (
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-600">Timestamp:</span>
                            <span className="text-slate-300">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        )}
                        {log.description && (
                          <div className="flex items-start gap-2 text-[10px]">
                            <span className="text-slate-600 flex-shrink-0">Notes:</span>
                            <span className="text-slate-400">{log.description}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          filteredDns.length === 0 ? (
            <div className="p-10 text-center">
              <ShieldCheck size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No DNS filter logs.</p>
              <p className="text-slate-700 text-xs mt-1">No DNS queries have been blocked.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {filteredDns.map((dns) => (
                <div key={dns.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${dns.blocked ? (categoryColor[dns.category] || categoryColor.custom) : categoryColor.allowed}`}>
                    {dns.blocked ? <Ban size={14} /> : <ShieldCheck size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-white font-mono text-xs truncate">{dns.domain}</code>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border flex-shrink-0 ${categoryColor[dns.category] || categoryColor.custom}`}>
                        {dns.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-600 text-[10px]">{clientName(dns.client_id)}</span>
                      {dns.device_name && <span className="text-slate-700 text-[10px]">· {dns.device_name}</span>}
                      {dns.user_email && <span className="text-slate-700 text-[10px]">· {dns.user_email}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${dns.blocked ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
                      {dns.blocked ? 'BLOCKED' : 'ALLOWED'}
                    </span>
                    <span className="text-slate-700 text-[10px]">{timeAgo(dns.timestamp || dns.created_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}