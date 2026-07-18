import React from "react";
import { Phone, Wifi, Signal, Radio, Smartphone, Monitor, Globe, Satellite, Zap, Bell, MessageSquare, Cloud } from "lucide-react";

const FLOATING_OBJECTS = [
  { icon: Phone, size: 28, color: "#67e8f9", top: "8%", left: "5%", duration: 18, delay: 0, rotate: true },
  { icon: Wifi, size: 24, color: "#a78bfa", top: "15%", left: "80%", duration: 22, delay: 2, rotate: false },
  { icon: Signal, size: 26, color: "#34d399", top: "70%", left: "10%", duration: 20, delay: 1, rotate: false },
  { icon: Smartphone, size: 30, color: "#fbbf24", top: "80%", left: "85%", duration: 25, delay: 3, rotate: true },
  { icon: Globe, size: 32, color: "#f472b6", top: "30%", left: "88%", duration: 28, delay: 1.5, rotate: true },
  { icon: Radio, size: 26, color: "#60a5fa", top: "55%", left: "92%", duration: 19, delay: 4, rotate: false },
  { icon: Satellite, size: 28, color: "#c084fc", top: "12%", left: "45%", duration: 30, delay: 0.5, rotate: true },
  { icon: Zap, size: 22, color: "#fcd34d", top: "85%", left: "50%", duration: 16, delay: 2.5, rotate: false },
  { icon: Monitor, size: 28, color: "#5eead4", top: "40%", left: "3%", duration: 24, delay: 3.5, rotate: false },
  { icon: MessageSquare, size: 24, color: "#fb923c", top: "65%", left: "40%", duration: 21, delay: 1, rotate: false },
  { icon: Bell, size: 22, color: "#a5b4fc", top: "20%", left: "20%", duration: 17, delay: 5, rotate: true },
  { icon: Cloud, size: 30, color: "#94a3b8", top: "50%", left: "60%", duration: 26, delay: 2, rotate: false },
];

const STARS = Array.from({ length: 60 }, (_, i) => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 2 + 1,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 5,
}));

export default function MoonTelephonyBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Night sky gradient */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #050816 0%, #0a0a2e 30%, #0d1b3e 60%, #050816 100%)" }} />

      {/* Twinkling stars */}
      {STARS.map((s, i) => (
        <div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: 0.3,
            animation: `vt-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Floating telephony objects */}
      {FLOATING_OBJECTS.map((obj, i) => {
        const Icon = obj.icon;
        return (
          <div
            key={`obj-${i}`}
            className="absolute"
            style={{
              top: obj.top,
              left: obj.left,
              animation: `vt-float ${obj.duration}s ease-in-out ${obj.delay}s infinite${obj.rotate ? `, vt-spin ${obj.duration * 1.5}s linear ${obj.delay}s infinite` : ""}`,
            }}
          >
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                width: `${obj.size + 16}px`,
                height: `${obj.size + 16}px`,
                background: `${obj.color}12`,
                border: `1px solid ${obj.color}25`,
                backdropFilter: "blur(2px)",
              }}
            >
              <Icon size={obj.size} style={{ color: obj.color, opacity: 0.5 }} />
            </div>
          </div>
        );
      })}

      {/* Nebula glows */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-8" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-5" style={{ background: "radial-gradient(circle, #10b981, transparent)", transform: "translate(-50%,-50%)" }} />

      <style>{`
        @keyframes vt-twinkle {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        @keyframes vt-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.05); }
          50% { transform: translate(-15px, -50px) scale(0.95); }
          75% { transform: translate(-25px, -20px) scale(1.02); }
        }
        @keyframes vt-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}