# VoxDigits Dual-System Deployment Guide

## Architecture Overview
- **Frontend**: Base44 React app (handles UI, contacts, history display)
- **Backend**: Node.js/Express on Render (handles Twilio webhooks, routing, tokens, number management)
- **Database**: PostgreSQL on Render or Neon

---

## Backend Deployment on Render

### 1. Create PostgreSQL Database

1. Go to [Render Dashboard](https://render.com)
2. Create a new **PostgreSQL** instance:
   - Name: `voxdigits-db`
   - Region: Same as your backend
   - PostgreSQL Version: 15 or latest
3. Copy the **External Database URL** (looks like `postgresql://user:pass@host:5432/db`)

### 2. Deploy Node.js Backend

1. Create a new **Web Service** on Render:
   - Connect your GitHub repo containing the `server.js` file
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Runtime**: Node 20
   
2. Set Environment Variables in Render Dashboard:

```
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/voxdigits
JWT_SECRET=your-super-secret-jwt-key-change-this
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=xxxxxxxxxxxxxxxx
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxx
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_WEBHOOK_BASE_URL=https://voxdigits-backend.onrender.com
```

3. **Important**: Configure Twilio webhooks to point to your Render backend:

   - **Incoming Voice Webhook**: `https://voxdigits-backend.onrender.com/api/webhooks/twilio/voice/incoming`
   - **Voice Status Callback**: `https://voxdigits-backend.onrender.com/api/webhooks/twilio/voice/status`
   - **Recording Callback**: `https://voxdigits-backend.onrender.com/api/webhooks/twilio/voice/recording`
   - **Incoming SMS Webhook**: `https://voxdigits-backend.onrender.com/api/webhooks/twilio/sms/incoming`
   - **SMS Status Callback**: `https://voxdigits-backend.onrender.com/api/webhooks/twilio/sms/status`

### 3. Verify Deployment

1. Test health endpoint:
   ```bash
   curl https://voxdigits-backend.onrender.com/health
   ```
   Should return: `{"ok":true,"service":"VoxDigits One-File Backend"}`

2. Check logs in Render Dashboard for errors

---

## Frontend Integration (Base44)

### Update React App Configuration

Set the backend API URL as an environment variable:

```javascript
// In your React app or .env
REACT_APP_BACKEND_URL=https://voxdigits-backend.onrender.com
```

### Key API Endpoints Your Frontend Will Use

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/twilio/token` | GET | Get Twilio token for client SDK |
| `/api/calls` | GET | Get call history |
| `/api/sms` | GET | Get SMS history |
| `/api/sms/send` | POST | Send SMS |
| `/api/calls/outbound` | POST | Initiate outbound call |
| `/api/numbers` | GET | Get assigned numbers |

---

## Workflow

### Making a Call
1. Frontend: Get Twilio token from `/api/twilio/token`
2. Frontend: Initialize Twilio Device with token
3. Frontend: User enters number and clicks call
4. Frontend: Device connects to TwiML app
5. Backend: TwiML webhook routes call based on assigned number
6. Call is logged in PostgreSQL

### Receiving an SMS
1. Twilio SMS arrives at `/api/webhooks/twilio/sms/incoming`
2. Backend: Finds assigned user by `To` number
3. Backend: Stores message in PostgreSQL
4. Frontend: Polls `/api/sms` to display new messages

### Receiving a Call
1. Twilio routes call to `/api/webhooks/twilio/voice/incoming`
2. Backend: Finds assigned user and their endpoints
3. Backend: Returns TwiML to dial user's registered endpoints (web client, SIP, PSTN)
4. Call is logged, voicemail is recorded if unanswered

---

## Security Notes

- **JWT Secret**: Generate a strong random string. Change from default.
- **CORS**: Backend allows requests from Base44 frontend domain
- **Database**: Use strong PostgreSQL password
- **Render**: Enable auto-deploy only on main branch
- **Environment Variables**: Never commit secrets; use Render dashboard

---

## Monitoring

- Check **Render Logs** tab for backend errors
- Monitor **PostgreSQL CPU/Memory** usage
- Set up alerts if backend goes down

---

## Scaling

- **Stateless**: Backend is fully stateless (can run multiple instances)
- **Database**: PostgreSQL connection pooling is enabled
- If traffic grows:
  1. Upgrade PostgreSQL instance on Render
  2. Add more backend instances (Render auto-scales)
  3. Consider Redis for caching tokens