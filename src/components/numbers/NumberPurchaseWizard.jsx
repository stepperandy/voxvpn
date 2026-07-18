import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, ChevronRight, Globe, MapPin, CreditCard, Loader2, Phone, ArrowLeft, ShoppingCart, LogIn, Zap, AlertCircle } from "lucide-react";
import { isRunningInIframe } from "@/components/stripe/stripeUtils";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸", price: 4.99 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", price: 6.99 },
  { code: "CA", name: "Canada", flag: "🇨🇦", price: 5.99 },
  { code: "AU", name: "Australia", flag: "🇦🇺", price: 7.99 },
  { code: "DE", name: "Germany", flag: "🇩🇪", price: 8.99 },
  { code: "FR", name: "France", flag: "🇫🇷", price: 8.99 },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", price: 8.99 },
  { code: "SE", name: "Sweden", flag: "🇸🇪", price: 7.99 },
  { code: "ES", name: "Spain", flag: "🇪🇸", price: 8.99 },
  { code: "IT", name: "Italy", flag: "🇮🇹", price: 8.99 },
  { code: "BR", name: "Brazil", flag: "🇧🇷", price: 6.99 },
  { code: "MX", name: "Mexico", flag: "🇲🇽", price: 6.99 },
];

const STEPS = [
  { id: 1, label: "Country", icon: Globe },
  { id: 2, label: "Number", icon: MapPin },
  { id: 3, label: "Confirm", icon: CreditCard },
];

