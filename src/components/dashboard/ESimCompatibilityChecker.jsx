import React, { useState, useMemo } from "react";
import { Smartphone, Check, X, Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const COMPATIBLE_DEVICES = {
  apple: {
    brand: "Apple",
    icon: "🍎",
    devices: [
      "iPhone 13 Pro / Pro Max",
      "iPhone 13 / 13 Mini",
      "iPhone 14 / 14 Plus",
      "iPhone 14 Pro / Pro Max",
      "iPhone 15 / 15 Plus",
      "iPhone 15 Pro / Pro Max",
      "iPad Pro (2nd Gen and later)",
      "iPad Air (3rd Gen and later)",
      "iPad (7th Gen and later)",
    ],
  },
  samsung: {
    brand: "Samsung",
    icon: "📱",
    devices: [
      "Galaxy S21 / S21+ / S21 Ultra",
      "Galaxy S22 / S22+ / S22 Ultra",
      "Galaxy S23 / S23+ / S23 Ultra",
      "Galaxy Z Fold 3 / 4 / 5",
      "Galaxy Z Flip 3 / 4 / 5",
      "Galaxy Tab S7 and later",
    ],
  },
  google: {
    brand: "Google Pixel",
    icon: "🔵",
    devices: [
      "Pixel 6 / 6 Pro",
      "Pixel 6a",
      "Pixel 7 / 7 Pro",
      "Pixel 7a",
      "Pixel 8 / 8 Pro",
      "Pixel Tablet",
    ],
  },
  other: {
    brand: "Other Brands",
    icon: "📲",
    devices: [
      "OnePlus 10 / 11",
      "Xiaomi 13 / 13 Pro",
      "OPPO Find X5 Pro",
      "Motorola Edge 50 Pro",
    ],
  },
};

// Keyword hints used for fuzzy matching custom model input
const INCOMPATIBLE_HINTS = ["iphone 6", "iphone 7", "iphone 8", "iphone x", "iphone xs", "iphone se", "galaxy s10", "galaxy s9", "galaxy s8", "pixel 5", "pixel 4", "pixel 3"];

export default function ESimCompatibilityChecker() {
  const [brandKey, setBrandKey] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);

  const allDevices = useMemo(() => {
    return Object.entries(COMPATIBLE_DEVICES).flatMap(([key, b]) =>
      b.devices.map((d) => ({ brand: b.brand, brandKey: key, icon: b.icon, name: d }))
    );
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allDevices.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allDevices]);

  const checkCustomModel = () => {
    const q = query.toLowerCase().trim();
    if (!q) return null;
    const incompatible = INCOMPATIBLE_HINTS.some((h) => q.includes(h));
    return { incompatible, unknown: !incompatible };
  };

  const result = selectedDevice
    ? { compatible: true, label: selectedDevice.name, icon: selectedDevice.icon }
    : query.trim()
      ? (() => {
          const c = checkCustomModel();
          if (c.incompatible) return { compatible: false, label: query, icon: "❌" };
          return { compatible: true, label: query, icon: "🔎" };
        })()
      : null;

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">eSIM Compatibility Checker</h3>
          <p className="text-xs text-gray-400">Check if your device supports eSIM before buying</p>
        </div>
      </div>

      {/* Brand pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(COMPATIBLE_DEVICES).map(([key, b]) => (
          <button
            key={key}
            onClick={() => { setBrandKey(brandKey === key ? null : key); setQuery(""); setSelectedDevice(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              brandKey === key
                ? "bg-cyan-500 text-gray-950"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {b.icon} {b.brand}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedDevice(null); }}
          placeholder="Search or type your device model..."
          className="w-full pl-9 pr-3 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
        />
        {filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
            {filtered.map((d, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDevice(d); setQuery(d.name); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-700/50 transition-colors flex items-center gap-2"
              >
                <span>{d.icon}</span>
                <span className="text-sm text-gray-200">{d.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{d.brand}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand list (when a brand is selected) */}
      {brandKey && !query && (
        <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
          {COMPATIBLE_DEVICES[brandKey].devices.map((d) => (
            <button
              key={d}
              onClick={() => { setSelectedDevice({ name: d, icon: COMPATIBLE_DEVICES[brandKey].icon, brand: COMPATIBLE_DEVICES[brandKey].brand }); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700/40 transition-colors flex items-center justify-between"
            >
              <span className="text-sm text-gray-300">{d}</span>
              <Check className="w-4 h-4 text-green-400" />
            </button>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`mt-4 p-3 rounded-lg border flex items-start gap-3 ${
            result.compatible
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}
        >
          {result.compatible ? (
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${result.compatible ? "text-green-300" : "text-red-300"}`}>
              {result.compatible ? "eSIM Compatible" : "Likely Not Compatible"}
            </p>
            <p className="text-xs text-gray-400 truncate">{result.label}</p>
            {result.compatible && (
              <Link to="/ESimStore" className="inline-block mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300">
                Browse eSIM Plans →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}