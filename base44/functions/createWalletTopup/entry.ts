/**
 * CREATE WALLET TOP-UP CHECKOUT
 * Creates a Stripe Checkout session for wallet top-ups ($10, $25, $50, $100).
 * Also supports enabling auto-recharge (charges saved payment method when balance < $2).
 *
 * POST body:
 *   amount: number (10, 25, 50, or 100)
 *   user_email: string
 *   success_url: string
 *   cancel_url: string
 *   enable_auto_recharge?: boolean
 *   auto_recharge_amount?: number (default 25)
 */

import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const VALID_AMOUNTS = [10, 25, 50, 100];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { amount, user_email, success_url, cancel_url, enable_auto_recharge, auto_recharge_amount } = body;

    if (!amount || !VALID_AMOUNTS.includes(amount)) {
      return Response.json({ error: `Invalid amount. Must be one of: ${VALID_AMOUNTS.join(", ")}` }, { status: 400 });
    }

    if (!user_email) {
      return Response.json({ error: "user_email is required" }, { status: 400 });
    }

    // Verify user exists
    const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
    if (!users || users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const user = users[0];
    const stripeCustomerId = user.stripe_customer_id || "";

    const origin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/") || "https://voxdigits.base44.app";

    const sessionParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Wallet Top-Up – $${amount}` },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      success_url: success_url || `${origin}/WalletTransactions?topup=success`,
      cancel_url: cancel_url || `${origin}/WalletTransactions?topup=cancel`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        type: "wallet_topup",
        user_email,
        topup_amount: String(amount),
        enable_auto_recharge: enable_auto_recharge ? "true" : "false",
        auto_recharge_amount: String(auto_recharge_amount || 25),
      },
    };

    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
      sessionParams.payment_method_options = { card: { setup_future_usage: "on_session" } };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`[createWalletTopup] Session ${session.id} for $${amount} to ${user_email}`);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("[createWalletTopup] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});