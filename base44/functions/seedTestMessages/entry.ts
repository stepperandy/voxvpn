import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sample test messages
    const testMessages = [
      {
        user_email: user.email,
        our_number: '+233551442248',
        from_number: '+15404048622',
        to_number: '+233551442248',
        body: 'Hello',
        direction: 'inbound',
        status: 'delivered',
        provider_message_id: 'test_msg_001'
      },
      {
        user_email: user.email,
        our_number: '+233551442248',
        from_number: '+233551442248',
        to_number: '+15404048622',
        body: 'Hi there! How are you?',
        direction: 'outbound',
        status: 'delivered',
        provider_message_id: 'test_msg_002'
      },
      {
        user_email: user.email,
        our_number: '+233551442248',
        from_number: '+15404048622',
        to_number: '+233551442248',
        body: 'Okay, please send it again.',
        direction: 'inbound',
        status: 'delivered',
        provider_message_id: 'test_msg_003'
      }
    ];

    // Create messages
    const created = await base44.entities.Message.bulkCreate(testMessages);

    return Response.json({
      success: true,
      count: created.length,
      messages: created
    });
  } catch (error) {
    console.error('[seedTestMessages]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});