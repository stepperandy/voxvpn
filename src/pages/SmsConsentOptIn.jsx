import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import SmsConsentCheckbox from "@/components/SmsConsentCheckbox";
import { SMS_CONSENT_TEXT, SMS_CONSENT_VERSION, SMS_PRIVACY_POLICY_URL, SMS_TERMS_OF_SERVICE_URL, SMS_SUPPORT_EMAIL, SMS_SUPPORT_PHONE } from "@/lib/smsConsent";

export default function SmsConsentOptIn() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !phone) {
      setError("Please enter your email and phone number.");
      return;
    }

    if (!consentChecked) {
      setError("Please check the SMS consent box to opt in. Consent is optional — if you leave it unchecked, you will not be enrolled in SMS messaging.");
      return;
    }

    setLoading(true);

    try {
      await base44.functions.invoke("recordSmsConsent", {
        user_email: email,
        phone_number: phone,
        consent_given: true,
        consent_text: SMS_CONSENT_TEXT,
        consent_version: SMS_CONSENT_VERSION,
        source_url: window.location.href,
      });
      setSuccess(true);
    } catch (err) {
      setError("Failed to record consent. Please try again.");
      console.error("SMS consent error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">SMS Consent Recorded</h2>
          <p className="text-gray-400 text-sm mb-6">
            You have opted in to receive SMS messages from VoxTelefony. You can opt out at any time by replying STOP to any message or contacting our support team.
          </p>
          <Link
            to="/"
            className="inline-block bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SMS Opt-In</h1>
            <p className="text-gray-400 text-sm">VoxTelefony SMS Messaging Program</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mt-6">
          <div className="mb-6 space-y-3 text-sm text-gray-300">
            <h2 className="text-white font-semibold text-base">SMS Program Details</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span><strong>Message types:</strong> Account notifications, verification codes, customer-care messages, and messages you initiate through VoxTelefony.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span><strong>Frequency:</strong> Message frequency varies based on your usage and account activity.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span><strong>Rates:</strong> Message and data rates may apply from your mobile carrier.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span><strong>Opt out:</strong> Reply <code className="bg-gray-800 px-1.5 py-0.5 rounded text-cyan-400">STOP</code> to any message to opt out at any time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span><strong>Help:</strong> Reply <code className="bg-gray-800 px-1.5 py-0.5 rounded text-cyan-400">HELP</code> for help.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span><strong>Not a condition of purchase:</strong> Consent is optional and not required to use VoxTelefony services.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Data Privacy:</strong> Your mobile opt-in and consent data is not sold or shared with third parties for their marketing purposes. See our{" "}
              <a href={SMS_PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Privacy Policy</a> for details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-white font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Mobile Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="border-t border-gray-800 pt-5">
              <SmsConsentCheckbox checked={consentChecked} onChange={setConsentChecked} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
            >
              {loading ? "Recording..." : "Opt In to SMS"}
            </button>

            <p className="text-center text-gray-500 text-xs">
              By opting in, you agree to our{" "}
              <a href={SMS_TERMS_OF_SERVICE_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Terms of Service</a>
            </p>
          </form>
        </div>

        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <h3 className="text-white font-semibold mb-3 text-sm">Questions? Contact Us</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a href={`mailto:${SMS_SUPPORT_EMAIL}`} className="text-cyan-400 hover:underline">{SMS_SUPPORT_EMAIL}</a>
            <a href={`tel:${SMS_SUPPORT_PHONE}`} className="text-cyan-400 hover:underline">{SMS_SUPPORT_PHONE}</a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          © VoxDigits Communications LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}