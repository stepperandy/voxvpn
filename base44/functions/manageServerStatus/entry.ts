import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * manageServerStatus — update server status, load, or capacity
 * Body: { server_id, status?, current_load?, max_connections?, active_connections? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { server_id, status, current_load, max_connections, active_connections } = body;

    if (!server_id) {
      return Response.json({ error: 'server_id required' }, { status: 400 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (current_load !== undefined) updateData.current_load = current_load;
    if (max_connections !== undefined) updateData.max_connections = max_connections;
    if (active_connections !== undefined) updateData.active_connections = active_connections;

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    const server = await base44.asServiceRole.entities.VPNServer.update(server_id, updateData);

    return Response.json({
      success: true,
      message: `Server ${server.city} updated`,
      server: {
        id: server.id,
        city: server.city,
        status: server.status,
        current_load: server.current_load,
        active_connections: server.active_connections,
        max_connections: server.max_connections,
      },
    });
  } catch (error) {
    console.error('manageServerStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});