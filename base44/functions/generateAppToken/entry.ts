import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    // Verify active subscription (or admin)
    if (user.role !== 'admin') {
      const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => ['active', 'trial'].includes(s.status));
      if (!active) return Response.json({ error: 'No active subscription' }, { status: 403, headers: corsHeaders });
    }

    // Delete any existing unused tokens for this user
    const existing = await base44.asServiceRole.entities.AppLinkToken.filter({ user_id: user.id, used: false });
    for (const t of (existing || [])) {
      await base44.asServiceRole.entities.AppLinkToken.delete(t.id);
    }

    // Generate new token
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await base44.asServiceRole.entities.AppLinkToken.create({
      user_id: user.id,
      user_email: user.email,
      token,
      expires_at: expiresAt,
      used: false,
    });

    return Response.json({
      token,
      email: user.email,
      expires_at: expiresAt,
      expires_in_seconds: 900,
    }, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});