import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, LogIn, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

const faqs = [
  { q: "What is a virtual phone number?", a: "A virtual phone number is a telephone number that isn't tied to a physical SIM card or phone line. It works over the internet, allowing you to make calls and send texts from any device, anywhere in the world." },
  { q: "Can I use a virtual number for WhatsApp or Telegram?", a: "Yes! Our virtual numbers support SMS verification, making them perfect for registering WhatsApp, Telegram, Signal, and other messaging apps. You'll receive the verification code via SMS instantly." },
  { q: "How quickly can I get a number?", a: "Numbers are activated instantly. Once you choose your number and complete payment, you can start making calls and sending SMS within seconds — no waiting, no delays." },
  { q: "Can I keep my number if I cancel?", a: "If you cancel your subscription, your number will be released after a 30-day grace period. You can reactivate at any time during this period without losing your number." },
  { q: "Do you support international calls?", a: "Yes, our numbers support both inbound and outbound calls to most countries worldwide, at competitive per-minute rates. You can also forward calls to any phone number globally." },
  { q: "What countries are available for virtual numbers?", a: "We offer virtual numbers in 60+ countries including the US, Canada, UK, Australia, Germany, France, and many more. Local, toll-free, and mobile number types are available depending on the country." },
  { q: "Can I send and receive SMS messages?", a: "Yes! All our virtual numbers support two-way SMS — you can send and receive text messages from your dashboard, mobile app, or via our API. SMS is included in your monthly plan." },
  { q: "What happens when I receive a call?", a: "Incoming calls ring directly in your VoxDigits app. You can also set up call forwarding to route calls to your real mobile number, a SIP address, or voicemail automatically." },
  { q: "How does billing and renewal work?", a: "Your virtual number is billed monthly on the same date you signed up. Renewals are automatic unless you cancel. You'll receive an email reminder 3 days before each renewal." },
  { q: "Can I have multiple virtual numbers?", a: "Absolutely. You can purchase as many virtual numbers as you need across different countries. Each number is managed independently from your dashboard with its own settings and inbox." },
  { q: "Is my number private and secure?", a: "Yes. Your real phone number is never exposed to callers or SMS recipients — they only see your virtual number. All communication is encrypted and we never share your data with third parties." },
  { q: "What if I don't use my number for a while?", a: "Your number stays active as long as your subscription is paid. There's no 'use it or lose it' policy — inactive numbers are retained and renewed normally on your billing date." },
  { q: "Can I port my existing number to VoxDigits?", a: "Yes, number porting is supported for eligible numbers. The process typically takes 3-7 business days. Contact our support team to initiate a porting request." },
  { q: "Do you offer a free trial?", a: "We offer a risk-free 30-day period — if you're not satisfied, contact support for a full refund. You can also test with a basic plan before committing to premium features." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover), as well as Apple Pay and Google Pay through our secure Stripe checkout." },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setIsAuthenticated(!!user);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await base44.auth.logout();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    try {
      base44.auth.redirectToLogin(window.location.href);
    } catch (err) {
      console.error('Login redirect failed:', err);
      setIsLoading(false);
    }
  };

  return (
    <section id="faq" className="py-20 md:py-24 px-6 md:px-10" style={{ background: "linear-gradient(180deg, #1a0a35 0%, #120827 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">FAQs</h2>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            )}
          </div>
          <p className="text-gray-400">Answers to common questions about VoxDigits.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center px-6 py-4 text-left text-white font-semibold hover:bg-white/5 transition-colors"
              >
                {faq.q}
                <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}