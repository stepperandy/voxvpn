import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const base44 = createClientFromRequest(req);

  // Check auth — only active subscribers can download
  let user = null;
  try {
    user = await base44.auth.me();
  } catch (_) {}

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admins always get access
  if (user.role !== 'admin') {
    const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email: user.email });
    const valid = subs?.find(s => s.status === 'active' || s.status === 'trial');
    if (!valid) {
      return Response.json({ error: 'No active subscription' }, { status: 403 });
    }
  }

  // Get the latest download URL from the Download entity, fallback to hardcoded
  let downloadUrl = 'https://github.com/stepperandy/voxvpn/releases/latest/download/VoxVPN-Setup-v2.0.exe';

  try {
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform: 'Windows', is_active: true });
    const latest = downloads?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))?.[0];
    if (latest?.file_url) {
      downloadUrl = latest.file_url;
    }
  } catch (_) {}

  // Redirect directly to the file — browser downloads it seamlessly
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      'Location': downloadUrl,
      'Content-Disposition': 'attachment; filename="VoxVPN-Setup.exe"',
    },
  });
});