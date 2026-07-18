import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, PhoneOff, Mic, MicOff, ChevronDown, Delete, Volume2, Grid3x3, Clock, ShoppingCart, Pause, ArrowRightLeft, Plus, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ContactPicker from "../components/dialer/ContactPicker.jsx";
import { useTwilioDevice } from "@/lib/TwilioDeviceContext";
import CallHistory from "@/components/dialer/CallHistory";
import InsufficientCreditsModal from "@/components/InsufficientCreditsModal";

const KEYS = [
  { key: "1", sub: "" },
  { key: "2", sub: "ABC" },
  { key: "3", sub: "DEF" },
  { key: "4", sub: "GHI" },
  { key: "5", sub: "JKL" },
  { key: "6", sub: "MNO" },
  { key: "7", sub: "PQRS" },
  { key: "8", sub: "TUV" },
  { key: "9", sub: "WXYZ" },
  { key: "*", sub: "" },
  { key: "0", sub: "+", longPress: "+" },
  { key: "#", sub: "" },
];

function KeyButton({ keyData, onPress, disabled }) {
  const longPressTimer = useRef(null);
  const triggered = useRef(false);
  const [pressed, setPressed] = useState(false);

  const down = () => {
    triggered.current = false;
    setPressed(true);
    if (keyData.longPress) {
      longPressTimer.current = setTimeout(() => {
        triggered.current = true;
        onPress(keyData.longPress);
      }, 500);
    }
  };

  const up = () => {
    clearTimeout(longPressTimer.current);
    setPressed(false);
    if (!triggered.current) onPress(keyData.key);
    triggered.current = false;
  };

  return (
    <motion.button
      disabled={disabled}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={() => { clearTimeout(longPressTimer.current); setPressed(false); }}
      onContextMenu={e => e.preventDefault()}
      whileTap={{ scale: 0.88 }}
      className="relative flex flex-col items-center justify-center rounded-full select-none disabled:opacity-25"
      style={{
        height: 76,
        background: pressed
          ? "radial-gradient(circle at 40% 40%, rgba(99,179,237,0.25), rgba(255,255,255,0.08))"
          : "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.03))",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: pressed
          ? "0 0 20px rgba(99,179,237,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
          : "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        backdropFilter: "blur(8px)",
      }}
    >
      <span className="text-[28px] font-light text-white leading-none z-10">{keyData.key}</span>
      {keyData.sub && (
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5 z-10 text-blue-300/80">
          {keyData.sub}
        </span>
      )}
    </motion.button>
  );
}

