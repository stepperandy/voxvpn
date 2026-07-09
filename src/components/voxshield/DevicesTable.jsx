import { useState } from 'react';
import { Smartphone, Laptop, Tablet, Router, Search, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const deviceIcon = { windows: Laptop, macos: Laptop, linux: Laptop, ios: Smartphone, android: Tablet, router: Router };
const statusColor = { active: 'text-green-400 bg-green-500/10 border-green-500/20', inactive: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };

export default function DevicesTable({ devices, clients, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [revoking, setRevoking] = useState(null);

  const clientName = (id) => {
    const c = clients.find((c) => c.id === id);
    return c?.name || 'Unknown';
  };

  const filtered = devices.filter((d) => {
    const matchSearch = !search ||
      d.device_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.ip_address?.includes(search) ||
      d.device_id?.includes(search);
    const matchClient = !filterClient || d.subscription_id === filterClient;
    return matchSearch && matchClient;
  });

  const handleRevoke = async (device) => {
    if (!confirm(`Revoke access for "${device.device_name}"?`)) return;
    setRevoking(device.id);
    try {
      await base44.entities.LinkedDevice.update(device.id, { status: 'inactive' });
      await base44.entities.SecurityLog.create({
        event_type: 'device_remove',
        severity: 'warning',
        message: `Device "${device.device_name}" revoked by admin`,
        device_name: device.device_name,
      }).catch(() => {});
      onRefresh();
    } catch (err) {
      alert('Failed to revoke: ' + err.message);
    } finally {
      setRevoking(null);
    }
  };

  const inputCls = 'bg-[#080c18] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none';

  return (
    <div className="p-5 rounded-2xl bg-[#0d1120] border border-white/5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-white font-bold text-sm">Connected Devices</h2>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search devices..." className={inputCls + ' pl-9 w-40 sm:w-52'} />
          </div>
          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className={inputCls}>
            <option value="">All Clients</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <Smartphone size={32} className="text-slate-700 mx-auto mb-2" />
          <p className="text-slate-600 text-sm">No devices found</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-2 text-slate-600 text-[10px] font-bold uppercase tracking-wider">Device</th>
                <th className="pb-2 text-slate-600 text-[10px] font-bold uppercase tracking-wider">Client</th>
                <th className="pb-2 text-slate-600 text-[10px] font-bold uppercase tracking-wider">Type</th>
                <th className="pb-2 text-slate-600 text-[10px] font-bold uppercase tracking-wider">Status</th>
                <th className="pb-2 text-slate-600 text-[10px] font-bold uppercase tracking-wider">IP</th>
                <th className="pb-2 text-slate-600 text-[10px] font-bold uppercase tracking-wider">Last Seen</th>
                <th className="pb-2 text-slate-600 text-[10px] font-bold uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const Icon = deviceIcon[d.device_type] || Smartphone;
                return (
                  <tr key={d.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon size={14} className="text-cyan-400" />
                        </div>
                        <span className="text-white text-sm font-medium">{d.device_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400 text-xs">{clientName(d.subscription_id)}</td>
                    <td className="py-3 text-slate-400 text-xs capitalize">{d.device_type || '—'}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusColor[d.status] || statusColor.inactive}`}>
                        {d.status === 'active' ? <Wifi size={9} /> : <WifiOff size={9} />}
                        {d.status || 'inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs font-mono">{d.ip_address || '—'}</td>
                    <td className="py-3 text-slate-500 text-xs">{d.last_connected ? new Date(d.last_connected).toLocaleDateString() : 'Never'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleRevoke(d)}
                        disabled={revoking === d.id}
                        className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-30"
                        title="Revoke access"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}