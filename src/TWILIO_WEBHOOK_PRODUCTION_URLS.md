# Twilio Voice Webhook Configuration - Production URLs & Debugging

## Current Production Webhook Endpoints

### Inbound Voice Webhook (Incoming Call Handler)
**Function**: `voiceWebhookProductionV2`
**Production URL**: `https://your-app.vercel.app/functions/voiceWebhookProductionV2`
**Twilio Configuration**: Phone Numbers → Manage Numbers → **Incoming Call Webhook**

**What it does**:
1. Receives inbound call from Twilio
2. Logs raw request body with From, To, CallSid
3. Queries VirtualNumber entity for assigned user
4. Returns TwiML to dial user's client
5. Falls back to voicemail if no answer

**Expected Twilio Request**:
```
POST /functions/voiceWebhookProductionV2
From=%2B1234567890
To=%2B1111111111
CallSid=CA1234567890abcdef
```

**Expected TwiML Response**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="30" answerOnBridge="true">
    <Client>username</Client>
  </Dial>
  <Say voice="Polly.Joanna">The user is unavailable...</Say>
  <Record maxLength="120" playBeep="true" finishOnKey="#" action="..."/>
</Response>
```

---

### Voicemail Recording Webhook (Call Recording Handler)
**Function**: `voiceRecordingWebhookV2`
**Production URL**: `https://your-app.vercel.app/functions/voiceRecordingWebhookV2`
**Twilio Configuration**: Referenced in TwiML response from inbound webhook

**What it does**:
1. Receives voicemail recording callback from Twilio
2. Logs recording metadata (CallSid, From, RecordingUrl, Duration)
3. Creates Voicemail entity record
4. Returns acknowledgment TwiML

**Expected Twilio Request**:
```
POST /functions/voiceRecordingWebhookV2
From=%2B1234567890
To=%2B1111111111
CallSid=CA1234567890abcdef
RecordingUrl=https://api.twilio.com/2010-04-01/Accounts/.../Recordings/RE1234567890
RecordingDuration=45
```

**Expected TwiML Response**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you. Your message has been recorded.</Say>
  <Hangup/>
</Response>
```

---

## Debugging Checklist

### 1. Verify Webhook URLs in Twilio Console

**For Inbound Voice**:
```
Twilio Console → Phone Numbers → Manage Numbers → [Your Number]
  ↓
Incoming Call: POST https://your-app.vercel.app/functions/voiceWebhookProductionV2
```

**For Voicemail Recording**:
- The URL is dynamically built in the TwiML response
- Verify `BASE44_PUBLIC_URL` environment variable is set correctly
- Verify URL syntax in TwiML action parameter matches production domain

### 2. Check Function Logs

Look for these log lines when an inbound call arrives:

```
[voiceWebhookProductionV2] RAW REQUEST: From=%2B1234567890&To=%2B1111111111&CallSid=CA...
[voiceWebhookProductionV2] PARSED: CallSid=CA..., From=+1234567890, To=+1111111111
[voiceWebhookProductionV2] Found number assignment: +1111111111 → user@example.com
[voiceWebhookProductionV2] ROUTING TO CLIENT: username
[voiceWebhookProductionV2] OUTBOUND TWIML: <?xml version="1.0"...
```

### 3. Common TwiML Errors

**❌ Empty or null response**
- Cause: Function crashed before returning response
- Fix: Check function logs for exceptions
- Verify: Function always returns Response object

**❌ Invalid XML**
- Cause: Unescaped characters in phone numbers or names
- Fix: Use `escapeXml()` for all dynamic content
- Verify: TwiML passes XML validation at https://validator.twilio.com

**❌ 500 Internal Server Error**
- Cause: Unhandled exception in function
- Fix: Check function logs for error stack trace
- Verify: All async operations wrapped in try/catch

**❌ Twilio rejects with "Invalid TwiML"**
- Cause: Missing XML declaration or malformed tags
- Fix: Always return: `<?xml version="1.0" encoding="UTF-8"?>` at start
- Verify: All response tags properly closed

### 4. Test Webhook Response Format

**Using curl** (test locally):
```bash
# Test inbound voice webhook
curl -X POST http://localhost:3000/functions/voiceWebhookProductionV2 \
  -d "From=%2B1234567890&To=%2B1111111111&CallSid=CA1234567890abcdef"

# Expected response: valid XML starting with <?xml version="1.0"...
```

**Using Twilio Console Debugger**:
1. Go to Twilio Console → Debugger
2. Make a test call
3. Click on call SID
4. Check "Webhook Requests" section
5. Verify request was sent and response was received
6. Look at response body for TwiML validity

---

## Critical Production Requirements

### 1. Always Return HTTP 200 + Valid TwiML
- Even on errors, return `200 OK` with error TwiML (e.g., "Technical difficulties")
- Never return `500` to Twilio—it will retry the webhook and delay the call
- Never return empty body—Twilio will hang up immediately

### 2. Minimize Response Time
- Target: < 500ms response time
- Database lookups should be cached if possible
- Avoid external API calls in hot path

### 3. Log Everything for Debugging
- Raw request body (before parsing)
- Parsed parameters (From, To, CallSid)
- Database lookup results
- Final TwiML before returning
- Any exceptions with full stack trace

### 4. Validate Database Records
- Verify VirtualNumber entity exists for the number
- Verify `customer_email` field is populated
- Verify `voice_enabled: true`
- Verify number status is not "suspended" or "released"

---

## How to Deploy Changes

1. **Update function code** (e.g., `voiceWebhookProductionV2.js`)
2. **Function auto-deploys** (no manual deploy needed)
3. **Verify deployment** by checking function logs for new code
4. **Test with real call** or use Twilio webhook tester
5. **Monitor logs** for any new errors

---

## Environment Variables Required

```
BASE44_PUBLIC_URL = https://your-app.vercel.app
```

Used to build voicemail recording callback URL. Verify this is set in dashboard settings.

---

## Next Steps

1. ✅ Verify both webhook URLs configured in Twilio Console
2. ✅ Make a test inbound call
3. ✅ Check function logs for the 5 required log lines above
4. ✅ Verify TwiML response in logs matches expected format
5. ✅ If errors appear, fix and redeploy
6. ✅ Confirm call routes to client correctly
7. ✅ Test voicemail by not answering
8. ✅ Verify voicemail recorded in database