import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const accessToken = Deno.env.get("GUMROAD_ACCESS_TOKEN");
    if (!accessToken) {
      return Response.json({ error: "GUMROAD_ACCESS_TOKEN is not set. Add it in dashboard settings → environment variables." }, { status: 500 });
    }

    const resp = await fetch("https://api.gumroad.com/v2/products?access_token=" + encodeURIComponent(accessToken), {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    const data = await resp.json();

    if (!resp.ok || !data.success) {
      console.error("Gumroad API error:", JSON.stringify(data));
      return Response.json({ error: data.message || "Failed to fetch products from Gumroad" }, { status: resp.status });
    }

    const products = (data.products || [])
      .filter(p => p.published !== false)
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        price: p.price ? (p.price / 100).toFixed(2) : null,
        currency: (p.currency || "usd").toUpperCase(),
        short_url: p.short_url,
        thumbnail_url: p.thumbnail_url,
        published: p.published,
        sales_count: p.sales_count || 0,
        file_size: p.file_size,
        file_type: p.file_type
      }));

    return Response.json({ products });
  } catch (error) {
    console.error("gumroadProducts error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});