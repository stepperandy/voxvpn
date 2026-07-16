import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { useTwilioDevice } from '@/lib/TwilioDeviceContext';

export default function GlobalIncomingCallPopup() {
  const ctx = useTwilioDevice();
  const { incomingCaller, activeCall, acceptCall, rejectCall } = ctx || {};
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!activeCall) { setDuration(0); setMuted(false); return; }
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, [activeCall]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const toggleMute = () => {
    if (activeCall) { activeCall.mute(!muted); setMuted(m => !m); }
  };

  const hangUp = () => {
    if (activeCall) activeCall.disconnect();
  };

  if (!incomingCaller && !activeCall) return null;

  const popup = (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2147483647, // max z-index — overrides everything
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <style>{`
        @keyframes callPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 24px rgba(16,185,129,0); }
        }
        @keyframes ringRipple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '340px',
        margin: '0 16px',
        borderRadius: '28px',
        padding: '40px 28px 36px',
        background: 'linear-gradient(160deg, #0f172a 0%, #1a1f3a 100%)',
        border: '1px solid rgba(16,185,129,0.3)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
        textAlign: 'center',
        animation: 'slideUp 0.3s ease-out',
      }}>

        {activeCall ? (
          /* ── ACTIVE CALL ── */
          <>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))',
              border: '2px solid rgba(16,185,129,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Phone size={32} color="#10b981" />
            </div>
            <p style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 8px' }}>
              Connected
            </p>
            <p style={{ color: '#fff', fontSize: '22px', fontWeight: 700, fontFamily: 'monospace', margin: '0 0 6px', wordBreak: 'break-all' }}>
              {activeCall.parameters?.From || 'Unknown'}
            </p>
            <p style={{ color: '#10b981', fontSize: '28px', fontFamily: 'monospace', fontWeight: 300, margin: '0 0 32px' }}>
              {formatTime(duration)}
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button onClick={toggleMute} style={{
                width: '60px', height: '60px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: muted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                outline: muted ? '2px solid rgba(239,68,68,0.5)' : '2px solid rgba(255,255,255,0.15)',
              }}>
                {muted ? <MicOff size={24} color="#f87171" /> : <Mic size={24} color="#fff" />}
              </button>
              <button onClick={hangUp} style={{
                width: '72px', height: '72px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(239,68,68,0.5)',
              }}>
                <PhoneOff size={28} color="#fff" />
              </button>
            </div>
          </>
        ) : (
          /* ── INCOMING CALL ── */
          <>
            {/* Ripple rings */}
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '2px solid rgba(16,185,129,0.4)',
                  animation: `ringRipple 2s ease-out ${i * 0.6}s infinite`,
                }} />
              ))}
              <div style={{
                position: 'absolute', inset: '10px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))',
                border: '2px solid rgba(16,185,129,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'callPulse 1.5s ease-in-out infinite',
              }}>
                <Phone size={38} color="#10b981" />
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Incoming Call
            </p>
            <p style={{ color: '#fff', fontSize: '24px', fontWeight: 700, fontFamily: 'monospace', margin: '0 0 32px', wordBreak: 'break-all' }}>
              {incomingCaller}
            </p>

            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'center' }}>
              {/* Reject */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <button onClick={rejectCall} style={{
                  width: '68px', height: '68px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(239,68,68,0.5)',
                }}>
                  <PhoneOff size={28} color="#fff" />
                </button>
                <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>Decline</span>
              </div>

              {/* Accept */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <button onClick={acceptCall} style={{
                  width: '68px', height: '68px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.5)',
                }}>
                  <Phone size={28} color="#fff" />
                </button>
                <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600 }}>Accept</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(popup, document.body);
}