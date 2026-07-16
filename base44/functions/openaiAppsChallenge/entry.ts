/**
 * OpenAI Apps Domain Verification
 * Serves: GET /.well-known/openai-apps-challenge
 *
 * OpenAI fetches this URL to verify domain ownership for ChatGPT plugins,
 * custom GPTs, and Actions integrations.
 *
 * Set the OPENAI_CHALLENGE_TOKEN secret to your actual challenge token
 * provided by OpenAI in your plugin/action configuration.
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  // Retrieve the challenge token from environment secrets
  const token = Deno.env.get("OPENAI_CHALLENGE_TOKEN");

  if (!token) {
    console.warn("[openai-challenge] OPENAI_CHALLENGE_TOKEN secret is not set");
    return new Response("openai-challenge-token-not-configured", {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
      },
    });
  }

  const appId = Deno.env.get("BASE44_APP_ID");
  console.log(`[openai-challenge] App ID: ${appId}`);
  console.log(`[openai-challenge] Full URL: https://${appId}.base44.app/api/openaiAppsChallenge`);
  console.log("[openai-challenge] Serving challenge token");

  return new Response(token, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
});