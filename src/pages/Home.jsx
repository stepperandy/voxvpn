import { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar.jsx';
import Hero from '@/components/landing/Hero.jsx';
import Stats from '@/components/landing/Stats.jsx';
import Features from '@/components/landing/Features.jsx';
import Servers from '@/components/landing/Servers';
import Pricing from '@/components/landing/Pricing.jsx';
import Footer from '@/components/landing/Footer';
import MobileLayout from '@/mobile/MobileLayout';
import MobileBottomNav from '@/mobile/MobileBottomNav';
import PullToRefresh from '@/mobile/PullToRefresh';
import { Shield, Lock, Zap, Globe, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function MobileHome() {
  const handleRefresh = async () => {
    await new Promise((r) => setTimeout(r, 800));
  };

  return (
    <MobileLayout headerTitle="Home" rootPath="/">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="pb-24">
          {/* Hero */}
          <div className="px-4 pt-6 pb-8 bg-gradient-to-b from-[#0a1020] to-[#080c18]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              10,000+ users protected worldwide
            </div>
            <h1 className="text-3xl font-black text-white leading-tight mb-3">
              Secure every device.<br />
              <span className="text-cyan-400 italic">Connect through VoxVPN.</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Military-grade encryption, no-logs policy, blazing-fast VoxVPN protocol.
            </p>
            <div className="flex gap-3 mb-6">
              {['No-Logs', 'AES-256', '10+ Locations', 'Kill Switch'].map((f) => (
                <div key={f} className="flex items-center gap-1">
                  <Check size={12} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-400 text-xs">{f}</span>
                </div>
              ))}
            </div>
            <a
              href="/pricing-mobile"
              className="block w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-center text-sm transition-all select-none touch-target active:scale-95"
            >
              Get Protected Now
            </a>
          </div>

          {/* Features */}
          <div className="px-4 pt-6">
            <h2 className="text-white font-black text-xl mb-4">Why VoxVPN?</h2>
            <div className="space-y-3">
              {[
                { icon: Shield, title: 'No-Logs Policy', desc: 'We never track your activity, IP, or browsing history.' },
                { icon: Lock, title: 'AES-256 Encryption', desc: 'Military-grade encryption on all your traffic.' },
                { icon: Zap, title: 'VoxVPN Protocol', desc: 'Industry-standard VPN protocol with minimal speed loss.' },
                { icon: Globe, title: '10+ Server Locations', desc: 'Connect from servers in top countries worldwide.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-4 rounded-xl border border-white/5 bg-[#0d1120] flex items-start gap-3">
                  <Icon size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-bold text-sm">{title}</h3>
                    <p className="text-slate-400 text-xs mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      setChecked(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!checked) return null;

  if (isMobile) return <MobileHome />;

  return (
    <div className="bg-[#080c18]">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Servers />
      <Pricing />
      <Footer />
    </div>
  );
}