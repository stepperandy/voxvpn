import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Shield, FileText, CheckCircle, AlertCircle } from "lucide-react";
import SmsConsentCheckbox from "@/components/SmsConsentCheckbox";
import { SMS_CONSENT_TEXT, SMS_CONSENT_VERSION } from "@/lib/smsConsent";

export default function TermsAgreement() {
  const [agreed, setAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pre-fill referral code from URL (?ref=CODE) or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get("ref");
    if (urlRef) {
      const code = urlRef.toUpperCase();
      setReferralCode(code);
      localStorage.setItem("pending_referral_code", code);
    } else {
      const stored = localStorage.getItem("pending_referral_code");
      if (stored) setReferralCode(stored);
    }
  }, []);

  // Get the next URL from query params (where to go after agreeing)
  const params = new URLSearchParams(window.location.search);
  const nextUrl = params.get("next") || "/Dashboard";

  const handleContinue = () => {
    if (!agreed || !privacyAgreed || !ageConfirmed) {
      setError("You must confirm your age and agree to all policies to continue.");
      return;
    }
    setError(null);
    // Store agreement in localStorage so we remember this user agreed
    localStorage.setItem("terms_agreed_v1", "true");
    // Store SMS consent state — persisted to SmsConsent entity after login if opted in
    localStorage.setItem("sms_consent_opt_in", smsConsent ? "true" : "false");
    localStorage.setItem("sms_consent_timestamp", new Date().toISOString());
    localStorage.setItem("sms_consent_source_url", window.location.href);
    localStorage.setItem("sms_consent_version", SMS_CONSENT_VERSION);
    localStorage.setItem("sms_consent_text", SMS_CONSENT_TEXT);
    if (referralCode.trim()) {
      localStorage.setItem("pending_referral_code", referralCode.trim());
    }
    // Redirect to login with the original next URL
    base44.auth.redirectToLogin(nextUrl);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}
    >
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/e6163c0d6_TELLOGO11.png"
            alt="VoxTelefony"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-extrabold text-white">Before you sign up</h1>
          <p className="text-gray-400 text-sm mt-2">Please review and agree to our terms to continue</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {/* Terms Summary */}
          <div className="mb-6 space-y-3">
            {[
              "You must be 18 years or older to use our services.",
              "Virtual numbers and eSIMs are for lawful use only — no spam, fraud, or illegal activity.",
              "Purchased plans are non-refundable once activated.",
              "We may suspend accounts that violate our Acceptable Use Policy.",
              "Your data is handled per our Privacy Policy.",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">{item}</p>
              </div>
            ))}
          </div>

          <div
            className="border-t border-white/10 pt-5 space-y-4"
          >
            {/* Terms of Service checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    agreed
                      ? "bg-cyan-500 border-cyan-500"
                      : "border-gray-600 group-hover:border-cyan-500"
                  }`}
                >
                  {agreed && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                </div>
              </div>
              <span className="text-sm text-gray-300">
                I agree to the{" "}
                <Link
                  to="/LegalPolicy?type=terms"
                  target="_blank"
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/LegalPolicy?type=aup"
                  target="_blank"
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Acceptable Use Policy
                </Link>
              </span>
            </label>

            {/* Age confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={e => setAgeConfirmed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    ageConfirmed
                      ? "bg-cyan-500 border-cyan-500"
                      : "border-gray-600 group-hover:border-cyan-500"
                  }`}
                >
                  {ageConfirmed && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                </div>
              </div>
              <span className="text-sm text-gray-300">
                I confirm that I am <span className="text-white font-semibold">18 years of age or older</span>
              </span>
            </label>

            {/* Privacy Policy checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={e => setPrivacyAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    privacyAgreed
                      ? "bg-cyan-500 border-cyan-500"
                      : "border-gray-600 group-hover:border-cyan-500"
                  }`}
                >
                  {privacyAgreed && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                </div>
              </div>
              <span className="text-sm text-gray-300">
                I have read and agree to the{" "}
                <Link
                  to="/LegalPolicy?type=privacy"
                  target="_blank"
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* SMS Consent (optional, unchecked) */}
            <div className="border-t border-white/10 pt-4">
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Optional: SMS Notifications</span>
              </div>
              <SmsConsentCheckbox checked={smsConsent} onChange={setSmsConsent} />
            </div>

            {/* Referral Code (optional) */}
            <div>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Referral code (optional)"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                agreed && privacyAgreed && ageConfirmed
                  ? "text-white hover:scale-105"
                  : "opacity-50 cursor-not-allowed text-gray-400"
              }`}
              style={
                agreed && privacyAgreed && ageConfirmed
                  ? { background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", boxShadow: "0 0 20px rgba(6,182,212,0.3)" }
                  : { background: "rgba(255,255,255,0.08)" }
              }
            >
              Agree & Continue to Sign Up →
            </button>

            <p className="text-center text-xs text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => base44.auth.redirectToLogin("/Dashboard")}
                className="text-cyan-400 hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          © VoxDigits Communications LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}