import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { esim_id } = await req.json();
  if (!esim_id) return Response.json({ error: 'Missing esim_id' }, { status: 400 });

  // Fetch eSIM record
  const esims = await base44.entities.ESim.filter({ id: esim_id, user_email: user.email });
  if (!esims || esims.length === 0) {
    return Response.json({ error: 'eSIM not found' }, { status: 404 });
  }
  const esim = esims[0];

  // Get Airalo token
  const tokenRes = await fetch("https://partners-api.airalo.com/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      client_id: Deno.env.get("AIRALO_CLIENT_ID"),
      client_secret: Deno.env.get("AIRALO_CLIENT_SECRET"),
      grant_type: "client_credentials",
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) return Response.json({ error: 'Airalo auth failed' }, { status: 500 });
  const airaloToken = tokenData.data?.access_token;

  // Try fetching SIM details by ICCID
  const simRes = await fetch(`https://partners-api.airalo.com/v2/sims/${esim.iccid}`, {
    headers: { Authorization: `Bearer ${airaloToken}`, Accept: "application/json" },
  });
  const simData = await simRes.json();
  console.log("[getEsimQrCode] SIM data:", JSON.stringify(simData));

  const sim = simData.data;
  if (!sim) return Response.json({ error: 'SIM not found in Airalo' }, { status: 404 });

  // Build LPA string
  const smdpAddress = sim.smdp_address || sim.lpa || "";
  const matchingId = sim.matching_id || sim.ac || "";
  let lpaString = "";
  if (smdpAddress && matchingId) {
    lpaString = `LPA:1$${smdpAddress}$${matchingId}`;
  } else if (smdpAddress && smdpAddress.startsWith("LPA:")) {
    lpaString = smdpAddress;
  } else if (sim.qrcode && sim.qrcode.startsWith("LPA:")) {
    lpaString = sim.qrcode;
  } else {
    lpaString = sim.qrcode || smdpAddress || "";
  }
  console.log("[getEsimQrCode] LPA built:", lpaString, "from:", { smdpAddress, matchingId, qrcode: sim.qrcode });

  // Update the record if we got a better LPA string
  if (lpaString && lpaString !== esim.qr_code) {
    await base44.entities.ESim.update(esim.id, { qr_code: lpaString });
    console.log("[getEsimQrCode] Updated ESim record with new LPA:", lpaString);
  }

  return Response.json({ 
    success: true, 
    qr_code: lpaString,
    iccid: esim.iccid,
    raw_sim: sim,
  });
});