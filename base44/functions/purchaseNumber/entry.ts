import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { phone_number } = await req.json();

    if (!phone_number) {
      return Response.json({ success: false, message: 'phone_number is required' }, { status: 400 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const auth = btoa(`${accountSid}:${authToken}`);

    const appUrl = Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.voxdigits.com';
    const smsWebhookUrl = `${appUrl}/functions/twilioSmsWebhook`;
    const voiceWebhookUrl = `${appUrl}/functions/voiceWebhook`;

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        PhoneNumber: phone_number,
        SmsUrl: smsWebhookUrl,
        SmsMethod: 'POST',
        VoiceUrl: voiceWebhookUrl,
        VoiceMethod: 'POST',
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('Twilio purchase error:', JSON.stringify(error));
      return Response.json({ success: false, message: 'Failed to purchase number', error }, { status: res.status });
    }

    const data = await res.json();
    console.log(`[purchaseNumber] Purchased ${phone_number} via Twilio, SID: ${data.sid}, webhooks configured`);
    return Response.json({ success: true, message: 'Number purchased successfully', data });

  } catch (error) {
    console.error('Purchase number error:', error.message);
    return Response.json({ success: false, message: 'Failed to purchase number', error: error.message }, { status: 500 });
  }
});