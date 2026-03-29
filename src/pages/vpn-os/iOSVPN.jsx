import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Smartphone, Lock, Zap } from 'lucide-react';

export default function iOSVPN() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">📱 iOS VPN</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">VoxVPN for <span className="text-cyan-400">iPhone & iPad</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">Protect your iPhone and iPad with VoxVPN. One-tap connection, automatic WiFi protection and unlimited bandwidth on iOS 15 and above.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Smartphone, title: 'One-Tap Connect', desc: 'Connect to the fastest server with a single tap.' },
            { icon: Zap, title: 'IKEv2 & WireGuard', desc: 'Industry-leading protocols for fast, stable iOS connections.' },
            { icon: Shield, title: 'Auto WiFi Protection', desc: 'Automatically protects you on public WiFi networks.' },
            { icon: Lock, title: 'No Battery Drain', desc: 'Optimized for iOS to minimize battery and data usage.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Icon size={22} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Download VoxVPN for iOS</h2>
          <a href="/setup?os=ios" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Get on App Store</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}