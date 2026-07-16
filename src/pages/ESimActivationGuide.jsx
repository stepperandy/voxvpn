import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import QRCode from "qrcode";
import {
  ArrowLeft, Smartphone, QrCode, CheckCircle2, AlertCircle,
  Zap, Phone, Wifi, ChevronDown, Copy, Download, Loader2, Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Per-OS activation instructions
const OS_STEPS = {
  ios: {
    label: "iPhone / iOS",
    icon: "🍎",
    qr: [
      "Open **Settings** on your iPhone",
      "Tap **Cellular** → **Add Cellular Plan**",
      "Tap **Use QR Code** and scan the code below",
      "Tap **Continue** when prompted",
      "Name the plan (e.g. 'VoxDigits Data') and tap **Done**",
      "Go to **Cellular** → select your new plan → enable **Turn On This Line**",
    ],
    manual: [
      "Open **Settings** → **Cellular** → **Add Cellular Plan**",
      "Tap **Enter Details Manually**",
      "Enter the **SM-DP+ Address** and **Activation Code** from below",
      "Tap **Next** and follow on-screen prompts",
    ],
  },
  android: {
    label: "Android",
    icon: "🤖",
    qr: [
      "Open **Settings** on your Android device",
      "Go to **Network & Internet** (or **Connections**) → **SIM cards** or **Mobile network**",
      "Tap **Add eSIM** or **Download a SIM instead**",
      "Tap **Scan QR code** and scan the code below",
      "Follow on-screen instructions to activate",
      "Set as preferred SIM for mobile data when prompted",
    ],
    manual: [
      "Open **Settings** → **Network & Internet** → **SIM cards**",
      "Tap **Add eSIM** → **Enter activation code manually**",
      "Type or paste the **LPA Activation Code** from below",
      "Tap **Activate** and wait for confirmation",
    ],
  },
  samsung: {
    label: "Samsung Galaxy",
    icon: "📱",
    qr: [
      "Open **Settings** → **Connections** → **SIM manager**",
      "Tap **Add eSIM**",
      "Tap **Scan QR code** and scan the code below",
      "Tap **Confirm** to download the eSIM profile",
      "Enable the plan once downloaded",
    ],
    manual: [
      "Open **Settings** → **Connections** → **SIM manager** → **Add eSIM**",
      "Tap **Scan QR code** → then **Enter activation code**",
      "Paste the **LPA Activation Code** from below",
      "Tap **Add** and wait for the profile to download",
    ],
  },
};

const TROUBLESHOOTING = [
  {
    issue: "QR code won't scan",
    solutions: [
      "Ensure good lighting and hold the phone steady",
      "Use 'Enter Manually' and paste the LPA code instead",
      "Clean your camera lens and try again",
    ],
  },
  {
    issue: "eSIM option not showing in Settings",
    solutions: [
      "Confirm your device supports eSIM (iPhone XS+, most 2020+ Androids)",
      "Update your device to the latest OS version",
      "Check if your device is carrier-unlocked",
    ],
  },
  {
    issue: "Activation stuck or pending",
    solutions: [
      "Wait up to 10 minutes — provisioning can take time",
      "Toggle Airplane Mode on for 10 seconds, then off",
      "Restart your device and re-check Cellular settings",
    ],
  },
  {
    issue: "No data connection after activation",
    solutions: [
      "Go to Settings → Cellular and set the eSIM as your data SIM",
      "Enable 'Allow Cellular Data Switching' if prompted",
      "Check that Data Roaming is enabled for the eSIM plan",
      "Set APN manually: iOS → Settings → Cellular → your eSIM → Cellular Data Network → APN: airalo",
      "Android: Settings → Network → Mobile Networks → Access Point Names → Add new APN → Name: Airalo, APN: airalo",
    ],
  },
];

function StepText({ text }) {
  // Bold **text** patterns
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
      )}
    </span>
  );
}

