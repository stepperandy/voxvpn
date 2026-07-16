/**
 * VoxDigits MCP (Model Context Protocol) Server
 * Exposes VoxDigits capabilities as AI-callable tools via JSON-RPC 2.0
 *
 * Endpoint: /mcp
 * Protocol: MCP over HTTP (Streamable HTTP transport)
 *
 * Tools exposed:
 *  - search_numbers        Search available virtual numbers by country/type
 *  - get_pricing           Get pricing for a number, call, or SMS category
 *  - get_esim_plans        List available eSIM data plans
 *  - get_account_balance   Get a user's wallet balance (requires API key)
 *  - send_sms              Send an SMS from a virtual number (requires API key)
 *  - list_virtual_numbers  List virtual numbers owned by a user (requires API key)
 *  - get_call_rates        Get per-minute call rates for a destination country
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SERVER_INFO = {
  name: "voxdigits",
  version: "1.0.0",
  description: "VoxDigits MCP Server — virtual numbers, eSIMs, calling & SMS",
};

const TOOLS = [
  {
    name: "search_numbers",
    description: "Search available virtual phone numbers by country and type. Returns a list of available numbers with pricing.",
    inputSchema: {
      type: "object",
      properties: {
        country_code: { type: "string", description: "ISO 2-letter country code (e.g. US, GB, CA, AU, DE)" },
        number_type: { type: "string", enum: ["local", "toll_free", "mobile", "national"], description: "Type of number", default: "local" },
        area_code: { type: "string", description: "Optional area code filter (e.g. 212 for NYC)" },
      },
      required: ["country_code"],
    },
  },
  {
    name: "get_pricing",
    description: "Get VoxDigits pricing for numbers, calls, or SMS for a given country. Returns buy cost, sell price, and reseller price.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["number_local", "number_tollfree", "number_mobile", "call_outbound", "call_inbound", "sms_outbound", "sms_inbound", "esim_data"],
          description: "Pricing category",
        },
        country_code: { type: "string", description: "ISO 2-letter country code or * for global default" },
      },
      required: ["category", "country_code"],
    },
  },
  {
    name: "get_esim_plans",
    description: "List available eSIM data plans. Returns plans with country, data amount, duration, and price.",
    inputSchema: {
      type: "object",
      properties: {
        country_code: { type: "string", description: "Optional filter by ISO country code" },
      },
    },
  },
  {
    name: "get_call_rates",
    description: "Get per-minute call rates for outbound and inbound calls to/from a country.",
    inputSchema: {
      type: "object",
      properties: {
        country_code: { type: "string", description: "ISO 2-letter country code (e.g. US, GB)" },
      },
      required: ["country_code"],
    },
  },
  {
    name: "get_account_balance",
    description: "Get the wallet balance for a VoxDigits user account. Requires the user's API key.",
    inputSchema: {
      type: "object",
      properties: {
        api_key: { type: "string", description: "VoxDigits account API key (user email:credits format or session token)" },
      },
      required: ["api_key"],
    },
  },
  {
    name: "list_virtual_numbers",
    description: "List all virtual numbers owned by a VoxDigits user. Requires user email.",
    inputSchema: {
      type: "object",
      properties: {
        user_email: { type: "string", description: "Registered VoxDigits user email address" },
      },
      required: ["user_email"],
    },
  },
  {
    name: "send_sms",
    description: "Send an SMS message from a VoxDigits virtual number to any destination.",
    inputSchema: {
      type: "object",
      properties: {
        from_number: { type: "string", description: "VoxDigits virtual number in E.164 format (e.g. +12125551234)" },
        to_number: { type: "string", description: "Destination phone number in E.164 format" },
        message: { type: "string", description: "SMS message body (max 1600 chars)" },
        user_email: { type: "string", description: "Owning user email for billing" },
      },
      required: ["from_number", "to_number", "message", "user_email"],
    },
  },
];

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function handleSearchNumbers(base44, input) {
  const { country_code, number_type = "local", area_code } = input;
  const telnyxKey = Deno.env.get("TELNYX_API_KEY");
  if (!telnyxKey) return { error: "Telnyx not configured" };

  const params = new URLSearchParams({ filter_country_code: country_code, filter_number_type: number_type, page_size: "10" });
  if (area_code) params.append("filter_national_destination_code", area_code);

  const res = await fetch(`https://api.telnyx.com/v2/available_phone_numbers?${params}`, {
    headers: { Authorization: `Bearer ${telnyxKey}` },
  });
  const json = await res.json();
  const numbers = (json.data || []).slice(0, 10).map(n => ({
    phone_number: n.phone_number,
    country: n.country_code,
    type: n.number_type,
    city: n.locality || n.administrative_area || "",
    voice_enabled: n.features?.some(f => f.name === "voice"),
    sms_enabled: n.features?.some(f => f.name === "sms"),
    monthly_fee_usd: null, // resolved from pricing engine
  }));

  // Enrich with pricing
  const priceRes = await base44.asServiceRole.functions.invoke("pricingEngine", {
    action: "lookup", category: `number_${number_type}`, country_code,
  });
  const monthly_fee = priceRes?.sell_price || null;
  return { numbers: numbers.map(n => ({ ...n, monthly_fee_usd: monthly_fee })), count: numbers.length };
}

async function handleGetPricing(base44, input) {
  const { category, country_code } = input;
  const res = await base44.asServiceRole.functions.invoke("pricingEngine", {
    action: "lookup", category, country_code,
  });
  if (!res?.success) return { error: `No pricing found for ${category} / ${country_code}` };
  return {
    category: res.category,
    country_code: res.country_code,
    buy_cost_usd: res.buy_cost,
    sell_price_usd: res.sell_price,
    margin_pct: res.margin,
    activation_fee_usd: res.activation_fee,
    billing_increment_secs: res.billing_increment_secs,
  };
}

async function handleGetEsimPlans(base44, input) {
  const { country_code } = input;
  const filter = country_code ? { country_code, is_active: true } : { is_active: true };
  const plans = await base44.asServiceRole.entities.ESimProduct.filter(filter, "price", 20);
  return {
    plans: (plans || []).map(p => ({
      id: p.product_id,
      name: p.name,
      country: p.country,
      country_code: p.country_code,
      data_gb: p.data_gb,
      duration_days: p.duration_days,
      price_usd: p.price,
    })),
    count: plans?.length || 0,
  };
}

async function handleGetCallRates(base44, input) {
  const { country_code } = input;
  const [outRes, inRes] = await Promise.all([
    base44.asServiceRole.functions.invoke("pricingEngine", { action: "lookup", category: "call_outbound", country_code }),
    base44.asServiceRole.functions.invoke("pricingEngine", { action: "lookup", category: "call_inbound", country_code }),
  ]);
  return {
    country_code,
    outbound_per_min_usd: outRes?.sell_price || null,
    inbound_per_min_usd: inRes?.sell_price || null,
    billing_increment_secs: outRes?.billing_increment_secs || 6,
    note: "Rates are billed in 6-second increments",
  };
}

async function handleGetAccountBalance(base44, input) {
  const { api_key } = input;
  // api_key = user email for simplicity (extend with real API key auth as needed)
  const users = await base44.asServiceRole.entities.User.filter({ email: api_key });
  if (!users?.[0]) return { error: "User not found. Pass your registered email as api_key." };
  return { email: users[0].email, balance_usd: users[0].credits || 0 };
}

async function handleListVirtualNumbers(base44, input) {
  const { user_email } = input;
  const numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ customer_email: user_email }, "-created_date", 50);
  return {
    numbers: (numbers || []).map(n => ({
      phone_number: n.phone_number,
      country: n.country_code,
      type: n.number_type,
      status: n.status,
      sms_enabled: n.sms_enabled,
      voice_enabled: n.voice_enabled,
      renewal_date: n.renewal_date,
    })),
    count: numbers?.length || 0,
  };
}

async function handleSendSms(base44, input) {
  const { from_number, to_number, message, user_email } = input;
  const telnyxKey = Deno.env.get("TELNYX_API_KEY");
  if (!telnyxKey) return { error: "Telnyx not configured" };

  // Verify ownership
  const numbers = await base44.asServiceRole.entities.VirtualNumber.filter({ phone_number: from_number });
  if (!numbers?.[0] || numbers[0].customer_email !== user_email) {
    return { error: "Number not found or not owned by this user" };
  }

  const res = await fetch("https://api.telnyx.com/v2/messages", {
    method: "POST",
    headers: { Authorization: `Bearer ${telnyxKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: from_number, to: to_number, text: message }),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.errors?.[0]?.detail || "Failed to send SMS" };

  return { success: true, message_id: json.data?.id, status: json.data?.to?.[0]?.status };
}

// ── JSON-RPC dispatcher ───────────────────────────────────────────────────────

async function dispatch(base44, method, params) {
  switch (method) {
    case "initialize":
      return { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: SERVER_INFO };

    case "notifications/initialized":
      return null; // no response needed

    case "tools/list":
      return { tools: TOOLS };

    case "tools/call": {
      const { name, arguments: args = {} } = params;
      console.log(`[mcp] tool call: ${name}`, JSON.stringify(args));
      let result;
      try {
        switch (name) {
          case "search_numbers":       result = await handleSearchNumbers(base44, args); break;
          case "get_pricing":          result = await handleGetPricing(base44, args); break;
          case "get_esim_plans":       result = await handleGetEsimPlans(base44, args); break;
          case "get_call_rates":       result = await handleGetCallRates(base44, args); break;
          case "get_account_balance":  result = await handleGetAccountBalance(base44, args); break;
          case "list_virtual_numbers": result = await handleListVirtualNumbers(base44, args); break;
          case "send_sms":             result = await handleSendSms(base44, args); break;
          default:                     return { error: { code: -32601, message: `Unknown tool: ${name}` } };
        }
        const isError = !!result?.error;
        return {
          content: [{ type: "text", text: isError ? result.error : JSON.stringify(result, null, 2) }],
          isError,
        };
      } catch (err) {
        console.error(`[mcp] tool error: ${name}`, err.message);
        return { content: [{ type: "text", text: err.message }], isError: true };
      }
    }

    default:
      return { error: { code: -32601, message: `Method not found: ${method}` } };
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // GET — server info / discovery
  if (req.method === "GET") {
    return Response.json({
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      description: SERVER_INFO.description,
      protocol: "MCP 2024-11-05",
      transport: "Streamable HTTP",
      tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
      endpoint: req.url,
      docs: "https://voxdigits.com",
    }, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Handle batch requests
    if (Array.isArray(body)) {
      const responses = await Promise.all(
        body.map(async (msg) => {
          if (!msg.id) return null; // notifications — no response
          const result = await dispatch(base44, msg.method, msg.params || {});
          if (result === null) return null;
          if (result?.error) return { jsonrpc: "2.0", id: msg.id, error: result.error };
          return { jsonrpc: "2.0", id: msg.id, result };
        })
      );
      return Response.json(responses.filter(Boolean), { headers: corsHeaders });
    }

    // Single request
    const { id, method, params = {} } = body;
    if (!method) return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid request" } }, { status: 400, headers: corsHeaders });

    const result = await dispatch(base44, method, params);
    if (result === null) return new Response(null, { status: 202, headers: corsHeaders });

    if (result?.error && !id) return Response.json({ jsonrpc: "2.0", id: null, error: result.error }, { status: 400, headers: corsHeaders });
    if (result?.error) return Response.json({ jsonrpc: "2.0", id, error: result.error }, { headers: corsHeaders });
    return Response.json({ jsonrpc: "2.0", id, result }, { headers: corsHeaders });

  } catch (err) {
    console.error("[mcp] Fatal error:", err.message);
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error", data: err.message } }, { status: 400, headers: corsHeaders });
  }
});