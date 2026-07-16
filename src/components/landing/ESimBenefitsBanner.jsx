import React from "react";
import { Link } from "react-router-dom";

const BENEFITS = [
  {
    icon: "🚫💸",
    title: "Zero Roaming Charges",
    desc: "Pay one flat price upfront — no surprise bills from your home carrier. The eSIM connects as a local plan.",
  },
  {
    icon: "🌐",
    title: "Use With Any App",
    desc: "Stream, browse, and make calls via WhatsApp, FaceTime, or any VoIP app using your local data connection.",
  },
  {
    icon: "✈️",
    title: "Perfect for Travel",
    desc: "Land, activate, and connect instantly. No physical SIM swap needed — works right from your phone settings.",
  },
];

export default function ESimBenefitsBanner() {
  return (
    <section className="py-16 px-4" style={{ background: "linear-gradient(135deg, #1e0a3c 0%, #120827 60%, #1a0a35 100%)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 text-cyan-400" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)" }}>
            ⚡ Why eSIM?
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Stay connected anywhere,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              without the hassle
            </span>
          </h2>
          <p className="text-gray-400 mt-3 text-base max-w-xl mx-auto">
            Data-only plans that give you internet connectivity in 190+ countries — no roaming, no contracts.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {BENEFITS.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-6 flex flex-col items-start gap-3 transition-transform hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <span className="text-4xl">{icon}</span>
              <p className="font-bold text-white text-lg">{title}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/ESimStore"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-gray-950 text-base shadow-lg transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", boxShadow: "0 0 30px rgba(6,182,212,0.3)" }}
          >
            🌍 Browse eSIM Plans →
          </Link>
        </div>
      </div>
    </section>
  );
}