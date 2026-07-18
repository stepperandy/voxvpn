import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TELNA_API_URL = 'https://ppo-api.telna.com/v1';
const TELNA_API_KEY = Deno.env.get('TELNA_API_KEY');

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Fetch products from TELNA API
    const response = await fetch(`${TELNA_API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${TELNA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`TELNA API error: ${response.status}`);
    }

    const products = await response.json();

    return Response.json({
      success: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        country: p.country,
        data_gb: p.data_gb,
        duration_days: p.duration_days,
        price: p.price,
        description: p.description
      }))
    });
  } catch (error) {
    console.error('Error fetching TELNA products:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
});