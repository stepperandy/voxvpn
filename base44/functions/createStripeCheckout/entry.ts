import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Plan-to-price mapping (prices come from the app, not Stripe)
const PLAN_PRICES = {
  'Basic': { monthly: 3.99, yearly: 29.88 },
  'Standard': { monthly: 6.99, yearly: 53.88 },
  'Premium': { monthly: 9.99, yearly: 77.88 },
  'Advanced': { monthly: 14.99, yearly: 119.88 },
  'Enterprise': { monthly: 29.99, yearly: 239.88 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { plan, isBilledYearly } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return Response.json({ error: 'Invalid plan name' }, { status: 400 });
    }

    // Try to get authenticated user — not required for checkout
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_) {
      // unauthenticated — continue
    }

    const customerEmail = user?.email || undefined;
    const planPrice = PLAN_PRICES[plan];
    const amountInCents = Math.round((isBilledYearly ? planPrice.yearly : planPrice.monthly) * 100);

    const stripe = await import('npm:stripe@14.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `VoxVPN ${plan} Plan`,
              description: isBilledYearly ? 'Yearly subscription' : 'Monthly subscription',
            },
            unit_amount: amountInCents,
            recurring: isBilledYearly
              ? { interval: 'year', interval_count: 1 }
              : { interval: 'month', interval_count: 1 },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL')}/setup?token={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/#pricing`,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        plan: plan,
        billing: isBilledYearly ? 'yearly' : 'monthly',
        ...(user ? { user_id: user.id, email: user.email } : {}),
      },
    });

    return Response.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});