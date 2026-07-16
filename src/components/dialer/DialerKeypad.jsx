import React, { useRef } from "react";
import { Delete } from "lucide-react";

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

export default function DialerKeypad({ onKeyPress, onBackspace, disabled }) {
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const handlePointerDown = (key, longPressValue) => {
    longPressTriggered.current = false;
    if (longPressValue) {
      longPressTimer.current = setTimeout(() => {
        longPressTriggered.current = true;
        onKeyPress(longPressValue);
      }, 500);
    }
  };

  const handlePointerUp = (key) => {
    clearTimeout(longPressTimer.current);
    if (!longPressTriggered.current) {
      onKeyPress(key);
    }
    longPressTriggered.current = false;
  };

  const handlePointerLeave = () => {
    clearTimeout(longPressTimer.current);
  };

  return (
    <div className="w-full px-6">
      <div className="grid grid-cols-3 gap-y-2 gap-x-4">
        {KEYS.map(({ key, sub, longPress }) => (
          <button
            key={key}
            disabled={disabled}
            onPointerDown={() => handlePointerDown(key, longPress)}
            onPointerUp={() => handlePointerUp(key)}
            onPointerLeave={handlePointerLeave}
            onContextMenu={e => e.preventDefault()}
            className="flex flex-col items-center justify-center h-[72px] rounded-full select-none transition-all active:scale-90 disabled:opacity-30"
            style={{
              background: "rgba(255,255,255,0.08)",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}
          >
            <span className="text-[28px] font-light text-white leading-none">{key}</span>
            {sub && (
              <span className="text-[9px] font-semibold tracking-widest text-gray-400 mt-0.5 uppercase">
                {sub}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bottom row: spacer | call-area | backspace */}
      <div className="grid grid-cols-3 items-center mt-2 gap-x-4">
        <div />
        {/* Call button placeholder — rendered by parent */}
        <div className="h-[72px]" />
        <button
          onClick={onBackspace}
          disabled={disabled}
          className="flex items-center justify-center h-[72px] rounded-full transition-all active:scale-90 disabled:opacity-30"
          style={{ background: "transparent" }}
        >
          <Delete className="w-6 h-6 text-gray-300" />
        </button>
      </div>
    </div>
  );
}