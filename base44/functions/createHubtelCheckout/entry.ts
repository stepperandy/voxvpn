import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_PRICES = {
  'Basic':      { monthly: 3.99,  yearly: 29.88 },
  'Standard':   { monthly: 6.99,  yearly: 53.88 },
  'Premium':    { monthly: 9.99,  yearly: 77.88 },
  'Advanced':   { monthly: 14.99, yearly: 119.88 },
  'Enterprise': { monthly: 29.99, yearly: 239.88 },
};

// GHS conversion rate (approximate)
const USD_TO_GHS = 15.5;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { plan, isBilledYearly } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return Response.json({ error: 'Invalid plan name' }, { status: 400 });
    }

    let user = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try { user = await base44.auth.me(); } catch (_) {}
    }

    const planPrice = PLAN_PRICES[plan];
    const amountUSD = isBilledYearly ? planPrice.yearly : planPrice.monthly;
    const amountGHS = parseFloat((amountUSD * USD_TO_GHS).toFixed(2));

    const clientId = Deno.env.get('HUBTEL_CLIENT_ID');
    const clientSecret = Deno.env.get('HUBTEL_CLIENT_SECRET');
    const merchantAccount = Deno.env.get('HUBTEL_MERCHANT_ACCOUNT');
    const origin = req.headers.get('origin') || Deno.env.get('APP_URL') || 'https://voxvpn.net';

    const credentials = btoa(`${clientId}:${clientSecret}`);

    const payload = {
      totalAmount: amountGHS,
      description: `VoxVPN ${plan} Plan — ${isBilledYearly ? 'Yearly' : 'Monthly'}`,
      callbackUrl: `${origin}/dashboard`,
      returnUrl: `${origin}/dashboard`,
      cancellationUrl: `${origin}/#pricing`,
      merchantAccountNumber: merchantAccount,
      clientReference: `voxvpn-${plan.toLowerCase()}-${Date.now()}`,
      ...(user?.email ? { customerEmail: user.email } : {}),
    };

    const response = await fetch('https://payproxyapi.hubtel.com/items/initiate', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data?.data?.checkoutDirectUrl) {
      console.error('Hubtel error:', JSON.stringify(data));
      return Response.json({ error: data?.message || 'Hubtel checkout failed' }, { status: 400 });
    }

    return Response.json({
      url: data.data.checkoutDirectUrl,
      clientReference: payload.clientReference,
      amountGHS,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});