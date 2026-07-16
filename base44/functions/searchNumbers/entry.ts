// Search available phone numbers via Twilio
// Body: { country_code, area_code, features, limit }

const COUNTRY_MONTHLY_FEES = {
  US: 6.99,
  CA: 7.99,
  GB: 8.99,
  AU: 9.99,
};

async function searchTwilio(country_code, area_code, limit, number_type) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  if (!accountSid || !authToken) return null;

  const auth = btoa(`${accountSid}:${authToken}`);
  const country = country_code.toUpperCase();

  // Twilio number types: Local, TollFree, Mobile, National
  const typeMap = { local: 'Local', toll_free: 'TollFree', mobile: 'Mobile', national: 'National' };
  const numberType = typeMap[number_type] || 'Local';
  const params = new URLSearchParams();
  params.set('PageSize', String(limit));
  params.set('VoiceEnabled', 'true');
  params.set('SmsEnabled', 'true');
  if (area_code?.trim()) params.set('AreaCode', area_code.trim());

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${country}/${numberType}.json?${params}`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Basic ${auth}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.warn('[searchNumbers] Twilio error:', JSON.stringify(err));
    return null;
  }

  const data = await res.json();
  const monthly_fee = COUNTRY_MONTHLY_FEES[country] ?? 6.99;

  return (data.available_phone_numbers || []).map(item => ({
    id: item.phone_number,
    phone_number: item.phone_number,
    country_iso: country,
    city: item.locality || item.region || '',
    type: 'local',
    prefix: item.phone_number?.slice(-10, -7) || '',
    monthly_fee,
    setup_fee: 0,
    voice_enabled: item.capabilities?.voice || false,
    sms_enabled: item.capabilities?.sms || false,
    mms_enabled: item.capabilities?.mms || false,
    provider: 'twilio',
  }));
}

Deno.serve(async (req) => {
  try {
    const { country_code = 'US', area_code, limit = 12, number_type } = await req.json();

    console.log(`[searchNumbers] Searching Twilio for ${country_code} (${number_type || 'local'})...`);
    const results = await searchTwilio(country_code, area_code, limit, number_type).catch(e => {
      console.warn('[searchNumbers] Twilio threw:', e.message);
      return null;
    });

    if (results && results.length > 0) {
      console.log(`[searchNumbers] Twilio returned ${results.length} numbers`);
      return Response.json({ success: true, data: results, provider: 'twilio' });
    }

    console.warn('[searchNumbers] Twilio returned no results');
    return Response.json({ success: true, data: [], provider: 'twilio' });

  } catch (error) {
    console.error('[searchNumbers] Error:', error.message);
    return Response.json({ success: false, message: 'Failed to search numbers', error: error.message }, { status: 500 });
  }
});