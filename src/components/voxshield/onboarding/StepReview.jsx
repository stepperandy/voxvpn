import { Building2, Globe, Shield, Check, AlertCircle } from 'lucide-react';

export default function StepReview({ data }) {
  const dns = data.dns_filter_config;
  const enabledCategories = [
    { label: 'Malware & Spyware', on: dns.block_malware },
    { label: 'Phishing & Fraud', on: dns.block_phishing },
    { label: 'Adult Content', on: dns.block_adult },
    { label: 'Gambling', on: dns.block_gambling },
    { label: 'Social Media', on: dns.block_social_media },
    { label: 'Streaming', on: dns.block_streaming },
  ].filter((c) => c.on);

  const isValid = data.name && data.domains.length > 0;

  return (
    <div className="space-y-5">
      {!isValid && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
          <AlertCircle size={14} /> Please complete the company name and add at least one domain before finishing.
        </div>
      )}

      {/* Company */}
      <div className="rounded-xl bg-[#080c18] border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={14} className="text-cyan-400" />
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">Company</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><p className="text-slate-500">Name</p><p className="text-white font-medium">{data.name || '—'}</p></div>
          <div><p className="text-slate-500">VPN Plan</p><p className="text-cyan-400 font-medium capitalize">{data.vpn_plan}</p></div>
          <div><p className="text-slate-500">Contact Email</p><p className="text-white font-medium">{data.contact_email || '—'}</p></div>
          <div><p className="text-slate-500">Contact Phone</p><p className="text-white font-medium">{data.contact_phone || '—'}</p></div>
          <div><p className="text-slate-500">Max Users</p><p className="text-white font-medium">{data.max_users}</p></div>
          <div><p className="text-slate-500">Max Devices</p><p className="text-white font-medium">{data.max_devices}</p></div>
        </div>
      </div>

      {/* Domains */}
      <div className="rounded-xl bg-[#080c18] border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={14} className="text-cyan-400" />
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">Registered Domains ({data.domains.length})</h4>
        </div>
        {data.domains.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.domains.map((d) => (
              <span key={d} className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">{d}</span>
            ))}
          </div>
        ) : <p className="text-slate-600 text-xs">No domains added</p>}
      </div>

      {/* VPN Policy */}
      <div className="rounded-xl bg-[#080c18] border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-cyan-400" />
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">VPN Policy</h4>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-slate-500 text-xs mb-1.5">Active Filter Categories</p>
            {enabledCategories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {enabledCategories.map((c) => (
                  <span key={c.label} className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-medium">
                    <Check size={9} /> {c.label}
                  </span>
                ))}
              </div>
            ) : <p className="text-slate-600 text-xs">No categories enabled</p>}
          </div>
          {dns.custom_blocklist.length > 0 && (
            <div>
              <p className="text-slate-500 text-xs mb-1.5">Custom Blocklist ({dns.custom_blocklist.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {dns.custom_blocklist.map((d) => (
                  <span key={d} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px]">{d}</span>
                ))}
              </div>
            </div>
          )}
          {dns.custom_allowlist.length > 0 && (
            <div>
              <p className="text-slate-500 text-xs mb-1.5">Custom Allowlist ({dns.custom_allowlist.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {dns.custom_allowlist.map((d) => (
                  <span key={d} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">{d}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}