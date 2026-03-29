import { Suspense, lazy } from 'react';
import MobileLayout from '@/mobile/MobileLayout';
import PullToRefresh from '@/mobile/PullToRefresh';
import { Shield, Lock, Zap, Globe, Eye, Signal } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'No-Logs Policy',
    desc: 'We never log your activity, IP, or browsing history.',
  },
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    desc: 'Military-grade encryption protects all your data.',
  },
  {
    icon: Zap,
    title: 'WireGuard Protocol',
    desc: 'Fastest VPN protocol for minimal speed loss.',
  },
  {
    icon: Globe,
    title: '50+ Locations',
    desc: 'Connect from servers worldwide.',
  },
  {
    icon: Eye,
    title: 'DNS Leak Protection',
    desc: 'Your DNS queries remain private.',
  },
  {
    icon: Signal,
    title: 'Kill Switch',
    desc: 'Auto-disconnect if VPN drops.',
  },
];

export default function FeaturesMobile() {
  const handleRefresh = async () => {
    await new Promise((r) => setTimeout(r, 800));
  };

  return (
    <MobileLayout headerTitle="Features" rootPath="/features-mobile">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="pb-24 px-4 pt-6">
          <h1 className="text-white text-2xl font-black mb-2">VoxVPN Features</h1>
          <p className="text-slate-400 text-sm mb-6">
            Industry-leading privacy and security features.
          </p>

          <div className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-white/5 bg-[#0d1120] active:bg-[#0f1428] transition-colors touch-target"
                >
                  <div className="flex items-start gap-3">
                    <Icon size={20} className="text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-white font-bold text-sm">{f.title}</h3>
                      <p className="text-slate-400 text-xs mt-1">{f.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full mt-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg transition-colors">
            Get Protected
          </button>
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
}