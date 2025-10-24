# 🧪 Testing Guide - Competitive Intelligence System

**Complete guide to testing the competitive intelligence system step-by-step**

---

## 📋 Testing Checklist

Use this checklist to track your testing progress:

- [ ] **Environment Setup**: Configure credentials and database
- [ ] **System Verification**: Run automated verification script
- [ ] **Infrastructure Agents**: Test each agent individually
- [ ] **Demo Workflow**: Run comprehensive demo
- [ ] **REST API**: Test authentication and endpoints
- [ ] **Automated Pipelines**: Test collection and analysis
- [ ] **End-to-End**: Full workflow from collection to template

---

## Step 1: Environment Setup (5 minutes)

### 1.1 Configure Environment Variables

```bash
cd orchestrai-domains/competitive-intelligence

# Copy example configuration
cp .env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

**Minimum Required Configuration:**
```env
# Meta Ad Library API (REQUIRED for ad collection)
META_ACCESS_TOKEN=your_token_here
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# Database (REQUIRED)
DATABASE_URL=postgresql://localhost:5432/competitive_intelligence

# AI Analysis (REQUIRED for Claude Code agents)
CLAUDE_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key

# Redis (OPTIONAL but recommended)
REDIS_URL=redis://localhost:6379

# Priority Markets
TARGET_MARKETS=ES,NL,BE,DE
```

**Optional Configuration:**
```env
# Apify (for global markets)
APIFY_API_TOKEN=your_apify_token

# Cloudflare R2 (for creative storage)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key

# Email Alerts
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 1.2 Install Dependencies

```bash
npm install
```

### 1.3 Create Database

```bash
# Create database
createdb competitive_intelligence

# Verify connection
psql competitive_intelligence -c "SELECT version();"
```

### 1.4 Run Database Migrations

```bash
npm run db:migrate
```

---

## Step 2: System Verification (2 minutes)

### 2.1 Run Automated Verification

```bash
node scripts/verify-setup.js
```

**Expected Output:**
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

**If you see errors:**
- Check that PostgreSQL is running: `pg_isready`
- Verify API credentials in `.env`
- Ensure database migrations ran successfully

---

## Step 3: Test Infrastructure Agents (10 minutes)

### 3.1 Create Test Script

Create `test-agents.js`:

```javascript
const CompetitiveIntelligenceHub = require('./competitive-intelligence-domain-hub');

async function testAgents() {
    console.log('🧪 Testing Infrastructure Agents...\n');

    const hub = new CompetitiveIntelligenceHub();

    try {
        // Initialize
        console.log('📡 Initializing domain hub...');
        await hub.initialize();
        console.log('✅ Domain hub initialized\n');

        // Test 1: Meta Ad Collector
        console.log('🧪 Test 1: Meta Ad Collector');
        const metaCollector = hub.agents.get('meta-ad-collector');
        if (metaCollector.isInitialized) {
            console.log('✅ Meta Ad Collector ready');
        } else {
            console.log('⚠️  Meta Ad Collector not initialized (check credentials)');
        }

        // Test 2: Performance Scorer
        console.log('\n🧪 Test 2: Performance Scorer');
        const scorer = hub.agents.get('performance-scorer');
        const testAd = {
            startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: null,
            advertiserVerified: true,
            headline: 'Best dental implants in Spain',
            primaryText: 'Get dental implants with 20 years warranty',
            industry: 'dental_b2c'
        };
        const score = await scorer.scoreAd(testAd);
        console.log(`✅ Score calculated: ${score.totalScore}/100`);
        console.log(`   Longevity: ${score.longevityScore}`);
        console.log(`   Iteration: ${score.iterationScore}`);
        console.log(`   Quality: ${score.advertiserQualityScore}`);
        console.log(`   Relevance: ${score.industryRelevanceScore}`);

        // Test 3: Database Coordinator
        console.log('\n🧪 Test 3: Database Coordinator');
        const db = hub.agents.get('database-coordinator');
        const result = await db.pool.query('SELECT COUNT(*) FROM ads');
        console.log(`✅ Database connection working`);
        console.log(`   Current ads in database: ${result.rows[0].count}`);

        // Test 4: Apify Orchestrator
        console.log('\n🧪 Test 4: Apify Orchestrator');
        const apify = hub.agents.get('apify-orchestrator');
        if (apify.isInitialized) {
            console.log('✅ Apify Orchestrator ready');
        } else {
            console.log('⚠️  Apify not configured (optional for MVP)');
        }

        // Test 5: Storage Manager
        console.log('\n🧪 Test 5: Storage Manager');
        const storage = hub.agents.get('storage-manager');
        if (storage.isInitialized) {
            console.log('✅ Storage Manager ready (R2/S3 configured)');
        } else {
            console.log('⚠️  Storage not configured (optional for MVP)');
        }

        console.log('\n═══════════════════════════════════════════════');
        console.log('✅ All Core Agents Tested Successfully!');
        console.log('═══════════════════════════════════════════════\n');

        await hub.shutdown();

    } catch (error) {
        console.error('\n❌ Agent test failed:', error);
        await hub.shutdown();
        process.exit(1);
    }
}

testAgents();
```

