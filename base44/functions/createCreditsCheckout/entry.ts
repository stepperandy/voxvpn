import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const BASE44_PUBLIC_URL = Deno.env.get('BASE44_PUBLIC_URL') || 'https://app.base44.com';

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
  "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf", "isk"
]);

const COUNTRY_CURRENCY = {
  US: "usd", CA: "cad", GB: "gbp", AU: "aud", NZ: "nzd",
  AT: "eur", BE: "eur", CY: "eur", EE: "eur", FI: "eur",
  FR: "eur", DE: "eur", GR: "eur", IE: "eur", IT: "eur",
  LV: "eur", LT: "eur", LU: "eur", MT: "eur", NL: "eur",
  PT: "eur", SK: "eur", SI: "eur", ES: "eur", HR: "eur",
  JP: "jpy", IN: "inr", CN: "cny", BR: "brl", MX: "mxn",
  ZA: "zar", NG: "ngn", GH: "ghs", KE: "kes", EG: "egp",
  SG: "sgd", HK: "hkd", CH: "chf", SE: "sek", NO: "nok",
  DK: "dkk", PL: "pln", CZ: "czk", TR: "try", AE: "aed",
  SA: "sar", TH: "thb", ID: "idr", MY: "myr", PH: "php",
  VN: "vnd", KR: "krw", RU: "rub", UA: "uah", RO: "ron",
  BG: "bgn", HU: "huf", IL: "ils", AR: "ars", CO: "cop",
  PE: "pen", PK: "pkr", BD: "bdt", LK: "lkr", TZ: "tzs",
  MA: "mad", DZ: "dzd", TN: "tnd", CM: "xaf", CI: "xof",
  SN: "xof", BF: "xof", ML: "xof", BJ: "xof", TG: "xof",
  NE: "xof", AO: "aoa", ZM: "zmw", NA: "nad", BW: "bwp",
  MO: "mop", TW: "twd", PG: "pgk", BN: "bnd", KH: "khr",
  LA: "lak", MM: "mmk", NP: "npr", AF: "afn", IQ: "iqd",
  IR: "irr", JO: "jod", KW: "kwd", LB: "lbp", OM: "omr",
  PS: "ils", QA: "qar", YE: "yer", BH: "bhd",
};

const COUNTRY_PAYMENT_METHODS = {
  AT: ["card", "eps", "sepa_debit", "ideal", "sofort"],
  BE: ["card", "bancontact", "sepa_debit", "ideal", "sofort"],
  CY: ["card", "sepa_debit"], EE: ["card", "sepa_debit"],
  FI: ["card", "sepa_debit", "ideal", "sofort"],
  FR: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  DE: ["card", "giropay", "sepa_debit", "ideal", "sofort"],
  GR: ["card", "sepa_debit"], IE: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  IT: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  LV: ["card", "sepa_debit"], LT: ["card", "sepa_debit"],
  LU: ["card", "sepa_debit"], MT: ["card", "sepa_debit"],
  NL: ["card", "ideal", "bancontact", "sepa_debit", "sofort"],
  PT: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  SK: ["card", "sepa_debit"], SI: ["card", "sepa_debit"],
  ES: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  HR: ["card", "sepa_debit"],
  US: ["card", "cashapp", "afterpay_clearpay"],
  CA: ["card", "afterpay_clearpay"],
  GB: ["card", "afterpay_clearpay", "bancontact"],
  AU: ["card", "afterpay_clearpay"], NZ: ["card", "afterpay_clearpay"],
  CN: ["card", "alipay", "wechat_pay"], JP: ["card", "konbini"],
  IN: ["card", "upi"], KR: ["card"], SG: ["card", "grabpay"],
  HK: ["card", "alipay"], TH: ["card", "promptpay"],
  ID: ["card", "qris"], MY: ["card", "fpx"], PH: ["card", "gcash"],
  VN: ["card"], TW: ["card"],
  BR: ["card", "pix", "boleto"], MX: ["card", "oxxo"],
  AR: ["card"], CO: ["card"], PE: ["card"],
  AE: ["card"], SA: ["card", "mada"], IL: ["card"], TR: ["card"],
  ZA: ["card"], NG: ["card"], GH: ["card"], KE: ["card"], EG: ["card"],
};

