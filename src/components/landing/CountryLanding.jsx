import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, Phone, MessageSquare, Voicemail, Zap, Shield, Globe, ChevronRight, Building2, Briefcase, User } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const USE_CASES = [
  { icon: User, title: "Personal Use", desc: "Keep your real number private when signing up online or listing items for sale." },
  { icon: Briefcase, title: "Business & Remote Work", desc: "Establish a local presence without a physical office in the country." },
  { icon: Building2, title: "Verification & OTPs", desc: "Receive SMS verification codes for online accounts and app registrations." },
];

const FAQ_ITEMS = [
  { q: "How fast is activation?", a: "Your virtual phone number is activated instantly after checkout. You can start receiving calls and SMS within minutes — no waiting for a physical SIM card." },
  { q: "Can I receive SMS verification codes?", a: "Yes. Your virtual number supports inbound SMS, including OTP and verification codes from online services, banking apps, and social platforms." },
  { q: "Do I need a SIM card or special hardware?", a: "No. VoxDigits virtual numbers work entirely through our app and web dashboard. There's no physical SIM or extra device required." },
  { q: "Can I cancel anytime?", a: "Absolutely. There are no long-term contracts. You can cancel your subscription at any time from your dashboard, no questions asked." },
  { q: "Is my number private?", a: "Yes. Each number is dedicated to you alone — never shared. All communications are encrypted and your data is never sold to third parties." },
];

export default function CountryLanding({ data }) {
  const { country, countryCode, flag, slug, monthlyPrice, annualPrice, setupFee, monthlyPriceId, annualPriceId } = data;

  useEffect(() => {
    document.title = `Virtual Phone Number for ${country} | VoxDigits — $${monthlyPrice}/mo`;
    const setMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", `Get a virtual ${country} phone number from $${monthlyPrice}/mo. Receive calls & SMS, verify accounts, and establish a local presence. Instant activation, no contracts. Buy online at VoxDigits.`);
    setMeta("keywords", `${country} virtual phone number, buy ${country} phone number online, ${country} VoIP number, ${country} phone number for verification, virtual number ${country}, ${country} calling number, get ${country} number`);
    setMeta("og:title", `Virtual Phone Number for ${country} | VoxDigits`, "property");
    setMeta("og:description", `Get a virtual ${country} phone number from $${monthlyPrice}/mo. Instant activation, SMS & voice enabled.`, "property");

    // JSON-LD structured data
    const scriptId = `country-ld-${slug}`;
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `Virtual Phone Number — ${country}`,
      "description": `Dedicated virtual ${country} phone number with SMS and voice calling. Instant activation.`,
      "brand": { "@type": "Brand", "name": "VoxDigits" },
      "offers": {
        "@type": "Offer",
        "price": monthlyPrice.toFixed(2),
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": `https://voxtelefony.com/${slug}`
      }
    });
    document.head.appendChild(script);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [country, monthlyPrice, slug]);

  const features = data.features || [
    "Free incoming calls & SMS",
    "Free Voicemail included",
    "Instant activation — no SIM needed",
    "Dedicated number — never shared",
    "Call forwarding to any device",
    "Encrypted & private",
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0d1b2f 0%, #001f3f 50%, #00264d 100%)" }}>
      <div className="hidden md:block" style={{ background: "linear-gradient(160deg, #0a2342 0%, #001a33 50%, #001f4d 100%)" }}>
        <Navbar />
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-6xl mb-4">{flag}</div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            Virtual Phone Number for {country}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Get a dedicated {country} phone number from <span className="text-cyan-400 font-bold">${monthlyPrice}/mo</span>.
            Receive calls and SMS, verify accounts, and establish a local presence — no SIM card, no contracts, instant activation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`/Pricing`}
              className="px-8 py-3 bg-[#6B21A8] hover:bg-[#7c2aaf] rounded-full font-bold text-sm shadow-lg shadow-purple-900/40 transition-all"
            >
              Get Your {country} Number →
            </a>
            <Link
              to="/Contact"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold text-sm border border-white/20 transition-all"
            >
              Talk to Sales
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Pricing card */}
      <section className="max-w-md mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur overflow-hidden"
        >
          <div className="flex justify-center pt-8 pb-3">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
              {flag}
            </div>
          </div>
          <h3 className="text-center text-lg font-bold mb-4">{country} Virtual Number</h3>
          <div className="px-5">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-sm text-gray-400">Monthly</span>
              <span className="text-sm font-semibold">${monthlyPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-sm text-gray-400">Annual</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">${annualPrice.toFixed(2)}</span>
                <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                  Save {Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-sm text-gray-400">Setup Fee</span>
              <span className="text-sm font-semibold">${setupFee.toFixed(2)} <span className="text-gray-500 text-xs">one-time</span></span>
            </div>
          </div>
          <ul className="px-5 py-5 space-y-2.5">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <div className="px-5 pb-6">
            <Link
              to="/Pricing"
              className="w-full py-3 rounded-full font-bold text-sm bg-[#6B21A8] hover:bg-[#7c2aaf] transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-1"
            >
              Learn more <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Use cases */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Why Get a {country} Virtual Number?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USE_CASES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
          <h2 className="text-2xl font-bold text-center mb-8">What's Included with Every {country} Number</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: Phone, label: "Inbound & outbound calls" },
              { icon: MessageSquare, label: "Two-way SMS messaging" },
              { icon: Voicemail, label: "Voicemail with transcription" },
              { icon: Globe, label: "Works internationally" },
              { icon: Zap, label: "Instant activation" },
              { icon: Shield, label: "Encrypted & private" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-300 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          {country} Virtual Number — Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map(({ q, a }) => (
            <div key={q} className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="font-semibold mb-2 text-white">{q}</h3>
              <p className="text-sm text-gray-400">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Get Your {country} Phone Number?
        </h2>
        <p className="text-gray-400 mb-6">Activate in minutes. No contracts, cancel anytime.</p>
        <Link
          to="/Pricing"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#6B21A8] hover:bg-[#7c2aaf] text-white rounded-full font-bold transition-all shadow-lg shadow-purple-900/40"
        >
          Get Started <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}