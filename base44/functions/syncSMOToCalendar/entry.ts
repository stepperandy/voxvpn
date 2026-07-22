import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Auth: admin required for manual calls; automation calls (with event payload) bypass
    const isAutomation = !!body.event;
    if (!isAutomation) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ success: false, error: "Admin access required" }, { status: 403 });
      }
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };

    // Determine which posts to sync
    let postsToSync = [];
    if (body.data && body.event?.entity_name === "SMOPost") {
      postsToSync = [body.data];
    } else if (body.post_id) {
      const post = await base44.asServiceRole.entities.SMOPost.get(body.post_id);
      postsToSync = post ? [post] : [];
    } else {
      postsToSync = await base44.asServiceRole.entities.SMOPost.filter({ status: "scheduled" });
    }

    if (!postsToSync || postsToSync.length === 0) {
      return Response.json({ success: true, synced: 0, message: "No scheduled posts to sync" });
    }

    const results = [];
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const post of postsToSync) {
      try {
        const eventPayload = buildCalendarEvent(post);

        // Search for existing event by smo_post_id in extendedProperties
        const searchUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?privateExtendedProperty=${encodeURIComponent(`smo_post_id=${post.id}`)}&maxResults=1`;
        const searchRes = await fetch(searchUrl, { headers });
        const searchData = await searchRes.json();
        const existingEvent = searchData.items?.[0];

        if (existingEvent) {
          const updateRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEvent.id}`,
            { method: "PUT", headers, body: JSON.stringify(eventPayload) }
          );
          if (!updateRes.ok) {
            const err = await updateRes.json();
            throw new Error(`Update: ${err.error?.message || updateRes.statusText}`);
          }
          updated++;
          results.push({ id: post.id, platform: post.platform, action: "updated" });
        } else {
          const createRes = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            { method: "POST", headers, body: JSON.stringify(eventPayload) }
          );
          if (!createRes.ok) {
            const err = await createRes.json();
            throw new Error(`Create: ${err.error?.message || createRes.statusText}`);
          }
          created++;
          results.push({ id: post.id, platform: post.platform, action: "created" });
        }
      } catch (err) {
        errors++;
        results.push({ id: post.id, platform: post.platform, action: "error", error: err.message });
        console.error(`Calendar sync failed for post ${post.id}: ${err.message}`);
      }
    }

    return Response.json({ success: true, created, updated, errors, total: postsToSync.length, results });
  } catch (error) {
    console.error("syncSMOToCalendar error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildCalendarEvent(post) {
  const platformColors = {
    Facebook: "1",
    LinkedIn: "2",
    Instagram: "4",
    Twitter: "11",
    TikTok: "5",
  };

  const scheduledDate = post.scheduled_date || new Date().toISOString().split('T')[0];
  const startDateTime = `${scheduledDate}T09:00:00`;
  const endDateTime = `${scheduledDate}T09:30:00`;

  const contentPreview = (post.content || "").substring(0, 80);
  const fullContent = (post.content || "") +
    (post.hashtags?.length ? "\n\n" + post.hashtags.map(h => `#${h}`).join(" ") : "") +
    (post.cta ? `\n\n${post.cta}` : "");

  const description = [
    `Platform: ${post.platform}`,
    `Campaign: ${post.campaign_name || "N/A"}`,
    `Post Type: ${post.post_type || "promotional"}`,
    `Status: ${post.status}`,
    "",
    "--- Content ---",
    fullContent,
    "",
    `Scheduled Date: ${scheduledDate}`,
  ].join("\n");

  return {
    summary: `📱 ${post.platform}: ${contentPreview}${(post.content || "").length > 80 ? "..." : ""}`,
    description,
    start: { dateTime: startDateTime, timeZone: "UTC" },
    end: { dateTime: endDateTime, timeZone: "UTC" },
    colorId: platformColors[post.platform] || "8",
    extendedProperties: {
      private: {
        smo_post_id: post.id,
        smo_platform: post.platform,
        smo_status: post.status,
      }
    },
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 30 }] },
  };
}