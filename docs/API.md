# ZacAi-Atomic API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api`  
**Last Updated:** November 5, 2025

---

## Table of Contents

1. [Chat API](#chat-api)
2. [Admin Settings APIs](#admin-settings-apis)
3. [Training API](#training-api)
4. [Metrics API](#metrics-api)
5. [Health Check API](#health-check-api)
6. [Activity Monitoring API](#activity-monitoring-api)
7. [Authentication](#authentication)
8. [Error Responses](#error-responses)

---

## Chat API

### POST `/api/chat`

Process chat messages and get AI-generated responses.

**Request Body:**
```json
{
  "action": "chat",
  "message": "What is TypeScript?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "TypeScript is a strongly typed programming language...",
  "sessionId": "session-abc123",
  "timestamp": "2025-11-05T10:30:00Z"
}
```

**Initialize Session:**
```json
{
  "action": "initialize"
}
```

**Response:**
```json
{
  "sessionId": "session-abc123",
  "domainCount": 23,
  "status": "ready"
}
```

---

## Admin Settings APIs

### System Settings

#### GET `/api/admin/settings/system`

Get system-wide configuration.

**Response:**
```json
{
  "systemName": "ZacAi-Atomic",
  "version": "1.0.0",
  "mode": "development",
  "location": "Codespaces",
  "timezone": "UTC"
}
```

#### PUT `/api/admin/settings/system`

Update system configuration.

**Request Body:**
```json
{
  "systemName": "ZacAi-Atomic",
  "mode": "production",
  "timezone": "America/New_York"
}
```

**Response:**
```json
{
  "success": true,
  "message": "System settings updated successfully"
}
```

### Domain Settings

#### GET `/api/admin/settings/domains`

Get all domain configurations.

**Response:**
```json
{
  "domains": [
    {
      "name": "react",
      "enabled": true,
      "confidenceThreshold": 0.7,
      "temperature": 0.8,
      "maxTokens": 2048,
      "priority": "high",
      "keywords": ["component", "hook", "jsx"]
    }
  ]
}
```

#### PUT `/api/admin/settings/domains`

Update domain configuration.

**Request Body:**
```json
{
  "domain": "react",
  "enabled": true,
  "confidenceThreshold": 0.75,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Domain settings updated successfully"
}
```

### Model Settings

#### GET `/api/admin/settings/models`

Get all model configurations.

**Response:**
```json
{
  "models": [
    {
      "name": "orchestrator",
      "enabled": true,
      "maxLatency": 1000,
      "cache": true,
      "parameters": {
        "batchSize": 32,
        "learningRate": 0.001
      }
    }
  ]
}
```

#### PUT `/api/admin/settings/models`

Update model configuration.

**Request Body:**
```json
{
  "model": "orchestrator",
  "enabled": true,
  "parameters": {
    "learningRate": 0.0005
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Model settings updated successfully"
}
```

### User Management

#### GET `/api/admin/settings/users`

Get list of all users.

**Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "name": "AiAscended",
      "email": "ai@example.com",
      "role": "admin",
      "createdAt": "2025-11-05T10:00:00Z"
    }
  ]
}
```

#### POST `/api/admin/settings/users`

Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "user-456",
  "message": "User created successfully"
}
```

#### PUT `/api/admin/settings/users`

Update existing user.

**Request Body:**
```json
{
  "userId": "user-456",
  "name": "Jane Doe",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

#### DELETE `/api/admin/settings/users`

Delete a user.

**Request Body:**
```json
{
  "userId": "user-456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Training API

### GET `/api/admin/training`

Get current training status.

**Response:**
```json
{
  "status": "idle",
  "currentEpoch": 0,
  "totalEpochs": 100,
  "progress": 0,
  "lastTrainingTime": null
}
```

### POST `/api/admin/training`

Start training process.

**Request Body:**
```json
{
  "domain": "react",
  "epochs": 50,
  "learningRate": 0.001,
  "batchSize": 32
}
```

**Response:**
```json
{
  "success": true,
  "trainingId": "training-789",
  "message": "Training started successfully"
}
```

---

## Metrics API

### GET `/api/admin/metrics`

Get system and model performance metrics.

**Response:**
```json
{
  "system": {
    "uptime": 86400,
    "memoryUsage": "45%",
    "cpuUsage": "23%"
  },
  "models": {
    "orchestrator": {
      "accuracy": 0.92,
      "latency": 45,
      "throughput": 1000
    }
  },
  "domains": {
    "react": {
      "queries": 5432,
      "avgConfidence": 0.85,
      "errors": 12
    }
  }
}
```

---

## Health Check API

### GET `/api/health`

Check system health status.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 86400,
  "timestamp": "2025-11-05T10:30:00Z",
  "checks": {
    "storage": "healthy",
    "ai": "healthy",
    "database": "healthy"
  }
}
```

### HEAD `/api/health`

Basic health check ping (returns 200 OK if healthy).

---

## Activity Monitoring API

### GET `/api/admin/activity`

Get recent system activity log events.

**Query Parameters:**
- `limit` (optional): Number of events to return (default: 100)

**Response:**
```json
{
  "events": [
    {
      "type": "chat_message",
      "message": "User sent message",
      "timestamp": "2025-11-05T10:30:00Z",
      "meta": {
        "sessionId": "session-123",
        "messageLength": 42
      }
    }
  ]
}
```

---

## Authentication

Currently, the API does not require authentication for development. In production:

**Header:**
```
Authorization: Bearer <jwt-token>
```

**Token Acquisition:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": "user-123",
    "name": "User Name",
    "role": "admin"
  }
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": true,
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-11-05T10:30:00Z"
}
```

### Common Error Codes

- `400` - Bad Request: Invalid request parameters
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server-side error
- `503` - Service Unavailable: System temporarily unavailable

### Example Error Response:

```json
{
  "error": true,
  "message": "Domain 'invalid-domain' not found",
  "code": "DOMAIN_NOT_FOUND",
  "timestamp": "2025-11-05T10:30:00Z",
  "statusCode": 404
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Chat API**: 20 requests/minute
- **Admin APIs**: 100 requests/minute
- **Settings APIs**: 50 requests/minute
- **Training API**: 10 requests/minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1699200000
```

---

## WebSocket Support (Planned)

Future versions will support WebSocket connections for real-time features:

```javascript
const ws = new WebSocket('ws://localhost:3000/api/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Send chat message
const response = await api.post('/chat', {
  action: 'chat',
  message: 'Hello, AI!',
});

console.log(response.data.response);
```

### Python

```python
import requests

api_base = 'http://localhost:3000/api'

# Send chat message
response = requests.post(f'{api_base}/chat', json={
    'action': 'chat',
    'message': 'Hello, AI!'
})

print(response.json()['response'])
```

### cURL

```bash
# Chat request
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"action":"chat","message":"Hello, AI!"}'

# Health check
curl http://localhost:3000/api/health
```

---

## Support

For API support and questions:
- GitHub Issues: [github.com/AiAscended/ZacAi-Atomic/issues](https://github.com/AiAscended/ZacAi-Atomic/issues)
- Documentation: [docs/](../docs/)
- Email: support@zacai-atomic.dev

---

**Last Updated:** November 5, 2025  
**API Version:** 1.0.0
