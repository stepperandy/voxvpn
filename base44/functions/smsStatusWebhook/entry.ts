import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let messageSid = "";
  let messageStatus = "";
  let errorCode = "";

  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    messageSid = params.get("MessageSid") || "";
    messageStatus = params.get("MessageStatus") || "";
    errorCode = params.get("ErrorCode") || "";
  } catch (_) {}

  console.log(`[smsStatusWebhook] SMS status: ${messageSid} = ${messageStatus}${errorCode ? ` (error: ${errorCode})` : ""}`);

  try {
    // Find message by Twilio SID and update status
    const messages = await base44.asServiceRole.entities.Message.filter({
      telnyx_message_id: messageSid,
    });

    if (messages && messages.length > 0) {
      let finalStatus = "failed";
      if (messageStatus === "delivered") finalStatus = "delivered";
      else if (messageStatus === "sent") finalStatus = "sent";
      else if (messageStatus === "queued" || messageStatus === "sending") finalStatus = "pending";

      await base44.asServiceRole.entities.Message.update(messages[0].id, {
        status: finalStatus,
        delivered_at: messageStatus === "delivered" ? new Date().toISOString() : null,
      });

      console.log(`[smsStatusWebhook] Updated message status: ${finalStatus}`);
    } else {
      console.warn(`[smsStatusWebhook] Message not found: ${messageSid}`);
    }
  } catch (err) {
    console.error("[smsStatusWebhook] Error updating SMS status:", err.message);
  }

  // Return Twilio acknowledgment
  const response = `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;

  return new Response(response, {
    headers: {
      "Content-Type": "text/xml; charset=UTF-8",
    },
  });
});