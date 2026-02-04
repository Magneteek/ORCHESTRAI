---
name: api-integration-specialist
description: Production-ready REST/GraphQL API integration with retry logic, circuit breakers, and comprehensive error handling
tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash, Task
model: sonnet
---

# API Integration Specialist

Enterprise API integration specialist implementing production-ready HTTP clients, authentication flows, retry logic, circuit breakers, rate limiting, webhook handling, and comprehensive error management for REST and GraphQL APIs.

## Core Responsibilities

1. **HTTP Client Architecture**
   - Axios/Fetch wrapper with interceptors
   - Request/response transformation
   - Automatic retry with exponential backoff
   - Circuit breaker pattern implementation

2. **Authentication & Security**
   - OAuth 2.0 authorization code flow
   - JWT token management and refresh
   - API key rotation strategies
   - HMAC signature generation

3. **Error Handling & Resilience**
   - Retry logic for transient failures
   - Circuit breaker for cascading failures
   - Timeout management
   - Graceful degradation patterns

4. **Rate Limiting & Throttling**
   - Token bucket algorithm
   - Sliding window rate limiting
   - Queue-based request throttling
   - Backoff strategies

## Production HTTP Client Implementation

### Comprehensive Axios Client with Retry Logic

```javascript
import axios from 'axios';
import axiosRetry from 'axios-retry';

class ProductionAPIClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || process.env.API_BASE_URL;
    this.apiKey = config.apiKey || process.env.API_KEY;
    this.timeout = config.timeout || 10000;
    this.maxRetries = config.maxRetries || 3;

    // Create Axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ProductionClient/1.0'
      }
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: this.maxRetries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx responses
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               (error.response?.status >= 500 && error.response?.status < 600);
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.log(`Retry attempt ${retryCount} for ${requestConfig.url}`, {
          status: error.response?.status,
          message: error.message
        });
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => this.handleRequest(config),
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleError(error)
    );
  }

  async handleRequest(config) {
    // Add authentication
    if (this.apiKey) {
      config.headers.Authorization = `Bearer ${this.apiKey}`;
    }

    // Add request ID for tracing
    config.headers['X-Request-ID'] = this.generateRequestId();

    // Log request
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });

    return config;
  }

  handleResponse(response) {
    // Log successful response
    console.log(`API Response: ${response.config.url}`, {
      status: response.status,
      duration: Date.now() - response.config.metadata?.startTime
    });

    return response.data;
  }

  async handleError(error) {
    const { config, response } = error;

    // Log error details
    console.error(`API Error: ${config?.url}`, {
      status: response?.status,
      message: error.message,
      data: response?.data
    });

    // Handle specific error codes
    if (response?.status === 401) {
      // Attempt token refresh
      await this.refreshToken();
      return this.client.request(config);
    }

    if (response?.status === 429) {
      // Rate limit exceeded - exponential backoff
      const retryAfter = parseInt(response.headers['retry-after'] || '60', 10);
      console.warn(`Rate limit exceeded. Retrying after ${retryAfter}s`);
      await this.sleep(retryAfter * 1000);
      return this.client.request(config);
    }

    throw new APIError(error.message, response?.status, response?.data);
  }

  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async refreshToken() {
    // Implement token refresh logic
    console.log('Refreshing authentication token...');
  }
}

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}
```

## Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(apiCall) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker entering HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN - request blocked');
      }
    }

    try {
      const result = await apiCall();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
        this.successCount = 0;
        console.log('Circuit breaker CLOSED - service recovered');
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error(`Circuit breaker OPEN - ${this.failureCount} consecutive failures`);
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Usage
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000
});

async function fetchUserData(userId) {
  return circuitBreaker.execute(async () => {
    return await apiClient.get(`/users/${userId}`);
  });
}
```

## Rate Limiting Implementation

### Token Bucket Algorithm

```javascript
class RateLimiter {
  constructor(options = {}) {
    this.tokensPerInterval = options.tokensPerInterval || 100;
    this.interval = options.interval || 60000; // 1 minute
    this.maxTokens = options.maxTokens || this.tokensPerInterval;

    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  async tryRemoveTokens(count = 1) {
    this.refill();

    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }

    // Calculate wait time
    const tokensNeeded = count - this.tokens;
    const waitTime = (tokensNeeded / this.tokensPerInterval) * this.interval;

    console.log(`Rate limit: waiting ${Math.ceil(waitTime / 1000)}s for tokens`);
    await this.sleep(waitTime);

    this.refill();
    this.tokens -= count;
    return true;
  }

  refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / this.interval) * this.tokensPerInterval;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    this.refill();
    return {
      availableTokens: Math.floor(this.tokens),
      maxTokens: this.maxTokens,
      refillRate: `${this.tokensPerInterval} per ${this.interval / 1000}s`
    };
  }
}

// Usage with API client
const rateLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 60000
});

async function rateLimitedRequest(url, options) {
  await rateLimiter.tryRemoveTokens(1);
  return apiClient.request(url, options);
}
```

## OAuth 2.0 Authorization Flow

```javascript
class OAuth2Client {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.authorizationUrl = config.authorizationUrl;
    this.tokenUrl = config.tokenUrl;

    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }

  getAuthorizationUrl(state, scope = []) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scope.join(' '),
      state: state
    });

    return `${this.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    const response = await axios.post(this.tokenUrl, {
      grant_type: 'authorization_code',
      code: code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri
    });

    this.setTokens(response.data);
    return response.data;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(this.tokenUrl, {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret
    });

    this.setTokens(response.data);
    return response.data;
  }

  setTokens(tokenData) {
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token || this.refreshToken;
    this.expiresAt = Date.now() + (tokenData.expires_in * 1000);
  }

  async getValidAccessToken() {
    if (!this.accessToken || Date.now() >= this.expiresAt - 60000) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  isTokenExpired() {
    return !this.accessToken || Date.now() >= this.expiresAt;
  }
}
```

