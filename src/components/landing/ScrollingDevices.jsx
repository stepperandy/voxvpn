import React from "react";
import { motion } from "framer-motion";

export default function ScrollingDevices() {
  const countries = [
    { flag: "🇺🇸", name: "United States" },
    { flag: "🇨🇦", name: "Canada" },
    { flag: "🇬🇧", name: "United Kingdom" },
    { flag: "🇦🇺", name: "Australia" },
  ];

  const repeatedCountries = [...countries, ...countries, ...countries];

  return (
    <div className="w-full bg-gradient-to-b from-[#0d2137] to-[#0a1628] overflow-hidden">
      <motion.div
        className="flex gap-20 px-8"
        animate={{ x: [-1000, 0] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {repeatedCountries.map((country, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-4 min-w-max"
            whileHover={{ y: -8, scale: 1.1 }}
          >
            <div
              style={{
                perspective: "1000px",
              }}
            >
              <motion.div
                className="bg-gradient-to-br from-blue-400 to-blue-600 p-12 rounded-3xl shadow-2xl relative"
                style={{
                  boxShadow: `
                    0 20px 40px rgba(0, 0, 0, 0.5),
                    0 0 40px rgba(59, 130, 246, 0.3),
                    inset -2px -2px 8px rgba(0, 0, 0, 0.3),
                    inset 2px 2px 8px rgba(255, 255, 255, 0.2)
                  `,
                  transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
                }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                <span className="text-6xl relative z-10">{country.flag}</span>
              </motion.div>
            </div>
            <p className="text-gray-300 text-sm font-semibold">{country.name}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}