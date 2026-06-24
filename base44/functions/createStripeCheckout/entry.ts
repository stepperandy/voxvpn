import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_PRICES = {
  'Basic': { monthly: 2.59, sixmonths: 13.99, yearly: 29.88 },
  'Standard': { monthly: 6.99, sixmonths: 13.99, yearly: 53.88 },
  'Premium': { monthly: 9.99, sixmonths: 13.99, yearly: 77.88 },
  'Advanced': { monthly: 14.99, sixmonths: 13.99, yearly: 24.99 },
  'Enterprise': { monthly: 29.99, sixmonths: 13.99, yearly: 45.99 },
};

// Maps user-facing plan names (durations) to internal Stripe plan keys
const PLAN_ALIASES = {
  '1 Month': 'Basic', '1 month': 'Basic', 'monthly': 'Basic',
  '3 Months': 'Standard', '3 months': 'Standard',
  '6 Months': 'Premium', '6 months': 'Premium',
  '1 Year': 'Advanced', '1 year': 'Advanced', '12 Months': 'Advanced',
  '2 Years': 'Enterprise', '2 years': 'Enterprise', '24 Months': 'Enterprise',
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
    const { plan: rawPlan, isBilledYearly, isSixMonths, paymentMethod, currencyCode, countryCode } = body;
    const plan = PLAN_ALIASES[rawPlan] || (PLAN_PRICES[rawPlan] ? rawPlan : null);

    if (!plan) {
      return Response.json({ error: `Invalid plan: ${rawPlan || 'none provided'}` }, { status: 400 });
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
    let usdAmount = isBilledYearly ? planPrice.yearly : isSixMonths ? planPrice.sixmonths : planPrice.monthly;
    
    // Use provided currency or default to USD
    let currency = (currencyCode || 'USD').toLowerCase();
    const rate = CURRENCY_RATES[currencyCode] || 1;
    const convertedAmount = usdAmount * rate;
    
    const amount = Math.round(convertedAmount * 100);
    const origin = req.headers.get('origin') || Deno.env.get('APP_URL') || 'https://voxvpn.net';

    // Do NOT force payment_method_types — if any listed method isn't enabled in the
    // Stripe Dashboard, Stripe rejects the ENTIRE session (breaking card, Alipay, and
    // WeChat Pay all at once). Instead, let Stripe show whatever is enabled in the
    // Dashboard for the given currency. Enable Alipay + WeChat Pay in:
    // Stripe Dashboard → Settings → Payment methods
    const sessionParams = {
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `VoxVPN ${plan} Plan`,
              description: isBilledYearly ? 'Yearly' : isSixMonths ? '6 Months' : 'Monthly',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan: plan,
        billing: isBilledYearly ? 'yearly' : isSixMonths ? 'sixmonths' : 'monthly',
        email: userEmail || '',
      },
      // WeChat Pay requires client='web' for browser checkout. This option is only
      // applied if WeChat Pay is enabled in the Stripe Dashboard — safe to include
      // even if it isn't, Stripe ignores options for unavailable methods.
      ...(currency === 'cny' && {
        payment_method_options: {
          wechat_pay: { client: 'web' },
        },
      }),
      success_url: `${origin}/dashboard?payment=success&plan=${encodeURIComponent(plan)}`,
      cancel_url: `${origin}/payment-failed`,
    };

    // Attach customer email so Stripe and webhook can identify the buyer
    if (userEmail) {
      sessionParams.customer_email = userEmail;
    }

    const session = await client.checkout.sessions.create(sessionParams);

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error.message, error.type, error.code);
    return Response.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
});