// Universal webhook receiver for Vonage, Twilio, and other services
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const contentType = req.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await req.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      data = Object.fromEntries(new URLSearchParams(text));
    } else {
      data = await req.text();
    }

    // Log webhook data
    console.log('[webhook] Received:', {
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      headers: {
        'user-agent': req.headers.get('user-agent'),
        'content-type': req.headers.get('content-type'),
      },
      data,
    });

    // Return 200 OK to acknowledge receipt
    return Response.json({ success: true, message: 'Webhook received' }, { status: 200 });

  } catch (error) {
    console.error('[webhook] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});