**Run the test:**
```bash
node test-agents.js
```

---

## Step 4: Run Comprehensive Demo (5 minutes)

### 4.1 Run Demo with Mock Data

```bash
node demo-hybrid-orchestration.js
```

**What to expect:**
- ✅ System initialization
- ✅ Mock ad collection (20 sample ads)
- ✅ Performance scoring
- ✅ AI analysis simulation
- ✅ Template generation
- ✅ Competitor tracking simulation
- ✅ Summary statistics

**Demo validates:**
- Event-driven coordination
- Agent communication
- Scoring algorithm
- Data flow through system

---

## Step 5: Test Real Ad Collection (10 minutes)

### 5.1 Create Collection Test

Create `test-collection.js`:

```javascript
const CompetitiveIntelligenceHub = require('./competitive-intelligence-domain-hub');

async function testCollection() {
    console.log('🧪 Testing Real Ad Collection...\n');

    const hub = new CompetitiveIntelligenceHub();

    try {
        await hub.initialize();

        // Collect small batch of real ads
        console.log('📡 Collecting ads from Meta Ad Library...');
        console.log('   Markets: ES, NL');
        console.log('   Keywords: dental implants');
        console.log('   Limit: 10 ads\n');

        const result = await hub.collectAds({
            keywords: ['dental implants'],
            industries: ['dental_b2c'],
            markets: ['ES', 'NL'],
            limit: 10
        });

        console.log('═══════════════════════════════════════════════');
        console.log('📊 Collection Results');
        console.log('═══════════════════════════════════════════════');
        console.log(`Total ads: ${result.totalAds}`);
        console.log(`New ads: ${result.newAds}`);
        console.log(`Top performers: ${result.topPerformers.length}`);

        if (result.topPerformers.length > 0) {
            console.log('\n🏆 Top 3 Performers:');
            result.topPerformers.slice(0, 3).forEach((ad, i) => {
                console.log(`${i + 1}. ${ad.headline}`);
                console.log(`   Score: ${ad.performanceScore}/100`);
                console.log(`   Advertiser: ${ad.advertiserName}`);
                console.log(`   Running: ${ad.daysRunning} days\n`);
            });
        }

        await hub.shutdown();

    } catch (error) {
        console.error('❌ Collection test failed:', error);
        await hub.shutdown();
        process.exit(1);
    }
}

testCollection();
```

**Run the test:**
```bash
node test-collection.js
```

---

## Step 6: Test REST API (15 minutes)

### 6.1 Start API Server

```bash
# Terminal 1: Start API server
npm run api
```

Server should start at `http://localhost:5600`

### 6.2 Test Authentication

**Register a test user:**
```bash
curl -X POST http://localhost:5600/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-...",
      "email": "test@example.com",
      "name": "Test User",
      "role": "user",
      "subscriptionTier": "starter"
    },
    "token": "eyJhbGc...",
    "expiresIn": "7d"
  }
}
```

**Save the token** for subsequent requests.

**Login (alternative):**
```bash
curl -X POST http://localhost:5600/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123"
  }'
```

