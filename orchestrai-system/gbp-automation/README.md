# GBP Automation System

**Full automation for Google Business Profile post generation and publishing**

Complete workflow: `ORCHESTRAI Agents` → `SQLite Database` → `Review Interface` → `GoHighLevel API` → `Published to GBP`

---

## 🎯 System Overview

This system automates the entire GBP content lifecycle:

1. **Generate**: AI-powered post creation using ORCHESTRAI `gbp-content-transformer` agent
2. **Store**: SQLite database for content management and tracking
3. **Review**: Web-based UI for content approval and editing
4. **Publish**: Automated publishing to GoHighLevel Social Planner API
5. **Track**: Complete publishing logs and performance metrics

### Key Features

✅ **AI-Powered Generation**: Transform blog posts or create from topics
✅ **Quality Gates**: Character limits, AI detection <30%, language purity
✅ **Multi-Language**: English, Dutch, Slovenian, German, Spanish
✅ **Batch Operations**: Generate and publish 10-50 posts at once
✅ **Smart Scheduling**: Schedule posts or publish immediately
✅ **Error Recovery**: Automatic retry logic with exponential backoff
✅ **Audit Trail**: Complete publishing history in SQLite database

---

## 📁 System Architecture

```
orchestrai-system/gbp-automation/
├── database/
│   ├── schema.sql              # SQLite database schema
│   ├── db-manager.js           # Database operations (CRUD)
│   └── gbp-posts.db           # SQLite database file (created on init)
│
├── integrations/
│   └── ghl-api.js             # GoHighLevel API client
│
├── pipelines/
│   └── generate-posts.js      # Post generation orchestration
│
├── workflows/
│   └── publish-to-ghl.js      # Automated publishing workflow
│
├── ui/                         # Web-based review interface (coming soon)
│   ├── index.html
│   ├── server.js
│   └── public/
│
├── scripts/
│   ├── init-database.js       # Database initialization
│   ├── generate-posts-cli.js  # CLI for post generation
│   └── publish-posts-cli.js   # CLI for publishing
│
├── docs/                       # Complete documentation
│   ├── SETUP-GUIDE.md
│   ├── API-REFERENCE.md
│   └── TROUBLESHOOTING.md
│
├── package.json
├── .env.example
└── README.md (this file)
```

---

## 🚀 Quick Start

### 1. Installation

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-system/gbp-automation
npm install
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**
```env
# GoHighLevel OAuth Credentials
GHL_CLIENT_ID=your_client_id
GHL_CLIENT_SECRET=your_client_secret
GHL_ACCESS_TOKEN=your_access_token
GHL_REFRESH_TOKEN=your_refresh_token
GHL_LOCATION_ID=your_location_id

# Business Info
BUSINESS_ID=nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e
BUSINESS_NAME=nasmehPG
```

### 3. Initialize Database

```bash
npm run init
```

This creates the SQLite database and tables.

---

## 📝 Usage Guide

### Generating Posts

#### Option A: From Existing Content (Blog Posts, Landing Pages)

```javascript
const GBPPostGenerator = require('./pipelines/generate-posts');

const generator = new GBPPostGenerator();

const result = await generator.generateFromContent({
  sourceContentPath: '/path/to/blog-post.md',
  business: 'nasmehPG',
  businessId: 'nasmehpg-uuid',
  language: 'sl_SI',
  postTypes: ['whats_new', 'offer', 'product'],
  campaignId: null // optional
});

console.log(`Generated ${result.posts_generated} posts`);
```

#### Option B: From Topics/Prompts

```javascript
const result = await generator.generateFromTopics({
  business: 'nasmehPG',
  businessId: 'nasmehpg-uuid',
  topics: [
    {
      topic: 'Invisible Orthodontics',
      description: 'Benefits of clear aligners vs traditional braces',
      postType: 'whats_new'
    },
    {
      topic: 'Spring Teeth Whitening Offer',
      description: '30% discount on professional whitening',
      postType: 'offer'
    }
  ],
  language: 'sl_SI',
  audience: 'Adults 25-45 interested in cosmetic dentistry',
  tone: 'professional'
});
```

