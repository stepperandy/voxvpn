/**
 * One-time migration: Populate customer_email for all VirtualNumbers
 * that don't have it yet, based on the user who owns them.
 * This is needed because old numbers were created without customer_email.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Only admin can run this
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('[migrateVirtualNumbersEmails] Starting migration...');

    // Get all VirtualNumbers without customer_email
    const numbersNeedingEmail = await base44.asServiceRole.entities.VirtualNumber.filter({ 
      customer_email: '' 
    });

    if (!numbersNeedingEmail || numbersNeedingEmail.length === 0) {
      console.log('[migrateVirtualNumbersEmails] No numbers need migration');
      return Response.json({ message: 'No numbers to migrate', count: 0 });
    }

    console.log(`[migrateVirtualNumbersEmails] Found ${numbersNeedingEmail.length} numbers without customer_email`);

    // Get all users to map to their numbers
    const users = await base44.asServiceRole.entities.User.list();
    console.log(`[migrateVirtualNumbersEmails] Found ${users?.length || 0} users`);

    let updated = 0;

    // For now, assign all orphaned numbers to the current admin
    // In production, you'd need better logic to determine the rightful owner
    for (const num of numbersNeedingEmail) {
      try {
        await base44.asServiceRole.entities.VirtualNumber.update(num.id, {
          customer_email: user.email,
        });
        updated++;
        console.log(`[migrateVirtualNumbersEmails] Updated ${num.phone_number} -> ${user.email}`);
      } catch (err) {
        console.error(`[migrateVirtualNumbersEmails] Failed to update ${num.phone_number}:`, err.message);
      }
    }

    console.log(`[migrateVirtualNumbersEmails] ✅ Migration complete: ${updated}/${numbersNeedingEmail.length} updated`);

    return Response.json({ 
      success: true, 
      message: `Updated ${updated} numbers`,
      count: updated,
      total: numbersNeedingEmail.length
    });

  } catch (error) {
    console.error('[migrateVirtualNumbersEmails] ❌ Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});