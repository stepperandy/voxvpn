const DEFAULT_URLS = [
  "/", "/VirtualNumbers", "/Services", "/Pricing", "/Contact", "/AboutUs",
  "/ESimGuide", "/ESimAvailability", "/DeviceCompatibility",
  "/us-virtual-number", "/canada-virtual-number", "/uk-virtual-number", "/australia-virtual-number",
  "/ApplicationForm", "/LaunchCampaign", "/AIAssistant",
  "/Company", "/Careers", "/Press", "/Blog",
  "/Security", "/TransparencyReport", "/ServerStatus", "/GumroadStore",
  "/LegalPolicy", "/privacypolicy", "/termsofservice", "/acceptableusepolicy", "/cookiepolicy", "/refundpolicy"
];

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { urlList, host, urls } = body;

    const indexnowKey = Deno.env.get("INDEXNOW_KEY");
    if (!indexnowKey) {
      return Response.json({ error: "INDEXNOW_KEY not configured" }, { status: 500 });
    }

    // Resolve host: explicit param > voxtelefony.com (published domain)
    const resolvedHost = host || "voxtelefony.com";

    // Resolve URL list: explicit urlList/urls > default sitemap paths
    const rawPaths = urlList || urls || DEFAULT_URLS;
    const fullUrls = rawPaths.map(u => u.startsWith("http") ? u : `https://${resolvedHost}${u.startsWith("/") ? "" : "/"}${u}`);

    const payload = {
      host: resolvedHost,
      key: indexnowKey,
      keyLocation: `https://${resolvedHost}/${indexnowKey}.txt`,
      urlList: fullUrls
    };

    const endpoints = [
      "https://api.indexnow.org/indexnow",
      "https://api.bing.com/indexnow",
      "https://yandex.com/indexnow"
    ];

    let lastError = null;
    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload)
      });
      if (response.ok || response.status === 202 || response.status === 200) {
        return Response.json({ success: true, urlCount: fullUrls.length, endpoint, host: resolvedHost });
      }
      const errorText = await response.text();
      console.error(`IndexNow API error (${endpoint}):`, errorText);
      lastError = { status: response.status, body: errorText, endpoint };
    }

    return Response.json({ error: `IndexNow submission failed: ${lastError?.status}`, details: lastError }, { status: lastError?.status || 500 });
  } catch (error) {
    console.error("submitIndexNow error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});