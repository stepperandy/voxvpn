import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const numbers = await base44.asServiceRole.entities.VirtualNumber.filter({
      customer_email: user.email
    });
    return Response.json({ data: { data: numbers || [] } });
  } catch (error) {
    console.error('getOwnedNumbers error:', error.message);
    return Response.json({ data: { data: [] } });
  }
});