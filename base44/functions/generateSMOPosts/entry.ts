import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    // Fetch active SMO campaigns
    const campaigns = await base44.asServiceRole.entities.SMOCampaign.filter({ status: "active" });

    if (!campaigns || campaigns.length === 0) {
      return Response.json({ success: true, campaigns: 0, generated: 0, message: "No active campaigns found" });
    }

    let totalGenerated = 0;
    const results = [];

    for (const campaign of campaigns) {
      const platforms = campaign.platforms || [];
      if (platforms.length === 0) continue;

      for (const platform of platforms) {
        // Generate post via AI
        const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Generate a social media post for VoxTelefony — a virtual phone number service offering US, UK, Canada, and Australia private numbers plus eSIM data plans for international business and travel.

Campaign: ${campaign.campaign_name}
Platform: ${platform}
Target audience: ${campaign.target_audience || "International business professionals, remote workers, digital nomads, and travelers"}
Strategy notes: ${campaign.notes || ""}

Create ONE compelling ${platform} post that:
- Is optimized for ${platform}'s format, character limits, and audience expectations
- Is engaging, shareable, and professional
- Highlights key benefits: privacy, international reach, no roaming fees, instant activation
- Includes relevant hashtags (${platform === "Instagram" || platform === "TikTok" ? "max 8" : "max 3"})
- Has a clear, compelling call-to-action
- Feels native to ${platform} (not generic)

Also generate a short video prompt (6 seconds) for a promotional video clip that specifically showcases our virtual number plans (US, UK, Canada, Australia numbers). The video should:
- Visually highlight a phone screen showing a local number from one of these countries (e.g. +1, +44, +1-CA, +61)
- Convey privacy, international reach, and instant activation
- Be cinematic, modern, and visually engaging (dynamic motion, clean UI aesthetics, vibrant accents)
- End with a subtle brand moment (logo glow or tagline text)

Return the post content, hashtags array, CTA, post type, an image generation prompt, and a video generation prompt.`,
  response_json_schema: {
    type: "object",
    properties: {
      content: { type: "string" },
      hashtags: { type: "array", items: { type: "string" } },
      cta: { type: "string" },
      post_type: { type: "string" },
      image_prompt: { type: "string" },
      video_prompt: { type: "string" }
    }
  }
        });

        // Spread posts across the week
        const daysOffset = (totalGenerated % 7) + 1;
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + daysOffset);

        await base44.asServiceRole.entities.SMOPost.create({
          campaign_id: campaign.id,
          campaign_name: campaign.campaign_name,
          platform,
          content: llmResult.content,
          hashtags: llmResult.hashtags || [],
          cta: llmResult.cta || "",
          image_prompt: llmResult.image_prompt || "",
          video_prompt: llmResult.video_prompt || "",
          post_type: llmResult.post_type || "promotional",
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          status: "scheduled"
        });

        totalGenerated++;
        results.push({ campaign: campaign.campaign_name, platform, post_type: llmResult.post_type || "promotional" });
      }
    }

    return Response.json({
      success: true,
      campaigns: campaigns.length,
      generated: totalGenerated,
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});