export default function NumberPurchaseWizard({ user, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [areaCode, setAreaCode] = useState("");
  const [numbers, setNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null); // null | 'credits' | 'stripe'
  // checkingOut is a string or null - truthy check works for disabled states
  const [searched, setSearched] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const searchNumbers = async () => {
    setLoading(true);
    setNumbers([]);
    setSearched(true);
    try {
      const res = await base44.functions.invoke("searchNumbers", {
        country_code: selectedCountry.code,
        area_code: areaCode || undefined,
      });
      if (res.data?.data) {
        // Fill in country price when provider returns 0
        const nums = res.data.data.map(n => ({
          ...n,
          monthly_fee: parseFloat(n.monthly_fee) > 0 ? n.monthly_fee : selectedCountry.price,
        }));
        setNumbers(nums);
      } else {
        alert(res.data?.error || "Failed to search numbers. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Search failed. Please try again.");
    }
    setLoading(false);
  };

  const totalCost = selectedNumber
    ? parseFloat(selectedNumber.monthly_fee) + parseFloat(selectedNumber.setup_fee || 0)
    : 0;
  const userCredits = user?.credits || 0;
  const hasEnoughCredits = userCredits >= totalCost;

  const handlePayWithCredits = async () => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    setCheckoutError(null);
    setCheckingOut('credits');
    try {
      const res = await base44.functions.invoke("buyNumberWithCredits", {
        phone_number: selectedNumber.phone_number,
        provider_number_id: selectedNumber.id,
        country_code: selectedNumber.country_iso || selectedNumber.country_code || selectedCountry.code,
        number_type: selectedNumber.type,
        monthly_fee: parseFloat(selectedNumber.monthly_fee),
        setup_fee: parseFloat(selectedNumber.setup_fee || 0),
        city: selectedNumber.city,
      });
      if (res.data?.success) {
        window.location.href = "/ServicesDashboard";
      } else {
        setCheckoutError(res.data?.error || "Failed to purchase with credits.");
      }
    } catch (err) {
      setCheckoutError(err?.response?.data?.error || "Credits purchase failed. Please try again.");
    }
    setCheckingOut(null);
  };

  const handlePayWithStripe = async () => {
    if (isRunningInIframe()) {
      setCheckoutError("Checkout only works from the published app. Please visit the app directly to purchase.");
      return;
    }
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    setCheckoutError(null);
    setCheckingOut('stripe');
    try {
      const res = await base44.functions.invoke("reserveNumber", {
        phone_number: selectedNumber.phone_number,
        provider_number_id: selectedNumber.id,
        country_code: selectedNumber.country_iso || selectedNumber.country_code || selectedCountry.code,
        number_type: selectedNumber.type,
        provider: "telnyx",
        monthly_fee: parseFloat(selectedNumber.monthly_fee),
        setup_fee: parseFloat(selectedNumber.setup_fee || 0),
        city: selectedNumber.city,
      });
      if (res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        setCheckoutError(res.data?.error || "Failed to start checkout. Please try again.");
      }
    } catch (err) {
      setCheckoutError(err?.response?.data?.error || "Checkout failed. Please try again.");
    }
    setCheckingOut(null);
  };

  const goBack = () => {
    if (step === 2) { setStep(1); setNumbers([]); setSelectedNumber(null); setSearched(false); }
    else if (step === 3) { setStep(2); setSelectedNumber(null); }
  };

  return (
    <div className="bg-[#0d1f35] rounded-2xl border border-gray-700/50 overflow-hidden w-full max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="px-6 py-5 border-b border-gray-700/50 bg-[#0a1628]">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-0">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    done ? "bg-cyan-500 text-gray-950" :
                    active ? "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400" :
                    "bg-gray-800 border border-gray-700 text-gray-500"
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${active ? "text-white" : done ? "text-cyan-400" : "text-gray-500"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${step > s.id ? "bg-cyan-500/50" : "bg-gray-700"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* STEP 1: Country */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Select a Country</h2>
            <p className="text-gray-500 text-sm mb-5">Choose where you'd like your virtual number</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c)}
                  className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${
                    selectedCountry?.code === c.code
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-gray-700 bg-gray-800/40 hover:border-gray-600"
                  }`}
                >
                  <span className="text-2xl mb-2">{c.flag}</span>
                  <span className="text-white text-sm font-medium leading-tight">{c.name}</span>
                  <span className="text-cyan-400 text-xs mt-1">from ${c.price}/mo</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedCountry}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-bold rounded-xl transition-colors"
              >
                Next: Pick Number <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Number selection */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <h2 className="text-lg font-bold text-white">Pick a Number — {selectedCountry.name}</h2>
            </div>
            <p className="text-gray-500 text-sm mb-5">Optionally filter by area code</p>

            <div className="flex gap-3 mb-5">
              <input
                value={areaCode}
                onChange={e => setAreaCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchNumbers()}
                placeholder="Area code (optional)"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
              />
              <button
                onClick={searchNumbers}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 font-bold rounded-lg transition-colors text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Searching...
              </div>
            )}

            {!loading && searched && numbers.length === 0 && (
              <div className="text-center py-10 text-gray-600">
                <Phone className="w-8 h-8 mx-auto mb-2" />
                <p>No numbers found. Try removing the area code.</p>
              </div>
            )}

            {!loading && !searched && (
              <div className="text-center py-10 text-gray-700">
                <Phone className="w-8 h-8 mx-auto mb-2 text-cyan-500/30" />
                <p className="text-gray-500 text-sm">Click Search to find available numbers</p>
              </div>
            )}

            {numbers.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {numbers.map((num, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedNumber(num)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                      selectedNumber?.id === num.id
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-gray-700 bg-gray-800/40 hover:border-gray-600"
                    }`}
                  >
                    <div>
                      <div className="text-white font-medium text-sm">{num.city || num.type} — prefix +{num.prefix}</div>
                      <div className="flex gap-2 mt-1">
                        {num.voice_enabled && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase">Voice</span>}
                        {num.sms_enabled && <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase">SMS</span>}
                        <span className="text-[10px] text-gray-500">{num.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-400 font-bold">${parseFloat(num.monthly_fee).toFixed(2)}/mo</div>
                      {num.setup_fee > 0 && <div className="text-gray-600 text-xs">+${parseFloat(num.setup_fee).toFixed(2)} setup</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button onClick={goBack} className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedNumber}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-bold rounded-xl transition-colors"
              >
                Review Order <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && selectedNumber && (
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Confirm Your Order</h2>
            <p className="text-gray-500 text-sm mb-6">Review the details before checkout</p>

            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5 mb-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Country</span>
                <span className="text-white font-medium">{selectedCountry.flag} {selectedCountry.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Region / Type</span>
                <span className="text-white font-medium">{selectedNumber.city || "—"} · {selectedNumber.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Prefix</span>
                <span className="text-white font-medium">+{selectedNumber.prefix}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Features</span>
                <div className="flex gap-2">
                  {selectedNumber.voice_enabled && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase">Voice</span>}
                  {selectedNumber.sms_enabled && <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase">SMS</span>}
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Monthly fee</span>
                  <span className="text-cyan-400 font-bold text-lg">${parseFloat(selectedNumber.monthly_fee).toFixed(2)}/mo</span>
                </div>
                {selectedNumber.setup_fee > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400 text-sm">One-time setup fee</span>
                    <span className="text-white font-medium">${parseFloat(selectedNumber.setup_fee).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                  <span className="text-white font-semibold text-sm">Due today</span>
                  <span className="text-white font-bold text-lg">
                    ${(parseFloat(selectedNumber.monthly_fee) + parseFloat(selectedNumber.setup_fee || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {!user ? (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/25 rounded-lg text-yellow-300 text-sm">
                You must be logged in to complete the purchase.
              </div>
            ) : (
              <div className="mb-5">
                <p className="text-gray-400 text-sm mb-3 font-medium">Choose how to pay:</p>
                <div className="space-y-3">
                  {/* Pay with Credits */}
                  <button
                    onClick={handlePayWithCredits}
                    disabled={!hasEnoughCredits || !!checkingOut}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${
                      hasEnoughCredits
                        ? "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/40 hover:border-cyan-500/70"
                        : "bg-gray-800/40 border-gray-700 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold text-sm">Pay with Credits</p>
                        <p className="text-gray-500 text-xs">
                          Balance: ${userCredits.toFixed(2)} — {hasEnoughCredits ? "sufficient ✓" : `need $${totalCost.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                    {checkingOut === 'credits' ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : (
                      <span className="text-gray-500 text-xs">→</span>
                    )}
                  </button>

                  {/* Pay with Card */}
                  <button
                    onClick={handlePayWithStripe}
                    disabled={!!checkingOut}
                    className="w-full flex items-center justify-between px-4 py-4 bg-gray-800/40 hover:bg-gray-800 border border-gray-700 hover:border-indigo-500/40 rounded-xl transition-all disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold text-sm">Pay with Card</p>
                        <p className="text-gray-500 text-xs">Visa, Mastercard, Amex via Stripe</p>
                      </div>
                    </div>
                    {checkingOut === 'stripe' ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : (
                      <span className="text-gray-500 text-xs">→</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {checkoutError && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{checkoutError}</p>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={goBack} disabled={!!checkingOut} className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl transition-colors text-sm disabled:opacity-50">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {!user && (
                <button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-xl transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Login to Buy
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}