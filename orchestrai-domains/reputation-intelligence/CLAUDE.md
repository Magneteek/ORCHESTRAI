# Reputation Intelligence Domain

## Domain Overview

The Reputation Intelligence Domain provides Google reviews analysis, sentiment tracking, negative review monitoring, and competitive reputation intelligence for Netherlands businesses using DATAforSEO Business Data API.

**Domain Focus**: Review analysis, sentiment tracking, reputation monitoring, competitive intelligence

---

## Specialized Agents

### Reputation & Review Agents
- **`reviews-intelligence-specialist`** - Google reviews analysis, sentiment analysis, negative review monitoring
- **`sentiment-analysis-specialist`** - Multi-language sentiment analysis
- **`client-branding-intelligence`** - Brand reputation and positioning analysis

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Reputation Intelligence Workflows

### 1. Negative Review Monitoring

**Direct Agent Invocation with DATAforSEO**

```
Task tool → reviews-intelligence-specialist → Negative Review Analysis

DATAforSEO Query:
mcp__dataforseo__business_data_reviews_filtered({
  cid: "business-client-id",
  max_rating: 3,        // 1-3 star reviews
  days_back: 10,        // Last 10 days
  location_code: 2528   // Netherlands
})

Analysis Deliverables:
- Negative review identification
- Sentiment breakdown
- Common complaint themes
- Response recommendations
- Competitive comparison
```

**Use When**: Proactive reputation monitoring, issue identification

### 2. Competitive Reputation Analysis

**Direct Agent Invocation**

```
Task tool → reviews-intelligence-specialist → Competitive Analysis

Competitive Metrics:
- Average rating comparison
- Review volume trends
- Sentiment distribution
- Response rate analysis
- Common strengths/weaknesses
```

**Use When**: Understanding competitive positioning, identifying opportunities

### 3. Sentiment Analysis

**Direct Agent Invocation**

```
Task tool → sentiment-analysis-specialist → Multi-Language Sentiment

Analysis Coverage:
- Dutch language sentiment analysis
- Positive/negative/neutral classification
- Emotion detection (anger, satisfaction, frustration)
- Trending sentiment over time
```

**Use When**: Understanding customer sentiment patterns

---

## DATAforSEO Business Data Integration

### Business Search
```javascript
// Find businesses in Netherlands
mcp__dataforseo__business_data_search({
  keyword: "tandarts",
  location_name: "Amsterdam,Netherlands",
  language_name: "Dutch",
  limit: 50
})
```

### Business Information
```javascript
// Get detailed business data
mcp__dataforseo__business_data_info({
  cid: "business-client-id",
  location_code: 2528  // Netherlands
})
```

### Review Analysis
```javascript
// Get all reviews
mcp__dataforseo__business_data_reviews({
  cid: "business-client-id",
  sort_by: "date",
  limit: 100
})

// Get filtered negative reviews (last 10 days, 1-3 stars)
mcp__dataforseo__business_data_reviews_filtered({
  cid: "business-client-id",
  max_rating: 3,
  days_back: 10,
  location_code: 2528
})
```

---

## Integration with Universal Agent Pattern

```javascript
// Negative review monitoring
Task(
  subagent_type="reviews-intelligence-specialist",
  prompt="Monitor negative reviews for [business] in last 30 days and identify themes..."
)

// Competitive reputation analysis
Task(
  subagent_type="reviews-intelligence-specialist",
  prompt="Analyze competitive reputation landscape for dental practices in Amsterdam..."
)

// Sentiment tracking
Task(
  subagent_type="sentiment-analysis-specialist",
  prompt="Track sentiment trends for [business] over last quarter..."
)
```

---

## Integration with Local SEO

```
Reputation Intelligence → Local SEO

Review Signals Impact:
- Review quantity (local pack ranking)
- Review velocity (freshness signal)
- Review diversity (multiple platforms)
- Review responses (engagement signal)
```

**See [../local-seo/CLAUDE.md](../local-seo/CLAUDE.md) for local SEO integration.**

---

## File Organization

```
/projects/[client-uuid]/
├── deliverables/
│   └── reputation/
│       ├── review-analysis/
│       │   ├── negative-reviews-last-30-days.json
│       │   ├── sentiment-breakdown.json
│       │   └── response-recommendations.md
│       ├── competitive-analysis/
│       │   ├── competitor-reputation-comparison.json
│       │   └── market-positioning.md
│       └── monitoring/
│           ├── review-alerts.json
│           └── sentiment-trends.json
```

---

## Reputation Management Best Practices

### Review Response Strategy
```
Positive Reviews:
✅ Respond within 24-48 hours
✅ Thank reviewer by name
✅ Mention specific details from review
✅ Invite them back

Negative Reviews:
✅ Respond within 24 hours
✅ Acknowledge concern
✅ Apologize (if appropriate)
✅ Offer offline resolution
✅ Show willingness to improve
❌ Argue or defend
❌ Ignore or delete
```

### Proactive Monitoring
```
Daily Monitoring:
- New reviews (all ratings)
- Negative reviews (1-3 stars)
- Competitor reviews
- Sentiment trends

Weekly Analysis:
- Review velocity trends
- Common themes
- Response effectiveness
- Competitive positioning

Monthly Reporting:
- Overall reputation score
- Sentiment distribution
- Response rate metrics
- Competitive benchmarking
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[../local-seo/CLAUDE.md](../local-seo/CLAUDE.md)** - Local SEO integration
- **[../../.claude/agents/reviews-intelligence-specialist.md](../../.claude/agents/reviews-intelligence-specialist.md)** - Reviews agent

---

**This domain provides proactive reputation monitoring for Netherlands businesses. Use DATAforSEO Business Data API for review intelligence.**
