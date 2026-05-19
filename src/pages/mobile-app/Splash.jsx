import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0=init 1=glow 2=ready
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setPhase(1), 300);
    setTimeout(() => setPhase(2), 1400);

    intervalRef.current = setInterval(() => {
      setProgress(p => Math.min(p + 2.2, 100));
    }, 40);

    timerRef.current = setTimeout(() => {
      const token = localStorage.getItem('vpn_token');
      navigate(token ? '/app/servers' : '/app/login');
    }, 2600);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #0b1a30 0%, #060b16 55%, #020508 100%)' }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial glow behind orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${phase >= 1 ? 'rgba(0,212,255,0.14)' : 'rgba(0,212,255,0)'} 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />

      {/* Logo orb */}
      <div className="relative flex items-center justify-center z-10 mb-10">
        {/* Outer rings */}
        {[160, 120, 88].map((size, i) => (
          <div
            key={size}
            className="absolute rounded-full border"
            style={{
              width: size,
              height: size,
              borderColor: `rgba(0,212,255,${0.08 + i * 0.06})`,
              animation: `pingRing ${2 + i * 0.3}s ease-out ${i * 0.25}s infinite`,
            }}
          />
        ))}

        {/* Core orb */}
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700"
          style={{
            background: 'radial-gradient(circle at 40% 35%, rgba(0,212,255,0.18), rgba(0,60,120,0.25))',
            border: `2px solid rgba(0,212,255,${phase >= 1 ? 0.55 : 0.2})`,
            boxShadow: phase >= 1
              ? '0 0 50px rgba(0,212,255,0.35), 0 0 20px rgba(0,212,255,0.2), inset 0 0 30px rgba(0,212,255,0.08)'
              : 'none',
          }}
        >
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="w-14 h-auto transition-all duration-700"
            style={{
              filter: phase >= 1
                ? 'drop-shadow(0 0 14px rgba(0,212,255,0.9)) brightness(1.1)'
                : 'drop-shadow(0 0 0px transparent)',
            }}
          />
        </div>
      </div>

      {/* Brand text */}
      <div className="z-10 flex flex-col items-center mb-16">
        <h1
          className="text-white font-black text-4xl tracking-tight transition-all duration-700"
          style={{
            textShadow: phase >= 1 ? '0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)' : 'none',
            letterSpacing: '-0.02em',
          }}
        >
          VoxVPN
        </h1>
        <p
          className="text-[11px] font-bold tracking-[0.35em] uppercase mt-1.5 transition-all duration-700"
          style={{ color: phase >= 1 ? '#00d4ff' : '#1e3a4f' }}
        >
          Military-Grade Privacy
        </p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 w-52 z-10 flex flex-col items-center gap-2">
        <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00d4ff, #00c47a)',
              boxShadow: '0 0 12px rgba(0,212,255,0.9)',
              transition: 'width 75ms linear',
            }}
          />
        </div>
        <p className="text-[10px] text-slate-700 tracking-widest uppercase">
          {phase < 2 ? 'Initializing secure tunnel…' : 'Ready'}
        </p>
      </div>

      <style>{`
        @keyframes pingRing {
          0%   { transform: scale(1);    opacity: 0.6; }
          80%  { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
    </div>
  );
}