function CallActionBtn({ icon, label, active, color, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className="flex flex-col items-center gap-2 py-4 rounded-3xl transition-all"
      style={{
        background: active ? `${color || "#fff"}22` : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? `${color || "#fff"}44` : "rgba(255,255,255,0.08)"}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      <span style={{ color: active ? color || "#fff" : "rgba(255,255,255,0.8)" }}>{icon}</span>
      <span className="text-[11px] font-semibold" style={{ color: active ? color || "#fff" : "rgba(255,255,255,0.5)" }}>{label}</span>
    </motion.button>
  );
}

export default function Dialer() {
  const { deviceRef, deviceReady, demoMode } = useTwilioDevice();
  const wasEverReady = useRef(false);
  if (deviceReady) wasEverReady.current = true;
  const stableReady = deviceReady || wasEverReady.current;

  const [number, setNumber] = useState("");
  const [virtualNumbers, setVirtualNumbers] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState("");
  const [outboundCall, setOutboundCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [showForwardInput, setShowForwardInput] = useState(false);
  const [forwardNumber, setForwardNumber] = useState("");
  const [globalForwardNumber, setGlobalForwardNumber] = useState("");
  const [globalForwardingEnabled, setGlobalForwardingEnabled] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("keypad");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [demoCall, setDemoCall] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setUserCredits(user?.credits || 0);
      base44.entities.VirtualNumber.filter({ userId: user.id }).then(userNums => {
        setVirtualNumbers(userNums || []);
        if (userNums?.length > 0) setSelectedFrom(userNums[0].number);
      }).catch(err => console.error("VirtualNumber fetch error:", err));
    }).catch(() => setError("Please log in to use the dialer."));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || activeTab !== 'keypad') return;
      const key = e.key;
      if (/^[0-9*#+]$/.test(key)) { e.preventDefault(); setNumber(p => p + key); }
      else if (key === 'Backspace') { e.preventDefault(); setNumber(p => p.slice(0, -1)); }
      else if (key === 'Enter' && number && stableReady && !outboundCall) { e.preventDefault(); handleCall(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [number, activeTab, outboundCall, stableReady]);

  useEffect(() => {
    if (outboundCall || demoCall) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
      setMuted(false);
      setSpeaker(false);
      setOnHold(false);
      setShowForwardInput(false);
    }
    return () => clearInterval(timerRef.current);
  }, [outboundCall, demoCall]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleCall = async () => {
    if (!number) { setError("Enter a number"); return; }
    if (!selectedFrom && !demoMode) { setError("No virtual number selected"); return; }
    setError("");
    if (demoMode || !deviceRef?.current) { setDemoCall(true); return; }
    try {
      const call = await deviceRef.current.connect({
        params: { To: number, PhoneNumber: number, callerId: selectedFrom }
      });
      setOutboundCall(call);
      call.on("disconnect", () => setOutboundCall(null));
      call.on("cancel", () => setOutboundCall(null));
      call.on("error", (err) => {
        const errMsg = err?.message || '';
        if (errMsg.includes('insufficient') || errMsg.includes('credit')) setShowInsufficientCredits(true);
        else setDemoCall(true);
        setOutboundCall(null);
      });
    } catch (e) { setDemoCall(true); }
  };

  const handleHangUp = () => {
    outboundCall?.disconnect();
    setOutboundCall(null);
    setDemoCall(false);
  };

  const toggleMute = () => { if (outboundCall) { outboundCall.mute(!muted); setMuted(m => !m); } };
  const toggleHold = () => { if (outboundCall) { outboundCall.mute(!onHold); setOnHold(h => !h); } };

  const handleForward = async () => {
    if (!forwardNumber) return;
    handleHangUp();
    setNumber(forwardNumber);
    setForwardNumber("");
    setShowForwardInput(false);
    setTimeout(() => handleCall(), 300);
  };

  const statusReady = stableReady;

  // Shared active call / demo call screen
  const isInCall = outboundCall || demoCall;

  if (isInCall) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-between px-5 pt-14 pb-10 relative overflow-hidden"
        style={{ background: "linear-gradient(170deg, #0d0719 0%, #120f2e 50%, #0a0e1a 100%)" }}>

        {/* Animated rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: `${180 + i * 100}px`, height: `${180 + i * 100}px`,
                border: `1px solid rgba(52,211,153,${0.15 - i * 0.04})`,
                animation: `ping ${1.5 + i * 0.5}s cubic-bezier(0,0,0.2,1) infinite`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.6,
              }} />
          ))}
          <div className="absolute w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(52,211,153,0.12), transparent 70%)" }} />
        </div>

        {/* Top: avatar + number + timer */}
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
            style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(99,102,241,0.2))", border: "2px solid rgba(52,211,153,0.4)" }}>
            <UserCircle2 className="w-12 h-12 text-emerald-300/70" />
          </div>
          <div className="text-center">
            <p className="text-white text-3xl font-light tracking-wider font-mono">{number}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-emerald-400 text-sm font-semibold">{demoCall ? "Demo Call · " : "Active · "}{formatTime(callDuration)}</p>
            </div>
          </div>
        </div>

        {/* Call controls */}
        <div className="w-full max-w-xs relative z-10 space-y-4">
          {onHold && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-2xl"
              style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}>
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs font-bold">Call on Hold</span>
            </div>
          )}

          {showForwardInput && (
            <div className="rounded-2xl p-3 space-y-2"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Forward to</p>
              <div className="flex gap-2">
                <input value={forwardNumber} onChange={e => setForwardNumber(e.target.value)}
                  placeholder="+1 555 000 0000" autoFocus
                  className="flex-1 bg-transparent text-white text-sm font-mono outline-none placeholder-gray-600" />
                <button onClick={handleForward}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>Go</button>
                <button onClick={() => setShowForwardInput(false)} className="text-gray-500 hover:text-white text-sm">✕</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <CallActionBtn icon={muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              label={muted ? "Unmute" : "Mute"} active={muted} color="#f87171" onClick={toggleMute} />
            <CallActionBtn icon={<Volume2 className="w-6 h-6" />}
              label="Speaker" active={speaker} color="#60a5fa" onClick={() => setSpeaker(s => !s)} />
            <CallActionBtn icon={<Grid3x3 className="w-6 h-6" />}
              label="Keypad" active={false} onClick={() => {}} />
            <CallActionBtn icon={<Pause className="w-6 h-6" />}
              label={onHold ? "Resume" : "Hold"} active={onHold} color="#fbbf24" onClick={toggleHold} />
            <CallActionBtn icon={<ArrowRightLeft className="w-6 h-6" />}
              label="Forward" active={showForwardInput} color="#a78bfa" onClick={() => setShowForwardInput(f => !f)} />
            <CallActionBtn icon={<Plus className="w-6 h-6" />}
              label="Add Call" active={false} onClick={() => {}} />
          </div>

          {/* Hang up */}
          <div className="flex justify-center pt-2">
            <motion.button onClick={handleHangUp} whileTap={{ scale: 0.88 }}
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #ff3b30, #c0392b)",
                boxShadow: "0 0 50px rgba(255,59,48,0.5), 0 8px 32px rgba(0,0,0,0.5)",
              }}>
              <PhoneOff className="w-8 h-8 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── IDLE DIALER ──
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(170deg, #0a0712 0%, #0f0d25 50%, #09090f 100%)" }}>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(ellipse, #818cf8, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #34d399, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1 max-w-sm mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex gap-1 rounded-2xl p-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { id: "keypad", icon: <Grid3x3 className="w-4 h-4" />, label: "Keypad" },
              { id: "recents", icon: <Clock className="w-4 h-4" />, label: "Recents" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={activeTab === t.id
                  ? { background: "rgba(255,255,255,0.13)", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }
                  : { color: "#4b5563" }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={{
              background: statusReady ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
              border: `1px solid ${statusReady ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)"}`,
              color: statusReady ? "#34d399" : "#fbbf24",
            }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusReady ? "#34d399" : "#fbbf24" }} />
            {statusReady ? "Ready" : "Connecting"}
          </div>
        </div>

        {/* From number selector */}
        {virtualNumbers.length > 0 && activeTab === "keypad" && (
          <div className="px-5 mb-3 relative">
            <button onClick={() => setShowFromPicker(p => !p)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(99,179,237,0.15)", border: "1px solid rgba(99,179,237,0.25)" }}>
                <Phone className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Calling from</p>
                <p className="text-white text-sm font-mono font-medium leading-tight">{selectedFrom || "No number"}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
            <AnimatePresence>
              {showFromPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-5 right-5 mt-2 rounded-2xl overflow-hidden z-30 shadow-2xl"
                  style={{ background: "#131924", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {virtualNumbers.map(n => (
                    <button key={n.id}
                      onClick={() => { setSelectedFrom(n.number); setShowFromPicker(false); }}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 font-mono border-b border-white/5 last:border-0 transition-colors">
                      {n.number}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {error && (
          <div className="mx-5 mb-3 p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <p className="text-xs text-red-400 text-center mb-2">{error}</p>
            {error.includes("virtual number") && (
              <Link to="/VirtualNumbers" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors">
                <ShoppingCart className="w-4 h-4" /> Buy Virtual Number
              </Link>
            )}
          </div>
        )}

        <InsufficientCreditsModal
          isOpen={showInsufficientCredits}
          onClose={() => setShowInsufficientCredits(false)}
          currentCredits={userCredits}
          requiredCredits={0.10}
          action="make a call"
        />

        {activeTab === "keypad" && (
          <>
            {/* Number display */}
            <div className="relative flex items-center justify-center px-14 mt-2 mb-6 min-h-[80px]">
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <ContactPicker onSelect={n => setNumber(n)} />
              </div>

              <div className="flex-1 text-center">
                <AnimatePresence mode="wait">
                  {number ? (
                    <motion.p
                      key="num"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white font-light tracking-[0.15em] font-mono leading-none break-all"
                      style={{ fontSize: number.length > 12 ? "24px" : number.length > 8 ? "32px" : "42px" }}>
                      {number}
                    </motion.p>
                  ) : (
                    <motion.p key="placeholder" className="text-gray-700 text-base font-light">
                      Enter number
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {number.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setNumber(prev => prev.slice(0, -1))}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Delete className="w-5 h-5 text-gray-400" />
                </motion.button>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 px-5 mb-4">
              {KEYS.map(k => (
                <KeyButton key={k.key} keyData={k} onPress={d => setNumber(p => p + d)} disabled={!stableReady} />
              ))}
            </div>

            {/* Call button row */}
            <div className="flex items-center justify-center gap-8 px-5 mb-8">
              {/* + button */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setNumber(p => p + "+")}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}>
                <Plus className="w-5 h-5 text-gray-400" />
              </motion.button>

              {/* Call button */}
              <motion.button
                onClick={handleCall}
                disabled={!stableReady || !number}
                whileTap={{ scale: 0.88 }}
                className="w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-30"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  boxShadow: number && stableReady
                    ? "0 0 40px rgba(34,197,94,0.5), 0 8px 32px rgba(0,0,0,0.5)"
                    : "0 4px 16px rgba(0,0,0,0.4)",
                }}>
                <Phone className="w-8 h-8 text-white" />
              </motion.button>

              {/* Spacer to center call button */}
              <div className="w-14 h-14" />
            </div>
          </>
        )}

        {activeTab === "recents" && (
          <div className="flex-1 mx-3 mt-2">
            <CallHistory calls={[]} />
          </div>
        )}
      </div>
    </div>
  );
}