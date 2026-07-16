import React, { useState } from "react";
import {
  Smartphone, QrCode, CheckCircle2, AlertCircle,
  Wifi, Phone, ChevronDown, Info, ArrowRight, Shield, Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const OS_STEPS = {
  ios: {
    label: "iPhone / iOS",
    icon: "🍎",
    color: "#06b6d4",
    qr: [
      { title: "Open Settings", detail: "Launch the Settings app on your iPhone." },
      { title: "Go to Cellular", detail: "Tap Cellular (or Mobile Data), then tap Add Cellular Plan." },
      { title: "Scan QR Code", detail: "Tap Use QR Code and point your camera at the eSIM QR code provided in your dashboard." },
      { title: "Confirm Activation", detail: "Tap Continue when prompted to add the plan." },
      { title: "Name Your Plan", detail: "Label it something like 'VoxDigits Data' and tap Done." },
      { title: "Enable the Line", detail: "Go to Cellular → select your new plan → toggle Turn On This Line." },
    ],
    manual: [
      { title: "Open Settings", detail: "Launch Settings → Cellular → Add Cellular Plan." },
      { title: "Choose Manual Entry", detail: "Tap Enter Details Manually at the bottom of the screen." },
      { title: "Enter SM-DP+ Address", detail: "Copy and paste the SM-DP+ Address from your eSIM dashboard." },
      { title: "Enter Activation Code", detail: "Enter the Activation Code / Matching ID from your dashboard." },
      { title: "Tap Next", detail: "Follow the on-screen prompts to complete activation." },
    ],
  },
  android: {
    label: "Android",
    icon: "🤖",
    color: "#8b5cf6",
    qr: [
      { title: "Open Settings", detail: "Launch the Settings app on your Android device." },
      { title: "Navigate to Network", detail: "Go to Network & Internet → SIM cards (or Mobile network on some devices)." },
      { title: "Add eSIM", detail: "Tap Add eSIM or Download a SIM instead." },
      { title: "Scan QR Code", detail: "Tap Scan QR code and point your camera at the eSIM QR code from your dashboard." },
      { title: "Follow Prompts", detail: "Accept the on-screen instructions to download and install the profile." },
      { title: "Set as Data SIM", detail: "When prompted, set the eSIM as your preferred SIM for mobile data." },
    ],
    manual: [
      { title: "Open Settings", detail: "Settings → Network & Internet → SIM cards." },
      { title: "Add eSIM", detail: "Tap Add eSIM → then Enter activation code manually." },
      { title: "Paste LPA Code", detail: "Copy and paste the full LPA Activation Code from your eSIM dashboard." },
      { title: "Activate", detail: "Tap Activate and wait a few moments for the profile to download." },
    ],
  },
  samsung: {
    label: "Samsung Galaxy",
    icon: "📱",
    color: "#10b981",
    qr: [
      { title: "Open Settings", detail: "Launch Settings on your Samsung Galaxy device." },
      { title: "Go to Connections", detail: "Tap Connections → SIM manager." },
      { title: "Add eSIM", detail: "Tap Add eSIM." },
      { title: "Scan QR Code", detail: "Choose Scan QR code and point your camera at your eSIM QR code." },
      { title: "Confirm Download", detail: "Tap Confirm to download the eSIM profile to your device." },
      { title: "Enable Plan", detail: "Once downloaded, toggle the plan on in SIM manager." },
    ],
    manual: [
      { title: "Open Settings", detail: "Settings → Connections → SIM manager → Add eSIM." },
      { title: "Enter Code", detail: "Tap Scan QR code → then Enter activation code." },
      { title: "Paste Activation Code", detail: "Paste the LPA Activation Code from your dashboard." },
      { title: "Confirm", detail: "Tap Add and wait for the profile to finish downloading." },
    ],
  },
};

const TROUBLESHOOTING = [
  {
    issue: "QR code won't scan",
    solutions: [
      "Ensure good lighting and hold the phone steady over the code.",
      "Try the Manual Entry method instead — paste the LPA code directly.",
      "Clean your camera lens and increase screen brightness of the QR source.",
    ],
  },
  {
    issue: "eSIM option not visible in Settings",
    solutions: [
      "Confirm your device supports eSIM (iPhone XS or later, most 2020+ Androids).",
      "Update your device to the latest operating system version.",
      "Verify your device is carrier-unlocked — locked devices cannot add eSIMs.",
    ],
  },
  {
    issue: "Activation is stuck or pending",
    solutions: [
      "Wait up to 10 minutes — initial provisioning can take time.",
      "Toggle Airplane Mode on for 10 seconds, then turn it off.",
      "Restart your device and re-check Cellular / SIM settings.",
    ],
  },
  {
    issue: "No data connection after activation",
    solutions: [
      "Go to Settings → Cellular and confirm the eSIM is set as your data SIM.",
      "Enable Data Roaming for the eSIM plan in Cellular settings.",
      "iOS APN: Settings → Cellular → your eSIM → Cellular Data Network → APN: airalo",
      "Android APN: Settings → Network → Mobile Networks → Access Point Names → Add: Name: Airalo, APN: airalo",
    ],
  },
];

const PREREQS = [
  { icon: <Wifi className="w-5 h-5" />, title: "Active WiFi", desc: "Stay connected during installation", color: "cyan" },
  { icon: <Phone className="w-5 h-5" />, title: "Unlocked Device", desc: "Must be carrier-unlocked", color: "purple" },
  { icon: <Shield className="w-5 h-5" />, title: "eSIM Compatible", desc: "iPhone XS+ or 2020+ Android", color: "green" },
  { icon: <Zap className="w-5 h-5" />, title: "5–10 Minutes", desc: "Activation takes a moment", color: "orange" },
];

export default function ESimGuide() {
  const [os, setOs] = useState("ios");
  const [mode, setMode] = useState("qr");
  const [activeStep, setActiveStep] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const osConfig = OS_STEPS[os];
  const currentSteps = mode === "qr" ? osConfig.qr : osConfig.manual;

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)" }}>
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", color: "#67e8f9" }}>
            <Smartphone className="w-3.5 h-3.5" /> eSIM Installation Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Activate Your eSIM in<br /><span style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Minutes</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Follow the step-by-step guide below for your device. Scan a QR code or enter your credentials manually.
          </p>
        </div>

        {/* Prerequisites */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {PREREQS.map(({ icon, title, desc, color }) => (
            <div key={title} className={`p-4 rounded-2xl bg-${color}-500/10 border border-${color}-500/20`}>
              <div className={`text-${color}-400 mb-2`}>{icon}</div>
              <p className={`text-sm font-bold text-${color}-300`}>{title}</p>
              <p className={`text-xs text-${color}-400/70 mt-0.5`}>{desc}</p>
            </div>
          ))}
        </div>

        {/* OS Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">1. Select Your Device</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(OS_STEPS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setOs(key); setActiveStep(null); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-semibold transition-all border ${
                  os === key
                    ? "border-transparent text-gray-950"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                style={os === key ? { background: `linear-gradient(135deg, ${val.color}, #8b5cf6)` } : {}}
              >
                <span className="text-2xl">{val.icon}</span>
                <span>{val.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Method Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">2. Choose Activation Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "qr", label: "Scan QR Code", icon: <QrCode className="w-5 h-5" />, desc: "Recommended — fastest method" },
              { id: "manual", label: "Manual Entry", icon: <Info className="w-5 h-5" />, desc: "Type or paste the activation code" },
            ].map(({ id, label, icon, desc }) => (
              <button
                key={id}
                onClick={() => { setMode(id); setActiveStep(null); }}
                className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-all border ${
                  mode === id
                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/8"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${mode === id ? "bg-cyan-500/20" : "bg-white/8"}`}>
                  {icon}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">3. Follow the Steps</h2>
          <div className="space-y-3">
            {currentSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(activeStep === idx ? null : idx)}
                className={`w-full text-left rounded-2xl p-4 transition-all border ${
                  activeStep === idx
                    ? "border-cyan-500/40 bg-cyan-500/10"
                    : "border-white/8 bg-white/5 hover:bg-white/8"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 text-white"
                    style={{ background: activeStep === idx ? `linear-gradient(135deg, ${osConfig.color}, #8b5cf6)` : "rgba(255,255,255,0.1)" }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${activeStep === idx ? "text-cyan-300" : "text-white"}`}>{step.title}</p>
                    {activeStep === idx && (
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed">{step.detail}</p>
                    )}
                  </div>
                  {activeStep === idx
                    ? <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    : <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  }
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center">Tap each step to expand its details</p>
        </div>

        {/* QR Code Note */}
        {mode === "qr" && (
          <div className="mb-10 rounded-2xl p-5 flex items-start gap-4" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <QrCode className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm mb-1">Where is my QR Code?</p>
              <p className="text-gray-400 text-sm">Your personal eSIM QR code is available in your <Link to="/ESimDashboard" className="text-cyan-400 underline">eSIM Dashboard</Link>. Click on your active plan and select "View QR Code" to display it.</p>
            </div>
          </div>
        )}

        {/* Troubleshooting */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Troubleshooting</h2>
          <div className="space-y-2">
            {TROUBLESHOOTING.map((item, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="font-semibold text-white text-sm text-left">{item.issue}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${expanded === idx ? "rotate-180" : ""}`} />
                </button>
                {expanded === idx && (
                  <div className="px-4 pb-4 border-t border-white/5">
                    <ul className="space-y-2 pt-3">
                      {item.solutions.map((s, si) => (
                        <li key={si} className="flex gap-2 text-sm text-gray-400">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(6,182,212,0.2)" }}>
          <h3 className="text-lg font-bold text-white mb-2">Ready to Get Your eSIM?</h3>
          <p className="text-gray-400 text-sm mb-5">Browse global data plans starting from just $4.50. Instant delivery, no contracts.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/ESimStore" className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-950 transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
              Browse eSIM Plans
            </Link>
            <Link to="/DeviceCompatibility" className="px-6 py-2.5 rounded-xl font-bold text-sm text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/10 transition-colors">
              Check Device Compatibility
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}