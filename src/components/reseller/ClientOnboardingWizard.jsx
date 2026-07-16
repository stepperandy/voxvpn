import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Check, ChevronRight, ChevronLeft, Globe, Shield, Rocket,
  Loader2, PartyPopper, Server, Lock
} from 'lucide-react';

const STEPS = [
  { key: 'profile',   label: 'Agency Profile',    icon: Server },
  { key: 'domain',    label: 'Register Domain',   icon: Globe },
  { key: 'verify',    label: 'Verify Domain',     icon: Shield },
  { key: 'policy',    label: 'Configure Policy',  icon: Lock },
  { key: 'complete',  label: 'Complete',          icon: Rocket },
];

export default function ClientOnboardingWizard({ reseller, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    agency_name: reseller?.company_name || '',
    domain_name: '',
    domain_verified: false,
    policy_name: 'Default Client Policy',
    vpn_protocol: 'wireguard',
    dns_servers: '1.1.1.1, 1.0.0.1',
    allowed_countries: 'US, CA, GB, AU',
    kill_switch: true,
    split_tunneling: false,
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleVerifyDomain = async () => {
    setSaving(true);
    // Simulate domain verification — in production this would call a backend function
    await new Promise(r => setTimeout(r, 1500));
    update('domain_verified', true);
    setSaving(false);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Save onboarding state to reseller record
      if (reseller?.id) {
        await base44.entities.Reseller.update(reseller.id, {
          description: JSON.stringify({
            onboarding_completed: true,
            domain: form.domain_name,
            domain_verified: form.domain_verified,
            policy: form.policy_name,
            vpn_protocol: form.vpn_protocol,
          }),
        });
      }
    } catch (err) {
      console.error('Failed to save onboarding state:', err);
    }
    setSaving(false);
    onComplete?.();
  };

  const canProceed = () => {
    if (step === 0) return form.agency_name.trim().length > 0;
    if (step === 1) return form.domain_name.trim().length > 0;
    if (step === 2) return form.domain_verified;
    if (step === 3) return form.policy_name.trim().length > 0;
    return true;
  };

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Stepper Header */}
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <StepIcon className="w-5 h-5 text-cyan-400" />
            {currentStep.label}
          </h2>
          <span className="text-xs text-slate-500">Step {step + 1} of {STEPS.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < step;
            const isActive = i === step;
            return (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    isDone ? 'bg-cyan-500 text-slate-950' :
                    isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                    'bg-slate-800 text-slate-600'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : i + 1}
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="px-6 py-6 min-h-[280px]">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-1">Welcome to VoxBase Agency Setup</h3>
              <p className="text-sm text-slate-400">Let's get your agency configured in a few quick steps. First, confirm your agency profile.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Agency / Company Name</label>
              <input
                type="text"
                value={form.agency_name}
                onChange={e => update('agency_name', e.target.value)}
                placeholder="e.g. Acme Telecom Solutions"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
              <Server className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">Your agency profile determines how client accounts are branded and billed. You can update this later in Preferences.</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-1">Register Your Domain</h3>
              <p className="text-sm text-slate-400">Enter the domain you'll use for your client portal. This will be used for white-label branding and DNS configuration.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Domain Name</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg flex-1">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={form.domain_name}
                    onChange={e => update('domain_name', e.target.value.replace(/\s+/g, '').toLowerCase())}
                    placeholder="agency.example.com"
                    className="bg-transparent text-white text-sm placeholder-slate-600 outline-none flex-1"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Enter the full domain including subdomain if applicable.</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
              <Globe className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">After registration, you'll need to add a TXT or CNAME record to your DNS provider to verify ownership.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-1">Verify Domain Ownership</h3>
              <p className="text-sm text-slate-400">Add the following DNS record to verify ownership of <span className="text-cyan-400 font-medium">{form.domain_name || 'your domain'}</span>.</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Type</p>
                <p className="text-sm text-white font-mono">TXT</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Name / Host</p>
                <p className="text-sm text-white font-mono">@</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Value</p>
                <p className="text-sm text-cyan-400 font-mono break-all">voxdigits-verify={reseller?.id || 'XXXX'}</p>
              </div>
            </div>
            {form.domain_verified ? (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Check className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-400 font-medium">Domain verified successfully!</p>
              </div>
            ) : (
              <button
                onClick={handleVerifyDomain}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {saving ? 'Verifying…' : 'Verify Domain'}
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-1">Configure Your First VPN Policy</h3>
              <p className="text-sm text-slate-400">Set up the default VoxBase VPN policy that will be applied to all new client accounts.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Policy Name</label>
              <input
                type="text"
                value={form.policy_name}
                onChange={e => update('policy_name', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">VPN Protocol</label>
                <select
                  value={form.vpn_protocol}
                  onChange={e => update('vpn_protocol', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="wireguard">WireGuard</option>
                  <option value="openvpn">OpenVPN</option>
                  <option value="ikev2">IKEv2/IPsec</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">DNS Servers</label>
                <input
                  type="text"
                  value={form.dns_servers}
                  onChange={e => update('dns_servers', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Allowed Countries (comma-separated ISO codes)</label>
              <input
                type="text"
                value={form.allowed_countries}
                onChange={e => update('allowed_countries', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.kill_switch}
                  onChange={e => update('kill_switch', e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500"
                />
                <div>
                  <p className="text-sm text-white">Kill Switch</p>
                  <p className="text-xs text-slate-500">Block all traffic if VPN connection drops</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.split_tunneling}
                  onChange={e => update('split_tunneling', e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500"
                />
                <div>
                  <p className="text-sm text-white">Split Tunneling</p>
                  <p className="text-xs text-slate-500">Allow select apps to bypass VPN</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
              <PartyPopper className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">You're All Set!</h3>
              <p className="text-sm text-slate-400 mt-1">Your agency is configured and ready to onboard clients.</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Agency</span>
                <span className="text-white">{form.agency_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Domain</span>
                <span className="text-cyan-400">{form.domain_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Verified</span>
                <span className="text-green-400">{form.domain_verified ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Policy</span>
                <span className="text-white">{form.policy_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Protocol</span>
                <span className="text-white uppercase">{form.vpn_protocol}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={step === 0}
          className="flex items-center gap-1 px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={!canProceed()}
            className="flex items-center gap-1 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg text-sm transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            Finish Setup
          </button>
        )}
      </div>
    </div>
  );
}