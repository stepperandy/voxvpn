import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const APP_ID = Deno.env.get('BASE44_APP_ID');
const APP_BASE_URL = `https://app--${APP_ID}.base44.app`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    // Show exactly what was received
    const received = {
      email,
      email_length: email?.length,
      password_length: password?.length,
      password_chars: password ? [...password].map(c => c.charCodeAt(0)) : [],
      password_hex: password ? [...password].map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join('') : null,
    };

    // Try the auth endpoint with exactly what was received
    const authRes = await fetch(`${APP_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const authText = await authRes.text();
    let authData = null;
    try { authData = JSON.parse(authText); } catch {}

    return new Response(JSON.stringify({
      received,
      auth_status: authRes.status,
      auth_response: authData,
    }), { status: 200, headers: CORS });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS });
  }
});