export default function ESimActivationGuide() {
  const [esim, setEsim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [os, setOs] = useState("ios");
  const [mode, setMode] = useState("qr"); // qr | manual
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const esimId = params.get("esim_id");
    loadEsim(esimId);
  }, []);

  const loadEsim = async (esimId) => {
    try {
      const u = await base44.auth.me();
      let record = null;

      if (esimId) {
        const results = await base44.entities.ESim.filter({ id: esimId, user_email: u.email });
        record = results?.[0] || null;
      } else {
        // Default to most recent active eSIM
        const all = await base44.entities.ESim.filter({ user_email: u.email, status: "active" }, "-created_date", 1);
        record = all?.[0] || null;
      }

      if (!record) {
        setError("eSIM not found. Please go back to My eSIMs and try again.");
        return;
      }

      setEsim(record);

      // If QR code is not a valid LPA, try fetching from Airalo
      if (!isValidLpa(record.qr_code) && record.id) {
        try {
          const res = await base44.functions.invoke("getEsimQrCode", { esim_id: record.id });
          if (res.data?.qr_code) {
            record = { ...record, qr_code: res.data.qr_code };
            setEsim(record);
          }
        } catch (e) {
          console.warn("Could not fetch QR from Airalo:", e);
        }
      }

      // Generate QR image
      if (isValidLpa(record.qr_code)) {
        const url = await QRCode.toDataURL(record.qr_code, {
          width: 280,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
        setQrDataUrl(url);
      }
    } catch (err) {
      setError("Failed to load eSIM details. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isValidLpa = (code) => code && code.startsWith("LPA:") && code.includes("$");

  const parseLpa = (lpa) => {
    if (!isValidLpa(lpa)) return {};
    // LPA:1$<smdp>$<matching_id>
    const parts = lpa.replace("LPA:1$", "").split("$");
    return { smdp: parts[0] || "", matchingId: parts[1] || "" };
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `esim-${esim?.iccid || "qr"}.png`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 gap-6">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-300 text-center">{error}</p>
        <Link to={createPageUrl("ESimDashboard")} className="px-6 py-2.5 bg-cyan-500 text-gray-950 font-bold rounded-xl">
          Back to My eSIMs
        </Link>
      </div>
    );
  }

  const { smdp, matchingId } = parseLpa(esim?.qr_code);
  const steps = OS_STEPS[os];
  const currentSteps = mode === "qr" ? steps.qr : steps.manual;

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back */}
        <Link to={createPageUrl("ESimDashboard")} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My eSIMs
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">eSIM Installation Guide</h1>
          {esim && (
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)" }}>
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300">{esim.product_name}</span>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${esim.status === "active" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                {esim.status?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Pre-req tips */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: <Wifi className="w-5 h-5 text-purple-400" />, label: "WiFi Required", sub: "Stay connected during setup", color: "purple" },
            { icon: <Phone className="w-5 h-5 text-blue-400" />, label: "Unlocked Device", sub: "Must be carrier-unlocked", color: "blue" },
            { icon: <Smartphone className="w-5 h-5 text-orange-400" />, label: "5–10 Minutes", sub: "Activation takes a moment", color: "orange" },
          ].map(({ icon, label, sub, color }) => (
            <div key={label} className={`p-4 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
              {icon}
              <p className={`text-xs font-bold text-${color}-300 mt-2`}>{label}</p>
              <p className={`text-xs text-${color}-400/70 mt-0.5`}>{sub}</p>
            </div>
          ))}
        </div>

        {/* QR Code + Manual Details */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2 mb-5">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Your eSIM Credentials</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* QR */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              {qrDataUrl ? (
                <div className="bg-white p-3 rounded-2xl shadow-xl">
                  <img src={qrDataUrl} alt="eSIM QR Code" className="w-52 h-52" />
                </div>
              ) : (
                <div className="w-52 h-52 bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/10">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                  <p className="text-xs text-gray-400 text-center px-4">QR unavailable — use manual entry</p>
                </div>
              )}
              {qrDataUrl && (
                <button onClick={downloadQR} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Save QR
                </button>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3 w-full">
              {/* ICCID */}
              <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">ICCID</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-cyan-300 text-sm break-all select-text">{esim?.iccid || "—"}</p>
                  {esim?.iccid && (
                    <button onClick={() => copyToClipboard(esim.iccid, "iccid")} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      {copied === "iccid" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  )}
                </div>
              </div>

              {/* LPA / Activation Code */}
              {esim?.qr_code && (
                <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">LPA Activation Code</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-cyan-300 text-xs break-all select-text">{esim.qr_code}</p>
                    <button onClick={() => copyToClipboard(esim.qr_code, "lpa")} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      {copied === "lpa" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}

              {/* SM-DP+ Address */}
              {smdp && (
                <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">SM-DP+ Address</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-cyan-300 text-xs break-all select-text">{smdp}</p>
                    <button onClick={() => copyToClipboard(smdp, "smdp")} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      {copied === "smdp" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Matching ID */}
              {matchingId && (
                <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Activation Code / Matching ID</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-cyan-300 text-sm break-all select-text">{matchingId}</p>
                    <button onClick={() => copyToClipboard(matchingId, "mid")} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      {copied === "mid" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Device OS selector */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Step-by-Step Instructions</h2>

          {/* OS tabs */}
          <div className="flex gap-2 flex-wrap mb-4">
            {Object.entries(OS_STEPS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setOs(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${os === key ? "text-gray-950" : "text-gray-400 hover:text-white"}`}
                style={os === key ? { background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" } : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {val.icon} {val.label}
              </button>
            ))}
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("qr")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === "qr" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-gray-500 hover:text-gray-300"}`}
            >
              <QrCode className="w-4 h-4" /> QR Code Method
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === "manual" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Info className="w-4 h-4" /> Manual Entry
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {currentSteps.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
                  {idx + 1}
                </div>
                <div className="flex-1 py-1.5 text-sm text-gray-300 leading-relaxed">
                  <StepText text={step} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Troubleshooting</h2>
          <div className="space-y-2">
            {TROUBLESHOOTING.map((item, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="font-semibold text-white text-sm">{item.issue}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded === idx ? "rotate-180" : ""}`} />
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

        {/* Support */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
          <h3 className="text-lg font-bold text-white mb-2">Still Need Help?</h3>
          <p className="text-gray-400 text-sm mb-4">Our support team is available 24/7 for eSIM activation assistance.</p>
          <div className="flex gap-3 flex-wrap">
            <a href="mailto:support@voxtelefony.com" className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-950 transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
              Email Support
            </a>
            <Link to={createPageUrl("DeviceCompatibility")} className="px-5 py-2.5 rounded-xl font-bold text-sm text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/10 transition-colors">
              Check Device Compatibility
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}