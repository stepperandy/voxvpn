import React, { useState, useEffect } from "react";
import { Download, Monitor, Smartphone, Apple, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import DownloadSuccessOverlay from "@/components/DownloadSuccessOverlay";

const PLATFORMS = [
  {
    id: "windows",
    platform: "Windows",
    subtitle: "Windows 10/11",
    icon: Monitor,
    url: "https://firebasestorage.googleapis.com/v0/b/voxvpn-setup-v2-2-exe.firebasestorage.app/o/VoxTelefony%20Setup%201.0.0.exe?alt=media",
    filename: "VoxTelefony Setup 1.0.0.exe",
    version: "v1.0.0",
    color: "#0ea5e9",
    badge: "Available Now",
    available: true,
  },
  {
    id: "android",
    platform: "Android",
    subtitle: "Android 8.0+",
    icon: Smartphone,
    url: "https://play.google.com/store/apps/details?id=com.base69b202c06dc5b1988efe9645.app",
    version: null,
    color: "#10b981",
    badge: "Google Play",
    available: true,
  },
  {
    id: "ios",
    platform: "iOS",
    subtitle: "iPhone & iPad",
    icon: Apple,
    url: "https://apps.apple.com/gh/app/voxtelefony-virtual-numbers/id6760922995",
    version: null,
    color: "#f59e0b",
    badge: "App Store",
    available: true,
  },
  {
    id: "mac",
    platform: "macOS",
    subtitle: "macOS 12+ · Intel & Apple Silicon",
    icon: Apple,
    url: "https://api.base44.com/api/apps/69c84f61d5543b54fe26e1e5/functions/downloadMacInstaller",
    filename: "VoxTelefony-macOS.dmg",
    version: "v1.0.0",
    color: "#a78bfa",
    badge: "Available Now",
    available: true,
  },
];

function detectOS() {
  if (typeof navigator === "undefined") return null;
  var ua = navigator.userAgent || navigator.platform || "";

  if (/Windows/i.test(ua)) return "windows";
  if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua)) return "mac";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Linux/i.test(ua)) return "linux";

  return null;
}

export default function DownloadSection() {
  const [detectedOS, setDetectedOS] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setDetectedOS(detectOS());
  }, []);

  const triggerDownload = (url, label) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    setSuccess(label || "Your installer");
  };

  var recommendedId = detectedOS || null;

  return (
    <section className="py-20 px-6 md:px-10" style={{ background: "linear-gradient(180deg, #0d1b2f 0%, #0a1628 100%)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", color: "#67e8f9" }}>
            <Download className="w-3.5 h-3.5" />
            Get the App
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Download{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              VoxTelefony
            </span>
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Get virtual phone numbers, eSIM plans, and secure communications on your phone or computer.
          </p>

          {/* OS detected banner */}
          {detectedOS && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {detectedOS === "windows" && "We detected you're on Windows — your download is ready!"}
              {detectedOS === "mac" && "We detected you're on macOS — your download is ready!"}
              {detectedOS === "android" && "We detected you're on Android — get it on Google Play!"}
              {detectedOS === "ios" && "We detected you're on iOS — get it on the App Store!"}
              {detectedOS === "linux" && "We detected you're on Linux — use the web app below."}
            </div>
          )}

        </div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PLATFORMS.map(function (d) {
            var Icon = d.icon;
            var isRecommended = d.id === recommendedId;

            var cardClass = "group relative rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 "
              + (d.available ? "hover:scale-105 hover:shadow-2xl cursor-pointer " : "opacity-60 ")
              + (isRecommended ? "ring-2 " : "");

            var cardStyle = {
              background: isRecommended ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.04)",
              border: isRecommended ? "1px solid " + d.color : "1px solid " + d.color + "30",
            };

            var inner = (
              <>
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: "linear-gradient(90deg, " + d.color + ", transparent)" }} />

                {/* Recommended badge */}
                {isRecommended && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff", boxShadow: "0 4px 12px rgba(6,182,212,0.3)" }}>
                    ★ RECOMMENDED FOR YOU
                  </div>
                )}

                <div className="flex items-start justify-between mt-1">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: d.color + "18", border: "1px solid " + d.color + "35" }}>
                    <Icon className="w-5 h-5" style={{ color: d.color }} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: d.color + "20", color: d.color }}>
                    {d.badge}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{d.platform}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{d.subtitle}</p>
                  {d.version && <p className="text-[10px] text-gray-600 mt-1">{d.version}</p>}
                </div>
                <div
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold"
                  style={{ background: d.available ? "linear-gradient(135deg, " + d.color + "cc, " + d.color + "88)" : "rgba(255,255,255,0.06)", color: "#fff" }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {d.available ? "Download" : "Soon"}
                  {d.available && <ArrowRight className="w-3 h-3" />}
                </div>
              </>
            );

            if (!d.available) {
              return <div key={d.id} className={cardClass} style={cardStyle}>{inner}</div>;
            }

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => triggerDownload(d.url, d.platform)}
                className={cardClass}
                style={cardStyle}
              >
                {inner}
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-3">Prefer the web app? No download needed.</p>
          <Link
            to="/Dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
          >
            Open Web App <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {success && <DownloadSuccessOverlay installerName={success} onClose={() => setSuccess(null)} />}
    </section>
  );
}