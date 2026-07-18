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

const SETUP_FEE_USD_CENTS = 199;
const WALLET_CREDIT_USD_CENTS = 1000;

function convertUsdCents(usdCents, rate, targetCurrency) {
  if (targetCurrency === "usd" || !rate) return { amount: usdCents, currency: "usd" };
  const usdDollars = usdCents / 100;
  const converted = usdDollars * rate;
  const amount = ZERO_DECIMAL_CURRENCIES.has(targetCurrency)
    ? Math.round(converted)
    : Math.round(converted * 100);
  return { amount, currency: targetCurrency };
}

Deno.serve(async (req) => {
  try {
    const { price_id, success_url, cancel_url, phone_number, country_code, include_setup_fee } = await req.json();

    if (!price_id) {
      return Response.json({ error: "price_id is required" }, { status: 400 });
    }

    // Fetch the original Stripe price to get USD amount and product info
    const price = await stripe.prices.retrieve(price_id, { expand: ["product"] });
    const usdAmountCents = price.unit_amount;
    const productName = price.product?.name || "Virtual Number Subscription";
    const interval = price.recurring?.interval || "month";

    // Detect user's location from IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "";

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
        console.log("[createCheckout] IP geolocation failed, falling back to USD:", e.message);
      }
    }

    const targetCurrency = (COUNTRY_CURRENCY[detectedCountry] || "usd").toLowerCase();

    // Fetch exchange rate (always, so setup fee can use it too)
    let rate = null;
    if (targetCurrency !== "usd") {
      try {
        const rateRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const rateData = await rateRes.json();
        rate = rateData?.rates?.[targetCurrency.toUpperCase()] || null;
      } catch (e) {
        console.log("[createCheckout] Exchange rate fetch failed, using USD:", e.message);
      }
    }

    const subConverted = convertUsdCents(usdAmountCents, rate, targetCurrency);
    const finalAmount = subConverted.amount;
    const finalCurrency = subConverted.currency;

    console.log(`[createCheckout] Converted ${usdAmountCents}¢ USD → ${finalAmount} ${finalCurrency.toUpperCase()} (rate: ${rate || "n/a"}) for ${detectedCountry}`);

    const origin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/") || "https://voxdigits.base44.app";

    // Determine accepted payment methods for detected country (subscription-capable only)
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
    const allMethods = COUNTRY_PAYMENT_METHODS[detectedCountry] || ["card"];
    const recurringMethods = allMethods.filter(m => RECURRING_PAYMENT_METHODS.has(m));

    // Build line items: subscription + optional setup fee
    const lineItems = [{
      price_data: {
        currency: finalCurrency,
        product_data: { name: productName },
        unit_amount: finalAmount,
        recurring: { interval },
      },
      quantity: 1,
    }];

    if (include_setup_fee !== false) {
      const feeConverted = convertUsdCents(SETUP_FEE_USD_CENTS, rate, targetCurrency);
      lineItems.push({
        price_data: {
          currency: feeConverted.currency,
          product_data: { name: "Setup Fee" },
          unit_amount: feeConverted.amount,
        },
        quantity: 1,
      });
      console.log(`[createCheckout] Setup fee: ${feeConverted.amount} ${feeConverted.currency.toUpperCase()}`);
    }

    // Mandatory $10 calling/SMS wallet credit
    const walletConverted = convertUsdCents(WALLET_CREDIT_USD_CENTS, rate, targetCurrency);
    lineItems.push({
      price_data: {
        currency: walletConverted.currency,
        product_data: { name: "Calling & SMS Credit" },
        unit_amount: walletConverted.amount,
      },
      quantity: 1,
    });
    console.log(`[createCheckout] Wallet credit: ${walletConverted.amount} ${walletConverted.currency.toUpperCase()}`);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: recurringMethods,
      line_items: lineItems,
      success_url: success_url || `${origin}/?checkout=success`,
      cancel_url: cancel_url || `${origin}/?checkout=cancel`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        phone_number: phone_number || "",
        country_code: country_code || "",
        original_price_id: price_id,
        detected_country: detectedCountry,
        charged_currency: finalCurrency,
        original_usd_cents: String(usdAmountCents),
        charged_amount: String(finalAmount),
        setup_fee_included: include_setup_fee !== false ? "true" : "false",
        wallet_credit: "10",
      },
    });

    console.log(`[createCheckout] Session ${session.id} created: ${finalAmount} ${finalCurrency.toUpperCase()} for ${detectedCountry}`);
    return Response.json({ url: session.url, currency: finalCurrency, amount: finalAmount, country: detectedCountry });
  } catch (error) {
    console.error("[createCheckout] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});