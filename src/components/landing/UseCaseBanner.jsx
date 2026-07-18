import React from "react";
import { motion } from "framer-motion";

const cases = [
  { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80", title: "Freelancers", desc: "Keep work and personal life separate with a dedicated business number." },
  { img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&q=80", title: "Businesses", desc: "Get local numbers in every market you operate in." },
  { img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&q=80", title: "Travelers", desc: "Stay reachable with a local number wherever you go." },
  { img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80", title: "Developers", desc: "Build SMS & voice apps with our powerful API." },
];

export default function UseCaseBanner() {
  return (
    <section className="py-20 px-6 md:px-10" style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Call, Text, and Connect<br />Across the World
          </h2>
          <p className="text-orange-100 max-w-xl mx-auto">VoxDigits is the communication platform for everyone — from solo freelancers to global enterprises.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <img src={c.img} alt={c.title} className="w-full h-36 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}