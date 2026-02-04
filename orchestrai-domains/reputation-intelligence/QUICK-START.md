# Reputation Intelligence - Quick Start Guide

## 🚀 Setup in 3 Minutes

```bash
# 1. Navigate to directory
cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/reputation-intelligence

# 2. Install dependencies
npm install

# 3. Create database
createdb reputation_intelligence

# 4. Run setup (migrates database + tests connection)
npm run setup
```

---

## 📋 Essential Commands

### Database Operations
```bash
npm run migrate     # Run database migration
npm run test:db     # Test database connection
npm run db:stats    # View business statistics
npm run db:costs    # View API cost summary
npm run db:backup   # Create backup
npm run db:shell    # Open PostgreSQL shell
```

### Development
```bash
npm run dev         # Run workflow
npm run test        # Run tests
npm run start       # Start domain hub
```

---

## 🔍 Quick Queries

### View All Businesses
```sql
SELECT * FROM businesses LIMIT 10;
```

### Businesses Needing Enrichment
```sql
SELECT * FROM businesses_needing_enrichment;
```

### Cost Summary
```sql
SELECT * FROM daily_cost_summary;
```

### Qualifying Reviews
```sql
SELECT
    b.name,
    COUNT(r.id) as qualifying_review_count,
    AVG(r.sentiment_score) as avg_sentiment
FROM businesses b
JOIN reviews r ON r.business_id = b.id
WHERE r.is_qualifying = true
GROUP BY b.id
ORDER BY qualifying_review_count DESC;
```

---

## 💰 Cost Tracking

### Per Run
- **Google Maps Scraper**: $0.01/business
- **Reviews Scraper**: $0.001/business
- **Apollo Enrichment**: ~$0.10-$0.50/business

### Workflow Costs (5 Businesses)
- **First run**: $0.255-$1.055
- **Re-run (cached)**: $0.105-$0.505
- **Savings**: 60-90%

---

## 🐛 Troubleshooting

### Database connection failed
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Start if stopped
brew services start postgresql@14
```

### Database doesn't exist
```bash
createdb reputation_intelligence
```

### Permission denied
```sql
-- In psql:
GRANT ALL ON SCHEMA public TO postgres;
```

---

## 📊 Workflow Flow

```
1. Business Discovery
   ↓
2. Review Extraction (ALL businesses)
   ↓
3. Filter Qualifying Reviews
   ↓
4. Conditional Enrichment (ONLY qualifying businesses)
   ↓
5. Sentiment Analysis
```

---

## 📚 Documentation

- **Setup**: PHASE-1-SETUP-GUIDE.md
- **Workflow**: WORKFLOW-COMPARISON.md
- **Schema**: OPTIMAL-WORKFLOW-SCHEMA.md
- **Complete**: PHASE-1-COMPLETE.md

---

## ✅ Validation

```bash
# Test connection
npm run test:db

# Check tables
psql reputation_intelligence -c "\dt"

# View stats
npm run db:stats
```

---

## 🎯 Next Steps

Phase 2: API Endpoints & Frontend
- [ ] Create REST API endpoints
- [ ] Build frontend dashboard
- [ ] Add real-time cost tracking
- [ ] Implement scheduling

---

**Need Help?** Check PHASE-1-COMPLETE.md for detailed documentation.
