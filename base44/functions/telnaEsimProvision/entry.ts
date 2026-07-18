import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TELNA_API_URL = 'https://ppo-api.telna.com/v1';
const TELNA_API_KEY = Deno.env.get('TELNA_API_KEY');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id, product_name, price } = await req.json();

    if (!product_id || !price) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call TELNA API to provision eSIM with voice, SMS, and roaming
    const telnaResponse = await fetch(`${TELNA_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id,
        quantity: 1,
        features: {
          data: true,
          voice: true,
          sms: true,
          roaming_enabled: true
        }
      })
    });

    if (!telnaResponse.ok) {
      const error = await telnaResponse.text();
      console.error('TELNA API error:', error);
      throw new Error(`TELNA provisioning failed: ${telnaResponse.status}`);
    }

    const telnaData = await telnaResponse.json();
    const { iccid, activation_code, lpa, sm_dp_plus_address } = telnaData;

    if (!iccid) {
      throw new Error('Invalid TELNA response: missing ICCID');
    }

    // TELNA provides LPA string for automatic OTA provisioning
    const provisioningString = lpa || activation_code;

    // Deduct credits from user wallet
    const updatedUser = await base44.auth.updateMe({
      credits: (user.credits || 0) - price
    });

    // Create eSIM record with voice, SMS, and roaming enabled
    const esim = await base44.entities.ESim.create({
      user_email: user.email,
      product_id,
      product_name,
      iccid,
      qr_code: provisioningString,
      status: 'active',
      price_paid: price,
      auto_provisioning: true,
      voice_enabled: true,
      sms_enabled: true,
      roaming_enabled: true
    });

    console.log(`eSIM auto-provisioned: ${iccid} for user ${user.email}`);

    return Response.json({
      success: true,
      esim: {
        id: esim.id,
        iccid,
        lpa: provisioningString,
        product_name,
        auto_provisioned: true,
        capabilities: {
          data: true,
          voice: true,
          sms: true,
          roaming: true
        }
      },
      new_balance: updatedUser.credits,
      note: 'eSIM activated with data, voice, SMS, and global roaming'
    });
  } catch (error) {
    console.error('eSIM provisioning error:', error);
    return Response.json(
      { error: error.message || 'Failed to provision eSIM' },
      { status: 500 }
    );
  }
});