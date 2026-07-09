import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, Plus, X, Loader2, Shield, Crown } from 'lucide-react';

function CreateAgencyModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', contact_email: '', contact_phone: '', plan: 'starter', billing_cycle: 'monthly', max_clients: 5, max_users: 50 });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Agency.create({ ...form, max_clients: Number(form.max_clients), max_users: Number(form.max_users) });
      onCreated();
    } catch (err) {
      alert('Failed to create agency: ' + err.message);
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
          <h3 className="text-white font-bold text-lg">Create Agency</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div><label className={labelCls}>Agency Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Acme Security LLC" /></div>
          <div><label className={labelCls}>Contact Email</label><input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className={inputCls} placeholder="admin@acme.com" /></div>
          <div><label className={labelCls}>Contact Phone</label><input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} className={inputCls} placeholder="+1 555-0100" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Plan</label><select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className={inputCls}><option value="starter">Starter</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select></div>
            <div><label className={labelCls}>Billing</label><select value={form.billing_cycle} onChange={e => setForm({ ...form, billing_cycle: e.target.value })} className={inputCls}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Max Clients</label><input type="number" value={form.max_clients} onChange={e => setForm({ ...form, max_clients: e.target.value })} className={inputCls} /></div>
            <div><label className={labelCls}>Max Users</label><input type="number" value={form.max_users} onChange={e => setForm({ ...form, max_users: e.target.value })} className={inputCls} /></div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create Agency
          </button>
        </form>
      </div>
    </div>
  );
}

const planColor = { starter: 'text-slate-400 bg-slate-500/10 border-slate-500/20', professional: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', enterprise: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
const statusColor = { active: 'text-green-400 bg-green-500/10 border-green-500/20', trial: 'text-amber-400 bg-amber-500/10 border-amber-500/20', suspended: 'text-red-400 bg-red-500/10 border-red-500/20' };

export default function Agencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Agency.list('-created_date', 100);
      setAgencies(data);
    } catch (e) {
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-black">Agencies</h1>
          <p className="text-slate-500 text-sm mt-1">Manage partner agencies and their clients</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm">
          <Plus size={16} /> New Agency
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" /></div>
      ) : agencies.length === 0 ? (
        <div className="text-center py-20">
          <Building2 size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No agencies yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencies.map(a => (
            <div key={a.id} className="p-5 rounded-2xl bg-[#0d1120] border border-white/5 hover:border-cyan-500/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  {a.white_label_enabled ? <Crown size={18} className="text-violet-400" /> : <Shield size={18} className="text-cyan-400" />}
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${planColor[a.plan] || planColor.starter}`}>{a.plan}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusColor[a.status] || statusColor.trial}`}>{a.status}</span>
                </div>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">{a.name}</h3>
              {a.contact_email && <p className="text-slate-500 text-xs mb-2">{a.contact_email}</p>}
              <div className="flex gap-4 pt-3 border-t border-white/5">
                <div><p className="text-white font-bold text-sm">{a.max_clients}</p><p className="text-slate-600 text-[10px]">Max Clients</p></div>
                <div><p className="text-white font-bold text-sm">{a.max_users}</p><p className="text-slate-600 text-[10px]">Max Users</p></div>
                <div><p className="text-white font-bold text-sm capitalize">{a.billing_cycle}</p><p className="text-slate-600 text-[10px]">Billing</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateAgencyModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
    </div>
  );
}