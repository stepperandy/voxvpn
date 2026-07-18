Deno.serve(async (req) => {
  try {
    const username = Deno.env.get("TELECOMSXCHANGE_USERNAME");
    const password = Deno.env.get("TELECOMSXCHANGE_PASSWORD");

    if (!username || !password) {
      return Response.json(
        { error: "TelecomsXchange credentials not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { country = "TR", data_GB = 1, validity_days = 7, max_price = 10, pager = 10, off = 0 } = body;

    const params = new URLSearchParams({
      country,
      data_GB: String(data_GB),
      validity_days: String(validity_days),
      max_price: String(max_price),
      pager: String(pager),
      off: String(off),
    });

    const credentials = btoa(`${username}:${password}`);

    const response = await fetch(
      `https://apiv2.telecomsxchange.com/buyers/esim/market?${params}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("TelecomsXchange API error:", data);
      return Response.json(
        { error: data.message || "Failed to fetch packages" },
        { status: response.status }
      );
    }

    const packages = (data.search_results || []).map((pkg) => ({
      package_id: String(pkg.i_esim_package),
      name: pkg.name,
      country: pkg.supported_countries?.[0]?.country_name || "Unknown",
      country_code: pkg.country_code?.toUpperCase(),
      data_gb: pkg.data_gb,
      duration_days: pkg.validity_days,
      price: parseFloat(pkg.price_with_fee),
      sms: pkg.sms === 1,
      voice: pkg.voice === 1,
      networks: pkg.networks,
    }));

    return Response.json({ packages, status: "success" });
  } catch (error) {
    console.error("getTelecomsxchangePackages error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
});