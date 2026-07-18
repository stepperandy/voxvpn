import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@16.0.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, payment_method_id } = await req.json();

    if (action === 'create_customer') {
      // Create Stripe customer if not exists
      let customerId = user.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
            email: user.email,
          }
        });
        customerId = customer.id;

        // Save customer ID to user
        await base44.auth.updateMe({
          stripe_customer_id: customerId
        });
      }

      return Response.json({ customer_id: customerId });
    }

    if (action === 'attach_payment_method') {
      if (!payment_method_id) {
        return Response.json({ error: 'payment_method_id required' }, { status: 400 });
      }

      const customerId = user.stripe_customer_id;
      if (!customerId) {
        return Response.json({ error: 'Customer not found' }, { status: 400 });
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(payment_method_id, {
        customer: customerId
      });

      // Set as default
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: payment_method_id
        }
      });

      // Save to user
      await base44.auth.updateMe({
        stripe_payment_method_id: payment_method_id
      });

      return Response.json({ success: true, payment_method_id });
    }

    if (action === 'get_payment_methods') {
      const customerId = user.stripe_customer_id;
      if (!customerId) {
        return Response.json({ payment_methods: [] });
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return Response.json({ payment_methods: paymentMethods.data });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('setupAutoTopup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});