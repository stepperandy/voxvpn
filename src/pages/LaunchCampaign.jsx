import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Rocket, Phone, Wifi, Users, ArrowRight, CheckCircle, Mail,
  TrendingUp, Globe, Zap, Shield, Clock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 border border-orange-400/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
        <span className="text-2xl md:text-3xl font-extrabold text-orange-400 tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-purple-200/60 mt-2 uppercase tracking-wide">{label}</span>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-orange-400/30 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
      <p className="text-purple-200/60 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

export default function LaunchCampaign() {
  // Countdown to 14 days from now
  const [targetDate] = useState(() => {
    const stored = localStorage.getItem("launch_target");
    if (stored) return new Date(parseInt(stored));
    const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    localStorage.setItem("launch_target", d.getTime().toString());
    return d;
  });
  const timeLeft = useCountdown(targetDate);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: "🚀 Welcome to VoxDigits Launch Week!",
        body: `Thank you for joining the VoxDigits launch! Get your virtual number or eSIM at voxtelefony.com today. Launch week special pricing is live now.`,
      });
    } catch (err) {
      console.error("Email send failed:", err);
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden text-white"
      style={{ background: "linear-gradient(135deg, #0d1b2f 0%, #001f3f 50%, #00264d 100%)" }}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-400/30 mb-6"
          >
            <Rocket className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-bold text-xs uppercase tracking-widest">Launch Week</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
          >
            VoxDigits Is Now Live
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              Connect Globally Today
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-purple-200/80 text-base md:text-lg mt-5 max-w-2xl mx-auto leading-relaxed"
          >
            Get your virtual phone number or eSIM data plan in minutes. Whether you're an individual
            needing a second number or an agency managing clients worldwide — we've got you covered.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex justify-center gap-3 md:gap-5 mt-10"
          >
            <CountdownUnit value={timeLeft.days} label="Days" />
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <CountdownUnit value={timeLeft.minutes} label="Mins" />
            <CountdownUnit value={timeLeft.seconds} label="Secs" />
          </motion.div>

          {/* Dual CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
          >
            <Link
              to="/VirtualNumbers"
              className="group flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-full font-bold text-base transition-all shadow-lg shadow-orange-500/30"
            >
              <Phone className="w-5 h-5" />
              Buy a Virtual Number
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/ESimStore"
              className="group flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white px-8 py-4 rounded-full font-bold text-base transition-all shadow-lg shadow-purple-500/30"
            >
              <Wifi className="w-5 h-5" />
              Get an eSIM Plan
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Audience Split Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* For Individuals */}
          <div className="bg-white/5 border border-orange-400/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center">
                <Phone className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">For Individuals</h3>
            </div>
            <p className="text-purple-200/70 text-sm mb-5">
              Get a second phone number for verification, privacy, or international calls.
              Buy a data eSIM for your next trip abroad.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "US, UK, Canada & Australia numbers from $4.99/mo",
                "Instant eSIM activation in 100+ countries",
                "SMS verification & voice calling",
                "No contracts — cancel anytime",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-purple-100">
                  <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/VirtualNumbers"
              className="flex items-center justify-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 text-orange-300 px-6 py-3 rounded-full font-bold text-sm transition-all"
            >
              Get Your Number <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* For Agencies */}
          <div className="bg-white/5 border border-purple-400/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">For Agencies & Resellers</h3>
            </div>
            <p className="text-purple-200/70 text-sm mb-5">
              Manage multiple client numbers from one dashboard. Wholesale pricing, bulk provisioning,
              and revenue tracking built in.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Bulk number provisioning & management",
                "Custom markup & pricing control",
                "Client subscription dashboard & revenue tracking",
                "Reseller onboarding & approval workflow",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-purple-100">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/ApplicationForm"
              className="flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 px-6 py-3 rounded-full font-bold text-sm transition-all"
            >
              Become a Reseller <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Built for Global Communication</h2>
        <p className="text-purple-200/60 text-center text-sm mb-8">Everything you need to stay connected, anywhere</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCard icon={Globe} title="100+ Countries" desc="Numbers and eSIM coverage worldwide" color="bg-cyan-500/15 text-cyan-400" />
          <FeatureCard icon={Zap} title="Instant Activation" desc="Get your number or eSIM in minutes" color="bg-orange-500/15 text-orange-400" />
          <FeatureCard icon={Shield} title="Secure & Private" desc="Your data and calls are protected" color="bg-green-500/15 text-green-400" />
          <FeatureCard icon={TrendingUp} title="Best Value" desc="Launch week pricing — save big" color="bg-purple-500/15 text-purple-400" />
        </div>
      </div>

      {/* Email Capture */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-400/20 rounded-3xl p-8 text-center">
          <Mail className="w-10 h-10 text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Get Launch Updates & Exclusive Offers</h3>
          <p className="text-purple-200/60 text-sm mb-6">
            Subscribe to receive launch announcements, new country availability, and subscriber-only deals.
          </p>
          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
              <CheckCircle className="w-5 h-5" />
              You're subscribed! Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/10 border border-white/20 text-white px-4 py-3 rounded-full text-sm focus:outline-none focus:border-orange-400 placeholder:text-white/40"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap disabled:opacity-50"
              >
                {submitting ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <Clock className="w-8 h-8 text-orange-400 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-3">Launch Week Pricing Ends Soon</h2>
        <p className="text-purple-200/60 text-sm mb-6">Don't miss out — get your number or eSIM at launch pricing today.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/VirtualNumbers"
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-orange-500/30"
          >
            <Phone className="w-5 h-5" /> Buy a Number
          </Link>
          <Link
            to="/ESimStore"
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-purple-500/30"
          >
            <Wifi className="w-5 h-5" /> Get an eSIM
          </Link>
        </div>
      </div>
    </div>
  );
}