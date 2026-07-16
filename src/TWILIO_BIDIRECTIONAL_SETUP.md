# Twilio Bidirectional Call Setup - Verification Guide

## ✅ What You Have

### Backend Functions
- ✅ `voiceWebhook` - Handles **inbound** calls from PSTN → rings user's browser client
- ✅ `outboundCallHandler` - Handles **outbound** calls from browser → dials PSTN

### Environment Variables
- ✅ `TWILIO_ACCOUNT_SID` - Your Twilio account ID
- ✅ `TWILIO_API_KEY` - API credentials
- ✅ `TWILIO_API_SECRET` - API credentials
- ✅ `TWILIO_TWIML_APP_SID` - TwiML App for call control
- ✅ `TWILIO_AUTH_TOKEN` - Account auth token

---

## 🔧 Twilio Console Configuration

### 1. TwiML App Setup (Already Created)
In Twilio Console → **Phone Numbers** → **Manage** → **TwiML Apps**

**Name:** VoxDigits Dialer

**Voice Webhook URL** (for incoming calls):
```
https://economic-global-voice-flow.base44.app/functions/voiceWebhook
```

**Voice Fallback URL:**
```
https://economic-global-voice-flow.base44.app/functions/voiceWebhook
```

---

### 2. Phone Number Configuration
In Twilio Console → **Phone Numbers** → **Manage** → **Active Numbers**

**For your provisioned number(s):**
- **Incoming Calls:** TwiML App → VoxDigits Dialer
- **Primary Handler:** voiceWebhook

---

### 3. App Dialer Configuration
**Frontend:** `pages/VoxDialer.jsx`

Token Endpoint: `getTwilioToken`
- Returns Twilio Access Token for identity "andre"
- Scopes: outgoing calls via TwiML App + incoming calls enabled

Outbound Webhook: `outboundCallHandler`
- Routes calls from app → Twilio SIP trunk → PSTN

---

## 📋 Call Flow Verification

### **INBOUND: Someone calls your Twilio number**
```
1. External caller dials: +1 (555) 555-5555
2. Twilio receives call
3. Twilio invokes voiceWebhook with:
   - From: +1 (555) 555-5555
   - To: +1 (555) 555-5555 (your number)
4. voiceWebhook looks up VirtualNumber in database
5. voiceWebhook returns TwiML: <Dial><Client>andre</Client></Dial>
6. App dialer receives incoming call notification
7. User clicks answer → connected to caller
8. If no answer → voicemail recording
```

### **OUTBOUND: User dials from app**
```
1. User enters destination in app: +1 (555) 123-4567
2. App calls device.connect({params: {To: "+1...", From: "+1 555-555-5555"}})
3. Twilio SDK sends TwiML App request to outboundCallHandler
4. outboundCallHandler returns: <Dial><Number>+1 555-123-4567</Number></Dial>
5. Call routes through Twilio's SIP trunk → PSTN
6. Destination phone rings
7. Connected call
```

---

## ✅ Verification Checklist

- [ ] TwiML App webhook URL points to: `/functions/voiceWebhook`
- [ ] Phone number configured to use TwiML App
- [ ] VirtualNumber records have `customer_email` set to "andre"
- [ ] `TWILIO_TWIML_APP_SID` env var matches console app SID
- [ ] `generateToken` function returns valid JWT token
- [ ] `outboundCallHandler` webhook is callable from app
- [ ] VoxDialer app dialer page loads without errors
- [ ] Browser has microphone permissions enabled

---

## 🔍 Testing

### Test Inbound
1. Open VoxDialer app
2. Watch debug log for "Device registered successfully"
3. Call your Twilio number from external phone
4. App should show incoming call notification
5. Click answer → connected to external caller

### Test Outbound
1. Open VoxDialer app
2. Enter destination phone number
3. Click call button
4. External phone should ring
5. Answer call → connected

---

## 🐛 Debugging

**Check the VoxDialer Debug Log** in the app for:
- `Device registered successfully` → Twilio connection OK
- `Incoming call from +1...` → voiceWebhook triggered
- `Starting outbound call to +1...` → outboundCallHandler triggered
- Any error messages with full stack traces

**Common Issues:**
- ❌ "Device not ready" → TwiML App SID is wrong or token expired
- ❌ No incoming call notification → voiceWebhook URL not configured in console
- ❌ Outbound call fails → outboundCallHandler URL not accessible

---

## 📞 Twilio Console Links

- **Active Numbers:** https://console.twilio.com/us1/develop/phone-numbers/manage/active-numbers
- **TwiML Apps:** https://console.twilio.com/us1/develop/voice/manage/twiml-apps
- **API Keys:** https://console.twilio.com/us1/account/keys-credentials/api-keys