### 6.3 Test API Endpoints

**Set your token:**
```bash
export TOKEN="your_token_here"
```

**Test 1: Health Check**
```bash
curl http://localhost:5600/health
```

**Test 2: List Ads**
```bash
curl http://localhost:5600/api/ads \
  -H "Authorization: Bearer $TOKEN"
```

**Test 3: Get Top Performing Ads**
```bash
curl "http://localhost:5600/api/ads/top?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

**Test 4: Search Ads**
```bash
curl -X POST http://localhost:5600/api/ads/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "implants",
    "industry": "dental_b2c",
    "minScore": 70,
    "limit": 10
  }'
```

**Test 5: Trigger Manual Collection**
```bash
curl -X POST http://localhost:5600/api/system/collect \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["dental implants"],
    "industries": ["dental_b2c"],
    "markets": ["ES", "NL"],
    "limit": 10
  }'
```

**Test 6: Get System Status**
```bash
curl http://localhost:5600/api/system/status \
  -H "Authorization: Bearer $TOKEN"
```

**Test 7: Analytics Trends**
```bash
curl "http://localhost:5600/api/analytics/trends?industry=dental_b2c&days=30" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Step 7: Test Automated Pipelines (20 minutes)

### 7.1 Test Collection Pipeline

```bash
node pipelines/ad-collection-pipeline.js
```

**Expected behavior:**
- Collects ads for all configured industries
- Scores ads with performance algorithm
- Saves to database
- Triggers AI analysis for top performers
- Displays summary statistics

**Check results in database:**
```bash
psql competitive_intelligence -c "SELECT COUNT(*) FROM ads;"
psql competitive_intelligence -c "SELECT headline, performance_score FROM ads ORDER BY performance_score DESC LIMIT 5;"
```

### 7.2 Test Analysis Pipeline

```bash
node pipelines/ad-analysis-pipeline.js
```

**Expected behavior:**
- Finds unanalyzed high-performing ads
- Runs AI analysis with Claude Code agents
- Saves analysis to database
- Generates templates for highly effective ads

**Check results:**
```bash
psql competitive_intelligence -c "SELECT COUNT(*) FROM ad_analysis;"
psql competitive_intelligence -c "SELECT a.headline, aa.hook, aa.value_proposition FROM ads a JOIN ad_analysis aa ON a.id = aa.ad_id LIMIT 5;"
```

### 7.3 Test Competitor Check Pipeline

```bash
# First, add a test competitor
psql competitive_intelligence -c "
INSERT INTO competitors (name, facebook_page_id, industry, tracking_enabled, check_frequency_hours)
VALUES ('Test Competitor', '123456789', 'dental_b2c', true, 6);
"

# Run competitor check
node pipelines/competitor-check-pipeline.js
```

---

## Step 8: End-to-End Testing (30 minutes)

### 8.1 Complete Workflow Test

Create `test-e2e.js`:

