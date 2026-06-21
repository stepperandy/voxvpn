import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Marcus Reed',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    text: 'VoxVPN is the fastest VPN I have used. Streaming is buffer-free and the kill switch gives me peace of mind on public Wi-Fi.',
  },
  {
    name: 'Elena Petrova',
    role: 'Digital Nomad',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    text: 'I travel full-time and VoxVPN keeps me connected everywhere. The global server coverage is incredible and setup took two minutes.',
  },
  {
    name: 'James Okoye',
    role: 'Small Business Owner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    text: 'Running a remote team means security is non-negotiable. The no-logs policy and AES-256 encryption checked every box for us.',
  },
  {
    name: 'Priya Sharma',
    role: 'Content Creator',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    text: 'I access geo-restricted content daily for my work. VoxVPN unblocks everything seamlessly with zero speed loss. Highly recommend.',
  },
  {
    name: 'David Chen',
    role: 'IT Consultant',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    text: 'The customer support team resolved my issue in minutes. Professional, fast, and reliable — exactly what I need from a VPN provider.',
  },
  {
    name: 'Sofia Almeida',
    role: 'Freelance Designer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    text: 'Affordable, secure, and easy to use. The split tunneling feature is a game-changer for managing work and personal traffic.',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#080c18] border-t border-white/5 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Star size={12} className="text-cyan-400 fill-cyan-400" />
            <span className="text-cyan-400 text-xs font-bold tracking-wide">4.9 / 5 — 12,000+ REVIEWS</span>
          </div>
          <h2 className="text-white text-3xl sm:text-4xl font-black tracking-tight">Loved by Users Worldwide</h2>
          <p className="text-slate-500 text-sm mt-3 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust VoxVPN to protect their privacy every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: 'linear-gradient(135deg, #0d1120, #060c1a)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <Quote size={28} className="text-cyan-400/15 absolute top-4 right-4" />

              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} size={13} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.text}"</p>

              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-white text-xs font-bold">{t.name}</p>
                  <p className="text-slate-500 text-[10px]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}