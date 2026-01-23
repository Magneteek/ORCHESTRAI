# {{AGENT_NAME}} - Deployment Guide

**Version**: 1.0.0
**Last Updated**: {{LAST_UPDATED}}
**Client**: {{CLIENT_NAME}}

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Deployment](#local-development-deployment)
3. [MCP Configuration](#mcp-configuration)
4. [Environment Variables](#environment-variables)
5. [Cloud Deployment](#cloud-deployment)
   - [AWS Lambda](#aws-lambda)
   - [Google Cloud Run](#google-cloud-run)
   - [Azure Functions](#azure-functions)
6. [Docker & Kubernetes](#docker--kubernetes)
7. [Monitoring & Observability](#monitoring--observability)
8. [Troubleshooting](#troubleshooting)
9. [Performance Optimization](#performance-optimization)
10. [Security Best Practices](#security-best-practices)

---

## Prerequisites

### Required

- {{RUNTIME_REQUIREMENT}} (Node.js 18+ or Python 3.10+)
- Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
- Git (for version control)
- {{#each REQUIRED_PREREQUISITES}}
- {{this}}
{{/each}}

### Optional

- Docker (for containerized deployment)
- Cloud account (AWS/GCP/Azure) for cloud deployment
- {{#each OPTIONAL_PREREQUISITES}}
- {{this}}
{{/each}}

---

## Local Development Deployment

### Step 1: Initial Setup

```bash
# Clone or extract the agent package
cd {{AGENT_NAME}}

# Install dependencies
{{INSTALL_COMMAND}}

# Verify installation
{{VERIFY_COMMAND}}
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
{{EDIT_COMMAND}} .env
```

**Required variables**:
```bash
ANTHROPIC_API_KEY=sk-ant-...your-api-key...
{{#each REQUIRED_ENV_VARS}}
{{this}}
{{/each}}
```

### Step 3: Configure MCP Servers

See [MCP Configuration](#mcp-configuration) section below.

### Step 4: Run Tests

```bash
# Run test suite
{{TEST_COMMAND}}

# Expected: All tests passing ({{TEST_COUNT}}+ tests)
```

### Step 5: Start the Agent

```bash
# Run with example query
{{RUN_COMMAND}} "{{EXAMPLE_QUERY}}"

# Or start in development mode with auto-reload
{{DEV_COMMAND}}
```

✅ **Success indicators**:
- ✓ All MCP servers connected
- ✓ No error messages
- ✓ Expected response received

---

## MCP Configuration

### What is MCP?

The Model Context Protocol (MCP) allows the agent to access external tools and data sources. Your agent uses the following MCP servers:

{{#each MCP_SERVERS_DETAIL}}
#### {{name}}

**Purpose**: {{purpose}}
**Required**: {{#if required}}Yes{{else}}No{{/if}}
**Tools**: {{tools}}

{{#if setup_instructions}}
**Setup**:
{{setup_instructions}}
{{/if}}

---
{{/each}}

### MCP Configuration File

Create or verify `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    {{#each MCP_JSON_CONFIG}}
    "{{name}}": {
      "command": "{{command}}",
      "args": {{args}},
      "env": {{env}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  }
}
```

### Testing MCP Connections

```bash
# Test individual MCP server connection
{{TEST_MCP_COMMAND}} {{FIRST_MCP_SERVER_NAME}}

# Test all MCP connections
{{TEST_ALL_MCP_COMMAND}}
```

**Expected output**: ✓ Connected to all configured MCP servers

### MCP Troubleshooting

**Problem**: `Failed to connect to MCP server: [name]`

**Solutions**:
1. Verify server is installed:
   ```bash
   {{MCP_VERIFY_INSTALL_COMMAND}}
   ```

2. Check environment variables are set

3. Verify `.mcp.json` syntax is valid (use [jsonlint.com](https://jsonlint.com/))

4. Check server logs:
   ```bash
   {{MCP_LOG_COMMAND}}
   ```

---

## Environment Variables

### Required Variables

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...  # From console.anthropic.com

{{#each REQUIRED_ENV_DETAIL}}
# {{comment}}
{{name}}={{example_value}}
{{/each}}
```

### Optional Variables

```bash
{{#each OPTIONAL_ENV_DETAIL}}
# {{comment}} (default: {{default_value}})
{{name}}={{example_value}}
{{/each}}
```

### Environment-Specific Configuration

#### Development

```bash
{{ENV_PREFIX}}_ENV=development
LOG_LEVEL=debug
ENABLE_VERBOSE_LOGGING=true
```

#### Production

```bash
{{ENV_PREFIX}}_ENV=production
LOG_LEVEL=info
ENABLE_VERBOSE_LOGGING=false
```

### Security Best Practices

❌ **NEVER**:
- Commit `.env` files to version control
- Share API keys in plaintext
- Use production keys in development

✅ **ALWAYS**:
- Use environment variables for secrets
- Rotate API keys regularly
- Use different keys for dev/staging/production

---

## Cloud Deployment

### AWS Lambda

#### Prerequisites
- AWS account
- AWS CLI installed and configured
- Serverless Framework or AWS SAM

#### Deployment Steps

1. **Install Serverless Framework** (if not installed):
   ```bash
   npm install -g serverless
   ```

2. **Configure serverless.yml**:
   ```yaml
   service: {{AGENT_NAME_LOWERCASE}}

   provider:
     name: aws
     runtime: {{AWS_RUNTIME}}
     region: us-east-1
     environment:
       ANTHROPIC_API_KEY: ${env:ANTHROPIC_API_KEY}
       {{#each AWS_ENV_VARS}}
       {{name}}: ${env:{{name}}}
       {{/each}}

   functions:
     agent:
       handler: {{AWS_HANDLER_PATH}}
       timeout: 300
       memorySize: 1024
       events:
         - http:
             path: /execute
             method: post
   ```

3. **Deploy**:
   ```bash
   serverless deploy --stage production
   ```

4. **Test deployed endpoint**:
   ```bash
   curl -X POST https://{{API_ID}}.execute-api.us-east-1.amazonaws.com/production/execute \
     -H "Content-Type: application/json" \
     -d '{"prompt": "{{EXAMPLE_QUERY}}"}'
   ```

#### Cost Estimate

**AWS Lambda Pricing**:
- Compute: $0.0000166667 per GB-second
- Requests: $0.20 per 1M requests

**Estimated cost** ({{AWS_MONTHLY_REQUESTS}} requests/month):
- Lambda: ~${{AWS_LAMBDA_COST}}
- API Gateway: ~${{AWS_API_GATEWAY_COST}}
- **Total**: ~${{AWS_TOTAL_COST}}/month

---

### Google Cloud Run

#### Prerequisites
- Google Cloud account with billing enabled
- gcloud CLI installed

#### Deployment Steps

1. **Create Dockerfile** (already included in package)

2. **Build and push container**:
   ```bash
   # Set project
   gcloud config set project {{GCP_PROJECT_ID}}

   # Build container
   gcloud builds submit --tag gcr.io/{{GCP_PROJECT_ID}}/{{AGENT_NAME_LOWERCASE}}
   ```

3. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy {{AGENT_NAME_LOWERCASE}} \
     --image gcr.io/{{GCP_PROJECT_ID}}/{{AGENT_NAME_LOWERCASE}} \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
   ```

4. **Test**:
   ```bash
   curl -X POST https://{{SERVICE_URL}}/execute \
     -H "Content-Type: application/json" \
     -d '{"prompt": "{{EXAMPLE_QUERY}}"}'
   ```

#### Cost Estimate

**Google Cloud Run Pricing**:
- CPU: $0.00002400 per vCPU-second
- Memory: $0.00000250 per GiB-second
- Requests: $0.40 per million

**Estimated cost**: ~${{GCP_MONTHLY_COST}}/month

---

### Azure Functions

#### Prerequisites
- Azure account
- Azure Functions Core Tools
- Azure CLI

#### Deployment Steps

1. **Create Function App**:
   ```bash
   az functionapp create \
     --resource-group {{AZURE_RESOURCE_GROUP}} \
     --consumption-plan-location eastus \
     --runtime {{AZURE_RUNTIME}} \
     --functions-version 4 \
     --name {{AGENT_NAME_LOWERCASE}} \
     --storage-account {{AZURE_STORAGE_ACCOUNT}}
   ```

2. **Configure environment**:
   ```bash
   az functionapp config appsettings set \
     --name {{AGENT_NAME_LOWERCASE}} \
     --resource-group {{AZURE_RESOURCE_GROUP}} \
     --settings \
       ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
   ```

3. **Deploy**:
   ```bash
   func azure functionapp publish {{AGENT_NAME_LOWERCASE}}
   ```

#### Cost Estimate

**Azure Functions Pricing** (Consumption Plan):
- Execution: $0.000016/GB-s
- Requests: $0.20 per million

**Estimated cost**: ~${{AZURE_MONTHLY_COST}}/month

---

## Docker & Kubernetes

### Docker Deployment

#### Build Container

```bash
# Build image
docker build -t {{AGENT_NAME_LOWERCASE}}:latest .

# Test locally
docker run -p 8080:8080 \
  -e ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY} \
  {{AGENT_NAME_LOWERCASE}}:latest
```

#### Push to Registry

```bash
# Tag for registry
docker tag {{AGENT_NAME_LOWERCASE}}:latest {{DOCKER_REGISTRY}}/{{AGENT_NAME_LOWERCASE}}:1.0.0

# Push
docker push {{DOCKER_REGISTRY}}/{{AGENT_NAME_LOWERCASE}}:1.0.0
```

### Kubernetes Deployment

#### Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{AGENT_NAME_LOWERCASE}}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: {{AGENT_NAME_LOWERCASE}}
  template:
    metadata:
      labels:
        app: {{AGENT_NAME_LOWERCASE}}
    spec:
      containers:
      - name: agent
        image: {{DOCKER_REGISTRY}}/{{AGENT_NAME_LOWERCASE}}:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: agent-secrets
              key: anthropic-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: {{AGENT_NAME_LOWERCASE}}-service
spec:
  selector:
    app: {{AGENT_NAME_LOWERCASE}}
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

#### Deploy to Kubernetes

```bash
# Create secret for API key
kubectl create secret generic agent-secrets \
  --from-literal=anthropic-api-key=${ANTHROPIC_API_KEY}

# Apply deployment
kubectl apply -f k8s-deployment.yaml

# Check status
kubectl get pods
kubectl get services
```

---

## Monitoring & Observability

### Logging

#### Configure Log Level

```bash
# Development: Verbose logging
LOG_LEVEL=debug

# Production: Essential logs only
LOG_LEVEL=info
```

#### Log Formats

**Successful execution**:
```
[INFO] 2024-01-15 10:30:45 - Agent initialized
[INFO] 2024-01-15 10:30:46 - MCP servers connected: 3/3
[INFO] 2024-01-15 10:30:47 - Processing query: "{{EXAMPLE_QUERY}}"
[INFO] 2024-01-15 10:30:52 - Response generated (1,234 tokens)
```

**Error example**:
```
[ERROR] 2024-01-15 10:31:00 - Failed to connect to MCP server: dataforseo
[ERROR] Details: Connection timeout after 30s
```

### Metrics

Monitor these key metrics:

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Response Time | < 5s | > 10s |
| Error Rate | < 1% | > 5% |
| Token Usage | {{TARGET_TOKENS}}/query | > {{MAX_TOKENS}}/query |
| API Latency | < 2s | > 5s |

### Application Insights (Optional)

Integrate with monitoring platforms:

**Datadog**:
```bash
# Install Datadog agent
{{DATADOG_INSTALL_COMMAND}}

# Configure
export DD_API_KEY={{YOUR_DD_API_KEY}}
export DD_SERVICE={{AGENT_NAME_LOWERCASE}}
```

**New Relic**:
```bash
# Install New Relic agent
{{NEW_RELIC_INSTALL_COMMAND}}

# Configure
export NEW_RELIC_LICENSE_KEY={{YOUR_NR_LICENSE_KEY}}
export NEW_RELIC_APP_NAME={{AGENT_NAME}}
```

---

## Troubleshooting

### Common Issues

#### 1. "ANTHROPIC_API_KEY environment variable is required"

**Cause**: API key not set
**Solution**:
```bash
# Verify .env file exists
ls -la .env

# Check variable is set
echo $ANTHROPIC_API_KEY

# Set if missing
export ANTHROPIC_API_KEY=sk-ant-...
```

#### 2. "Failed to connect to MCP server"

**Cause**: MCP server not installed or misconfigured
**Solution**:
```bash
# Verify MCP server installation
{{MCP_VERIFY_COMMAND}}

# Check .mcp.json syntax
cat .mcp.json | jq .

# Test connection
{{MCP_TEST_COMMAND}}
```

#### 3. "Module not found" / Import errors

**Cause**: Dependencies not installed
**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules  # OR: rm -rf venv
{{INSTALL_COMMAND}}

# Verify installation
{{VERIFY_INSTALL_COMMAND}}
```

#### 4. High latency / slow responses

**Cause**: Model selection or network issues
**Solution**:
- Switch to faster model (Haiku instead of Opus)
- Check network connectivity
- Review MCP server response times
- See [Performance Optimization](#performance-optimization)

#### 5. Rate limiting errors

**Cause**: API rate limits exceeded
**Solution**:
- Implement request throttling
- Use exponential backoff
- Upgrade API tier if needed
- Cache frequent queries

---

## Performance Optimization

### Model Selection

Choose the right model for your use case:

| Use Case | Recommended Model | Avg Response Time | Cost per 1M tokens |
|----------|------------------|-------------------|-------------------|
| Simple queries | Haiku | ~1-2s | $0.80-$4.00 |
| General purpose | Sonnet | ~2-4s | $3.00-$15.00 |
| Complex reasoning | Opus | ~4-8s | $15.00-$75.00 |

### Caching Strategy

Implement response caching for frequently asked queries:

```{{PROGRAMMING_LANGUAGE_LOWERCASE}}
{{CACHING_CODE_EXAMPLE}}
```

### Batch Processing

Process multiple queries in parallel:

```{{PROGRAMMING_LANGUAGE_LOWERCASE}}
{{BATCH_PROCESSING_CODE_EXAMPLE}}
```

### Connection Pooling

Reuse MCP connections:

```{{PROGRAMMING_LANGUAGE_LOWERCASE}}
{{CONNECTION_POOLING_CODE_EXAMPLE}}
```

---

## Security Best Practices

### API Key Management

✅ **DO**:
- Store keys in environment variables
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate keys every 90 days
- Use different keys for dev/staging/prod

❌ **DON'T**:
- Hardcode keys in source code
- Commit keys to version control
- Share keys via email or chat
- Use production keys in development

### Network Security

For production deployments:

1. **Use HTTPS only**
2. **Implement rate limiting**
3. **Add API authentication**
4. **Configure firewall rules**
5. **Enable CORS appropriately**

### Data Privacy

- **Never log sensitive data** (API keys, user PII)
- **Encrypt data in transit** (TLS 1.2+)
- **Encrypt data at rest** (where applicable)
- **Implement audit logging**

---

## Support

**Technical Support**: {{SUPPORT_EMAIL}}
**Response Time**: {{SUPPORT_RESPONSE_TIME}}
**Documentation**: See [API-REFERENCE.md](API-REFERENCE.md) and [QUICK-START.md](QUICK-START.md)

**Emergency Contact**: {{EMERGENCY_CONTACT}} (production outages only)

---

**Document Version**: 1.0.0
**Last Updated**: {{LAST_UPDATED}}
**Maintained by**: ORCHESTRAI
