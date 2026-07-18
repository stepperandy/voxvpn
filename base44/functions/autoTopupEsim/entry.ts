import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // This can be called from the webhook (service role) or directly
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { esim_id } = body;
  if (!esim_id) return Response.json({ error: 'Missing esim_id' }, { status: 400 });

  // Fetch the eSIM record
  const esims = await base44.asServiceRole.entities.ESim.filter({ id: esim_id });
  if (!esims || esims.length === 0) {
    return Response.json({ error: 'eSIM not found' }, { status: 404 });
  }
  const esim = esims[0];

  if (!esim.auto_topup) {
    return Response.json({ skipped: 'auto_topup not enabled' });
  }
  if (esim.auto_topup_triggered) {
    return Response.json({ skipped: 'auto_topup already triggered for this cycle' });
  }

  // Fetch user to check credits
  const users = await base44.asServiceRole.entities.User.filter({ email: esim.user_email });
  if (!users || users.length === 0) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  const user = users[0];
  const price = esim.price_paid || 0;

  if ((user.credits || 0) < price) {
    console.warn(`[autoTopupEsim] Insufficient credits for ${esim.user_email}: has $${user.credits}, needs $${price}`);

    // Send insufficient credits email
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'VoxDigits <noreply@voxdigits.com>',
          to: [esim.user_email],
          subject: `⚠️ Auto Top-up Failed — Insufficient Credits`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
            <h2 style="color:#f59e0b;">⚠️ Auto Top-up Failed</h2>
            <p style="color:#cbd5e1;">We tried to automatically top up your eSIM plan <strong>${esim.product_name}</strong> but your account balance is too low.</p>
            <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
              <p style="color:#94a3b8;margin:0 0 4px 0;font-size:13px;">Current Balance</p>
              <p style="font-size:22px;font-weight:bold;color:#ef4444;margin:0;">$${(user.credits || 0).toFixed(2)}</p>
              <p style="color:#94a3b8;margin:8px 0 4px 0;font-size:13px;">Required</p>
              <p style="font-size:22px;font-weight:bold;color:#22d3ee;margin:0;">$${price.toFixed(2)}</p>
            </div>
            <p style="color:#cbd5e1;">Please <a href="https://voxdigits.com/Billing" style="color:#22d3ee;">add credits</a> to your account to keep your eSIM connected.</p>
            <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Team</p>
          </div>`
        })
      });
    }

    return Response.json({ error: 'Insufficient credits', user_credits: user.credits, required: price });
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
    console.error("[autoTopupEsim] Airalo auth failed:", tokenData);
    return Response.json({ error: 'Airalo authentication failed' }, { status: 500 });
  }
  const airaloToken = tokenData.data?.access_token;

  // Place a new Airalo order for the same package
  const orderRes = await fetch("https://partners-api.airalo.com/v2/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${airaloToken}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ package_id: String(esim.product_id), quantity: 1, type: "sim" }),
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) {
    console.error("[autoTopupEsim] Airalo order failed:", orderData);
    return Response.json({ error: 'Failed to place eSIM order' }, { status: 500 });
  }

  const sim = orderData.data?.sims?.[0];
  if (!sim?.iccid) {
    console.error("[autoTopupEsim] No ICCID returned:", orderData);
    return Response.json({ error: 'No ICCID from Airalo' }, { status: 500 });
  }

  const smdpAddress2 = sim.smdp_address || sim.lpa || "";
  const matchingId2 = sim.matching_id || sim.ac || "";
  let lpaString = "";
  if (smdpAddress2 && matchingId2) {
    lpaString = `LPA:1$${smdpAddress2}$${matchingId2}`;
  } else if (smdpAddress2 && smdpAddress2.startsWith("LPA:")) {
    lpaString = smdpAddress2;
  } else if (sim.qrcode && sim.qrcode.startsWith("LPA:")) {
    lpaString = sim.qrcode;
  } else {
    lpaString = sim.qrcode || smdpAddress2 || "";
  }
  const newBalance = (user.credits || 0) - price;

  // Deduct credits
  await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });

  // Log transaction
  await base44.asServiceRole.entities.Transaction.create({
    user_email: esim.user_email,
    type: 'debit',
    category: 'esim',
    amount: price,
    balance_before: user.credits,
    balance_after: newBalance,
    description: `Auto top-up: ${esim.product_name}`,
    status: 'completed',
  });

  // Save new eSIM record
  await base44.asServiceRole.entities.ESim.create({
    user_email: esim.user_email,
    product_id: esim.product_id,
    product_name: esim.product_name,
    iccid: sim.iccid,
    qr_code: lpaString,
    airalo_order_id: String(orderData.data?.id || ""),
    status: "active",
    price_paid: price,
    auto_topup: true,
    auto_topup_triggered: false,
  });

  // Mark old eSIM as topup triggered so we don't do it again
  await base44.asServiceRole.entities.ESim.update(esim.id, { auto_topup_triggered: true });

  // Send success email
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'VoxDigits <noreply@voxdigits.com>',
        to: [esim.user_email],
        subject: `✅ Auto Top-up Successful — ${esim.product_name}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
          <h2 style="color:#22d3ee;">✅ Auto Top-up Successful!</h2>
          <p style="color:#cbd5e1;">Your eSIM plan <strong>${esim.product_name}</strong> has been automatically renewed as your data reached 80%.</p>
          <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:8px;padding:20px;margin:20px 0;">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 6px 0;">New ICCID</p>
            <p style="font-size:16px;font-weight:bold;color:#22d3ee;letter-spacing:1px;margin:0;word-break:break-all;">${sim.iccid}</p>
            ${lpaString ? `<p style="color:#94a3b8;font-size:13px;margin:12px 0 6px 0;">Activation Code (LPA)</p>
            <p style="font-size:12px;color:#22d3ee;font-family:monospace;margin:0;word-break:break-all;">${lpaString}</p>` : ''}
          </div>
          <p style="color:#cbd5e1;"><strong>Amount charged:</strong> $${price.toFixed(2)} credits</p>
          <p style="color:#cbd5e1;"><strong>Remaining balance:</strong> $${newBalance.toFixed(2)}</p>
          <p style="color:#94a3b8;font-size:13px;margin-top:16px;">Install your new eSIM from the <a href="https://voxdigits.com/MyESims" style="color:#22d3ee;">My eSIMs</a> page.</p>
          <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Team</p>
        </div>`
      })
    });
  }

  console.log(`[autoTopupEsim] Success: new ICCID ${sim.iccid} for ${esim.user_email}, balance: $${newBalance}`);
  return Response.json({ success: true, new_iccid: sim.iccid, new_balance: newBalance });
});