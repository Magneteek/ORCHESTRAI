# Facebook Ads Manager - AI Insights System

## Overview

Complete AI-powered insights system using Anthropic Claude API for performance predictions, anomaly detection, copy optimization, and audience analysis.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Insights Dashboard                     │
│              /app/dashboard/ai-insights/page.tsx             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─ Performance Predictions
                   ├─ Anomaly Detection
                   ├─ Copy Optimization
                   └─ Audience Insights
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                      API Endpoints                           │
├──────────────────────────────────────────────────────────────┤
│  POST /api/ai/predict              - Generate predictions    │
│  GET  /api/ai/anomalies            - Get anomalies           │
│  POST /api/ai/anomalies            - Trigger detection       │
│  POST /api/ai/optimize-copy        - Optimize ad copy        │
│  GET  /api/ai/audience-insights    - Get insights            │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                      AI Core Modules                         │
├──────────────────────────────────────────────────────────────┤
│  /lib/ai/client.ts                 - Claude API client       │
│  /lib/ai/performance-predictor.ts  - ROAS/CTR predictions    │
│  /lib/ai/anomaly-detector.ts       - Metric anomalies        │
│  /lib/ai/copy-optimizer.ts         - Ad copy suggestions     │
│  /lib/ai/audience-insights.ts      - Targeting analysis      │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                   Background Jobs (BullMQ)                   │
├──────────────────────────────────────────────────────────────┤
│  /lib/queue/jobs/ai-analysis.ts                              │
│  /lib/queue/jobs/anomaly-detection.ts                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                    Redis + PostgreSQL                        │
│              Caching + Queue + Data Storage                  │
└──────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. AI Client (`/lib/ai/client.ts`)

**Purpose**: Centralized Anthropic Claude API integration with production-ready features

**Features**:
- ✅ Retry logic with exponential backoff (3 attempts)
- ✅ Rate limiting (50 requests/minute)
- ✅ Token usage tracking and cost calculation
- ✅ Request/response logging
- ✅ JSON parsing with error handling
- ✅ Health check endpoint

**Usage**:
```typescript
import { callClaude, parseClaudeJson, getTokenUsageStats } from '@/lib/ai/client';

const { content, usage } = await callClaude(
  systemPrompt,
  userPrompt,
  'analysis_type',
  { maxTokens: 4096, temperature: 0.7 }
);

const result = parseClaudeJson<MyType>(content);
const stats = getTokenUsageStats('analysis_type');
```

**Cost Tracking**: Automatic cost calculation based on Claude Sonnet pricing
- Input: $3 per million tokens
- Output: $15 per million tokens

### 2. Performance Predictor (`/lib/ai/performance-predictor.ts`)

**Purpose**: AI-powered 7-day performance forecasting

**Functions**:
- `predictPerformance()` - Generate predictions with confidence scores
- `evaluatePredictionAccuracy()` - Compare predictions vs actuals

**Features**:
- 24-hour cache TTL
- Historical data analysis (30 days)
- Day-of-week seasonality detection
- Trend momentum analysis
- Confidence scoring (0-1)

**Response Structure**:
```typescript
{
  predictions: [
    {
      date: "2024-01-15",
      spend: 500,
      roas: 3.2,
      ctr: 0.025,
      impressions: 50000,
      clicks: 1250
    }
  ],
  confidence: 0.85,
  factors: ["Recent upward trend", "Strong weekend performance"],
  recommendations: [
    {
      action: "Increase budget",
      impact: "high",
      description: "Scale winning ads"
    }
  ],
  summary: "Performance expected to improve over next 7 days"
}
```

### 3. Anomaly Detector (`/lib/ai/anomaly-detector.ts`)

**Purpose**: Real-time detection of unusual performance patterns

**Functions**:
- `detectAnomalies()` - Analyze current vs historical metrics
- `getRecentAnomalies()` - Fetch recent detections
- `calculateHistoricalStats()` - Compute baselines
- `detectAnomaliesBatch()` - Process multiple accounts

**Features**:
- Statistical deviation analysis (Z-scores)
- 4-hour cache TTL
- Critical alert triggering
- Severity classification (minor/moderate/critical)
- Root cause analysis

