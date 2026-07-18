import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const verifyRes = await fetch('https://api.stripe.com/v1/webhook_endpoints/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payload': body,
        'sig_header': signature,
        'secret': STRIPE_WEBHOOK_SECRET,
      }),
    });

    // Parse the event
    const event = JSON.parse(body);

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata || {};
      
      // Check if this is a credit purchase
      if (metadata.type === 'credit_purchase' && metadata.user_email && metadata.credits) {
        const userEmail = metadata.user_email;
        const creditsToAdd = parseInt(metadata.credits, 10);
        
        // Find the user
        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        
        if (users && users.length > 0) {
          const user = users[0];
          const currentCredits = user.credits || 0;
          const newBalance = currentCredits + creditsToAdd;
          
          // Update user credits
          await base44.asServiceRole.entities.User.update(user.id, { credits: newBalance });
          
          // Create transaction record
          await base44.asServiceRole.entities.Transaction.create({
            user_email: userEmail,
            type: 'credit',
            category: 'purchase',
            amount: creditsToAdd,
            balance_before: currentCredits,
            balance_after: newBalance,
            description: `Credit purchase - ${creditsToAdd} credits`,
            status: 'completed',
            stripe_session_id: session.id,
          });
          
          console.log(`[creditsWebhook] Added ${creditsToAdd} credits to ${userEmail}. New balance: ${newBalance}`);
        }
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});