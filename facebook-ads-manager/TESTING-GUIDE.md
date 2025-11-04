# Testing Guide - Facebook Ads Manager

## 🧪 Quick Start Testing

### Prerequisites Checklist

Before starting, ensure you have:
- ✅ Node.js >= 18.0.0 installed
- ✅ PostgreSQL running (via Docker or local)
- ✅ Redis running (via Docker or local)
- ✅ Facebook Developer App created (for OAuth testing)

---

## 🚀 Option 1: Quick Test with Docker (Recommended)

This will start PostgreSQL, Redis, and the app all together.

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager

# Start all services
docker-compose up -d

# Watch logs
docker-compose logs -f app

# Access the app
open http://localhost:3001
```

**What this does:**
- Starts PostgreSQL on port 5432
- Starts Redis on port 6379
- Starts Next.js app on port 3001
- Automatically runs database migrations

**Troubleshooting:**
```bash
# If postgres fails to start
docker-compose down -v
docker-compose up -d postgres
# Wait 10 seconds
docker-compose up -d

# Check service status
docker-compose ps

# View specific service logs
docker-compose logs postgres
docker-compose logs redis
docker-compose logs app
```

---

## 🔧 Option 2: Local Development (Without Docker)

### Step 1: Start PostgreSQL & Redis

**If you have them locally:**
```bash
# PostgreSQL should be running on port 5432
# Redis should be running on port 6379
```

**Or use Docker for just the databases:**
```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager

# Start only databases
docker-compose up -d postgres redis

# Verify they're running
docker-compose ps
```

### Step 2: Configure Environment

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend

# Copy environment template
cp .env.example .env

# Generate secrets
openssl rand -base64 32  # Copy this for NEXTAUTH_SECRET
openssl rand -base64 32  # Copy this for ENCRYPTION_SECRET

# Edit .env
nano .env
```

**Required environment variables:**
```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
PORT=3001

# Database (if using Docker databases)
DATABASE_URL="postgresql://fbads:fbads_dev_password@localhost:5432/facebook_ads_manager?schema=public"

# Redis (if using Docker)
REDIS_URL=redis://localhost:6379

# NextAuth.js
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET="<paste-generated-secret-here>"

# Encryption
ENCRYPTION_SECRET="<paste-generated-secret-here>"

# Facebook (optional for initial testing)
FACEBOOK_APP_ID=your-app-id-here
FACEBOOK_APP_SECRET=your-app-secret-here
FACEBOOK_API_VERSION=v22.0

# Anthropic (optional for initial testing)
ANTHROPIC_API_KEY=your-api-key-here
```

### Step 3: Install Dependencies

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend

# Install all dependencies
npm install

# This will install:
# - Next.js 15
# - Prisma + PostgreSQL client
# - NextAuth.js
# - Facebook Business SDK
# - ShadCN UI components
# - And all other dependencies
```

### Step 4: Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Verify database setup
npm run prisma:studio
# This opens Prisma Studio at http://localhost:5555
```

### Step 5: Start Development Server

```bash
# Start Next.js development server
npm run dev

# Server will start on port 3001
# Access at: http://localhost:3001
```

---

## ✅ Testing Checklist

### 1. **Homepage Test**
```bash
# Open browser
open http://localhost:3001

# You should see:
✅ Hero section with "Facebook Ads Manager" title
✅ Features section
✅ Statistics section
✅ Call-to-action buttons
```

### 2. **Authentication Test**

**Register a new user:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User",
    "organizationName": "Test Organization"
  }'

# Expected response:
# {
#   "user": {
#     "id": "...",
#     "email": "test@example.com",
#     "name": "Test User"
#   },
#   "organization": {
#     "id": "...",
#     "name": "Test Organization"
#   }
# }
```

**Sign in:**
```bash
# Navigate to: http://localhost:3001/api/auth/signin
# Enter credentials and sign in
```

### 3. **Dashboard Test**
```bash
# After signing in, navigate to:
open http://localhost:3001/dashboard

# You should see:
✅ Sidebar navigation
✅ Header with account switcher
✅ Dashboard metrics cards
✅ Performance table (empty for now)
```

### 4. **API Endpoints Test**

**Get organizations:**
```bash
# First, get your session token from browser dev tools
# Then:

