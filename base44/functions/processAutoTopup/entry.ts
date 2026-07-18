import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@16.0.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if auto-topup is enabled
    if (!user.auto_topup_enabled || !user.stripe_payment_method_id || !user.stripe_customer_id) {
      return Response.json({ skipped: true, reason: 'Auto-topup not configured' });
    }

    // Check if balance is below threshold
    const currentBalance = user.credits || 0;
    const threshold = user.auto_topup_threshold || 5;

    if (currentBalance >= threshold) {
      return Response.json({ skipped: true, reason: 'Balance above threshold' });
    }

    // Calculate amount to charge (convert dollars to cents)
    const topupAmount = user.auto_topup_amount || 25;
    const amountInCents = Math.round(topupAmount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: user.stripe_customer_id,
      payment_method: user.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      description: `Auto-topup for ${user.email}`,
      metadata: {
        user_id: user.id,
        email: user.email,
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        type: 'auto_topup'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Add credits to user
      const newBalance = currentBalance + topupAmount;
      await base44.auth.updateMe({
        credits: newBalance
      });

      console.log(`Auto-topup successful for ${user.email}: +$${topupAmount}`);

      return Response.json({
        success: true,
        amount: topupAmount,
        new_balance: newBalance,
        payment_intent_id: paymentIntent.id
      });
    } else if (paymentIntent.status === 'processing') {
      return Response.json({
        processing: true,
        payment_intent_id: paymentIntent.id
      });
    } else {
      console.error(`Auto-topup failed for ${user.email}:`, paymentIntent.last_payment_error);
      return Response.json({
        error: 'Payment failed',
        details: paymentIntent.last_payment_error?.message
      }, { status: 400 });
    }
  } catch (error) {
    console.error('processAutoTopup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});