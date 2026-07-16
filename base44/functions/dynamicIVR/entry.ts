import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Dynamic IVR (Interactive Voice Response) handler
 * Processes menu selections and routes accordingly
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const formData = await req.formData();

    const digits = formData.get('Digits');
    const virtualNumber = formData.get('VirtualNumber');
    const fromNumber = formData.get('From');
    const callSid = formData.get('CallSid');

    console.log(`[dynamicIVR] Menu choice: ${digits} from ${fromNumber}`);

    let twiml = `<?xml version="1.0" encoding="UTF-8"?>`;
    twiml += `<Response>`;

    switch (digits) {
      case '1':
        // Option 1: Sales department
        twiml += `<Say>Connecting you to sales...</Say>`;
        twiml += `<Dial timeout="20">+15404048622</Dial>`;
        twiml += `<Say>Sales is unavailable. Please try again later.</Say>`;
        break;

      case '2':
        // Option 2: Support department
        twiml += `<Say>Connecting you to support...</Say>`;
        twiml += `<Dial timeout="20">+15404048623</Dial>`;
        twiml += `<Say>Support is unavailable. Leaving voicemail.</Say>`;
        twiml += `<Record maxLength="60" />`;
        break;

      case '3':
        // Option 3: Leave voicemail
        twiml += `<Say>Please leave a message after the beep.</Say>`;
        twiml += `<Record maxLength="60" />`;
        twiml += `<Say>Thank you. Your message has been recorded.</Say>`;
        break;

      case '0':
        // Option 0: Main menu again
        twiml += `<Gather numDigits="1" action="/api/functions/dynamicIVR" method="POST">`;
        twiml += `<Say>Press 1 for sales, 2 for support, or 3 to leave a voicemail.</Say>`;
        twiml += `</Gather>`;
        break;

      default:
        // Invalid option
        twiml += `<Say>Sorry, that option is not available. Please try again.</Say>`;
        twiml += `<Gather numDigits="1" action="/api/functions/dynamicIVR" method="POST">`;
        twiml += `<Say>Press 1 for sales, 2 for support, or 3 to leave a voicemail.</Say>`;
        twiml += `</Gather>`;
    }

    twiml += `</Response>`;

    return new Response(twiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('[dynamicIVR]', error.message);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>System error occurred.</Say></Response>`;
    return new Response(twiml, {
      headers: { 'Content-Type': 'application/xml' },
      status: 500,
    });
  }
});