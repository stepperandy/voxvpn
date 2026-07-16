import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('[bulkAssignPrimaryNumbers] Starting bulk assignment...');

    // Fetch all VirtualNumbers
    const virtualNumbers = await base44.asServiceRole.entities.VirtualNumber.list(undefined, 1000);

    if (!virtualNumbers || virtualNumbers.length === 0) {
      return Response.json({
        success: false,
        error: 'No virtual numbers found',
      });
    }

    // Group numbers by customer_email
    const userNumbers = {};
    virtualNumbers.forEach(vn => {
      if (vn.customer_email && vn.phone_number) {
        if (!userNumbers[vn.customer_email]) {
          userNumbers[vn.customer_email] = [];
        }
        userNumbers[vn.customer_email].push(vn.phone_number);
      }
    });

    console.log(`[bulkAssignPrimaryNumbers] Found ${Object.keys(userNumbers).length} users with numbers`);

    const results = {
      total_users: Object.keys(userNumbers).length,
      updated: 0,
      failed: 0,
      errors: [],
    };

    // Update each user's primaryNumber
    for (const [email, phoneNumbers] of Object.entries(userNumbers)) {
      try {
        const primaryNumber = phoneNumbers[0]; // Use first number as primary

        // Get all users and find by email
        const users = await base44.asServiceRole.entities.User.filter({
          email: email,
        });

        if (users && users.length > 0) {
          // Update user via service role
          await base44.asServiceRole.entities.User.update(users[0].id, {
            primaryNumber: primaryNumber,
            ownedNumbers: phoneNumbers,
          });
          results.updated++;
          console.log(`✅ ${email}: ${primaryNumber}`);
        }
      } catch (err) {
        results.failed++;
        results.errors.push({
          email,
          error: err.message,
        });
        console.error(`❌ Failed for ${email}:`, err.message);
      }
    }

    console.log(`[bulkAssignPrimaryNumbers] Complete: ${results.updated} updated, ${results.failed} failed`);

    return Response.json({
      success: true,
      ...results,
      message: `${results.updated} users assigned primary numbers`,
    });
  } catch (error) {
    console.error('[bulkAssignPrimaryNumbers] Error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});