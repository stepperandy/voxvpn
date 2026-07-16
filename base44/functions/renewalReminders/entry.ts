/**
 * RENEWAL REMINDERS
 * Scheduled function — runs daily.
 * Sends renewal reminder emails:
 *   - 7 days before renewal
 *   - 1 day before renewal
 *
 * Also handles FAILED RENEWAL lifecycle:
 *   - Day 1-3 after failed renewal: number stays active, retry payment
 *   - Day 3: suspend outgoing service (set status=suspended)
 *   - Day 3-17: number is reserved (status=reserved), incoming still works
 *   - Day 17: archive the number (status=archived, stored in NumberArchive)
 *   - Archived numbers can be reclaimed by original user if payment resumes
 */

import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

async function sendEmail(to, subject, html) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) { console.warn("RESEND_API_KEY not set"); return; }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "VoxDigits <noreply@voxdigits.com>", to, subject, html }),
    });
    console.log(`[renewalReminders] Sent "${subject}" to ${to}`);
  } catch (e) { console.warn("[renewalReminders] Email failed:", e.message); }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify admin (scheduled task)
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    // ── UPCOMING RENEWAL REMINDERS ──────────────────────────────────────────
    const activeSubs = await base44.asServiceRole.entities.Subscription.filter({ status: "active" });

    for (const sub of activeSubs) {
      if (!sub.current_period_end) continue;
      const renewalDate = new Date(sub.current_period_end);
      const diffDays = Math.ceil((renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      // 7-day reminder
      if (diffDays === 7) {
        await sendEmail(sub.user_email,
          "⏰ Your VoxDigits Number Renews in 7 Days",
          `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
            <h2 style="color:#22d3ee;">Renewal Reminder — 7 Days</h2>
            <p>Your virtual number subscription renews on <strong>${renewalDate.toLocaleDateString()}</strong>.</p>
            <p>Plan: ${sub.plan_name || "Virtual Number"} — $${sub.amount}/mo</p>
            <p>Please ensure your payment method is up to date to avoid service interruption.</p>
            <p><a href="https://voxdigits.com/Billing" style="color:#22d3ee;">Manage Billing</a></p>
            <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Team</p>
          </div>`
        );
      }

      // 1-day reminder
      if (diffDays === 1) {
        await sendEmail(sub.user_email,
          "🔴 Your VoxDigits Number Renews Tomorrow",
          `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#0d1f35;color:#fff;border-radius:12px;">
            <h2 style="color:#ef4444;">Renewal Tomorrow — Action May Be Needed</h2>
            <p>Your virtual number subscription renews <strong>tomorrow</strong> on ${renewalDate.toLocaleDateString()}.</p>
            <p>Plan: ${sub.plan_name || "Virtual Number"} — $${sub.amount}/mo</p>
            <p>If your payment fails, you have a 3-day grace period before outgoing service is suspended, and 17 days before the number is released.</p>
            <p><a href="https://voxdigits.com/Billing" style="color:#22d3ee;">Update Payment Method</a></p>
            <p style="color:#64748b;font-size:12px;margin-top:24px;">— The VoxDigits Team</p>
          </div>`
        );
      }
    }

    // ── FAILED RENEWAL LIFECYCLE ────────────────────────────────────────────
    const pastDueSubs = await base44.asServiceRole.entities.Subscription.filter({ status: "past_due" });

    for (const sub of pastDueSubs) {
      if (!sub.current_period_end) continue;
      const periodEnd = new Date(sub.current_period_end);
      const daysSinceFailed = Math.floor((now.getTime() - periodEnd.getTime()) / (24 * 60 * 60 * 1000));

      // Get associated virtual numbers
      const vns = await base44.asServiceRole.entities.VirtualNumber.filter({ customer_email: sub.user_email });

      for (const vn of vns) {
        if (vn.status === "archived") continue; // Already archived

        // Day 3: Suspend outgoing service
        if (daysSinceFailed >= 3 && daysSinceFailed < 17 && vn.status !== "suspended" && vn.status !== "reserved") {
          await base44.asServiceRole.entities.VirtualNumber.update(vn.id, {
            status: "suspended",
            suspended_at: now.toISOString(),
            suspension_reason: "failed_renewal",
            reserved_until: new Date(periodEnd.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString(),
          });
          await sendEmail(sub.user_email,
            "⚠️ Outgoing Service Suspended — Payment Overdue",
            `<h2 style="color:#f59e0b;">Service Suspended</h2>
             <p>Your virtual number ${vn.number} has had outgoing calls and SMS suspended due to a failed renewal payment.</p>
             <p><strong>Incoming calls and SMS still work.</strong></p>
             <p>You have until <strong>${new Date(periodEnd.getTime() + 17 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong> to renew before your number is released and archived.</p>
             <p><a href="https://voxdigits.com/Billing">Update Payment Now</a></p>`
          );
          console.log(`[renewalReminders] Suspended ${vn.number} for ${sub.user_email} (day ${daysSinceFailed})`);
        }

        // Day 3-17: Reserved (incoming only, already suspended above)
        if (daysSinceFailed >= 3 && daysSinceFailed < 17 && vn.status === "suspended") {
          // Upgrade to reserved after suspension
          await base44.asServiceRole.entities.VirtualNumber.update(vn.id, {
            status: "reserved",
            reserved_until: new Date(periodEnd.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString(),
          });
          console.log(`[renewalReminders] Reserved ${vn.number} for ${sub.user_email} (day ${daysSinceFailed})`);
        }

        // Day 17: Archive the number
        if (daysSinceFailed >= 17) {
          // Create archive record
          await base44.asServiceRole.entities.NumberArchive.create({
            phone_number: vn.number,
            original_user_id: vn.userId,
            original_user_email: vn.customer_email,
            country_code: vn.country_code,
            number_type: vn.number_type,
            provider: vn.provider,
            provider_number_sid: vn.twilio_number_sid,
            virtual_number_id: vn.id,
            archived_at: now.toISOString(),
            release_date: now.toISOString(),
            reclaim_eligible_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "archived",
            reason: "failed_renewal",
          });

          // Mark virtual number as archived
          await base44.asServiceRole.entities.VirtualNumber.update(vn.id, {
            status: "archived",
            suspended_at: vn.suspended_at || now.toISOString(),
            suspension_reason: "failed_renewal_archived",
          });

          await sendEmail(sub.user_email,
            "❌ Your Virtual Number Has Been Released",
            `<h2 style="color:#ef4444;">Number Archived</h2>
             <p>Your virtual number <strong>${vn.number}</strong> has been released after 17 days without renewal.</p>
             <p><strong>You can reclaim this same number</strong> by logging in and renewing your subscription within 30 days. After that, it may be assigned to another user.</p>
             <p><a href="https://voxdigits.com/VirtualNumbers">Renew & Reclaim</a></p>
             <p style="font-size:12px;color:#64748b;margin-top:16px;">Note: Setup fees, activated subscriptions, and used credit are non-refundable.</p>`
          );
          console.log(`[renewalReminders] Archived ${vn.number} for ${sub.user_email} (day ${daysSinceFailed})`);
        }
      }

      // Send daily warning emails during grace period (days 1-3)
      if (daysSinceFailed >= 0 && daysSinceFailed < 3) {
        await sendEmail(sub.user_email,
          `⚠️ Payment Failed — ${daysSinceFailed === 0 ? "Action Needed Today" : `${3 - daysSinceFailed} Days Left`}`,
          `<h2 style="color:#f59e0b;">Payment Failed</h2>
           <p>Your renewal payment for your virtual number subscription failed.</p>
           <p>You have <strong>${3 - daysSinceFailed} day(s)</strong> before outgoing service is suspended.</p>
           <p>After 17 days without payment, your number will be released and archived.</p>
           <p><a href="https://voxdigits.com/Billing">Update Payment Method</a></p>`
        );
      }
    }

    return Response.json({
      success: true,
      reminders_sent: "processed",
      past_due_processed: pastDueSubs.length,
    });
  } catch (error) {
    console.error("[renewalReminders] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});