### Reviewing Posts

**Manual Review (via Node.js):**

```javascript
const GBPDatabaseManager = require('./database/db-manager');
const db = new GBPDatabaseManager();
await db.initialize();

// Get all draft posts
const drafts = await db.getPosts({ status: 'draft' });

// Review and approve
for (const post of drafts) {
  console.log(`Title: ${post.title}`);
  console.log(`Content: ${post.content}`);
  console.log(`Characters: ${post.character_count}`);

  // Approve post
  await db.updatePost(post.post_id, { status: 'approved' });
}
```

**Web UI Review (Coming Soon):**
```bash
npm run server
# Open http://localhost:3000
```

### Publishing Posts

#### Publish All Ready Posts

```javascript
const PublishToGHLWorkflow = require('./workflows/publish-to-ghl');

const workflow = new PublishToGHLWorkflow();

// Initialize with business credentials
await workflow.initialize('nasmehpg-uuid');

// Publish all approved posts ready to go
const result = await workflow.publishReadyPosts();

console.log(`Published ${result.successful}/${result.processed} posts`);
```

#### Publish Specific Posts

```javascript
const result = await workflow.publishPostsByIds([
  'post-uuid-1',
  'post-uuid-2',
  'post-uuid-3'
]);
```

#### Retry Failed Posts

```javascript
const result = await workflow.retryFailedPosts();
```

---

## 🔑 GoHighLevel API Setup

### Step 1: Get OAuth Credentials

1. Go to GoHighLevel → Settings → Integrations
2. Create new OAuth App
3. Copy Client ID and Client Secret
4. Set Redirect URI: `https://yourdomain.com/oauth/callback`

### Step 2: Get Access Token

**Authorization URL:**
```
https://marketplace.gohighlevel.com/oauth/chooselocation?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=social-media-posting.write
```

**Exchange Code for Token:**
```bash
curl -X POST https://services.leadconnectorhq.com/oauth/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 86400,
  "token_type": "Bearer",
  "locationId": "..."
}
```

### Step 3: Store Credentials

```javascript
const db = new GBPDatabaseManager();
await db.initialize();

await db.storeGHLCredentials({
  business_id: 'nasmehpg-uuid',
  business_name: 'nasmehPG',
  access_token: 'YOUR_ACCESS_TOKEN',
  refresh_token: 'YOUR_REFRESH_TOKEN',
  token_expires_at: '2026-02-18T10:00:00Z',
  ghl_location_id: 'YOUR_LOCATION_ID',
  is_active: true
});
```

---

## 📊 Database Schema

### Tables

**`posts`** - All GBP posts
- `id`, `post_id` (UUID)
- `title`, `content`, `post_type`, `language`
- `status` (draft → approved → scheduled → published)
- `quality_gate_passed`, `ai_detection_risk`, `character_count`
- `scheduled_date`, `timezone`
- `ghl_post_id`, `published_at`
- CTA fields, event fields, offer fields

**`campaigns`** - Post campaigns/batches
- `id`, `campaign_id` (UUID)
- `name`, `description`, `business_id`
- `total_posts`, `published_posts`
- `status`, `start_date`, `end_date`

**`publishing_log`** - Complete audit trail
- `post_id`, `attempt_number`
- `ghl_post_id`, `ghl_response`, `http_status`
- `success`, `error_message`, `response_time_ms`

**`ghl_credentials`** - OAuth tokens
- `business_id`, `access_token`, `refresh_token`
- `ghl_location_id`, `token_expires_at`

---

## 🎨 Post Types Supported

### 1. What's New Posts
- Announcements, updates, business news
- Character limit: 300-500 (optimal)
- CTA: Learn More, Call, Book

