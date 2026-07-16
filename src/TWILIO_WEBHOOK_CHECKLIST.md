# Twilio Webhook Configuration Checklist

## 1. TwiML App Voice Request URL

**Location:** Twilio Console → Phone Numbers → Apps → [Your TwiML App]

- [ ] **URL:** Should point to your **published** voiceWebhook function
  - Format: `https://your-published-domain.com/functions/voiceWebhook`
  - Replace `your-published-domain` with your actual Base44 app domain

- [ ] **Method:** POST

- [ ] **Verify:** Navigate to the URL in your browser—you should get a 405 (GET not allowed) or an error page, NOT a function error

---

## 2. Incoming Phone Number Webhook

**Location:** Twilio Console → Phone Numbers → Active Numbers → [Your Number]

- [ ] **Voice:** Should point to the same published voiceWebhook URL
  - Format: `https://your-published-domain.com/functions/voiceWebhook`

- [ ] **Method:** POST

---

## 3. Test Configuration (Form Data)

When Twilio calls the webhook, it sends **form-encoded data**, not JSON:

```
POST /functions/voiceWebhook HTTP/1.1
Content-Type: application/x-www-form-urlencoded

To=%2B12603702162&From=%2B19876543210&CallSid=CA8c55b&...
```

The voiceWebhook now handles both form data and JSON (for testing).

---

## 4. What to Check in Runtime Logs

After making a **real inbound call** to your Twilio number, check:

**Logs → Dashboard → Latest Logs**

Look for logs starting with `[voiceWebhook]`:

```
[voiceWebhook] 📨 Request received
[voiceWebhook] 📝 Content-Type: application/x-www-form-urlencoded
[voiceWebhook] 📞 CallSid: CA8c55b...
[voiceWebhook] 📞 To: +12603702162
[voiceWebhook] 📞 From: +19876543210
[voiceWebhook] 📞 Direction: inbound
[voiceWebhook] 🔍 INBOUND: Looking up VirtualNumber: +12603702162
[voiceWebhook] ✅ VirtualNumber found, userId: ...
[voiceWebhook] 👤 Resolved user identity: aagble_gmail_com
[voiceWebhook] 📤 TwiML (inbound ring):
<?xml version="1.0" encoding="UTF-8"?><Response><Dial timeout="45" action="/functions/voicemailHandler" method="POST" callerId="+19876543210"><Client>aagble_gmail_com</Client></Dial></Response>
```

---

## 5. Troubleshooting

### Error: "Application error"

Possible causes:

1. **VirtualNumber not in database**
   - Logs: `❌ VirtualNumber not found: +12603702162`
   - Fix: Add the number to VirtualNumber entity with your userId

2. **User identity missing**
   - Logs: `❌ User or identity not found`
   - Fix: Ensure User entity has `identity` field populated

3. **Function URL incorrect**
   - Logs: No logs appear at all
   - Fix: Check that Twilio webhook URL matches published domain exactly

4. **Function returns invalid TwiML**
   - Logs: TwiML appears malformed
   - Fix: Ensure XML is well-formed (closing tags, proper escaping)

---

## 6. Next Steps

1. **Add test number to VirtualNumber:**
   ```
   Number: +12603702162
   userId: [your user ID from User entity]
   ```

2. **Ensure User has identity:**
   ```
   identity: aagble_gmail_com (or your sanitized email)
   primaryNumber: +12603702162
   ```

3. **Update Twilio webhook URLs** to point to published domain

4. **Make a test call** to +12603702162

5. **Check logs** for `[voiceWebhook]` entries