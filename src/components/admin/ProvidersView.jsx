import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, AlertCircle, Globe, Zap, Server } from 'lucide-react';
import ProviderForm from './ProviderForm';

const tierColors = {
  standard: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  premium: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  dedicated: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

const typeLabels = {
  white_label: 'White-label API',
  own_vultr: 'Own Vultr',
  wireguard_peer: 'WireGuard Peer',
  openvpn_peer: 'OpenVPN Peer',
};

export default function ProvidersView() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [testing, setTesting] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.VPNProvider.list('-created_date', 100);
      setProviders(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this provider?')) return;
    await base44.entities.VPNProvider.delete(id);
    setProviders(p => p.filter(x => x.id !== id));
  };

  const handleTest = async (provider) => {
    setTesting(provider.id);
    try {
      const res = await base44.functions.invoke('getServersHybrid', {});
      const count = res.data?.servers?.filter(s => s.provider_id === provider.id).length || 0;
      setTestResults(r => ({ ...r, [provider.id]: { ok: true, count } }));
    } catch (e) {
      setTestResults(r => ({ ...r, [provider.id]: { ok: false, error: e.message } }));
    } finally {
      setTesting(null);
    }
  };

  const handleSave = async (data) => {
    if (editing) {
      const updated = await base44.entities.VPNProvider.update(editing.id, data);
      setProviders(p => p.map(x => x.id === editing.id ? updated : x));
    } else {
      const created = await base44.entities.VPNProvider.create(data);
      setProviders(p => [created, ...p]);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">VPN Providers</h2>
          <p className="text-slate-400 text-sm mt-1">Manage white-label APIs and own server pools for the hybrid architecture.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm transition-all"
        >
          <Plus size={15} /> Add Provider
        </button>
      </div>

      {/* Architecture info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Globe, label: 'White-label Providers', desc: 'External VPN APIs with dynamic server lists', color: 'text-cyan-400', bg: 'bg-cyan-500/5 border-cyan-500/20' },
          { icon: Server, label: 'Own Vultr Nodes', desc: 'Premium dedicated servers managed by VoxVPN', color: 'text-violet-400', bg: 'bg-violet-500/5 border-violet-500/20' },
          { icon: Zap, label: 'Hybrid Serving', desc: 'Unified API merges both sources seamlessly', color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`rounded-xl border p-4 ${item.bg}`}>
              <Icon size={18} className={`${item.color} mb-2`} />
              <p className="text-white font-bold text-sm">{item.label}</p>
              <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Provider list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="text-cyan-400 animate-spin" /></div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/5 rounded-xl">
          <Globe size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-semibold">No providers configured yet.</p>
          <p className="text-slate-600 text-sm mt-1">Add a white-label VPN API or mark your Vultr servers as a provider pool.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map(p => {
            const result = testResults[p.id];
            return (
              <div key={p.id} className="rounded-xl border border-white/5 bg-[#0d1120] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white font-bold">{p.name}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${tierColors[p.tier] || tierColors.standard}`}>{p.tier}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">{typeLabels[p.type] || p.type}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-white/5'}`}>{p.status}</span>
                  </div>
                  {p.api_base_url && <p className="text-slate-500 text-xs truncate">{p.api_base_url}{p.servers_endpoint}</p>}
                  {p.notes && <p className="text-slate-600 text-xs mt-1 italic">{p.notes}</p>}
                  {result && (
                    <div className={`flex items-center gap-1.5 mt-2 text-xs font-semibold ${result.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {result.ok ? `✓ ${result.count} servers loaded` : result.error}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTest(p)}
                    disabled={testing === p.id}
                    className="px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {testing === p.id ? <Loader2 size={12} className="animate-spin" /> : 'Test'}
                  </button>
                  <button
                    onClick={() => { setEditing(p); setShowForm(true); }}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-cyan-400 transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <ProviderForm
          provider={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}