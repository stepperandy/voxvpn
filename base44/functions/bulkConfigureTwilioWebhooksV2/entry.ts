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
    const incomingCallUrl   = `${baseUrl}/voice-webhook`;
    const smsWebhookUrl     = `${baseUrl}/smsIncomingWebhook`;
    const statusCallbackUrl = `${baseUrl}/callStatusWebhook`;

    console.log(`[bulkConfigureTwilioWebhooksV2] Voice: ${incomingCallUrl}`);
    console.log(`[bulkConfigureTwilioWebhooksV2] SMS:   ${smsWebhookUrl}`);

    // Fetch all virtual numbers from DB (paginate in batches of 200)
    let allNumbers = [];
    let skip = 0;
    const batchSize = 200;
    while (true) {
      const batch = await base44.asServiceRole.entities.VirtualNumber.list('-created_date', batchSize, skip);
      if (!batch || batch.length === 0) break;
      allNumbers = allNumbers.concat(batch);
      if (batch.length < batchSize) break;
      skip += batchSize;
    }

    console.log(`[bulkConfigureTwilioWebhooksV2] Found ${allNumbers.length} virtual numbers`);

    let success = 0;
    let failed = 0;
    let skipped = 0;
    const errors = [];

    for (const vn of allNumbers) {
      const sid = vn.twilio_number_sid;
      const phone = vn.phone_number;

      if (!sid) {
        skipped++;
        console.log(`[bulkConfigureTwilioWebhooksV2] SKIP (no SID): ${phone}`);
        continue;
      }

      try {
        await client.incomingPhoneNumbers(sid).update({
          voiceUrl: incomingCallUrl,
          voiceMethod: 'POST',
          smsUrl: smsWebhookUrl,
          smsMethod: 'POST',
          statusCallback: statusCallbackUrl,
          statusCallbackMethod: 'POST',
        });
        success++;
        console.log(`[bulkConfigureTwilioWebhooksV2] ✅ Configured: ${phone} (${sid})`);
      } catch (err) {
        failed++;
        const msg = `${phone} (${sid}): ${err.message}`;
        errors.push(msg);
        console.error(`[bulkConfigureTwilioWebhooksV2] ❌ Failed: ${msg}`);
      }
    }

    console.log(`[bulkConfigureTwilioWebhooksV2] DONE — success=${success}, failed=${failed}, skipped=${skipped}`);

    return Response.json({
      total: allNumbers.length,
      success,
      failed,
      skipped,
      errors: errors.slice(0, 50),
      incomingCallUrl,
      smsWebhookUrl,
    });
  } catch (error) {
    console.error('[bulkConfigureTwilioWebhooksV2] ❌ Exception:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});