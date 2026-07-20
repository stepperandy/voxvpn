import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle2, Phone, MessageSquare, Voicemail, Globe, Zap,
  Shield, ChevronRight, Star, Clock, Gift, ArrowRight, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isRunningInIframe } from "@/components/stripe/stripeUtils";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const BUNDLES = [
  {
    country: "United States",
    flag: "🇺🇸",
    code: "US",
    monthly: 6.99,
    annual: 69.99,
    setupFee: 1.99,
    callCredit: 10,
    monthlyPriceId: "price_1TsNKuAj5jZA8C2yVgQSUnOx",
    annualPriceId: "price_1TsNKuAj5jZA8C2yc0Pni81J",
    popular: true,
    tagline: "Best for WhatsApp & OTP",
    features: [
      "Free incoming calls & SMS",
      "Free voicemail included",
      "$10 calling credit included",
      "Instant activation",
    ],
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    code: "CA",
    monthly: 7.99,
    annual: 79.99,
    setupFee: 1.99,
    callCredit: 10,
    monthlyPriceId: "price_1TsNKuAj5jZA8C2y3banmMhQ",
    annualPriceId: "price_1TsNKtAj5jZA8C2yVXiiZ9Sj",
    popular: false,
    tagline: "North American coverage",
    features: [
      "Free incoming calls & SMS",
      "Free voicemail included",
      "$10 calling credit included",
      "Instant activation",
    ],
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    code: "GB",
    monthly: 8.99,
    annual: 89.99,
    setupFee: 1.99,
    callCredit: 10,
    monthlyPriceId: "price_1TsNKuAj5jZA8C2ySUhHdOAX",
    annualPriceId: "price_1TsNKuAj5jZA8C2y5uy7EBp5",
    popular: false,
    tagline: "European presence",
    features: [
      "Free incoming calls & SMS",
      "Free voicemail included",
      "$10 calling credit included",
      "Instant activation",
    ],
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    code: "AU",
    monthly: 9.99,
    annual: 99.99,
    setupFee: 1.99,
    callCredit: 10,
    monthlyPriceId: "price_1TsNKuAj5jZA8C2yF1p8GsLE",
    annualPriceId: "price_1TsNKuAj5jZA8C2ynqItlGxk",
    popular: false,
    tagline: "Asia-Pacific reach",
    features: [
      "Free incoming calls & SMS",
      "Free voicemail included",
      "$10 calling credit included",
      "Instant activation",
    ],
  },
];

const INCLUDED = [
  { icon: Phone, label: "Inbound & outbound calls" },
  { icon: MessageSquare, label: "Two-way SMS messaging" },
  { icon: Voicemail, label: "Voicemail with transcription" },
  { icon: Globe, label: "60+ countries supported" },
  { icon: Zap, label: "Instant activation" },
  { icon: Shield, label: "Encrypted & private" },
];

const FAQS = [
  {
    q: "What's included in the bundle?",
    a: "Every bundle includes your virtual number rental, $10 calling/SMS credit, free voicemail, and free incoming calls and SMS. The setup fee covers number activation.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — no contracts. Cancel your subscription anytime from your dashboard. Your number stays active until the end of your billing period.",
  },
  {
    q: "How does the calling credit work?",
    a: "Your $10 credit is used for outgoing calls and SMS only. Incoming calls and SMS are always free. Top up your wallet anytime from the dashboard.",
  },
  {
    q: "How fast is activation?",
    a: "Instant. Once your payment is confirmed, your number is provisioned and ready to use within minutes — no waiting period.",
  },
];

