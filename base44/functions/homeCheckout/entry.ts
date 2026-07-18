import Stripe from "npm:stripe@17.0.0";

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

const RECURRING_PAYMENT_METHODS = new Set(["card", "sepa_debit", "bancontact", "ideal", "sofort", "bacs_debit", "au_becs_debit"]);

const COUNTRY_PAYMENT_METHODS = {
  AT: ["card", "eps", "sepa_debit", "ideal", "sofort"],
  BE: ["card", "bancontact", "sepa_debit", "ideal", "sofort"],
  DE: ["card", "giropay", "sepa_debit", "ideal", "sofort"],
  FR: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  IE: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  IT: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  NL: ["card", "ideal", "bancontact", "sepa_debit", "sofort"],
  ES: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  PT: ["card", "sepa_debit", "ideal", "bancontact", "sofort"],
  FI: ["card", "sepa_debit", "ideal", "sofort"],
  US: ["card", "cashapp", "afterpay_clearpay"],
  CA: ["card", "afterpay_clearpay"],
  GB: ["card", "afterpay_clearpay", "bancontact"],
  AU: ["card", "afterpay_clearpay"], NZ: ["card", "afterpay_clearpay"],
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
      console.log("[homeCheckout] IP geolocation failed, falling back to USD:", e.message);
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
        console.log(`[homeCheckout] Converted ${usdCents}¢ USD → ${finalAmount} ${finalCurrency.toUpperCase()} (rate: ${rate}) for ${detectedCountry}`);
      }
    } catch (e) {
      console.log("[homeCheckout] Exchange rate fetch failed, using USD:", e.message);
    }
  }

  const allMethods = COUNTRY_PAYMENT_METHODS[detectedCountry] || ["card"];
  const recurringMethods = allMethods.filter(m => RECURRING_PAYMENT_METHODS.has(m));
  return { detectedCountry, finalCurrency, finalAmount, paymentMethods: recurringMethods };
}

Deno.serve(async (req) => {
  try {
    const { cart, total } = await req.json();

    if (!cart || cart.length === 0 || !total) {
      return Response.json({ error: "Invalid cart data" }, { status: 400 });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("[homeCheckout] STRIPE_SECRET_KEY not configured");
      return Response.json({ error: "Payment service not configured" }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey);
    const baseUrl = Deno.env.get("BASE44_PUBLIC_URL") || "https://voxdigits.com";

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "";

    const usdCents = Math.round(total * 100);
    const { detectedCountry, finalCurrency, finalAmount, paymentMethods } = await detectCountryAndConvert(usdCents, clientIp);

    // Create line items from cart with converted currency
    const lineItems = cart.map(item => ({
      price_data: {
        currency: finalCurrency,
        product_data: {
          name: `Virtual Number - ${item.country}`,
          description: `Phone: ${item.phone}`,
        },
        unit_amount: finalAmount,
        recurring: { interval: "month" },
      },
      quantity: 1,
    }));

    console.log(`[homeCheckout] Creating Stripe session for ${cart.length} numbers, total: ${finalAmount} ${finalCurrency.toUpperCase()} (${detectedCountry})`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/?checkout=cancel`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        cart_json: JSON.stringify(cart),
        detected_country: detectedCountry,
        charged_currency: finalCurrency,
        original_usd_cents: String(usdCents),
        charged_amount: String(finalAmount),
      },
    });

    console.log(`[homeCheckout] Session created: ${session.id}`);
    return Response.json({ checkout_url: session.url, currency: finalCurrency, amount: finalAmount, country: detectedCountry });

  } catch (error) {
    console.error("[homeCheckout] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});