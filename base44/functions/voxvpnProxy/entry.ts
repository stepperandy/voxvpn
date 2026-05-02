import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BASE_URL = (Deno.env.get('VOXVPN_API_URL') || 'http://192.168.1.42:5000').replace(/\/$/, '');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, ...params } = await req.json();

    // Route map: action → { method, path }
    const routes = {
      'health':        { method: 'GET',  path: '/' },
      'servers':       { method: 'GET',  path: '/servers' },
      'auto-fastest':  { method: 'GET',  path: '/auto-fastest' },
      'register':      { method: 'POST', path: '/register' },
      'login':         { method: 'POST', path: '/login' },
      'check-access':  { method: 'POST', path: '/check-access' },
      'connect':       { method: 'POST', path: '/connect' },
      'disconnect':    { method: 'POST', path: '/disconnect' },
    };

    const route = routes[action];
    if (!route) {
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const fetchOptions = {
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    };

    if (route.method === 'POST') {
      fetchOptions.body = JSON.stringify(params);
    }

    const res = await fetch(`${BASE_URL}${route.path}`, fetchOptions);
    const text = await res.text();

    // Try to parse as JSON, fall back to raw text
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return Response.json(data, { status: res.status });
  } catch (error) {
    console.error('VoxVPN proxy error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});