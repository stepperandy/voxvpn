import React, { useState, useEffect } from "react";
import { Apple, Download, ShieldCheck, Cpu, CheckCircle2, ArrowRight, Zap, Lock } from "lucide-react";

const MAC_DOWNLOAD_URL =
  "https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions/downloadMacInstaller";

const FEATURES = [
  { icon: ShieldCheck, title: "Code-Signed & Notarized", desc: "Verified by Apple — no Gatekeeper warnings" },
  { icon: Cpu, title: "Universal Binary", desc: "Native on Apple Silicon & Intel" },
  { icon: Lock, title: "Encrypted VPN Tunnel", desc: "Military-grade AES-256 protection" },
  { icon: Zap, title: "One-Click Connect", desc: "Auto-configures your VPN in seconds" },
];

const STEPS = [
  { num: 1, title: "Download the .dmg", desc: "Click the download button to get VoxTelefony for macOS." },
  { num: 2, title: "Open & Drag to Apps", desc: "Double-click the .dmg, then drag VoxTelefony into your Applications folder." },
  { num: 3, title: "Launch & Sign In", desc: "Open VoxTelefony from Applications and sign in with your account." },
  { num: 4, title: "Connect & Go", desc: "Pick a server and click connect — you're secured in seconds." },
];

function detectMacOS() {
  if (typeof navigator === "undefined") return false;
  var ua = navigator.userAgent || navigator.platform || "";
  return /Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua);
}

export default function MacOSDownloadSection() {
  const [isMac, setIsMac] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setIsMac(detectMacOS());
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    window.open(MAC_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
    setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <section
      className="py-20 px-6 md:px-10 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0d1b2f 0%, #0a1628 50%, #111827 100%)" }}
    >
      {/* Glow */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Badge */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", color: "#c4b5fd" }}
          >
            <Apple className="w-3.5 h-3.5" />
            Now Available for Mac
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            VoxTelefony for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              macOS
            </span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Private virtual phone numbers, encrypted calling, and secure messaging — built natively for your Mac.
          </p>

          {/* Mac detected banner */}
          {isMac && (
            <div
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              We detected you're on macOS — your download is ready!
            </div>
          )}
        </div>

        {/* Main download card */}
        <div
          className="rounded-3xl p-8 md:p-10 max-w-2xl mx-auto mb-12 relative"
          style={{
            background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(6,182,212,0.05))",
            border: "1px solid rgba(167,139,250,0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Apple icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
            >
              <Apple className="w-10 h-10 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white">VoxTelefony for Mac</h3>
              <p className="text-sm text-gray-400 mt-1">macOS 12 Monterey or later</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(167,139,250,0.15)", color: "#c4b5fd" }}>
                  v1.0.0
                </span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                  ✓ Notarized
                </span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(6,182,212,0.15)", color: "#67e8f9" }}>
                  Universal
                </span>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}
            >
              {downloading ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Opening...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download .dmg
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {FEATURES.map(function (f) {
            var Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl p-5 text-center transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#c4b5fd" }} />
                </div>
                <p className="font-bold text-white text-xs mb-1">{f.title}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Installation steps */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center text-lg font-bold text-white mb-6">Install in 4 Easy Steps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STEPS.map(function (s) {
              return (
                <div
                  key={s.num}
                  className="relative rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-3"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
                  >
                    {s.num}
                  </div>
                  <p className="font-bold text-white text-xs mb-1">{s.title}</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}