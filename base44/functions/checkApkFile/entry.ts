import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
    }

    // Get Android download entry
    const downloads = await base44.asServiceRole.entities.Download.filter({ 
      platform: 'Android', 
      is_active: true 
    });
    const entry = downloads?.[0];

    if (!entry?.file_url) {
      return Response.json({ error: 'No Android APK configured' }, { status: 404, headers: CORS });
    }

    const fileUrl = entry.file_url;
    console.log('[checkApkFile] Checking URL:', fileUrl);

    // HEAD request to get metadata without downloading
    const headRes = await fetch(fileUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'VoxVPN-APK-Checker/1.0',
      },
      redirect: 'follow',
    });

    const contentType = headRes.headers.get('content-type');
    const contentLength = headRes.headers.get('content-length');
    const finalUrl = headRes.url;

    // Also do a GET request to verify actual content
    const getRes = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'VoxVPN-APK-Checker/1.0',
        'Range': 'bytes=0-1023', // Only fetch first 1KB
      },
      redirect: 'follow',
    });

    const firstBytes = await getRes.arrayBuffer();
    const uint8 = new Uint8Array(firstBytes);
    
    // Check for APK magic bytes (APK files start with PK)
    const hasPKSignature = uint8[0] === 0x50 && uint8[1] === 0x4B && uint8[2] === 0x03 && uint8[3] === 0x04;
    
    // Check if it's HTML (starts with <!DOCTYPE or <html)
    const isHTML = contentType?.includes('text/html') || 
                   (new TextDecoder().decode(uint8.slice(0, 100)).toLowerCase().includes('<!doctype') ||
                    new TextDecoder().decode(uint8.slice(0, 100)).toLowerCase().includes('<html'));

    return Response.json({
      success: true,
      apk_url: fileUrl,
      final_url: finalUrl,
      content_type: contentType,
      content_length: contentLength,
      content_length_mb: contentLength ? (parseInt(contentLength) / (1024 * 1024)).toFixed(2) : 'unknown',
      has_pk_signature: hasPKSignature,
      is_valid_apk_start: hasPKSignature && !isHTML,
      is_html: isHTML,
      first_100_bytes_preview: new TextDecoder().decode(uint8.slice(0, 100)).replace(/\n/g, '\\n').slice(0, 200),
      response_status: headRes.status,
      redirect_chain: finalUrl !== fileUrl,
    }, { headers: CORS });

  } catch (error) {
    console.error('[checkApkFile] Error:', error.message);
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack?.slice(0, 500)
    }, { status: 500, headers: CORS });
  }
});