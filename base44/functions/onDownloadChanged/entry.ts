import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { type } = body.event || {};
    const download = body.data;

    if (!download || !download.is_active) {
      return Response.json({ skipped: true });
    }

    const platform = download.platform || 'App';
    const version = download.version ? `v${download.version}` : '';
    const isNew = type === 'create';

    const title = isNew
      ? `New ${platform} App Available${version ? ' — ' + version : ''}`
      : `${platform} App Updated${version ? ' — ' + version : ''}`;

    const message = isNew
      ? `VoxVPN for ${platform} ${version} is now available. Head to your dashboard to download the latest release.`
      : `VoxVPN for ${platform} has been updated to ${version || 'the latest version'}. Download it now from your dashboard.`;

    await base44.asServiceRole.entities.AppNotification.create({
      title,
      message,
      type: 'update',
      platform,
      version: download.version || '',
      is_active: true,
      download_id: download.id || '',
    });

    return Response.json({ success: true, title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});