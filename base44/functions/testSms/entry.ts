// Test SMS sending to debug issues
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch user credits
    const userRecords = await base44.asServiceRole.entities.User.filter({ email: user.email }, '-created_date', 1);
    if (!userRecords?.length) return Response.json({ error: 'User not found' }, { status: 404 });
    const userData = userRecords[0];

    // Get user's virtual numbers
    const numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ userId: user.id });
    
    // Get Twilio credentials
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    return Response.json({
      user_email: user.email,
      user_id: user.id,
      credits: userData.credits || 0,
      virtual_numbers: numbers?.map(n => ({ id: n.id, number: n.number })) || [],
      twilio_configured: !!(twilioSid && twilioToken),
      twilio_sid: twilioSid ? twilioSid.substring(0, 8) + '...' : 'NOT SET',
    });
  } catch (error) {
    console.error('[testSms]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});