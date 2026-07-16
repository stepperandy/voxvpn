import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, user_email } = await req.json();

    if (!message || !user_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save chat message
    const chatMessage = await base44.entities.ChatMessage.create({
      user_email,
      message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent',
    });

    // Send notification email to support
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'VoxDigits Support <support@voxdigits.com>',
          to: ['support@voxdigits.com'],
          subject: `New Chat Support Message from ${user.full_name || user_email}`,
          html: `<p>New support message from ${user.full_name || user_email} (${user_email})</p>
                 <p><strong>Message:</strong> ${message}</p>
                 <p><a href="https://voxdigits.com/AdminPanel">Reply in Admin Panel</a></p>`
        })
      });
    }

    console.log(`[sendChatMessage] Message saved from ${user_email}`);
    return Response.json({ success: true, message: chatMessage });
  } catch (error) {
    console.error('[sendChatMessage] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});