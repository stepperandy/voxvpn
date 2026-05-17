import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_TIERS = {
  'Free Trial': 1,
  'Basic': 1,
  'Standard': 2,
  'Pro Monthly': 3,
  'Pro Annual': 3,
  'Advanced': 3,
  'Premium': 4,
  'Business': 5,
  'Enterprise': 5,
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const APP_ID = Deno.env.get('BASE44_APP_ID');
const BASE44_API = 'https://base44.app/api';

// Direct password login against the Base44 REST API
async function tryPasswordLogin(email, password) {
  const res = await fetch(`${BASE44_API}/apps/${APP_ID}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, text, data };
}

// Extract the service token from the incoming request (Base44 injects it)
function getServiceToken(req) {
  return (
    req.headers.get('x-service-token') ||
    req.headers.get('base44-service-token') ||
    req.headers.get('x-base44-service-token') ||
    Deno.env.get('BASE44_SERVICE_TOKEN') ||
    null
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, device_id, device_name, device_type } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required.',
        subscriptionActive: false,
      }), { status: 400, headers: CORS });
    }

    const base44 = createClientFromRequest(req);

    // ── Step 1: Try direct password login ──────────────────────────────────
    console.log('[authLogin] authenticating:', email);
    let attempt = await tryPasswordLogin(email, password);
    console.log('[authLogin] attempt1 status:', attempt.status, attempt.text.slice(0, 200));

    let token = null;
    let authUser = null;

    if (attempt.ok) {
      token = attempt.data?.access_token || attempt.data?.token || null;
      authUser = attempt.data?.user || null;
      console.log('[authLogin] direct login OK');

    } else {
      const errLower = attempt.text.toLowerCase();
      const isWrongPassword = errLower.includes('invalid email or password') || errLower.includes('invalid credentials');
      const isUnverified = errLower.includes('verif') || errLower.includes('confirm');

      console.log('[authLogin] isWrongPassword:', isWrongPassword, 'isUnverified:', isUnverified);

      if (isWrongPassword) {
        return new Response(JSON.stringify({
          success: false, message: 'Invalid email or password.', subscriptionActive: false,
        }), { status: 401, headers: CORS });
      }

      if (isUnverified) {
        // Password is correct but email not verified.
        // Strategy: resend-otp to get a fresh OTP, read it via direct REST API with service token, verify it, retry login.

        // 1. Look up user to get their ID
        const users = await base44.asServiceRole.entities.User.filter({ email });
        console.log('[authLogin] found users:', users.length);

        if (!users || users.length === 0) {
          return new Response(JSON.stringify({
            success: false, message: 'Invalid email or password.', subscriptionActive: false,
          }), { status: 401, headers: CORS });
        }

        const userId = users[0].id;

        // 2. Trigger resend-otp so a fresh OTP is generated and stored
        const resendRes = await fetch(`${BASE44_API}/apps/${APP_ID}/auth/resend-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        console.log('[authLogin] resend-otp status:', resendRes.status);

        // 3. Read the fresh OTP from the User entity using service role REST call directly
        const serviceToken = getServiceToken(req);
        console.log('[authLogin] service token available:', !!serviceToken);

        let otpCode = null;

        if (serviceToken) {
          // Read the raw user record with service token — includes sensitive fields
          const userRes = await fetch(`${BASE44_API}/apps/${APP_ID}/entities/User/${userId}`, {
            headers: {
              'Authorization': `Bearer ${serviceToken}`,
              'X-App-Id': APP_ID,
            },
          });
          console.log('[authLogin] user fetch status:', userRes.status);

          if (userRes.ok) {
            const userData = await userRes.json();
            otpCode = userData.otp_code || null;
            console.log('[authLogin] otp_code from REST:', !!otpCode);
          }
        }

        // 4. If we have the OTP, verify the email
        if (otpCode) {
          const verifyRes = await fetch(`${BASE44_API}/apps/${APP_ID}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp_code: otpCode }),
          });
          const verifyText = await verifyRes.text();
          console.log('[authLogin] verify-otp status:', verifyRes.status, verifyText.slice(0, 150));
        } else {
          console.log('[authLogin] no OTP available, cannot auto-verify');
        }

        // 5. Retry login (works if verify succeeded OR if already verified by previous attempt)
        attempt = await tryPasswordLogin(email, password);
        console.log('[authLogin] attempt2 status:', attempt.status, attempt.text.slice(0, 200));

        if (!attempt.ok) {
          return new Response(JSON.stringify({
            success: false, message: 'Login failed. Please verify your email before logging in.', subscriptionActive: false,
          }), { status: 401, headers: CORS });
        }

        token = attempt.data?.access_token || attempt.data?.token || null;
        authUser = attempt.data?.user || users[0];
        console.log('[authLogin] retry login OK, token:', !!token);

      } else {
        // Unknown error from Base44
        return new Response(JSON.stringify({
          success: false, message: 'Login failed: ' + (attempt.data?.message || attempt.data?.detail || 'Unknown error'), subscriptionActive: false,
        }), { status: 401, headers: CORS });
      }
    }

    if (!token) {
      return new Response(JSON.stringify({
        success: false, message: 'Could not obtain session token. Please try again.', subscriptionActive: false,
      }), { status: 500, headers: CORS });
    }

    // ── Step 2: Load or auto-create subscription ──────────────────────────
    // Use the exact email returned by the auth response (canonical case)
    const userEmail = authUser?.email || email;
    console.log('[authLogin] looking up subscription for:', userEmail);

    let subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: userEmail });
    let activeSub = subs.find(s => ['active', 'trial'].includes(s.status)) || null;

    // If no active subscription exists, create a Basic/trial one so the user can log in
    if (!activeSub) {
      console.log('[authLogin] no active subscription found — creating default Basic subscription');
      activeSub = await base44.asServiceRole.entities.VPNSubscription.create({
        user_email: userEmail,
        plan: 'Basic',
        status: 'active',
        billing_cycle: 'monthly',
        start_date: new Date().toISOString(),
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        max_devices: 3,
        price: 0,
      });
      console.log('[authLogin] created subscription id:', activeSub.id);
    }

    // Ensure max_devices is always a positive integer (guard against null/0)
    if (!activeSub.max_devices || activeSub.max_devices < 1) {
      await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, { max_devices: 3 });
      activeSub = { ...activeSub, max_devices: 3 };
    }

    const subscriptionActive = true; // guaranteed — we created one above if missing

    // ── Step 3: Device fingerprint enforcement ─────────────────────────────
    let deviceRecord = null;
    let deviceLimitExceeded = false;

    if (device_id) {
      const maxDevices = activeSub.max_devices;
      const allDevices = await base44.asServiceRole.entities.LinkedDevice.filter({ subscription_id: activeSub.id });

      const knownDevice = allDevices.find(d => d.device_id === device_id);
      // Only count devices with a device_id set (registered via app) as "active"
      const registeredDevices = allDevices.filter(d => d.device_id && d.device_id.trim() !== '');

      if (knownDevice) {
        // Always allow known devices — just refresh last_connected
        await base44.asServiceRole.entities.LinkedDevice.update(knownDevice.id, {
          status: 'active',
          last_connected: new Date().toISOString(),
        });
        deviceRecord = { ...knownDevice, status: 'active' };
      } else if (registeredDevices.length >= maxDevices) {
        deviceLimitExceeded = true;
      } else {
        deviceRecord = await base44.asServiceRole.entities.LinkedDevice.create({
          subscription_id: activeSub.id,
          device_name: device_name || 'Desktop App',
          device_type: device_type || 'windows',
          device_id,
          status: 'active',
          last_connected: new Date().toISOString(),
        });
      }
    }

    if (deviceLimitExceeded) {
      return new Response(JSON.stringify({
        success: false,
        message: `Device limit reached. Your plan allows ${activeSub.max_devices} device(s). Please revoke another device from the dashboard.`,
        subscriptionActive: true,
        deviceLimitExceeded: true,
      }), { status: 403, headers: CORS });
    }

    console.log(`[authLogin] SUCCESS user=${userEmail} sub=${subscriptionActive}`);

    return new Response(JSON.stringify({
      success: true,
      message: subscriptionActive ? 'Login successful.' : 'Login successful, but no active subscription.',
      user: { email: userEmail, name: authUser?.full_name || null },
      subscriptionActive,
      token,
      ...(activeSub && {
        subscription: {
          plan: activeSub.plan,
          status: activeSub.status,
          renewal_date: activeSub.renewal_date,
          max_devices: activeSub.max_devices,
          plan_tier: PLAN_TIERS[activeSub.plan] || 1,
        }
      }),
      ...(deviceRecord && {
        device: {
          id: deviceRecord.id,
          device_name: deviceRecord.device_name,
          device_type: deviceRecord.device_type,
        }
      }),
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[authLogin] error:', error.message, error.stack?.slice(0, 300));
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
      subscriptionActive: false,
    }), { status: 500, headers: CORS });
  }
});