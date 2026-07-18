import Stripe from "npm:stripe@15.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "POST only" }, { status: 405 });
  }

  try {
    const { customer_email } = await req.json();

    if (!customer_email) {
      return Response.json({ error: "Missing customer_email" }, { status: 400 });
    }

    // Find customer by email
    const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
    
    if (!customers.data.length) {
      return Response.json({ error: "Customer not found" }, { status: 404 });
    }

    const customerId = customers.data[0].id;

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: Deno.env.get("BASE44_PUBLIC_URL") || "https://voxdigits.com/Billing",
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("createCustomerPortal error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});