import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bundleId, quantity } = await req.json();

    if (!bundleId || !quantity) {
      return Response.json({ error: "bundleId and quantity required" }, { status: 400 });
    }

    const apiKey = Deno.env.get("ESIM_GO_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "ESIM_GO_API_KEY not configured" }, { status: 500 });
    }

    // Get bundle details to check price
    const bundleResponse = await fetch(`https://api.esim-go.com/v2.4/bundles/${bundleId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!bundleResponse.ok) {
      console.error('eSIM GO bundle fetch error:', bundleResponse.status);
      return Response.json({ error: "Bundle not found" }, { status: 404 });
    }

    const bundleData = await bundleResponse.json();
    const bundle = bundleData.bundle;
    const totalCost = bundle.price * quantity;

    // Check user credits
    const userRecord = await base44.entities.User.list();
    const currentUser = userRecord.find(u => u.email === user.email);
    
    if (!currentUser || currentUser.credits < totalCost) {
      return Response.json({ error: "Insufficient credits" }, { status: 400 });
    }

    // Place order with eSIM GO
    const orderResponse = await fetch('https://api.esim-go.com/v2.4/orders', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bundle_id: bundleId,
        quantity: quantity
      })
    });

    if (!orderResponse.ok) {
      console.error('eSIM GO order error:', orderResponse.status, orderResponse.statusText);
      return Response.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderData = await orderResponse.json();
    const order = orderData.order;

    // Deduct credits
    await base44.asServiceRole.entities.User.update(currentUser.id, {
      credits: currentUser.credits - totalCost
    });

    // Store order in database
    const esimRecord = await base44.entities.ESim.create({
      user_email: user.email,
      product_id: bundleId,
      product_name: bundle.name,
      iccid: order.iccid || "",
      qr_code: order.activation_code || "",
      status: "pending",
      price_paid: totalCost
    });

    // Send confirmation email
    try {
      await base44.functions.invoke('sendEsimEmail', {
        email: user.email,
        esim: esimRecord
      });
    } catch (emailErr) {
      console.error('Failed to send eSIM confirmation email:', emailErr);
      // Don't fail the purchase if email fails
    }

    return Response.json({
      success: true,
      order: order,
      creditsRemaining: currentUser.credits - totalCost
    });
  } catch (error) {
    console.error('Error purchasing eSIM from GO:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});