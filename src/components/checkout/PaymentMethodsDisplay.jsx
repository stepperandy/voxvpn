import React from "react";

export default function PaymentMethodsDisplay({ currencyPreview, className = "" }) {
  if (!currencyPreview?.payment_methods?.length) return null;

  const labels = currencyPreview.payment_method_labels || {};
  const methods = currencyPreview.payment_methods;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {methods.map((pm) => {
        const label = labels[pm] || { name: pm, icon: "💳" };
        return (
          <span
            key={pm}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-gray-300"
            title={label.name}
          >
            <span>{label.icon}</span>
            <span className="hidden sm:inline">{label.name}</span>
          </span>
        );
      })}
    </div>
  );
}