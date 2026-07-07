import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Globe, Lock, Zap, Users, Award, Eye, Server, Loader2 } from 'lucide-react';

const STATIC_CONTENT = {
  headline: "Privacy Is Not a Feature — It's Our Foundation",
  subheadline: "VoxVPN is built by privacy advocates who believe your online activity should belong only to you.",
  mission: "Our mission is to provide every person on the planet with unrestricted access to the internet — securely, privately, and without compromise.",
  story: "VoxVPN was founded in 2020 by a team of cybersecurity engineers and digital rights advocates who were frustrated by the growing surveillance state and the erosion of online privacy. What started as a small project to protect friends and family has grown into a global VPN service protecting over 10 million users across 60+ countries.\n\nHeadquartered in Maine, USA, VoxVPN operates under the legal entity VoxDigits Communications LLC. We chose our jurisdiction carefully to ensure strong privacy protections for our users. Our infrastructure spans RAM-only servers in privacy-friendly locations worldwide, and our strict no-logs policy has been independently audited and verified.\n\nWe believe that privacy is a fundamental human right, not a premium feature. That's why we offer military-grade AES-256 encryption, a verified no-logs policy, and transparent business practices — at a price anyone can afford.",
  values: [
    { icon: Eye, title: "Zero Logs, Zero Compromise", desc: "We never store, sell, or share your browsing data. Our no-logs policy has been independently audited and verified." },
    { icon: Shield, title: "Military-Grade Encryption", desc: "Every byte of your traffic is protected with AES-256 encryption — the same standard used by governments and financial institutions." },
    { icon: Globe, title: "Unrestricted Access", desc: "We believe the internet should be open and free. VoxVPN breaks down geo-restrictions so you can access content from anywhere." },
    { icon: Zap, title: "Blazing Fast Speeds", desc: "Our servers are optimized for high-throughput, low-latency connections. Stream, game, and browse without slowdowns." },
    { icon: Users, title: "Built for Everyone", desc: "From privacy-conscious individuals to global enterprises — VoxVPN is designed to be simple for anyone to use." },
    { icon: Award, title: "Independently Audited", desc: "Our no-logs policy and infrastructure security are regularly audited by leading third-party cybersecurity firms." },
  ],
  stats: [
    { value: "10M+", label: "Users Protected" },
    { value: "60+", label: "Server Locations" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "0", label: "Logs Stored" },
  ],
};

