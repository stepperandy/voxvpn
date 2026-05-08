import { useState } from 'react';
import { X, Save } from 'lucide-react';

const DEFAULTS = {
  name: '', type: 'white_label', api_base_url: '', api_key: '', api_secret: '',
  auth_header: 'Authorization', servers_endpoint: '/v1/servers', connect_endpoint: '/v1/connect',
  config_format: 'wireguard', status: 'active', priority: 10, tier: 'standard', notes: '',
};

export default function ProviderForm({ provider, onSave, onClose }) {
  const [form, setForm] = useState(provider ? { ...DEFAULTS, ...provider } : DEFAULTS);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const Field = ({ label, name, type = 'text', options, hint }) => (
    <div>
      <label className="block text-slate-400 text-xs font-semibold mb-1">{label}</label>
      {options ? (
        <select
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0a1020] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={form[name] || ''}
          onChange={e => set(name, type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0a1020] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-600"
        />
      )}
      {hint && <p className="text-slate-600 text-xs mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1120] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">{provider ? 'Edit Provider' : 'Add VPN Provider'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Provider Name *" name="name" hint="e.g. PureVPN White-label, Mysterium, Own Vultr Pool" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" name="type" options={[
              { value: 'white_label', label: 'White-label API' },
              { value: 'own_vultr', label: 'Own Vultr' },
              { value: 'wireguard_peer', label: 'WireGuard Peer' },
              { value: 'openvpn_peer', label: 'OpenVPN Peer' },
            ]} />
            <Field label="Tier" name="tier" options={[
              { value: 'standard', label: 'Standard' },
              { value: 'premium', label: 'Premium' },
              { value: 'dedicated', label: 'Dedicated' },
            ]} />
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3 font-semibold">API Configuration</p>
            <div className="space-y-3">
              <Field label="API Base URL" name="api_base_url" hint="e.g. https://api.provider.com" />
              <Field label="API Key" name="api_key" type="password" hint="Authentication credential" />
              <Field label="API Secret" name="api_secret" type="password" hint="Secondary secret (if needed)" />
              <Field label="Auth Header" name="auth_header" hint="e.g. Authorization, X-API-Key" />
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3 font-semibold">Endpoints</p>
            <div className="space-y-3">
              <Field label="Servers Endpoint" name="servers_endpoint" hint="Path to fetch server list, e.g. /v1/servers" />
              <Field label="Connect Endpoint" name="connect_endpoint" hint="Path to generate credentials, e.g. /v1/connect" />
              <Field label="Config Format" name="config_format" options={[
                { value: 'wireguard', label: 'WireGuard' },
                { value: 'openvpn', label: 'OpenVPN' },
                { value: 'custom', label: 'Custom' },
              ]} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
            <Field label="Status" name="status" options={[
              { value: 'active', label: 'Active' },
              { value: 'testing', label: 'Testing' },
              { value: 'inactive', label: 'Inactive' },
            ]} />
            <Field label="Priority" name="priority" type="number" hint="Lower = listed first" />
          </div>

          <Field label="Admin Notes" name="notes" />

          <div className="flex gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 font-bold transition-colors">Cancel</button>
            <button type="submit" disabled={saving || !form.name} className="flex-1 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={14} />}
              {provider ? 'Save Changes' : 'Add Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}