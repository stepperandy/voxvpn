import twilio from 'npm:twilio@4.23.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const appId = Deno.env.get('BASE44_APP_ID') || '';

    const client = twilio(accountSid, authToken);

    // List all Twilio numbers
    const twilioNumbers = await client.incomingPhoneNumbers.list({ limit: 100 });
    console.log('[updateNumberSid] Twilio numbers:', twilioNumbers.map(n => `${n.phoneNumber} → ${n.sid}`));

    const baseUrl = `https://app--${appId}.base44.app/api/apps/${appId}/functions`;
    const voiceUrl = `${baseUrl}/voice-webhook`;
    const smsUrl = `${baseUrl}/smsIncomingWebhook`;
    const statusUrl = `${baseUrl}/callStatusWebhook`;

    const results = [];

    for (const tn of twilioNumbers) {
      // Find matching DB record
      let records = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: tn.phoneNumber });
      if (!records || records.length === 0) {
        records = await base44.asServiceRole.entities.VirtualNumber.filter({ number: tn.phoneNumber });
      }

      if (records && records.length > 0) {
        const rec = records[0];
        // Update SID in DB
        await base44.asServiceRole.entities.VirtualNumber.update(rec.id, {
          twilio_number_sid: tn.sid,
        });

        // Configure webhooks on Twilio
        await client.incomingPhoneNumbers(tn.sid).update({
          voiceUrl,
          voiceMethod: 'POST',
          smsUrl,
          smsMethod: 'POST',
          statusCallback: statusUrl,
          statusCallbackMethod: 'POST',
        });

        results.push({ phone: tn.phoneNumber, sid: tn.sid, status: 'updated' });
        console.log(`[updateNumberSid] ✅ Updated ${tn.phoneNumber} → ${tn.sid}`);
      } else {
        results.push({ phone: tn.phoneNumber, sid: tn.sid, status: 'no_db_record' });
        console.log(`[updateNumberSid] ⚠️ No DB record for ${tn.phoneNumber}`);
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error('[updateNumberSid] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});