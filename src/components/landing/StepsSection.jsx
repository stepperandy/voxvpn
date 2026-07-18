import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Pick a Country",
    description: "Select from over 60 countries and thousands of area codes worldwide.",
  },
  {
    number: "2",
    title: "Add Credits",
    description: "Top up your wallet securely using Stripe, PayPal, or Crypto.",
  },
  {
    number: "3",
    title: "Instant Activation",
    description: "Start receiving SMS and making calls immediately through our dashboard.",
  },
];

export default function StepsSection() {
  return (
    <section className="py-20 md:py-24 px-6 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-[#0A192F] text-3xl md:text-4xl font-extrabold tracking-tight">
            Three Steps to Freedom
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-sm">
                {step.number}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
              <p className="text-gray-500 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}