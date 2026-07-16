/**
 * VoxDigits Embeddable Widget v1.0
 * 
 * Drop this script on any website to integrate VoxDigits:
 *   - Login / Sign-up flow (Terms → Base44 Auth)
 *   - In-app Dialer (Twilio Voice SDK via WebRTC)
 *   - Links to eSIM Store, Virtual Numbers, Pricing, Dashboard
 *   - Credits / Wallet balance display
 *   - AI Assistant launcher
 *
 * Usage:
 *   <script src="https://voxtelefony.com/voxtelefony-widget.js"
 *           data-app-id="YOUR_BASE44_APP_ID"
 *           data-app-url="https://voxtelefony.com"
 *           async></script>
 *
 * Or initialize manually:
 *   <script>
 *     VoxDigitsWidget.init({
 *       appId: 'YOUR_BASE44_APP_ID',
 *       appUrl: 'https://voxtelefony.com'
 *     });
 *   </script>
 */
(function () {
  "use strict";

  // ── Prevent double-init ────────────────────────────────────────────────────
  if (window.VoxDigitsWidget && window.VoxDigitsWidget._loaded) return;

  // ── Default config ─────────────────────────────────────────────────────────
  var CONFIG = {
    appId: null,
    appUrl: "https://voxtelefony.com",
    position: "bottom-right", // bottom-right | bottom-left
    theme: "dark",
    primaryColor: "#06b6d4",
    logoUrl: "https://media.base44.com/images/public/69b202c06dc5b1988efe9645/e6163c0d6_TELLOGO11.png",
  };

  // ── State ───────────────────────────────────────────────────────────────────
  var state = {
    user: null,
    isAuthenticated: false,
    panelOpen: false,
    token: null,
    device: null,
    activeCall: null,
    callDuration: 0,
    callTimer: null,
    muted: false,
  };

  // ── DOM refs ───────────────────────────────────────────────────────────────
  var fab = null;
  var panel = null;
  var overlay = null;

  // ── Utility: send message to iframe ────────────────────────────────────────
  function postToIframe(type, data) {
    var iframe = panel && panel.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ source: "voxtelefony-widget", type: type, data: data || {} }),
        CONFIG.appUrl
      );
    }
  }

  // ── Check auth status via Base44 SDK ───────────────────────────────────────
  function checkAuth() {
    fetch(CONFIG.appUrl + "/api/apps/" + CONFIG.appId + "/prod/public-settings/by-id/" + CONFIG.appId, {
      credentials: "include",
      headers: { "X-App-Id": CONFIG.appId },
    })
      .then(function (r) { return r.json(); })
      .then(function (settings) {
        if (settings && settings.public_settings) {
          // App is public — check if user is logged in
          return fetch(CONFIG.appUrl + "/api/auth/me", {
            credentials: "include",
            headers: { "X-App-Id": CONFIG.appId },
          });
        }
        throw new Error("auth_required");
      })
      .then(function (r) { return r.json(); })
      .then(function (userData) {
        if (userData && userData.email) {
          state.user = userData;
          state.isAuthenticated = true;
          updateUI();
        } else {
          state.isAuthenticated = false;
          updateUI();
        }
      })
      .catch(function () {
        state.isAuthenticated = false;
        updateUI();
      });
  }

  // ── Login flow ─────────────────────────────────────────────────────────────
  function startLogin() {
    var returnUrl = encodeURIComponent(window.location.href);
    window.location.href = CONFIG.appUrl + "/TermsAgreement?next=" + returnUrl;
  }

  function logout() {
    fetch(CONFIG.appUrl + "/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "X-App-Id": CONFIG.appId },
    })
      .then(function () {
        state.user = null;
        state.isAuthenticated = false;
        updateUI();
      })
      .catch(function () {
        state.user = null;
        state.isAuthenticated = false;
        updateUI();
      });
  }

  // ── Get Twilio token for dialer ────────────────────────────────────────────
  function getTwilioToken() {
    return fetch(CONFIG.appUrl + "/api/apps/" + CONFIG.appId + "/functions/twilioToken", {
      method: "POST",
      credentials: "include",
      headers: { "X-App-Id": CONFIG.appId, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.token) {
          state.token = data.token;
          return data.token;
        }
        throw new Error("No token received");
      });
  }

  // ── Initialize Twilio Device ──────────────────────────────────────────────
  function initDevice(token) {
    if (typeof Twilio === "undefined" || !Twilio.Device) {
      loadTwilioSDK().then(function () {
        initDevice(token);
      });
      return;
    }

    state.device = new Twilio.Device(token, {
      logLevel: 1,
      sounds: { incoming: false, outgoing: false, disconnect: false },
    });

    state.device.on("ready", function () {
      console.log("[VoxDigits Widget] ✅ Device ready");
      updateDialerStatus("ready");
    });

    state.device.on("incoming", function (call) {
      state.activeCall = call;
      showIncomingCall(call.parameters.From || "Unknown");

      call.on("accept", function () {
        hideIncomingCall();
        showActiveCall();
        startCallTimer();
      });

      call.on("disconnect", function () {
        hideIncomingCall();
        hideActiveCall();
        stopCallTimer();
        state.activeCall = null;
      });

      call.on("cancel", function () {
        hideIncomingCall();
        hideActiveCall();
        stopCallTimer();
        state.activeCall = null;
      });
    });

    state.device.on("error", function (err) {
      console.error("[VoxDigits Widget] Device error:", err.message);
      updateDialerStatus("error");
    });
  }

  // ── Load Twilio SDK dynamically ────────────────────────────────────────────
  function loadTwilioSDK() {
    return new Promise(function (resolve, reject) {
      if (typeof Twilio !== "undefined") {
        resolve();
        return;
      }
      var script = document.createElement("script");
      script.src = "https://sdk.twilio.com/js/client/v1.13/twilio.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ── Make outbound call ─────────────────────────────────────────────────────
  function makeCall(number, callerId) {
    if (!state.device) {
      getTwilioToken().then(function (token) {
        initDevice(token);
        setTimeout(function () {
          makeCall(number, callerId);
        }, 2000);
      });
      return;
    }

    var params = { To: number, PhoneNumber: number };
    if (callerId) params.callerId = callerId;

    state.device.connect({ params: params })
      .then(function (call) {
        state.activeCall = call;
        showActiveCall();
        startCallTimer();

        call.on("disconnect", function () {
          hideActiveCall();
          stopCallTimer();
          state.activeCall = null;
        });
      })
      .catch(function (err) {
        console.error("[VoxDigits Widget] Call failed:", err);
      });
  }

  // ── Call timer ─────────────────────────────────────────────────────────────
  function startCallTimer() {
    state.callDuration = 0;
    state.callTimer = setInterval(function () {
      state.callDuration++;
      var timerEl = panel && panel.querySelector("#vt-call-timer");
      if (timerEl) {
        var m = String(Math.floor(state.callDuration / 60)).padStart(2, "0");
        var s = String(state.callDuration % 60).padStart(2, "0");
        timerEl.textContent = m + ":" + s;
      }
    }, 1000);
  }

  function stopCallTimer() {
    if (state.callTimer) {
      clearInterval(state.callTimer);
      state.callTimer = null;
    }
    state.callDuration = 0;
  }

  // ── Hang up ───────────────────────────────────────────────────────────────
  function hangUp() {
    if (state.activeCall) {
      state.activeCall.disconnect();
      state.activeCall = null;
    }
    hideActiveCall();
    stopCallTimer();
  }

  // ── Mute toggle ────────────────────────────────────────────────────────────
  function toggleMute() {
    if (state.activeCall) {
      state.muted = !state.muted;
      state.activeCall.mute(state.muted);
      var muteBtn = panel && panel.querySelector("#vt-mute-btn");
      if (muteBtn) {
        muteBtn.textContent = state.muted ? "🔇" : "🎤";
      }
    }
  }

  // ── UI: Update based on auth state ─────────────────────────────────────────
  function updateUI() {
    if (!panel) return;

    var authSection = panel.querySelector("#vt-auth-section");
    var userSection = panel.querySelector("#vt-user-section");
    var creditsEl = panel.querySelector("#vt-credits");
    var userNameEl = panel.querySelector("#vt-user-name");

    if (state.isAuthenticated && state.user) {
      if (authSection) authSection.style.display = "none";
      if (userSection) userSection.style.display = "block";
      if (userNameEl) userNameEl.textContent = state.user.full_name || state.user.email;
      if (creditsEl) creditsEl.textContent = "$" + (state.user.credits || 0).toFixed(2);
    } else {
      if (authSection) authSection.style.display = "block";
      if (userSection) userSection.style.display = "none";
    }
  }

  // ── UI: Update dialer status ──────────────────────────────────────────────
  function updateDialerStatus(status) {
    var statusEl = panel && panel.querySelector("#vt-dialer-status");
    if (!statusEl) return;

    var statusMap = {
      ready: { text: "Ready", color: "#34d399" },
      connecting: { text: "Connecting…", color: "#fbbf24" },
      error: { text: "Connection Error", color: "#f87171" },
    };

    var s = statusMap[status] || statusMap.connecting;
    statusEl.textContent = s.text;
    statusEl.style.color = s.color;
  }

  // ── UI: Show/hide incoming call ───────────────────────────────────────────
  function showIncomingCall(callerId) {
    var incomingEl = panel && panel.querySelector("#vt-incoming-call");
    var callerEl = panel && panel.querySelector("#vt-incoming-caller");
    if (incomingEl) incomingEl.style.display = "flex";
    if (callerEl) callerEl.textContent = callerId;
  }

  function hideIncomingCall() {
    var incomingEl = panel && panel.querySelector("#vt-incoming-call");
    if (incomingEl) incomingEl.style.display = "none";
  }

  function acceptCall() {
    if (state.activeCall) state.activeCall.accept();
  }

  function rejectCall() {
    if (state.activeCall) state.activeCall.reject();
    hideIncomingCall();
    state.activeCall = null;
  }

  // ── UI: Show/hide active call ─────────────────────────────────────────────
  function showActiveCall() {
    var activeEl = panel && panel.querySelector("#vt-active-call");
    if (activeEl) activeEl.style.display = "flex";
  }

  function hideActiveCall() {
    var activeEl = panel && panel.querySelector("#vt-active-call");
    if (activeEl) activeEl.style.display = "none";
  }

  // ── Build the panel HTML ──────────────────────────────────────────────────
  function buildPanel() {
    overlay = document.createElement("div");
    overlay.id = "vt-overlay";
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "background:rgba(0,0,0,0.5)",
      "backdrop-filter:blur(4px)",
      "z-index:2147483646",
      "display:none",
      "opacity:0",
      "transition:opacity 0.2s",
    ].join(";");

    panel = document.createElement("div");
    panel.id = "vt-panel";
    panel.style.cssText = [
      "position:fixed",
      "bottom:80px",
      CONFIG.position === "bottom-left" ? "left:20px" : "right:20px",
      "width:360px",
      "max-width:calc(100vw - 40px)",
      "max-height:560px",
      "background:linear-gradient(160deg,#0d1f35 0%,#0a1628 100%)",
      "border:1px solid rgba(6,182,212,0.3)",
      "border-radius:20px",
      "box-shadow:0 24px 64px rgba(0,0,0,0.6)",
      "z-index:2147483647",
      "display:none",
      "flex-direction:column",
      "overflow:hidden",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
      "color:#fff",
      "transform:translateY(20px) scale(0.95)",
      "opacity:0",
      "transition:all 0.25s ease",
    ].join(";");

    panel.innerHTML = [
      // ── Header ──
      '<div style="padding:16px 20px;background:linear-gradient(90deg,rgba(6,182,212,0.15),rgba(139,92,246,0.1));border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:between;">',
      '  <div style="display:flex;align-items:center;gap:10px;flex:1;">',
      '    <img src="' + CONFIG.logoUrl + '" alt="VoxDigits" style="height:28px;width:auto;border-radius:4px;">',
      '    <div>',
      '      <div style="font-size:14px;font-weight:700;color:#fff;">VoxDigits</div>',
      '      <div style="font-size:10px;color:#06b6d4;font-weight:600;">Global Communications</div>',
      '    </div>',
      '  </div>',
      '  <button id="vt-close-btn" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;" title="Close">✕</button>',
      '</div>',

      // ── Scrollable content ──
      '<div style="flex:1;overflow-y:auto;padding:16px 20px;">',

      // ── Auth section (login/signup) ──
      '  <div id="vt-auth-section">',
      '    <div style="text-align:center;padding:20px 0;">',
      '      <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,rgba(6,182,212,0.2),rgba(139,92,246,0.2));border:1px solid rgba(6,182,212,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;">🔐</div>',
      '      <h3 style="font-size:16px;font-weight:700;margin:0 0 6px;color:#fff;">Sign in to VoxDigits</h3>',
      '      <p style="font-size:12px;color:#94a3b8;margin:0 0 16px;">Access virtual numbers, eSIMs, dialer & more</p>',
      '      <button id="vt-login-btn" style="width:100%;padding:12px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;transition:transform 0.15s;">Login / Sign Up →</button>',
      '    </div>',
      '  </div>',

      // ── User section (logged in) ──
      '  <div id="vt-user-section" style="display:none;">',
      // Credits bar
      '    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:12px;margin-bottom:14px;">',
      '      <div style="display:flex;align-items:center;gap:8px;">',
      '        <span style="font-size:16px;">⚡</span>',
      '        <div>',
      '          <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Balance</div>',
      '          <div id="vt-credits" style="font-size:15px;font-weight:700;color:#06b6d4;">$0.00</div>',
      '        </div>',
      '      </div>',
      '      <div style="text-right;">',
      '        <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">User</div>',
      '        <div id="vt-user-name" style="font-size:12px;font-weight:600;color:#fff;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">—</div>',
      '      </div>',
      '    </div>',

      // Quick links grid
      '    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">',
      '      <a href="' + CONFIG.appUrl + '/ESimStore" target="_blank" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;text-decoration:none;color:#fff;transition:background 0.15s;">',
      '        <span style="font-size:20px;">📶</span><span style="font-size:11px;font-weight:600;">eSIM Store</span>',
      '      </a>',
      '      <a href="' + CONFIG.appUrl + '/VirtualNumbers" target="_blank" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;text-decoration:none;color:#fff;transition:background 0.15s;">',
      '        <span style="font-size:20px;">📞</span><span style="font-size:11px;font-weight:600;">Virtual Numbers</span>',
      '      </a>',
      '      <a href="' + CONFIG.appUrl + '/Pricing" target="_blank" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;text-decoration:none;color:#fff;transition:background 0.15s;">',
      '        <span style="font-size:20px;">💰</span><span style="font-size:11px;font-weight:600;">Pricing</span>',
      '      </a>',
      '      <a href="' + CONFIG.appUrl + '/Dashboard" target="_blank" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;text-decoration:none;color:#fff;transition:background 0.15s;">',
      '        <span style="font-size:20px;">📊</span><span style="font-size:11px;font-weight:600;">Dashboard</span>',
      '      </a>',
      '      <a href="' + CONFIG.appUrl + '/SMSInbox" target="_blank" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;text-decoration:none;color:#fff;transition:background 0.15s;">',
      '        <span style="font-size:20px;">💬</span><span style="font-size:11px;font-weight:600;">SMS Inbox</span>',
      '      </a>',
      '      <a href="' + CONFIG.appUrl + '/ServicesDashboard" target="_blank" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;text-decoration:none;color:#fff;transition:background 0.15s;">',
      '        <span style="font-size:20px;">📱</span><span style="font-size:11px;font-weight:600;">My Services</span>',
      '      </a>',
      '    </div>',

      // ── Mini Dialer ──
      '    <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;margin-bottom:14px;">',
      '      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">',
      '        <div style="display:flex;align-items:center;gap:6px;">',
      '          <span style="font-size:14px;">📞</span>',
      '          <span style="font-size:12px;font-weight:700;color:#fff;">Dialer</span>',
      '        </div>',
      '        <div id="vt-dialer-status" style="font-size:10px;font-weight:600;color:#fbbf24;">Connecting…</div>',
      '      </div>',
      '      <input id="vt-phone-input" type="tel" placeholder="+1 555 000 0000" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:14px;font-family:monospace;outline:none;margin-bottom:10px;box-sizing:border-box;" />',
      '      <div style="display:flex;gap:8px;">',
      '        <button id="vt-call-btn" style="flex:1;padding:10px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">📞 Call</button>',
      '        <button id="vt-hangup-btn" style="flex:1;padding:10px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:none;align-items:center;justify-content:center;gap:6px;">📵 Hang Up</button>',
      '      </div>',
      '    </div>',

      // ── Active call overlay ──
      '    <div id="vt-active-call" style="display:none;position:absolute;inset:0;background:rgba(13,31,53,0.98);z-index:10;flex-direction:column;align-items:center;justify-content:center;padding:30px;">',
      '      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,rgba(34,197,94,0.3),rgba(6,182,212,0.2));border:2px solid rgba(34,197,94,0.5);display:flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:28px;">📞</div>',
      '      <div style="font-size:11px;color:#34d399;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Connected</div>',
      '      <div id="vt-call-timer" style="font-size:28px;font-family:monospace;color:#fff;margin-bottom:24px;">00:00</div>',
      '      <div style="display:flex;gap:16px;">',
      '        <button id="vt-mute-btn" style="width:48px;height:48px;border-radius:50%;border:none;background:rgba(255,255,255,0.1);font-size:18px;cursor:pointer;">🎤</button>',
      '        <button id="vt-end-call-btn" style="width:56px;height:56px;border-radius:50%;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:22px;cursor:pointer;box-shadow:0 8px 24px rgba(239,68,68,0.4);">📵</button>',
      '      </div>',
      '    </div>',

      // ── Incoming call overlay ──
      '    <div id="vt-incoming-call" style="display:none;position:absolute;inset:0;background:rgba(13,31,53,0.98);z-index:10;flex-direction:column;align-items:center;justify-content:center;padding:30px;">',
      '      <div style="font-size:11px;color:#34d399;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Incoming Call</div>',
      '      <div id="vt-incoming-caller" style="font-size:20px;font-weight:700;font-family:monospace;color:#fff;margin-bottom:24px;">Unknown</div>',
      '      <div style="display:flex;gap:32px;">',
      '        <button id="vt-reject-btn" style="width:60px;height:60px;border-radius:50%;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:24px;cursor:pointer;">📵</button>',
      '        <button id="vt-accept-btn" style="width:60px;height:60px;border-radius:50%;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-size:24px;cursor:pointer;">📞</button>',
      '      </div>',
      '    </div>',

      // ── Logout ──
      '    <button id="vt-logout-btn" style="width:100%;padding:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;color:#f87171;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.15s;">Logout</button>',
      '  </div>',

      '</div>', // end scrollable

      // ── Footer ──
      '<div style="padding:10px 20px;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.05);text-align:center;">',
      '  <a href="' + CONFIG.appUrl + '" target="_blank" style="font-size:10px;color:#64748b;text-decoration:none;">Powered by VoxDigits</a>',
      '</div>',
    ].join("");

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    // ── Wire up events ──
    var closeBtn = panel.querySelector("#vt-close-btn");
    closeBtn.addEventListener("click", closePanel);

    overlay.addEventListener("click", closePanel);

    var loginBtn = panel.querySelector("#vt-login-btn");
    loginBtn.addEventListener("click", startLogin);

    var logoutBtn = panel.querySelector("#vt-logout-btn");
    logoutBtn.addEventListener("click", logout);

    var callBtn = panel.querySelector("#vt-call-btn");
    callBtn.addEventListener("click", function () {
      var input = panel.querySelector("#vt-phone-input");
      var number = input.value.trim();
      if (number) makeCall(number);
    });

    var hangupBtn = panel.querySelector("#vt-hangup-btn");
    hangupBtn.addEventListener("click", hangUp);

    var endCallBtn = panel.querySelector("#vt-end-call-btn");
    endCallBtn.addEventListener("click", hangUp);

    var muteBtn = panel.querySelector("#vt-mute-btn");
    muteBtn.addEventListener("click", toggleMute);

    var acceptBtn = panel.querySelector("#vt-accept-btn");
    acceptBtn.addEventListener("click", acceptCall);

    var rejectBtn = panel.querySelector("#vt-reject-btn");
    rejectBtn.addEventListener("click", rejectCall);
  }

  // ── Build FAB ─────────────────────────────────────────────────────────────
  function buildFAB() {
    fab = document.createElement("button");
    fab.id = "vt-fab";
    fab.style.cssText = [
      "position:fixed",
      CONFIG.position === "bottom-left" ? "left:20px" : "right:20px",
      "bottom:20px",
      "width:56px",
      "height:56px",
      "border-radius:50%",
      "border:none",
      "background:linear-gradient(135deg,#06b6d4,#8b5cf6)",
      "box-shadow:0 8px 24px rgba(6,182,212,0.4)",
      "cursor:pointer",
      "z-index:2147483647",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "transition:transform 0.2s,box-shadow 0.2s",
    ].join(";");

    fab.innerHTML =
      '<img src="' +
      CONFIG.logoUrl +
      '" alt="VoxDigits" style="width:28px;height:28px;border-radius:4px;">';

    fab.addEventListener("mouseenter", function () {
      fab.style.transform = "scale(1.1)";
      fab.style.boxShadow = "0 12px 32px rgba(6,182,212,0.5)";
    });

    fab.addEventListener("mouseleave", function () {
      fab.style.transform = "scale(1)";
      fab.style.boxShadow = "0 8px 24px rgba(6,182,212,0.4)";
    });

    fab.addEventListener("click", togglePanel);

    document.body.appendChild(fab);
  }

  // ── Open / Close panel ────────────────────────────────────────────────────
  function openPanel() {
    if (!panel) buildPanel();
    state.panelOpen = true;
    panel.style.display = "flex";
    overlay.style.display = "block";

    requestAnimationFrame(function () {
      panel.style.transform = "translateY(0) scale(1)";
      panel.style.opacity = "1";
      overlay.style.opacity = "1";
    });

    // Check auth on open
    checkAuth();

    // Init dialer if authenticated
    if (state.isAuthenticated && !state.device) {
      getTwilioToken()
        .then(function (token) { initDevice(token); })
        .catch(function (err) {
          console.warn("[VoxDigits Widget] Token fetch failed:", err);
          updateDialerStatus("error");
        });
    }
  }

  function closePanel() {
    state.panelOpen = false;
    if (panel) {
      panel.style.transform = "translateY(20px) scale(0.95)";
      panel.style.opacity = "0";
      setTimeout(function () {
        panel.style.display = "none";
      }, 200);
    }
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(function () {
        overlay.style.display = "none";
      }, 200);
    }
  }

  function togglePanel() {
    if (state.panelOpen) closePanel();
    else openPanel();
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init(options) {
    // Merge config
    if (options) {
      for (var key in options) {
        if (CONFIG.hasOwnProperty(key)) CONFIG[key] = options[key];
      }
    }

    // Read from data attributes
    var scriptEl = document.currentScript || document.querySelector('script[data-app-id]');
    if (scriptEl) {
      CONFIG.appId = CONFIG.appId || scriptEl.getAttribute("data-app-id");
      CONFIG.appUrl = scriptEl.getAttribute("data-app-url") || CONFIG.appUrl;
      CONFIG.position = scriptEl.getAttribute("data-position") || CONFIG.position;
    }

    if (!CONFIG.appId) {
      console.error("[VoxDigits Widget] Missing data-app-id attribute");
      return;
    }

    // Wait for DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        buildFAB();
      });
    } else {
      buildFAB();
    }

    console.log("[VoxDigits Widget] ✅ Initialized for app:", CONFIG.appId);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.VoxDigitsWidget = {
    _loaded: true,
    init: init,
    open: openPanel,
    close: closePanel,
    toggle: togglePanel,
    login: startLogin,
    logout: logout,
    makeCall: makeCall,
    hangUp: hangUp,
    checkAuth: checkAuth,
    getConfig: function () { return CONFIG; },
    getState: function () { return state; },
  };

  // ── Auto-init from script attributes ─────────────────────────────────────
  var currentScript = document.currentScript;
  if (currentScript && currentScript.getAttribute("data-app-id")) {
    init({
      appId: currentScript.getAttribute("data-app-id"),
      appUrl: currentScript.getAttribute("data-app-url") || CONFIG.appUrl,
      position: currentScript.getAttribute("data-position") || CONFIG.position,
    });
  }
})();
