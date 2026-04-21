import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('vpn_token');
    const timer = setTimeout(() => {
      navigate(token ? '/app/servers' : '/app/login');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#060d1a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6 animate-pulse">
        <img
          src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
          alt="VoxVPN"
          className="w-36 h-auto drop-shadow-[0_0_24px_rgba(34,211,238,0.5)]"
        />
        <p className="text-cyan-400 text-sm font-medium tracking-widest uppercase">Secure · Private · Fast</p>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-400"
              style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <p className="text-slate-600 text-xs">Initializing secure connection...</p>
      </div>
    </div>
  );
}