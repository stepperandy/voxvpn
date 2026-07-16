import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all users
    const allUsers = await base44.asServiceRole.entities.User.list(undefined, 1000);
    
    // Fetch all virtual numbers
    const allNumbers = await base44.asServiceRole.entities.VirtualNumber.list(undefined, 1000);

    const usersWithPrimary = allUsers.filter(u => u.primaryNumber);
    const usersWithoutPrimary = allUsers.filter(u => !u.primaryNumber);
    
    const numbersByEmail = {};
    allNumbers.forEach(vn => {
      if (vn.customer_email) {
        if (!numbersByEmail[vn.customer_email]) {
          numbersByEmail[vn.customer_email] = [];
        }
        numbersByEmail[vn.customer_email].push(vn.phone_number);
      }
    });

    return Response.json({
      total_users: allUsers.length,
      users_with_primary: usersWithPrimary.length,
      users_without_primary: usersWithoutPrimary.length,
      total_virtual_numbers: allNumbers.length,
      numbers_by_customer_email_count: Object.keys(numbersByEmail).length,
      users_without_primary_list: usersWithoutPrimary.map(u => ({ email: u.email, id: u.id })),
      virtual_numbers_sample: allNumbers.slice(0, 10).map(vn => ({
        phone: vn.phone_number,
        customer_email: vn.customer_email,
        status: vn.status,
      })),
    });
  } catch (error) {
    console.error('[debugUserNumbers] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});