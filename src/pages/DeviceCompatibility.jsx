import React, { useState } from "react";
import { ArrowLeft, Smartphone, Check, X, AlertCircle, Wifi, Settings, QrCode, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const COMPATIBLE_DEVICES = {
  apple: {
    brand: "Apple",
    icon: "🍎",
    devices: [
      { name: "iPhone 13 Pro / Pro Max", compatible: true },
      { name: "iPhone 13 / 13 Mini", compatible: true },
      { name: "iPhone 14 / 14 Plus", compatible: true },
      { name: "iPhone 14 Pro / Pro Max", compatible: true },
      { name: "iPhone 15 / 15 Plus", compatible: true },
      { name: "iPhone 15 Pro / Pro Max", compatible: true },
      { name: "iPad Pro (2nd Gen and later)", compatible: true },
      { name: "iPad Air (3rd Gen and later)", compatible: true },
      { name: "iPad (7th Gen and later)", compatible: true },
    ]
  },
  samsung: {
    brand: "Samsung",
    icon: "📱",
    devices: [
      { name: "Galaxy S21 / S21+ / S21 Ultra", compatible: true },
      { name: "Galaxy S22 / S22+ / S22 Ultra", compatible: true },
      { name: "Galaxy S23 / S23+ / S23 Ultra", compatible: true },
      { name: "Galaxy Z Fold 3 / 4 / 5", compatible: true },
      { name: "Galaxy Z Flip 3 / 4 / 5", compatible: true },
      { name: "Galaxy Tab S7 and later", compatible: true },
    ]
  },
  google: {
    brand: "Google Pixel",
    icon: "🔵",
    devices: [
      { name: "Pixel 6 / 6 Pro", compatible: true },
      { name: "Pixel 6a", compatible: true },
      { name: "Pixel 7 / 7 Pro", compatible: true },
      { name: "Pixel 7a", compatible: true },
      { name: "Pixel 8 / 8 Pro", compatible: true },
      { name: "Pixel Tablet", compatible: true },
    ]
  },
  other: {
    brand: "Other Brands",
    icon: "📲",
    devices: [
      { name: "OnePlus 10 / 11", compatible: true },
      { name: "Xiaomi 13 / 13 Pro", compatible: true },
      { name: "OPPO Find X5 Pro", compatible: true },
      { name: "Motorola Edge 50 Pro", compatible: true },
    ]
  }
};

export default function DeviceCompatibility() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [customModel, setCustomModel] = useState("");
  const [checkResult, setCheckResult] = useState(null);

  const handleCheckDevice = (device) => {
    setCheckResult({
      device: device.name,
      compatible: device.compatible
    });
  };

  const handleCustomCheck = () => {
    if (!customModel.trim()) return;
    
    // Simple keyword matching for compatibility
    const incompatibleKeywords = ['iphone 12', 'iphone 11', 'iphone x', 'galaxy s20', 'pixel 5', 'oneplus 8'];
    const isCompatible = !incompatibleKeywords.some(keyword => customModel.toLowerCase().includes(keyword));
    
    setCheckResult({
      device: customModel,
      compatible: isCompatible
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={createPageUrl("Home")}
            className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">eSIM Device Compatibility</h1>
          <p className="text-purple-200">Check if your device supports eSIM before purchasing a plan</p>
        </div>

        {/* Compatibility Result */}
        {checkResult && (
          <div className={`mb-8 p-6 rounded-2xl border ${
            checkResult.compatible
              ? 'bg-green-500/20 border-green-500/50'
              : 'bg-red-500/20 border-red-500/50'
          }`}>
            <div className="flex items-start gap-4">
              {checkResult.compatible ? (
                <Check className="w-8 h-8 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-8 h-8 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${
                  checkResult.compatible ? 'text-green-300' : 'text-red-300'
                }`}>
                  {checkResult.compatible ? '✓ Compatible!' : '✗ Not Compatible'}
                </h3>
                <p className={`mt-1 ${
                  checkResult.compatible ? 'text-green-200' : 'text-red-200'
                }`}>
                  {checkResult.compatible
                    ? `Your ${checkResult.device} supports eSIM. You're ready to purchase!`
                    : `Your ${checkResult.device} doesn't support eSIM yet. Check back later or contact support.`
                  }
                </p>
                {checkResult.compatible && (
                  <Link
                    to={createPageUrl("ESimStore")}
                    className="inline-block mt-4 bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Browse Plans
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Guide Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-5">How to know if your phone supports eSIM</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: ShieldCheck, color: "#22c55e", title: "iPhone XS or newer", desc: "All iPhones from XS (2018) onwards include eSIM support." },
              { icon: Smartphone, color: "#3b82f6", title: "Android from 2019+", desc: "Most flagship Android phones released after 2019 support eSIM." },
              { icon: Settings, color: "#a855f7", title: "Check Settings", desc: 'Go to Settings → Network / Cellular → look for "Add eSIM" or "SIM Manager".' },
              { icon: Wifi, color: "#f59e0b", title: "Unlocked devices only", desc: "Carrier-locked phones may not support third-party eSIM plans." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white/10 border border-white/15 rounded-2xl p-5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Requirements banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200 text-sm">
              <strong>Important:</strong> Your device must be <strong>unlocked</strong>, have eSIM capability enabled, and be running the latest OS version. Phones purchased through some US/regional carriers may have eSIM locked — contact your carrier to unlock it first.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Device Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-4">Select Your Brand</h2>
              <div className="space-y-2">
                {Object.entries(COMPATIBLE_DEVICES).map(([key, brand]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedBrand(selectedBrand === key ? null : key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedBrand === key
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="mr-2">{brand.icon}</span>
                    {brand.brand}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Can't find your device?</h3>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Enter model name..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 text-sm mb-2 focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={handleCustomCheck}
                  disabled={!customModel.trim()}
                  className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  Check Device
                </button>
              </div>
            </div>
          </div>

          {/* Device List */}
          <div className="lg:col-span-2">
            {!selectedBrand ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center">
                <Smartphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a brand to get started</h3>
                <p className="text-gray-400">Choose from the list on the left to check if your device supports eSIM</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {COMPATIBLE_DEVICES[selectedBrand].icon} {COMPATIBLE_DEVICES[selectedBrand].brand}
                </h2>

                {/* Compatibility Info */}
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <p className="text-blue-200 text-sm">
                      All devices listed below support eSIM technology and are compatible with our plans.
                    </p>
                  </div>
                </div>

                {/* Device Grid */}
                <div className="space-y-2">
                  {COMPATIBLE_DEVICES[selectedBrand].devices.map((device, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCheckDevice(device)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/50 rounded-lg transition-all group"
                    >
                      <span className="text-white font-medium">{device.name}</span>
                      <Check className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-200 text-sm">
                    <strong>Tip:</strong> Click on any device to confirm it's compatible with our eSIM plans.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "What is eSIM?",
                a: "eSIM (embedded SIM) is a digital version of a physical SIM card. It allows you to activate a plan without needing to swap physical cards."
              },
              {
                q: "How do I activate eSIM on my device?",
                a: "Go to Settings → Cellular → Add eSIM. Scan the QR code provided with your purchase or enter the ICCID manually."
              },
              {
                q: "Can I switch between eSIM and physical SIM?",
                a: "Yes! Most devices support both. You can keep your physical SIM and add an eSIM for international data."
              },
              {
                q: "What if my device is not compatible?",
                a: "Devices before 2018 generally don't support eSIM. Check your device manual or contact your manufacturer for confirmation."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-300 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}