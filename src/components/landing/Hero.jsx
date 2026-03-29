import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(139, 92, 246, 0.05) 25%, rgba(139, 92, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(139, 92, 246, 0.05) 75%, rgba(139, 92, 246, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(139, 92, 246, 0.05) 25%, rgba(139, 92, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(139, 92, 246, 0.05) 75%, rgba(139, 92, 246, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
              <CheckCircle size={16} className="text-violet-400" />
              <span className="text-violet-400 text-sm font-medium">10,000+ users protected worldwide</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
              Your Privacy, <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Our Priority</span>
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M2 8 Q75 2 150 8 Q225 14 298 6" stroke="url(#curveGrad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <defs>
                    <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a78bfa"/>
                      <stop offset="100%" stopColor="#22d3ee"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
              VoxVPN encrypts your connection, hides your identity, and unlocks the internet — on every device, everywhere in the world.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-full hover:opacity-90 transition-all transform hover:scale-105">
                Get Protected Now
              </button>
              <button className="px-8 py-3 border border-slate-500 text-white font-semibold rounded-full hover:border-violet-500 hover:text-violet-400 transition-colors">
                See How It Works
              </button>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-cyan-400" />
                <span className="text-slate-300">No-Logs Policy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-cyan-400" />
                <span className="text-slate-300">Blazing Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-cyan-400" />
                <span className="text-slate-300">10+ Locations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-cyan-400" />
                <span className="text-slate-300">AES-256 Bit</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-96 lg:h-full flex items-center justify-center"
          >
            <div className="relative w-72 h-72 lg:w-96 lg:h-96">
              {/* Animated glow rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border border-violet-500/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8 border border-cyan-500/10 rounded-full"
              />
              {/* Glow blob */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-violet-600/20 to-cyan-500/10 rounded-full blur-3xl" />
              </div>
              {/* Logo image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/60e9935e0_b1efe46e-2927-4692-89eb-53a6f756c8a6.png"
                  alt="VoxVPN"
                  className="w-56 h-56 lg:w-72 lg:h-72 object-contain drop-shadow-2xl"
                />
              </div>
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-8 right-4 w-16 h-16 bg-violet-500/10 rounded-lg border border-violet-500/30 flex items-center justify-center"
              >
                <span className="text-violet-400 text-xs font-bold">AES-256</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-8 left-4 w-12 h-12 bg-cyan-500/10 rounded-lg border border-cyan-500/30"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}