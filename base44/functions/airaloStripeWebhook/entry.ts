import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const AIRALO_BASE = "https://partners-api.airalo.com/v2";

async function getAiraloToken() {
  const res = await fetch(`${AIRALO_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
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

async function submitAiraloOrder(token, packageId) {
  const res = await fetch(`${AIRALO_BASE}/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ package_id: String(packageId), quantity: 1, type: "sim" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Airalo order failed: ${JSON.stringify(data)}`);
  return data.data;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  // Verify Stripe webhook signature
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")
    );
  } catch (err) {
    console.error("[airaloStripeWebhook] Signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true, skipped: true });
  }

  const session = event.data.object;

  // Only handle Airalo eSIM checkouts
  if (session.metadata?.type !== "esim_airalo") {
    return Response.json({ received: true, skipped: true });
  }

  if (session.payment_status !== "paid") {
    console.warn("[airaloStripeWebhook] Session not paid:", session.id);
    return Response.json({ received: true, skipped: true });
  }

  const { package_id, product_name, user_email } = session.metadata;
  const price_paid = (session.amount_total || 0) / 100;

  console.log(`[airaloStripeWebhook] Processing session ${session.id} for package ${package_id}`);

  try {
    // 0. Dedup: check if this session was already fulfilled
    const existing = await base44.asServiceRole.entities.ESim.filter({ stripe_session_id: session.id });
    if (existing && existing.length > 0) {
      console.log(`[airaloStripeWebhook] Session ${session.id} already fulfilled, skipping.`);
      return Response.json({ received: true, skipped: true });
    }

    // 1. Get Airalo token
    const token = await getAiraloToken();

    // 2. Place Airalo order
    const orderData = await submitAiraloOrder(token, package_id);
    console.log("[airaloStripeWebhook] Airalo order placed:", orderData?.id);

    const sim = orderData?.sims?.[0];
    if (!sim?.iccid) throw new Error("No ICCID returned from Airalo");

    // Build proper LPA string: LPA:1$<smdp_address>$<matching_id>
    const smdpAddress = sim.smdp_address || sim.lpa || "";
    const matchingId = sim.matching_id || sim.ac || "";
    let lpaString = "";
    if (smdpAddress && matchingId) {
      lpaString = `LPA:1$${smdpAddress}$${matchingId}`;
    } else if (smdpAddress && smdpAddress.startsWith("LPA:")) {
      lpaString = smdpAddress;
    } else if (sim.qrcode && sim.qrcode.startsWith("LPA:")) {
      lpaString = sim.qrcode;
    } else {
      lpaString = sim.qrcode || smdpAddress || "";
    }
    console.log(`[airaloStripeWebhook] sim fields:`, JSON.stringify({ lpa: sim.lpa, qrcode: sim.qrcode, smdp_address: sim.smdp_address, matching_id: sim.matching_id, ac: sim.ac }));
    console.log(`[airaloStripeWebhook] LPA string built: ${lpaString}`);

    // 3. Save eSIM to entity
    const esim = await base44.asServiceRole.entities.ESim.create({
      user_email: user_email || session.customer_email || "",
      product_id: String(package_id),
      product_name: product_name || `eSIM Package ${package_id}`,
      iccid: sim.iccid,
      qr_code: lpaString,
      airalo_order_id: String(orderData?.id || ""),
      stripe_session_id: session.id,
      status: "active",
      price_paid,
    });

    console.log(`[airaloStripeWebhook] eSIM saved: ${esim.id} ICCID: ${sim.iccid}`);

    return Response.json({ received: true, success: true, iccid: sim.iccid });

  } catch (err) {
    console.error("[airaloStripeWebhook] Provisioning error:", err.message);
    // Return 200 so Stripe doesn't retry — log the failure
    return Response.json({ received: true, error: err.message });
  }
});