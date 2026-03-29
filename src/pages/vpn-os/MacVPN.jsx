import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Download, Lock, Zap } from 'lucide-react';

export default function MacVPN() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">🍎 Mac VPN</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">VoxVPN for <span className="text-cyan-400">macOS</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">Sleek, native VPN app for macOS. Supports Apple Silicon (M1/M2/M3) and Intel Macs. Full privacy with zero speed compromise.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Download, title: 'Native Mac App', desc: 'Optimized for macOS Monterey, Ventura and Sonoma. Apple Silicon support.' },
            { icon: Zap, title: 'WireGuard Protocol', desc: 'Fastest VPN protocol available, perfect for Mac performance.' },
            { icon: Shield, title: 'Split Tunneling', desc: 'Choose which apps use VPN and which use your normal connection.' },
            { icon: Lock, title: 'Auto-Connect', desc: 'Automatically connects on unsecured WiFi networks.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Icon size={22} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Download VoxVPN for Mac</h2>
          <p className="text-slate-400 mb-6">Available on the Mac App Store and direct download.</p>
          <a href="/setup?os=macos" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Download Now</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}