export default function About() {
  const [aiContent, setAiContent] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a copywriter for VoxVPN, a premium privacy-first VPN service. 
Generate compelling marketing content for the VoxVPN About page.
Return JSON with:
- tagline: a short punchy brand tagline (max 8 words)
- promise: one sentence about VoxVPN's core promise to users
- team_blurb: 2-3 sentences about the team's background and passion for privacy
- why_us: array of 3 objects with {title, desc} — each a unique reason to choose VoxVPN
- audit_note: one sentence about independent security audits
Keep the tone professional, trustworthy, and human. No buzzword overload.`,
          response_json_schema: {
            type: "object",
            properties: {
              tagline: { type: "string" },
              promise: { type: "string" },
              team_blurb: { type: "string" },
              why_us: {
                type: "array",
                items: {
                  type: "object",
                  properties: { title: { type: "string" }, desc: { type: "string" } }
                }
              },
              audit_note: { type: "string" },
            }
          }
        });
        setAiContent(res);
      } catch (e) {
        // silently fallback to static
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAI();
  }, []);

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-6">
              <Shield size={12} /> About VoxVPN
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              {aiContent?.tagline || STATIC_CONTENT.headline}
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              {aiContent?.promise || STATIC_CONTENT.subheadline}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATIC_CONTENT.stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-cyan-400 mb-1">{stat.value}</p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-snug">
              {aiContent?.promise || STATIC_CONTENT.mission}
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              {aiContent?.team_blurb || STATIC_CONTENT.story}
            </p>
            {aiContent?.audit_note && (
              <p className="mt-4 text-sm text-slate-500 italic">{aiContent.audit_note}</p>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}
            className="rounded-2xl border border-white/5 bg-[#0d1120] p-8 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-10 w-auto" />
              <div>
                <p className="text-white font-bold">VoxVPN</p>
                <p className="text-slate-500 text-xs">by VoxDigits Communications LLC</p>
              </div>
            </div>
            {[
               { label: "Legal Entity", value: "VoxDigits Communications LLC" },
               { label: "Founded", value: "2020" },
               { label: "Jurisdiction", value: "Privacy-friendly" },
               { label: "Registration", value: "USA — Maine" },
               { label: "Audit Status", value: "✓ Verified No-Logs" },
               { label: "Protocol", value: "OpenVPN + WireGuard" },
               { label: "Encryption", value: "AES-256" },
               { label: "Support", value: "24/7 Live Chat" },
             ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-slate-500 text-sm">{item.label}</span>
                <span className="text-white font-semibold text-sm">{item.value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0e1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(aiContent?.why_us?.length
              ? [
                  ...aiContent.why_us.map((w, i) => ({ ...w, icon: [Eye, Shield, Globe][i] || Shield })),
                  ...STATIC_CONTENT.values.slice(aiContent.why_us.length)
                ]
              : STATIC_CONTENT.values
            ).map((val, i) => {
              const Icon = val.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="p-6 rounded-2xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-cyan-400" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{val.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{val.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0e1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">Our Team</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Leadership</h2>
            <p className="text-slate-500 text-sm mt-3 max-w-xl mx-auto">Led by experienced cybersecurity engineers and privacy advocates dedicated to protecting your digital freedom.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Daniel K. Mensah", role: "Founder & CEO", bio: "Cybersecurity engineer with 15+ years experience in network security and privacy infrastructure. Founded VoxVPN to make privacy accessible to everyone." },
              { name: "Sarah Chen", role: "CTO", bio: "Former security architect at major cloud providers. Leads our infrastructure team and oversees the RAM-only server network across 60+ countries." },
              { name: "Michael Owusu", role: "Head of Privacy", bio: "Digital rights advocate and privacy researcher. Ensures our no-logs policy meets the highest standards and coordinates independent audits." },
            ].map((person, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-white/5 bg-[#0d1120]">
                <div className="w-14 h-14 rounded-full mb-4 flex items-center justify-center text-cyan-400 font-black text-lg" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  {person.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-white font-bold text-base mb-1">{person.name}</h3>
                <p className="text-cyan-400 text-xs font-semibold mb-3">{person.role}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{person.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">Why VoxVPN</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Why Customers Trust Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Independently Audited", desc: "Our no-logs policy and infrastructure are verified by third-party security firms annually." },
              { title: "Transparent Operations", desc: "We publish transparency reports detailing government data requests — zero complied with." },
              { title: "RAM-Only Servers", desc: "All servers run in RAM-only mode. No data is ever written to disk. Reboot = total wipe." },
              { title: "Privacy-Friendly Jurisdiction", desc: "Operated under strong privacy laws. We are not subject to mandatory data retention." },
              { title: "Open Protocols", desc: "We use open-source, peer-reviewed protocols: OpenVPN and WireGuard. No proprietary black boxes." },
              { title: "10M+ Users", desc: "Trusted by over 10 million users worldwide to protect their privacy every day." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-5 rounded-xl border border-white/5 bg-[#0d1120]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                  <Shield size={14} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to Reclaim Your Privacy?</h2>
            <p className="text-slate-400 text-lg mb-8">Join millions of users who trust VoxVPN to keep their internet activity private.</p>
            <a href="/#pricing"
              className="inline-block px-10 py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-full text-base transition-all shadow-xl shadow-cyan-500/20">
              Get Protected Now →
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}