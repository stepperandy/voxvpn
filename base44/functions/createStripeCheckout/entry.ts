import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_PRICES = {
  'Basic': { monthly: 3.99, yearly: 29.88 },
  'Standard': { monthly: 6.99, yearly: 53.88 },
  'Premium': { monthly: 9.99, yearly: 77.88 },
  'Advanced': { monthly: 14.99, yearly: 119.88 },
  'Enterprise': { monthly: 29.99, yearly: 239.88 },
};

const CURRENCY_RATES = {
  'CNY': 7.3,
  'GBP': 0.79,
  'EUR': 0.92,
  'JPY': 155,
  'INR': 83,
  'BRL': 4.97,
  'AUD': 1.50,
  'USD': 1,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { plan, isBilledYearly, paymentMethod, currencyCode, countryCode } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get the authenticated user's email so the webhook can provision the subscription
    let userEmail = null;
    try {
      const user = await base44.auth.me();
      userEmail = user?.email || null;
    } catch (_) {}

    const stripe = await import('npm:stripe@14.0.0');
    const client = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const planPrice = PLAN_PRICES[plan];
    let usdAmount = isBilledYearly ? planPrice.yearly : planPrice.monthly;
    
    // Use provided currency or default to USD
    let currency = (currencyCode || 'USD').toLowerCase();
    const rate = CURRENCY_RATES[currencyCode] || 1;
    const convertedAmount = usdAmount * rate;
    
    const amount = Math.round(convertedAmount * 100);
    const origin = req.headers.get('origin') || Deno.env.get('APP_URL') || 'https://voxvpn.net';

    const paymentMethods = ['card', 'alipay', 'wechat_pay'];
    
    const sessionParams = {
      mode: 'payment',
      payment_method_types: paymentMethods,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `VoxVPN ${plan} Plan`,
              description: isBilledYearly ? 'Yearly' : 'Monthly',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_method_options: {
        wechat_pay: { client: 'web' },
      },
      metadata: {
        plan: plan,
        billing: isBilledYearly ? 'yearly' : 'monthly',
        email: userEmail || '',
      },
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/payment-failed`,
    };

    // Attach customer email so Stripe and webhook can identify the buyer
    if (userEmail) {
      sessionParams.customer_email = userEmail;
    }

    const session = await client.checkout.sessions.create(sessionParams);

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
});