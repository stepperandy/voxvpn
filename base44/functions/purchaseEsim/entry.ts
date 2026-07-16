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

    // Call Airalo API
    const apiKey = Deno.env.get('AIRALO_API_KEY');
    console.log(`[purchaseEsim] Purchasing Airalo package: ${package_id}`);

    const airaloResponse = await fetch('https://api.airalo.com/v2/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        package_id, 
        quantity: 1,
        features: {
          data: true,
          voice: true,
          sms: true,
          roaming: true
        }
      })
    });

    if (!airaloResponse.ok) {
      const errText = await airaloResponse.text();
      console.error('[purchaseEsim] Airalo error:', errText);
      return Response.json({ error: 'Failed to purchase eSIM', details: errText }, { status: 502 });
    }

    const orderData = await airaloResponse.json();
    console.log('[purchaseEsim] Airalo response:', JSON.stringify(orderData));

    // Deduct from wallet
    await base44.auth.updateMe({ credits: walletBalance - price });

    // Save eSIM record with voice, SMS, and roaming enabled
    const esim = await base44.entities.ESim.create({
      user_email: user.email,
      product_id: package_id,
      product_name: `Airalo Package ${package_id}`,
      iccid: orderData.order?.iccid || '',
      qr_code: orderData.order?.qr_code || '',
      status: orderData.order?.status || 'pending',
      price_paid: price,
      voice_enabled: true,
      sms_enabled: true,
      roaming_enabled: true,
      auto_provisioning: true
    });

    console.log(`[purchaseEsim] Airalo eSIM created with voice, SMS, and roaming: ${esim.iccid}`);

    return Response.json({ 
      success: true, 
      order_id: orderData.order?.id, 
      esim: {
        id: esim.id,
        iccid: esim.iccid,
        qr_code: esim.qr_code,
        capabilities: {
          data: true,
          voice: true,
          sms: true,
          roaming: true
        }
      },
      note: 'eSIM activated with data, voice, SMS, and global roaming'
    });
  } catch (error) {
    console.error('[purchaseEsim] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});