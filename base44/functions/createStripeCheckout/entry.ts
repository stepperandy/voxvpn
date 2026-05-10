import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Plan-to-price mapping (USD prices)
const PLAN_PRICES = {
  'Basic': { monthly: 3.99, yearly: 29.88 },
  'Standard': { monthly: 6.99, yearly: 53.88 },
  'Premium': { monthly: 9.99, yearly: 77.88 },
  'Advanced': { monthly: 14.99, yearly: 119.88 },
  'Enterprise': { monthly: 29.99, yearly: 239.88 },
};

// CNY prices (roughly 7x USD)
const PLAN_PRICES_CNY = {
  'Basic': { monthly: 27.93, yearly: 209.16 },
  'Standard': { monthly: 48.93, yearly: 377.16 },
  'Premium': { monthly: 69.93, yearly: 545.16 },
  'Advanced': { monthly: 104.93, yearly: 839.16 },
  'Enterprise': { monthly: 209.93, yearly: 1679.16 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { plan, isBilledYearly, paymentMethod, currency } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return Response.json({ error: 'Invalid plan name' }, { status: 400 });
    }

    // Determine currency and validate payment method combo
    const isCNY = currency === 'CNY' || paymentMethod === 'alipay' || paymentMethod === 'wechat_pay';
    const finalCurrency = isCNY ? 'CNY' : 'USD';
    const prices = isCNY ? PLAN_PRICES_CNY : PLAN_PRICES;

    // Try to get authenticated user — not required for checkout
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_) {
      // unauthenticated — continue
    }

    const customerEmail = user?.email || undefined;
    const planPrice = prices[plan];
    const amountInCents = Math.round((isBilledYearly ? planPrice.yearly : planPrice.monthly) * 100);

    // Use request origin for preview/prod compatibility, fallback to APP_URL
    const origin = req.headers.get('origin') || Deno.env.get('APP_URL') || 'https://voxvpn.net';

    const stripe = await import('npm:stripe@14.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    // Determine payment method types based on selected method
    let paymentMethodTypes = ['card'];
    if (paymentMethod === 'alipay') paymentMethodTypes = ['alipay'];
    if (paymentMethod === 'wechat_pay') paymentMethodTypes = ['wechat_pay'];

    // Always use payment mode (one-time)
    const sessionConfig = {
      mode: 'payment',
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: finalCurrency.toLowerCase(),
            product_data: {
              name: `VoxVPN ${plan} Plan`,
              description: isBilledYearly ? 'Yearly subscription' : 'Monthly subscription',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/download?payment=success`,
      cancel_url: `${origin}/pricing`,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        plan: plan,
        billing: isBilledYearly ? 'yearly' : 'monthly',
        ...(user ? { user_id: user.id, email: user.email } : {}),
      },
    };

    const session = await stripeClient.checkout.sessions.create(sessionConfig);

    return Response.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});