**Anomaly Structure**:
```typescript
{
  anomalies: [
    {
      metric: "roas",
      severity: "critical",
      currentValue: 1.2,
      expectedValue: 3.5,
      deviation: -65.7,  // percentage
      description: "ROAS significantly below expected",
      likelyCauses: ["Creative fatigue", "Audience saturation"],
      recommendations: ["Refresh ad creative", "Expand targeting"]
    }
  ],
  overallStatus: "critical",
  summary: "Critical performance degradation detected"
}
```

### 4. Copy Optimizer (`/lib/ai/copy-optimizer.ts`)

**Purpose**: AI-powered ad copy improvement suggestions

**Functions**:
- `optimizeAdCopy()` - Generate copy suggestions
- `generateABTestVariants()` - Create A/B test variations
- `analyzeABTestResults()` - Statistical significance testing
- `optimizeCopiesBatch()` - Bulk optimization

**Features**:
- 7-day cache TTL
- Psychographic targeting consideration
- Predicted CTR improvement estimates
- A/B testing recommendations
- Statistical confidence calculations

**Optimization Structure**:
```typescript
{
  analysis: {
    currentPerformance: {
      ctr: 0.02,
      engagement: "medium",
      strengths: ["Clear value prop", "Strong CTA"],
      weaknesses: ["Headline lacks urgency", "Generic language"]
    }
  },
  suggestions: [
    {
      type: "headline",
      original: "Buy Now and Save",
      alternatives: [
        {
          text: "Save 50% Today Only - Limited Stock!",
          reasoning: "Creates urgency and scarcity",
          predictedCtrImprovement: 15.5  // percentage
        }
      ]
    }
  ],
  abTestRecommendations: [
    {
      variant: "Urgency Test",
      hypothesis: "Time-limited offers increase CTR",
      expectedLift: "10-20%"
    }
  ],
  summary: "Focus on adding urgency and emotional triggers"
}
```

### 5. Audience Insights (`/lib/ai/audience-insights.ts`)

**Purpose**: Targeting optimization and audience expansion

**Functions**:
- `analyzeAudience()` - Comprehensive audience analysis
- `detectAudienceFatigue()` - Identify creative exhaustion
- `generateLookalikeRecommendations()` - LAL audience suggestions
- `analyzeBudgetAllocation()` - Optimize spend distribution
- `calculateSegmentScore()` - Segment performance scoring

**Features**:
- 48-hour cache TTL
- Segment performance ranking
- Expansion opportunity identification
- Budget reallocation recommendations
- Fatigue detection with indicators

**Insights Structure**:
```typescript
{
  topPerformingSegments: [
    {
      segment: "25-34, Female, Mobile",
      type: "age",
      spend: 1500,
      roas: 4.2,
      conversions: 85,
      insight: "Strong performer, consider scaling"
    }
  ],
  underperformingSegments: [
    {
      segment: "55-64, Desktop",
      type: "age",
      spend: 800,
      roas: 1.1,
      issue: "High CPA, low conversion rate",
      recommendation: "Pause or adjust targeting"
    }
  ],
  expansionOpportunities: [
    {
      opportunity: "Lookalike 1% from top converters",
      segment: "Similar to 25-34 converters",
      reasoning: "High match quality potential",
      expectedRoas: 3.8,
      riskLevel: "low"
    }
  ],
  targetingRecommendations: [
    {
      action: "Create LAL audience from purchasers",
      impact: "high",
      description: "Expand to high-value similar users"
    }
  ],
  summary: "Strong performance in 25-34 age group, expand with lookalikes"
}
```

## Background Jobs

### AI Analysis Job (`/lib/queue/jobs/ai-analysis.ts`)

**Schedule**: Daily at midnight (cron: `0 0 * * *`)

**Tasks**:
- Performance predictions for all active accounts
- Copy optimization for top ads
- Audience insights generation

**Usage**:
```typescript
import { scheduleAIAnalysis, scheduleRecurringAnalysis } from '@/lib/queue/jobs/ai-analysis';

// One-time analysis
await scheduleAIAnalysis('account-id', 'all');

// Set up recurring for all accounts
await scheduleRecurringAnalysis();
```

### Anomaly Detection Job (`/lib/queue/jobs/anomaly-detection.ts`)

**Schedule**: Every 4 hours (cron: `0 */4 * * *`)

**Tasks**:
- Statistical anomaly detection
- Critical alert triggering
- Performance baseline updates

