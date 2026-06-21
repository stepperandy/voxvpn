import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_PRICES = {
  'Basic':      { monthly: 3.99,  sixmonths: 13.99, yearly: 29.88 },
  'Standard':   { monthly: 6.99,  sixmonths: 13.99, yearly: 53.88 },
  'Premium':    { monthly: 9.99,  sixmonths: 13.99, yearly: 77.88 },
  'Advanced':   { monthly: 14.99, sixmonths: 13.99, yearly: 24.99 },
  'Enterprise': { monthly: 29.99, sixmonths: 13.99, yearly: 45.99 },
};

// GHS conversion rate (approximate)
const USD_TO_GHS = 15.5;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { plan, isBilledYearly, isSixMonths } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return Response.json({ error: 'Invalid plan name' }, { status: 400 });
    }

    let user = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try { user = await base44.auth.me(); } catch (_) {}
    }

    const planPrice = PLAN_PRICES[plan];
    const amountUSD = isBilledYearly ? planPrice.yearly : isSixMonths ? planPrice.sixmonths : planPrice.monthly;
    const amountGHS = parseFloat((amountUSD * USD_TO_GHS).toFixed(2));

    const clientId = Deno.env.get('HUBTEL_CLIENT_ID');
    const clientSecret = Deno.env.get('HUBTEL_CLIENT_SECRET');
    const merchantAccount = Deno.env.get('HUBTEL_MERCHANT_ACCOUNT');
    const origin = req.headers.get('origin') || Deno.env.get('APP_URL') || 'https://voxvpn.net';

    const credentials = btoa(`${clientId}:${clientSecret}`);

    const billingCycle = isBilledYearly ? 'yearly' : isSixMonths ? 'sixmonths' : 'monthly';
    const clientRef = `voxvpn-${plan.toLowerCase()}-${billingCycle}-${Date.now()}`;

    const payload = {
      totalAmount: amountGHS,
      description: `VoxVPN ${plan} Plan — ${isBilledYearly ? 'Yearly' : isSixMonths ? '6 Months' : 'Monthly'}`,
      callbackUrl: `${origin}/dashboard?payment=success&plan=${encodeURIComponent(plan)}`,
      returnUrl: `${origin}/dashboard?payment=success&plan=${encodeURIComponent(plan)}`,
      cancellationUrl: `${origin}/payment-failed`,
      merchantAccountNumber: merchantAccount,
      clientReference: clientRef,
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
      clientReference: clientRef,
      amountGHS,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});