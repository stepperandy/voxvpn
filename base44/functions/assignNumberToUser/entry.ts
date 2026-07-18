import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone_number } = await req.json();
    
    if (!phone_number) {
      return Response.json({ error: 'Missing phone_number' }, { status: 400 });
    }

    // Find the VirtualNumber
    const numbers = await base44.entities.VirtualNumber.filter({ phone_number });
    const vnum = numbers?.[0];

    if (!vnum) {
      return Response.json({ error: 'Number not found' }, { status: 404 });
    }

    // Assign it to current user
    await base44.entities.VirtualNumber.update(vnum.id, {
      customer_email: user.email,
    });

    console.log(`[assignNumberToUser] Assigned ${phone_number} to ${user.email}`);
    return Response.json({ success: true, message: `Number assigned to ${user.email}` });

  } catch (error) {
    console.error('[assignNumberToUser] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});