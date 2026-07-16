import Stripe from "npm:stripe@14";
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

async function sendEmail(to, subject, html) {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    console.warn('RESEND_API_KEY not set - skipping email to', to);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'VoxDigits <noreply@voxdigits.com>',
      to: [to],
      subject,
      html
    })
  });
  const data = await res.json();
  console.log('Resend response:', JSON.stringify(data));
}

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const type = session.metadata?.type;
    const customer_email = session.customer_details?.email || session.metadata?.user_email || "";
    const base44 = createClientFromRequest(req);

    // Safety: ensure paying customers are never accidentally left as admin
    // (Base44 makes first registered user admin — buyers must be 'user' role)
    if (customer_email) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ email: customer_email });
        if (users.length > 0 && users[0].role === 'admin') {
          // Only downgrade if this admin account was NOT intentionally set
          // We check by seeing if there are NO other admin users (i.e., they're the only admin = likely the accidental first-user admin)
          const allAdmins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
          if (allAdmins.length <= 1) {
            // There's only 1 admin and they're a buyer — this is the accidental admin situation
            // Do NOT downgrade — log a warning instead so the app owner can manually fix
            console.warn(`[stripeWebhook] ⚠️ Buyer ${customer_email} has admin role and is the only admin. Please manually verify this account in the admin panel.`);
          }
        }
      } catch (e) {
        console.warn('[stripeWebhook] Role check failed:', e.message);
      }
    }

    // --- Wallet Credit from Number Subscription Checkout ---
    const walletCredit = Number(session.metadata?.wallet_credit || 0);
    if (walletCredit > 0 && customer_email) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ email: customer_email });
        if (users.length > 0) {
          const user = users[0];
          const newBalance = (user.credits || 0) + walletCredit;
          await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });
          await base44.asServiceRole.entities.Transaction.create({
            user_email: customer_email, type: "credit", category: "top_up",
            amount: walletCredit, balance_before: user.credits || 0, balance_after: newBalance,
            description: "Calling & SMS credit from number checkout", reference_id: session.id, status: "completed",
          });
          console.log(`[stripeWebhook] Credited $${walletCredit} wallet credit to ${customer_email}, new balance: ${newBalance}`);
          await sendEmail(customer_email, "VoxDigits – Calling & SMS Credit Added 💳",
            `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
              <h2 style="color:#22d3ee;">Calling & SMS Credit Added!</h2>
              <p style="color:#cbd5e1;">$${walletCredit.toFixed(2)} in calling & SMS credit has been added to your wallet.</p>
              <p style="color:#cbd5e1;">This credit is used for outgoing calls and SMS messages — it is <strong>not</strong> a service fee. Your number subscription remains active separately.</p>
              <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Team</p>
            </div>`
          );
        }
      } catch (err) {
        console.error("[stripeWebhook] Wallet credit error:", err.message);
      }
    }

    // --- eSIM Fulfillment ---
    if (type === "esim") {
      const package_id = session.metadata?.product_id;
      const product_name = session.metadata?.product_name || `eSIM Package ${package_id}`;
      const price_paid = (session.amount_total || 0) / 100;
      console.log(`[stripeWebhook] Fulfilling eSIM order for session ${session.id}, package ${package_id}`);
      try {
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
        if (!tokenRes.ok) throw new Error(`Airalo auth failed: ${JSON.stringify(tokenData)}`);
        const airaloToken = tokenData.data?.access_token;

        // Place Airalo order
        const orderRes = await fetch("https://partners-api.airalo.com/v2/orders", {
          method: "POST",
          headers: { Authorization: `Bearer ${airaloToken}`, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ package_id: String(package_id), quantity: 1, type: "sim" }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(`Airalo order failed: ${JSON.stringify(orderData)}`);

        const sim = orderData.data?.sims?.[0];
        if (!sim?.iccid) throw new Error("No ICCID returned from Airalo");
        console.log(`[stripeWebhook] sim fields:`, JSON.stringify({ lpa: sim.lpa, qrcode: sim.qrcode, smdp_address: sim.smdp_address, matching_id: sim.matching_id, ac: sim.ac }));

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
        console.log(`[stripeWebhook] LPA built: ${lpaString}`);

        // Prevent double-fulfillment: check if session already processed
        const existing = await base44.asServiceRole.entities.ESim.filter({ stripe_session_id: session.id });
        if (existing.length > 0) {
          console.log(`[stripeWebhook] Session ${session.id} already fulfilled, skipping.`);
          return Response.json({ received: true });
        }

        await base44.asServiceRole.entities.ESim.create({
          user_email: customer_email,
          product_id: String(package_id),
          product_name,
          iccid: sim.iccid,
          qr_code: lpaString,
          airalo_order_id: String(orderData.data?.id || ""),
          stripe_session_id: session.id,
          status: "active",
          price_paid,
        });
        console.log(`[stripeWebhook] eSIM provisioned: ${sim.iccid} for ${customer_email}`);

        if (customer_email) {
          const lpaCode = lpaString;
          await sendEmail(customer_email, "Your VoxDigits eSIM is Ready 🌍",
            `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
              <h2 style="color:#22d3ee;margin-bottom:4px;">Your eSIM is Ready! 🎉</h2>
              <p style="color:#94a3b8;margin-top:0;">Payment confirmed — your plan has been activated instantly.</p>

              <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:10px;padding:20px;margin:24px 0;">
                <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Plan</p>
                <p style="color:#fff;font-size:18px;font-weight:bold;margin:0;">${product_name}</p>
              </div>

              <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:10px;padding:20px;margin:16px 0;">
                <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">ICCID</p>
                <p style="color:#22d3ee;font-size:15px;font-weight:bold;font-family:monospace;letter-spacing:1px;margin:0;">${sim.iccid}</p>
              </div>

              ${lpaCode ? `<div style="background:#0a2a45;border:1px solid #1e4060;border-radius:10px;padding:20px;margin:16px 0;">
                <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Activation Code (LPA)</p>
                <p style="color:#22d3ee;font-size:12px;font-family:monospace;word-break:break-all;margin:0;">${lpaCode}</p>
              </div>` : ''}

              <div style="background:#0a2a45;border:1px solid #1e4060;border-radius:10px;padding:20px;margin:16px 0;">
                <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Amount Paid</p>
                <p style="color:#fff;font-size:18px;font-weight:bold;margin:0;">$${price_paid.toFixed(2)}</p>
              </div>

              <div style="background:#0f3020;border:1px solid #1a5c30;border-radius:10px;padding:20px;margin:24px 0;">
                <p style="color:#4ade80;font-weight:bold;margin:0 0 10px;">📱 How to install your eSIM</p>
                <ol style="color:#cbd5e1;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
                  <li>Go to <strong>Settings → Mobile / Cellular</strong> on your phone</li>
                  <li>Tap <strong>"Add eSIM"</strong> or <strong>"Add Data Plan"</strong></li>
                  <li>Log in to your VoxDigits account and go to <strong>My eSIMs</strong> to scan the QR code</li>
                  <li>Or manually enter the activation code above</li>
                </ol>
              </div>

              <p style="color:#64748b;font-size:12px;margin-top:24px;text-align:center;">— The VoxDigits Team</p>
            </div>`
          );
        }
      } catch (err) {
        console.error("[stripeWebhook] eSIM fulfillment error:", err.message);
      }
      return Response.json({ received: true });
    }

    // --- Credits Deposit Fulfillment ---
    if (type === "credits") {
      const credits = Number(session.metadata?.credits || 0);
      const amount_paid = (session.amount_total || 0) / 100;
      console.log(`[stripeWebhook] Credits deposit: ${credits} credits for ${customer_email}, session ${session.id}`);
      try {
        if (customer_email && credits > 0) {
          // Find user and add credits
          const users = await base44.asServiceRole.entities.User.filter({ email: customer_email });
          if (users.length > 0) {
            const user = users[0];
            const newBalance = (user.credits || 0) + credits;
            await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });
            console.log(`[stripeWebhook] Added ${credits} credits to ${customer_email}, new balance: ${newBalance}`);

            // Log transaction
            await base44.asServiceRole.entities.Transaction.create({
              user_email: customer_email,
              type: "credit",
              category: "top_up",
              amount: amount_paid,
              balance_before: user.credits || 0,
              balance_after: newBalance,
              description: `Deposited ${credits} credits via Stripe`,
              reference_id: session.id,
              status: "completed",
            });
          } else {
            console.warn(`[stripeWebhook] No user found for email ${customer_email}`);
          }

          await sendEmail(customer_email, "VoxDigits – Credits Added to Your Account 💳",
            `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
              <h2 style="color:#22d3ee;">Credits Added!</h2>
              <p style="color:#cbd5e1;">Your payment of <strong>$${amount_paid.toFixed(2)}</strong> was received and <strong style="color:#22d3ee;">${credits} credits</strong> have been added to your account.</p>
              <p style="color:#cbd5e1;">You can now use your credits to purchase eSIM data plans.</p>
              <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Team</p>
            </div>`
          );
        }
      } catch (err) {
        console.error("[stripeWebhook] Credits fulfillment error:", err.message);
      }
      return Response.json({ received: true });
    }

    // --- Virtual Number Fulfillment ---
    if (type === "number") {
      const order_id = session.metadata?.order_id;
      if (order_id) {
        console.log(`[stripeWebhook] Virtual number payment complete, order_id=${order_id}`);
        try {
          const result = await base44.asServiceRole.functions.invoke('assignNumber', {
            order_id,
            stripe_subscription_id: session.subscription || '',
            stripe_customer_id: session.customer || '',
          });
          console.log(`[stripeWebhook] assignNumber result:`, JSON.stringify(result));
        } catch (err) {
          console.error('[stripeWebhook] assignNumber failed:', err.message);
        }
      } else {
        console.error(`[stripeWebhook] ❌ type=number but no order_id in session ${session.id} — number NOT provisioned!`);
      }
      return Response.json({ received: true });
    }

    // esim_airalo is handled by airaloStripeWebhook endpoint (registered separately)
    if (type === "esim_airalo") {
      console.log(`[stripeWebhook] esim_airalo session ${session.id} — handled by airaloStripeWebhook endpoint`);
      return Response.json({ received: true });
    }

    // ── Wallet Top-Up Fulfillment ──────────────────────────────────────────
    if (type === "wallet_topup") {
      const topupAmount = Number(session.metadata?.topup_amount || 0);
      const enableAutoRecharge = session.metadata?.enable_auto_recharge === "true";
      const autoRechargeAmount = Number(session.metadata?.auto_recharge_amount || 25);
      console.log(`[stripeWebhook] Wallet top-up: $${topupAmount} for ${customer_email}, session ${session.id}`);
      try {
        if (customer_email && topupAmount > 0) {
          const users = await base44.asServiceRole.entities.User.filter({ email: customer_email });
          if (users.length > 0) {
            const user = users[0];
            const newBalance = (user.credits || 0) + topupAmount;
            const updateData = { credits: newBalance };
            if (enableAutoRecharge) {
              updateData.auto_recharge_enabled = true;
              updateData.auto_recharge_amount = autoRechargeAmount;
              updateData.stripe_customer_id = session.customer || user.stripe_customer_id || "";
            }
            if (session.customer && !user.stripe_customer_id) {
              updateData.stripe_customer_id = session.customer;
            }
            await base44.asServiceRole.entities.User.update(user.id, updateData);
            await base44.asServiceRole.entities.Transaction.create({
              user_email: customer_email,
              type: "credit",
              category: "top_up",
              amount: topupAmount,
              balance_before: user.credits || 0,
              balance_after: newBalance,
              description: enableAutoRecharge
                ? `Wallet top-up $${topupAmount} (auto-recharge enabled at $${autoRechargeAmount})`
                : `Wallet top-up $${topupAmount}`,
              reference_id: session.id,
              status: "completed",
            });
            console.log(`[stripeWebhook] Wallet topped up $${topupAmount} for ${customer_email}, new balance: $${newBalance}`);
            await sendEmail(customer_email, "VoxDigits – Wallet Top-Up Confirmed 💳",
              `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
                <h2 style="color:#22d3ee;">Wallet Top-Up Confirmed!</h2>
                <p>$${topupAmount.toFixed(2)} has been added to your wallet.</p>
                <p>New balance: <strong>$${newBalance.toFixed(2)}</strong></p>
                ${enableAutoRecharge ? `<p style="background:#0f3020;border:1px solid #1a5c30;border-radius:10px;padding:16px;margin:16px 0;"><strong>✅ Auto-Recharge Enabled:</strong> Your wallet will automatically be topped up by $${autoRechargeAmount} when your balance drops below $2.</p>` : ""}
                <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Team</p>
              </div>`
            );
          }
        }
      } catch (err) {
        console.error("[stripeWebhook] Wallet top-up error:", err.message);
      }
      return Response.json({ received: true });
    }

    // Log unknown types for debugging
    if (type) {
      console.log(`[stripeWebhook] Unhandled type: ${type}, session: ${session.id}`);
    }
  }

  return Response.json({ received: true });
});