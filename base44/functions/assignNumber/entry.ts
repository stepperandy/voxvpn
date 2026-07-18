/**
 * NUMBER PROVISIONING — Step 3: Assign
 * 
 * Called by numberOrderWebhook after payment confirmed.
 * Provisions the number with Twilio and creates the VirtualNumber record
 * with customer_email set so inbound calls route to the user.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { order_id, stripe_subscription_id, stripe_customer_id } = await req.json();

    if (!order_id) {
      return Response.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // Fetch the NumberOrder
    const orders = await base44.asServiceRole.entities.NumberOrder.filter({ id: order_id });
    const order = orders?.[0];

    if (!order) {
      console.error(`[assignNumber] Order not found: ${order_id}`);
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if already assigned
    if (order.status === 'completed' || order.status === 'assigned') {
      console.log(`[assignNumber] Order ${order_id} already assigned, skipping`);
      return Response.json({ success: true, message: 'Already assigned' });
    }

    console.log(`[assignNumber] Processing order ${order_id} for ${order.user_email}, phone: ${order.phone_number}`);

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const appUrl = Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.voxdigits.com';

    if (!accountSid || !authToken) {
      throw new Error('Missing Twilio credentials');
    }

    const auth = btoa(`${accountSid}:${authToken}`);
    const smsWebhookUrl = `${appUrl}/functions/twilioSmsWebhook`;
    const voiceWebhookUrl = `${appUrl}/functions/voiceWebhook`;

    // Provision the number with Twilio
    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        PhoneNumber: order.phone_number,
        SmsUrl: smsWebhookUrl,
        SmsMethod: 'POST',
        VoiceUrl: voiceWebhookUrl,
        VoiceMethod: 'POST',
      }),
    });

    const twilioData = await twilioRes.json();
    console.log(`[assignNumber] Twilio response for ${order.phone_number}:`, JSON.stringify(twilioData));

    if (!twilioRes.ok) {
      console.error(`[assignNumber] Twilio provisioning failed:`, twilioData);
      throw new Error(`Twilio error: ${twilioData.message || 'Failed to provision'}`);
    }

    const twilio_number_sid = twilioData.sid || '';

    // Set renewal date (1 month from now)
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    const renewal_date = renewalDate.toISOString().split('T')[0];

    // Create VirtualNumber with customer_email — critical for call routing!
    const virtualNumber = await base44.asServiceRole.entities.VirtualNumber.create({
      phone_number: order.phone_number,
      country_code: order.country_code,
      city: order.city || '',
      number_type: order.number_type || 'local',
      customer_email: order.user_email,  // ← THIS IS KEY: routes calls to the owner
      stripe_customer_id: stripe_customer_id || '',
      stripe_subscription_id: stripe_subscription_id || '',
      twilio_number_sid,
      provider: order.provider || 'twilio',
      status: 'assigned',
      sms_enabled: true,
      voice_enabled: true,
      renewal_date,
      assigned_at: new Date().toISOString(),
    });

    // Update NumberOrder status
    await base44.asServiceRole.entities.NumberOrder.update(order_id, {
      status: 'completed',
      virtual_number_id: virtualNumber.id,
      stripe_subscription_id: stripe_subscription_id || '',
      stripe_customer_id: stripe_customer_id || '',
      provisioned_at: new Date().toISOString(),
    });

    // Create Subscription record for billing
    await base44.asServiceRole.entities.Subscription.create({
      user_email: order.user_email,
      service_type: 'virtual_number',
      service_id: virtualNumber.id,
      phone_number: order.phone_number,
      plan_name: `${order.country_code} Virtual Number`,
      amount: parseFloat(order.monthly_fee),
      billing_cycle: 'monthly',
      status: 'active',
      current_period_start: new Date().toISOString().split('T')[0],
      current_period_end: renewal_date,
      auto_renew: true,
      provider: order.provider || 'twilio',
      stripe_subscription_id: stripe_subscription_id || '',
    });

    console.log(`[assignNumber] ✅ Number ${order.phone_number} assigned to ${order.user_email}, SID: ${twilio_number_sid}`);

    return Response.json({ 
      success: true, 
      phone_number: order.phone_number,
      virtual_number_id: virtualNumber.id,
    });

  } catch (error) {
    console.error(`[assignNumber] ❌ Error:`, error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});