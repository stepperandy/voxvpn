import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Globe, ShoppingCart, Loader2, Phone, LogIn } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isRunningInIframe } from "@/components/stripe/stripeUtils";
import PaymentChoiceModal from "@/components/checkout/PaymentChoiceModal";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸", region: "North America" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "North America" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", region: "North America" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "Europe" },
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", region: "Europe" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "Europe" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", region: "Europe" },
  { code: "ES", name: "Spain", flag: "🇪🇸", region: "Europe" },
  { code: "IT", name: "Italy", flag: "🇮🇹", region: "Europe" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", region: "South America" },
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "Oceania" },
];

const REGIONS = ["All", "North America", "Europe", "South America", "Oceania"];

const NUMBER_TYPES = [
  { value: "local", label: "Local" },
  { value: "toll_free", label: "Toll-Free" },
  { value: "mobile", label: "Mobile" },
  { value: "national", label: "National" },
];

const CARD_GRADIENTS = [
  { from: "#06b6d4", to: "#3b82f6" },
  { from: "#8b5cf6", to: "#ec4899" },
  { from: "#10b981", to: "#06b6d4" },
  { from: "#f59e0b", to: "#ef4444" },
  { from: "#6366f1", to: "#8b5cf6" },
  { from: "#ec4899", to: "#f59e0b" },
];

