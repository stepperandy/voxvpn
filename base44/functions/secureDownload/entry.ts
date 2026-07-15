import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const platform = body.platform || 'Windows';

    // Business roles bypass the personal subscription check — their access
    // is governed by their Client/Agency membership, not an individual plan.
    const businessRoles = ['admin', 'client_admin', 'agency_admin', 'super_admin'];
    if (!businessRoles.includes(user.role)) {
      const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: user.email });
      const active = subs?.find(s => ['active', 'trial'].includes(s.status));

      if (!active) {
        return Response.json({ error: 'No active subscription. Please purchase a VoxVPN plan to download.' }, { status: 403, headers: corsHeaders });
      }

      if (active.renewal_date && new Date(active.renewal_date) < new Date()) {
        await base44.asServiceRole.entities.VPNSubscription.update(active.id, { status: 'expired' });
        return Response.json({
          error: `Your subscription expired on ${new Date(active.renewal_date).toLocaleDateString()}. Please renew to continue downloading.`,
          expired: true,
          renewal_date: active.renewal_date,
        }, { status: 403, headers: corsHeaders });
      }
    }

    // Get the latest active download entry for this platform
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform, is_active: true });
    const sorted = downloads?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const entry = sorted?.find(d => d.notes?.startsWith('[SECURE]')) || sorted?.[0];

    if (!entry?.file_url) {
      return Response.json({ error: 'No installer available for this platform.' }, { status: 404, headers: corsHeaders });
    }

    const fileUri = entry.file_url;
    const filename = entry.name || (platform === 'Android' ? 'VoxVPN.apk' : 'VoxVPN-Setup.exe');

    // Private storage URI — generate a signed URL the browser can download directly
    if (!fileUri.startsWith('http')) {
      const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: fileUri,
        expires_in: 300,
      });
      return Response.json({ url: signed.signed_url, filename }, { status: 200, headers: corsHeaders });
    }

    // External URL (GitHub release, etc.) — return it directly for the browser to download
    return Response.json({ url: fileUri, filename }, { status: 200, headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});