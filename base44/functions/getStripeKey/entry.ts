Deno.serve(async (req) => {
  try {
    const publishable_key = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    
    if (!publishable_key) {
      return Response.json({ error: "Stripe key not configured" }, { status: 500 });
    }
    
    return Response.json({ publishable_key });
  } catch (error) {
    console.error("Error retrieving Stripe key:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});