**Usage**:
```typescript
import { scheduleAnomalyDetection, runImmediateAnomalyDetection } from '@/lib/queue/jobs/anomaly-detection';

// Schedule periodic check
await scheduleAnomalyDetection('account-id');

// Immediate check
const result = await runImmediateAnomalyDetection('account-id');
```

## API Endpoints

### Performance Predictions

**POST** `/api/ai/predict`
```json
{
  "adAccountId": "act_123456",
  "campaignId": "optional-campaign-id",
  "predictionDays": 7
}
```

**GET** `/api/ai/predict?adAccountId=act_123456`
Returns recent predictions

**Rate Limit**: 5 requests/minute per user

### Anomaly Detection

**GET** `/api/ai/anomalies?adAccountId=act_123456&hours=24`
Returns recent anomalies and alerts

**POST** `/api/ai/anomalies`
```json
{
  "adAccountId": "act_123456",
  "campaignId": "optional-campaign-id"
}
```
Triggers immediate anomaly detection

**PATCH** `/api/ai/anomalies`
```json
{
  "alertId": "alert-id",
  "status": "read|resolved"
}
```
Updates alert status

### Copy Optimization

**POST** `/api/ai/optimize-copy`
```json
{
  "adAccountId": "act_123456",
  "adCopy": {
    "headline": "Your Headline",
    "primaryText": "Your primary text",
    "description": "Optional description",
    "callToAction": "SHOP_NOW",
    "performance": {
      "ctr": 0.02,
      "impressions": 10000,
      "clicks": 200
    }
  },
  "campaignObjective": "CONVERSIONS",
  "targetAudience": "25-34 year old professionals",
  "generateVariants": true
}
```

**GET** `/api/ai/optimize-copy?adAccountId=act_123456`
Returns recent optimizations

**Rate Limit**: 3 requests/minute per user

### Audience Insights

**POST** `/api/ai/audience-insights`
```json
{
  "adAccountId": "act_123456",
  "campaignId": "optional-campaign-id"
}
```

**GET** `/api/ai/audience-insights?adAccountId=act_123456&checkFatigue=true`
Returns recent insights and optional fatigue analysis

**Rate Limit**: 5 requests/5 minutes per user

## Dashboard Features

### AI Insights Dashboard (`/app/dashboard/ai-insights/page.tsx`)

**Tabs**:
1. **Performance Predictions**
   - 7-day forecast visualization
   - Confidence scores
   - Actionable recommendations
   - Historical accuracy tracking

2. **Anomaly Detection**
   - Real-time status monitoring
   - Anomaly severity classification
   - Root cause analysis
   - Resolution tracking

3. **Copy Optimization**
   - Recent optimization history
   - A/B test suggestions
   - CTR improvement predictions
   - Variant generation

4. **Audience Insights**
   - Top/underperforming segments
   - Expansion opportunities
   - Budget allocation recommendations
   - Fatigue detection warnings

**Real-time Updates**:
- Predictions: 60-second refresh
- Anomalies: 4-minute refresh
- Auto-refresh on user actions

## Redis Integration

### Caching Strategy

**Performance Predictions**: 24 hours
**Anomaly Detection**: 4 hours
**Copy Optimization**: 7 days
**Audience Insights**: 48 hours

### Rate Limiting

Implemented via Redis sorted sets:
- User-based rate limiting
- Endpoint-specific limits
- Automatic reset windows
- Remaining quota headers

**Usage**:
```typescript
import { RateLimiter } from '@/lib/redis/client';

const limit = await RateLimiter.checkLimit(
  'user-id',
  10,  // max requests
  60   // window in seconds
);

if (!limit.allowed) {
  // Rate limit exceeded
  console.log(`Retry in ${limit.resetAt - Date.now()}ms`);
}
```

## Database Schema Requirements

### Required Tables

**aiAnalysis**:
```sql
CREATE TABLE aiAnalysis (
  id TEXT PRIMARY KEY,
  adAccountId TEXT NOT NULL,
  analysisType TEXT NOT NULL,  -- 'performance_prediction', 'anomaly_detection', etc.
  insights JSONB NOT NULL,
  recommendations JSONB,
  confidence FLOAT,
  validUntil TIMESTAMP,
  metadata JSONB,
  analyzedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (adAccountId) REFERENCES AdAccount(id)
);

CREATE INDEX idx_aiAnalysis_account_type ON aiAnalysis(adAccountId, analysisType);
CREATE INDEX idx_aiAnalysis_validUntil ON aiAnalysis(validUntil);
```

