import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * trackAnalytics — track user events for analytics
 * Body: { event_name, properties?, user_id? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const body = await req.json();
    const { event_name, properties = {} } = body;

    if (!event_name) {
      return Response.json({ error: 'event_name required' }, { status: 400 });
    }

    const event = {
      event_name,
      user_email: user?.email,
      properties,
      timestamp: new Date().toISOString(),
      user_agent: req.headers.get('user-agent'),
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    };

    // Store analytics event (in production, use BigQuery or similar)
    console.log(`[ANALYTICS] ${event_name}:`, properties);

    // Send to external analytics service (e.g., Segment, Mixpanel, etc.)
    if (Deno.env.get('SEGMENT_WRITE_KEY')) {
      await fetch('https://api.segment.io/v1/track', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(Deno.env.get('SEGMENT_WRITE_KEY') + ':')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          event: event_name,
          properties,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('trackAnalytics error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});