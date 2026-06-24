import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { full_name, email, password } = body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return Response.json({ error: 'Password must contain uppercase, lowercase, and numbers' }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Register user with email + password so the SAME credentials work on:
    // - Website (web dashboard)
    // - Electron desktop app
    // - Any future app surface
    try {
      await base44.auth.register({ email, password });
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
        return Response.json({ error: 'Email already registered' }, { status: 409 });
      }
      throw err;
    }

    // Update the user's full_name and mark as verified via service role
    // Google Play review account gets admin privileges automatically
    const isPlayReview = email.toLowerCase() === 'playreview@voxvpn.net';
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          full_name,
          is_verified: true,
          ...(isPlayReview && { role: 'admin' }),
        });
      }
    } catch {
      // Non-fatal — full_name/verification update is best-effort
    }

    // Play review account gets an active Enterprise subscription, no payment required
    if (isPlayReview) {
      await base44.asServiceRole.entities.VPNSubscription.create({
        user_email: email,
        plan: 'Enterprise',
        status: 'active',
        billing_cycle: 'yearly',
        start_date: new Date().toISOString(),
        renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        max_devices: 10,
        price: 0,
        notes: 'Google Play review account — admin access, no payment required.',
      });

      return Response.json({
        success: true,
        message: 'Review account created with admin privileges',
        user: { email, full_name, role: 'admin' },
        redirect: '/auth-login',
      });
    }

    // No auto-trial subscription — users must purchase a plan before they can log in.
    // authLogin enforces an active/trial subscription check, so without a subscription
    // record, new signups are blocked from accessing the app until they pay.

    // Send welcome email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: '🎉 Welcome to VoxVPN',
      body: `Hi ${full_name},\n\nYour VoxVPN account has been created successfully!\n\nUse these same credentials to log in on:\n- Web Dashboard: ${Deno.env.get('APP_URL') || 'https://voxvpn.net'}/dashboard\n- VoxVPN Desktop App (Windows/macOS/Linux)\n- VoxVPN Mobile App\n\nEmail: ${email}\n\nNext step: Choose a subscription plan to activate your VPN access.\n\nStay safe,\nThe VoxVPN Team`,
    });

    return Response.json({
      success: true,
      message: 'Account created successfully',
      user: { email, full_name },
      redirect: '/pricing?new=1',
    });

  } catch (error) {
    console.error('Email signup error:', error.message);
    return Response.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
});