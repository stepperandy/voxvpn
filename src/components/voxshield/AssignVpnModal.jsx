import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, UserPlus, Loader2, Mail, Shield, Smartphone } from 'lucide-react';

export default function AssignVpnModal({ clients, onClose, onAssigned }) {
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    client_id: '',
    vpn_plan: 'standard',
    max_devices: 3,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const selectedClient = clients.find((c) => c.id === form.client_id);
      if (!selectedClient) throw new Error('Please select a client');

      // Invite the team member to the app
      await base44.users.inviteUser(form.email, 'team_member');

      // Create a VPN subscription for this user
      await base44.entities.VPNSubscription.create({
        user_email: form.email,
        plan: form.vpn_plan,
        status: 'active',
        billing_cycle: 'yearly',
        max_devices: Number(form.max_devices),
        start_date: new Date().toISOString(),
        renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `Assigned to client: ${selectedClient.name} (ID: ${selectedClient.id})`,
      });

      // Log security event
      await base44.entities.SecurityLog.create({
        event_type: 'device_register',
        severity: 'info',
        message: `VPN access assigned to ${form.email} for ${selectedClient.name} (${form.vpn_plan} plan, ${form.max_devices} devices)`,
        client_id: selectedClient.id,
        agency_id: selectedClient.agency_id,
      }).catch(() => {});

      setSuccess(`Invitation sent to ${form.email}. VPN access assigned.`);
      setForm({ email: '', full_name: '', client_id: '', vpn_plan: 'standard', max_devices: 3 });
      setTimeout(() => onAssigned(), 1500);
    } catch (err) {
      setError(err.message || 'Failed to assign VPN access');
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
            <UserPlus size={18} className="text-cyan-400" />
            <h3 className="text-white font-bold text-lg">Assign VPN Access</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">{success}</div>}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className={labelCls}>Team Member Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls + ' pl-9'} placeholder="john@acme.com" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Full Name</label>
            <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} placeholder="John Doe" />
          </div>
          <div>
            <label className={labelCls}>Assign to Client</label>
            <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={inputCls}>
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>VPN Plan</label>
            <div className="relative">
              <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <select value={form.vpn_plan} onChange={(e) => setForm({ ...form, vpn_plan: e.target.value })} className={inputCls + ' pl-9'}>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Max Devices</label>
            <div className="relative">
              <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input type="number" min="1" max="20" value={form.max_devices} onChange={(e) => setForm({ ...form, max_devices: e.target.value })} className={inputCls + ' pl-9'} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Invite & Assign VPN
          </button>
        </form>
      </div>
    </div>
  );
}