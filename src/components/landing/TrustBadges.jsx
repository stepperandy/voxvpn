import { ShieldCheck, Lock, Globe, Eye, Award, Server } from 'lucide-react';

const badges = [
  { icon: ShieldCheck, label: 'AES-256 Encryption', sub: 'Military-grade security' },
  { icon: Lock, label: 'No-Logs Policy', sub: 'We never track you' },
  { icon: Globe, label: '90+ Countries', sub: 'Global server network' },
  { icon: Eye, label: 'DNS Leak Protection', sub: 'Your identity stays hidden' },
  { icon: Server, label: 'Kill Switch', sub: 'Auto-disconnect on drop' },
  { icon: Award, label: 'Independently Audited', sub: 'Verified & certified' },
];

export default function TrustBadges() {
  return (
    <section className="bg-[#080c18] border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-white text-lg font-bold tracking-tight">Trusted &amp; Secure</h2>
          <p className="text-slate-500 text-sm mt-1">Privacy-first infrastructure, built to keep you protected</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <Icon size={18} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-tight">{label}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}