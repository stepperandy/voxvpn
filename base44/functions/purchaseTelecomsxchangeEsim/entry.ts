import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = Deno.env.get("TELECOMSXCHANGE_USERNAME");
    const password = Deno.env.get("TELECOMSXCHANGE_PASSWORD");
    const accountId = Deno.env.get("TELECOMSXCHANGE_ACCOUNT_ID");

    if (!username || !password || !accountId) {
      return Response.json(
        { error: "TelecomsXchange credentials not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { package_id, product_name, price } = body;

    if (!package_id) {
      return Response.json(
        { error: "Missing package_id" },
        { status: 400 }
      );
    }

    // Create pending eSIM record
    const esimRecord = await base44.asServiceRole.entities.ESim.create({
      user_email: user.email,
      product_id: package_id,
      product_name: product_name || "TelecomsXchange eSIM",
      iccid: "pending",
      qr_code: "pending",
      status: "pending",
      price_paid: price || 0,
    });

    // Call TelecomsXchange purchase API
    const params = new URLSearchParams({
      i_esim_package: package_id,
      i_account: accountId,
    });

    const credentials = btoa(`${username}:${password}`);

    const response = await fetch(
      `https://apiv2.telecomsxchange.com/buyers/esim/purchase?${params}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const purchaseData = await response.json();

    if (!response.ok) {
      console.error("TelecomsXchange purchase error:", purchaseData);
      // Mark eSIM as error
      await base44.asServiceRole.entities.ESim.update(esimRecord.id, {
        status: "error",
      });
      return Response.json(
        { error: purchaseData.message || "Purchase failed" },
        { status: response.status }
      );
    }

    // Update eSIM with activation details
    await base44.asServiceRole.entities.ESim.update(esimRecord.id, {
      iccid: purchaseData.iccid,
      qr_code: purchaseData.lpa,
      airalo_order_id: purchaseData.order_uuid,
      status: "active",
    });

    return Response.json({
      success: true,
      order: esimRecord,
      iccid: purchaseData.iccid,
      qr_code: purchaseData.lpa,
      ios_install_link: purchaseData.ios_install_link,
    });
  } catch (error) {
    console.error("purchaseTelecomsxchangeEsim error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
});