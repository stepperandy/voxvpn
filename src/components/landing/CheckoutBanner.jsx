import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutBanner() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") setStatus("success");
    else if (params.get("checkout") === "cancel") setStatus("cancel");
  }, []);

  const dismiss = () => {
    setStatus(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState({}, "", url.toString());
  };

  if (!status) return null;

  const isSuccess = status === "success";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-medium max-w-sm w-full ${
          isSuccess ? "bg-green-600" : "bg-red-500"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="flex-1">
          {isSuccess
            ? "🎉 Subscription activated! Check your email for details."
            : "Checkout was cancelled. No charge was made."}
        </span>
        <button onClick={dismiss} className="ml-2 opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}