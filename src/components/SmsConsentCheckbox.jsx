import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { SMS_CONSENT_TEXT, SMS_CONSENT_VERSION, SMS_PRIVACY_POLICY_URL, SMS_TERMS_OF_SERVICE_URL } from "@/lib/smsConsent";

/**
 * Reusable SMS consent checkbox component.
 * Unchecked by default — users who leave it unchecked are NOT enrolled.
 *
 * Props:
 *  - checked: boolean (controlled)
 *  - onChange: (checked) => void
 */
export default function SmsConsentCheckbox({ checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked || false}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            checked
              ? "bg-cyan-500 border-cyan-500"
              : "border-gray-600 group-hover:border-cyan-500"
          }`}
        >
          {checked && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
        </div>
      </div>
      <span className="text-sm text-gray-300 leading-relaxed">
        {SMS_CONSENT_TEXT}{" "}
        <a
          href={SMS_PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline font-semibold"
        >
          Privacy Policy
        </a>{" "}
        and{" "}
        <a
          href={SMS_TERMS_OF_SERVICE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline font-semibold"
        >
          Terms of Service
        </a>
      </span>
    </label>
  );
}