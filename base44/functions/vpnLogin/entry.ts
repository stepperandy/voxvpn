import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, password, device_id } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required.',
      }), { status: 400, headers: CORS });
    }

    console.log(`[vpnLogin] Login attempt for: ${email}`);

    // Step 1: Authenticate via Base44 SDK (uses the correct internal auth endpoint)
    let token = null;
    let authUser = null;
    try {
      const authResult = await base44.auth.loginViaEmailPassword(email, password);
      token = authResult.access_token || null;
      authUser = authResult.user || null;
      console.log(`[vpnLogin] Auth success for ${email}`);
    } catch (authErr) {
      console.log(`[vpnLogin] Auth failed for ${email}: ${authErr.message}`);
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password.',
      }), { status: 401, headers: CORS });
    }

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication succeeded but no token returned. Please contact support.',
      }), { status: 500, headers: CORS });
    }

    const userEmail = authUser?.email || email;
    console.log(`[vpnLogin] Auth success for ${userEmail}, token obtained`);

    // Step 2: Check subscription — only registered users with an existing
    // active/trial subscription may log in. No auto-creation on login.
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: userEmail });
    const activeSub = subs?.find(s => ['active', 'trial'].includes(s.status)) || null;

    console.log(`[vpnLogin] Found ${subs?.length || 0} subscriptions for ${userEmail}`);

    if (!activeSub) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No active subscription found. Please choose a plan to access VoxVPN.',
      }), { status: 403, headers: CORS });
    }

    console.log(`[vpnLogin] Subscription status: ${activeSub.status}, plan: ${activeSub.plan}`);

    // Allow all users with active or trial status - no blocking
    // Expired users can still access - they get trial access

    // Device lock - track but don't block
    if (device_id) {
      const deviceTag = `device:${device_id}`;
      const notes = activeSub.notes || '';
      const lockedMatch = notes.match(/device:([^\s\n]+)/);
      const lockedDevice = lockedMatch ? lockedMatch[1] : null;

      // Only lock on first device, don't block other devices
      if (!lockedDevice) {
        await base44.asServiceRole.entities.VPNSubscription.update(activeSub.id, {
          notes: (notes ? notes + '\n' : '') + deviceTag,
        });
      }
    }

    const expiresAt = activeSub.renewal_date
      ? new Date(activeSub.renewal_date).toISOString().split('T')[0]
      : null;

    console.log(`[vpnLogin] Success for ${userEmail} — plan: ${activeSub.plan}, expires: ${expiresAt}`);

    return new Response(JSON.stringify({
      success: true,
      token,
      email: userEmail,
      subscription_status: activeSub.status,
      plan: activeSub.plan,
      expires_at: expiresAt,
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('[vpnLogin] Unexpected error:', error.message, error.stack);
    return new Response(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.message,
    }), { status: 500, headers: CORS });
  }
});