function BundleCard({ bundle, billingCycle, onBuy, loading }) {
  const price = billingCycle === "annual" ? bundle.annual : bundle.monthly;
  const interval = billingCycle === "annual" ? "yr" : "mo";
  const total = price + bundle.setupFee + bundle.callCredit;
  const savings = billingCycle === "annual"
    ? (bundle.monthly * 12 - bundle.annual).toFixed(2)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl overflow-hidden flex flex-col transition-all ${
        bundle.popular
          ? "border-2 border-purple-500 bg-gradient-to-b from-purple-900/40 to-gray-900/80 shadow-2xl shadow-purple-900/40 lg:scale-105"
          : "border border-white/10 bg-gray-900/60"
      }`}
    >
      {bundle.popular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-center py-1.5">
          <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> MOST POPULAR
          </span>
        </div>
      )}

      <div className={`flex justify-center pt-8 pb-3 ${bundle.popular ? "pt-12" : ""}`}>
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
          {bundle.flag}
        </div>
      </div>

      <h3 className="text-center text-lg font-bold text-white px-4">{bundle.country}</h3>
      <p className="text-center text-xs text-purple-300 mb-4 px-4">{bundle.tagline}</p>

      <div className="px-5">
        <div className="text-center mb-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-extrabold text-white">${price.toFixed(2)}</span>
            <span className="text-gray-400 text-sm">/{interval}</span>
          </div>
          {savings && (
            <p className="text-green-400 text-xs font-semibold mt-1">
              Save ${savings}/yr
            </p>
          )}
        </div>

        <div className="space-y-0 mb-4">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-gray-400">Number rental</span>
            <span className="text-sm font-semibold text-white">${price.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-gray-400">Setup fee</span>
            <span className="text-sm font-semibold text-white">${bundle.setupFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-gray-400">Calling credit</span>
            <span className="text-sm font-semibold text-white">${bundle.callCredit.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-3 bg-purple-500/10 -mx-5 px-5">
            <span className="text-sm font-bold text-white">Bundle total</span>
            <span className="text-lg font-extrabold text-purple-300">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <ul className="px-5 pb-5 space-y-2 flex-1">
        {bundle.features.map((f, j) => (
          <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <div className="px-5 pb-6">
        <button
          onClick={() => onBuy(bundle)}
          disabled={loading === bundle.code}
          className={`w-full py-3 rounded-full font-bold text-sm text-white transition-all disabled:opacity-60 flex items-center justify-center gap-1 ${
            bundle.popular
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40"
              : "bg-[#6B21A8] hover:bg-[#7c2aaf]"
          }`}
        >
          {loading === bundle.code ? "Redirecting..." : "Get This Number"}
          {loading !== bundle.code && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}

export default function PromoLanding() {
  const [loading, setLoading] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  const handleBuy = async (bundle) => {
    if (isRunningInIframe()) {
      alert("Checkout only works from the published app. Please visit voxtelefony.com directly.");
      return;
    }
    setLoading(bundle.code);
    try {
      const priceId = billingCycle === "annual" ? bundle.annualPriceId : bundle.monthlyPriceId;
      const res = await base44.functions.invoke("createCheckout", {
        price_id: priceId,
        country_code: bundle.code,
        include_setup_fee: true,
        success_url: `${window.location.origin}/Dashboard?status=success`,
        cancel_url: `${window.location.origin}/PromoLanding`,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert(res.data?.error || "Checkout session could not be created. Please try again.");
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Navbar />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 mb-6">
              <Gift className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-200">Limited Time Bundle Offer</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
              Your Private Virtual Number
              <span className="block bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                With Everything Included
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Get a virtual number + $10 calling credit + free voicemail in one bundle.
              No contracts. Cancel anytime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#bundles"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full font-bold transition-all shadow-lg shadow-purple-900/40"
              >
                Choose Your Plan <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/Contact"
                className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 hover:bg-white/5 text-white rounded-full font-bold transition-all"
              >
                Talk to Sales
              </Link>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-green-400" /> Instant activation</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-400" /> No contracts</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400" /> Trusted globally</span>
          </motion.div>
        </div>
      </section>

      {/* Bundle Pricing */}
      <section id="bundles" className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Choose Your Bundle</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Pick the country that fits your needs. Every bundle includes the same great features.
            </p>
          </motion.div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-full border border-white/10 bg-gray-900/60 p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === "monthly" ? "bg-[#6B21A8] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === "annual" ? "bg-[#6B21A8] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Annual <span className="text-green-400 text-xs">Save 17%</span>
              </button>
            </div>
          </div>

          {/* Bundle cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BUNDLES.map((bundle) => (
              <BundleCard
                key={bundle.code}
                bundle={bundle}
                billingCycle={billingCycle}
                onBuy={handleBuy}
                loading={loading}
              />
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="px-6 py-16">
        <motion.div
          className="max-w-5xl mx-auto rounded-2xl bg-white/5 border border-white/10 p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Every Bundle Includes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {INCLUDED.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-300 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-white text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                className="rounded-xl bg-white/5 border border-white/10 p-5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="font-semibold text-white mb-2 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-400 pl-6">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16">
        <motion.div
          className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500/30 p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Ready to Get Your Private Number?
          </h2>
          <p className="text-purple-200 mb-6">
            Instant activation. No contracts. Cancel anytime.
          </p>
          <a
            href="#bundles"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-purple-900 rounded-full font-bold transition-all hover:bg-gray-100 shadow-lg"
          >
            Choose Your Plan <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}