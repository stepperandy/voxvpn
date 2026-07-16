import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Rocket, X, Wifi, Phone, ArrowRight } from "lucide-react";

export default function LaunchBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("launch_banner_dismissed") === "1");

  const handleDismiss = () => {
    localStorage.setItem("launch_banner_dismissed", "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-50"
      style={{
        background: "linear-gradient(90deg, rgba(249,115,22,0.2) 0%, rgba(168,85,247,0.2) 100%)",
        borderBottom: "1px solid rgba(251,146,60,0.3)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Rocket className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-white font-bold text-sm">🚀 Launch Week is Live!</span>
            <span className="text-purple-200/80 text-sm hidden sm:inline ml-2">
              Get a virtual number or eSIM and start connecting globally today.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/VirtualNumbers"
            className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white px-4 py-1.5 rounded-full font-bold text-xs transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            Buy a Number
          </Link>
          <Link
            to="/ESimStore"
            className="hidden sm:flex items-center gap-1.5 bg-purple-500 hover:bg-purple-400 text-white px-4 py-1.5 rounded-full font-bold text-xs transition-all"
          >
            <Wifi className="w-3.5 h-3.5" />
            Get eSIM
          </Link>
          <Link
            to="/LaunchCampaign"
            className="flex items-center gap-1 border border-white/30 hover:border-white/60 text-white px-3 py-1.5 rounded-full font-semibold text-xs transition-all whitespace-nowrap"
          >
            Learn More <ArrowRight className="w-3 h-3" />
          </Link>
          <button onClick={handleDismiss} className="p-1 text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}