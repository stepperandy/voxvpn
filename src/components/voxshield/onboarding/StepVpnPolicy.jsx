import { Shield, Ban } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = [
  { key: 'block_malware', label: 'Malware & Spyware', desc: 'Block known malware distribution and C2 domains', icon: Shield, default: true },
  { key: 'block_phishing', label: 'Phishing & Fraud', desc: 'Block phishing sites and credential theft pages', icon: Shield, default: true },
  { key: 'block_adult', label: 'Adult Content', desc: 'Block adult and explicit content', icon: Ban, default: false },
  { key: 'block_gambling', label: 'Gambling', desc: 'Block gambling and betting sites', icon: Ban, default: false },
  { key: 'block_social_media', label: 'Social Media', desc: 'Block Facebook, Twitter, Instagram, etc.', icon: Ban, default: false },
  { key: 'block_streaming', label: 'Streaming', desc: 'Block Netflix, YouTube, Twitch, etc.', icon: Ban, default: false },
];

export default function StepVpnPolicy({ data, update }) {
  const dns = data.dns_filter_config;
  const [blocklistInput, setBlocklistInput] = useState('');
  const [allowlistInput, setAllowlistInput] = useState('');

  const toggle = (key) => {
    update({ dns_filter_config: { ...dns, [key]: !dns[key] } });
  };

  const addCustom = (list, input, setter) => {
    const domain = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain) return;
    if (!dns[list].includes(domain)) {
      update({ dns_filter_config: { ...dns, [list]: [...dns[list], domain] } });
    }
    setter('');
  };

  const removeCustom = (list, domain) => {
    update({ dns_filter_config: { ...dns, [list]: dns[list].filter((d) => d !== domain) } });
  };

  const inputCls = 'w-full bg-[#080c18] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-slate-400 text-xs font-medium mb-3">DNS Filtering Categories</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const enabled = dns[cat.key];
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => toggle(cat.key)}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                  enabled ? 'border-cyan-500/40 bg-cyan-500/8' : 'border-white/10 bg-[#080c18] hover:border-white/20'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-cyan-500/15' : 'bg-white/5'}`}>
                  <Icon size={14} className={enabled ? 'text-cyan-400' : 'text-slate-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${enabled ? 'text-white' : 'text-slate-400'}`}>{cat.label}</p>
                    <div className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-cyan-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'left-4' : 'left-0.5'}`} />
                    </div>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-0.5">{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Custom Blocklist */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Custom Blocklist</label>
          <div className="flex gap-2">
            <input
              value={blocklistInput}
              onChange={(e) => setBlocklistInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom('custom_blocklist', blocklistInput, setBlocklistInput); } }}
              className={inputCls}
              placeholder="ads.example.com"
            />
            <button
              type="button"
              onClick={() => addCustom('custom_blocklist', blocklistInput, setBlocklistInput)}
              className="px-3 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium"
            >Add</button>
          </div>
          {dns.custom_blocklist.length > 0 && (
            <div className="mt-2 space-y-1">
              {dns.custom_blocklist.map((d) => (
                <div key={d} className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded px-2.5 py-1.5">
                  <span className="text-red-300 text-xs">{d}</span>
                  <button type="button" onClick={() => removeCustom('custom_blocklist', d)} className="text-slate-500 hover:text-red-400 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Allowlist */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Custom Allowlist</label>
          <div className="flex gap-2">
            <input
              value={allowlistInput}
              onChange={(e) => setAllowlistInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom('custom_allowlist', allowlistInput, setAllowlistInput); } }}
              className={inputCls}
              placeholder="trusted.example.com"
            />
            <button
              type="button"
              onClick={() => addCustom('custom_allowlist', allowlistInput, setAllowlistInput)}
              className="px-3 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium"
            >Add</button>
          </div>
          {dns.custom_allowlist.length > 0 && (
            <div className="mt-2 space-y-1">
              {dns.custom_allowlist.map((d) => (
                <div key={d} className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/15 rounded px-2.5 py-1.5">
                  <span className="text-emerald-300 text-xs">{d}</span>
                  <button type="button" onClick={() => removeCustom('custom_allowlist', d)} className="text-slate-500 hover:text-emerald-400 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}