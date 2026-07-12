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

// Static fallback rates — kept in sync with src/hooks/useCurrencyDetection.js FALLBACK_RATES.
// Used only when the frontend cannot supply a live rate (e.g. China buyers where
// the rate is explicitly passed as null to force CNY conversion).
const CURRENCY_RATES = {
  'CNY': 7.3, 'USD': 1, 'GBP': 0.79, 'JPY': 155, 'INR': 83,
  'BRL': 4.97, 'AUD': 1.50, 'EUR': 0.92, 'GHS': 12.5, 'CAD': 1.36,
  'ZAR': 18.5, 'NGN': 1500, 'KES': 129, 'SGD': 1.35, 'HKD': 7.8,
  'MXN': 18.5, 'AED': 3.67, 'RUB': 90, 'KRW': 1380, 'THB': 36,
  'IDR': 16300, 'MYR': 4.7, 'PHP': 58, 'PKR': 278, 'EGP': 48,
  'TRY': 32, 'SAR': 3.75, 'QAR': 3.64, 'NZD': 1.65,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { plan: rawPlan, isBilledYearly, isSixMonths, paymentMethod, currencyCode, countryCode, rate: bodyRate, email: bodyEmail } = body;
    const plan = PLAN_ALIASES[rawPlan] || (PLAN_PRICES[rawPlan] ? rawPlan : null);

    if (!plan) {
      return Response.json({ error: `Invalid plan: ${rawPlan || 'none provided'}` }, { status: 400 });
    }

    // Get the authenticated user's email so the webhook can provision the subscription.
    // Fall back to the email passed from the frontend (for new users who haven't logged in yet).
    let userEmail = null;
    try {
      const user = await base44.auth.me();
      userEmail = user?.email || null;
    } catch (_) {}
    if (!userEmail && bodyEmail) {
      userEmail = bodyEmail;
    }

    const stripe = await import('npm:stripe@14.0.0');
    const client = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const planPrice = PLAN_PRICES[plan];
    let usdAmount = isBilledYearly ? planPrice.yearly : isSixMonths ? planPrice.sixmonths : planPrice.monthly;
    
    // Stripe supports a specific set of currencies. If the user's local currency
    // isn't supported (e.g. GHS for Ghana), fall back to USD so the checkout
    // session doesn't fail. The pricing page still shows converted prices for display.
    const STRIPE_SUPPORTED = new Set([
      'usd','aed','afn','all','amd','ang','aoa','ars','aud','awg','azn','bam','bbd',
      'bdt','bgn','bif','bmd','bnd','bob','brl','bsd','bwp','byn','bzl','cad','cdf',
      'chf','clp','cny','cop','crc','cve','czk','djf','dkk','dop','dzd','egp','etb',
      'eur','fjd','fkp','gbp','gel','gip','gmd','gnf','gtq','gyd','hkd','hnl','hrk',
      'htg','huf','idr','ils','inr','isk','jmd','jpy','kes','kgs','khr','kmf','krw',
      'kyd','kzt','lak','lbp','lkr','lrd','lsl','mad','mdl','mga','mkd','mmk','mnt',
      'mop','mur','mvr','mwk','mxn','myr','mzn','nad','ngn','nio','nok','npr','nzd',
      'pab','pen','pgk','php','pkr','pln','pyg','qar','ron','rsd','rub','rwf','sar',
      'sbd','scr','sek','sgd','shp','sle','sos','srd','std','szl','thb','tjs','top',
      'try','ttd','twd','tzs','uah','ugx','uyu','uzs','vnd','vuv','wst','xaf','xcd',
      'xcg','xof','xpf','yer','zar','zmw'
    ]);
    const requestedCurrency = (currencyCode || 'USD').toLowerCase();
    // If the user's local currency isn't supported by Stripe, charge in USD
    const currency = STRIPE_SUPPORTED.has(requestedCurrency) ? requestedCurrency : 'usd';
    const effectiveCurrencyCode = currency.toUpperCase();
    // Use the live rate from the frontend if provided (so the charged amount matches
    // what the user saw on the pricing page). Fall back to the static rates below.
    const rate = bodyRate || CURRENCY_RATES[effectiveCurrencyCode] || 1;
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
      // When a specific Chinese payment method is selected, explicitly request it.
      // This ensures WeChat Pay / Alipay show up on the checkout page for that method.
      // If the method isn't enabled in the Stripe Dashboard, Stripe will reject the
      // session — the error is surfaced to the user so they know to try another method.
      ...(paymentMethod === 'wechat_pay' && {
        payment_method_types: ['wechat_pay'],
        payment_method_options: { wechat_pay: { client: 'web' } },
      }),
      ...(paymentMethod === 'alipay' && {
        payment_method_types: ['alipay'],
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