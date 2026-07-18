import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const AIRALO_BASE = "https://sandbox.airalo.com/v2";

async function getAiraloToken() {
  const res = await fetch(`${AIRALO_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body: new URLSearchParams({
      client_id: Deno.env.get("AIRALO_CLIENT_ID"),
      client_secret: Deno.env.get("AIRALO_CLIENT_SECRET"),
      grant_type: "client_credentials",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Airalo auth failed: ${JSON.stringify(data)}`);
  return data.data?.access_token;
}

async function placeAiraloOrder(token, packageId, quantity = 1) {
  const res = await fetch(`${AIRALO_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ package_id: String(packageId), quantity, type: "sim" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Airalo order failed: ${JSON.stringify(data)}`);
  return data.data;
}

// POST /api/webhooks/payment (test)
// Body: { package_id, user_email, product_name, price_paid }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { package_id, user_email, product_name, price_paid = 0 } = body;

    if (!package_id || !user_email) {
      return Response.json({ error: "package_id and user_email are required" }, { status: 400 });
    }

    console.log(`[testAiraloWebhook] Provisioning package ${package_id} for ${user_email}`);

    // 1. Get Airalo access token
    const token = await getAiraloToken();
    console.log("[testAiraloWebhook] Got Airalo token");

    // 2. Place order with Airalo
    const orderData = await placeAiraloOrder(token, package_id);
    console.log("[testAiraloWebhook] Order placed:", JSON.stringify(orderData));

    const simInfo = orderData?.sims?.[0];
    if (!simInfo) {
      return Response.json({ error: "No SIM returned from Airalo", raw: orderData }, { status: 500 });
    }

    // 3. Save eSIM to entity
    const esim = await base44.asServiceRole.entities.ESim.create({
      user_email,
      product_id: String(package_id),
      product_name: product_name || `Package ${package_id}`,
      iccid: simInfo.iccid,
      qr_code: simInfo.lpa || simInfo.qrcode || "",
      status: "active",
      price_paid,
    });

    console.log(`[testAiraloWebhook] eSIM saved: ${esim.id}`);

    return Response.json({
      success: true,
      message: "eSIM provisioned successfully",
      esim_id: esim.id,
      iccid: simInfo.iccid,
      qr_code: simInfo.lpa || simInfo.qrcode,
      airalo_order_id: orderData.id,
    });

  } catch (error) {
    console.error("[testAiraloWebhook] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});