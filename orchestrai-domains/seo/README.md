# ORCHESTRAI SERP Tracker

**Comprehensive SERP position tracking system integrating Google Search Console and DataForSEO with automated reporting and intelligent alerts.**

---

## Overview

The ORCHESTRAI SERP Tracker is an enterprise-grade keyword position monitoring system that:

- **Tracks keyword positions** across multiple projects using DataForSEO API
- **Syncs GSC performance data** (clicks, impressions, CTR) for actual traffic analysis
- **Generates intelligent alerts** for position changes and optimization opportunities
- **Maintains historical data** in PostgreSQL for trend analysis
- **Creates client dashboards** in Notion for beautiful, shareable reports
- **Provides specialized agent** for analyzing tracking data and making recommendations

---

## Features

### ✅ Multi-Source Data Integration
- DataForSEO for precise daily position tracking (no averaging)
- Google Search Console for actual performance metrics (clicks, impressions)
- Cross-validation between DataForSEO positions and GSC data

### ✅ Intelligent Priority-Based Tracking
- **High Priority**: Daily tracking for money keywords
- **Medium Priority**: Weekly tracking for service keywords
- **Low Priority**: Monthly tracking for informational content

### ✅ Automated Alerting System
- 🔴 **Critical**: Position dropped ≥10 places or out of top 10
- ⚠️ **Warning**: Position dropped 5-9 places or CTR drop >20%
- 💡 **Opportunity**: Entered top 20 with low CTR (<2%)
- 👁️ **Competitor**: Competitor entered top 3 for target keyword

### ✅ Time-Series Analytics
- Historical position tracking for trend analysis
- Position change calculations (7-day, 30-day, 90-day)
- Database views for common queries
- ROI-focused opportunity identification

### ✅ Client-Facing Dashboards
- Notion database integration for beautiful reports
- Real-time position updates
- Embedded charts and visualizations
- Shareable with clients via Notion workspace

### ✅ Specialized AI Agent
- `serp-tracker-manager` agent for intelligent analysis
- Automated weekly report generation
- Optimization opportunity detection
- Competitor movement analysis

---

## Quick Start

### Prerequisites

