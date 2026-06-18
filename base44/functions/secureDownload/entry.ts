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

    // For non-admins, verify active subscription with expiry check
    if (user.role !== 'admin') {
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
    const version = entry.version || '2.0.0';

    // Private storage URI — generate signed URL and stream
    if (!fileUri.startsWith('http')) {
      const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: fileUri,
        expires_in: 300,
      });
      const fileRes = await fetch(signed.signed_url);
      if (!fileRes.ok) throw new Error(`Storage fetch failed: ${fileRes.status}`);
      const ext = platform === 'Android' ? 'apk' : 'exe';
      const dlFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
      return new Response(fileRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${dlFilename}"`,
        },
      });
    }

    // External/GitHub URL — stream the file directly so users never see GitHub
    // GitHub releases require GET to follow the redirect chain to the CDN
    const fileRes = await fetch(fileUri, {
      method: 'GET',
      headers: { 'User-Agent': 'VoxVPN-Download-Proxy/1.0' },
      redirect: 'follow',
    });
    if (!fileRes.ok) throw new Error(`GitHub fetch failed: ${fileRes.status}`);

    const ext = platform === 'Android' ? 'apk' : 'exe';
    const dlFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

    // Stream the binary directly with download headers
    return new Response(fileRes.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${dlFilename}"`,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});