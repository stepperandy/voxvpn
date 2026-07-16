import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Wifi, Globe, MessageSquare, Shield, Zap, ChevronRight, Check, Server, Smartphone, Radio } from "lucide-react";

const SERVICES = [
  {
    id: "voip",
    icon: Phone,
    gradient: ["#06b6d4", "#3b82f6"],
    tag: "Voice over IP",
    title: "VoIP Calling",
    subtitle: "HD voice calls worldwide at a fraction of the cost",
    description: "Our VoIP infrastructure delivers crystal-clear, enterprise-grade voice calls over the internet. Whether you're running a call centre, managing a remote team, or just need affordable international calling, VoxDigits VoIP has you covered.",
    features: [
      "HD voice quality with Opus codec",
      "WebRTC browser-based calling",
      "SIP trunk support for PBX systems",
      "Call recording & voicemail with AI transcription",
      "IVR & call routing (coming soon)",
      "99.9% uptime SLA",
    ],
    useCases: ["Remote Teams", "Call Centres", "Customer Support", "International Business"],
    img: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=600&h=400&fit=crop",
    cta: "/Dashboard",
    ctaLabel: "Start Calling",
  },
  {
    id: "virtual-numbers",
    icon: Globe,
    gradient: ["#8b5cf6", "#ec4899"],
    tag: "Virtual Numbers",
    title: "Virtual Phone Numbers",
    subtitle: "Local presence in 150+ countries, instantly",
    description: "Get a real, dedicated phone number in any country within minutes. Receive SMS, voice calls, and manage everything from your VoxDigits dashboard. No SIM card required.",
    features: [
      "Local, mobile & toll-free numbers",
      "Instant provisioning in 150+ countries",
      "SMS & voice enabled",
      "Call forwarding to any number or SIP URI",
      "Custom voicemail greetings",
      "Number porting supported",
    ],
    useCases: ["Businesses Going Global", "Freelancers", "Privacy Protection", "2FA Verification"],
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    cta: "/VirtualNumbers",
    ctaLabel: "Get a Number",
  },
  {
    id: "esim",
    icon: Wifi,
    gradient: ["#10b981", "#06b6d4"],
    tag: "eSIM Data",
    title: "Global eSIM",
    subtitle: "Stay connected abroad with instant data plans",
    description: "Forget expensive roaming bills. VoxDigits eSIM gives you affordable, high-speed data in 150+ countries with instant digital delivery. Compatible with all modern unlocked smartphones.",
    features: [
      "Coverage in 150+ countries",
      "Instant QR code delivery",
      "No physical SIM card needed",
      "Data plans from 1 GB to 50 GB",
      "30-day validity options",
      "Compatible with iOS & Android",
    ],
    useCases: ["Frequent Travelers", "Digital Nomads", "Business Travel", "Backup Connectivity"],
    img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
    cta: "/ESimStore",
    ctaLabel: "Browse eSIM Plans",
  },
];

const COMPARISON = [
  { feature: "Virtual Numbers", voip: true, virtual: true, esim: false },
  { feature: "Inbound Calls", voip: true, virtual: true, esim: false },
  { feature: "Outbound Calls", voip: true, virtual: false, esim: false },
  { feature: "SMS / Messaging", voip: false, virtual: true, esim: false },
  { feature: "Mobile Data", voip: false, virtual: false, esim: true },
  { feature: "Multi-country", voip: true, virtual: true, esim: true },
  { feature: "No Hardware Needed", voip: true, virtual: true, esim: true },
];

export default function Services() {
  const [active, setActive] = useState("voip");
  const svc = SERVICES.find(s => s.id === active);
  const Icon = svc.icon;

  return (
    <div className="min-h-screen bg-[#060f1a] text-white">
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 mb-6">
          <Server className="w-3.5 h-3.5 text-cyan-400" /> Enterprise Telecom Infrastructure
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-5">
          Everything You Need to<br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Communicate Globally</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          One platform for VoIP calling, virtual phone numbers, and international eSIM data. Built for businesses that operate without borders.
        </p>
      </section>

      {/* Service Switcher */}
      <section className="px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit mx-auto mb-10">
            {SERVICES.map(s => {
              const SIcon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active === s.id
                      ? "bg-white text-gray-950 shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <SIcon className="w-4 h-4" />
                  {s.tag}
                </button>
              );
            })}
          </div>

          {/* Detail card */}
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-10 flex flex-col justify-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `linear-gradient(135deg, ${svc.gradient[0]}30, ${svc.gradient[1]}20)`, border: `1px solid ${svc.gradient[0]}40` }}
                >
                  <Icon className="w-6 h-6" style={{ color: svc.gradient[0] }} />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: svc.gradient[0] }}>{svc.tag}</div>
                <h2 className="text-3xl font-extrabold mb-3">{svc.title}</h2>
                <p className="text-gray-300 font-medium mb-3">{svc.subtitle}</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{svc.description}</p>
                <ul className="space-y-2 mb-8">
                  {svc.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: svc.gradient[0] }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mb-8">
                  {svc.useCases.map(u => (
                    <span key={u} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-400">{u}</span>
                  ))}
                </div>
                <Link
                  to={svc.cta}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white w-fit transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${svc.gradient[0]}, ${svc.gradient[1]})` }}
                >
                  {svc.ctaLabel} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative hidden md:block">
                <img src={svc.img} alt={svc.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060f1a]/80 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Compare Services</h2>
          <p className="text-gray-500 text-center mb-10">Find the right product for your use case</p>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Feature</th>
                  {SERVICES.map(s => (
                    <th key={s.id} className="px-6 py-4 text-center">
                      <span className="text-white font-semibold">{s.tag.split(" ")[0]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.015]"}`}>
                    <td className="px-6 py-3.5 text-gray-300">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center">{row.voip ? <Check className="w-4 h-4 text-cyan-400 mx-auto" /> : <span className="text-gray-700">—</span>}</td>
                    <td className="px-6 py-3.5 text-center">{row.virtual ? <Check className="w-4 h-4 text-purple-400 mx-auto" /> : <span className="text-gray-700">—</span>}</td>
                    <td className="px-6 py-3.5 text-center">{row.esim ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-gray-700">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-600/5">
          <Zap className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Start Free Today</h2>
          <p className="text-gray-400 mb-8">No contracts. No hidden fees. Pay only for what you use.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/VirtualNumbers" className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors">
              Get Started <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/Contact" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-medium rounded-xl transition-colors">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}