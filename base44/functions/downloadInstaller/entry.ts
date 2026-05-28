import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let downloadUrl = null;
  let fileName = 'VoxVPN-Setup.exe';

  try {
    const base44 = createClientFromRequest(req);
    const downloads = await base44.asServiceRole.entities.Download.filter({ platform: 'Windows', is_active: true });
    const latest = downloads?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))?.[0];
    if (latest?.file_url) downloadUrl = latest.file_url;
    if (latest?.name) fileName = latest.name.replace(/[^a-zA-Z0-9.\-_]/g, '_') + '.exe';
  } catch (_) {}

  if (!downloadUrl) {
    return new Response(JSON.stringify({ error: 'No installer available. Please contact support.' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Proxy/stream the file so the browser never navigates to GitHub
  const upstream = await fetch(downloadUrl, {
    headers: { 'User-Agent': 'VoxVPN-Downloader/1.0' },
  });

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: 'File not available' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': upstream.headers.get('Content-Length') || '',
    },
  });
});