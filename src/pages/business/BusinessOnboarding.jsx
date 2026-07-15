import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, ArrowLeft, Check, Loader2, Rocket, Globe, Shield, Building2, Sparkles } from 'lucide-react';
import StepDomains from '@/components/voxshield/onboarding/StepDomains';
import StepVpnPolicy from '@/components/voxshield/onboarding/StepVpnPolicy';

const STEPS = ['Company', 'Domains', 'VPN Policy', 'Review'];

const DEFAULT_DNS = {
  block_malware: true,
  block_phishing: true,
  block_adult: false,
  block_gambling: false,
  block_social_media: false,
  block_streaming: false,
  custom_blocklist: [],
  custom_allowlist: [],
};

export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState(null);
  const [data, setData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    vpn_plan: 'standard',
    max_users: 10,
    max_devices: 20,
    domains: [],
    dns_filter_config: { ...DEFAULT_DNS },
  });

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      if (!user) { navigate('/auth-login?next=/business/setup'); return; }
      if (!user.client_id) { navigate('/business/dashboard'); return; }
      setClientId(user.client_id);
      try {
        const res = await base44.functions.invoke('getTeamData', {});
        if (res.data?.client) {
          const c = res.data.client;
          setData({
            name: c.name || '',
            contact_email: c.contact_email || user.email || '',
            contact_phone: c.contact_phone || '',
            vpn_plan: c.vpn_plan || 'standard',
            max_users: c.max_users || 10,
            max_devices: c.max_devices || 20,
            domains: c.domains || [],
            dns_filter_config: c.dns_filter_config || { ...DEFAULT_DNS },
          });
        }
      } catch { /* use defaults */ }
      setLoading(false);
    }).catch(() => navigate('/auth-login?next=/business/setup'));
  }, []);

  const canProceed = () => {
    if (step === 0) return data.name.trim().length > 0;
    if (step === 1) return data.domains.length > 0;
    return true;
  };

  const next = () => { if (step < STEPS.length - 1) setStep(step + 1); };
  const back = () => { if (step > 0) setStep(step - 1); };

  const finish = async () => {
    setSaving(true);
    setError('');
    try {
      await base44.entities.Client.update(clientId, {
        name: data.name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        domains: data.domains,
        dns_filter_config: data.dns_filter_config,
      });
      navigate('/business/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save setup');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c18]">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0d1120]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Shield size={16} className="text-cyan-400" />
            </div>
            <span className="text-white font-bold text-sm">VoxShield Setup</span>
          </div>
          <button onClick={() => navigate('/business/dashboard')}
            className="text-slate-500 hover:text-white text-xs font-medium transition-colors">
            Skip for now →
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-4">
            <Rocket size={12} /> Guided Setup
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-2">Set Up Your Business Security</h1>
          <p className="text-slate-500 text-sm">Register your domains and configure your VPN policy in a few quick steps.</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-cyan-500 text-black' :
                  i === step ? 'bg-cyan-500/15 text-cyan-400 border-2 border-cyan-500' :
                  'bg-white/5 text-slate-600 border border-white/10'
                }`}>
                  {i < step ? <Check size={15} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium ${i <= step ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-5 rounded-full transition-colors ${i < step ? 'bg-cyan-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-[#0d1120] border border-white/5 p-6 mb-6">
            {step === 0 && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15 flex items-start gap-2.5">
                  <Building2 size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">Verify your company details</p>
                    <p className="text-slate-500 text-xs leading-relaxed">These were pre-filled from your signup. Update if needed.</p>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1.5 block">Company Name *</label>
                  <input value={data.name} onChange={(e) => update({ name: e.target.value })}
                    className="w-full bg-[#080c18] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none"
                    placeholder="Acme Corp" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs font-medium mb-1.5 block">Contact Email</label>
                    <input type="email" value={data.contact_email} onChange={(e) => update({ contact_email: e.target.value })}
                      className="w-full bg-[#080c18] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none"
                      placeholder="it@acme.com" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-medium mb-1.5 block">Contact Phone</label>
                    <input value={data.contact_phone} onChange={(e) => update({ contact_phone: e.target.value })}
                      className="w-full bg-[#080c18] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none"
                      placeholder="+1 555-0100" />
                  </div>
                </div>
              </div>
            )}
            {step === 1 && <StepDomains data={data} update={update} />}
            {step === 2 && <StepVpnPolicy data={data} update={update} />}
            {step === 3 && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-2.5">
                  <Sparkles size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-xs font-semibold mb-0.5">Review your configuration</p>
                    <p className="text-slate-500 text-xs leading-relaxed">Confirm everything looks correct, then save to activate your security policy.</p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#080c18] border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={14} className="text-cyan-400" />
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider">Company</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-slate-500">Name</p><p className="text-white font-medium">{data.name || '—'}</p></div>
                    <div><p className="text-slate-500">Plan</p><p className="text-cyan-400 font-medium capitalize">{data.vpn_plan}</p></div>
                    <div><p className="text-slate-500">Contact</p><p className="text-white font-medium">{data.contact_email || '—'}</p></div>
                    <div><p className="text-slate-500">Max Users</p><p className="text-white font-medium">{data.max_users}</p></div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#080c18] border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe size={14} className="text-cyan-400" />
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider">Domains ({data.domains.length})</h4>
                  </div>
                  {data.domains.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.domains.map((d) => (
                        <span key={d} className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">{d}</span>
                      ))}
                    </div>
                  ) : <p className="text-slate-600 text-xs">No domains added</p>}
                </div>

                <div className="rounded-xl bg-[#080c18] border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={14} className="text-cyan-400" />
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider">VPN Policy</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(data.dns_filter_config).filter(([k, v]) => typeof v === 'boolean' && v).map(([k]) => (
                      <span key={k} className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                        <Check size={9} /> {k.replace('block_', '').replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between">
          <button onClick={back} disabled={step === 0 || saving}
            className="flex items-center gap-1.5 px-4 py-2.5 text-slate-400 hover:text-white text-sm font-medium disabled:opacity-30 transition-all">
            <ArrowLeft size={15} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm disabled:opacity-40 transition-all">
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={finish} disabled={saving || !data.name || data.domains.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-sm disabled:opacity-40 transition-all">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save & Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}