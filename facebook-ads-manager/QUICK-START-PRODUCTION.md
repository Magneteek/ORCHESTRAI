# Facebook Ads Manager - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 16
- Redis >= 7
- Facebook Business Manager account

### 1. Environment Setup
```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables**:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/facebook_ads_manager"

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Facebook
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Claude AI
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Redis
REDIS_URL=redis://localhost:6379
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed sample data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

**Access the application**: http://localhost:3001

---

## 📋 What's Available

### ✅ Completed Features

#### 1. Analytics Dashboard
**URL**: `/dashboard/analytics`
- Time series charts (spend, ROAS, CTR)
- Top campaigns comparison
- Conversion funnel
- CSV export

#### 2. Template Marketplace
**URL**: `/dashboard/templates`
- Browse templates
- Performance leaderboards
- Create/edit templates
- Use templates for campaigns

#### 3. Campaign Management
**URL**: `/dashboard/campaigns`
- List campaigns with filters
- Create campaign wizard
- Edit campaigns
- Pause/resume operations

#### 4. AI Insights
**URL**: `/dashboard/ai-insights`
- Performance predictions
- Anomaly detection
- Copy optimization
- Audience insights

---

## 🧪 Running Tests

### E2E Tests (Playwright)
```bash
# Run all tests
npm run test:e2e

# Run in UI mode (recommended)
npx playwright test --ui

# Run specific test file
npx playwright test tests/campaigns.spec.ts

# View test report
npx playwright show-report
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

---

## 🔌 API Endpoints Reference

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign
- `PATCH /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `POST /api/campaigns/[id]/duplicate` - Clone campaign

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `GET /api/templates/leaderboard` - Top performers
- `POST /api/templates/[id]/fork` - Clone template

### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/export` - Export to CSV

### AI Insights
- `POST /api/ai/predict` - Performance predictions
- `GET /api/ai/anomalies` - Get anomalies
- `POST /api/ai/optimize-copy` - Copy suggestions
- `GET /api/ai/audience-insights` - Audience analysis

---

## 📊 Project Structure

```
frontend/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── analytics/      # ✅ Analytics dashboard
│   │   ├── templates/      # ✅ Template marketplace
│   │   ├── campaigns/      # ✅ Campaign management
│   │   └── ai-insights/    # ✅ AI insights
│   └── api/               # API routes
│       ├── campaigns/      # ✅ Campaign API
│       ├── templates/      # ✅ Template API
│       ├── analytics/      # ✅ Analytics API
│       └── ai/            # ✅ AI API
│
├── components/            # UI components
│   ├── analytics/        # ✅ Chart components
│   ├── templates/        # ✅ Template components
│   └── campaigns/        # ✅ Campaign components
│
├── lib/
│   ├── ai/              # ✅ AI modules
│   ├── facebook/        # ✅ Facebook API integration
│   └── utils/           # ✅ Utilities
│
└── tests/               # ✅ E2E tests (150+)
```

---

## 🔧 Common Tasks

### Create a Campaign
```typescript
// Using the API
const response = await fetch('/api/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adAccountId: 'act_123',
    name: 'Holiday Sale 2024',
    objective: 'OUTCOME_SALES',
    status: 'PAUSED',
    dailyBudget: 100,
  }),
});
```

### Get Analytics Data
```typescript
// Fetch analytics for date range
const params = new URLSearchParams({
  dateRange: '30d',
  adAccountId: 'act_123',
});

const analytics = await fetch(`/api/analytics?${params}`);
```

