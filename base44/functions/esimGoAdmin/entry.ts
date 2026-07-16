import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ESIM_GO_BASE = 'https://api.esim-go.com/v2.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const apiKey = Deno.env.get('ESIM_GO_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ESIM_GO_API_KEY not configured' }, { status: 500 });
    }

    const { action } = await req.json();

    const esimFetch = (path, options = {}) =>
      fetch(`${ESIM_GO_BASE}${path}`, {
        ...options,
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json', ...(options.headers || {}) },
      });

    // ── Test connection (fetch account info) ──
    if (action === 'test') {
      const res = await esimFetch('/account');
      if (!res.ok) {
        const err = await res.text();
        console.error('[esimGoAdmin] test failed:', res.status, err);
        return Response.json({ success: false, error: `API error ${res.status}: ${err}` });
      }
      const data = await res.json();
      console.log('[esimGoAdmin] connection OK:', JSON.stringify(data).slice(0, 200));
      return Response.json({ success: true, account: data });
    }

    // ── List bundles ──
    if (action === 'bundles') {
      const res = await esimFetch('/bundles');
      if (!res.ok) {
        const err = await res.text();
        console.error('[esimGoAdmin] bundles failed:', res.status, err);
        return Response.json({ success: false, error: `API error ${res.status}: ${err}` });
      }
      const data = await res.json();
      const bundles = data.bundles || data || [];
      console.log('[esimGoAdmin] fetched bundles count:', bundles.length);
      return Response.json({ success: true, bundles });
    }

    // ── Recent orders ──
    if (action === 'orders') {
      const res = await esimFetch('/orders?limit=50');
      if (!res.ok) {
        const err = await res.text();
        console.error('[esimGoAdmin] orders failed:', res.status, err);
        return Response.json({ success: false, error: `API error ${res.status}: ${err}` });
      }
      const data = await res.json();
      const orders = data.orders || data || [];
      console.log('[esimGoAdmin] fetched orders count:', orders.length);
      return Response.json({ success: true, orders });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('[esimGoAdmin] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});