curl -X GET http://localhost:3001/api/organizations \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Expected: List of your organizations
```

**Create a template:**
```bash
curl -X POST http://localhost:3001/api/templates \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Test Ad Template",
    "description": "A test template for e-commerce",
    "category": "e-commerce",
    "objective": "OUTCOME_SALES",
    "adCopy": {
      "headline": "50% Off Sale!",
      "primaryText": "Limited time offer on all products",
      "description": "Shop now and save big",
      "callToAction": "SHOP_NOW"
    },
    "creativeSpecs": {
      "format": "SINGLE_IMAGE",
      "dimensions": "1200x628"
    },
    "targetingConfig": {
      "minAge": 25,
      "maxAge": 55,
      "interests": ["shopping", "fashion"]
    },
    "campaignStructure": {
      "dailyBudget": 50,
      "bidStrategy": "LOWEST_COST_WITHOUT_CAP"
    }
  }'

# Expected: Created template with ID
```

### 5. **Database Verification**

```bash
# Open Prisma Studio
npm run prisma:studio

# Verify tables exist:
✅ organizations
✅ users
✅ facebook_business_accounts
✅ ad_accounts
✅ ad_templates
✅ campaigns
✅ ad_sets
✅ ads
✅ performance_metrics
✅ ai_analysis
```

### 6. **Type Checking**

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend

# Run TypeScript type check
npm run type-check

# Expected: No errors (or minor warnings)
```

### 7. **Linting**

```bash
# Run ESLint
npm run lint

# Expected: Should pass or show only minor warnings
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Port 3001 Already in Use
```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
export PORT=3002
npm run dev
```

### Issue 2: Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check database URL in .env
cat .env | grep DATABASE_URL
```

### Issue 3: Prisma Client Not Generated
```bash
# Regenerate Prisma client
npm run prisma:generate

# If migration files missing
npm run prisma:migrate

# If database schema out of sync
npm run db:setup
```

### Issue 4: Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue 5: Facebook OAuth Not Working
```bash
# Facebook OAuth requires:
1. Valid Facebook App ID and Secret
2. Redirect URI configured: http://localhost:3001/api/auth/callback/facebook
3. App in development mode OR approved for Marketing API

# Test without Facebook first:
# Use email/password authentication to test core functionality
```

---

## 📊 What to Expect

### ✅ **Working Features**
- Homepage with branding and features
- User registration and authentication
- Dashboard layout with navigation
- Organization management
- Template CRUD operations
- API endpoints for all core entities
- Database with proper multi-tenancy
- Type-safe TypeScript throughout

### ⏳ **Not Yet Implemented**
- Real-time WebSocket updates
- D3.js data visualizations
- Campaign launch wizard
- AI analysis engine
- Facebook account connection UI (OAuth flow exists, UI pending)
- Template marketplace filtering
- Performance metrics aggregation

---

## 🎯 Success Criteria

After testing, you should be able to:

1. ✅ Access homepage at http://localhost:3001
2. ✅ Register a new user account
3. ✅ Sign in and see dashboard
4. ✅ Create an organization via API
5. ✅ Create ad templates via API
6. ✅ View data in Prisma Studio
7. ✅ See proper TypeScript types in IDE
8. ✅ No critical errors in browser console

---

## 🔄 Next Steps After Testing

Once you've verified the foundation works:

1. **Report Issues** - Let me know if anything doesn't work
2. **Customize Configuration** - Adjust settings for your use case
3. **Connect Facebook Account** - Set up Facebook OAuth for real data
4. **Continue Development** - Launch next wave of ORCHESTRAI agents

---

## 📞 Getting Help

If you encounter issues:

1. **Check logs:**
   ```bash
   docker-compose logs -f
   # Or for dev server:
   npm run dev (watch console output)
   ```

2. **Verify services:**
   ```bash
   docker-compose ps
   ```

3. **Database debug:**
   ```bash
   npm run prisma:studio
   ```

4. **Report the issue** with:
   - Error message
   - Steps to reproduce
   - Browser console output
   - Server logs

---

**Ready to test!** Start with Docker for the easiest setup, or follow the local development guide for more control.
