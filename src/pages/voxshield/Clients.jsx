import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Plus, X, Loader2, Smartphone, ShieldAlert } from 'lucide-react';

function CreateClientModal({ agencyId, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', contact_email: '', vpn_plan: 'standard', max_users: 10, max_devices: 20 });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Client.create({
        ...form,
        agency_id: agencyId,
        max_users: Number(form.max_users),
        max_devices: Number(form.max_devices),
        dns_filter_config: { block_malware: true, block_phishing: true, block_adult: false, block_gambling: false, block_social_media: false, block_streaming: false, custom_blocklist: [], custom_allowlist: [] },
      });
      onCreated();
    } catch (err) {
      alert('Failed to create client: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-[#080c18] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none";
  const labelCls = "text-slate-400 text-xs font-medium mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Create Client</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div><label className={labelCls}>Client Company Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Acme Corp" /></div>
          <div><label className={labelCls}>Contact Email</label><input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className={inputCls} placeholder="it@acme.com" /></div>
          <div><label className={labelCls}>VPN Plan</label><select value={form.vpn_plan} onChange={e => setForm({ ...form, vpn_plan: e.target.value })} className={inputCls}><option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Max Users</label><input type="number" value={form.max_users} onChange={e => setForm({ ...form, max_users: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Max Devices</label><input type="number" value={form.max_devices} onChange={e => setForm({ ...form, max_devices: e.target.value })} className={inputCls} /></div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create Client
          </button>
        </form>
      </div>
    </div>
  );
}

const statusColor = { active: 'text-green-400 bg-green-500/10 border-green-500/20', trial: 'text-amber-400 bg-amber-500/10 border-amber-500/20', suspended: 'text-red-400 bg-red-500/10 border-red-500/20' };
const planColor = { basic: 'text-slate-400 bg-slate-500/10 border-slate-500/20', standard: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', premium: 'text-violet-400 bg-violet-500/10 border-violet-500/20', enterprise: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [clientData, deviceData] = await Promise.all([
        base44.entities.Client.list('-created_date', 200).catch(() => []),
        base44.entities.LinkedDevice.list('-created_date', 500).catch(() => []),
      ]);
      setClients(clientData);
      setDevices(deviceData);
    } catch (e) {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deviceCount = (clientId) => devices.filter(d => d.subscription_id === clientId).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">Manage client companies, users, and devices</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm">
          <Plus size={16} /> New Client
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" /></div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20">
          <Users size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No clients yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => (
            <div key={c.id} className="p-5 rounded-2xl bg-[#0d1120] border border-white/5 hover:border-cyan-500/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Users size={18} className="text-violet-400" />
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${planColor[c.vpn_plan] || planColor.standard}`}>{c.vpn_plan}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusColor[c.status] || statusColor.trial}`}>{c.status}</span>
                </div>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">{c.name}</h3>
              {c.contact_email && <p className="text-slate-500 text-xs mb-3">{c.contact_email}</p>}
              <div className="flex gap-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-slate-600" />
                  <div><p className="text-white font-bold text-sm">{c.max_users}</p><p className="text-slate-600 text-[10px]">Max Users</p></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone size={12} className="text-slate-600" />
                  <div><p className="text-white font-bold text-sm">{deviceCount(c.id)}/{c.max_devices}</p><p className="text-slate-600 text-[10px]">Devices</p></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-slate-600" />
                  <div><p className="text-white font-bold text-sm">{c.risk_score || 0}</p><p className="text-slate-600 text-[10px]">Risk</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateClientModal
          agencyId={user?.agency_id || 'unassigned'}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}