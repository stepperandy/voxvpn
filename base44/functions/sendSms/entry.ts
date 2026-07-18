import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function sendViaTwilio(accountSid, authToken, fromNumber, toNumber, body) {
  const auth = btoa(`${accountSid}:${authToken}`);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Body: body,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('[sendSms] Twilio error:', JSON.stringify(data));
    throw new Error(data.message || 'Failed to send SMS via Twilio');
  }

  return { success: true, provider: 'twilio', messageSid: data.sid };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { from, to, message } = await req.json();

    if (!from || !to || !message) {
      return Response.json(
        { success: false, error: 'Missing required fields: from, to, message' },
        { status: 400 }
      );
    }

    console.log(`[sendSms] Sending SMS from ${from} to ${to}`);

    // Verify the from_number belongs to this user (check both field schemas)
    let numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: from, userId: user.id });
    if (!numbers || numbers.length === 0) {
      numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: from, customer_email: user.email });
    }
    if (!numbers || numbers.length === 0) {
      numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: from, customer_email: user.email });
    }

    if (!numbers || numbers.length === 0) {
      console.error(`[sendSms] Number ${from} not found for user ${user.email} (id: ${user.id})`);
      return Response.json(
        { success: false, error: 'You do not own this virtual number' },
        { status: 403 }
      );
    }

    // Check wallet balance and get SMS rate
    const vnCountryCode = numbers[0].country_code || 'US';
    const userBalance = user.credits || 0;
    let smsRate = 0.03;
    try {
      const rateRes = await base44.asServiceRole.functions.invoke('billingEngine', {
        action: 'get_rate',
        user_email: user.email,
        category: 'sms',
        call_type: 'outbound',
        country_code: vnCountryCode,
      });
      smsRate = rateRes?.sell_price || 0.03;
    } catch (e) {
      console.warn('[sendSms] Rate lookup failed, using default:', e.message);
    }

    if (userBalance < smsRate) {
      console.warn(`[sendSms] Insufficient balance for ${user.email}: has $${userBalance}, needs $${smsRate}`);
      return Response.json(
        { success: false, error: 'Insufficient balance. Please add calling & SMS credit to send messages.', balance: userBalance, required: smsRate },
        { status: 402 }
      );
    }

    // Get Twilio credentials
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioSid || !twilioToken) {
      console.error('[sendSms] Twilio credentials not configured');
      return Response.json(
        { success: false, error: 'SMS service not configured' },
        { status: 500 }
      );
    }

    // Send via Twilio
    const result = await sendViaTwilio(twilioSid, twilioToken, from, to, message);

    // Log to Message entity
    try {
      const msgData = {
        user_email: user.email,
        our_number: from,
        from_number: from,
        to_number: to,
        body: message,
        direction: 'outbound',
        status: 'sent',
        provider_message_id: result.messageSid,
      };
      console.log('[sendSms] Saving message:', JSON.stringify(msgData));
      await base44.asServiceRole.entities.Message.create(msgData);
      console.log('[sendSms] ✅ Message saved');
    } catch (logErr) {
      console.error('[sendSms] ❌ Failed to log message:', logErr);
    }

    // Charge user for SMS
    try {
      await base44.asServiceRole.functions.invoke('billingEngine', {
        action: 'charge',
        user_email: user.email,
        amount: smsRate,
        category: 'sms',
        description: `SMS from ${from} to ${to}`,
        reference_id: result.messageSid,
      });
      console.log(`[sendSms] Charged $${smsRate} for SMS to ${user.email}`);
    } catch (chargeErr) {
      console.error('[sendSms] Charge failed:', chargeErr.message);
    }

    console.log(`[sendSms] SMS sent successfully, SID: ${result.messageSid}`);
    return Response.json({
      success: true,
      message_sid: result.messageSid,
    });
  } catch (error) {
    console.error('[sendSms] Error:', error.message);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});