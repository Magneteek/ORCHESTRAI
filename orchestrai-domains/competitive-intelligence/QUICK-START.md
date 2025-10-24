# 🚀 Quick Start Guide - Competitive Intelligence System

**Get your Facebook/Instagram ad monitoring system running in 15 minutes**

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **PostgreSQL 14+** installed ([Download](https://www.postgresql.org/download/))
- [ ] **Redis** (optional but recommended) ([Download](https://redis.io/download))
- [ ] **Meta Ad Library API** credentials (free, [Get Started](https://developers.facebook.com/docs/marketing-api/))
- [ ] **Claude API key** ([Anthropic Console](https://console.anthropic.com/))
- [ ] **OpenAI API key** ([OpenAI Platform](https://platform.openai.com/))

---

## Step 1: Get Meta Ad Library API Credentials

### Create Facebook App (5 minutes)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as app type
4. Fill in:
   - **App Name**: "Ad Intelligence Tool"
   - **Contact Email**: your_email@example.com
5. Click **"Create App"**

### Get Access Token

1. In your app dashboard, go to **Tools** → **Graph API Explorer**
2. Select your app from dropdown
3. Click **"Generate Access Token"**
4. Grant permissions: `ads_read`
5. Copy the access token (starts with `EAA...`)
6. Get your **App ID** and **App Secret** from app dashboard

### Extend Token (Optional but Recommended)

```bash
# Convert short-lived token to long-lived (60 days)
curl -X GET "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
```

---

## Step 2: Get AI API Keys

### Claude API (Anthropic)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up / Log in
3. Navigate to **API Keys**
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-...`)
6. **Pricing**: Pay-as-you-go (~$50-150/month for moderate usage)

### OpenAI API

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up / Log in
3. Navigate to **API Keys**
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)
6. **Pricing**: Pay-as-you-go (~$30-100/month for moderate usage)

### Apify (Optional - For Global Markets)

1. Go to [Apify](https://apify.com/)
2. Sign up for account
3. Navigate to **Settings** → **Integrations**
4. Copy your API token
5. **Pricing**: $49-99/month for scraping

---

## Step 3: Install & Configure

### 3.1 Clone and Install

```bash
# Navigate to competitive intelligence domain
cd orchestrai-domains/competitive-intelligence

# Install dependencies
npm install

# This installs:
# - pg (PostgreSQL client)
# - redis (Redis client)
# - axios (HTTP client)
# - sentiment, natural (AI analysis)
# - express (API server)
```

### 3.2 Create Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Open in your editor
nano .env
# or
code .env
```

### 3.3 Configure Environment Variables

Edit `.env` and add your credentials:

```env
# ==================================
# Meta Ad Library API
# ==================================
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
META_APP_ID=123456789012345
META_APP_SECRET=abcdef1234567890abcdef1234567890

# Meta API rate limiting (200 requests/hour is safe)
META_API_REQUESTS_PER_HOUR=200

# ==================================
# AI APIs
# ==================================
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AI model configuration
CLAUDE_MODEL=claude-3-5-sonnet-20241022
OPENAI_MODEL=gpt-4o

# ==================================
# Database
# ==================================
DATABASE_URL=postgresql://localhost:5432/competitive_intelligence

# PostgreSQL connection pool
DB_POOL_MIN=2
DB_POOL_MAX=10

# ==================================
# Redis (Optional but Recommended)
# ==================================
REDIS_URL=redis://localhost:6379

# Cache TTL (seconds)
CACHE_TTL_ADS=3600
CACHE_TTL_ANALYSIS=86400

# ==================================
# Apify (Optional - Global Markets)
# ==================================
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==================================
# Storage (Optional - For Creative Assets)
# ==================================
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=facebook-ads-creative

# ==================================
# Email Alerts (Optional)
# ==================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ALERT_EMAIL_TO=alerts@example.com

# ==================================
# Performance Scoring Weights (Must sum to 1.0)
# ==================================
SCORE_LONGEVITY_WEIGHT=0.40
SCORE_ITERATION_WEIGHT=0.25
SCORE_ADVERTISER_QUALITY_WEIGHT=0.20
SCORE_INDUSTRY_RELEVANCE_WEIGHT=0.15

# ==================================
# Industry Keywords
# ==================================
DENTAL_B2C_KEYWORDS=dental implants,cosmetic dentistry,teeth whitening,invisalign
DENTAL_B2B_KEYWORDS=CBCT scanner,dental 3D printer,intraoral scanner
AI_SAAS_KEYWORDS=AI chatbot,automation software,AI productivity
```

---

## Step 4: Set Up Database

### 4.1 Create PostgreSQL Database

```bash
# Create database
createdb competitive_intelligence

# Verify connection
psql competitive_intelligence -c "SELECT version();"
```

### 4.2 Run Database Migrations

```bash
# Run schema creation
npm run db:migrate

# This creates:
# - ads (core ad data)
# - ad_analysis (AI analysis results)
# - collections (curated ad sets)
# - competitors (tracked advertisers)
# - templates (generated templates)
# - indexes and views
```

### 4.3 Seed Test Data (Optional)

```bash
# Add sample data for testing
npm run db:seed

# This creates:
# - 50 sample ads
# - 3 test collections
# - 5 competitor profiles
```

---

## Step 5: Start Redis (Optional)

```bash
# macOS (via Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Or run in foreground
redis-server

# Verify connection
redis-cli ping
# Should return: PONG
```

---

## Step 6: Verify Setup

Run the automated verification script:

```bash
node scripts/verify-setup.js
```

This checks:
- ✅ Node.js version (>= 18)
- ✅ PostgreSQL connection
- ✅ Redis connection
- ✅ Environment variables
- ✅ Meta Ad Library API credentials
- ✅ Claude API credentials
- ✅ OpenAI API credentials
- ✅ Database schema

**Expected output:**
```
🔍 Competitive Intelligence System - Setup Verification

✅ Node.js Version: v18.17.0 (>= 18.0.0)
✅ Env: META_ACCESS_TOKEN: Configured
✅ Env: CLAUDE_API_KEY: Configured
✅ PostgreSQL Connection: Connected successfully
✅ Database Schema: 7 tables found
✅ Meta Ad Library API: Credentials valid
✅ Claude API: Credentials valid

🎉 All critical checks passed! System is ready to run.
```

---

## Step 7: Run Your First Ad Collection

### 7.1 Run Demo (Recommended First Step)

```bash
# Run comprehensive demo with mock data
node demo-hybrid-orchestration.js

# This demonstrates:
# - System initialization
# - Ad collection workflow
# - Performance scoring
# - AI analysis with Claude Code agents
# - Template generation
# - Competitor tracking
```

### 7.2 Collect Real Ads

Create a test script `test-collection.js`:

```javascript
const CompetitiveIntelligenceHub = require('./competitive-intelligence-domain-hub');

async function main() {
    const hub = new CompetitiveIntelligenceHub();

    // Initialize system
    console.log('🚀 Initializing...');
    await hub.initialize();

    // Collect ads from Meta Ad Library
    console.log('\n📡 Collecting ads...');
    const result = await hub.collectAds({
        keywords: ['dental implants'],
        industries: ['dental_b2c'],
        markets: ['NL', 'BE'],
        limit: 20
    });

    console.log(`\n✅ Results:`);
    console.log(`  Total ads collected: ${result.totalAds}`);
    console.log(`  New ads: ${result.newAds}`);
    console.log(`  Top performers (score >= 80): ${result.topPerformers.length}`);

    // Show top 3 ads
    console.log('\n🏆 Top 3 Performing Ads:');
    result.topPerformers.slice(0, 3).forEach((ad, i) => {
        console.log(`  ${i + 1}. ${ad.headline}`);
        console.log(`     Score: ${ad.performanceScore}/100`);
        console.log(`     Advertiser: ${ad.advertiserName}`);
        console.log(`     Running: ${ad.daysRunning} days`);
    });

    await hub.shutdown();
}

main();
```

Run it:
```bash
node test-collection.js
```

---

## Step 8: Start Production Services

### 8.1 Start Domain Hub

```bash
# Terminal 1: Domain hub orchestrator
npm start

# This starts:
# - Infrastructure agents
# - Event-driven coordination
# - Automated pipelines
```

### 8.2 Start API Server

```bash
# Terminal 2: REST API server
npm run api

# API available at: http://localhost:3000
```

### 8.3 Access API Endpoints

```bash
# Get all ads
curl http://localhost:3000/api/ads

# Get top performing ads
curl http://localhost:3000/api/ads/top?limit=10

# Get ad by ID
curl http://localhost:3000/api/ads/{adId}

# Analyze ad with AI
curl -X POST http://localhost:3000/api/ads/{adId}/analyze

# Generate template
curl -X POST http://localhost:3000/api/ads/{adId}/template

# Track competitor
curl -X POST http://localhost:3000/api/competitors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Competitor Dental Clinic",
    "facebookPageId": "123456789",
    "industry": "dental_b2c"
  }'
```

---

## Step 9: Schedule Automated Collection

### 9.1 Set Up Cron Jobs

Add to your system's crontab:

```bash
# Edit crontab
crontab -e

# Add these lines:

# Collect ads daily at 6 AM
0 6 * * * cd /path/to/competitive-intelligence && npm run pipeline:collection

# Run AI analysis daily at 8 AM
0 8 * * * cd /path/to/competitive-intelligence && npm run pipeline:analysis

# Update ad libraries at noon
0 12 * * * cd /path/to/competitive-intelligence && npm run pipeline:library-update

# Check competitors every 6 hours
0 */6 * * * cd /path/to/competitive-intelligence && npm run pipeline:competitor-check
```

### 9.2 Configure in .env

```env
# Cron schedules (crontab syntax)
AD_COLLECTION_CRON=0 6 * * *        # Daily at 6 AM
AD_ANALYSIS_CRON=0 8 * * *          # Daily at 8 AM
LIBRARY_UPDATE_CRON=0 12 * * *      # Daily at noon
COMPETITOR_CHECK_CRON=0 */6 * * *   # Every 6 hours
```

---

## Common Issues & Solutions

### Issue: "Invalid access token"

**Solution:**
1. Generate new token at Facebook Graph API Explorer
2. Ensure token has `ads_read` permission
3. Use long-lived token (60 days) instead of short-lived (1 hour)
4. Update `META_ACCESS_TOKEN` in `.env`

### Issue: "Rate limit exceeded"

**Solution:**
1. Reduce `META_API_REQUESTS_PER_HOUR` in `.env` to 150
2. System automatically queues requests
3. Consider upgrading Facebook app tier

### Issue: "Connection refused to PostgreSQL"

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Verify DATABASE_URL in .env
```

### Issue: "Redis connection failed"

**Solution:**
```bash
# Redis is optional but recommended
# Start Redis
redis-server

# Or disable Redis by commenting out REDIS_URL in .env
```

### Issue: "Claude API rate limit"

**Solution:**
1. Reduce `AI_ANALYSIS_BATCH_SIZE` in `.env`
2. Add delays between requests
3. Consider upgrading Claude API tier
4. Process ads in smaller batches

---

## Next Steps

### 1. Explore the Demo
```bash
node demo-hybrid-orchestration.js
```

### 2. Create Custom Collections
```javascript
await hub.createCollection({
  name: 'Best Dental Implant Ads',
  filters: {
    industry: 'dental_b2c',
    minPerformanceScore: 80
  }
});
```

### 3. Track Your Competitors
```javascript
await hub.trackCompetitor({
  name: 'Competitor Name',
  facebookPageId: 'their_page_id',
  alertOnNewCampaign: true
});
```

### 4. Generate Templates
```javascript
const template = await hub.generateTemplate({
  adId: 'top-performing-ad-id',
  includeAbTestVariations: true
});
```

### 5. Export Collections
```javascript
await hub.exportCollection('collection-id', 'pdf');
// Formats: pdf, csv, notion, slides, json, zip
```

---

## 📚 Additional Resources

- **Full Documentation**: [README.md](README.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Agent Specifications**: [docs/AGENTS.md](docs/AGENTS.md)
- **Performance Scoring**: [docs/SCORING.md](docs/SCORING.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🆘 Getting Help

### Documentation
- Read the full [README.md](README.md)
- Check [Troubleshooting](README.md#troubleshooting) section

### Community
- GitHub Issues: [Report bugs or request features](https://github.com/orchestrai/competitive-intelligence/issues)
- ORCHESTRAI Docs: [System architecture](../../../CLAUDE.md)

### Support
- Email: support@orchestrai.io
- Discord: [Join community](https://discord.gg/orchestrai)

---

**🎉 Congratulations! Your Competitive Intelligence System is ready!**

Start monitoring your competitors' best-performing ads and gain the competitive edge! 🚀
