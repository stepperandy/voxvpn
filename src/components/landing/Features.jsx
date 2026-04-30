import { motion } from 'framer-motion';
import { Lock, Zap, Shield, Globe, AlertCircle, Smartphone, Wifi, GitBranch } from 'lucide-react';

const features = [
  { icon: Lock,         title: 'No-Logs Policy',       description: 'We never record your browsing activity, IP address, or DNS queries.',       color: 'text-cyan-400',   bg: 'from-cyan-500/10 to-transparent',   border: 'border-cyan-500/20' },
  { icon: Zap,          title: 'Lightning Fast',        description: 'Optimized VoxVPN routing ensures minimal speed loss globally.',           color: 'text-amber-400',  bg: 'from-amber-500/10 to-transparent',  border: 'border-amber-500/20' },
  { icon: Shield,       title: 'AES-256 Encryption',    description: 'Military-grade encryption protects every byte of your data in transit.',    color: 'text-violet-400', bg: 'from-violet-500/10 to-transparent', border: 'border-violet-500/20' },
  { icon: Globe,        title: 'Bypass Geo-Blocks',     description: 'Access Netflix, BBC iPlayer, Hulu and any geo-restricted content.',         color: 'text-emerald-400',bg: 'from-emerald-500/10 to-transparent',border: 'border-emerald-500/20' },
  { icon: AlertCircle,  title: 'Kill Switch',           description: 'If your VPN drops, our kill switch instantly cuts your internet.',           color: 'text-rose-400',   bg: 'from-rose-500/10 to-transparent',   border: 'border-rose-500/20' },
  { icon: Smartphone,   title: 'All Your Devices',      description: 'Windows, macOS, iOS, Android, Linux — up to 10 devices per account.',       color: 'text-blue-400',   bg: 'from-blue-500/10 to-transparent',   border: 'border-blue-500/20' },
  { icon: Wifi,         title: 'Public WiFi Protection',description: 'Stay safe on coffee shop and airport WiFi automatically.',                   color: 'text-pink-400',   bg: 'from-pink-500/10 to-transparent',   border: 'border-pink-500/20' },
  { icon: GitBranch,    title: 'Split Tunneling',       description: 'Choose which apps use the VPN and which use your normal connection.',        color: 'text-indigo-400', bg: 'from-indigo-500/10 to-transparent', border: 'border-indigo-500/20' },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#06080f] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.3) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">Why VoxVPN</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Everything you need.<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Nothing you don't.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Every feature is designed with one goal: keeping you private, safe, and unrestricted online.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, description, color, bg, border }, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className={`group relative p-5 rounded-2xl border ${border} bg-gradient-to-b ${bg} bg-[#0b1221] hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl ${bg}`} />

              <div className="relative z-10">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${border} bg-[#06080f]`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-14 p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-[#0b1221] to-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="text-xl font-black text-white mb-1">Ready to get protected?</h3>
            <p className="text-slate-400 text-sm">Join 2,500+ users who trust VoxVPN. Plans start at $2.49/mo.</p>
          </div>
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-shrink-0 px-8 py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-black rounded-2xl text-sm transition-all shadow-lg shadow-cyan-500/25 whitespace-nowrap"
          >
            View Plans →
          </button>
        </motion.div>
      </div>
    </section>
  );
}