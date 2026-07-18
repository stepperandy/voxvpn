// Handles inbound SMS from Twilio
// Twilio POSTs form-encoded data: From, To, Body, MessageSid, etc.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);

    const from_number = params.get('From') || '';
    const to_number = params.get('To') || '';
    const body = params.get('Body') || '';
    const messageSid = params.get('MessageSid') || '';

    if (!from_number || !to_number) {
      console.warn('[twilioSmsWebhook] Missing From or To');
      return new Response('', { status: 200 });
    }

    console.log(`[twilioSmsWebhook] Inbound SMS from ${from_number} to ${to_number}: "${body}"`);

    // Find the VirtualNumber owner
    let numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: to_number });
    if (!numbers || numbers.length === 0) {
      numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: to_number });
    }
    const virtualNumber = numbers?.[0];
    const ownerEmail = virtualNumber?.customer_email || '';

    if (!ownerEmail) {
      console.warn(`[twilioSmsWebhook] No owner found for ${to_number}`);
    }

    // Dedup check
    const existing = await base44.asServiceRole.entities.Message.filter({ provider_message_id: messageSid });
    if (existing && existing.length > 0) {
      console.log(`[twilioSmsWebhook] Duplicate SID ${messageSid}, skipping`);
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Save the message
    await base44.asServiceRole.entities.Message.create({
      user_email: ownerEmail,
      from_number,
      to_number,
      our_number: to_number,
      body,
      direction: 'inbound',
      status: 'received',
      provider_message_id: messageSid,
    });
    console.log(`[twilioSmsWebhook] ✅ Saved inbound SMS for ${ownerEmail || 'unknown owner'}`);

    // Return TwiML response — include auto-reply inline if one was found
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
    if (ownerEmail) {
      const autoReplies = await base44.asServiceRole.entities.AutoReplyTemplate.filter({
        virtual_number: to_number,
        user_email: ownerEmail,
        enabled: true,
      });
      if (autoReplies.length > 0) {
        const replyText = autoReplies[0].message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        twiml += `<Message>${replyText}</Message>`;
        console.log(`[twilioSmsWebhook] Auto-reply inline from ${to_number} to ${from_number}`);
      }
    }
    twiml += '</Response>';

    return new Response(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error('[twilioSmsWebhook] Error:', error.message);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
});