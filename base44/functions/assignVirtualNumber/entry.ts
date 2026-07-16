import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { number } = await req.json();

    if (!number) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Create or update the virtual number for this user
    const existing = await base44.asServiceRole.entities.VirtualNumber.filter({
      number: number,
      userId: user.id
    });

    if (existing && existing.length > 0) {
      return Response.json({ success: true, message: 'Number already assigned', data: existing[0] });
    }

    const created = await base44.asServiceRole.entities.VirtualNumber.create({
      number: number,
      userId: user.id
    });

    return Response.json({ success: true, data: created });
  } catch (error) {
    console.error('[assignVirtualNumber] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});