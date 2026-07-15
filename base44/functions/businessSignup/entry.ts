import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { full_name, email, password, company_name, team_size, plan, contact_phone } = body;

    // Validate required fields
    if (!full_name || !email || !password || !company_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return Response.json({ error: 'Password must contain uppercase, lowercase, and numbers' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 1. Register the user account (same credentials work everywhere)
    try {
      await base44.auth.register({ email, password });
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
        return Response.json({ error: 'Email already registered' }, { status: 409 });
      }
      throw err;
    }

    // 2. Create the business as a Client entity
    const maxUsers = parseInt(team_size) || 10;
    const client = await base44.asServiceRole.entities.Client.create({
      name: company_name,
      vpn_plan: plan || 'standard',
      max_users: maxUsers,
      max_devices: maxUsers * 2,
      status: 'trial',
      contact_email: email,
      contact_phone: contact_phone || null,
      dns_filter_config: {
        block_malware: true,
        block_phishing: true,
        block_adult: false,
        block_gambling: false,
        block_social_media: false,
        block_streaming: false,
        custom_blocklist: [],
        custom_allowlist: [],
      },
    });

    // 3. Update the user: role=client_admin, link to client, set full_name
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, {
        full_name,
        role: 'client_admin',
        client_id: client.id,
        is_active: true,
        phone: contact_phone || null,
        job_title: 'Business Owner',
        last_login: new Date().toISOString(),
      });
    }

    // 4. Send welcome email
    const appUrl = Deno.env.get('APP_URL') || 'https://voxvpn.net';
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: '🛡️ Welcome to VoxShield Business',
      body: `Hi ${full_name},\n\nYour VoxShield Business account has been created!\n\nCompany: ${company_name}\nTeam Size: ${maxUsers} users\nPlan: ${plan || 'Standard'}\n\nNext steps:\n1. Choose a subscription plan to activate your team's VPN + security access\n2. Access your team dashboard: ${appUrl}/business/dashboard\n3. Invite team members and deploy the VoxShield Agent with built-in Vox Antivirus\n\nYour login works everywhere — web dashboard, desktop app, and mobile.\n\nStay secure,\nThe VoxShield Team`,
    });

    return Response.json({
      success: true,
      message: 'Business account created successfully',
      client_id: client.id,
      redirect: '/pricing?new=1&business=1',
    });
  } catch (error) {
    console.error('Business signup error:', error.message);
    return Response.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
});