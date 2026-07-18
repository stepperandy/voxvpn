# Twilio Webhook Configuration for Production Call Routing

## Overview
VoxDigits uses database-driven number-to-user routing. All incoming calls and SMS route through webhooks that look up the assigned user in the database.

## Webhook Endpoints to Configure

### 1. **Incoming Voice Webhook** (Primary)
**URL**: `https://your-base44-app.vercel.app/functions/voiceWebhookProduction`

**When**: Twilio receives an incoming call to a VoxDigits number
**What happens**: 
- Looks up which user the number is assigned to
- Rings their registered endpoints (web client, SIP, fallback phone) by priority
- Routes to voicemail if no answer

**Configuration**:
1. Go to Twilio Console → Phone Numbers → Manage → Your Number
2. Under "Incoming Calls", set **Webhook URL** to: `https://your-base44-app.vercel.app/functions/voiceWebhookProduction`
3. Method: `POST`
4. Click **Save**

---

### 2. **Call Status Webhook** (Optional but Recommended)
**URL**: `https://your-base44-app.vercel.app/functions/callStatusWebhook`

**When**: Call completes, fails, or status changes
**What happens**: 
- Updates call duration and final status in database
- Logs call for history/billing

**Configuration**:
1. Twilio Console → Phone Numbers → Manage → Your Number
2. Under "Voice Fallback", add status callback webhook to same number
3. OR: Edit the TwiML app used by your phone number
4. Add Status Callback URL: `https://your-base44-app.vercel.app/functions/callStatusWebhook`
5. Click **Save**

---

### 3. **Incoming SMS Webhook**
**URL**: `https://your-base44-app.vercel.app/functions/smsWebhookProduction`

**When**: Twilio receives an SMS to a VoxDigits number
**What happens**: 
- Looks up assigned user
- Logs message in database
- Routes to user notification (email, push, etc.)

**Configuration**:
1. Go to Twilio Console → Phone Numbers → Manage → Your Number
2. Under "Incoming Messages", set **Webhook URL** to: `https://your-base44-app.vercel.app/functions/smsWebhookProduction`
3. Method: `POST`
4. Click **Save**

---

### 4. **SMS Status Webhook** (Optional)
**URL**: `https://your-base44-app.vercel.app/functions/smsStatusWebhook`

**When**: SMS delivery status updates (sent, delivered, failed)
**What happens**: 
- Updates message status in database
- Tracks delivery for user feedback

**Configuration**:
1. Twilio Console → Phone Numbers → Manage → Your Number
2. Under "Message Fallback", add: `https://your-base44-app.vercel.app/functions/smsStatusWebhook`
3. Method: `POST`
4. Click **Save**

---

## Database-Driven Routing Explanation

When a call or SMS arrives:

1. **Webhook triggered** → Function receives phone number
2. **Database lookup** → Queries `VirtualNumber` entity for `phone_number`
3. **User found** → Retrieves `customer_email` of assigned user
4. **Endpoint routing** → Rings user's registered endpoints by priority:
   - **Priority 1**: Web/mobile client (fastest)
   - **Priority 2**: SIP endpoint (if configured)
   - **Priority 3**: PSTN fallback number (if configured)
5. **Fallback**: If no answer → voicemail recording
6. **Logging**: Call/SMS stored in `CallLog` or `Message` entity

---

## Admin Number Assignment

Admins can:
1. Go to `/AdminNumberRouting`
2. Select a virtual number
3. Assign it to a user
4. Configure call endpoints (web client, SIP, phone forwarding)
5. System automatically routes all calls to that user

---

## Testing Webhooks

### Test incoming call:
```bash
curl -X POST https://your-base44-app.vercel.app/functions/voiceWebhookProduction \
  -d "From=%2B1234567890&To=%2B1111111111"
```

Should return TwiML routing to the assigned user's endpoints.

### Test incoming SMS:
```bash
curl -X POST https://your-base44-app.vercel.app/functions/smsWebhookProduction \
  -d "From=%2B1234567890&To=%2B1111111111&Body=Test"
```

Should return TwiML acknowledgment and log the message.

---

## Security Notes

- All webhooks validate requests using `createClientFromRequest(req)` from Base44 SDK
- Only users with assigned numbers can receive calls/SMS
- Call logs and message history are tied to user email
- Admin page restricted to users with `role === "admin"`

---

## Troubleshooting

### Calls not routing
- Verify webhook URL is correct in Twilio Console
- Check number is assigned to a user in admin panel
- Review function logs for errors

### SMS not received
- Confirm SMS webhook URL matches configuration
- Verify number has `sms_enabled: true` in database
- Check Twilio logs for webhook failures

### Voicemail not recording
- Ensure `voicemail_enabled: true` in number config
- Verify recording storage is configured in Twilio
- Check webhook function has correct fallback URL

---

## Next Steps

1. Configure all 4 webhooks in Twilio Console
2. Test with admin panel assignment
3. Make test call/SMS to verify routing
4. Monitor function logs and call history