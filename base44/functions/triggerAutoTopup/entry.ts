import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@16.0.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!user.auto_topup_enabled) {
      return Response.json({ skipped: true, reason: 'Auto-topup not enabled' });
    }

    const currentBalance = user.credits || 0;
    const threshold = user.auto_topup_threshold || 5;

    if (currentBalance >= threshold) {
      return Response.json({ skipped: true, reason: 'Balance above threshold', balance: currentBalance });
    }

    const topupAmount = user.auto_topup_amount || 25;
    const amountInCents = Math.round(topupAmount * 100);
    const appUrl = Deno.env.get("BASE44_PUBLIC_URL") || "https://app.voxdigits.com";

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Auto-Topup: Add $${topupAmount} Credits`,
            description: `Automatically replenish your VoxDigits balance`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/Credits?topup=success&amount=${topupAmount}`,
      cancel_url: `${appUrl}/Credits?topup=cancelled`,
      metadata: {
        type: 'credits',
        credits: topupAmount,
        email: user.email,
        user_id: user.id,
        auto_topup: 'true',
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
    });

    console.log(`Auto-topup checkout created for ${user.email}: $${topupAmount}`);
    return Response.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      amount: topupAmount,
      current_balance: currentBalance,
      threshold,
    });
  } catch (error) {
    console.error('triggerAutoTopup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});