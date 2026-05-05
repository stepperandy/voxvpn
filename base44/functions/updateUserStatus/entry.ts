import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * updateUserStatus — grant/suspend/update subscriptions, change user role
 * Body: { user_email, action: 'upgrade_plan' | 'suspend' | 'grant_free_month' | 'change_role', plan?, role? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { user_email, action, plan, role } = body;

    if (!user_email || !action) {
      return Response.json({ error: 'user_email and action required' }, { status: 400 });
    }

    let result = { success: true, action, user_email };

    switch (action) {
      case 'upgrade_plan': {
        if (!plan) return Response.json({ error: 'plan required for upgrade' }, { status: 400 });
        
        const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email });
        if (!subs?.[0]) {
          return Response.json({ error: 'User has no subscription' }, { status: 404 });
        }

        await base44.asServiceRole.entities.VPNSubscription.update(subs[0].id, { plan });
        result.message = `Upgraded ${user_email} to ${plan} plan`;
        result.new_plan = plan;
        break;
      }

      case 'suspend': {
        const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email });
        if (!subs?.[0]) {
          return Response.json({ error: 'User has no subscription' }, { status: 404 });
        }

        await base44.asServiceRole.entities.VPNSubscription.update(subs[0].id, { status: 'paused' });
        result.message = `Suspended ${user_email}'s subscription`;
        result.new_status = 'paused';
        break;
      }

      case 'grant_free_month': {
        const subs = await base44.asServiceRole.entities.VPNSubscription.filter({ user_email });
        if (!subs?.[0]) {
          return Response.json({ error: 'User has no subscription' }, { status: 404 });
        }

        const newRenewalDate = new Date(subs[0].renewal_date);
        newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);

        await base44.asServiceRole.entities.VPNSubscription.update(subs[0].id, {
          renewal_date: newRenewalDate.toISOString(),
        });

        result.message = `Granted 1 free month to ${user_email}`;
        result.new_renewal_date = newRenewalDate.toISOString();
        break;
      }

      case 'change_role': {
        if (!role || !['admin', 'user'].includes(role)) {
          return Response.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Note: User entity role update requires proper permission handling
        result.message = `Role update for ${user_email} requires manual intervention`;
        result.note = 'Use dashboard user editor to change roles';
        break;
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('updateUserStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});