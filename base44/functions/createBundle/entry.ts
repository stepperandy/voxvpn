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

    const { bundle_type, name, description, base_price, retail_price, esim_products, number_countries } = await req.json();

    if (!bundle_type || !name || base_price === undefined || retail_price === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bundle = await base44.entities.Bundle.create({
      bundle_type,
      name,
      description,
      base_price,
      retail_price,
      esim_products: esim_products || [],
      number_countries: number_countries || [],
      is_active: true
    });

    console.log(`Bundle created: ${bundle.id}`);

    return Response.json({ success: true, bundle });
  } catch (error) {
    console.error('Error creating bundle:', error);
    return Response.json(
      { error: error.message || 'Failed to create bundle' },
      { status: 500 }
    );
  }
});