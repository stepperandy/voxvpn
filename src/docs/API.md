# VoxVPN API Documentation

## Overview
VoxVPN API provides RESTful endpoints for VPN management, subscriptions, and account operations.

**Base URL**: `https://api.voxvpn.com`

## Authentication

All requests require authentication. Include your API token in the Authorization header:

```
Authorization: Bearer YOUR_API_TOKEN
```

## Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout current user
- `POST /auth/signup` - Create new account

### VPN Operations
- `GET /servers` - List all VPN servers
- `POST /connect` - Establish VPN connection
- `POST /disconnect` - Disconnect VPN
- `GET /connection/stats` - Get connection statistics

### Subscriptions
- `GET /subscription` - Get current subscription
- `POST /subscription/upgrade` - Upgrade plan
- `POST /subscription/cancel` - Cancel subscription
- `GET /billing/history` - Get billing history

### Account
- `GET /account/profile` - Get user profile
- `PUT /account/profile` - Update profile
- `GET /account/settings` - Get account settings
- `PUT /account/settings` - Update settings
- `POST /account/delete` - Delete account

### Security
- `POST /2fa/setup` - Setup 2-factor authentication
- `POST /2fa/verify` - Verify 2FA code
- `GET /payment-methods` - List payment methods
- `POST /payment-methods` - Add payment method

### Support
- `GET /support/tickets` - List support tickets
- `POST /support/tickets` - Create support ticket
- `GET /support/tickets/:id` - Get ticket details

## Example Requests

### Get Servers
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.voxvpn.com/servers
```

### Create Connection
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"server_id": "server_123"}' \
  https://api.voxvpn.com/connect
```

## Response Format

All responses are JSON:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## Error Codes

- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per IP

## Webhooks

Subscribe to events via webhooks:

```bash
POST /webhooks/subscribe
{
  "event": "subscription.updated",
  "url": "https://yourapp.com/webhook"
}
```

Events:
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`
- `payment.succeeded`
- `payment.failed`

## SDKs

- **JavaScript**: `npm install @voxvpn/sdk`
- **Python**: `pip install voxvpn`
- **Go**: `go get github.com/voxvpn/sdk-go`

## Support

- Docs: https://docs.voxvpn.com
- Email: api@voxvpn.com
- Discord: https://discord.gg/voxvpn