# VoxDigits Backend Setup

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Twilio Account (with API Key)

### 2. Local Setup

```bash
# Install dependencies
npm init -y
npm install express cors body-parser pg twilio dotenv bcryptjs jsonwebtoken

# Create .env file
cat > .env << EOF
PORT=4000
DATABASE_URL=postgres://user:pass@localhost:5432/voxdigits_dev
JWT_SECRET=your-super-secret-key-min-32-chars-!!!
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=xxxxxxxxxxxxxxxx
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxx
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_WEBHOOK_BASE_URL=http://localhost:4000
EOF

# Run server
node server.js
```

### 3. Test Health Endpoint
```bash
curl http://localhost:4000/health
# Should return: {"ok":true,"service":"VoxDigits One-File Backend"}
```

### 4. Login (Demo Account)
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@voxdigits.local","password":"admin123456"}'

# Response:
# {"user":{...},"token":"eyJ..."}
```

---

## Production Deployment on Render

### 1. Prepare Repository

Create a GitHub repo with:
```
server.js          (the backend code)
package.json       (with scripts)
.gitignore
```

**package.json**:
```json
{
  "name": "voxdigits-backend",
  "version": "1.0.0",
  "description": "VoxDigits telecom backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "pg": "^8.11.0",
    "twilio": "^4.10.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0"
  }
}
```

### 2. Create PostgreSQL on Render

1. Go to [render.com](https://render.com)
2. New → PostgreSQL
3. Name: `voxdigits-db`
4. Copy the **External Database URL**

### 3. Deploy Backend on Render

1. New → Web Service
2. Connect GitHub repo
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js`
5. **Environment Variables** (from Render dashboard):

```
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/voxdigits
JWT_SECRET=generate-a-secure-random-string-here
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=xxxxxxxxxxxxxxxx
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxx
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_WEBHOOK_BASE_URL=https://voxdigits-backend.onrender.com
```

6. Click **Create Web Service**
7. Wait for deployment (2-3 minutes)

### 4. Configure Twilio Webhooks

Go to Twilio Console → Phone Numbers → Your Number → Webhooks:

- **Voice Webhook**: `https://voxdigits-backend.onrender.com/api/webhooks/twilio/voice/incoming`
- **SMS Webhook**: `https://voxdigits-backend.onrender.com/api/webhooks/twilio/sms/incoming`

For TwiML App (used by web/mobile clients):
- **Voice URL**: `https://voxdigits-backend.onrender.com/api/webhooks/twilio/voice/incoming`

### 5. Update Frontend

In your Base44 React app, set:
```
REACT_APP_BACKEND_URL=https://voxdigits-backend.onrender.com
```

Then navigate to `/BackendLogin` to test authentication.

---

## API Reference

### Authentication

**POST /api/auth/register**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "fullName": "John Doe"
  }'
```

**POST /api/auth/login**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'
```

**GET /api/auth/me**
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:4000/api/auth/me
```

### Numbers

**GET /api/numbers** - List user's numbers
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:4000/api/numbers
```

**POST /api/numbers/provision** (Admin only)
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "e164": "+16624394545",
    "providerSid": "PNxxxxxxxx",
    "countryCode": "US",
    "capabilities": {"sms": true, "voice": true}
  }' \
  http://localhost:4000/api/numbers/provision
```

### Calls

**GET /api/calls** - Get call history
**POST /api/calls/outbound** - Initiate outbound call

### SMS

**GET /api/sms** - Get SMS history
**POST /api/sms/send** - Send SMS

### Twilio Token

**GET /api/twilio/token** - Get Twilio access token for web/mobile client
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:4000/api/twilio/token?identity=user_123"
```

---

## Troubleshooting

### Backend won't start
- Check PostgreSQL connection string in .env
- Verify all required env vars are set
- Check logs: `node server.js`

### Twilio webhooks not firing
- Verify Twilio webhook URLs in console match your backend
- Check Render logs for webhook errors
- Test with `curl` from command line

### SMS/Calls not routing correctly
- Check that numbers are assigned to users: `GET /api/numbers`
- Verify user endpoints are configured: `GET /api/users/:id/endpoints`
- Check audit logs for assignment history

### Database connection pool issues
- Restart backend on Render dashboard
- Check PostgreSQL instance is not out of connections
- Monitor database logs