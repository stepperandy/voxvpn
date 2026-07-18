import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Phone, MessageSquare, Voicemail, Globe, Zap, Shield, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { isRunningInIframe } from "@/components/stripe/stripeUtils";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PaymentMethodsDisplay from "@/components/checkout/PaymentMethodsDisplay";

const PLANS = [
  {
    country: "United States",
    flag: "🇺🇸",
    code: "US",
    monthly: 6.99,
    annual: 69.99,
    setupFee: 1.99,
    monthlyPriceId: "price_1TsNKuAj5jZA8C2yVgQSUnOx",
    annualPriceId: "price_1TsNKuAj5jZA8C2yc0Pni81J",
    annualSavings: 17,
    usageRate: 0.03,
    features: [
      "Free incoming calls & SMS",
      "Free Voicemail included",
      "Instant Activation",
    ],
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    code: "CA",
    monthly: 7.99,
    annual: 79.99,
    setupFee: 1.99,
    monthlyPriceId: "price_1TsNKuAj5jZA8C2y3banmMhQ",
    annualPriceId: "price_1TsNKtAj5jZA8C2yVXiiZ9Sj",
    annualSavings: 17,
    usageRate: 0.04,
    features: [
      "Free incoming calls & SMS",
      "Free Voicemail included",
      "Instant Activation",
    ],
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    code: "GB",
    monthly: 8.99,
    annual: 89.99,
    setupFee: 1.99,
    monthlyPriceId: "price_1TsNKuAj5jZA8C2ySUhHdOAX",
    annualPriceId: "price_1TsNKuAj5jZA8C2y5uy7EBp5",
    annualSavings: 17,
    usageRate: 0.05,
    features: [
      "Free incoming calls & SMS",
      "Free Voicemail included",
      "Instant Activation",
    ],
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    code: "AU",
    monthly: 9.99,
    annual: 99.99,
    setupFee: 1.99,
    monthlyPriceId: "price_1TsNKuAj5jZA8C2yF1p8GsLE",
    annualPriceId: "price_1TsNKuAj5jZA8C2ynqItlGxk",
    annualSavings: 17,
    usageRate: 0.06,
    features: [
      "Free incoming calls & SMS",
      "Free Voicemail included",
      "Instant Activation",
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

function PricingCard({ plan, billingCycle, onBuy, loading }) {
  const price = billingCycle === "annual" ? plan.annual : plan.monthly;
  const interval = billingCycle === "annual" ? "year" : "month";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur overflow-hidden flex flex-col"
    >
      {/* Flag */}
      <div className="flex justify-center pt-8 pb-3">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
          {plan.flag}
        </div>
      </div>

      {/* Country name */}
      <h3 className="text-center text-lg font-bold text-white px-4 mb-4">{plan.country}</h3>

      {/* Price rows */}
      <div className="px-5 space-y-0">
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-sm text-gray-400">{billingCycle === "annual" ? "Annual" : "Monthly"}</span>
          <span className="text-sm font-semibold text-white">
            ${(billingCycle === "annual" ? plan.annual : plan.monthly).toFixed(2)}
            <span className="text-gray-500 text-xs">/{billingCycle === "annual" ? "yr" : "mo"}</span>
          </span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-sm text-gray-400">Setup Fee</span>
          <span className="text-sm font-semibold text-white">${plan.setupFee.toFixed(2)} <span className="text-gray-500 text-xs">one-time</span></span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-sm text-gray-400">Calling & SMS Credit</span>
          <span className="text-sm font-semibold text-white">$10.00 <span className="text-gray-500 text-xs">one-time</span></span>
        </div>
        <div className="flex items-center justify-between py-3 bg-purple-500/10 -mx-5 px-5 border-b border-white/5">
          <span className="text-sm font-bold text-white">Total First Payment</span>
          <span className="text-lg font-extrabold text-purple-300">
            ${((billingCycle === "annual" ? plan.annual : plan.monthly) + plan.setupFee + 10).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="px-5 py-5 space-y-2.5 flex-1">
        {plan.features.map((f, j) => (
          <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
        <li className="flex items-start gap-2 text-xs text-purple-300/80 bg-purple-500/5 rounded-lg p-2.5">
          <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          $10 credit covers ~{Math.floor(10 / (plan.usageRate || 0.03))} outgoing calls or SMS
        </li>
      </ul>

      {/* Button */}
      <div className="px-5 pb-6">
        <button
          onClick={() => onBuy(plan)}
          disabled={loading === plan.code}
          className="w-full py-3 rounded-full font-bold text-sm text-white bg-[#6B21A8] hover:bg-[#7c2aaf] transition-all shadow-lg shadow-purple-900/40 disabled:opacity-60 flex items-center justify-center gap-1"
        >
          {loading === plan.code ? "Loading..." : "Learn more"}
          {loading !== plan.code && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [currencyPreview, setCurrencyPreview] = useState(null);

  useEffect(() => {
    const amounts = {};
    PLANS.forEach(p => { amounts[p.code] = Math.round(p.monthly * 100); });
    base44.functions.invoke("getCurrencyPreview", { amounts })
      .then(res => setCurrencyPreview(res.data))
      .catch(() => {});
  }, []);

  const handleBuy = async (plan) => {
    if (isRunningInIframe()) {
      alert("Checkout only works from the published app. Please visit voxdigits.com directly.");
      return;
    }
    setLoading(plan.code);
    try {
      const priceId = billingCycle === "annual" ? plan.annualPriceId : plan.monthlyPriceId;
      const res = await base44.functions.invoke("createCheckout", {
        price_id: priceId,
        country_code: plan.code,
        include_setup_fee: true,
        success_url: `${window.location.origin}/Dashboard?status=success`,
        cancel_url: `${window.location.origin}/Pricing`,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Navbar />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Number rental pricing. Calls and outgoing SMS charged separately from account credit.
          </p>
          {currencyPreview && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-xs text-gray-500">
                Detected location: {currencyPreview.country} · Prices shown in {currencyPreview.currency.toUpperCase()}
              </p>
              <PaymentMethodsDisplay currencyPreview={currencyPreview} />
            </div>
          )}
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.code}
              plan={plan}
              billingCycle={billingCycle}
              onBuy={handleBuy}
              loading={loading}
            />
          ))}
        </div>

        {/* Usage Rates */}
        <motion.div
          className="rounded-2xl bg-white/5 border border-white/10 p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-white text-center mb-2">Pay-As-You-Go Usage Rates</h2>
          <p className="text-gray-400 text-sm text-center mb-8">
            Calls and SMS are deducted from your wallet credit in real time. Incoming calls & SMS are free.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Country</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Outbound Calls</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Outbound SMS</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">International</th>
                </tr>
              </thead>
              <tbody>
                {PLANS.map((plan) => (
                  <tr key={plan.code} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white font-medium">{plan.flag} {plan.country}</td>
                    <td className="text-right py-3 px-4 text-gray-300">${plan.usageRate.toFixed(2)}/min</td>
                    <td className="text-right py-3 px-4 text-gray-300">${plan.usageRate.toFixed(2)}/SMS</td>
                    <td className="text-right py-3 px-4 text-gray-400 text-xs">Provider cost + 40%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <p className="text-sm text-purple-200 text-center">
              <Zap className="w-4 h-4 inline mr-1" />
              Your $10 wallet credit is used for calls and SMS only — it is not a service fee.
              When your balance runs low, outgoing calls and SMS are blocked but your number stays active.
            </p>
          </div>
        </motion.div>

        {/* What's Included */}
        <motion.div
          className="rounded-2xl bg-white/5 border border-white/10 p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">Everything Included in Every Plan</h2>
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

        {/* Non-Refundable Policy */}
        <motion.div
          className="rounded-2xl bg-yellow-500/5 border border-yellow-500/20 p-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Important Policy Notice
          </h3>
          <div className="space-y-2 text-sm text-yellow-200/80">
            <p>• <strong>Non-Refundable:</strong> Setup fees, activated subscriptions, and used calling/SMS credit are non-refundable.</p>
            <p>• <strong>Number Loss:</strong> If your subscription is not renewed within 30 days of the renewal date, your number may be permanently reassigned to another user. You can reclaim the same number if you renew before reassignment.</p>
            <p>• <strong>Third-Party Compatibility:</strong> OTP (one-time passwords) and WhatsApp verification compatibility is <strong>not guaranteed</strong>. Use your virtual number with third-party services at your own risk.</p>
            <p>• <strong>Grace Period:</strong> If a renewal payment fails, you have 3 days before outgoing service is suspended (incoming stays active) and 17 days before your number is archived and released.</p>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">Not sure which plan to choose?</p>
          <Link to="/Contact" className="inline-flex items-center gap-2 px-8 py-3 bg-[#6B21A8] hover:bg-[#7c2aaf] text-white rounded-full font-bold transition-all shadow-lg shadow-purple-900/40">
            Talk to Sales
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}