### 2. Event Posts
- Workshops, open houses, community events
- Requires: event_title, start_date, end_date
- Character limit: 400-600 (optimal)

### 3. Offer Posts
- Promotions, discounts, limited-time deals
- Requires: offer_title, start_date, end_date, coupon_code (optional)
- Character limit: 250-400 (optimal)

### 4. Product Posts
- Service showcases, feature highlights
- Character limit: 300-500 (optimal)

---

## 🔍 Quality Gates

All generated posts must pass these gates before being marked as ready:

| Gate | Threshold | Blocking |
|------|-----------|----------|
| Character Limit | 100-1500 chars | ✅ Yes |
| AI Detection | <30% risk | ✅ Yes |
| Language Purity | 100% target language | ✅ Yes (multi-lang) |
| Mobile Readability | Grade 6-8 | ⚠️ Warning only |
| Local SEO | Keywords present | ⚠️ Warning only |

---

## 📈 Performance & Monitoring

### Get System Statistics

```javascript
const db = new GBPDatabaseManager();
await db.initialize();

const stats = await db.getStats();

console.log(stats);
// {
//   total_posts: 50,
//   draft_posts: 15,
//   approved_posts: 10,
//   published_posts: 25,
//   total_campaigns: 3,
//   successful_publishes: 24,
//   failed_publishes: 1
// }
```

### Get Publishing Stats

```javascript
const workflow = new PublishToGHLWorkflow();
await workflow.initialize('business-id');

const stats = await workflow.getPublishingStats();

console.log(stats);
// {
//   ...posts stats,
//   publishing: {
//     total_attempts: 30,
//     successful_attempts: 28,
//     failed_attempts: 2,
//     avg_response_time: 1234 // ms
//   },
//   success_rate: '93.33%'
// }
```

---

## 🛠️ Troubleshooting

### Common Issues

**Issue: "Failed to connect to database"**
```bash
# Re-initialize database
npm run init
```

**Issue: "GHL API 401 Unauthorized"**
```bash
# Token expired - refresh manually or it auto-refreshes on next request
# Check token expiration in ghl_credentials table
```

**Issue: "Post failed quality gates"**
- Check `quality_gates` field in post record
- Common: character count exceeded, AI detection >30%
- Fix: Edit content, reduce character count, or rewrite to reduce AI patterns

**Issue: "Rate limit exceeded"**
- GHL API limits: ~10 requests/minute
- System includes 1-second delays between posts
- For large batches, publishing happens sequentially

---

## 🔐 Security Notes

**Important:**
- Store `.env` file in `.gitignore` (never commit credentials)
- Encrypt tokens in production (current implementation stores plain text)
- Use HTTPS for OAuth callbacks
- Rotate access tokens regularly
- Keep SQLite database file secure (contains credentials)

**Production Recommendations:**
- Implement token encryption (AES-256)
- Add API rate limiting middleware
- Enable database backups
- Set up monitoring/alerting
- Use environment-specific credentials

---

## 📚 Additional Documentation

- **[SETUP-GUIDE.md](docs/SETUP-GUIDE.md)** - Detailed setup instructions
- **[API-REFERENCE.md](docs/API-REFERENCE.md)** - Complete API documentation
- **[WORKFLOW-GUIDE.md](docs/WORKFLOW-GUIDE.md)** - End-to-end workflow examples
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🎯 Next Steps

1. **Complete Web UI** (Task #5) - Visual review interface
2. **Add Scheduling Logic** - Smart posting time optimization
3. **Performance Tracking** - GHL engagement metrics integration
4. **Multi-Business Support** - Manage multiple clients
5. **Campaign Analytics** - ROI tracking and reporting

---

## 📞 Support

For issues or questions:
- Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- Review [API-REFERENCE.md](docs/API-REFERENCE.md)
- Examine publishing logs in `publishing_log` table

---

**Built by ORCHESTRAI** | Version 1.0.0 | February 2026
