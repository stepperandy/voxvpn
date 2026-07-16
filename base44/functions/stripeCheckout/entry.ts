import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.9.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID');

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
      console.log("[stripeCheckout] IP geolocation failed, falling back to USD:", e.message);
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
        console.log(`[stripeCheckout] Converted ${usdCents}¢ USD → ${finalAmount} ${finalCurrency.toUpperCase()} (rate: ${rate}) for ${detectedCountry}`);
      }
    } catch (e) {
      console.log("[stripeCheckout] Exchange rate fetch failed, using USD:", e.message);
    }
  }

  const paymentMethods = COUNTRY_PAYMENT_METHODS[detectedCountry] || ["card"];
  return { detectedCountry, finalCurrency, finalAmount, paymentMethods };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const publishableKey = (Deno.env.get('STRIPE_PUBLISHABLE_KEY') || '').trim();
    
    if (!publishableKey) {
      console.error('STRIPE_PUBLISHABLE_KEY is missing or empty');
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const { type, credits, amount, email, product_id, product_name, product_price, number_country, phone_number, country_code, city, number_type, monthly_fee, provider } = await req.json();

    if (!amount || amount < 100) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "";

    const { detectedCountry, finalCurrency, finalAmount, paymentMethods } = await detectCountryAndConvert(amount, clientIp);

    const publicUrl = (Deno.env.get('BASE44_PUBLIC_URL') || '').trim() || 'https://app.example.com';
    
    let lineItems = [];
    let metadata = {
      base44_app_id: BASE44_APP_ID,
      user_email: email,
      type: type || 'credits',
      detected_country: detectedCountry,
      charged_currency: finalCurrency,
      original_usd_cents: String(amount),
      charged_amount: String(finalAmount),
    };

    if (type === 'esim') {
      if (!product_id || !product_name || !product_price) {
        return Response.json({ error: 'Missing eSIM product details' }, { status: 400 });
      }
      lineItems = [{
        price_data: {
          currency: finalCurrency,
          product_data: {
            name: product_name,
            description: 'eSIM Data Plan'
          },
          unit_amount: finalAmount
        },
        quantity: 1
      }];
      metadata.product_id = product_id;
      metadata.product_name = product_name;
      metadata.product_price = product_price.toString();
    } else if (type === 'number') {
      if (!number_country && !phone_number) {
        return Response.json({ error: 'Missing number details' }, { status: 400 });
      }
      const order = await base44.asServiceRole.entities.NumberOrder.create({
        user_email: email || '',
        phone_number: phone_number || '',
        country_code: country_code || number_country || '',
        city: city || '',
        number_type: number_type || 'local',
        monthly_fee: monthly_fee || (amount / 100),
        provider: provider || 'twilio',
        status: 'pending_payment',
      });
      console.log(`[stripeCheckout] Created NumberOrder ${order.id} for ${phone_number} (${email})`);
      lineItems = [{
        price_data: {
          currency: finalCurrency,
          product_data: {
            name: `Virtual Number - ${number_country || phone_number}`,
            description: 'Virtual phone number with SMS/call support'
          },
          unit_amount: finalAmount
        },
        quantity: 1
      }];
      metadata.number_country = number_country || '';
      metadata.order_id = order.id;
      if (phone_number) metadata.phone_number = phone_number;
    } else {
      if (!credits) {
        return Response.json({ error: 'Invalid credits amount' }, { status: 400 });
      }
      lineItems = [{
        price_data: {
          currency: finalCurrency,
          product_data: {
            name: `${credits} Credits`,
            description: `Account credits for eSIM purchases`
          },
          unit_amount: finalAmount
        },
        quantity: 1
      }];
      metadata.credits = credits.toString();
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      mode: 'payment',
      customer_email: email || undefined,
      success_url: type === 'credits'
        ? `${publicUrl}/Credits?status=success&session_id={CHECKOUT_SESSION_ID}`
        : type === 'number'
          ? `${publicUrl}/ServicesDashboard?status=success&session_id={CHECKOUT_SESSION_ID}`
          : `${publicUrl}/MyESims?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: type === 'credits'
        ? `${publicUrl}/Credits`
        : type === 'number'
          ? `${publicUrl}/VirtualNumbers`
          : `${publicUrl}/MyESims`,
      line_items: lineItems,
      metadata
    });

    console.log(`[stripeCheckout] Created checkout session ${session.id} for ${detectedCountry} (${finalAmount} ${finalCurrency.toUpperCase()})`);

    return Response.json({
      sessionId: session.id,
      publishableKey: publishableKey,
      currency: finalCurrency,
      amount: finalAmount,
      country: detectedCountry,
      status: 'success'
    }, { status: 200 });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
});