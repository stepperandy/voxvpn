/**
 * KYC Review Handler (Admin only)
 * Approve or reject a KYC submission and notify the user.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { kyc_id, action, rejection_reason } = await req.json();
    if (!kyc_id || !action) {
      return Response.json({ error: 'Missing kyc_id or action' }, { status: 400 });
    }
    if (!['approve', 'reject', 'needs_review'].includes(action)) {
      return Response.json({ error: 'action must be: approve, reject, needs_review' }, { status: 400 });
    }
    if (action === 'reject' && !rejection_reason) {
      return Response.json({ error: 'rejection_reason required when rejecting' }, { status: 400 });
    }

    const kycs = await base44.asServiceRole.entities.KYCVerification.filter({ id: kyc_id });
    const kyc = kycs?.[0];
    if (!kyc) return Response.json({ error: 'KYC record not found' }, { status: 404 });

    const statusMap = { approve: 'approved', reject: 'rejected', needs_review: 'needs_review' };
    const newStatus = statusMap[action];

    await base44.asServiceRole.entities.KYCVerification.update(kyc_id, {
      status: newStatus,
      rejection_reason: rejection_reason || '',
      reviewed_by: user.email,
      reviewed_at: new Date().toISOString(),
    });

    // Notify user
    const emailSubjects = {
      approved: 'Your Identity Has Been Verified — VoxDigits ✅',
      rejected: 'KYC Verification Update — VoxDigits',
      needs_review: 'Additional Information Required — VoxDigits',
    };

    const emailBodies = {
      approved: `Hi,\n\nGreat news! Your identity verification has been approved. Your VoxDigits account is now fully verified.\n\nYou can now access all features without restrictions.\n\nThank you,\nVoxDigits Team`,
      rejected: `Hi,\n\nUnfortunately, we were unable to verify your identity.\n\nReason: ${rejection_reason}\n\nPlease re-submit with correct documents.\n\nThank you,\nVoxDigits Team`,
      needs_review: `Hi,\n\nWe need additional information to complete your identity verification. Our support team will contact you shortly.\n\nThank you,\nVoxDigits Team`,
    };

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: kyc.user_email,
        subject: emailSubjects[newStatus],
        body: emailBodies[newStatus],
      });
    } catch (emailErr) {
      console.warn('[reviewKYC] Notification email failed:', emailErr.message);
    }

    console.log(`[reviewKYC] KYC ${kyc_id} ${action}d by ${user.email}`);
    return Response.json({ success: true, status: newStatus });

  } catch (error) {
    console.error('[reviewKYC] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});