**aiAlert**:
```sql
CREATE TABLE aiAlert (
  id TEXT PRIMARY KEY,
  adAccountId TEXT NOT NULL,
  alertType TEXT NOT NULL,  -- 'critical_anomaly', 'performance_warning', etc.
  severity TEXT NOT NULL,   -- 'minor', 'moderate', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  status TEXT DEFAULT 'unread',  -- 'unread', 'read', 'resolved'
  resolvedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (adAccountId) REFERENCES AdAccount(id)
);

CREATE INDEX idx_aiAlert_account_status ON aiAlert(adAccountId, status);
CREATE INDEX idx_aiAlert_severity ON aiAlert(severity);
```

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Redis (for caching and queues)
REDIS_URL=redis://localhost:6379
BULLMQ_REDIS_HOST=localhost
BULLMQ_REDIS_PORT=6379

# Database
DATABASE_URL=postgresql://...

# Optional monitoring
SENTRY_DSN=...
```

## Cost Optimization

### Token Usage Tracking

All AI calls automatically track token usage and costs:

```typescript
import { getTokenUsageStats } from '@/lib/ai/client';

// Get stats for specific analysis type
const stats = getTokenUsageStats('performance_prediction');
console.log({
  inputTokens: stats.inputTokens,
  outputTokens: stats.outputTokens,
  totalCost: stats.totalCost  // in USD
});

// Get all stats
const allStats = getTokenUsageStats();
```

### Caching Strategy

Aggressive caching to minimize API calls:
- Predictions: 24h (daily refresh sufficient)
- Anomalies: 4h (matches scan frequency)
- Copy: 7d (copy doesn't change often)
- Audience: 48h (balanced insight freshness)

### Batch Processing

Use batch functions for multiple operations:
```typescript
import { detectAnomaliesBatch, optimizeCopiesBatch } from '@/lib/ai';

// Process multiple accounts efficiently
const results = await detectAnomaliesBatch(requests);
```

## Error Handling

### Retry Logic

- **Automatic retries**: 3 attempts with exponential backoff
- **4xx errors**: No retry (client error)
- **5xx errors**: Retry with backoff (2s, 4s, 8s)

### Graceful Degradation

- **Missing data**: Skip analysis with informative message
- **API failures**: Return cached results when available
- **Rate limits**: Queue requests for later processing

## Testing

### Unit Tests

```bash
npm run test
```

Test coverage includes:
- AI client retry logic
- JSON parsing edge cases
- Statistical calculations
- Rate limiting behavior

### Integration Tests

```bash
npm run test:e2e
```

Tests full workflows:
- End-to-end prediction generation
- Anomaly detection pipeline
- Copy optimization flow
- Audience analysis process

## Monitoring & Logging

### Console Logging

All AI operations log:
- Analysis type and account ID
- Token usage and costs
- Errors with stack traces
- Performance metrics

### Alert Monitoring

Critical anomalies trigger:
- Database alert storage
- Console warnings
- TODO: Email notifications
- TODO: Webhook integrations

## Future Enhancements

### Planned Features

- [ ] Email notifications for critical anomalies
- [ ] Slack/Teams webhook integration
- [ ] Predictive budget recommendations
- [ ] Automated campaign optimization triggers
- [ ] Multi-language copy optimization
- [ ] Competitive analysis integration
- [ ] Custom alert thresholds per account
- [ ] Historical accuracy dashboard
- [ ] Cost vs value ROI tracking

### Advanced Analytics

- [ ] Prediction accuracy ML model
- [ ] Anomaly detection fine-tuning
- [ ] Custom segment definitions
- [ ] Advanced attribution modeling
- [ ] Cross-campaign insights

## Support & Troubleshooting

### Common Issues

**Issue**: "Rate limit exceeded"
**Solution**: Implement request queuing or increase rate limits

**Issue**: "Insufficient historical data"
**Solution**: Ensure at least 7 days of campaign data exists

**Issue**: "Claude API timeout"
**Solution**: Check API key validity and network connectivity

### Debug Mode

Enable verbose logging:
```typescript
process.env.AI_DEBUG = 'true';
```

## License

MIT License - See LICENSE file for details

---

**Built with**:
- Anthropic Claude 3.7 Sonnet
- Next.js 15
- BullMQ
- Redis
- PostgreSQL
- TypeScript
