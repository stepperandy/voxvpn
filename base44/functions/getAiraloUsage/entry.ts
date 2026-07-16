import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active eSIM
    const esims = await base44.entities.ESim.filter(
      { user_email: user.email, status: 'active' },
      '-created_date',
      1
    );

    if (!esims || esims.length === 0) {
      return Response.json({ error: 'No active eSIM found' }, { status: 404 });
    }

    const esim = esims[0];
    const apiKey = Deno.env.get('AIRALO_API_KEY');

    if (!apiKey) {
      return Response.json({ error: 'Airalo API key not configured' }, { status: 503 });
    }

    // Fetch usage from Airalo API
    const airaloResponse = await fetch(
      `https://api.airalo.com/v2/orders/${esim.airalo_order_id}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!airaloResponse.ok) {
      console.error('[getAiraloUsage] Airalo API error:', airaloResponse.status);
      return Response.json({ 
        error: 'Failed to fetch usage from Airalo',
        iccid: esim.iccid,
        fallback: {
          data_total: esim.data_gb || 0,
          data_used: esim.data_used_gb || 0,
          data_remaining: (esim.data_gb || 0) - (esim.data_used_gb || 0)
        }
      }, { status: 502 });
    }

    const orderData = await airaloResponse.json();
    const order = orderData.data?.order || {};

    console.log(`[getAiraloUsage] Usage for ${user.email}: ${order.usage_gb || 0}GB used`);

    // Calculate remaining data
    const totalData = esim.data_gb || 0;
    const usedData = order.usage_gb || esim.data_used_gb || 0;
    const remainingData = Math.max(0, totalData - usedData);
    const percentageUsed = totalData > 0 ? (usedData / totalData) * 100 : 0;

    return Response.json({
      success: true,
      esim: {
        iccid: esim.iccid,
        product_name: esim.product_name,
        valid_until: esim.valid_until
      },
      usage: {
        total_gb: totalData,
        used_gb: usedData,
        remaining_gb: remainingData,
        percentage_used: Math.round(percentageUsed),
        percentage_remaining: Math.round(100 - percentageUsed)
      }
    });
  } catch (error) {
    console.error('[getAiraloUsage] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});