import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

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

const CURRENCY_SYMBOLS = {
  usd: "$", cad: "C$", gbp: "£", aud: "A$", nzd: "NZ$",
  eur: "€", jpy: "¥", inr: "₹", cny: "¥", brl: "R$",
  mxn: "$", zar: "R", ngn: "₦", ghs: "₵", kes: "KSh",
  egp: "E£", sgd: "S$", hkd: "HK$", chf: "Fr", sek: "kr",
  nok: "kr", dkk: "kr", pln: "zł", czk: "Kč", try: "₺",
  aed: "AED", sar: "SAR", thb: "฿", idr: "Rp", myr: "RM",
  php: "₱", vnd: "₫", krw: "₩", rub: "₽", uah: "₴",
  ron: "lei", bgn: "лв", huf: "Ft", ils: "₪", ars: "$",
  cop: "$", pen: "S/", pkr: "₨", bdt: "৳", lkr: "Rs",
  tzs: "TSh", mad: "DH", dzd: "DA", tnd: "DT",
};

// Country → accepted Stripe payment method types
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

const PAYMENT_METHOD_LABELS = {
  card: { name: "Visa / Mastercard", icon: "💳" },
  cashapp: { name: "Cash App", icon: "💵" },
  afterpay_clearpay: { name: "Afterpay / Clearpay", icon: "🛍️" },
  alipay: { name: "Alipay", icon: "🅰️" },
  wechat_pay: { name: "WeChat Pay", icon: "💬" },
  ideal: { name: "iDEAL", icon: "🏦" },
  bancontact: { name: "Bancontact", icon: "💳" },
  sepa_debit: { name: "SEPA Direct Debit", icon: "💶" },
  giropay: { name: "giropay", icon: "🏦" },
  sofort: { name: "Sofort", icon: "🏦" },
  eps: { name: "EPS", icon: "🏦" },
  upi: { name: "UPI", icon: "📱" },
  pix: { name: "Pix", icon: "⚡" },
  boleto: { name: "Boleto", icon: "🧾" },
  oxxo: { name: "OXXO", icon: "🏪" },
  konbini: { name: "Konbini", icon: "🏪" },
  qris: { name: "QRIS", icon: "📱" },
  fpx: { name: "FPX", icon: "🏦" },
  promptpay: { name: "PromptPay", icon: "📱" },
  gcash: { name: "GCash", icon: "📱" },
  grabpay: { name: "GrabPay", icon: "🚕" },
  mada: { name: "Mada", icon: "💳" },
};

// Payment methods that support recurring (subscription) billing
const RECURRING_PAYMENT_METHODS = new Set(["card", "sepa_debit", "bancontact", "ideal", "sofort", "bacs_debit", "au_becs_debit"]);

function getPaymentMethods(country, subscriptionMode) {
  const methods = COUNTRY_PAYMENT_METHODS[country] || ["card"];
  if (subscriptionMode) {
    return methods.filter(m => RECURRING_PAYMENT_METHODS.has(m));
  }
  return methods;
}

// POST body: { amounts: { [key]: usd_cents } }
// Returns: { country, currency, symbol, rates: { [key]: { amount_cents, display } } }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { amounts } = await req.json();

    if (!amounts || typeof amounts !== "object") {
      return Response.json({ error: "amounts object is required" }, { status: 400 });
    }

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
        console.log("[getCurrencyPreview] IP geolocation failed:", e.message);
      }
    }

    const targetCurrency = (COUNTRY_CURRENCY[detectedCountry] || "usd").toLowerCase();
    const symbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency.toUpperCase() + " ";

    let rate = 1;
    if (targetCurrency !== "usd") {
      try {
        const rateRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const rateData = await rateRes.json();
        rate = rateData?.rates?.[targetCurrency.toUpperCase()] || 1;
      } catch (e) {
        console.log("[getCurrencyPreview] Exchange rate fetch failed, using USD:", e.message);
      }
    }

    const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(targetCurrency);
    const rates = {};
    for (const [key, usdCents] of Object.entries(amounts)) {
      if (targetCurrency === "usd" || rate === 1) {
        const dollars = usdCents / 100;
        rates[key] = { amount_cents: usdCents, display: `${symbol}${dollars.toFixed(2)}` };
      } else {
        const usdDollars = usdCents / 100;
        const converted = usdDollars * rate;
        const amountCents = isZeroDecimal ? Math.round(converted) : Math.round(converted * 100);
        const displayDollars = isZeroDecimal ? converted : converted;
        rates[key] = { amount_cents: amountCents, display: `${symbol}${displayDollars.toFixed(isZeroDecimal ? 0 : 2)}` };
      }
    }

    const paymentMethods = getPaymentMethods(detectedCountry, false);
    const paymentMethodLabels = {};
    for (const pm of paymentMethods) {
      if (PAYMENT_METHOD_LABELS[pm]) paymentMethodLabels[pm] = PAYMENT_METHOD_LABELS[pm];
    }

    console.log(`[getCurrencyPreview] Country=${detectedCountry} Currency=${targetCurrency} Rate=${rate} Methods=${paymentMethods.join(",")}`);
    return Response.json({ country: detectedCountry, currency: targetCurrency, symbol, rate, rates, payment_methods: paymentMethods, payment_method_labels: paymentMethodLabels });
  } catch (error) {
    console.error("[getCurrencyPreview] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});