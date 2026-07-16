import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let from = "";
  let to = "";
  let callSid = "";
  let recordingUrl = "";
  let recordingDuration = "";
  let requestBody = "";

  try {
    requestBody = await req.text();
    console.log(`[voiceRecordingWebhookV2] RAW RECORDING CALLBACK: ${requestBody}`);

    const params = new URLSearchParams(requestBody);
    from = params.get("From") || "";
    to = params.get("To") || "";
    callSid = params.get("CallSid") || "";
    recordingUrl = params.get("RecordingUrl") || "";
    recordingDuration = params.get("RecordingDuration") || "0";

    console.log(`[voiceRecordingWebhookV2] Recording saved: CallSid=${callSid}, From=${from}, To=${to}, Duration=${recordingDuration}s`);

    // Find the number owner
    const numbers = await base44.asServiceRole.entities.VirtualNumber.filter({
      phone_number: to,
    });

    if (numbers && numbers.length > 0) {
      const userEmail = numbers[0].customer_email;

      // Create Voicemail record
      try {
        await base44.asServiceRole.entities.Voicemail.create({
          user_email: userEmail,
          our_number: to,
          caller_number: from,
          recording_url: recordingUrl,
          recording_id: callSid,
          duration_seconds: parseInt(recordingDuration) || 0,
          status: "unread",
          call_leg_id: callSid,
          transcript_status: "pending",
        });

        console.log(`[voiceRecordingWebhookV2] Voicemail recorded for ${userEmail}`);
      } catch (vmErr) {
        console.error(`[voiceRecordingWebhookV2] Failed to save voicemail: ${vmErr.message}`);
      }
    } else {
      console.warn(`[voiceRecordingWebhookV2] No user found for number ${to}`);
    }

    // Return valid TwiML acknowledgment
    const response = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you. Your message has been recorded.</Say>
  <Hangup/>
</Response>`;

    console.log(`[voiceRecordingWebhookV2] Returning acknowledgment TwiML`);

    return new Response(response, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=UTF-8",
      },
    });
  } catch (error) {
    console.error(`[voiceRecordingWebhookV2] CRITICAL ERROR: ${error.message}`);
    console.error(`[voiceRecordingWebhookV2] Stack: ${error.stack}`);

    // Return valid error TwiML
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you.</Say>
  <Hangup/>
</Response>`;

    return new Response(errorResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=UTF-8",
      },
    });
  }
});