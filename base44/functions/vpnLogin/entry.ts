import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const APP_ID = Deno.env.get('BASE44_APP_ID');
const BASE44_API = 'https://base44.app/api';

async function tryPasswordLogin(email, password) {
  const res = await fetch(`${BASE44_API}/apps/${APP_ID}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  console.log('[vpnLogin] auth attempt status:', res.status, text.slice(0, 300));
  return { ok: res.ok, status: res.status, data, text };
}

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
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required.',
      }), { status: 400, headers: CORS });
    }

    // Step 1: Try password login
    let attempt = await tryPasswordLogin(email, password);
    let token = null;
    let authUser = null;

    if (attempt.ok) {
      token = attempt.data?.access_token || attempt.data?.token || null;
      authUser = attempt.data?.user || null;

    } else {
      const errLower = attempt.text.toLowerCase();
      const isWrongPassword = errLower.includes('invalid email or password') || errLower.includes('invalid credentials');
      const isUnverified = errLower.includes('verif') || errLower.includes('confirm');

      if (isWrongPassword) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid email or password.',
        }), { status: 401, headers: CORS });
      }

      // Handle unverified email — auto-verify using service token OTP method
      if (isUnverified) {
        const users = await base44.asServiceRole.entities.User.filter({ email });
        if (!users || users.length === 0) {
          return new Response(JSON.stringify({ success: false, message: 'Invalid email or password.' }), { status: 401, headers: CORS });
        }

        const userId = users[0].id;

        await fetch(`${BASE44_API}/apps/${APP_ID}/auth/resend-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const serviceToken = getServiceToken(req);
        if (serviceToken) {
          const userRes = await fetch(`${BASE44_API}/apps/${APP_ID}/entities/User/${userId}`, {
            headers: { 'Authorization': `Bearer ${serviceToken}`, 'X-App-Id': APP_ID },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            const otpCode = userData.otp_code || null;
            if (otpCode) {
              await fetch(`${BASE44_API}/apps/${APP_ID}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp_code: otpCode }),
              });
            }
          }
        }

        attempt = await tryPasswordLogin(email, password);
        if (!attempt.ok) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Login failed. Please verify your email first.',
          }), { status: 401, headers: CORS });
        }

        token = attempt.data?.access_token || attempt.data?.token || null;
        authUser = attempt.data?.user || users[0];

      } else {
        return new Response(JSON.stringify({
          success: false,
          message: attempt.data?.message || attempt.data?.detail || 'Login failed.',
        }), { status: 401, headers: CORS });
      }
    }

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication failed. Please try again.',
      }), { status: 500, headers: CORS });
    }

    // Step 2: Check active subscription
    const userEmail = authUser?.email || email;
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: userEmail });
    const activeSub = subs?.find(s => ['active', 'trial'].includes(s.status)) || null;

    if (!activeSub) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No active subscription found. Please purchase a VoxVPN plan at voxvpn.net.',
      }), { status: 403, headers: CORS });
    }

    // Step 3: Check expiry
    if (activeSub.renewal_date && new Date(activeSub.renewal_date) < new Date()) {
      await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, { status: 'expired' });
      return new Response(JSON.stringify({
        success: false,
        message: `Subscription expired on ${new Date(activeSub.renewal_date).toLocaleDateString()}. Please renew at voxvpn.net.`,
      }), { status: 403, headers: CORS });
    }

    const expiresAt = activeSub.renewal_date
      ? new Date(activeSub.renewal_date).toISOString().split('T')[0]
      : null;

    return new Response(JSON.stringify({
      success: true,
      token,
      email: userEmail,
      subscription_status: activeSub.status,
      plan: activeSub.plan,
      expires_at: expiresAt,
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[vpnLogin] error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
    }), { status: 500, headers: CORS });
  }
});