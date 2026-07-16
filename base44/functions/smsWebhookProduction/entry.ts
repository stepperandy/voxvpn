import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function getSmsRouting(toNumber, base44) {
  try {
    // Try new schema first (phone_number + customer_email)
    let numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNumber });
    if (numbers && numbers.length > 0 && numbers[0].customer_email) {
      console.log(`[smsWebhookProduction] Found by phone_number: ${toNumber}, owner: ${numbers[0].customer_email}`);
      return { userEmail: numbers[0].customer_email };
    }

    // Fallback: legacy schema (number + userId)
    numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNumber });
    if (numbers && numbers.length > 0) {
      console.log(`[smsWebhookProduction] Found by number (legacy): ${toNumber}, userId: ${numbers[0].userId}`);
      return { userId: numbers[0].userId };
    }

    console.warn(`[smsWebhookProduction] No VirtualNumber found for ${toNumber}`);
    return null;
  } catch (err) {
    console.error("[smsWebhookProduction] SMS routing lookup error:", err.message);
    return null;
  }
}

async function logSmsEvent(fromNumber, toNumber, body, status, routing, base44) {
  try {
    let userEmail = routing?.userEmail || null;

    // If we only have userId (legacy), look up email
    if (!userEmail && routing?.userId) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: routing.userId });
        userEmail = users?.[0]?.email;
        console.log(`[smsWebhookProduction] Resolved email: ${userEmail} from userId: ${routing.userId}`);
      } catch (e) {
        console.warn("[smsWebhookProduction] Could not fetch user email:", e.message);
      }
    }

    if (!userEmail) {
      console.error(`[smsWebhookProduction] ❌ No user email found for number ${toNumber} — cannot log message`);
      return;
    }

    await base44.asServiceRole.entities.Message.create({
      user_email: userEmail,
      from_number: fromNumber,
      to_number: toNumber,
      our_number: toNumber,
      body: body,
      direction: "inbound",
      status: "delivered",
    });
    console.log(`[smsWebhookProduction] ✅ SMS logged: ${fromNumber} → ${toNumber} for ${userEmail}`);
  } catch (err) {
    console.error("[smsWebhookProduction] SMS logging error:", err.message);
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let to = "";
  let from = "";
  let body = "";

  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    to = params.get("To") || "";
    from = params.get("From") || "";
    body = params.get("Body") || "";
  } catch (_) {}

  console.log(`[smsWebhookProduction] Inbound SMS: ${from} → ${to}`);

  const routing = await getSmsRouting(to, base44);

  // Log incoming SMS
  await logSmsEvent(from, to, body, "delivered", routing, base44);

  if (routing) {
    console.log(`[smsWebhookProduction] Routing SMS to user: ${routing.userId}`);
  }

  // Return Twilio acknowledgment
  const response = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>`;

  return new Response(response, {
    headers: {
      "Content-Type": "text/xml; charset=UTF-8",
    },
  });
});