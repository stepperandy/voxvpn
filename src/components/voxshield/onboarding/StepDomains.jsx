import { useState } from 'react';
import { Globe, Plus, X, ShieldCheck } from 'lucide-react';

export default function StepDomains({ data, update }) {
  const [input, setInput] = useState('');

  const normalizeDomain = (raw) => raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  const addDomain = () => {
    const domain = normalizeDomain(input);
    if (!domain || !domain.includes('.')) return;
    if (data.domains.includes(domain)) { setInput(''); return; }
    update({ domains: [...data.domains, domain] });
    setInput('');
  };

  const removeDomain = (d) => {
    update({ domains: data.domains.filter((x) => x !== d) });
  };

  const inputCls = 'w-full bg-[#080c18] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none';

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-xs font-semibold mb-0.5">Register your domains</p>
            <p className="text-slate-500 text-xs leading-relaxed">Add the domains your client will use with VoxShield. DNS filtering and VPN policies will apply to traffic from these domains.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDomain(); } }}
            className={inputCls + ' pl-9'}
            placeholder="example.com"
          />
        </div>
        <button
          type="button"
          onClick={addDomain}
          disabled={!input.trim()}
          className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-40 transition-all"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {data.domains.length === 0 ? (
        <div className="py-8 text-center">
          <Globe size={28} className="text-slate-700 mx-auto mb-2" />
          <p className="text-slate-600 text-xs">No domains added yet. Add at least one domain to continue.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-slate-400 text-xs font-medium">Registered Domains ({data.domains.length})</p>
          <div className="space-y-2">
            {data.domains.map((d) => (
              <div key={d} className="flex items-center justify-between bg-[#080c18] border border-white/10 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Globe size={14} className="text-cyan-400" />
                  <span className="text-white text-sm font-medium">{d}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDomain(d)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}