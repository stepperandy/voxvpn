import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

// No raw fetch needed — SDK handles auth internally

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, device_id, device_name, device_type } = body;

    // Log the raw received data for debugging
    console.log('[authLogin] RAW REQUEST:', JSON.stringify({ email, password_length: password?.length, device_id, device_type }));

    if (!email || !password) {
      console.log('[authLogin] MISSING CREDENTIALS:', { has_email: !!email, has_password: !!password });
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required.',
        subscriptionActive: false,
      }), { status: 400, headers: CORS });
    }

    const base44 = createClientFromRequest(req);

    // ── Step 1: Authenticate via Base44 SDK ──────────────────────────────
    console.log('[authLogin] authenticating:', email);

    let token = null;
    let authUser = null;

    try {
      const authResult = await base44.auth.loginViaEmailPassword(email, password);
      token = authResult.access_token || null;
      authUser = authResult.user || null;
      console.log('[authLogin] SDK login OK, token:', !!token);
    } catch (authErr) {
      const msg = authErr.message || '';
      console.log('[authLogin] SDK login failed:', msg);
      
      // Fallback: Check if user has a VPNSubscription but no Base44 account (legacy website signup)
      const existingSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });
      if (existingSubs && existingSubs.length > 0) {
        // User has subscription but no Base44 account - create one
        console.log('[authLogin] Found legacy subscription, creating Base44 account for:', email);
        try {
          const newUser = await base44.users.create({ email, password, emailVerified: true });
          const authResult = await base44.auth.loginViaEmailPassword(email, password);
          token = authResult.access_token || null;
          authUser = authResult.user || null;
          console.log('[authLogin] Created Base44 account and logged in, token:', !!token);
        } catch (createErr) {
          console.log('[authLogin] Failed to create fallback account:', createErr.message);
          return new Response(JSON.stringify({
            success: false,
            message: 'Invalid email or password.',
            subscriptionActive: false,
          }), { status: 401, headers: CORS });
        }
      } else {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid email or password.',
          subscriptionActive: false,
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

    // Look up the platform user to check role
    const platformUsers = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    const isAdmin = platformUsers?.[0]?.role === 'admin';
    console.log('[authLogin] isAdmin:', isAdmin);

    let subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: userEmail });
    let activeSub = subs.find(s => ['active', 'trial'].includes(s.status)) || null;

    // Admins bypass subscription checks entirely
    if (!isAdmin) {
      // Block login if no active/trial subscription exists
      if (!activeSub) {
        console.log('[authLogin] no active subscription found for:', userEmail);
        return new Response(JSON.stringify({
          success: false,
          message: 'No active subscription found. Please purchase a VoxVPN plan at voxvpn.net to access the app.',
          subscriptionActive: false,
        }), { status: 403, headers: CORS });
      }

      // Block login if subscription renewal_date has passed — mark it expired
      if (activeSub.renewal_date && new Date(activeSub.renewal_date) < new Date()) {
        console.log('[authLogin] subscription expired for:', userEmail, 'renewal_date:', activeSub.renewal_date);
        await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, { status: 'expired' });
        return new Response(JSON.stringify({
          success: false,
          message: `Your subscription expired on ${new Date(activeSub.renewal_date).toLocaleDateString()}. Please renew at voxvpn.net to continue.`,
          subscriptionActive: false,
          expired: true,
          renewal_date: activeSub.renewal_date,
        }), { status: 403, headers: CORS });
      }
    }

    // Ensure max_devices is always a positive integer (guard against null/0)
    if (activeSub && (!activeSub.max_devices || activeSub.max_devices < 1)) {
      await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, { max_devices: 3 });
      activeSub = { ...activeSub, max_devices: 3 };
    }

    const subscriptionActive = true;

    // ── Step 3: Device fingerprint enforcement ─────────────────────────────
    let deviceRecord = null;
    let deviceLimitExceeded = false;

    if (device_id && !isAdmin) {
      const maxDevices = activeSub?.max_devices || 3;
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