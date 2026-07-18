import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { package_id, product_name, price, user_email } = await req.json();

    if (!package_id || !product_name || !price) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create ESim record in database
    const esimRecord = await base44.asServiceRole.entities.ESim.create({
      user_email: user_email || user.email,
      product_id: package_id,
      product_name: product_name,
      iccid: `ZENDIT_${Date.now()}`, // Placeholder ICCID
      qr_code: "pending", // Will be updated after Zendit provisioning
      status: "pending",
      price_paid: price,
      data_gb: 0, // Will be updated from product
      auto_topup: false
    });

    // TODO: Call actual Zendit API for provisioning
    // const zenditResponse = await fetch('https://zendit-api.com/provision', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('ZENDIT_PRODUCT_ID')}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ package_id, user_email })
    // });

    return Response.json({
      success: true,
      order: esimRecord,
      message: "VoxZen eSIM order created. Provisioning in progress."
    });
  } catch (error) {
    console.error("Zendit purchase error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});