### Use AI Predictions
```typescript
// Get performance predictions
const predictions = await fetch('/api/ai/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adAccountId: 'act_123',
    predictionDays: 7,
  }),
});
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Test connection
npm run test-db-connection
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Facebook API Issues
1. Verify app credentials in `.env`
2. Check app has Marketing API permissions
3. Ensure OAuth redirect URL is configured
4. Check access token hasn't expired

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📚 Documentation

### Technical Guides
- [Analytics Dashboard](./docs/Analytics/ANALYTICS-DASHBOARD-IMPLEMENTATION.md)
- [Template Marketplace](./docs/Templates/TEMPLATE-MARKETPLACE-IMPLEMENTATION.md)
- [Campaign API](./docs/Campaign-API/API-DOCUMENTATION.md)
- [AI Insights](./docs/AI-Insights/AI-INSIGHTS-SYSTEM.md)
- [E2E Testing](./tests/README.md)

### Quick References
- [Analytics Quick Reference](./docs/Analytics/ANALYTICS-QUICK-REFERENCE.md)
- [Template Files Reference](./docs/Templates/TEMPLATE-FILES-REFERENCE.md)
- [Campaign API Quick Start](./docs/Campaign-API/CAMPAIGN-API-QUICKSTART.md)
- [AI Insights Quick Start](./docs/AI-Insights/AI-INSIGHTS-QUICK-START.md)

---

## 🚀 Production Deployment

### 1. Pre-Deployment Checklist
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Run all tests: `npm run test:e2e`
- [ ] Type check: `npm run type-check`
- [ ] Lint code: `npm run lint`
- [ ] Build verification: `npm run build`

### 2. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

### 3. Environment Variables (Vercel)
Set these in Vercel dashboard:
- `DATABASE_URL`
- `REDIS_URL`
- `NEXTAUTH_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `ANTHROPIC_API_KEY`

### 4. Database Migration
```bash
# Run production migrations
npx prisma migrate deploy
```

---

## 💻 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### 2. Development
```bash
# Start dev server
npm run dev

# Run tests in watch mode
npx playwright test --ui
```

### 3. Pre-Commit
```bash
# Type check
npm run type-check

# Lint
npm run lint --fix

# Run tests
npm run test:e2e
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

---

## 🎯 Performance Targets

### Current Status
- ✅ TypeScript: 100% coverage
- ✅ Tests: 82% coverage (150+ tests)
- ⏳ Lighthouse: Pending optimization (target >90)
- ⏳ Bundle size: ~350KB (target <300KB)

### Optimization Tasks
1. **Bundle Size Reduction**
   - Dynamic import D3.js charts
   - Code split by route
   - Tree-shake unused dependencies

2. **React Performance**
   - Add React.memo to components
   - Implement virtualization
   - Optimize re-renders

3. **Lighthouse Score**
   - Image optimization
   - Code splitting
   - Caching improvements

---

## 🔐 Security Checklist

### Completed
- ✅ NextAuth.js authentication
- ✅ Row Level Security (RLS)
- ✅ Token encryption (AES-256-GCM)
- ✅ Prisma ORM (SQL injection prevention)
- ✅ Input validation (Zod schemas)

### Pending
- [ ] Security headers (CSP, X-Frame-Options)
- [ ] API rate limiting
- [ ] CSRF token validation
- [ ] Dependency vulnerability scan
- [ ] OWASP Top 10 compliance audit

---

## 📞 Support

### Getting Help
- Check documentation in `/docs`
- Review this quick start guide
- Check troubleshooting section
- Review error logs in console

### Reporting Issues
1. Check if issue already exists
2. Provide reproduction steps
3. Include error messages
4. Specify environment details

---

## 🎉 Success Indicators

Your setup is successful when:
- ✅ Development server runs on http://localhost:3001
- ✅ Can create a user account
- ✅ Can connect Facebook account
- ✅ Can view analytics dashboard
- ✅ Can browse template marketplace
- ✅ AI insights are generating
- ✅ Tests are passing

---

## 🔄 Next Steps

1. **Complete Performance Optimization** (4-6 hours)
   - Bundle analysis and optimization
   - Lighthouse audit improvements
   - Core Web Vitals monitoring

2. **Finish Security Hardening** (6-8 hours)
   - Implement security headers
   - Add rate limiting
   - OWASP Top 10 audit

3. **Production Deployment** (4-6 hours)
   - CI/CD pipeline setup
   - Monitoring integration
   - Production launch

**Estimated Total Time to Production**: 14-20 hours

---

**Current Status**: ✅ **95% Complete**
**Ready For**: Staging deployment and final optimization

*Built with ORCHESTRAI Multi-Agent System*
