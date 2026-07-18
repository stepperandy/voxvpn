import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const AIRALO_BASE = "https://partners-api.airalo.com/v2";

async function getAiraloToken() {
  const payload = {
    client_id: Deno.env.get("AIRALO_CLIENT_ID"),
    client_secret: Deno.env.get("AIRALO_CLIENT_SECRET"),
    grant_type: "client_credentials",
  };
  console.log("Request: POST /v1/auth/token", { client_id: payload.client_id });

  const res = await fetch(`${AIRALO_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body: new URLSearchParams(payload),
  });

  const data = await res.json();
  console.log("Response: POST /v1/auth/token", { status: res.status, has_token: !!data.data?.access_token });

  if (!res.ok) throw new Error(`Auth failed: ${data.message || res.status}`);
  return data.data?.access_token;
}

async function apiCall(method, path, token, body = null) {
  console.log(`Request: ${method} ${path}`, body ? body : "");
  const res = await fetch(`${AIRALO_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  console.log(`Response: ${method} ${path}`, { status: res.status, data: JSON.stringify(data).slice(0, 300) });

  return { ok: res.ok, status: res.status, data };
}

async function callWithRetry(method, path, bodyPayload, getToken) {
  let token = await getToken();
  let result = await apiCall(method, path, token, bodyPayload);

  if (result.status === 401) {
    console.log(`Got 401 on ${method} ${path} — refreshing token and retrying...`);
    token = await getToken();
    result = await apiCall(method, path, token, bodyPayload);
  }

  return result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, package_id, order_id, quantity = 1, product_name, price_paid } = body;

    // GET /v1/orders/{id}
    if (action === "get" && order_id) {
      const result = await callWithRetry("GET", `/orders/${order_id}`, null, getAiraloToken);
      if (!result.ok) return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
      return Response.json({ success: true, order: result.data.data });
    }

    // POST /v1/orders/{id}/topup
    if (action === "topup" && order_id && package_id) {
      const result = await callWithRetry("POST", `/orders/${order_id}/topup`, { package_id: String(package_id) }, getAiraloToken);
      if (!result.ok) return Response.json({ error: result.data.message || "Something went wrong. Try again." }, { status: 500 });
      return Response.json({ success: true, topup: result.data.data });
    }

    // POST /v1/orders (new order)
    if (!package_id) return Response.json({ error: "package_id is required" }, { status: 400 });

    const result = await callWithRetry("POST", "/orders", { package_id: String(package_id), quantity, type: "sim" }, getAiraloToken);

    if (!result.ok) {
      return Response.json({ error: result.data.message || "Something went wrong. Try again." }, { status: 500 });
    }

    const simInfo = result.data.data?.sims?.[0];
    if (!simInfo) return Response.json({ error: "No SIM returned from Airalo" }, { status: 500 });

    const esim = await base44.entities.ESim.create({
      user_email: user.email,
      product_id: String(package_id),
      product_name: product_name || simInfo.iccid,
      iccid: simInfo.iccid,
      qr_code: simInfo.lpa || simInfo.qrcode || "",
      airalo_order_id: String(result.data.data?.id || ""),
      status: "active",
      price_paid: price_paid || 0,
    });

    return Response.json({ success: true, esim, order_id: result.data.data?.id, airalo_order: result.data.data });

  } catch (error) {
    console.error("[airaloOrder] error:", error.message);
    return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
});