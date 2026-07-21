/**
 * Records SMS consent (opt-in or opt-out) for Twilio A2P compliance.
 * PUBLIC endpoint — called from public signup forms and opt-in page.
 * Uses service role to persist consent records.
 *
 * Payload:
 *  - user_email: string (required)
 *  - phone_number: string (optional)
 *  - consent_given: boolean (true = opt-in, false = opt-out)
 *  - consent_text: string (exact disclosure text shown)
 *  - consent_version: string (e.g., v1.0)
 *  - source_url: string (where consent was given)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      user_email,
      phone_number,
      consent_given,
      consent_text,
      consent_version,
      source_url,
    } = body;

    if (!user_email) {
      return Response.json({ error: 'user_email is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Get client IP for audit trail
    const forwarded = req.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    if (consent_given) {
      // ── Opt-in: create new consent record ──
      // Check if an active record already exists for this email
      const existing = await base44.asServiceRole.entities.SmsConsent.filter({
        user_email,
        status: 'active',
      });

      if (existing && existing.length > 0) {
        // Update existing record with new consent timestamp
        await base44.asServiceRole.entities.SmsConsent.update(existing[0].id, {
          consent_given: true,
          consent_text: consent_text || existing[0].consent_text,
          consent_version: consent_version || existing[0].consent_version,
          source_url: source_url || existing[0].source_url,
          consent_timestamp: now,
          phone_number: phone_number || existing[0].phone_number,
          status: 'active',
          opt_out_date: null,
          ip_address: ipAddress,
        });

        console.log(`[recordSmsConsent] Updated existing consent for ${user_email}`);

        return Response.json({
          success: true,
          action: 'updated',
          status: 'active',
          consent_timestamp: now,
        });
      }

      // Create new consent record
      const record = await base44.asServiceRole.entities.SmsConsent.create({
        user_email,
        phone_number: phone_number || null,
        consent_given: true,
        consent_text: consent_text || '',
        consent_version: consent_version || 'v1.0',
        source_url: source_url || '',
        consent_timestamp: now,
        status: 'active',
        opt_out_date: null,
        ip_address: ipAddress,
      });

      console.log(`[recordSmsConsent] New consent recorded for ${user_email} (id: ${record.id})`);

      return Response.json({
        success: true,
        action: 'created',
        status: 'active',
        consent_timestamp: now,
      });
    } else {
      // ── Opt-out: update existing active records to opted_out ──
      const activeRecords = await base44.asServiceRole.entities.SmsConsent.filter({
        user_email,
        status: 'active',
      });

      if (activeRecords && activeRecords.length > 0) {
        for (const record of activeRecords) {
          await base44.asServiceRole.entities.SmsConsent.update(record.id, {
            consent_given: false,
            status: 'opted_out',
            opt_out_date: now,
            ip_address: ipAddress,
          });
        }
        console.log(`[recordSmsConsent] Opted out ${activeRecords.length} record(s) for ${user_email}`);
      } else {
        // Create an explicit opt-out record even if no prior consent
        await base44.asServiceRole.entities.SmsConsent.create({
          user_email,
          phone_number: phone_number || null,
          consent_given: false,
          consent_text: consent_text || '',
          consent_version: consent_version || 'v1.0',
          source_url: source_url || '',
          consent_timestamp: now,
          status: 'opted_out',
          opt_out_date: now,
          ip_address: ipAddress,
        });
        console.log(`[recordSmsConsent] Created opt-out record for ${user_email}`);
      }

      return Response.json({
        success: true,
        action: 'opted_out',
        status: 'opted_out',
        opt_out_date: now,
      });
    }
  } catch (error) {
    console.error('[recordSmsConsent] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});