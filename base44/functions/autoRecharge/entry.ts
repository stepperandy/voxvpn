/**
 * AUTO-RECHARGE
 * Charges a user's saved Stripe payment method when wallet balance falls below $2.
 * Uses Stripe PaymentIntent with off-session payment (saved card).
 *
 * POST body:
 *   user_email: string  — specific user to charge (if triggered by billingEngine)
 *
 * Or no body — scans all users with auto_recharge_enabled=true and balance < $2.
 */

import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const THRESHOLD = 2.00;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { user_email } = body;

    const users = user_email
      ? await base44.asServiceRole.entities.User.filter({ email: user_email })
      : await base44.asServiceRole.entities.User.filter({ auto_recharge_enabled: true });

    if (!users || users.length === 0) {
      return Response.json({ success: true, message: "No users to process" });
    }

    const results = [];

    for (const user of users) {
      const balance = user.credits || 0;
      const autoEnabled = user.auto_recharge_enabled === true;
      const stripeCustomerId = user.stripe_customer_id;

      if (!autoEnabled || balance >= THRESHOLD) continue;
      if (!stripeCustomerId) {
        console.warn(`[autoRecharge] ${user.email} has auto-recharge enabled but no stripe_customer_id — skipping`);
        results.push({ email: user.email, status: "skipped", reason: "no_payment_method" });
        continue;
      }

      const rechargeAmount = user.auto_recharge_amount || 25;

      try {
        // Get the user's default payment method
        const customer = await stripe.customers.retrieve(stripeCustomerId, {
          expand: ["invoice_settings.default_payment_method"],
        });

        const paymentMethodId = customer.invoice_settings?.default_payment_method?.id
          || (customer as any).default_source;

        if (!paymentMethodId) {
          console.warn(`[autoRecharge] ${user.email} has no default payment method — skipping`);
          results.push({ email: user.email, status: "skipped", reason: "no_payment_method" });
          continue;
        }

        // Create PaymentIntent with 3D Secure
        const paymentIntent = await stripe.paymentIntents.create({
          amount: rechargeAmount * 100,
          currency: "usd",
          customer: stripeCustomerId,
          payment_method: typeof paymentMethodId === "string" ? paymentMethodId : (paymentMethodId as any).id,
          off_session: true,
          confirm: true,
          metadata: {
            type: "auto_recharge",
            user_email: user.email,
            base44_app_id: Deno.env.get("BASE44_APP_ID"),
          },
        });

        if (paymentIntent.status === "succeeded") {
          const newBalance = Math.round((balance + rechargeAmount) * 10000) / 10000;
          await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });
          await base44.asServiceRole.entities.Transaction.create({
            user_email: user.email,
            type: "credit",
            category: "top_up",
            amount: rechargeAmount,
            balance_before: balance,
            balance_after: newBalance,
            description: `Auto-recharge: $${rechargeAmount} (balance was below $${THRESHOLD})`,
            reference_id: paymentIntent.id,
            status: "completed",
          });
          console.log(`[autoRecharge] Auto-charged $${rechargeAmount} for ${user.email}, new balance: $${newBalance}`);
          results.push({ email: user.email, status: "charged", amount: rechargeAmount, new_balance: newBalance });

          // Send confirmation email
          const resendKey = Deno.env.get("RESEND_API_KEY");
          if (resendKey) {
            try {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                  from: "VoxDigits <noreply@voxdigits.com>",
                  to: user.email,
                  subject: "Auto-Recharge Completed ✅",
                  html: `<h2>Auto-Recharge Completed</h2><p>Your wallet was automatically topped up by <strong>$${rechargeAmount}</strong>.</p><p>New balance: <strong>$${newBalance.toFixed(2)}</strong></p><p>Auto-recharge triggers when your balance drops below $${THRESHOLD}.</p>`,
                }),
              });
            } catch (e) { console.warn("[autoRecharge] Email failed:", e.message); }
          }
        } else if (paymentIntent.status === "requires_action") {
          // 3D Secure required — user needs to authenticate
          // For auto-recharge, we can't prompt interactively — log and notify
          console.warn(`[autoRecharge] 3D Secure required for ${user.email} — payment not completed`);
          results.push({ email: user.email, status: "3ds_required", payment_intent_id: paymentIntent.id });
          // Send email asking user to manually top up
          const resendKey = Deno.env.get("RESEND_API_KEY");
          if (resendKey) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "VoxDigits <noreply@voxdigits.com>",
                to: user.email,
                subject: "⚠️ Auto-Recharge Failed — Action Required",
                html: `<h2>Auto-Recharge Could Not Complete</h2><p>Your bank requires additional authentication (3D Secure) for the automatic charge.</p><p>Please <a href="https://voxdigits.com/WalletTransactions">log in and manually top up your wallet</a> to avoid service interruption.</p><p>Current balance: <strong>$${balance.toFixed(2)}</strong></p>`,
              }),
            });
          }
        }
      } catch (err) {
        console.error(`[autoRecharge] Failed for ${user.email}:`, err.message);
        results.push({ email: user.email, status: "error", error: err.message });
      }
    }

    return Response.json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error("[autoRecharge] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});