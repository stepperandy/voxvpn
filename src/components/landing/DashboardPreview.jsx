import React from "react";
import { motion } from "framer-motion";

export default function DashboardPreview() {
  return (
    <section className="bg-[#0A192F] py-20 px-6 md:px-8">
      <motion.div
        className="max-w-6xl mx-auto flex items-center justify-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b202c06dc5b1988efe9645/b82df6745_generated_image.png"
          alt="Woman showcasing mobile phone"
          className="max-w-full h-auto rounded-2xl shadow-2xl"
        />
      </motion.div>
    </section>
  );
}