```javascript
const CompetitiveIntelligenceHub = require('./competitive-intelligence-domain-hub');

async function testEndToEnd() {
    console.log('🧪 End-to-End Workflow Test\n');

    const hub = new CompetitiveIntelligenceHub();

    try {
        // Step 1: Initialize
        console.log('Step 1: Initialize system');
        await hub.initialize();
        console.log('✅ System initialized\n');

        // Step 2: Collect ads
        console.log('Step 2: Collect ads from Meta Ad Library');
        const collectionResult = await hub.collectAds({
            keywords: ['dental implants'],
            industries: ['dental_b2c'],
            markets: ['ES'],
            limit: 5
        });
        console.log(`✅ Collected ${collectionResult.totalAds} ads\n`);

        if (collectionResult.topPerformers.length === 0) {
            console.log('⚠️  No high performers found, ending test');
            await hub.shutdown();
            return;
        }

        // Step 3: Analyze top performer
        const topAd = collectionResult.topPerformers[0];
        console.log('Step 3: Analyze top performer with AI');
        console.log(`   Ad: ${topAd.headline}`);
        console.log(`   Score: ${topAd.performanceScore}/100`);

        const analysis = await hub.analyzeAdWithClaudeAgents(topAd);
        console.log('✅ AI analysis complete');
        console.log(`   Hook: ${analysis.hook}`);
        console.log(`   Value Prop: ${analysis.valueProposition}\n`);

        // Step 4: Generate template
        console.log('Step 4: Generate launch-ready template');
        const template = await hub.generateTemplate({
            adId: topAd.id,
            includeAbTestVariations: true,
            includeTargeting: true
        });
        console.log('✅ Template generated');
        console.log(`   Copy template: ${template.copyTemplate.substring(0, 100)}...\n`);

        // Step 5: Create collection
        console.log('Step 5: Create curated collection');
        const collection = await hub.createCollection({
            name: 'E2E Test Collection',
            description: 'Collection created during end-to-end test',
            filters: {
                industry: 'dental_b2c',
                minPerformanceScore: 70
            }
        });
        console.log(`✅ Collection created with ${collection.adCount} ads\n`);

        console.log('═══════════════════════════════════════════════');
        console.log('✅ END-TO-END TEST PASSED!');
        console.log('═══════════════════════════════════════════════\n');

        await hub.shutdown();

    } catch (error) {
        console.error('\n❌ E2E test failed:', error);
        await hub.shutdown();
        process.exit(1);
    }
}

testEndToEnd();
```

**Run the test:**
```bash
node test-e2e.js
```

---

## Step 9: Performance Testing (Optional)

### 9.1 Load Test API

Create `test-load.js`:

```javascript
const axios = require('axios');

async function loadTest() {
    const API_URL = 'http://localhost:5600';
    const TOKEN = process.env.TEST_TOKEN;

    console.log('🧪 API Load Test\n');
    console.log('Making 100 concurrent requests...\n');

    const requests = [];
    const startTime = Date.now();

    for (let i = 0; i < 100; i++) {
        requests.push(
            axios.get(`${API_URL}/api/ads`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            }).catch(err => ({ error: err.message }))
        );
    }

    const results = await Promise.all(requests);
    const duration = Date.now() - startTime;

    const successful = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;

    console.log('Results:');
    console.log(`  Successful: ${successful}/100`);
    console.log(`  Failed: ${failed}/100`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Avg response time: ${(duration / 100).toFixed(2)}ms`);
}

loadTest();
```

---

## 📊 Test Results Checklist

After completing all tests, verify:

- [ ] ✅ All infrastructure agents initialize successfully
- [ ] ✅ Meta Ad Library API collects real ads
- [ ] ✅ Performance scoring algorithm works (0-100 scores)
- [ ] ✅ Database stores ads correctly
- [ ] ✅ REST API authentication works (JWT tokens)
- [ ] ✅ All API endpoints return expected data
- [ ] ✅ Pipelines run without errors
- [ ] ✅ End-to-end workflow completes successfully
- [ ] ✅ No memory leaks or crashes during testing

---

## 🐛 Troubleshooting Common Issues

### Issue: "Connection refused to PostgreSQL"
**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Issue: "Invalid Meta API token"
**Solution:**
1. Regenerate token at [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. Ensure token has `ads_read` permission
3. Use long-lived token (60 days) instead of short-lived (1 hour)

### Issue: "Claude API rate limit"
**Solution:**
1. Reduce `AI_ANALYSIS_BATCH_SIZE` in `.env` to 25
2. Add 5-second delays between requests
3. Consider upgrading Claude API tier

### Issue: "No ads collected"
**Solution:**
1. Check if keywords match actual ads in target markets
2. Try broader keywords: "dental", "dentist", "teeth"
3. Verify markets support commercial ads (ES, NL, BE, DE all supported)

---

## 🎉 Testing Complete!

If all tests pass, your competitive intelligence system is **fully operational** and ready for production use!

**Next steps:**
1. Set up cron jobs for automated pipelines
2. Configure email alerts for competitor monitoring
3. Integrate with frontend dashboard (Phase 2)
4. Scale to production with proper infrastructure

---

**Questions or issues?** Check the main [README.md](README.md) or troubleshooting section.
