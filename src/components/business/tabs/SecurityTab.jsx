import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Shield, Bug, Lock, Globe, Loader2, CheckCircle2, AlertTriangle, Activity, Eye } from 'lucide-react';

const FILTER_OPTIONS = [
  { key: 'block_malware', label: 'Malware & Viruses', icon: Bug, color: '#ef4444', desc: 'Block known malware domains' },
  { key: 'block_phishing', label: 'Phishing Sites', icon: AlertTriangle, color: '#f59e0b', desc: 'Block phishing and scam sites' },
  { key: 'block_adult', label: 'Adult Content', icon: Eye, color: '#a78bfa', desc: 'Block adult/explicit content' },
  { key: 'block_gambling', label: 'Gambling', icon: Globe, color: '#8b5cf6', desc: 'Block gambling and betting sites' },
  { key: 'block_social_media', label: 'Social Media', icon: Globe, color: '#3b82f6', desc: 'Block Facebook, Twitter, Instagram' },
  { key: 'block_streaming', label: 'Streaming', icon: Globe, color: '#06b6d4', desc: 'Block Netflix, YouTube, streaming sites' },
];

export default function SecurityTab({ client, onRefresh }) {
  const dnsConfig = client?.dns_filter_config || {};
  const [config, setConfig] = useState({
    block_malware: dnsConfig.block_malware ?? true,
    block_phishing: dnsConfig.block_phishing ?? true,
    block_adult: dnsConfig.block_adult ?? false,
    block_gambling: dnsConfig.block_gambling ?? false,
    block_social_media: dnsConfig.block_social_media ?? false,
    block_streaming: dnsConfig.block_streaming ?? false,
    custom_blocklist: dnsConfig.custom_blocklist || [],
    custom_allowlist: dnsConfig.custom_allowlist || [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [blocklistInput, setBlocklistInput] = useState('');
  const [allowlistInput, setAllowlistInput] = useState('');

  const toggle = (key) => setConfig(c => ({ ...c, [key]: !c[key] }));

  const addBlocklist = () => {
    const domain = blocklistInput.trim().toLowerCase();
    if (!domain || config.custom_blocklist.includes(domain)) return;
    setConfig(c => ({ ...c, custom_blocklist: [...c.custom_blocklist, domain] }));
    setBlocklistInput('');
  };

  const removeBlocklist = (d) => setConfig(c => ({ ...c, custom_blocklist: c.custom_blocklist.filter(x => x !== d) }));

  const addAllowlist = () => {
    const domain = allowlistInput.trim().toLowerCase();
    if (!domain || config.custom_allowlist.includes(domain)) return;
    setConfig(c => ({ ...c, custom_allowlist: [...c.custom_allowlist, domain] }));
    setAllowlistInput('');
  };

  const removeAllowlist = (d) => setConfig(c => ({ ...c, custom_allowlist: c.custom_allowlist.filter(x => x !== d) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke('updateDnsFilter', { dns_filter_config: config });
      if (res.data?.error) throw new Error(res.data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onRefresh();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-white font-black text-xl">Security & DNS Filtering</h2>
        <p className="text-slate-500 text-xs mt-1">Control what your team can access. Changes apply to all team devices.</p>
      </div>

      {/* DNS Filter toggles */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6">
        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <Shield size={14} className="text-cyan-400" /> Content Filtering
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {FILTER_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const enabled = config[opt.key];
            return (
              <div key={opt.key} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#060910]">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}30` }}>
                  <Icon size={15} style={{ color: opt.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold">{opt.label}</p>
                  <p className="text-slate-600 text-[10px] truncate">{opt.desc}</p>
                </div>
                <button onClick={() => toggle(opt.key)}
                  className={`w-10 h-6 rounded-full transition-all flex-shrink-0 relative ${enabled ? 'bg-cyan-500' : 'bg-white/10'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${enabled ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom blocklist */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6">
        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <Lock size={14} className="text-rose-400" /> Custom Block List
        </h3>
        <div className="flex gap-2 mb-3">
          <input value={blocklistInput} onChange={e => setBlocklistInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBlocklist())}
            placeholder="e.g. facebook.com"
            className="flex-1 px-3 py-2 rounded-lg bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          <button onClick={addBlocklist} className="px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20">
            Block
          </button>
        </div>
        {config.custom_blocklist.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {config.custom_blocklist.map(d => (
              <span key={d} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {d}
                <button onClick={() => removeBlocklist(d)} className="hover:text-rose-300">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Custom allowlist */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6">
        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <Globe size={14} className="text-emerald-400" /> Always Allow List
        </h3>
        <div className="flex gap-2 mb-3">
          <input value={allowlistInput} onChange={e => setAllowlistInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAllowlist())}
            placeholder="e.g. company-portal.com"
            className="flex-1 px-3 py-2 rounded-lg bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          <button onClick={addAllowlist} className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20">
            Allow
          </button>
        </div>
        {config.custom_allowlist.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {config.custom_allowlist.map(d => (
              <span key={d} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                {d}
                <button onClick={() => removeAllowlist(d)} className="hover:text-emerald-300">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold disabled:opacity-50 transition-all">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
          {saving ? 'Saving...' : 'Save Security Policy'}
        </button>
        {saved && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 size={14} /> Policy applied to all team devices
          </motion.span>
        )}
      </div>
    </div>
  );
}