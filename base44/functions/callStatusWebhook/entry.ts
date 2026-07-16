Deno.serve(async (req) => {
  let callSid = "";
  let callStatus = "";
  let from = "";
  let to = "";
  let duration = "";

  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    callSid = params.get("CallSid") || "";
    callStatus = params.get("CallStatus") || "";
    from = params.get("From") || "";
    to = params.get("To") || "";
    duration = params.get("Duration") || "0";
  } catch (_) {}

  console.log(`[callStatusWebhook] Call status: ${callSid} = ${callStatus}, duration: ${duration}s`);

  // Log call details to console for now (CallLog entity has RLS issues)
  console.log(`[callStatusWebhook] Call: ${callSid} from ${from} to ${to} = ${callStatus} (${duration}s)`);

  // Return Twilio acknowledgment
  const response = `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;

  return new Response(response, {
    headers: {
      "Content-Type": "text/xml; charset=UTF-8",
    },
  });
});