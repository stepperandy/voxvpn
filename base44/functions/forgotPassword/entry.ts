import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * forgotPassword — triggers a password reset email for the given email address.
 * Base44 handles the actual reset token and email delivery.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const { email } = await req.json().catch(() => ({}));

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'A valid email address is required.',
      }), { status: 400, headers: CORS });
    }

    const base44 = createClientFromRequest(req);

    // Trigger Base44 platform password reset
    await base44.auth.resetPasswordRequest(email);

    // Always return success to avoid email enumeration
    return new Response(JSON.stringify({
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    }), { status: 200, headers: CORS });

  } catch (error) {
    console.error('forgotPassword error:', error.message);
    // Still return a generic success to avoid email enumeration
    return new Response(JSON.stringify({
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    }), { status: 200, headers: CORS });
  }
});