import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get("ESIM_GO_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "ESIM_GO_API_KEY not configured" }, { status: 500 });
    }

    const response = await fetch('https://api.esim-go.com/v2.4/bundles', {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('eSIM GO API error:', response.status, response.statusText);
      return Response.json({ error: `eSIM GO API error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();

    return Response.json({
      success: true,
      bundles: data.bundles || []
    });
  } catch (error) {
    console.error('Error fetching eSIM GO products:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});