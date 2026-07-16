import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import twilio from 'npm:twilio@4.23.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (event.type !== 'create' || event.entity_name !== 'VirtualNumber') {
      return Response.json({ success: false, reason: 'Not a VirtualNumber create event' });
    }

    const virtualNumber = data;
    const customerEmail = virtualNumber.customer_email;
    const phoneNumber = virtualNumber.phone_number;
    const sid = virtualNumber.twilio_number_sid;

    console.log(`[onVirtualNumberProvisioned] 📞 Processing ${phoneNumber} for ${customerEmail}`);

    if (!customerEmail || !phoneNumber) {
      console.log('[onVirtualNumberProvisioned] Skipping: missing customer_email or phone_number');
      return Response.json({ success: false, reason: 'Missing customer_email or phone_number' });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const appUrl = Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.voxdigits.com';
    const appId = Deno.env.get('BASE44_APP_ID') || '';

    // Determine the correct voice webhook URL
    const voiceWebhookUrl = appUrl.includes('base44.app')
      ? `https://app--${appId}.base44.app/api/apps/${appId}/functions/voiceWebhook`
      : `${appUrl}/functions/voiceWebhook`;

    const smsWebhookUrl = appUrl.includes('base44.app')
      ? `https://app--${appId}.base44.app/api/apps/${appId}/functions/twilioSmsWebhook`
      : `${appUrl}/functions/twilioSmsWebhook`;

    // Configure Twilio webhook on the phone number
    if (sid) {
      try {
        const twilioClient = twilio(accountSid, authToken);
        await twilioClient.incomingPhoneNumbers(sid).update({
          voiceUrl: voiceWebhookUrl,
          voiceMethod: 'POST',
          smsUrl: smsWebhookUrl,
          smsMethod: 'POST',
        });
        console.log(`[onVirtualNumberProvisioned] ✅ Twilio webhook configured for ${phoneNumber} → ${voiceWebhookUrl}`);
      } catch (webhookErr) {
        console.error(`[onVirtualNumberProvisioned] ❌ Twilio webhook config failed: ${webhookErr.message}`);
      }
    } else {
      // No SID yet — the number was already provisioned in assignNumber with correct webhook.
      // Nothing extra needed; assignNumber sets voiceWebhookUrl directly.
      console.log(`[onVirtualNumberProvisioned] ℹ️ No twilio_number_sid — webhook was set during provisioning`);
    }

    console.log(`[onVirtualNumberProvisioned] ✅ Done for ${phoneNumber} (${customerEmail})`);
    return Response.json({ success: true, phone_number: phoneNumber, customer_email: customerEmail });

  } catch (error) {
    console.error('[onVirtualNumberProvisioned] ❌ Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});