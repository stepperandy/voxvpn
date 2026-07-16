/**
 * Verify Google Play purchase, store transaction, and fulfill (eSIM / credits / number credits)
 *
 * Expected body:
 * {
 *   purchase_token: string,       // from Google Play billing library
 *   product_id: string,           // Google Play product ID
 *   purchase_type: "esim"|"credits"|"number",
 *   price: number,                // USD amount paid
 *   // for esim:
 *   airalo_package_id?: string,
 *   product_name?: string,
 *   // for credits:
 *   credits_amount?: number,
 * }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// ─── Google Service Account JWT ─────────────────────────────────────────────
async function getGoogleAccessToken() {
  const clientEmail = Deno.env.get("GOOGLE_PLAY_CLIENT_EMAIL");
  const rawKey = Deno.env.get("GOOGLE_PLAY_PRIVATE_KEY").replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const signingInput = `${encode({ alg: "RS256", typ: "JWT" })}.${encode(jwtPayload)}`;

  const pemContents = rawKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signingInput}.${sigB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(`Google auth failed: ${JSON.stringify(tokenData)}`);
  return tokenData.access_token;
}

// ─── Fulfillment helpers ──────────────────────────────────────────────────────
async function fulfillCredits(base44, userEmail, creditsAmount, price, orderId) {
  const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
  if (!users.length) throw new Error("User not found");
  const u = users[0];
  const newBalance = (u.credits || 0) + creditsAmount;
  await base44.asServiceRole.entities.User.update(u.id, { credits: newBalance });
  await base44.asServiceRole.entities.Transaction.create({
    user_email: userEmail,
    type: "credit",
    category: "top_up",
    amount: price,
    balance_before: u.credits || 0,
    balance_after: newBalance,
    description: `Android IAP: ${creditsAmount} credits`,
    reference_id: orderId,
    status: "completed",
  });
  return { credits_added: creditsAmount, new_balance: newBalance };
}

async function fulfillEsim(base44, userEmail, airaloPackageId, productName, price, orderId) {
  // Airalo auth
  const tokenRes = await fetch("https://partners-api.airalo.com/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      client_id: Deno.env.get("AIRALO_CLIENT_ID"),
      client_secret: Deno.env.get("AIRALO_CLIENT_SECRET"),
      grant_type: "client_credentials",
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(`Airalo auth failed: ${JSON.stringify(tokenData)}`);
  const airaloToken = tokenData.data?.access_token;

  // Place order
  const orderRes = await fetch("https://partners-api.airalo.com/v2/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${airaloToken}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ package_id: airaloPackageId, quantity: 1, type: "sim" }),
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) throw new Error(`Airalo order failed: ${JSON.stringify(orderData)}`);

  const sim = orderData.data?.sims?.[0];
  if (!sim?.iccid) throw new Error("No ICCID returned from Airalo");

  const smdpAddress = sim.smdp_address || sim.lpa || "";
  const matchingId = sim.matching_id || sim.ac || "";
  const lpaString = (smdpAddress && matchingId)
    ? `LPA:1$${smdpAddress}$${matchingId}`
    : (sim.qrcode || smdpAddress);

  await base44.asServiceRole.entities.ESim.create({
    user_email: userEmail,
    product_id: airaloPackageId,
    product_name: productName || airaloPackageId,
    iccid: sim.iccid,
    qr_code: lpaString,
    airalo_order_id: String(orderData.data?.id || ""),
    status: "active",
    price_paid: price,
  });

  await base44.asServiceRole.entities.Transaction.create({
    user_email: userEmail,
    type: "debit",
    category: "esim",
    amount: price,
    description: `Android IAP: eSIM ${productName || airaloPackageId}`,
    reference_id: orderId,
    status: "completed",
  });

  return { iccid: sim.iccid, qr_code: lpaString };
}

async function fulfillNumber(base44, userEmail, price, orderId, productId) {
  // Add equivalent credits so user can pick their number in the app
  const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
  if (!users.length) throw new Error("User not found");
  const u = users[0];
  const newBalance = (u.credits || 0) + price;
  await base44.asServiceRole.entities.User.update(u.id, { credits: newBalance });
  await base44.asServiceRole.entities.Transaction.create({
    user_email: userEmail,
    type: "credit",
    category: "top_up",
    amount: price,
    balance_before: u.credits || 0,
    balance_after: newBalance,
    description: `Android IAP: Virtual Number (${productId})`,
    reference_id: orderId,
    status: "completed",
  });
  return { credits_added: price, new_balance: newBalance, message: "Credits added — select your number in the app" };
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user;
    try {
      user = await base44.auth.me();
    } catch (_) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { purchase_token, product_id, purchase_type, price = 0, credits_amount, airalo_package_id, product_name } = body;

    if (!purchase_token || !product_id || !purchase_type) {
      return Response.json({ error: "Missing required fields: purchase_token, product_id, purchase_type" }, { status: 400 });
    }

    // ── Idempotency check ─────────────────────────────────────────────────────
    const existing = await base44.asServiceRole.entities.AndroidPurchase.filter({ purchase_token });
    if (existing.length > 0 && existing[0].status === "fulfilled") {
      console.log(`[verifyAndroidPurchase] Duplicate purchase_token for ${user.email}`);
      return Response.json({ error: "Purchase already fulfilled", already_fulfilled: true, fulfillment_data: existing[0].fulfillment_data }, { status: 409 });
    }

    // ── Verify with Google Play ───────────────────────────────────────────────
    const packageName = Deno.env.get("GOOGLE_PLAY_PACKAGE_NAME");
    const accessToken = await getGoogleAccessToken();

    const verifyRes = await fetch(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${product_id}/tokens/${purchase_token}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const purchaseData = await verifyRes.json();

    if (!verifyRes.ok) {
      console.error("[verifyAndroidPurchase] Verification failed:", JSON.stringify(purchaseData));
      return Response.json({ error: "Google Play verification failed", details: purchaseData }, { status: 400 });
    }

    // purchaseState: 0 = purchased, 1 = cancelled, 2 = pending
    if (purchaseData.purchaseState !== 0) {
      return Response.json({ error: "Purchase not completed", purchase_state: purchaseData.purchaseState }, { status: 400 });
    }

    const orderId = purchaseData.orderId || purchase_token;
    const purchaseTime = purchaseData.purchaseTimeMillis
      ? new Date(parseInt(purchaseData.purchaseTimeMillis)).toISOString()
      : new Date().toISOString();

    // ── Store purchase record ─────────────────────────────────────────────────
    const purchaseRecord = await base44.asServiceRole.entities.AndroidPurchase.create({
      user_email: user.email,
      purchase_token,
      product_id,
      purchase_type,
      order_id: orderId,
      purchase_time: purchaseTime,
      purchase_state: purchaseData.purchaseState,
      status: "pending_fulfillment",
    });

    // ── Fulfill ───────────────────────────────────────────────────────────────
    let fulfillmentResult = {};

    if (purchase_type === "credits") {
      fulfillmentResult = await fulfillCredits(base44, user.email, credits_amount || 0, price, orderId);
    } else if (purchase_type === "esim") {
      fulfillmentResult = await fulfillEsim(base44, user.email, airalo_package_id || product_id, product_name, price, orderId);
    } else if (purchase_type === "number") {
      fulfillmentResult = await fulfillNumber(base44, user.email, price, orderId, product_id);
    }

    // ── Mark fulfilled ────────────────────────────────────────────────────────
    await base44.asServiceRole.entities.AndroidPurchase.update(purchaseRecord.id, {
      status: "fulfilled",
      fulfillment_data: JSON.stringify(fulfillmentResult),
    });

    // ── Acknowledge the purchase (required to prevent refund by Google) ───────
    await fetch(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${product_id}/tokens/${purchase_token}:acknowledge`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }
    );

    console.log(`[verifyAndroidPurchase] Fulfilled ${purchase_type} for ${user.email}, order: ${orderId}`);
    return Response.json({ success: true, fulfillment: fulfillmentResult });

  } catch (error) {
    console.error("[verifyAndroidPurchase] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});