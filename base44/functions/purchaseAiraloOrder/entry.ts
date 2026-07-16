import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { package_id, price } = await req.json();

    if (!package_id || !price) {
      return Response.json({ error: 'Missing package_id or price' }, { status: 400 });
    }

    // Check wallet balance
    const currentUser = await base44.entities.User.filter({ email: user.email });
    const userData = currentUser[0];
    const walletBalance = userData?.credits || 0;

    if (walletBalance < price) {
      return Response.json({ error: 'Insufficient wallet balance' }, { status: 402 });
    }

    const apiKey = Deno.env.get('AIRALO_API_KEY');
    console.log(`[purchaseAiraloOrder] Purchasing Airalo package: ${package_id}`);

    const airaloResponse = await fetch('https://api.airalo.com/v2/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ package_id, quantity: 1 })
    });

    if (!airaloResponse.ok) {
      const errText = await airaloResponse.text();
      console.error('[purchaseAiraloOrder] Airalo error:', errText);
      return Response.json({ error: 'Failed to purchase eSIM', details: errText }, { status: 502 });
    }

    const orderData = await airaloResponse.json();
    console.log('[purchaseAiraloOrder] Airalo response:', JSON.stringify(orderData));

    // Deduct from wallet
    await base44.auth.updateMe({ credits: walletBalance - price });

    // Save eSIM record
    const esim = await base44.entities.ESim.create({
      user_email: user.email,
      product_id: package_id,
      product_name: `Airalo Package ${package_id}`,
      iccid: orderData.data?.order?.iccid || '',
      qr_code: orderData.data?.order?.qr_code || '',
      status: orderData.data?.order?.status || 'pending',
      price_paid: price
    });

    return Response.json({ success: true, order_id: orderData.data?.order?.id, esim });
  } catch (error) {
    console.error('[purchaseAiraloOrder] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});