import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone_number } = await req.json();

    if (!phone_number) {
      return Response.json({ error: 'phone_number required' }, { status: 400 });
    }

    // Update user's primary number
    await base44.auth.updateMe({
      primaryNumber: phone_number,
    });

    console.log(`[assignPrimaryNumber] ✅ Assigned ${phone_number} to ${user.email}`);

    return Response.json({
      success: true,
      message: `Primary number set to ${phone_number}`,
      user_email: user.email,
      primary_number: phone_number,
    });
  } catch (error) {
    console.error('[assignPrimaryNumber] Error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});