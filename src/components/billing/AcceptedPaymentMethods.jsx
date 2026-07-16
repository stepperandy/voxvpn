import React from "react";

export default function AcceptedPaymentMethods() {
  return (
    <div className="py-8">
      <h3 className="text-center text-2xl font-semibold text-gray-900 mb-8">Accepted Payment Methods</h3>
      <div className="flex justify-center items-center px-4">
        <img
          src="https://media.base44.com/images/public/69b202c06dc5b1988efe9645/5b9de6796_payeeicon.png"
          alt="Accepted Payment Methods"
          className="h-16 w-auto max-w-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}