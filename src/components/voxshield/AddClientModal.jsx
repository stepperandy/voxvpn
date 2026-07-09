import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Plus, Loader2, Mail, Building2, Smartphone, Shield } from 'lucide-react';

export default function AddClientModal({ agencyId, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    vpn_plan: 'standard',
    max_users: 10,
    max_devices: 20,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await base44.entities.Client.create({
        ...form,
        agency_id: agencyId,
        max_users: Number(form.max_users),
        max_devices: Number(form.max_devices),
        status: 'trial',
        risk_score: 0,
        dns_filter_config: {
          block_malware: true,
          block_phishing: true,
          block_adult: false,
          block_gambling: false,
          block_social_media: false,
          block_streaming: false,
          custom_blocklist: [],
          custom_allowlist: [],
        },
      });
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create client');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-[#080c18] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none';
  const labelCls = 'text-slate-400 text-xs font-medium mb-1 block';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d1120] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-cyan-400" />
            <h3 className="text-white font-bold text-lg">Add Client Account</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className={labelCls}>Company Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Acme Corp" />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className={inputCls + ' pl-9'} placeholder="it@acme.com" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Contact Phone</label>
            <input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className={inputCls} placeholder="+1 555-0100" />
          </div>
          <div>
            <label className={labelCls}>VPN Plan</label>
            <select value={form.vpn_plan} onChange={(e) => setForm({ ...form, vpn_plan: e.target.value })} className={inputCls}>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Max Users</label>
              <input type="number" min="1" value={form.max_users} onChange={(e) => setForm({ ...form, max_users: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max Devices</label>
              <input type="number" min="1" value={form.max_devices} onChange={(e) => setForm({ ...form, max_devices: e.target.value })} className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create Client
          </button>
        </form>
      </div>
    </div>
  );
}