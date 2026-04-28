import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const event = body.event;
    const entityId = event?.entity_id;
    const eventType = event?.type; // 'create' or 'update'

    // Fetch the subscription record
    const sub = body.data;
    const oldData = body.old_data;

    if (!sub) {
      return Response.json({ ok: false, reason: 'No data' });
    }

    // Determine what happened
    let messageText = null;

    if (eventType === 'create') {
      messageText = `🎉 *New Subscription!*\n• User: ${sub.user_email}\n• Plan: ${sub.plan}\n• Billing: ${sub.billing_cycle}\n• Price: $${sub.price}`;
    } else if (eventType === 'update') {
      const wasActive = oldData?.status === 'active';
      const isCancelled = sub.status === 'cancelled' || sub.status === 'expired';
      if (wasActive && isCancelled) {
        messageText = `❌ *Subscription Cancelled*\n• User: ${sub.user_email}\n• Plan: ${sub.plan}\n• Status: ${sub.status}`;
      } else if (sub.status === 'active' && oldData?.status !== 'active') {
        messageText = `✅ *Subscription Activated*\n• User: ${sub.user_email}\n• Plan: ${sub.plan}`;
      }
    }

    if (!messageText) {
      return Response.json({ ok: true, reason: 'No relevant change' });
    }

    // Get Slack access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('slack');

    // Post to #general (or first available channel)
    // Find a suitable channel
    const channelsRes = await fetch('https://slack.com/api/conversations.list?limit=20&exclude_archived=true&types=public_channel', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const channelsData = await channelsRes.json();
    const channel = channelsData.channels?.find(c => c.name === 'general') || channelsData.channels?.[0];

    if (!channel) {
      return Response.json({ ok: false, reason: 'No Slack channel found' });
    }

    const postRes = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: channel.id, text: messageText }),
    });

    const postData = await postRes.json();
    return Response.json({ ok: postData.ok, channel: channel.name });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});