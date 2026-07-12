import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, ArrowLeft, Check, Loader2, Rocket } from 'lucide-react';
import StepCompanyInfo from '@/components/voxshield/onboarding/StepCompanyInfo';
import StepDomains from '@/components/voxshield/onboarding/StepDomains';
import StepVpnPolicy from '@/components/voxshield/onboarding/StepVpnPolicy';
import StepReview from '@/components/voxshield/onboarding/StepReview';

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

export default function ClientOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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
      await base44.entities.Client.create({
        name: data.name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        vpn_plan: data.vpn_plan,
        max_users: Number(data.max_users),
        max_devices: Number(data.max_devices),
        domains: data.domains,
        dns_filter_config: data.dns_filter_config,
        status: 'trial',
        risk_score: 0,
      });
      navigate('/shield/agency');
    } catch (err) {
      setError(err.message || 'Failed to create client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Rocket size={16} className="text-cyan-400" />
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">Guided Setup</p>
        </div>
        <h1 className="text-white text-2xl font-black">Set Up a New Client</h1>
        <p className="text-slate-500 text-sm mt-1">Register domains and configure a VPN policy in a few quick steps.</p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-cyan-500 text-black' :
                i === step ? 'bg-cyan-500/15 text-cyan-400 border-2 border-cyan-500' :
                'bg-white/5 text-slate-600 border border-white/10'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
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
      <div className="rounded-2xl bg-[#0d1120] border border-white/5 p-6 mb-6">
        {step === 0 && <StepCompanyInfo data={data} update={update} />}
        {step === 1 && <StepDomains data={data} update={update} />}
        {step === 2 && <StepVpnPolicy data={data} update={update} />}
        {step === 3 && <StepReview data={data} />}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>
      )}

      {/* Nav buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 0 || saving}
          className="flex items-center gap-1.5 px-4 py-2.5 text-slate-400 hover:text-white text-sm font-medium disabled:opacity-30 transition-all"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm disabled:opacity-40 transition-all"
          >
            Continue <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={saving || !data.name || data.domains.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-sm disabled:opacity-40 transition-all"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Create Client
          </button>
        )}
      </div>
    </div>
  );
}