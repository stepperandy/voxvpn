# Twilio Voice Webhook Configuration - Your Base44 Functions

## Quick Setup

Your Base44 app includes pre-built voice handlers. Configure Twilio to use them:

### 1. Set Your App URL
Go to **Dashboard Settings → Environment Variables** and verify:
```
BASE44_PUBLIC_URL = https://your-published-app-url.com
```

### 2. Configure Twilio Phone Numbers

**For Each Virtual Number in Twilio Console:**

1. Go to: **Twilio Console → Phone Numbers → Manage Numbers**
2. Click on your virtual number
3. Under **Voice & Fax**:
   - **Incoming Call** webhook: Set to `POST`
   - **URL**: `https://your-published-app-url.com/functions/voiceWebhookProductionV2`

**Example:**
```
POST https://example-app.vercel.app/functions/voiceWebhookProductionV2
```

---

## How It Works

1. **Inbound Call** → Twilio sends to `voiceWebhookProductionV2`
2. Function looks up VirtualNumber owner
3. Routes to owner's registered devices/endpoints
4. Falls back to voicemail if no answer

---

## Your Base44 Voice Functions

| Function | Purpose |
|----------|---------|
| `voiceWebhookProductionV2` | Handles incoming calls, routes to user |
| `voiceRecordingWebhookV2` | Saves voicemail recordings |
| `voiceWebhookDialAction` | Handles dial completion (answer/no-answer) |

All are pre-built and deploy automatically.

---

## Testing

1. Publish your app
2. Configure the webhook URL above
3. Call your virtual number
4. Check **Functions** logs for: `[voiceWebhook] Inbound call`
5. Should route to your Dialer client (if online)

---

## Errors

- **Error 31005 (HANGUP)** - Normal disconnect, can be ignored
- **Call not routing** - Check VirtualNumber owner email matches logged-in user
- **No voicemail** - Check `BASE44_PUBLIC_URL` is set correctly