import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

const DIAL_KEYS = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["*", ""], ["0", "+"], ["#", ""],
];

export default function FloatingPhone({
  isVisible,
  callStatus,
  contactName,
  callNumber,
  duration,
  onAnswer,
  onReject,
  onHangUp,
  onDialKey,
  onMute,
  onSpeaker,
  isMuted,
  isSpeakerOff,
  dialInput,
}) {
  if (!isVisible) return null;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Premium dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm" />

      {/* iPhone-style Phone Frame */}
      <div className="relative w-full max-w-sm bg-black rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: "9/19" }}>
        {/* Phone bezel */}
        <div className="absolute inset-0 border-8 border-black rounded-3xl pointer-events-none" />

        {/* Dynamic Island notch */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full border border-gray-800 z-20 flex items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
          <div className="w-1 h-1 rounded-full bg-gray-600" />
        </div>

        {/* Phone screen - Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="pt-12 px-4 flex justify-between items-center text-xs font-semibold text-gray-300 mb-2">
            <span>9:41</span>
            <div className="flex gap-1">
              <span>📶</span>
              <span>📡</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Call info - Premium styling */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12">
            {callStatus === "ringing" && (
              <>
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/40 to-blue-500/20 border-2 border-cyan-500/60 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Phone className="w-11 h-11 text-cyan-300 animate-bounce" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest letter-spacing-1">
                  Incoming Call
                </p>
              </>
            )}

            {callStatus === "active" && (
              <div className="mb-2">
                <div className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/40">
                  <p className="text-xs font-semibold text-green-300 uppercase tracking-wide">Active Call</p>
                </div>
              </div>
            )}

            {callStatus === "connecting" && (
              <div className="mb-2">
                <div className="px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/40">
                  <p className="text-xs font-semibold text-yellow-300 uppercase tracking-wide">Connecting...</p>
                </div>
              </div>
            )}

            {/* Contact name or number */}
            <div className="text-center mb-4 mt-4">
              {contactName ? (
                <>
                  <p className="text-3xl font-bold text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
                    {contactName}
                  </p>
                  <p className="text-sm text-gray-400 font-mono tracking-wider">{callNumber}</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-white font-mono tracking-wider">{callNumber}</p>
              )}
            </div>

            {/* Call duration */}
            {callStatus === "active" && (
              <p className="text-xl font-mono text-cyan-400 font-semibold tracking-wide mt-2">
                {formatDuration(duration)}
              </p>
            )}
          </div>

          {/* Keypad - Premium grid */}
          {(callStatus === "ringing" || callStatus === "active") && (
            <div className="px-6 pb-6 mt-4">
              <div className="grid grid-cols-3 gap-2.5">
                {DIAL_KEYS.map(([key, sub]) => (
                  <button
                    key={key}
                    onClick={() => onDialKey?.(key)}
                    disabled={callStatus === "ringing"}
                    className="group relative flex flex-col items-center justify-center py-4 bg-gray-800/40 hover:bg-gray-700/60 active:bg-gray-600/80 disabled:opacity-40 rounded-2xl border border-gray-700/50 transition-all duration-200 backdrop-blur-sm"
                  >
                    <span className="text-white text-lg font-semibold group-active:scale-110 transition-transform">
                      {key}
                    </span>
                    {sub && <span className="text-gray-500 text-[9px] mt-0.5 font-medium">{sub}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons - Premium styling */}
          <div className="px-6 pb-8 flex items-center justify-center gap-6">
            {callStatus === "ringing" ? (
              <>
                <button
                  onClick={onReject}
                  className="group w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-red-600/50 active:scale-95"
                >
                  <PhoneOff className="w-8 h-8 group-active:scale-110 transition-transform" />
                </button>
                <button
                  onClick={onAnswer}
                  className="group w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-green-600/50 active:scale-95"
                >
                  <Phone className="w-8 h-8 group-active:scale-110 transition-transform" />
                </button>
              </>
            ) : callStatus === "active" ? (
              <>
                <button
                  onClick={onMute}
                  className={`group w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center border-2 active:scale-95 ${
                    isMuted
                      ? "bg-yellow-500/30 border-yellow-500/60 text-yellow-300 shadow-lg shadow-yellow-500/30"
                      : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                  onClick={onHangUp}
                  className="group w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-red-600/50 active:scale-95 animate-pulse"
                >
                  <PhoneOff className="w-8 h-8 group-active:scale-110 transition-transform" />
                </button>

                <button
                  onClick={onSpeaker}
                  className={`group w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center border-2 active:scale-95 ${
                    isSpeakerOff
                      ? "bg-yellow-500/30 border-yellow-500/60 text-yellow-300 shadow-lg shadow-yellow-500/30"
                      : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {isSpeakerOff ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-black flex items-center justify-center">
          <div className="w-32 h-1 bg-gray-700 rounded-full" />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}