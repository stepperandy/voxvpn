import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin access
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { reseller_id, status, markup_percentage } = await req.json();

    if (!reseller_id || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reseller = await base44.entities.Reseller.update(reseller_id, {
      status,
      markup_percentage: markup_percentage || 20
    });

    console.log(`Reseller ${reseller_id} updated to status: ${status}`);

    return Response.json({ success: true, reseller });
  } catch (error) {
    console.error('Error updating reseller:', error);
    return Response.json(
      { error: error.message || 'Failed to update reseller' },
      { status: 500 }
    );
  }
});