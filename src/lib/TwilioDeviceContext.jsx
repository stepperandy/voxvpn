import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Device } from '@twilio/voice-sdk';
import { base44 } from '@/api/base44Client';

const TwilioDeviceContext = createContext(null);

// Shared AudioContext
let sharedAudioCtx = null;
function getAudioCtx() {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedAudioCtx;
}

// Unlock audio on first user gesture
if (typeof window !== 'undefined') {
  ['click', 'touchstart', 'keydown'].forEach(evt =>
    window.addEventListener(evt, () => {
      try {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) {}
    }, { once: false, passive: true })
  );
}

export function TwilioDeviceProvider({ children }) {
  const [incomingCaller, setIncomingCaller] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [deviceReady, setDeviceReady] = useState(false);
  const [demoMode, setDemoMode] = useState(false); // activated when WebRTC unavailable
  const [deviceState, setDeviceState] = useState('DISCONNECTED'); // REGISTERING, REGISTERED, INCOMING, CONNECTED, DISCONNECTED, ERROR
  const deviceRef = useRef(null);
  const callRef = useRef(null);
  const ringtoneRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const tokenRefreshRef = useRef(null);
  const isRegisteringRef = useRef(false);
  const isDestroyingRef = useRef(false); // suppress unregistered during intentional destroy

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current();
      ringtoneRef.current = null;
    }
  };

  const playRingtone = () => {
    stopRingtone();
    try {
      const ctx = getAudioCtx();
      const playRingCycle = () => {
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        [0, 0.6].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 480;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0, now + offset);
          gain.gain.linearRampToValueAtTime(0.5, now + offset + 0.05);
          gain.gain.setValueAtTime(0.5, now + offset + 0.4);
          gain.gain.linearRampToValueAtTime(0, now + offset + 0.5);
          osc.start(now + offset);
          osc.stop(now + offset + 0.55);
        });
      };
      playRingCycle();
      const interval = setInterval(playRingCycle, 3500);
      ringtoneRef.current = () => clearInterval(interval);
    } catch (e) {}
  };

  const scheduleReconnect = (delayMs = 5000) => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => registerDevice(), delayMs);
  };

  const updateState = (state) => {
    console.log(`[GlobalTwilio] 📊 Device state: ${state}`);
    setDeviceState(state);
  };

  const registerDevice = async () => {
    if (isRegisteringRef.current) return;
    isRegisteringRef.current = true;
    updateState('REGISTERING');

    // Demo mode fallback: if not registered within 15s, unlock UI anyway
    const demoFallbackTimer = setTimeout(() => {
      if (!deviceRef.current) {
        console.warn('[GlobalTwilio] ⚠️ Demo mode activated — WebRTC unavailable');
        setDemoMode(true);
        setDeviceReady(true); // unlock dialer buttons
        updateState('REGISTERED');
        isRegisteringRef.current = false;
      }
    }, 15000);

    try {
      const isAuth = await base44.auth.isAuthenticated().catch(() => false);
      if (!isAuth) {
        console.log('[GlobalTwilio] Not authenticated, skipping device registration');
        clearTimeout(demoFallbackTimer);
        isRegisteringRef.current = false;
        return;
      }

      // 8s timeout on token fetch
      let res;
      try {
        res = await Promise.race([
          base44.functions.invoke('twilioToken', {}),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Token timeout')), 8000))
        ]);
      } catch (tokenErr) {
        console.error('[GlobalTwilio] Token fetch failed:', tokenErr.message);
        clearTimeout(demoFallbackTimer);
        isRegisteringRef.current = false;
        scheduleReconnect(15000);
        return;
      }

      if (!res.data?.token) {
        console.error('[GlobalTwilio] No token received');
        clearTimeout(demoFallbackTimer);
        isRegisteringRef.current = false;
        scheduleReconnect(10000);
        return;
      }

      // Destroy old device — set flag so unregistered event doesn't trigger a reconnect loop
      if (deviceRef.current) {
        isDestroyingRef.current = true;
        try { deviceRef.current.destroy(); } catch (e) {}
        deviceRef.current = null;
        setDeviceReady(false);
        isDestroyingRef.current = false;
      }

      const device = new Device(res.data.token, {
        logLevel: 1,
        sounds: { incoming: false, outgoing: false, disconnect: false },
      });

      device.on('registered', () => {
        console.log('[GlobalTwilio] ✅ Device REGISTERED — ready for calls');
        console.log(`[GlobalTwilio] 🆔 DIALER REGISTERED IDENTITY: ${res.data.identity}`);
        setDeviceReady(true);
        updateState('REGISTERED');
      });

      device.on('unregistered', () => {
        if (isDestroyingRef.current) return; // intentional destroy — don't reconnect
        console.log('[GlobalTwilio] ⚠️ Device unregistered — scheduling reconnect');
        setDeviceReady(false);
        updateState('DISCONNECTED');
        scheduleReconnect(3000);
      });

      device.on('error', (e) => {
        const msg = e?.message || String(e);
        console.error('[GlobalTwilio] Device error:', msg);
        updateState('ERROR');
        if (!msg.includes('31005') && !msg.includes('HANGUP')) {
          setDeviceReady(false);
          scheduleReconnect(5000);
        }
      });

      device.on('incoming', (call) => {
        console.log('[GlobalTwilio] 📞 INCOMING CALL from:', call.parameters.From);
        updateState('INCOMING');
        callRef.current = call;
        setIncomingCaller(call.parameters.From || 'Unknown');
        playRingtone();

        call.on('accept', () => {
          stopRingtone();
          updateState('CONNECTED');
          setActiveCall(call);
          setIncomingCaller(null);
        });
        call.on('disconnect', () => {
          stopRingtone();
          updateState('REGISTERED');
          setActiveCall(null);
          setIncomingCaller(null);
          callRef.current = null;
        });
        call.on('cancel', () => {
          stopRingtone();
          updateState('REGISTERED');
          setIncomingCaller(null);
          callRef.current = null;
        });
        call.on('reject', () => {
          stopRingtone();
          updateState('REGISTERED');
          setIncomingCaller(null);
          callRef.current = null;
        });
      });

      deviceRef.current = device;

      // 10s timeout on register()
      try {
        await Promise.race([
          device.register(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Register timeout')), 10000))
        ]);
      } catch (regErr) {
        console.error('[GlobalTwilio] device.register() failed/timed out:', regErr.message);
        clearTimeout(demoFallbackTimer);
        isRegisteringRef.current = false;
        scheduleReconnect(15000);
        return;
      }

      clearTimeout(demoFallbackTimer);

      // Refresh token every 50 minutes
      if (tokenRefreshRef.current) clearInterval(tokenRefreshRef.current);
      tokenRefreshRef.current = setInterval(() => registerDevice(), 50 * 60 * 1000);

    } catch (e) {
      console.error('[GlobalTwilio] Register error:', e.message);
      clearTimeout(demoFallbackTimer);
      scheduleReconnect(12000);
    } finally {
      isRegisteringRef.current = false;
    }
  };

  useEffect(() => {
    // Register immediately on mount
    registerDevice();

    // Re-register only when tab becomes visible AND device is not already registered
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !deviceRef.current) {
        console.log('[GlobalTwilio] Tab visible & no device — re-registering');
        registerDevice();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (tokenRefreshRef.current) clearInterval(tokenRefreshRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (deviceRef.current) {
        try { deviceRef.current.destroy(); } catch (e) {}
      }
      stopRingtone();
    };
  }, []);

  const acceptCall = () => {
    if (callRef.current) callRef.current.accept();
  };

  const rejectCall = () => {
    if (callRef.current) {
      callRef.current.reject();
      stopRingtone();
      setIncomingCaller(null);
      callRef.current = null;
    }
  };

  return (
    <TwilioDeviceContext.Provider value={{ deviceRef, deviceReady, demoMode, deviceState, incomingCaller, activeCall, acceptCall, rejectCall }}>
      {children}
    </TwilioDeviceContext.Provider>
  );
}

export function useTwilioDevice() {
  return useContext(TwilioDeviceContext);
}