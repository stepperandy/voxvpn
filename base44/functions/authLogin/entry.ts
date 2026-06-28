import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PLAN_TIERS = {
  'Free Trial': 1,
  'Basic': 1,
  '1 Month': 2,
  '3 Months': 2,
  '6 Months': 3,
  '1 Year': 4,
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
      }), { status: 400, headers: CORS });
    }

    const base44 = createClientFromRequest(req);

    // ── Step 1: Verify the user exists in the registered User database ──
    // No auto-creation — if the email isn't in the User table, reject immediately.
    const registeredUsers = await base44.asServiceRole.entities.User.filter({ email });
    if (!registeredUsers || registeredUsers.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password',
      }), { status: 401, headers: CORS });
    }

    // ── Step 2: Verify password via Base44 SDK ──
    // loginViaEmailPassword throws on wrong credentials — no auto-creation.
    let token = null;
    let authUser = null;

    try {
      const authResult = await base44.auth.loginViaEmailPassword(email, password);
      token = authResult.access_token || null;
      authUser = authResult.user || null;
    } catch (_) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password',
      }), { status: 401, headers: CORS });
    }

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password',
      }), { status: 401, headers: CORS });
    }

    const userEmail = authUser?.email || email;

    // ── Step 3: Verify the user has an ACTIVE VoxVPN subscription ──
    // Applies to ALL users — no admin bypass, no exceptions.
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: userEmail });
    const activeSub = subs && subs.length > 0
      ? subs.find(s => s.status === 'active' || s.status === 'trial')
      : null;

    if (!activeSub) {
      const hasSubRecords = subs && subs.length > 0;
      const subMsg = hasSubRecords
        ? 'Your subscription has expired or is not active. Please renew or choose a new plan.'
        : 'No active subscription found. Please choose a plan to activate your VPN access.';
      return new Response(JSON.stringify({
        success: false,
        message: subMsg,
        redirectToPricing: true,
      }), { status: 403, headers: CORS });
    }

    // ── Step 4: Device fingerprint enforcement ──
    let deviceRecord = null;
    let deviceLimitExceeded = false;

    if (device_id) {
      const maxDevices = activeSub.max_devices && activeSub.max_devices >= 1
        ? activeSub.max_devices
        : 3;
      const allDevices = await base44.asServiceRole.entities.LinkedDevice.filter({
        subscription_id: activeSub.id,
      });

      const knownDevice = allDevices.find(d => d.device_id === device_id);
      const registeredDevices = allDevices.filter(d => d.device_id && d.device_id.trim() !== '');

      if (knownDevice) {
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
          device_name: device_name || 'Mobile App',
          device_type: device_type || 'android',
          device_id,
          status: 'active',
          last_connected: new Date().toISOString(),
        });
      }
    }

    if (deviceLimitExceeded) {
      return new Response(JSON.stringify({
        success: false,
        message: `Device limit reached. Your plan allows ${activeSub.max_devices || 3} device(s). Please revoke another device from the dashboard.`,
      }), { status: 403, headers: CORS });
    }

    // ── Success: registered user, verified password, active subscription ──
    return new Response(JSON.stringify({
      success: true,
      token,
      user: { email: userEmail, name: authUser?.full_name || null },
      subscription: {
        plan: activeSub.plan,
        status: activeSub.status,
        renewal_date: activeSub.renewal_date,
        max_devices: activeSub.max_devices || 3,
        plan_tier: PLAN_TIERS[activeSub.plan] || 1,
      },
      ...(deviceRecord && {
        device: {
          id: deviceRecord.id,
          device_name: deviceRecord.device_name,
          device_type: deviceRecord.device_type,
        },
      }),
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[authLogin] error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
    }), { status: 500, headers: CORS });
  }
});