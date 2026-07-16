import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { virtual_number_id, to_whatsapp, message_body } = await req.json();

    if (!virtual_number_id || !to_whatsapp || !message_body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[sendWhatsApp] Sending message to ${to_whatsapp}`);

    // Verify user owns this virtual number
    const numbers = await base44.entities.VirtualNumber.filter({
      id: virtual_number_id,
      customer_email: user.email
    });

    if (!numbers || numbers.length === 0) {
      return Response.json({ error: 'Virtual number not found or not owned by user' }, { status: 403 });
    }

    const virtualNumber = numbers[0];

    // TODO: Integrate with WhatsApp Cloud API (Meta)
    // This is a placeholder for WhatsApp Business API integration
    // You would use: https://developers.facebook.com/docs/whatsapp/cloud-api/

    const whatsappApiToken = Deno.env.get('WHATSAPP_API_TOKEN');
    const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!whatsappApiToken || !whatsappPhoneNumberId) {
      console.warn('[sendWhatsApp] WhatsApp API credentials not configured');
      return Response.json({ error: 'WhatsApp not configured' }, { status: 503 });
    }

    // Send via WhatsApp Cloud API
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${whatsappPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to_whatsapp,
          type: 'text',
          text: { body: message_body }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('[sendWhatsApp] WhatsApp API error:', result);
      return Response.json({ error: 'Failed to send WhatsApp message' }, { status: 500 });
    }

    const messageId = result.messages?.[0]?.id;

    // Save message to database
    const message = await base44.entities.WhatsAppMessage.create({
      virtual_number_id,
      user_email: user.email,
      from_whatsapp: whatsappPhoneNumberId,
      to_whatsapp,
      message_body,
      direction: 'outbound',
      status: 'sent',
      provider_message_id: messageId,
      timestamp: new Date().toISOString()
    });

    console.log(`[sendWhatsApp] Message saved with ID: ${message.id}`);

    return Response.json({ success: true, message_id: message.id, provider_message_id: messageId });
  } catch (error) {
    console.error('[sendWhatsApp] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});