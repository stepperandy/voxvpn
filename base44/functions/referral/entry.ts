import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // Get or create a referral code for the current user
    if (action === 'get_code') {
      // Check if user already has a code
      const existing = await base44.asServiceRole.entities.Referral.filter({ referrer_email: user.email, referee_email: null });
      // Find one that is "the user's own code" (no referee yet or any with this referrer)
      const allReferrals = await base44.asServiceRole.entities.Referral.filter({ referrer_email: user.email });
      // Use the referral_code from any existing record for this referrer
      const codeRecord = allReferrals.find(r => r.referral_code);
      if (codeRecord) {
        return Response.json({ code: codeRecord.referral_code });
      }
      // Generate a new code
      const code = user.email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 8) + '-' + crypto.randomUUID().split('-')[0];
      // Store a placeholder record to persist the code (no referee yet)
      await base44.asServiceRole.entities.Referral.create({
        referrer_email: user.email,
        referral_code: code,
        status: 'pending',
      });
      return Response.json({ code });
    }

    // Get stats: how many referrals and rewards for current user
    if (action === 'get_stats') {
      const referrals = await base44.asServiceRole.entities.Referral.filter({ referrer_email: user.email });
      const completed = referrals.filter(r => r.referee_email && (r.status === 'completed' || r.status === 'rewarded'));
      const rewarded = referrals.filter(r => r.status === 'rewarded');
      return Response.json({
        total_referrals: completed.length,
        total_rewards: rewarded.length,
      });
    }

    // Register a referee using a referral code (called when a new user signs up via a ref link)
    if (action === 'register_referee') {
      const { code } = body;
      if (!code) return Response.json({ error: 'Missing code' }, { status: 400 });
      if (user.email === body.referrer_email) return Response.json({ error: 'Cannot refer yourself' }, { status: 400 });

      // Find the referrer's code record
      const records = await base44.asServiceRole.entities.Referral.filter({ referral_code: code });
      const codeRecord = records.find(r => !r.referee_email);
      if (!codeRecord) return Response.json({ error: 'Invalid or already used code' }, { status: 400 });
      if (codeRecord.referrer_email === user.email) return Response.json({ error: 'Cannot refer yourself' }, { status: 400 });

      // Check user hasn't already used a referral
      const alreadyReferred = await base44.asServiceRole.entities.Referral.filter({ referee_email: user.email });
      if (alreadyReferred.length > 0) return Response.json({ error: 'Already used a referral code' }, { status: 400 });

      await base44.asServiceRole.entities.Referral.update(codeRecord.id, {
        referee_email: user.email,
        status: 'pending',
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});