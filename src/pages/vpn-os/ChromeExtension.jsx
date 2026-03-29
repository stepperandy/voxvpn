import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Globe, Lock, Zap } from 'lucide-react';

export default function ChromeExtension() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">🌐 Chrome Extension</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">VoxVPN <span className="text-cyan-400">Chrome Extension</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">Protect your browser with the VoxVPN Chrome extension. Lightweight, fast and easy — add it to Chrome or Brave in seconds and browse privately.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Globe, title: 'Browser Protection', desc: 'Encrypts all browser traffic without affecting other apps.' },
            { icon: Zap, title: 'One-Click Connect', desc: 'Connect to the fastest server with a single click from your toolbar.' },
            { icon: Shield, title: 'WebRTC Leak Block', desc: 'Blocks WebRTC leaks that can expose your real IP address.' },
            { icon: Lock, title: 'Chrome & Brave', desc: 'Compatible with Chrome, Brave, Edge and all Chromium-based browsers.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Icon size={22} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Add VoxVPN to Chrome</h2>
          <a href="/setup" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Add to Browser</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}