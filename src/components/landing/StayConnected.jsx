import React from "react";
import { motion } from "framer-motion";
import { Globe, MessageSquare, Wifi, Shield, Phone, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const features = [
  { icon: Phone, label: "Make & Receive Calls", desc: "Full WebRTC calling built-in" },
  { icon: MessageSquare, label: "SMS Inbox", desc: "Send & receive messages" },
  { icon: Globe, label: "100+ Countries", desc: "Virtual numbers + data worldwide" },
  { icon: Wifi, label: "eSIM Data Plans", desc: "4G/5G data for your travels" },
  { icon: Shield, label: "Private & Secure", desc: "Your real number stays hidden" },
  { icon: Zap, label: "Instant Setup", desc: "Active in seconds" },
];

export default function StayConnected() {
  return (
    <section className="relative py-24 px-4 md:px-8 overflow-hidden" style={{ background: "linear-gradient(180deg, #120827 0%, #1a0a35 100%)" }}>
      {/* Background glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-700 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500 rounded-full blur-[100px] opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/5 border border-white/10 text-cyan-400 mb-5">
            Stay Connected, Anywhere
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            Global Numbers &{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              eSIM Plans
            </span>
            <br />in One Place
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
            Get instant virtual numbers from 100+ countries, send SMS, make calls, and activate travel eSIMs — all from a single app.
          </p>
        </motion.div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Feature grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                className="group relative rounded-2xl p-5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-white font-semibold text-sm mb-1">{label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Phone mockup + CTAs */}
          <motion.div
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Phone */}
            <div className="relative">
              {/* Glow ring behind phone */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500 blur-2xl opacity-30 scale-110" />

              {/* Phone frame */}
              <div
                className="relative w-52 rounded-[2.4rem] p-[3px] shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #22d3ee, #a855f7, #ec4899)",
                }}
              >
                <div className="w-full bg-[#080c18] rounded-[2.2rem] overflow-hidden" style={{ aspectRatio: "9/19" }}>
                  {/* Dynamic island / notch */}
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-20 h-5 bg-black rounded-full" />
                  </div>

                  {/* Screen content */}
                  <div className="flex flex-col items-center px-4 pt-4 pb-6 h-full">
                    {/* Status bar dots */}
                    <div className="flex gap-1.5 mb-5 self-end pr-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    </div>

                    {/* Logo */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-purple-900/50">
                      <Wifi className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-white font-bold text-base mb-0.5">VoxDigits</p>
                    <p className="text-gray-500 text-[10px] mb-5">Stay connected globally</p>

                    {/* Dialer mockup */}
                    <div className="w-full space-y-2 mb-4">
                      {/* Dial display */}
                      <div className="flex items-center justify-center px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="font-mono text-cyan-400 text-sm tracking-widest font-light">+1 (212) 555-0198</span>
                      </div>
                      {/* Mini keypad */}
                      <div className="grid grid-cols-3 gap-1">
                        {["1","2","3","4","5","6","7","8","9"].map(k => (
                          <div key={k} className="h-7 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center">
                            <span className="text-white text-xs font-light">{k}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call button */}
                    <div className="w-full flex items-center justify-between px-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
                        <span className="text-emerald-400 text-[9px] font-medium">Ready</span>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", boxShadow: "0 4px 16px rgba(6,182,212,0.5)" }}>
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <Link
                      to={createPageUrl("Dialer")}
                      className="w-full text-center py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-xs hover:opacity-90 transition-opacity"
                    >
                      Try the Dialer
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 text-center">
              {[
                { value: "100+", label: "Countries" },
                { value: "HD", label: "Voice Quality" },
                { value: "∞", label: "Numbers" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}