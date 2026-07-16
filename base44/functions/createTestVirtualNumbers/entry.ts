import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const usersNeedingNumbers = [
      'agandyedu@gmail.com',
      'efoamenyo2025@gmail.com',
      'loysattiogbe@gmail.com',
      'rexfordelorm19@gmail.com',
      'test@voxdigits.com',
    ];

    const testNumbers = [
      '+14155552671',
      '+14155552672',
      '+14155552673',
      '+14155552674',
      '+14155552675',
    ];

    const results = {
      created: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < usersNeedingNumbers.length; i++) {
      try {
        const vn = await base44.asServiceRole.entities.VirtualNumber.create({
          phone_number: testNumbers[i],
          country_code: 'US',
          city: 'San Francisco',
          number_type: 'local',
          customer_email: usersNeedingNumbers[i],
          status: 'active',
          voice_enabled: true,
          sms_enabled: true,
        });

        results.created++;
        console.log(`✅ Created ${testNumbers[i]} for ${usersNeedingNumbers[i]}`);
      } catch (err) {
        results.failed++;
        results.errors.push(err.message);
        console.error(`❌ Failed:`, err.message);
      }
    }

    return Response.json({
      success: true,
      ...results,
      message: `${results.created} test numbers created`,
    });
  } catch (error) {
    console.error('[createTestVirtualNumbers] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});