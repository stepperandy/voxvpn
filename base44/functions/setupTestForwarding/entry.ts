import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's virtual numbers
    const numbers = await base44.entities.VirtualNumber.filter({
      customer_email: user.email,
    });

    if (!numbers || numbers.length === 0) {
      return Response.json({ error: 'No virtual numbers found' }, { status: 404 });
    }

    const virtualNumber = numbers[0].phone_number;

    // Check if forwarding rule exists
    const existing = await base44.entities.CallForwardingRule.filter({
      virtual_number: virtualNumber,
      user_email: user.email,
    });

    if (existing && existing.length > 0) {
      return Response.json({
        message: 'Forwarding rule already exists',
        rule: existing[0],
      });
    }

    // Create forwarding rule with client identity
    const identity = user.email.split('@')[0];
    const rule = await base44.entities.CallForwardingRule.create({
      virtual_number: virtualNumber,
      user_email: user.email,
      forwarding_number: `client:${identity}`,
      destination_type: 'phone_number',
      enabled: true,
      ring_timeout: 30,
    });

    console.log(`[setupTestForwarding] Created rule: ${virtualNumber} → client:${identity}`);

    return Response.json({
      success: true,
      message: 'Forwarding rule created',
      rule,
    });
  } catch (error) {
    console.error('[setupTestForwarding] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});