async function detectCountryAndConvert(usdCents, clientIp) {
  let detectedCountry = "US";
  if (clientIp) {
    try {
      const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData?.country_code && geoData.country_code !== "Undefined") {
          detectedCountry = geoData.country_code;
        }
      } else {
        const fallbackRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=countryCode`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData?.countryCode) {
            detectedCountry = fallbackData.countryCode;
          }
        }
      }
    } catch (e) {
      console.log("[createCreditsCheckout] IP geolocation failed, falling back to USD:", e.message);
    }
  }

  const targetCurrency = (COUNTRY_CURRENCY[detectedCountry] || "usd").toLowerCase();
  let finalAmount = usdCents;
  let finalCurrency = "usd";

  if (targetCurrency !== "usd") {
    try {
      const rateRes = await fetch("https://open.er-api.com/v6/latest/USD");
      const rateData = await rateRes.json();
      const rate = rateData?.rates?.[targetCurrency.toUpperCase()];
      if (rate && rate > 0) {
        const usdDollars = usdCents / 100;
        const converted = usdDollars * rate;
        finalAmount = ZERO_DECIMAL_CURRENCIES.has(targetCurrency) ? Math.round(converted) : Math.round(converted * 100);
        finalCurrency = targetCurrency;
        console.log(`[createCreditsCheckout] Converted ${usdCents}¢ USD → ${finalAmount} ${finalCurrency.toUpperCase()} (rate: ${rate}) for ${detectedCountry}`);
      }
    } catch (e) {
      console.log("[createCreditsCheckout] Exchange rate fetch failed, using USD:", e.message);
    }
  }

  const paymentMethods = COUNTRY_PAYMENT_METHODS[detectedCountry] || ["card"];
  return { detectedCountry, finalCurrency, finalAmount, paymentMethods };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, credits, user_email } = await req.json();

    if (!amount || !credits || !user_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const usdCents = Math.round(amount * 100);
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "";

    const { detectedCountry, finalCurrency, finalAmount, paymentMethods } = await detectCountryAndConvert(usdCents, clientIp);

    // Build payment method types params for Stripe API
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${BASE44_PUBLIC_URL}/Credits?status=success&session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${BASE44_PUBLIC_URL}/BuyCredits`);
    params.append(`line_items[0][price_data][currency]`, finalCurrency);
    params.append(`line_items[0][price_data][product_data][name]`, `${credits} Credits`);
    params.append(`line_items[0][price_data][product_data][description]`, `Account credit purchase - ${credits} credits`);
    params.append(`line_items[0][price_data][unit_amount]`, String(finalAmount));
    params.append(`line_items[0][quantity]`, '1');
    for (const pm of paymentMethods) {
      params.append('payment_method_types[]', pm);
    }
    params.append('metadata[base44_app_id]', Deno.env.get('BASE44_APP_ID') || '');
    params.append('metadata[user_email]', user_email);
    params.append('metadata[credits]', credits.toString());
    params.append('metadata[type]', 'credits');
    params.append('metadata[detected_country]', detectedCountry);
    params.append('metadata[charged_currency]', finalCurrency);
    params.append('metadata[original_usd_cents]', String(usdCents));
    params.append('metadata[charged_amount]', String(finalAmount));

    // Create Stripe checkout session
    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const sessionData = await sessionRes.json();

    if (!sessionRes.ok) {
      console.error('Stripe error:', sessionData);
      return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return Response.json({ url: sessionData.url, currency: finalCurrency, amount: finalAmount, country: detectedCountry });

  } catch (error) {
    console.error('Error creating checkout:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});