import Stripe from "npm:stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// Currencies with zero decimal places (no "cents" equivalent)
const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
  "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf", "isk"
]);

// Map ISO country codes to supported Stripe currencies
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

// Shared helper: detect country from IP, convert USD amount to local currency
async function convertToLocalCurrency(usdCents, clientIp) {
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
      console.log("[airaloStripeCheckout] IP geolocation failed, falling back to USD:", e.message);
    }
  }

  const targetCurrency = (COUNTRY_CURRENCY[detectedCountry] || "usd").toLowerCase();
  let finalAmount = usdCents;
  let finalCurrency = "usd";
  let rate = 1;

  if (targetCurrency !== "usd") {
    try {
      const rateRes = await fetch("https://open.er-api.com/v6/latest/USD");
      const rateData = await rateRes.json();
      rate = rateData?.rates?.[targetCurrency.toUpperCase()];
      if (rate && rate > 0) {
        const usdDollars = usdCents / 100;
        const converted = usdDollars * rate;
        if (ZERO_DECIMAL_CURRENCIES.has(targetCurrency)) {
          finalAmount = Math.round(converted);
        } else {
          finalAmount = Math.round(converted * 100);
        }
        finalCurrency = targetCurrency;
        console.log(`[airaloStripeCheckout] Converted ${usdCents}¢ USD → ${finalAmount} ${finalCurrency.toUpperCase()} (rate: ${rate}) for ${detectedCountry}`);
      }
    } catch (e) {
      console.log("[airaloStripeCheckout] Exchange rate fetch failed, using USD:", e.message);
    }
  }

  return { detectedCountry, finalCurrency, finalAmount, rate };
}

// POST body: { package_id, product_name, amount_cents, user_email, success_url, cancel_url }
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { package_id, product_name, amount_cents, user_email, success_url, cancel_url } = body;

    if (!package_id || !amount_cents) {
      return Response.json({ error: "package_id and amount_cents are required" }, { status: 400 });
    }

    const appUrl = Deno.env.get("BASE44_PUBLIC_URL") || "https://voxdigits.base44.app";

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "";

    const { detectedCountry, finalCurrency, finalAmount } = await convertToLocalCurrency(amount_cents, clientIp);

    // Determine accepted payment methods for detected country
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
    const paymentMethodTypes = COUNTRY_PAYMENT_METHODS[detectedCountry] || ["card"];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: finalCurrency,
            unit_amount: finalAmount,
            product_data: {
              name: product_name || `eSIM Package`,
              description: `eSIM Data Plan — Package ID: ${package_id}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user_email || undefined,
      success_url: success_url || `${appUrl}/MyESims?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: cancel_url || `${appUrl}/ESimStore?status=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        package_id: String(package_id),
        product_name: product_name || "",
        user_email: user_email || "",
        type: "esim_airalo",
        detected_country: detectedCountry,
        charged_currency: finalCurrency,
        original_usd_cents: String(amount_cents),
        charged_amount: String(finalAmount),
      },
    });

    console.log(`[airaloStripeCheckout] Session created: ${session.id} for package ${package_id}`);

    return Response.json({
      sessionId: session.id,
      url: session.url,
      publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY"),
      currency: finalCurrency,
      amount: finalAmount,
      country: detectedCountry,
    });

  } catch (error) {
    console.error("[airaloStripeCheckout] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});