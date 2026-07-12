import { Building2, Mail, Phone } from 'lucide-react';

const PLANS = [
  { value: 'basic', label: 'Basic', desc: 'Essential VPN protection' },
  { value: 'standard', label: 'Standard', desc: 'Balanced security + performance' },
  { value: 'premium', label: 'Premium', desc: 'Advanced filtering + priority support' },
  { value: 'enterprise', label: 'Enterprise', desc: 'Dedicated resources + SLA' },
];

export default function StepCompanyInfo({ data, update }) {
  const inputCls = 'w-full bg-[#080c18] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors';
  const labelCls = 'text-slate-400 text-xs font-medium mb-1.5 block';

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Company Name *</label>
        <div className="relative">
          <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            required
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            className={inputCls + ' pl-9'}
            placeholder="Acme Corp"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Contact Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="email"
              value={data.contact_email}
              onChange={(e) => update({ contact_email: e.target.value })}
              className={inputCls + ' pl-9'}
              placeholder="it@acme.com"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Contact Phone</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={data.contact_phone}
              onChange={(e) => update({ contact_phone: e.target.value })}
              className={inputCls + ' pl-9'}
              placeholder="+1 555-0100"
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>VPN Plan</label>
        <div className="grid grid-cols-2 gap-2">
          {PLANS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update({ vpn_plan: p.value })}
              className={`p-3 rounded-lg border text-left transition-all ${
                data.vpn_plan === p.value
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-white/10 bg-[#080c18] hover:border-white/20'
              }`}
            >
              <p className={`text-sm font-bold ${data.vpn_plan === p.value ? 'text-cyan-400' : 'text-white'}`}>{p.label}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Max Users</label>
          <input
            type="number"
            min="1"
            value={data.max_users}
            onChange={(e) => update({ max_users: parseInt(e.target.value) || 1 })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Max Devices</label>
          <input
            type="number"
            min="1"
            value={data.max_devices}
            onChange={(e) => update({ max_devices: parseInt(e.target.value) || 1 })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}