import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Called by the desktop/mobile app to exchange a link token for user credentials.
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();
    if (!token) return Response.json({ error: 'Token required' }, { status: 400, headers: corsHeaders });

    // Find the token record
    const records = await base44.asServiceRole.entities.AppLinkToken.filter({ token, used: false });
    const record = records?.[0];

    if (!record) return Response.json({ error: 'Invalid or already used token' }, { status: 404, headers: corsHeaders });

    // Check expiry
    if (new Date(record.expires_at) < new Date()) {
      await base44.asServiceRole.entities.AppLinkToken.delete(record.id);
      return Response.json({ error: 'Token expired' }, { status: 401, headers: corsHeaders });
    }

    // Mark as used (single use)
    await base44.asServiceRole.entities.AppLinkToken.delete(record.id);

    // Get subscription
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: record.user_email });
    const active = subs?.find(s => ['active', 'trial'].includes(s.status));

    return Response.json({
      success: true,
      email: record.user_email,
      plan: active?.plan || null,
      status: active?.status || null,
      renewal_date: active?.renewal_date || null,
    }, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});