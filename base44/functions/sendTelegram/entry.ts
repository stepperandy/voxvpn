import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { virtual_number_id, chat_id, message_body } = await req.json();

    if (!virtual_number_id || !chat_id || !message_body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[sendTelegram] Sending message to chat ${chat_id}`);

    // Verify user owns this virtual number
    const numbers = await base44.entities.VirtualNumber.filter({
      id: virtual_number_id,
      customer_email: user.email
    });

    if (!numbers || numbers.length === 0) {
      return Response.json({ error: 'Virtual number not found or not owned by user' }, { status: 403 });
    }

    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    if (!telegramBotToken) {
      console.warn('[sendTelegram] Telegram bot token not configured');
      return Response.json({ error: 'Telegram not configured' }, { status: 503 });
    }

    // Send via Telegram Bot API
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text: message_body,
          parse_mode: 'HTML'
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error('[sendTelegram] Telegram API error:', result);
      return Response.json({ error: 'Failed to send Telegram message' }, { status: 500 });
    }

    const messageId = result.result?.message_id;

    // Save message to database
    const message = await base44.entities.TelegramMessage.create({
      virtual_number_id,
      user_email: user.email,
      from_telegram_id: telegramBotToken.split(':')[0],
      to_telegram_id: chat_id,
      chat_id,
      message_body,
      direction: 'outbound',
      status: 'sent',
      provider_message_id: messageId,
      timestamp: new Date().toISOString()
    });

    console.log(`[sendTelegram] Message saved with ID: ${message.id}`);

    return Response.json({ success: true, message_id: message.id, provider_message_id: messageId });
  } catch (error) {
    console.error('[sendTelegram] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});