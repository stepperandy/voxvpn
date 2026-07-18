import React, { useState, useEffect } from "react";
import { Download, Monitor, Apple, Smartphone, CheckCircle2, ArrowRight, Cloud, HardDrive } from "lucide-react";
import DownloadSuccessOverlay from "@/components/DownloadSuccessOverlay";

const DEFAULT_URLS = {
  "win-mirror1": "https://firebasestorage.googleapis.com/v0/b/voxvpn-setup-v2-2-exe.firebasestorage.app/o/VoxDigits%20Setup%201.0.0.exe?alt=media",
  "win-mirror2": "https://github.com/stepperandy/voxvpn/releases/download/v1.0.0/VoxDigits.Setup.1.0.0.exe",
  mac: "",
  android: "https://play.google.com/store/apps/details?id=com.base69b202c06dc5b1988efe9645.app",
  ios: "https://apps.apple.com",
};

const PLATFORM_META = [
  { id: "win-mirror1", label: "Windows — Mirror 1", subtitle: "Windows 10/11", icon: Monitor, sourceIcon: Cloud, color: "#0ea5e9", external: true },
  { id: "win-mirror2", label: "Windows — Mirror 2", subtitle: "Windows 10/11", icon: Monitor, sourceIcon: HardDrive, color: "#38bdf8", external: true },
  { id: "mac", label: "macOS", subtitle: "macOS 12+", icon: Apple, sourceIcon: Apple, color: "#a78bfa", external: false },
  { id: "android", label: "Android", subtitle: "Android 8.0+", icon: Smartphone, sourceIcon: Smartphone, color: "#10b981", external: true },
  { id: "ios", label: "iOS", subtitle: "iPhone & iPad", icon: Apple, sourceIcon: Apple, color: "#f59e0b", external: true },
];

function detectOS() {
  if (typeof navigator === "undefined") return null;
  var ua = navigator.userAgent || navigator.platform || "";
  if (/Windows/i.test(ua)) return "windows";
  if (/Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua)) return "mac";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  return null;
}

function getDownloadUrls() {
  try {
    var saved = localStorage.getItem("vox_download_urls");
    if (saved) return { ...DEFAULT_URLS, ...JSON.parse(saved) };
  } catch (e) { /* ignore */ }
  return DEFAULT_URLS;
}

export default function DownloadButtons({ showAll = false }) {
  const [detectedOS, setDetectedOS] = useState(null);
  const [urls, setUrls] = useState(DEFAULT_URLS);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setDetectedOS(detectOS());
    setUrls(getDownloadUrls());
  }, []);

  const triggerDownload = (url, external, label) => {
    if (!url) return;
    window.open(url, external ? "_blank" : "_self", "noopener,noreferrer");
    setSuccess(label || "Your installer");
  };

  var recommendedOS = detectedOS || null;

  // Filter: if Windows detected, show both Windows mirrors; if other OS, show that one; if none, show all
  var platformsToShow;
  if (showAll) {
    platformsToShow = PLATFORM_META;
  } else if (recommendedOS === "windows") {
    platformsToShow = PLATFORM_META.filter(p => p.id.startsWith("win"));
  } else if (recommendedOS) {
    platformsToShow = PLATFORM_META.filter(p => p.id === recommendedOS || (recommendedOS === "mac" && p.id === "mac") || (recommendedOS === "android" && p.id === "android") || (recommendedOS === "ios" && p.id === "ios"));
  } else {
    platformsToShow = PLATFORM_META;
  }

  return (
    <div>
      {detectedOS && !showAll && (
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Detected: {detectedOS === "mac" ? "macOS" : detectedOS.charAt(0).toUpperCase() + detectedOS.slice(1)}
        </div>
      )}

      <div className={`grid gap-3 ${showAll ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
        {platformsToShow.map(function (p) {
          var Icon = p.icon;
          var SourceIcon = p.sourceIcon;
          var url = urls[p.id];
          var available = !!url;

          var cardClass = "group relative rounded-xl p-4 flex items-center gap-4 transition-all duration-300 "
            + (available ? "hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer " : "opacity-50 ");

          var cardStyle = {
            background: "rgba(255,255,255,0.04)",
            border: "1px solid " + p.color + "30",
          };

          var inner = (
            <>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: p.color + "18", border: "1px solid " + p.color + "35" }}>
                <Icon className="w-5 h-5" style={{ color: p.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{p.label}</p>
                <p className="text-xs text-gray-500">{p.subtitle}</p>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold flex-shrink-0 min-w-[110px] justify-center"
                style={{ background: available ? "linear-gradient(135deg, " + p.color + "cc, " + p.color + "88)" : "rgba(255,255,255,0.06)", color: "#fff" }}>
                <SourceIcon className="w-3.5 h-3.5" />
                <span>{available ? "Download" : "Soon"}</span>
                {available && <ArrowRight className="w-3 h-3" />}
              </div>
            </>
          );

          if (!available) {
            return <div key={p.id} className={cardClass} style={cardStyle}>{inner}</div>;
          }

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => triggerDownload(url, p.external, p.label)}
              className={cardClass}
              style={cardStyle}
            >
              {inner}
            </button>
          );
        })}
      </div>

      {!showAll && recommendedOS && (
        <p className="text-xs text-gray-500 mt-3">
          On a different device? <a href="/downloads" className="text-cyan-400 hover:underline">View all installers</a>
        </p>
      )}

      {success && <DownloadSuccessOverlay installerName={success} onClose={() => setSuccess(null)} />}
    </div>
  );
}