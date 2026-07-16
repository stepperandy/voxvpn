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

    if (!accountSid || !authToken) {
      return Response.json({ error: 'Twilio credentials missing' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);
    const baseUrl = `https://app--${appId}.base44.app/api/apps/${appId}/functions`;
    const voiceUrl = `${baseUrl}/voice-webhook`;
    const smsUrl = `${baseUrl}/smsIncomingWebhook`;
    const statusUrl = `${baseUrl}/callStatusWebhook`;

    // Fetch ALL virtual numbers from DB
    const allNums = await base44.asServiceRole.entities.VirtualNumber.list('-created_date', 200);
    console.log('[fixInboundWebhook] Total VirtualNumbers in DB:', allNums.length);

    // Also fetch ALL actual Twilio numbers to find valid SIDs
    const twilioNumbers = await client.incomingPhoneNumbers.list({ limit: 100 });
    console.log('[fixInboundWebhook] Total Twilio numbers:', twilioNumbers.length);

    const results = [];

    for (const tn of twilioNumbers) {
      console.log(`[fixInboundWebhook] Twilio number: ${tn.phoneNumber} SID=${tn.sid} voiceUrl=${tn.voiceUrl}`);

      try {
        await client.incomingPhoneNumbers(tn.sid).update({
          voiceUrl,
          voiceMethod: 'POST',
          smsUrl,
          smsMethod: 'POST',
          statusCallback: statusUrl,
          statusCallbackMethod: 'POST',
        });

        // Update the DB record to have the correct SID
        const matchingVN = allNums.find(n => {
          const nd = (n.phone_number || n.number || '').replace(/\D/g, '');
          const td = tn.phoneNumber.replace(/\D/g, '');
          return nd === td;
        });

        if (matchingVN) {
          await base44.asServiceRole.entities.VirtualNumber.update(matchingVN.id, {
            twilio_number_sid: tn.sid,
            phone_number: tn.phoneNumber,
            number: tn.phoneNumber,
          });
          console.log(`[fixInboundWebhook] ✅ Updated DB + webhook for ${tn.phoneNumber}`);
          results.push({ number: tn.phoneNumber, sid: tn.sid, status: 'configured', db_updated: true });
        } else {
          console.log(`[fixInboundWebhook] ✅ Webhook set for ${tn.phoneNumber} (no matching DB record found)`);
          results.push({ number: tn.phoneNumber, sid: tn.sid, status: 'webhook_only', db_updated: false });
        }
      } catch (e) {
        console.error(`[fixInboundWebhook] ❌ Failed ${tn.phoneNumber}:`, e.message);
        results.push({ number: tn.phoneNumber, sid: tn.sid, status: 'failed', error: e.message });
      }
    }

    return Response.json({ success: true, voiceUrl, results });
  } catch (error) {
    console.error('[fixInboundWebhook] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});