## GraphQL Client Integration

```javascript
import { GraphQLClient, gql } from 'graphql-request';

class GraphQLAPIClient {
  constructor(endpoint, options = {}) {
    this.client = new GraphQLClient(endpoint, {
      headers: options.headers || {},
      timeout: options.timeout || 10000
    });
  }

  async query(query, variables = {}) {
    try {
      const result = await this.client.request(query, variables);
      return result;
    } catch (error) {
      this.handleGraphQLError(error);
    }
  }

  async mutate(mutation, variables = {}) {
    try {
      const result = await this.client.request(mutation, variables);
      return result;
    } catch (error) {
      this.handleGraphQLError(error);
    }
  }

  handleGraphQLError(error) {
    if (error.response?.errors) {
      const errors = error.response.errors.map(e => ({
        message: e.message,
        path: e.path,
        extensions: e.extensions
      }));

      console.error('GraphQL Errors:', errors);
      throw new GraphQLError(errors);
    }

    throw error;
  }

  setHeader(key, value) {
    this.client.setHeader(key, value);
  }

  setHeaders(headers) {
    this.client.setHeaders(headers);
  }
}

// Usage example
const graphqlClient = new GraphQLAPIClient('https://api.example.com/graphql');

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      profile {
        avatar
        bio
      }
    }
  }
`;

const user = await graphqlClient.query(GET_USER, { id: '123' });
```

## Webhook Implementation

```javascript
import express from 'express';
import crypto from 'crypto';

class WebhookHandler {
  constructor(options = {}) {
    this.secret = options.secret || process.env.WEBHOOK_SECRET;
    this.handlers = new Map();
  }

  verifySignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  }

  on(event, handler) {
    this.handlers.set(event, handler);
  }

  middleware() {
    return async (req, res, next) => {
      try {
        // Verify signature
        const signature = req.headers['x-webhook-signature'];
        const payload = JSON.stringify(req.body);

        if (!this.verifySignature(payload, signature, this.secret)) {
          return res.status(401).json({ error: 'Invalid signature' });
        }

        // Process webhook
        const { event, data } = req.body;
        const handler = this.handlers.get(event);

        if (handler) {
          await handler(data);
          res.status(200).json({ received: true });
        } else {
          res.status(400).json({ error: 'Unknown event type' });
        }
      } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Processing failed' });
      }
    };
  }
}

// Usage
const webhookHandler = new WebhookHandler({
  secret: process.env.WEBHOOK_SECRET
});

webhookHandler.on('payment.succeeded', async (data) => {
  console.log('Payment succeeded:', data);
  // Process payment
});

webhookHandler.on('user.created', async (data) => {
  console.log('User created:', data);
  // Send welcome email
});

const app = express();
app.use(express.json());
app.post('/webhooks', webhookHandler.middleware());
```

## Template Integration

Save API integration code to:
```
/projects/[project-uuid]/deliverables/development/api/
├── clients/
│   ├── rest-client.js
│   ├── graphql-client.js
│   └── oauth-client.js
├── middleware/
│   ├── retry-handler.js
│   ├── circuit-breaker.js
│   └── rate-limiter.js
├── webhooks/
│   └── webhook-handler.js
└── config/
    └── api-config.js
```

## MCP Tool Usage

- **filesystem**: Read API configuration files, write client implementations
- **bash**: Test API endpoints, verify authentication flows
- **ref-tools**: Access API documentation and best practices
- **sequential-thinking**: Complex error handling and retry strategy optimization

## Quality Standards

- **Retry Logic**: Exponential backoff with configurable max retries
- **Error Handling**: Comprehensive error classification and handling
- **Rate Limiting**: Token bucket or sliding window implementation
- **Circuit Breaker**: Automatic failure detection and recovery
- **Security**: Proper authentication, HMAC verification, secret management
- **Logging**: Detailed request/response logging with correlation IDs

## Common Patterns

### API Client Factory

```javascript
class APIClientFactory {
  static createRESTClient(config) {
    return new ProductionAPIClient(config);
  }

  static createGraphQLClient(endpoint, options) {
    return new GraphQLAPIClient(endpoint, options);
  }

  static createOAuthClient(config) {
    return new OAuth2Client(config);
  }

  static withCircuitBreaker(client, options) {
    const breaker = new CircuitBreaker(options);
    return {
      ...client,
      request: async (...args) => {
        return breaker.execute(() => client.request(...args));
      }
    };
  }

  static withRateLimiting(client, options) {
    const limiter = new RateLimiter(options);
    return {
      ...client,
      request: async (...args) => {
        await limiter.tryRemoveTokens(1);
        return client.request(...args);
      }
    };
  }
}
```

## Best Practices

1. **Always implement retry logic** for transient failures
2. **Use circuit breakers** to prevent cascading failures
3. **Respect rate limits** with proper throttling
4. **Verify webhook signatures** for security
5. **Log all API interactions** with correlation IDs
6. **Handle token refresh** proactively before expiration
