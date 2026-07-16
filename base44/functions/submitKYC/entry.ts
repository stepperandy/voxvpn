/**
 * KYC Submission Handler
 * Accepts KYC documents and creates a verification request.
 * Also notifies admin via email.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      full_name, date_of_birth, nationality, id_type, id_number,
      id_front_url, id_back_url, selfie_url, address
    } = body;

    if (!full_name || !date_of_birth || !nationality || !id_type || !id_number || !id_front_url || !selfie_url) {
      return Response.json({ error: 'Missing required KYC fields' }, { status: 400 });
    }

    // Check if already has pending/approved KYC
    const existing = await base44.entities.KYCVerification.filter({ user_email: user.email });
    const active = existing.find(k => ['pending', 'approved'].includes(k.status));
    if (active) {
      return Response.json({
        error: active.status === 'approved' ? 'KYC already approved' : 'KYC already under review',
        status: active.status,
        id: active.id,
      }, { status: 409 });
    }

    const kyc = await base44.entities.KYCVerification.create({
      user_email: user.email,
      full_name,
      date_of_birth,
      nationality,
      id_type,
      id_number,
      id_front_url,
      id_back_url: id_back_url || '',
      selfie_url,
      address: address || '',
      status: 'pending',
    });

    // Notify admin by email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'admin@voxdigits.com',
        subject: `New KYC Submission — ${user.email}`,
        body: `
A new KYC verification has been submitted.

User: ${user.full_name} (${user.email})
Name on ID: ${full_name}
DOB: ${date_of_birth}
Nationality: ${nationality}
ID Type: ${id_type}
ID Number: ${id_number}

Review it in the Admin Panel → KYC Verification.
        `.trim(),
      });
    } catch (emailErr) {
      console.warn('[submitKYC] Admin email failed:', emailErr.message);
    }

    // Confirm to user
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'KYC Submission Received — VoxDigits',
        body: `Hi ${user.full_name},\n\nWe've received your identity verification documents. Our team will review them within 1-2 business days.\n\nYou'll be notified by email once your account is verified.\n\nThank you,\nVoxDigits Team`,
      });
    } catch (emailErr) {
      console.warn('[submitKYC] User email failed:', emailErr.message);
    }

    console.log(`[submitKYC] KYC submitted for ${user.email}`);
    return Response.json({ success: true, id: kyc.id, status: 'pending' });

  } catch (error) {
    console.error('[submitKYC] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});