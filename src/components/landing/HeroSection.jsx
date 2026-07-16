import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import { Signal, ChevronDown } from "lucide-react";

const COUNTRY_OPTIONS = [
  { label: "🇺🇸 United States", price: "$6.99/mo", checkoutKey: "US" },
  { label: "🇨🇦 Canada", price: "$7.99/mo", checkoutKey: "CA" },
  { label: "🇬🇧 United Kingdom", price: "$8.99/mo", checkoutKey: "GB" },
  { label: "🇦🇺 Australia", price: "$9.99/mo", checkoutKey: "AU" },
];

export default function HeroSection() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_OPTIONS[0]);
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate(`/VirtualNumbers?country=${selectedCountry.checkoutKey}`);
  };

  return (
    <section className="relative px-6 md:px-10 pt-12 pb-8 max-w-7xl mx-auto overflow-hidden" style={{ background: "transparent" }}>
      {/* VoxDigits Banner */}
      <a
        href="https://voxvpn.net"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 mb-8 px-4 py-3 rounded-2xl text-xs font-semibold transition-all hover:scale-[1.02] group overflow-hidden"
        style={{ background: "linear-gradient(90deg, rgba(251,146,60,0.15), rgba(168,85,247,0.15))", border: "1px solid rgba(251,146,60,0.4)" }}
      >
        <span className="text-orange-400 font-bold tracking-widest uppercase text-xs shrink-0">🔒 VoxVPN</span>
        <span className="text-white/60 text-xs shrink-0">|</span>
        <span className="text-white/80 truncate hidden sm:inline">Global communication, simplified — visit</span>
        <span className="text-white/80 truncate sm:hidden">Secure VPN — visit</span>
        <span className="text-orange-400 font-bold group-hover:underline shrink-0">voxvpn.net</span>
        <span className="text-white/80 shrink-0 hidden sm:inline">for your VPN</span>
        <span className="text-orange-400 shrink-0">→</span>
      </a>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Virtual Phone Numbers<br />
            <span className="text-orange-400">And Global eSIMs</span>
          </h1>
          <p className="text-purple-200 text-base md:text-lg mt-5 max-w-md leading-relaxed">
            Get reliable US, UK & Canada numbers for calls, texts, and SMS verification—powered by a fast, secure, and globally connected network.
          </p>

          <p className="text-purple-300/70 text-sm mt-3 max-w-md">
            Built for customer support, remote teams, international business communication, and global connectivity.
          </p>

          {/* Country Selector + Buy Now */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
            <div className="relative flex-1">
              <select
                value={selectedCountry.checkoutKey}
                onChange={e => setSelectedCountry(COUNTRY_OPTIONS.find(c => c.checkoutKey === e.target.value))}
                className="w-full appearance-none bg-white/15 border border-white/30 text-white px-4 py-3.5 rounded-full font-semibold text-sm focus:outline-none focus:border-orange-400 cursor-pointer"
              >
                {COUNTRY_OPTIONS.map(c => (
                  <option key={c.checkoutKey} value={c.checkoutKey} className="text-gray-900 bg-white">
                    {c.label} — {c.price}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            </div>
            <button
              onClick={handleBuyNow}
              className="bg-orange-500 hover:bg-orange-400 text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-orange-500/30 whitespace-nowrap"
            >
              Get Started →
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <Link to="/Contact" className="border border-white/30 hover:border-white/60 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all">
              Contact Sales
            </Link>
            <Link to="/Dialer" className="border border-orange-400/50 hover:border-orange-400 text-orange-300 hover:text-orange-200 px-6 py-2.5 rounded-full font-bold text-sm transition-all">
              📞 Open Dialer
            </Link>
          </div>

          {/* Mission / Founding / Location trust line */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)" }}>
              <span className="text-orange-400 font-semibold">Founded 2024</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)" }}>
              <span className="text-purple-300 font-semibold">Headquartered in Woodbridge, VA, USA</span>
            </span>
          </div>

          <p className="mt-4 text-purple-200/60 text-sm max-w-md leading-relaxed">
            <span className="text-orange-300 font-semibold">Our Mission:</span> To simplify global communication by providing affordable, secure, and reliable virtual numbers and eSIM connectivity — empowering individuals and businesses to stay connected across borders.
          </p>

          <div className="mt-6 flex items-center gap-4 text-sm text-purple-300">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <img key={i} className="w-8 h-8 rounded-full border-2 border-purple-700 object-cover" src={`https://i.pravatar.cc/100?u=${i+10}`} alt="" />
              ))}
            </div>
            <span>Trusted by <strong className="text-white">50,000+</strong> users worldwide</span>
          </div>
        </motion.div>

        {/* Right - Hero Image */}
         <motion.div
           className="relative hidden lg:flex justify-center items-center"
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.7, delay: 0.2 }}
           style={{ minHeight: "520px" }}
         >
           {/* Glow */}
           <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none" />

           {/* Main hero image — larger */}
           <motion.img
             src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/f9e68261e_generated_image.png"
             alt="Person enjoying a call with telephony elements"
             className="relative z-10 w-80 md:w-[420px] h-auto rounded-3xl shadow-2xl shadow-cyan-500/40 object-cover"
             animate={{ y: [0, -15, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           />

           {/* Corner images — pop in and out */}
           {/* Top-left */}
           <motion.div
             className="absolute top-4 -left-6 z-20 w-28 h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-orange-400/50"
             animate={{ scale: [0.85, 1, 0.85], opacity: [0.7, 1, 0.7], y: [0, -6, 0] }}
             transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
           >
             <img src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200&q=80" alt="Tech" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-transparent" />
             <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white drop-shadow">100+ Countries</div>
           </motion.div>

           {/* Top-right */}
           <motion.div
             className="absolute top-4 -right-6 z-20 w-28 h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-purple-400/50"
             animate={{ scale: [0.85, 1, 0.85], opacity: [0.7, 1, 0.7], y: [0, -6, 0] }}
             transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
           >
             <img src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&q=80" alt="Global" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-transparent" />
             <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white drop-shadow">HD Calls</div>
           </motion.div>

           {/* Bottom-left */}
           <motion.div
             className="absolute bottom-4 -left-6 z-20 w-28 h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-cyan-400/50"
             animate={{ scale: [0.85, 1, 0.85], opacity: [0.7, 1, 0.7], y: [0, 6, 0] }}
             transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
           >
             <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&q=80" alt="eSIM" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-transparent" />
             <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white drop-shadow">eSIM Ready</div>
           </motion.div>

           {/* Bottom-right */}
           <motion.div
             className="absolute bottom-4 -right-6 z-20 w-28 h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-orange-400/50"
             animate={{ scale: [0.85, 1, 0.85], opacity: [0.7, 1, 0.7], y: [0, 6, 0] }}
             transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
           >
             <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80" alt="SMS" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 to-transparent" />
             <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white drop-shadow">SMS & Voice</div>
           </motion.div>
         </motion.div>
      </div>

      {/* World Map + Stats */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-14 relative"
      >
        {/* Map image */}
        <div className="relative rounded-3xl overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(251,146,60,0.15)" }}>
          {/* Glow behind map */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(251,146,60,0.08) 0%, transparent 70%)" }} />
          <img
            src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/3c2b31751_image.png"
            alt="VoxDigits Global Coverage Map"
            className="w-full h-auto object-contain"
            style={{ maxHeight: "420px" }}
          />
        </div>

        {/* Stats overlay is embedded in the map image itself */}
      </motion.div>
    </section>
  );
}