import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Globe, ShoppingCart, Check, Loader2, LogIn } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaymentMethodModal from "@/components/checkout/PaymentMethodModal";
import PaymentMethodsDisplay from "@/components/checkout/PaymentMethodsDisplay";
import { redirectToStripeCheckout, isRunningInIframe } from "@/components/stripe/stripeUtils";

const PRICE_IDS = {
  US: "price_1TAh18Aj5jZA8C2ys3cUxAGw",
  CA: "price_1TAh18Aj5jZA8C2yLNaI6U8C",
  GB: "price_1TAh18Aj5jZA8C2y595fKbQW",
  AU: "price_1TAh18Aj5jZA8C2yayy9h4k4",
};

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
];

export default function NumberSearch() {
  const urlParams = new URLSearchParams(window.location.search);
  const defaultCountry = urlParams.get("country") || "US";
  const [country, setCountry] = useState(defaultCountry);
  const [areaCode, setAreaCode] = useState("");
  const [features, setFeatures] = useState(["sms"]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(null);
  const [purchased, setPurchased] = useState(new Set());
  const [searched, setSearched] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [currencyPreview, setCurrencyPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null)).finally(() => setUserLoading(false));
    base44.functions.invoke("getCurrencyPreview", { amounts: { default: 499 } })
      .then(res => setCurrencyPreview(res.data))
      .catch(() => {});
  }, []);

  const search = async () => {
    setLoading(true);
    setResults([]);
    setSearched(true);
    const res = await base44.functions.invoke('didwwSearchNumbers', {
      country_iso: country,
      area_code: areaCode || undefined,
      number_type: features.includes("sms") ? undefined : "local",
    });
    setResults(res.data?.data || []);
    setLoading(false);
  };

  const purchase = async (didGroup) => {
    if (isRunningInIframe()) {
      alert("Checkout only works from the published app. Please visit the app directly to purchase.");
      return;
    }

    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    const stripeHandler = async () => {
      const res = await base44.functions.invoke('didwwCheckout', {
        did_group_id: didGroup.id,
        country_iso: didGroup.country_iso,
        city: didGroup.city,
        number_type: didGroup.type,
        monthly_fee: didGroup.monthly_fee,
        setup_fee: didGroup.setup_fee || 0,
        user_email: user.email,
      });
      if (!res.data?.url) throw new Error("Failed to create checkout session");
      window.location.href = res.data.url;
    };

    const checkoutData = {
      type: 'didww_number',
      country: didGroup.country_iso,
      city: didGroup.city,
      monthly_fee: didGroup.monthly_fee,
      email: user.email,
    };

    setPaymentModal({ checkoutData, stripeHandler });
  };

  const toggleFeature = (f) => {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "linear-gradient(160deg, #0d1f35 0%, #0a1628 60%, #0d1f35 100%)" }}>
      <PaymentMethodModal
        isOpen={!!paymentModal}
        onClose={() => setPaymentModal(null)}
        checkoutData={paymentModal?.checkoutData}
        onStripeCheckout={paymentModal?.stripeHandler || (() => {})}
      />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Find a Number</h1>
            <p className="text-gray-500 text-sm mt-1">Search available virtual phone numbers worldwide</p>
            {currencyPreview && (
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-xs text-gray-500">
                  Detected: {currencyPreview.country} · {currencyPreview.currency.toUpperCase()}
                </p>
                <PaymentMethodsDisplay currencyPreview={currencyPreview} />
              </div>
            )}
          </div>
          {!userLoading && (
            user ? (
              <button
                onClick={() => navigate(createPageUrl("Dashboard"))}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-lg transition-colors"
              >
                My Dashboard →
              </button>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 text-sm font-medium rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" /> Login to Purchase
              </button>
            )
          )}
        </div>

        {!userLoading && !user && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/25 rounded-xl text-yellow-300 text-sm">
            <strong>Account required:</strong> You must be logged in to purchase a virtual number. <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="underline ml-1 hover:text-yellow-200">Sign in or create an account</button>.
          </div>
        )}

        {/* Search Form */}
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Country</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d2137] border-gray-700">
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code} className="text-white">
                    {c.flag} {c.name}
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
              placeholder="e.g. 212"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Features</label>
            <div className="flex gap-2">
              {["sms", "voice", "mms"].map(f => (
                <button
                  key={f}
                  onClick={() => toggleFeature(f)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
                    features.includes(f)
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "bg-gray-900 text-gray-500 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={search}
          disabled={loading}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-[#0A192F] px-6 py-2.5 rounded-lg font-semibold transition-colors text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search Numbers
        </button>
      </div>

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Searching available numbers...
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <Globe className="w-10 h-10 mx-auto mb-3" />
            <p>No numbers found for your search criteria</p>
            <p className="text-sm mt-1">Try a different country or remove the area code filter</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16 text-gray-700">
            <Search className="w-10 h-10 mx-auto mb-3" />
            <p>Search for available numbers above</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((num, i) => (
              <div key={i} className="bg-slate-700/40 border border-slate-600/50 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-base font-bold text-white">
                    {num.country_name || num.country_iso} {num.city ? `— ${num.city}` : ""}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5 uppercase tracking-wide">
                    {num.type} · prefix: +{num.prefix}
                  </p>
                </div>
                <Globe className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {num.voice_enabled && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md uppercase tracking-wide">Voice</span>}
                {num.sms_enabled && <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-md uppercase tracking-wide">SMS</span>}
              </div>
              <div className="mb-4">
                <span className="text-cyan-400 font-bold text-lg">${parseFloat(num.monthly_fee).toFixed(2)}</span>
                <span className="text-gray-500 text-xs">/mo</span>
                {num.setup_fee > 0 && <span className="text-gray-600 text-xs ml-2">+${parseFloat(num.setup_fee).toFixed(2)} setup</span>}
                {num.available_count > 0 && <span className="text-gray-600 text-xs ml-2">· {num.available_count} available</span>}
              </div>
              <button
                onClick={() => purchase(num)}
                disabled={!!purchasing}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  !user
                    ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                    : "bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#0A192F]"
                }`}
              >
                {!user ? (
                  <><LogIn className="w-4 h-4" /> Login to Buy</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Buy Number</>
                )}
              </button>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}