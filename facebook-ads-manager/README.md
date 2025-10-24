# Facebook Ads Manager - Multi-Tenant SaaS Platform

[![Built with ORCHESTRAI](https://img.shields.io/badge/Built%20with-ORCHESTRAI-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

> **Enterprise-grade Facebook Ads management platform with AI-powered insights, template franchising, and real-time analytics.**

---

## 🎯 Overview

Facebook Ads Manager is a multi-tenant SaaS platform that revolutionizes how agencies and businesses manage Facebook advertising campaigns. Built with cutting-edge technology and AI-powered analysis, it provides:

- **Multi-Account Management** - Seamlessly manage multiple Facebook Business Manager accounts
- **Template Franchising** - Share and monetize best-performing ad templates with aggregated performance stats
- **AI-Powered Insights** - Performance predictions, anomaly detection, copy optimization, and audience intelligence
- **Real-Time Dashboard** - Live metrics, campaign performance tracking, and conversion analytics
- **Enterprise Security** - Multi-tenant architecture with Row Level Security (RLS) and encrypted token storage

---

## ✨ Key Features

### 🚀 **Ad Campaign Management**
- Create, clone, modify, and launch campaigns with one click
- Template-based campaign creation for rapid deployment
- Bulk operations across multiple ad sets
- Real-time campaign status monitoring

### 📊 **AI-Driven Analysis**
- **Performance Predictions** - ROAS, CTR, and conversion forecasting (7-30 days)
- **Anomaly Detection** - Automatic alerts for performance drops/spikes
- **Copy Optimization** - AI-powered ad copy recommendations
- **Audience Insights** - Demographic and geographic performance analysis

### 📝 **Template Marketplace**
- Create and store reusable ad templates (copy, creative, targeting, structure)
- Public template marketplace with performance leaderboards
- Template versioning and forking
- Aggregated performance metrics across all users

### 📈 **Real-Time Analytics**
- Live metrics dashboard with WebSocket updates
- D3.js-powered data visualizations
- Historical trend analysis
- Custom date range reporting
- Export functionality (CSV, PDF)

### 🔐 **Enterprise Security**
- Multi-tenant data isolation with PostgreSQL RLS
- Encrypted access token storage
- Role-based access control (Admin, Manager, Member)
- SOC 2 compliant infrastructure (planned)

---

## 🏗️ Architecture

### **Technology Stack**

**Frontend:**
- Next.js 15 (App Router) - React framework with server components
- ShadCN UI + Tailwind CSS - Beautiful, accessible component library
- D3.js - Advanced data visualization
- TanStack Query - Efficient data fetching and caching
- Zustand - Lightweight state management
- Socket.io - Real-time WebSocket updates

**Backend:**
- Next.js API Routes - Serverless API endpoints
- facebook-nodejs-business-sdk - Official Meta Marketing API SDK
- PostgreSQL 16 - Primary database with Row Level Security
- Redis - Caching, rate limiting, and session management
- BullMQ - Background job queue for async processing
- Anthropic Claude API - AI analysis and insights generation

**Infrastructure:**
- Docker - Containerized development and deployment
- Vercel / AWS - Cloud hosting (configurable)
- GitHub Actions - CI/CD automation

### **Database Architecture**

Multi-tenant PostgreSQL schema with:
- **Organizations** - Tenant isolation
- **Users & Auth** - NextAuth.js integration
- **Facebook Integration** - Business accounts and ad accounts
- **Template System** - Ad templates with performance aggregation
- **Campaign Structure** - Campaigns, Ad Sets, Ads (mirrored from Facebook)
- **Performance Metrics** - Historical performance data
- **AI Analysis** - Cached AI insights and anomaly detections

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js >= 18.0.0
- PostgreSQL >= 16
- Redis >= 7
- Facebook Business Manager account
- Meta Marketing API access

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd facebook-ads-manager
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install
```

3. **Configure environment variables**
```bash
cp frontend/.env.example frontend/.env
# Edit .env with your credentials
```

4. **Set up database**
```bash
# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

5. **Start development server**
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

### **Facebook App Setup**

1. Create a Facebook App at https://developers.facebook.com
2. Add "Facebook Login" and "Marketing API" products
3. Configure OAuth redirect URI: `http://localhost:3000/api/auth/callback/facebook`
4. Copy App ID and App Secret to `.env`
5. Request advanced access for Marketing API permissions

---

## 📖 Usage

### **Connecting Facebook Accounts**

1. Navigate to **Settings > Integrations**
2. Click "Connect Facebook Business Manager"
3. Authorize the OAuth flow
4. Select Business Manager accounts to connect
5. Grant necessary permissions

### **Creating Ad Templates**

1. Go to **Templates > Create New**
2. Configure:
   - Ad copy (headline, primary text, CTA)
   - Creative specifications
   - Targeting (demographics, interests, locations)
   - Campaign structure (budget, bidding, placements)
3. Set visibility (Private or Public)
4. Save template

### **Launching Campaigns**

**From Template:**
1. Browse **Template Marketplace**
2. Select high-performing template
3. Click "Use Template"
4. Customize parameters
5. Select target ad account
6. Launch campaign

**From Scratch:**
1. Navigate to **Campaigns > Create New**
2. Configure campaign objectives and structure
3. Set budget and schedule
4. Create ad sets and ads
5. Launch campaign

### **AI Analysis**

AI analysis runs automatically:
- **Performance Predictions** - Updated daily
- **Anomaly Detection** - Runs every 4 hours
- **Copy Optimization** - On-demand or weekly
- **Audience Insights** - Updated daily

Access insights in the **Analytics > AI Insights** section.

---

## 🔧 Configuration

### **Rate Limiting**

Facebook API rate limits are managed automatically with Redis-based queuing:
```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### **AI Analysis**

Configure AI analysis frequency and caching:
```typescript
// lib/ai/config.ts
export const AI_CONFIG = {
  predictionCacheTTL: 86400, // 24 hours
  anomalyDetectionInterval: 14400, // 4 hours
  claudeModel: 'claude-3-7-sonnet-20250219',
  maxTokens: 4096
};
```

### **Template Aggregation**

Performance aggregation runs as a daily cron job:
```typescript
// lib/queue/jobs/template-aggregation.ts
// Aggregates performance metrics across all accounts using templates
```

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📦 Deployment

### **Docker Deployment**

```bash
docker-compose up -d
```

### **Vercel Deployment**

```bash
vercel --prod
```

### **Environment Variables**

Ensure all production environment variables are configured:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `FACEBOOK_APP_ID` & `FACEBOOK_APP_SECRET` - Meta app credentials
- `ANTHROPIC_API_KEY` - Claude API key
- `NEXTAUTH_SECRET` - NextAuth.js secret

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [ORCHESTRAI](https://github.com/your-org/orchestrai) - Advanced multi-agent orchestration system
- Powered by [Meta Marketing API](https://developers.facebook.com/docs/marketing-api/)
- AI insights by [Anthropic Claude](https://www.anthropic.com/)
- UI components by [ShadCN UI](https://ui.shadcn.com/)

---

## 📞 Support

For support, email support@yourdomain.com or open an issue on GitHub.

---

**Built with ❤️ using ORCHESTRAI's simultaneous multi-agent orchestration system**
