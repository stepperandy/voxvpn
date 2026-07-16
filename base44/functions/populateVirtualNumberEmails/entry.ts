import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('[populateVirtualNumberEmails] Starting...');

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list(undefined, 1000);
    
    // Get all virtual numbers
    const allNumbers = await base44.asServiceRole.entities.VirtualNumber.list(undefined, 1000);

    const results = {
      updated: 0,
      failed: 0,
      errors: [],
    };

    // For each number without customer_email, assign it to an unassigned user
    const usersWithNumbers = new Set();
    allNumbers.forEach(vn => {
      if (vn.customer_email) {
        usersWithNumbers.add(vn.customer_email);
      }
    });

    const usersNeedingNumbers = allUsers.filter(u => !usersWithNumbers.has(u.email));
    const numbersNeedingEmail = allNumbers.filter(vn => !vn.customer_email);

    console.log(`Users needing numbers: ${usersNeedingNumbers.length}, Numbers needing email: ${numbersNeedingEmail.length}`);

    // Pair them up
    for (let i = 0; i < Math.min(usersNeedingNumbers.length, numbersNeedingEmail.length); i++) {
      try {
        const userEmail = usersNeedingNumbers[i].email;
        const numberRecord = numbersNeedingEmail[i];
        
        await base44.asServiceRole.entities.VirtualNumber.update(numberRecord.id, {
          customer_email: userEmail,
        });
        
        results.updated++;
        console.log(`✅ ${numberRecord.phone_number} → ${userEmail}`);
      } catch (err) {
        results.failed++;
        results.errors.push(err.message);
        console.error(`❌ Failed:`, err.message);
      }
    }

    return Response.json({
      success: true,
      ...results,
      message: `${results.updated} virtual number emails populated`,
    });
  } catch (error) {
    console.error('[populateVirtualNumberEmails] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});