1. **Node.js** v18+ installed
2. **PostgreSQL** database running
3. **DataForSEO** API account ([sign up](https://dataforseo.com))
4. **Google Search Console** access with MCP configured
5. **Notion** workspace (optional, for dashboards)

### Installation

```bash
# 1. Navigate to ORCHESTRAI directory
cd /Users/kris/CLAUDEtools/ORCHESTRAI

# 2. Install dependencies (if not already installed)
npm install pg axios @notionhq/client

# 3. Set up PostgreSQL database
createdb orchestrai_serp
psql -d orchestrai_serp -f orchestrai-domains/seo/database/schema.sql

# 4. Configure environment variables
cp .env.example .env
# Edit .env and add:
#   POSTGRES_USER=your_username
#   POSTGRES_PASSWORD=your_password
#   POSTGRES_DATABASE=orchestrai_serp
#   DATAFORSEO_USERNAME=your_username
#   DATAFORSEO_PASSWORD=your_password
#   NOTION_TOKEN=your_token (optional)

# 5. Import keywords from configuration
node orchestrai-domains/seo/scripts/track-priority-keywords.js --import --dry-run

# 6. Run first tracking test
node orchestrai-domains/seo/scripts/track-priority-keywords.js --priority high --project drnl-A0582FF4-6715-4266-9A54-A7E311912E41
```

---

## Configuration

### 1. Project Setup

Edit `/orchestrai-domains/seo/config/tracking-config.json` to add your projects and keywords:

```json
{
  "trackingConfig": {
    "projects": {
      "your-project-uuid": {
        "name": "Your Project Name",
        "siteUrl": "sc-domain:yoursite.com",
        "location": {
          "code": 2840,
          "name": "United States",
          "language": "English"
        },
        "competitors": [
          "competitor1.com",
          "competitor2.com"
        ],
        "keywords": {
          "high": [
            {
              "keyword": "your main keyword",
              "targetPosition": 1,
              "trackingFrequency": "daily",
              "searchVolume": 1000
            }
          ],
          "medium": [ ... ],
          "low": [ ... ]
        }
      }
    }
  }
}
```

### 2. Notion Setup (Optional)

Follow the detailed guide in [`NOTION-DATABASE-SETUP.md`](./NOTION-DATABASE-SETUP.md) to:
1. Create Notion databases
2. Set up properties and relations
3. Configure dashboard views
4. Get database IDs for sync

### 3. Cron Jobs

Install automated tracking schedules:

```bash
# Edit crontab
crontab -e

# Add these entries (adjust paths as needed):
# Daily high-priority tracking at 2 AM
0 2 * * * cd /Users/kris/CLAUDEtools/ORCHESTRAI && node orchestrai-domains/seo/scripts/track-priority-keywords.js --priority high >> logs/serp-tracker-daily.log 2>&1

# Weekly medium-priority tracking every Monday at 9 AM
0 9 * * 1 cd /Users/kris/CLAUDEtools/ORCHESTRAI && node orchestrai-domains/seo/scripts/track-priority-keywords.js --priority medium >> logs/serp-tracker-weekly.log 2>&1

# Monthly low-priority tracking on the 1st at 10 AM
0 10 1 * * cd /Users/kris/CLAUDEtools/ORCHESTRAI && node orchestrai-domains/seo/scripts/track-priority-keywords.js --priority low >> logs/serp-tracker-monthly.log 2>&1
```

See [`config/cron-schedule.conf`](./config/cron-schedule.conf) for complete schedule examples.

---

## Usage

### Track Keywords

```bash
# Track all high-priority keywords
node orchestrai-domains/seo/scripts/track-priority-keywords.js --priority high

# Track specific project only
node orchestrai-domains/seo/scripts/track-priority-keywords.js --priority high --project drnl-A0582FF4-6715-4266-9A54-A7E311912E41

# Dry run to see what would be tracked
node orchestrai-domains/seo/scripts/track-priority-keywords.js --dry-run

# Import keywords from config first, then track
node orchestrai-domains/seo/scripts/track-priority-keywords.js --import --priority high
```

### Sync GSC Data

```bash
# Sync one project, last 7 days
node orchestrai-domains/seo/scripts/sync-gsc-data.js --project drnl-A0582FF4-6715-4266-9A54-A7E311912E41

# Sync all projects, last 30 days
node orchestrai-domains/seo/scripts/sync-gsc-data.js --all --days 30

# Sync with specific dimensions
node orchestrai-domains/seo/scripts/sync-gsc-data.js --project drnl-A0582FF4-6715-4266-9A54-A7E311912E41 --dimensions query,device
```

### Sync to Notion

```bash
# Test Notion connection
node orchestrai-domains/seo/scripts/sync-to-notion.js --test

# Sync one project
node orchestrai-domains/seo/scripts/sync-to-notion.js --project drnl-A0582FF4-6715-4266-9A54-A7E311912E41

# Force update all data
node orchestrai-domains/seo/scripts/sync-to-notion.js --force
```

### Use the Specialized Agent

```bash
# In Claude Code, invoke the serp-tracker-manager agent
Task tool → subagent_type: "serp-tracker-manager"

# Example prompts for the agent:
"Analyze position changes for DeleteReviews.nl this week and identify optimization opportunities"
"Review critical alerts and provide recommendations"
"Generate weekly SERP performance report for NaSmehPG"
"Identify keywords where competitors are outranking us"
```

---

## Database Queries

### Useful SQL Queries

```sql
-- Latest positions for all keywords
SELECT * FROM v_latest_positions WHERE project_id = 'your-project-uuid';

-- Position changes (last 7 days)
SELECT * FROM v_position_changes_7d WHERE trend = 'declined' ORDER BY position_change DESC;

-- GSC performance (last 30 days)
SELECT * FROM v_gsc_performance_30d WHERE project_id = 'your-project-uuid';

-- Unread alerts
SELECT * FROM tracking_alerts WHERE is_read = false ORDER BY triggered_at DESC;

-- Find optimization opportunities
SELECT * FROM get_optimization_opportunities('your-project-uuid', 100, 0.02);

-- Keywords needing attention (high impressions, low CTR)
SELECT
  tk.keyword,
  gp.avg_position,
  gp.total_impressions,
  gp.avg_ctr,
  (gp.total_impressions * (0.05 - gp.avg_ctr)) AS opportunity_score
FROM v_gsc_performance_30d gp
INNER JOIN tracked_keywords tk ON gp.id = tk.id
WHERE gp.total_impressions > 100 AND gp.avg_ctr < 0.02
ORDER BY opportunity_score DESC;
```

---

## Architecture

### Directory Structure

```
orchestrai-domains/seo/
├── config/
│   ├── tracking-config.json       # Main configuration
│   └── cron-schedule.conf         # Cron job templates
├── database/
│   └── schema.sql                 # PostgreSQL schema
├── lib/
│   └── serp-tracker.js            # Core tracking library
├── scripts/
│   ├── track-priority-keywords.js # Main tracking script
│   ├── sync-gsc-data.js           # GSC data sync
│   └── sync-to-notion.js          # Notion integration
├── NOTION-DATABASE-SETUP.md       # Notion setup guide
└── README.md                       # This file
```

### Data Flow

```
1. Keywords Configuration (tracking-config.json)
   ↓
2. Import to PostgreSQL (tracked_keywords table)
   ↓
3. Daily/Weekly Tracking (DataForSEO API)
   ↓
4. Position Storage (position_history table)
   ↓
5. Alert Generation (tracking_alerts table)
   ↓
6. GSC Performance Sync (gsc_performance table)
   ↓
7. Notion Dashboard Updates (via MCP)
   ↓
8. Agent Analysis (serp-tracker-manager)
   ↓
9. Actionable Recommendations
```

### Database Schema

Key tables:
- `tracked_keywords`: Core keyword tracking configuration
- `position_history`: Time-series position data
- `gsc_performance`: Google Search Console metrics
- `competitor_positions`: Competitor rank tracking
- `tracking_alerts`: Automated alerts
- `sync_log`: Audit log for sync operations

Key views:
- `v_latest_positions`: Current position for each keyword
- `v_position_changes_7d`: 7-day position changes
- `v_gsc_performance_30d`: 30-day GSC performance summary

---

## Cost Estimation

### DataForSEO API Costs

- SERP API: $0.00075 per keyword check
- Daily tracking (20 high-priority keywords): $0.45/month
- Weekly tracking (100 medium-priority keywords): $0.30/month
- Monthly tracking (500 low-priority keywords): $0.375/month

**Total per project**: ~$1.13/month

### Infrastructure Costs

- PostgreSQL: $0 (self-hosted) or ~$7/month (managed)
- Notion: $0 (free plan) or existing subscription
- Server: $0 (use existing ORCHESTRAI server)

**Total monthly cost**: $1-8 per project

---

## Troubleshooting

### Database Connection Errors

```bash
# Test PostgreSQL connection
psql -d orchestrai_serp -c "SELECT COUNT(*) FROM tracked_keywords;"

# Check environment variables
echo $POSTGRES_USER
echo $POSTGRES_DATABASE

# Verify schema is installed
psql -d orchestrai_serp -c "\dt"
```

### DataForSEO API Errors

```bash
# Test API credentials
curl -u "$DATAFORSEO_USERNAME:$DATAFORSEO_PASSWORD" https://api.dataforseo.com/v3/

# Check rate limits
# View API logs in tracking script output
```

### Notion Sync Errors

```bash
# Test Notion connection
node orchestrai-domains/seo/scripts/sync-to-notion.js --test

# Verify database IDs in config
# Check integration permissions in Notion
```

### No Data in Reports

1. Check if keywords were imported: `SELECT COUNT(*) FROM tracked_keywords;`
2. Verify tracking ran: `SELECT * FROM sync_log ORDER BY started_at DESC LIMIT 5;`
3. Check for errors: `SELECT * FROM tracking_alerts WHERE alert_type = 'error';`

---

## Best Practices

1. **Start Small**: Begin with 20-50 high-priority keywords, then scale up
2. **Validate Data**: Cross-reference DataForSEO positions with GSC when possible
3. **Regular Monitoring**: Check alerts weekly, review trends monthly
4. **Backup Database**: Set up automated PostgreSQL backups (see cron config)
5. **Log Rotation**: Clean up old logs to prevent disk space issues
6. **API Limits**: Respect DataForSEO rate limits (use batch delays)
7. **Alert Triage**: Mark alerts as "read" after reviewing to keep dashboard clean

---

## Integration with Other Agents

The SERP Tracker integrates with these ORCHESTRAI agents:

- **seo-technical-analysis**: Monitor indexing status for ranking pages
- **seo-content-optimization**: Identify pages needing optimization based on position/CTR data
- **seo-competitor-analysis**: Track competitor SERP movements
- **content-writer-specialist**: Commission content updates for opportunity keywords
- **orchestrai-master-coordinator**: Trigger optimization workflows on rank drops

Use the Task tool to invoke these agents with tracking data:

```javascript
// Example: Analyze position drop with technical agent
Task({
  subagent_type: "seo-technical-analysis",
  prompt: "Analyze why 'zobni implantati maribor' dropped from position 3 to position 12. Check indexing status, Core Web Vitals, and technical SEO issues for the ranking URL."
})
```

---

## Roadmap

### Phase 1: Foundation (Complete)
- ✅ PostgreSQL database schema
- ✅ Core tracking library
- ✅ DataForSEO integration
- ✅ Alert system
- ✅ Notion sync
- ✅ Specialized agent

### Phase 2: Enhancement (Next)
- ⏳ GSC MCP integration (placeholder implemented)
- ⏳ Real-time webhooks for critical alerts
- ⏳ Automated weekly report email/Slack notifications
- ⏳ Competitor content analysis
- ⏳ SERP feature tracking (featured snippets, local packs)

### Phase 3: Advanced Features
- 📋 Machine learning for position forecasting
- 📋 Automated A/B testing for title/meta changes
- 📋 Voice search position tracking
- 📋 Mobile vs desktop position comparison
- 📋 International market tracking (multi-language support)

---

## Support

For issues, questions, or feature requests:

1. Check the troubleshooting section above
2. Review database logs: `tail -f logs/serp-tracker-*.log`
3. Run health check: `psql -d orchestrai_serp -c "SELECT * FROM v_latest_positions LIMIT 5;"`
4. Consult the specialized agent: `Task → serp-tracker-manager`

---

## License

Part of the ORCHESTRAI system. See main project LICENSE file.

---

**Built with ❤️ by the ORCHESTRAI team**

*Last updated: 2025-11-04*