export default function VirtualNumberStore({ user, onPaymentModal }) {
  const provider = "twilio";
  const [country, setCountry] = useState("US");
  const [areaCode, setAreaCode] = useState("");
  const [region, setRegion] = useState("All");
  const [numberType, setNumberType] = useState("local");
  const [countryQuery, setCountryQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [purchasing, setPurchasing] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null); // { num, totalCost }

  const filteredCountries = COUNTRIES.filter(c => {
    if (region !== "All" && c.region !== region) return false;
    if (countryQuery && !c.name.toLowerCase().includes(countryQuery.toLowerCase())) return false;
    return true;
  });

  const search = async () => {
    setLoading(true);
    setResults([]);
    setSearched(true);
    
    try {
      const res = await base44.functions.invoke("searchNumbers", {
        country_code: country,
        area_code: areaCode || undefined,
        number_type: numberType,
      });
      if (res.status === 503) {
        alert("Number search service not configured");
      } else {
        setResults(res.data?.data || []);
      }
    } catch (err) {
      alert("Failed to search numbers");
      console.error(err);
    }
    
    setLoading(false);
  };

  const purchase = async (num) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    const totalCost = parseFloat(num.monthly_fee) + parseFloat(num.setup_fee || 0);
    // Always show payment choice modal
    setPaymentModal({ num, totalCost });
  };

  const buyWithCredits = async (num) => {
    setPurchasing(num.id || num.phone_number);
    const res = await base44.functions.invoke("buyNumberWithCredits", {
      phone_number: num.phone_number,
      provider_number_id: num.id,
      country_code: num.country_iso || num.country_code,
      number_type: num.type || "local",
      provider,
      monthly_fee: parseFloat(num.monthly_fee),
      setup_fee: parseFloat(num.setup_fee || 0),
      city: num.city,
    });
    setPurchasing(null);
    if (res.data?.success) {
      setPaymentModal(null);
      window.location.href = "/ServicesDashboard";
    } else {
      throw new Error(res.data?.error || "Purchase failed");
    }
  };

  const stripeCheckoutForNumber = async (num) => {
    if (isRunningInIframe()) {
      alert("Checkout only works from the published app. Please visit the app directly to purchase.");
      return;
    }
    try {
      const res = await base44.functions.invoke("reserveNumber", {
        phone_number: num.phone_number,
        provider_number_id: num.id,
        country_code: num.country_code,
        number_type: num.type || "local",
        provider: "twilio",
        monthly_fee: parseFloat(num.monthly_fee),
        setup_fee: parseFloat(num.setup_fee || 0),
        city: num.city,
      });
      if (res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        alert(res.data?.error || "Failed to reserve number");
      }
    } catch (err) {
      alert("Failed to start checkout. Please try again.");
      console.error(err);
    }
  };

  const countryFlag = COUNTRIES.find(c => c.code === country)?.flag || "🌐";

  return (
    <div>
      <PaymentChoiceModal
        isOpen={!!paymentModal}
        onClose={() => setPaymentModal(null)}
        totalCost={paymentModal?.totalCost}
        userCredits={parseFloat(user?.credits) || 0}
        onPayWithCredits={() => buyWithCredits(paymentModal.num)}
        onPayWithCard={() => stripeCheckoutForNumber(paymentModal.num)}
      />


      {/* Search */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Filters row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Region</label>
            <Select value={region} onValueChange={(v) => { setRegion(v); if (v !== "All") { const first = COUNTRIES.find(c => c.region === v); if (first) setCountry(first.code); } }}>
              <SelectTrigger className="w-full bg-gray-900/60 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d2137] border-gray-700">
                {REGIONS.map(r => (
                  <SelectItem key={r} value={r} className="text-white">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Number Type</label>
            <Select value={numberType} onValueChange={setNumberType}>
              <SelectTrigger className="w-full bg-gray-900/60 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d2137] border-gray-700">
                {NUMBER_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Search Country <span className="text-gray-600">(by name)</span></label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={countryQuery}
                onChange={e => setCountryQuery(e.target.value)}
                placeholder="e.g. United"
                className="w-full bg-gray-900/60 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
              />
            </div>
          </div>
        </div>
        {/* Country + area code + search row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Country</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full bg-gray-900/60 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d2137] border-gray-700">
                {filteredCountries.length === 0 ? (
                  <SelectItem value="none" disabled className="text-gray-500">No matches</SelectItem>
                ) : filteredCountries.map(c => (
                  <SelectItem key={c.code} value={c.code} className="text-white">
                    {c.flag} {c.name} <span className="text-gray-500 ml-1">({c.region})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Area Code <span className="text-gray-600">(optional)</span></label>
            <input
              value={areaCode}
              onChange={e => setAreaCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="e.g. 212"
              className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={search}
              disabled={loading || filteredCountries.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 px-6 py-2.5 rounded-lg font-bold transition-colors text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search Numbers
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Searching available numbers...</span>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <Globe className="w-10 h-10 mx-auto mb-3" />
          <p className="text-gray-400">No numbers found for your search</p>
          <p className="text-sm mt-1 text-gray-600">Try a different country or remove the area code filter</p>
        </div>
      )}

      {!loading && !searched && (
        <div className="text-center py-16">
          <Phone className="w-12 h-12 mx-auto mb-4 text-cyan-500/30" />
          <p className="text-gray-500">Select a country and search for available numbers</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((num, idx) => {
            const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
            return (
              <div key={num.id} className="relative group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})` }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${gradient.from}15, transparent 70%)` }} />
                <div className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{COUNTRIES.find(c => c.code === num.country_iso)?.flag || "🌐"}</span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: gradient.from }}>{num.country_name || num.country_iso}</p>
                        <h3 className="text-white font-bold text-base leading-tight">{num.city || num.type}</h3>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${gradient.from}30, ${gradient.to}20)`, border: `1px solid ${gradient.from}40` }}>
                      <Phone className="w-4 h-4" style={{ color: gradient.from }} />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-5">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase" style={{ background: `${gradient.from}20`, border: `1px solid ${gradient.from}40`, color: gradient.from }}>{num.type}</span>
                    {num.voice_enabled && <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}>Voice</span>}
                    {num.sms_enabled && <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>SMS</span>}
                    {num.available_count > 0 && <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>{num.available_count} available</span>}
                  </div>

                  <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div>
                      <span className="text-3xl font-extrabold text-white">${parseFloat(num.monthly_fee).toFixed(2)}</span>
                      <span className="text-gray-400 text-xs ml-1">/mo</span>
                      {num.setup_fee > 0 && <p className="text-gray-600 text-xs mt-0.5">+${parseFloat(num.setup_fee).toFixed(2)} setup</p>}
                    </div>
                    <button
                      onClick={() => purchase(num)}
                      disabled={purchasing === (num.id || num.phone_number)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`, boxShadow: `0 0 20px ${gradient.from}40` }}
                    >
                      {purchasing === (num.id || num.phone_number) ? <Loader2 className="w-4 h-4 animate-spin" /> : !user ? <LogIn className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                      {purchasing === (num.id || num.phone_number) ? "..." : !user ? "Login" : "Buy"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}