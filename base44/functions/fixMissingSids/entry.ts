import twilio from 'npm:twilio@4.23.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const baseUrl = Deno.env.get('BASE44_PUBLIC_URL') || 'https://economic-global-voice-flow.base44.app';

    if (!accountSid || !authToken) {
      return Response.json({ error: 'Twilio credentials missing' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);
    const incomingCallUrl = `${baseUrl}/functions/incomingCall`;
    const statusCallbackUrl = `${baseUrl}/functions/callStatusWebhook`;

    // Fetch all virtual numbers missing a twilio_number_sid
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

    const missingNumbers = allNumbers.filter(n => !n.twilio_number_sid && n.phone_number);
    console.log(`[fixMissingSids] Found ${missingNumbers.length} numbers missing SID`);

    // Fetch ALL Twilio numbers once and build a lookup map
    const twilioNumbers = await client.incomingPhoneNumbers.list({ limit: 1000 });
    const twilioMap = {};
    for (const tn of twilioNumbers) {
      // Normalize: store by E.164 and also digits-only
      twilioMap[tn.phoneNumber] = tn;
      twilioMap[tn.phoneNumber.replace(/\D/g, '')] = tn;
    }

    console.log(`[fixMissingSids] Twilio account has ${twilioNumbers.length} numbers`);

    let fixed = 0;
    let notFound = 0;
    let failed = 0;
    const errors = [];

    for (const vn of missingNumbers) {
      const phone = vn.phone_number;
      // Try E.164 match first, then digits-only
      const twilioNum = twilioMap[phone] || twilioMap[phone.replace(/\D/g, '')];

      if (!twilioNum) {
        notFound++;
        console.log(`[fixMissingSids] NOT FOUND in Twilio: ${phone}`);
        errors.push(`Not in Twilio: ${phone}`);
        continue;
      }

      try {
        // Update webhook on Twilio
        await client.incomingPhoneNumbers(twilioNum.sid).update({
          voiceUrl: incomingCallUrl,
          voiceMethod: 'POST',
          statusCallback: statusCallbackUrl,
          statusCallbackMethod: 'POST',
        });

        // Save SID back to DB — include all required fields to pass validation
        await base44.asServiceRole.entities.VirtualNumber.update(vn.id, {
          number: vn.number || vn.phone_number,
          userId: vn.userId || vn.customer_email || 'system',
          twilio_number_sid: twilioNum.sid,
        });

        fixed++;
        console.log(`[fixMissingSids] ✅ Fixed: ${phone} → ${twilioNum.sid}`);
      } catch (err) {
        failed++;
        const msg = `${phone}: ${err.message}`;
        errors.push(msg);
        console.error(`[fixMissingSids] ❌ Failed: ${msg}`);
      }
    }

    console.log(`[fixMissingSids] DONE — fixed=${fixed}, notFound=${notFound}, failed=${failed}`);

    return Response.json({
      total_missing: missingNumbers.length,
      fixed,
      not_found_in_twilio: notFound,
      failed,
      errors: errors.slice(0, 50),
      incomingCallUrl,
    });
  } catch (error) {
    console.error('[fixMissingSids] ❌ Exception:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});