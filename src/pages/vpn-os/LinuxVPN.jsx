import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Shield, Terminal, Lock, Zap } from 'lucide-react';

export default function LinuxVPN() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">🐧 Linux VPN</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">VoxVPN for <span className="text-cyan-400">Linux</span></h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10">Full-featured VPN for Ubuntu, Debian, Fedora, CentOS and more. CLI and GUI available. Native WireGuard and OpenVPN support.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Terminal, title: 'CLI & GUI', desc: 'Full command-line interface and graphical interface available for all distros.' },
            { icon: Zap, title: 'WireGuard Native', desc: 'Native WireGuard support for the fastest possible speeds on Linux.' },
            { icon: Shield, title: 'All Major Distros', desc: 'Supports Ubuntu, Debian, Fedora, CentOS, Arch Linux and more.' },
            { icon: Lock, title: 'Open Source Protocols', desc: 'Uses audited, open-source VPN protocols for maximum transparency.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120]">
              <Icon size={22} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1a20] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Get VoxVPN for Linux</h2>
          <a href="/setup?os=linux" className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Download Now</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}