import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const formData = await req.formData();

    const from        = formData.get('From') || '';
    const to          = formData.get('To') || '';
    const messageBody = formData.get('Body') || '';
    const messageSid  = formData.get('MessageSid') || formData.get('SmsSid') || '';
    const messageStatus = formData.get('MessageStatus') || formData.get('SmsStatus') || '';

    console.log(`[smsIncomingWebhook] From=${from} To=${to} Status=${messageStatus} Body=${messageBody?.substring(0, 50)}`);

    const twimlOk = new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
      headers: { 'Content-Type': 'application/xml' }
    });

    // ── STATUS CALLBACKS: Twilio posts delivery status updates — ignore them ──
    if (messageStatus && !messageBody) {
      console.log('[smsIncomingWebhook] Status callback received, ignoring:', messageStatus);
      return twimlOk;
    }

    if (!from || !to || !messageBody || !messageSid) {
      console.warn('[smsIncomingWebhook] Missing required fields, ignoring');
      return twimlOk;
    }

    // Find the virtual number owner — check both schemas + digits-only fallback
    let toNorm = to.trim();
    if (!toNorm.startsWith('+')) toNorm = '+' + toNorm.replace(/\D/g, '');

    let numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNorm });
    if (!numbers || numbers.length === 0) {
      numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNorm });
    }
    if (!numbers || numbers.length === 0) {
      const toNoPlus = toNorm.replace(/^\+/, '');
      numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: toNoPlus });
    }
    if (!numbers || numbers.length === 0) {
      const toNoPlus = toNorm.replace(/^\+/, '');
      numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ number: toNoPlus });
    }
    // Last resort: scan all and match by digits
    if (!numbers || numbers.length === 0) {
      const toDigits = toNorm.replace(/\D/g, '');
      console.log('[smsIncomingWebhook] Falling back to full scan for digits:', toDigits);
      const allNums = await base44.asServiceRole.entities.VirtualNumber.list('-created_date', 200);
      numbers = (allNums || []).filter(n => {
        const nd = (n.phone_number || n.number || '').replace(/\D/g, '');
        return nd === toDigits || nd.endsWith(toDigits) || toDigits.endsWith(nd);
      });
    }
    if (!numbers || numbers.length === 0) {
      console.warn(`[smsIncomingWebhook] No owner for virtual number ${to}`);
      return twimlOk;
    }

    const virtualNumber = numbers[0];
    let ownerEmail = virtualNumber.customer_email || null;

    if (!ownerEmail && virtualNumber.userId) {
      const users = await base44.asServiceRole.entities.User.filter({ id: virtualNumber.userId });
      if (users && users.length > 0) ownerEmail = users[0].email;
    }

    if (ownerEmail) {
      // Check if message already logged (dedup)
      const existing = await base44.asServiceRole.entities.Message.filter({ provider_message_id: messageSid });
      if (!existing || existing.length === 0) {
        await base44.asServiceRole.entities.Message.create({
          user_email: ownerEmail,
          our_number: to,
          from_number: from,
          to_number: to,
          body: messageBody,
          direction: 'inbound',
          status: 'received',
          provider_message_id: messageSid,
        });
        console.log(`[smsIncomingWebhook] ✅ Saved inbound SMS for ${ownerEmail}`);
      } else {
        console.log(`[smsIncomingWebhook] Duplicate SID ${messageSid}, skipping`);
      }

      // Check for auto-reply
      try {
        const autoReplies = await base44.asServiceRole.entities.AutoReplyTemplate.filter({
          virtual_number: to,
          user_email: ownerEmail,
          enabled: true,
        });
        if (autoReplies && autoReplies.length > 0) {
          const replyMsg = autoReplies[0].message;
          const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
          const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
          if (twilioSid && twilioToken) {
            const auth = btoa(`${twilioSid}:${twilioToken}`);
            await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
              method: 'POST',
              headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ From: to, To: from, Body: replyMsg }),
            });
            console.log(`[smsIncomingWebhook] Auto-replied to ${from}`);
          }
        }
      } catch (e) {
        console.warn('[smsIncomingWebhook] Auto-reply error:', e.message);
      }
    }

    return twimlOk;

  } catch (error) {
    console.error('[smsIncomingWebhook] Error:', error.message);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
});