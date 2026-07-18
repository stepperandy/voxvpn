import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const REWARD_VERIFIED = 1; // $1 credit when referred user verifies

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { referral_code, device_fingerprint } = body;

    if (!referral_code) {
      return Response.json({ error: 'Referral code required' }, { status: 400 });
    }

    // Find referrer by referral code
    const referrers = await base44.asServiceRole.entities.User.filter({ referral_code });
    if (!referrers || referrers.length === 0) {
      return Response.json({ error: 'Invalid referral code' }, { status: 400 });
    }
    const referrer = referrers[0];

    // Prevent self-referral
    if (referrer.email === user.email) {
      return Response.json({ error: 'Cannot use your own referral code' }, { status: 400 });
    }

    // Check if this user was already referred
    const existing = await base44.asServiceRole.entities.Referral.filter({ referred_email: user.email });
    if (existing && existing.length > 0) {
      if (existing[0].status === 'fraud_flagged') {
        return Response.json({ error: 'Referral flagged for fraud', fraud_flags: existing[0].fraud_flags }, { status: 403 });
      }
      return Response.json({ message: 'Referral already claimed', referral: existing[0] });
    }

    // Compute identity hash for duplicate detection
    const identity_hash = await sha256(`${user.email.toLowerCase()}|${(user.full_name || '').toLowerCase()}`);

    // ── Fraud Checks ──
    const fraud_flags: string[] = [];

    // 1. Duplicate device fingerprint
    if (device_fingerprint) {
      const deviceMatches = await base44.asServiceRole.entities.Referral.filter({ device_fingerprint });
      if (deviceMatches && deviceMatches.length > 0) {
        fraud_flags.push('duplicate_device');
      }
    }

    // 2. Duplicate identity hash
    const identityMatches = await base44.asServiceRole.entities.Referral.filter({ identity_hash });
    if (identityMatches && identityMatches.length > 0) {
      fraud_flags.push('duplicate_identity');
    }

    const isClean = fraud_flags.length === 0;

    // Create referral record
    const referral = await base44.asServiceRole.entities.Referral.create({
      referrer_email: referrer.email,
      referrer_user_id: referrer.id,
      referred_email: user.email,
      referred_user_id: user.id,
      referral_code,
      status: isClean ? 'verified' : 'fraud_flagged',
      device_fingerprint: device_fingerprint || null,
      identity_hash,
      fraud_flags,
      verified_at: isClean ? new Date().toISOString() : null,
    });

    // If clean, credit $1 to referrer (user is authenticated = email verified by platform)
    if (isClean) {
      const referrerCredits = referrer.credits || 0;
      const newBalance = referrerCredits + REWARD_VERIFIED;
      await base44.asServiceRole.entities.User.update(referrer.id, { credits: newBalance });

      await base44.asServiceRole.entities.Transaction.create({
        user_email: referrer.email,
        type: 'credit',
        category: 'bonus',
        amount: REWARD_VERIFIED,
        balance_before: referrerCredits,
        balance_after: newBalance,
        description: `Referral reward - ${user.email} verified`,
        status: 'completed',
      });

      console.log(`[referralClaim] Credited $${REWARD_VERIFIED} to ${referrer.email} for referring ${user.email}`);
    } else {
      console.warn(`[referralClaim] Fraud detected for ${user.email}: ${fraud_flags.join(', ')}`);
    }

    return Response.json({
      success: true,
      fraud_flagged: !isClean,
      fraud_flags,
      referral,
    });
  } catch (error) {
    console.error('[referralClaim] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});