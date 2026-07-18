import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const countries = [
  { flag: "🇺🇸", name: "United States", type: "Local & Toll-Free", price: "$4.99", code: "US", features: ["Unlimited Inbound SMS", "Voice Ready", "Instant Activation"] },
  { flag: "🇨🇦", name: "Canada", type: "Local Numbers", price: "$5.99", code: "CA", features: ["Unlimited Inbound SMS", "Voice Ready", "Instant Activation"] },
  { flag: "🇬🇧", name: "United Kingdom", type: "Local Numbers", price: "$6.99", code: "GB", features: ["Unlimited Inbound SMS", "Voice Ready", "Instant Activation"] },
  { flag: "🇦🇺", name: "Australia", type: "Local Numbers", price: "$7.99", code: "AU", features: ["Unlimited Inbound SMS", "Voice Ready", "Instant Activation"] },
];

export default function PricingSection() {
  const navigate = useNavigate();

  const handleGetNumber = (countryCode) => {
    navigate(createPageUrl(`NumberSearch?country=${countryCode}`));
  };

  return (
    <section id="pricing" className="py-20 md:py-24 px-6 md:px-10" style={{ background: "linear-gradient(180deg, #1a0a35 0%, #120827 100%)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
           <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Virtual Number Pricing</h2>
           <p className="text-gray-400 max-w-xl mx-auto">Simple monthly pricing. No contracts. Cancel anytime.</p>
         </motion.div>



        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {countries.map((c, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-6 hover:shadow-xl transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl mb-3">{c.flag}</div>
              <h3 className="font-extrabold text-white text-lg">{c.name}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{c.type}</p>
              <div className="my-4 border-t border-white/10" />
              <div className="text-3xl font-extrabold text-orange-400">{c.price}<span className="text-base font-normal text-gray-400">/mo</span></div>
              <ul className="mt-4 space-y-2">
                {c.features.map((f, fi) => (
                  <li key={fi} className="text-xs text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleGetNumber(c.code)}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-2.5 rounded-full transition-colors"
              >
                Get Number
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}