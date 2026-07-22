import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const today = new Date().toISOString().split('T')[0];

    // If post_id is provided, publish just that post; otherwise publish all scheduled posts due today
    let postsToPublish;
    if (body.post_id) {
      postsToPublish = await base44.asServiceRole.entities.SMOPost.filter({ id: body.post_id });
    } else {
      postsToPublish = await base44.asServiceRole.entities.SMOPost.filter({ status: "scheduled" });
      postsToPublish = postsToPublish.filter(p => !p.scheduled_date || p.scheduled_date <= today);
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      return Response.json({ success: true, published: 0, message: "No posts to publish" });
    }

    const results = [];
    let published = 0;

    for (const post of postsToPublish) {
      try {
        const fullContent = post.content + 
          (post.hashtags?.length ? "\n\n" + post.hashtags.map(h => `#${h}`).join(" ") : "") +
          (post.cta ? `\n\n${post.cta}` : "");

        // Generate video if the post has a video prompt but no video URL yet
        let videoUrl = post.video_url || "";
        if (!videoUrl && post.video_prompt) {
          try {
            const videoResult = await base44.asServiceRole.integrations.Core.GenerateVideo({
              prompt: post.video_prompt,
              duration: 6,
              aspect_ratio: post.platform === "Instagram" ? "9:16" : "16:9"
            });
            videoUrl = videoResult.url;
            await base44.asServiceRole.entities.SMOPost.update(post.id, { video_url: videoUrl });
          } catch (vidErr) {
            // Video generation failed — fall back to text/image-only post
            console.error(`Video generation failed for post ${post.id}: ${vidErr.message}`);
          }
        }

        const triggerSource = body.post_id ? "manual" : "bulk";
        let platformNote = "";

        if (post.platform === "Facebook") {
          platformNote = videoUrl
            ? await postVideoToFacebook(base44, videoUrl, fullContent)
            : await postToFacebook(base44, fullContent);
        } else if (post.platform === "LinkedIn") {
          platformNote = await postToLinkedIn(base44, fullContent);
        } else if (post.platform === "Instagram") {
          platformNote = videoUrl
            ? await postReelToInstagram(base44, videoUrl, fullContent)
            : await postToInstagram(base44, post, fullContent);
        } else {
          await base44.asServiceRole.entities.SMOSendLog.create({
            post_id: post.id,
            post_content_snapshot: fullContent.slice(0, 5000),
            platform: post.platform,
            campaign_name: post.campaign_name || "",
            status: "skipped",
            error_message: "Platform not supported for auto-posting",
            sent_at: new Date().toISOString(),
            sent_by: user.email || "system",
            trigger_source: triggerSource,
          });
          results.push({ id: post.id, platform: post.platform, status: "skipped", reason: "Platform not supported for auto-posting" });
          continue;
        }

        published++;
        await base44.asServiceRole.entities.SMOPost.update(post.id, {
          status: "posted",
          notes: `[Published ${new Date().toISOString()}] ${platformNote}`
        });

        await base44.asServiceRole.entities.SMOSendLog.create({
          post_id: post.id,
          post_content_snapshot: fullContent.slice(0, 5000),
          platform: post.platform,
          campaign_name: post.campaign_name || "",
          status: "posted",
          platform_response: platformNote,
          video_used: !!videoUrl,
          video_url: videoUrl || "",
          sent_at: new Date().toISOString(),
          sent_by: user.email || "system",
          trigger_source: triggerSource,
        });

        results.push({ id: post.id, platform: post.platform, status: "posted", detail: platformNote, video: !!videoUrl });
      } catch (err) {
        await base44.asServiceRole.entities.SMOSendLog.create({
          post_id: post.id,
          post_content_snapshot: (post.content || "").slice(0, 5000),
          platform: post.platform,
          campaign_name: post.campaign_name || "",
          status: "failed",
          error_message: err.message,
          sent_at: new Date().toISOString(),
          sent_by: user.email || "system",
          trigger_source: body.post_id ? "manual" : "bulk",
        });
        results.push({ id: post.id, platform: post.platform, status: "failed", error: err.message });
      }
    }

    return Response.json({ success: true, published, total: postsToPublish.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ── Facebook Pages (text post) ──
async function postToFacebook(base44, content) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("facebook_pages");

  const pagesRes = await fetch(`https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error("No Facebook Pages found. Make your page is published and you have admin access.");
  }
  const page = pagesData.data[0];

  const postRes = await fetch(`https://graph.facebook.com/v25.0/${page.id}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: content, access_token: page.access_token })
  });
  const postData = await postRes.json();
  if (postData.error) throw new Error(`Facebook: ${postData.error.message}`);

  return `Facebook Page "${page.name}" — post ID: ${postData.id}`;
}

