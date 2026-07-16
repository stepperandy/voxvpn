import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { virtualNumber, fromNumber, toNumber, toOwnerId, provider, direction, status, startedAt, endedAt, callSid, recordingUrl } = await req.json();

    if (!virtualNumber || !fromNumber || !toOwnerId || !direction) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate duration
    let durationSeconds = null;
    if (startedAt && endedAt) {
      const start = new Date(startedAt).getTime();
      const end = new Date(endedAt).getTime();
      durationSeconds = Math.round((end - start) / 1000);
    }

    const callLog = await base44.asServiceRole.entities.CallLog.create({
      virtual_number: virtualNumber,
      from_number: fromNumber,
      to_number: toNumber || virtualNumber,
      to_owner_id: toOwnerId,
      provider: provider || 'twilio',
      direction,
      status: status || 'completed',
      started_at: startedAt,
      ended_at: endedAt,
      duration_seconds: durationSeconds,
      call_sid: callSid,
      recording_url: recordingUrl,
    });

    console.log('[logCall] Call logged:', callLog.id);

    // Charge for outbound calls based on duration
    if (direction === 'outbound' && durationSeconds && durationSeconds > 0) {
      try {
        // Look up the virtual number's country for rate
        let vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ number: virtualNumber });
        if (!vnums || vnums.length === 0) {
          vnums = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: virtualNumber });
        }
        const countryCode = (vnums && vnums.length > 0) ? (vnums[0].country_code || 'US') : 'US';

        // Resolve owner email
        let ownerEmail = (vnums && vnums.length > 0) ? (vnums[0].customer_email || '') : '';
        if (!ownerEmail && toOwnerId) {
          const users = await base44.asServiceRole.entities.User.filter({ id: toOwnerId });
          if (users && users.length > 0) ownerEmail = users[0].email || '';
        }

        if (ownerEmail) {
          // Get call rate
          const rateRes = await base44.asServiceRole.functions.invoke('billingEngine', {
            action: 'get_rate',
            user_email: ownerEmail,
            category: 'call',
            call_type: 'outbound',
            country_code: countryCode,
          });
          const callRate = rateRes?.sell_price || 0.03;
          const billedMinutes = Math.ceil(durationSeconds / 60);
          const chargeAmount = Math.round(callRate * billedMinutes * 10000) / 10000;

          if (chargeAmount > 0) {
            await base44.asServiceRole.functions.invoke('billingEngine', {
              action: 'charge',
              user_email: ownerEmail,
              amount: chargeAmount,
              category: 'call',
              description: `Outbound call from ${fromNumber} to ${toNumber || virtualNumber} (${billedMinutes} min)`,
              reference_id: callLog.id,
            });
            console.log(`[logCall] Charged $${chargeAmount} for ${billedMinutes} min call to ${ownerEmail}`);
          }
        }
      } catch (chargeErr) {
        console.error('[logCall] Charge failed:', chargeErr.message);
      }
    }

    return Response.json({ success: true, callLog });
  } catch (error) {
    console.error('[logCall]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});