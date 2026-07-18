import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function PricingCard({ plan, index }) {
  const isFeatured = plan.featured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative p-8 rounded-3xl transition-all duration-300 ${
        isFeatured
          ? "border-2 border-cyan-500 bg-[#0A192F] shadow-2xl shadow-cyan-500/10 md:scale-105 z-10"
          : "border border-gray-200 bg-white hover:shadow-xl"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
          {plan.badge}
        </div>
      )}

      <h3
        className={`text-xl font-bold mb-2 ${
          isFeatured ? "text-white" : "text-gray-900"
        }`}
      >
        {plan.name}
      </h3>
      <p
        className={`text-sm mb-6 font-medium ${
          isFeatured ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {plan.description}
      </p>

      <div
        className={`text-4xl font-extrabold mb-6 ${
          isFeatured ? "text-white" : "text-[#0A192F]"
        }`}
      >
        {plan.price}
        {plan.period && (
          <span
            className={`text-sm font-normal ${
              isFeatured ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {" "}
            {plan.period}
          </span>
        )}
      </div>

      <ul className="text-left space-y-4 mb-8">
        {plan.features.map((feature, i) => (
          <li
            key={i}
            className={`flex items-start gap-2.5 text-sm ${
              isFeatured ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <Check
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                isFeatured ? "text-cyan-400" : "text-cyan-500"
              }`}
            />
            {feature}
          </li>
        ))}
      </ul>

      <button
        className={`w-full font-bold py-3.5 rounded-xl transition-all duration-200 text-sm ${
          isFeatured
            ? "bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
            : plan.buttonStyle === "dark"
            ? "border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
            : "border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50"
        }`}
      >
        {plan.buttonText}
      </button>
    </motion.div>
  );
}