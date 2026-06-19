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
      // Check if user has a subscription but no auth account - auto-create it
      console.log('[authLogin] SDK login failed:', authErr.message || '');
      const existingSubs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: email });
      
      if (existingSubs && existingSubs.length > 0 && authErr.message?.includes('Invalid email or password')) {
        // User has subscription but no auth account - create one
        console.log('[authLogin] User has subscription but no auth account - creating...');
        try {
          await base44.auth.register({ email, password });
          const newAuthResult = await base44.auth.loginViaEmailPassword(email, password);
          token = newAuthResult.access_token || null;
          authUser = newAuthResult.user || null;
          console.log('[authLogin] Auto-created auth account, token:', !!token);
        } catch (createErr) {
          console.log('[authLogin] Failed to auto-create account:', createErr.message);
          // User already exists - just tell them to use correct password
          return new Response(JSON.stringify({
            success: false,
            message: 'Wrong password. Use the same password as your web dashboard, or tap "Forgot password" to reset.',
            subscriptionActive: false,
            userExists: true,
          }), { status: 401, headers: CORS });
        }
      } else {
        // Check if user exists with subscription to give helpful error
        const userExists = await base44.asServiceRole.entities.User.filter({ email });
        if (userExists && userExists.length > 0) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Invalid password. If you forgot your password, use "Forgot password" to reset it.',
            subscriptionActive: false,
            userExists: true,
          }), { status: 401, headers: CORS });
        }
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
      // Block login if no subscription exists at all
      if (!subs || subs.length === 0) {
        console.log('[authLogin] no subscription found for:', userEmail);
        return new Response(JSON.stringify({
          success: false,
          message: 'No subscription found. Please sign up for a VoxVPN plan to access the dashboard.',
          subscriptionActive: false,
        }), { status: 403, headers: CORS });
      }

      // Block login if subscription is pending_payment (user registered but hasn't paid)
      const pendingSub = subs.find(s => s.status === 'pending_payment');
      if (pendingSub && !activeSub) {
        console.log('[authLogin] subscription pending_payment for:', userEmail);
        return new Response(JSON.stringify({
          success: false,
          message: 'Payment required. Please complete your subscription purchase to access the dashboard.',
          subscriptionActive: false,
          pendingPayment: true,
        }), { status: 403, headers: CORS });
      }

      // Auto-create trial if no subscription exists - grant immediate access
      if (!activeSub) {
        activeSub = await base44.asServiceRole.entities.VPNSubscription.create({
          user_email: userEmail,
          plan: 'Free Trial',
          status: 'trial',
          billing_cycle: 'trial',
          start_date: new Date().toISOString(),
          renewal_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          max_devices: 1,
          price: 0,
          notes: 'Auto-trial: 5 days free access from login.',
        });
        console.log('[authLogin] Created trial subscription for:', userEmail);
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