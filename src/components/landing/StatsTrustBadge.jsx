import React from "react";
import { motion } from "framer-motion";
import { Globe, ShieldCheck, Lock, Users, Headphones, Clock } from "lucide-react";

const STATS = [
  { value: "100+", label: "Countries Covered", icon: Globe },
  { value: "50K+", label: "Active Users", icon: Users },
  { value: "99.99%", label: "Uptime SLA", icon: Clock },
  { value: "24/7", label: "Support & Monitoring", icon: Headphones },
];

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    title: "End-to-End Encryption",
    desc: "All calls and messages are encrypted in transit and at rest.",
  },
  {
    icon: Lock,
    title: "No-Logs Policy",
    desc: "We never sell or share your communication data with third parties.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    desc: "Virtual numbers and eSIMs available across 100+ countries worldwide.",
  },
];

export default function StatsTrustBadge() {
  return (
    <section className="py-16 px-6 md:px-10" style={{ background: "linear-gradient(180deg, #001a33 0%, #00264d 100%)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="text-center rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(251,146,60,0.15)" }}
            >
              <div className="flex justify-center mb-3">
                <stat.icon className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</div>
              <div className="text-xs md:text-sm text-purple-200/70 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Built on Trust & Security</h2>
          <p className="text-purple-200/70 text-sm md:text-base mt-2 max-w-2xl mx-auto">
            VoxDigits is committed to protecting your privacy and keeping you connected — anywhere in the world.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {TRUST_BADGES.map((badge, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-6 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(251,146,60,0.15)" }}>
                  <badge.icon className="w-7 h-7 text-orange-400" />
                </div>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{badge.title}</h3>
              <p className="text-purple-200/60 text-sm leading-relaxed">{badge.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Company Identity Line */}
        <div className="mt-12 text-center">
          <p className="text-purple-200/50 text-xs md:text-sm">
            🏢 VoxDigits Communications LLC &nbsp;·&nbsp; Founded 2024 &nbsp;·&nbsp; 16809 Capon Tree Ln, Woodbridge, VA 22191, USA &nbsp;·&nbsp; Reg. No. 11986542
          </p>
        </div>
      </div>
    </section>
  );
}