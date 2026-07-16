import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For development: return a mock token
    // In production, exchange with your backend service
    const mockToken = btoa(JSON.stringify({ 
      email: user.email, 
      user_id: user.id,
      timestamp: Date.now() 
    }));

    return Response.json({ 
      token: mockToken, 
      user: { 
        email: user.email,
        full_name: user.full_name,
        id: user.id
      }
    });
  } catch (error) {
    console.error("[getBackendToken]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});