// ── Facebook Pages (video post) ──
async function postVideoToFacebook(base44, videoUrl, description) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("facebook_pages");

  const pagesRes = await fetch(`https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error("No Facebook Pages found for video upload.");
  }
  const page = pagesData.data[0];

  const postRes = await fetch(`https://graph.facebook.com/v25.0/${page.id}/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_url: videoUrl,
      description: description,
      access_token: page.access_token
    })
  });
  const postData = await postRes.json();
  if (postData.error) throw new Error(`Facebook video: ${postData.error.message}`);

  return `Facebook Page "${page.name}" — video ID: ${postData.id}`;
}

// ── LinkedIn ──
async function postToLinkedIn(base44, content) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("linkedin");

  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const profile = await profileRes.json();
  if (!profile.sub) throw new Error("Could not get LinkedIn user ID");

  const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify({
      author: `urn:li:person:${profile.sub}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE"
        }
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    })
  });
  const postData = await postRes.json();
  if (postData.status >= 400 || postData.message) throw new Error(`LinkedIn: ${postData.message || "Post failed"}`);

  return `LinkedIn — post ID: ${postData.id || "published"}`;
}

// ── Instagram Business (image post) ──
async function postToInstagram(base44, post, content) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("instagram");

  const meRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
  const me = await meRes.json();
  if (!me.id) throw new Error("Could not get Instagram user ID");

  let imageUrl = "";
  const existingUrlMatch = post.notes?.match(/\[Image URL: (https?:\/\/[^\]]+)\]/);
  if (existingUrlMatch) {
    imageUrl = existingUrlMatch[1];
  } else if (post.image_prompt) {
    const genResult = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: post.image_prompt });
    imageUrl = genResult.url;
  } else {
    throw new Error("Instagram posts require an image. Add an image prompt to this post.");
  }

  const containerRes = await fetch(`https://graph.instagram.com/v21.0/${me.id}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: content,
      access_token: accessToken
    })
  });
  const container = await containerRes.json();
  if (container.error) throw new Error(`Instagram container: ${container.error.message}`);

  const publishRes = await fetch(`https://graph.instagram.com/v21.0/${me.id}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: container.id,
      access_token: accessToken
    })
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`Instagram publish: ${publishData.error.message}`);

  return `Instagram (@${me.username}) — media ID: ${publishData.id}`;
}

// ── Instagram Business (Reels video post) ──
async function postReelToInstagram(base44, videoUrl, content) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("instagram");

  const meRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
  const me = await meRes.json();
  if (!me.id) throw new Error("Could not get Instagram user ID");

  // Create Reels container
  const containerRes = await fetch(`https://graph.instagram.com/v21.0/${me.id}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: "REELS",
      video_url: videoUrl,
      caption: content,
      access_token: accessToken
    })
  });
  const container = await containerRes.json();
  if (container.error) throw new Error(`Instagram Reels container: ${container.error.message}`);

  // Wait for video processing (Instagram requires the container to be ready before publishing)
  await new Promise(resolve => setTimeout(resolve, 15000));

  const publishRes = await fetch(`https://graph.instagram.com/v21.0/${me.id}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: container.id,
      access_token: accessToken
    })
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`Instagram Reels publish: ${publishData.error.message}`);

  return `Instagram (@${me.username}) — Reels ID: ${publishData.id}`;
}