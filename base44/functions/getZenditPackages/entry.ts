import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const zenditProductId = Deno.env.get("ZENDIT_PRODUCT_ID");
    
    if (!zenditProductId) {
      return Response.json({ error: "Zendit product ID not configured" }, { status: 500 });
    }

    // Mock Zendit packages - replace with actual API call when ready
    // Expected format based on Zendit API documentation
    const packages = [
      {
        package_id: zenditProductId,
        name: "VoxZen - Global 5GB",
        country: "Global",
        country_code: "GLOBAL",
        data_gb: 5,
        duration_days: 30,
        price: 9.99,
        is_active: true
      },
      {
        package_id: zenditProductId,
        name: "VoxZen - Global 10GB",
        country: "Global",
        country_code: "GLOBAL",
        data_gb: 10,
        duration_days: 30,
        price: 14.99,
        is_active: true
      },
      {
        package_id: zenditProductId,
        name: "VoxZen - Global 20GB",
        country: "Global",
        country_code: "GLOBAL",
        data_gb: 20,
        duration_days: 30,
        price: 24.99,
        is_active: true
      }
    ];

    return Response.json({ packages });
  } catch (error) {
    console.error("Zendit packages fetch error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});