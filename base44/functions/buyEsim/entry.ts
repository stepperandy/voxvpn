import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, product_id } = await req.json();

    if (!user_id || !product_id) {
      return Response.json({ error: 'Missing user_id or product_id' }, { status: 400 });
    }

    // Step 1: Get user and check wallet
    const user = await base44.asServiceRole.entities.User.get(user_id);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const product = await base44.entities.ESimProduct.filter({ product_id });
    if (!product || product.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const productData = product[0];
    const userBalance = user.credits || 0;

    if (userBalance < productData.price) {
      return Response.json({ error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // Step 2: Call ConnectFlex API to provision eSIM
    const telnaApiKey = Deno.env.get('TELNA_API_KEY');
    if (!telnaApiKey) {
      console.error('TELNA_API_KEY not configured');
      return Response.json({ error: 'API configuration error' }, { status: 500 });
    }

    const provisionResponse = await fetch('https://api.telnaconnectflex.com/v1/esim/provision', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productData.product_id,
        quantity: 1,
      }),
    });

    if (!provisionResponse.ok) {
      const error = await provisionResponse.text();
      console.error('ConnectFlex API error:', error);
      return Response.json({ error: 'Failed to provision eSIM' }, { status: 500 });
    }

    const provisionData = await provisionResponse.json();
    const workOrderId = provisionData.work_order_id;
    const iccid = provisionData.iccid;
    const qrCode = provisionData.lpa_activation_code || provisionData.qr_code;

    // Step 3 & 4 already handled by API response (work order created and QR code received)

    // Step 5: Save eSIM to database
    const eSim = await base44.asServiceRole.entities.ESim.create({
      user_email: user.email,
      product_id: productData.product_id,
      product_name: productData.name,
      iccid,
      qr_code: qrCode,
      status: 'active',
      price_paid: productData.price,
    });

    // Deduct from user wallet
    const newBalance = userBalance - productData.price;
    await base44.auth.updateMe({ credits: newBalance });

    console.log(`eSIM purchased: ${eSim.id} for user ${user.email}`);

    return Response.json({
      success: true,
      esim_id: eSim.id,
      iccid,
      qr_code: qrCode,
      work_order_id: workOrderId,
      remaining_balance: newBalance,
    });
  } catch (error) {
    console.error('buyEsim error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});