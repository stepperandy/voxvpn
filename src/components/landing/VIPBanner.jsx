import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Star } from "lucide-react";

export default function VIPBanner() {
  return (
    <section className="py-20 px-6 md:px-10" style={{ background: "linear-gradient(135deg, #1e0a3c 0%, #2d0a5a 50%, #1a0a35 100%)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span className="text-orange-400 font-semibold text-sm uppercase tracking-widest">VIP Number</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Stand Out With a<br />Premium VIP Number
            </h2>
            <p className="text-purple-200 leading-relaxed mb-8 max-w-md">
              Choose a memorable, easy-to-repeat number that your customers will never forget. Perfect for businesses that want to make a lasting impression.
            </p>
            <Link
              to={createPageUrl("NumberSearch")}
              className="inline-block bg-orange-500 hover:bg-orange-400 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-orange-500/30"
            >
              Browse VIP Numbers
            </Link>
          </motion.div>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b202c06dc5b1988efe9645/5cf138dab_generated_image.png"
              alt="VoxDigits dialer interface"
              className="w-72 h-80 object-cover rounded-3xl shadow-2xl shadow-orange-500/40"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}