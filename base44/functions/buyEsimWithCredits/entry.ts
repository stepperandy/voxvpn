import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { package_id, product_name, price } = await req.json();

  if (!package_id || !price) return Response.json({ error: 'Missing required fields' }, { status: 400 });

  const currentCredits = user.credits || 0;
  if (currentCredits < price) {
    return Response.json({ error: `Insufficient credits. You have $${currentCredits.toFixed(2)} but need $${price.toFixed(2)}.` }, { status: 400 });
  }

  // Get Airalo token
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
  if (!tokenRes.ok) {
    console.error("Airalo auth failed:", tokenData);
    return Response.json({ error: 'Airalo authentication failed' }, { status: 500 });
  }
  const airaloToken = tokenData.data?.access_token;

  // Place Airalo order
  const orderRes = await fetch("https://partners-api.airalo.com/v2/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${airaloToken}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ package_id: String(package_id), quantity: 1, type: "sim" }),
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) {
    console.error("Airalo order failed:", orderData);
    return Response.json({ error: 'Failed to place eSIM order' }, { status: 500 });
  }

  const sim = orderData.data?.sims?.[0];
  console.log("[buyEsimWithCredits] Airalo sim data:", JSON.stringify(sim));
  if (!sim?.iccid) {
    console.error("No ICCID returned:", orderData);
    return Response.json({ error: 'No ICCID returned from Airalo' }, { status: 500 });
  }

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
    // fallback: try to compose from whatever we have
    lpaString = sim.qrcode || smdpAddress || "";
  }
  console.log("[buyEsimWithCredits] sim fields:", JSON.stringify({ lpa: sim.lpa, qrcode: sim.qrcode, smdp_address: sim.smdp_address, matching_id: sim.matching_id, ac: sim.ac }));
  console.log("[buyEsimWithCredits] LPA string built:", lpaString);

  // Deduct credits
  const newBalance = currentCredits - price;
  await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });

  // Log transaction
  await base44.entities.Transaction.create({
    user_email: user.email,
    type: 'debit',
    category: 'esim',
    amount: price,
    balance_before: currentCredits,
    balance_after: newBalance,
    description: `eSIM purchase: ${product_name}`,
    status: 'completed',
  });

  // Save eSIM record
  await base44.entities.ESim.create({
    user_email: user.email,
    product_id: String(package_id),
    product_name,
    iccid: sim.iccid,
    qr_code: lpaString,
    airalo_order_id: String(orderData.data?.id || ""),
    status: "active",
    price_paid: price,
  });

  // Send confirmation email
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
      from: 'VoxDigits <noreply@voxdigits.com>',
      to: [user.email],
      subject: 'Your VoxDigits eSIM is Ready 🌍',
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
        <h2 style="color:#22d3ee;">Your eSIM is Ready! 🎉</h2>
        <p style="color:#cbd5e1;">Paid with account credits — no card needed.</p>
        <p style="color:#cbd5e1;"><strong>Plan:</strong> ${product_name}</p>

        <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="color:#94a3b8;font-size:13px;margin:0 0 6px 0;">ICCID Number</p>
          <p style="font-size:18px;font-weight:bold;color:#22d3ee;letter-spacing:1px;margin:0;word-break:break-all;">${sim.iccid}</p>
        </div>

        ${sim.lpa || sim.qrcode ? `<div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="color:#94a3b8;font-size:13px;margin:0 0 6px 0;">Activation Code (LPA)</p>
          <p style="font-size:13px;color:#22d3ee;font-family:monospace;margin:0;word-break:break-all;">${sim.lpa || sim.qrcode}</p>
        </div>` : ''}

        <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="color:#94a3b8;font-size:13px;margin:0 0 10px 0;"><strong>📱 Installation Steps:</strong></p>
          <ol style="color:#cbd5e1;font-size:13px;margin:0;padding-left:20px;">
            <li style="margin-bottom:8px;">Go to <strong>My eSIMs</strong> section in your VoxDigits dashboard</li>
            <li style="margin-bottom:8px;">Click <strong>Install eSIM</strong> on your purchased plan</li>
            <li style="margin-bottom:8px;">Scan the QR code or manually enter the activation code</li>
            <li style="margin-bottom:8px;">Follow your device's eSIM installation prompts</li>
            <li style="margin-bottom:8px;">Activate your plan once installed on your device</li>
          </ol>
        </div>

        <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="color:#94a3b8;font-size:13px;margin:0 0 10px 0;"><strong>✅ What You Can Do:</strong></p>
          <ul style="color:#cbd5e1;font-size:13px;margin:0;padding-left:20px;">
            <li>Browse the internet with high-speed data</li>
            <li>Use messaging apps and social media</li>
            <li>Stream videos and music</li>
            <li>Make VoIP calls (WhatsApp, Skype, Viber)</li>
            <li>Access global connectivity without roaming charges</li>
          </ul>
        </div>

        <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="color:#94a3b8;font-size:13px;margin:0 0 8px 0;"><strong>💡 Device Compatibility:</strong></p>
          <p style="color:#cbd5e1;font-size:13px;margin:0;">Your eSIM works on all modern devices with eSIM support. Check your device's compatibility before activation.</p>
        </div>

        <p style="color:#cbd5e1;"><strong>Amount charged:</strong> $${price.toFixed(2)} credits</p>
        <p style="color:#cbd5e1;"><strong>Remaining balance:</strong> $${newBalance.toFixed(2)}</p>

        <div style="text-align:center;margin-top:24px;">
          <a href="https://voxdigits.com/ESimDashboard" style="display:inline-block;background:#22d3ee;color:#0d1f35;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Go to My eSIMs</a>
        </div>

        <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:16px;margin:24px 0;">
          <p style="color:#cbd5e1;font-size:13px;margin:0 0 8px;"><strong>Need Help?</strong></p>
          <p style="color:#cbd5e1;font-size:12px;margin:0;">Visit our Help Center or contact support@voxdigits.com</p>
        </div>

        <p style="color:#64748b;font-size:12px;margin-top:24px;border-top:1px solid #1e4060;padding-top:16px;">© 2026 VoxDigits. All rights reserved.</p>
      </div>`
      })
    });
  }

  console.log(`[buyEsimWithCredits] eSIM ${sim.iccid} provisioned for ${user.email}, credits deducted: $${price}`);
  return Response.json({ success: true, iccid: sim.iccid, new_balance: newBalance });
});