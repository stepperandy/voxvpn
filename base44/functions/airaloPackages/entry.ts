const AIRALO_BASE = "https://partners-api.airalo.com/v2";

async function getAiraloToken() {
  const payload = {
    client_id: Deno.env.get("AIRALO_CLIENT_ID"),
    client_secret: Deno.env.get("AIRALO_CLIENT_SECRET"),
    grant_type: "client_credentials",
  };
  console.log("Request: POST /v1/auth/token", { client_id: payload.client_id });

  const res = await fetch(`${AIRALO_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body: new URLSearchParams(payload),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Auth failed: invalid JSON response`); }
  console.log("Response: POST /v1/auth/token", { status: res.status, has_token: !!data.data?.access_token });

  if (!res.ok) throw new Error(`Auth failed: ${data.message || res.status}`);
  return data.data?.access_token;
}

async function fetchProducts(token) {
  console.log("Request: GET /v2/packages");
  const res = await fetch(`${AIRALO_BASE}/packages?limit=100`, {
    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
  });

  if (res.status === 401) return null; // signal token refresh needed

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Failed to parse packages response`); }
  console.log("Response: GET /v2/packages", { status: res.status, countries: data.data?.length });

  if (!res.ok) throw new Error(`Failed to fetch packages: ${data.message || res.status}`);
  return data;
}

Deno.serve(async (req) => {
  try {
    if (!Deno.env.get("AIRALO_CLIENT_ID") || !Deno.env.get("AIRALO_CLIENT_SECRET")) {
      return Response.json({ success: false, error: "Airalo credentials not configured" }, { status: 503 });
    }

    let token = await getAiraloToken();
    let data = await fetchProducts(token);

    if (data === null) {
      console.log("Got 401 — refreshing token and retrying...");
      token = await getAiraloToken();
      data = await fetchProducts(token);
    }

    const countries = data?.data || [];
    const packages = [];

    for (const country of countries) {
      for (const operator of (country.operators || [])) {
        for (const pkg of (operator.packages || [])) {
          packages.push({
            package_id: pkg.package_id || pkg.id,
            name: pkg.title || `${country.title} ${pkg.data}`,
            country: country.title || "Global",
            country_code: country.country_code || country.slug || "",
            flag_url: country.image?.url || null,
            data_gb: parseFloat(pkg.data) || 0,
            data_label: pkg.data || "",
            duration_days: parseInt(pkg.day) || 0,
            price: parseFloat(pkg.price) || 0,
            net_price: parseFloat(pkg.net_price) || 0,
            operator: operator.title || "",
            is_unlimited: pkg.is_unlimited || false,
          });
        }
      }
    }

    console.log(`Returning ${packages.length} packages across ${countries.length} countries`);
    return Response.json({ success: true, packages });

  } catch (error) {
    console.error("[airaloPackages] error:", error.message);
    return Response.json({ success: false, error: "Something went wrong. Try again." }, { status: 500 });
  }
});