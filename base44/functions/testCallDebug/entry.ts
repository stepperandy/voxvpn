import twilio from 'npm:twilio@4.23.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");

    // Get URL parameters
    const url = new URL(req.url);
    const toNumber = url.searchParams.get("to") || "+16623984332";
    
    // Fetch a virtual number from database
    const numbers = await base44.asServiceRole.entities.VirtualNumber.list();
    const fromNumber = numbers?.[0]?.phone_number;

    if (!fromNumber) {
      throw new Error("No virtual numbers found in database");
    }

    console.log(`[testCallDebug] Creating Twilio client with SID: ${accountSid}`);
    const client = twilio(accountSid, authToken);

    console.log(`[testCallDebug] Initiating call: FROM ${fromNumber} TO ${toNumber}`);

    const call = await client.calls.create({
      from: fromNumber,
      to: toNumber,
      url: `${Deno.env.get("BASE44_PUBLIC_URL")}/functions/voiceWebhookProductionV2`,
    });

    console.log(`[testCallDebug] ✅ CALL CREATED`);
    console.log(`[testCallDebug] Call SID: ${call.sid}`);
    console.log(`[testCallDebug] Status: ${call.status}`);
    console.log(`[testCallDebug] From: ${call.from}`);
    console.log(`[testCallDebug] To: ${call.to}`);
    console.log(`[testCallDebug] Date Created: ${call.dateCreated}`);

    return Response.json({
      success: true,
      callSid: call.sid,
      status: call.status,
      from: call.from,
      to: call.to,
      created: call.dateCreated,
      message: "Call initiated. Check Twilio console for webhook requests.",
    });
  } catch (error) {
    console.error(`[testCallDebug] ❌ ERROR: ${error.message}`);
    console.error(error);
    return Response.json({
      success: false,
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
});