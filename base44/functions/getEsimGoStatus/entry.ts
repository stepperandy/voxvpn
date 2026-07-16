import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { iccid } = await req.json();

    if (!iccid) {
      return Response.json({ error: "ICCID required" }, { status: 400 });
    }

    const apiKey = Deno.env.get("ESIM_GO_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "ESIM_GO_API_KEY not configured" }, { status: 500 });
    }

    // Get eSIM status from eSIM GO
    const response = await fetch(`https://api.esim-go.com/v2.4/esims/${iccid}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('eSIM GO status fetch error:', response.status);
      return Response.json({ error: "eSIM not found" }, { status: 404 });
    }

    const data = await response.json();
    const esim = data.esim;

    // Update status in database
    const localEsim = await base44.entities.ESim.filter({ iccid: iccid });
    if (localEsim.length > 0) {
      await base44.asServiceRole.entities.ESim.update(localEsim[0].id, {
        status: esim.status || "pending"
      });
    }

    return Response.json({
      success: true,
      esim: esim
    });
  } catch (error) {
    console.error('Error getting eSIM GO status:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});