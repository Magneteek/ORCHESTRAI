# Backend API Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15 with App Router
- Prisma ORM and PostgreSQL client
- NextAuth.js v5 for authentication
- bcryptjs for password hashing
- Zod for validation

### 2. Configure Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
```

**Required configuration:**

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://user:password@localhost:5432/facebook_ads_manager?schema=public"

# NextAuth.js - Generate a secure secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Encryption - Generate a secure secret (min 32 chars)
ENCRYPTION_SECRET="generate-with: openssl rand -base64 32"

# Facebook App - Get from Facebook Developer Portal
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# Optional services
REDIS_URL="redis://localhost:6379"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

**Generate secrets:**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_SECRET
openssl rand -base64 32
```

### 3. Setup Database

**Option A: Using npm scripts (recommended)**

```bash
npm run db:setup
```

This will:
1. Generate Prisma client
2. Run database migrations
3. Create all tables

**Option B: Manual setup**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Verify Setup

Check that all required environment variables are set:

```bash
node -e "
const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'ENCRYPTION_SECRET', 'FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('Missing required environment variables:', missing);
  process.exit(1);
}
console.log('✅ All required environment variables are set');
"
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at: `http://localhost:3000/api`

## Testing the API

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "name": "Admin User",
    "organizationName": "My Company"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    },
    "organization": {
      "id": "uuid",
      "name": "My Company",
      "slug": "my-company"
    }
  }
}
```

### 2. Sign In

Visit: `http://localhost:3000/api/auth/signin`

Or use the NextAuth.js client:

```typescript
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  email: 'admin@example.com',
  password: 'SecurePassword123',
  callbackUrl: '/dashboard'
});
```

### 3. Test Protected Endpoints

After signing in, test protected endpoints:

```bash
# Get current organization
curl http://localhost:3000/api/organizations \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# List templates
curl http://localhost:3000/api/templates?page=1&limit=20 \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Database Schema

The database includes:

- **organizations**: Multi-tenant organizations
- **users**: User accounts with roles
- **facebook_business_accounts**: Connected Facebook Business Managers
- **ad_accounts**: Facebook Ad Accounts
- **ad_templates**: Reusable ad campaign templates
- **template_performance_aggregate**: Performance metrics
- **campaigns**, **ad_sets**, **ads**: Facebook ad structure
- **performance_metrics**: Daily performance data
- **ai_analysis**: AI-generated insights

View schema: `/Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend/prisma/schema.prisma`

## Available API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `GET/POST /api/auth/signin` - Sign in (NextAuth)
- `GET /api/auth/signout` - Sign out

### Organizations
- `GET /api/organizations` - Get current organization
- `GET /api/organizations/[id]` - Get organization details
- `PATCH /api/organizations/[id]` - Update organization
- `DELETE /api/organizations/[id]` - Delete organization

### Facebook Integration
- `GET /api/facebook/connect` - Get OAuth URL
- `GET /api/facebook/callback` - OAuth callback handler

### Ad Accounts
- `GET /api/ad-accounts` - List all ad accounts
- `GET /api/ad-accounts/[id]` - Get ad account
- `PATCH /api/ad-accounts/[id]` - Update ad account
- `DELETE /api/ad-accounts/[id]` - Delete ad account

### Templates
- `GET /api/templates` - List templates (paginated, filtered)
- `POST /api/templates` - Create template
- `GET /api/templates/[id]` - Get template
- `PATCH /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template
- `POST /api/templates/[id]/fork` - Fork template

## Security Features

### Row Level Security (RLS)

All database queries automatically enforce organization-based access:

```typescript
// Users can only access data in their organization
const templates = await prisma.adTemplate.findMany({
  where: {
    organization: {
      users: {
        some: { id: userId }
      }
    }
  }
});
```

### Token Encryption

Facebook access tokens are encrypted with AES-256-GCM:

```typescript
import { encrypt, decrypt } from '@/lib/utils/encryption';

// Before storing
const encrypted = encrypt(facebookToken);

// When retrieving
const token = decrypt(encrypted);
```

### Role-Based Access Control

Three roles with different permissions:
- **Admin**: Full access to organization
- **Manager**: Can manage templates and campaigns
- **Member**: Read-only access

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U user -d facebook_ads_manager

# Reset database (WARNING: deletes all data)
npm run prisma:migrate -- reset
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
npm run prisma:generate

# Format schema
npx prisma format
```

### NextAuth Session Issues

1. Clear browser cookies
2. Verify `NEXTAUTH_SECRET` is set
3. Check `NEXTAUTH_URL` matches your domain
4. Restart development server

### Encryption Errors

1. Verify `ENCRYPTION_SECRET` is at least 32 characters
2. Don't change the secret after encrypting data
3. Test encryption: `node -e "require('./lib/utils/encryption').validateEncryptionConfig()"`

## Production Deployment

### 1. Environment Setup

Set production environment variables:
- Update `DATABASE_URL` with production database
- Set `NEXTAUTH_URL` to production domain
- Rotate secrets (generate new `NEXTAUTH_SECRET` and `ENCRYPTION_SECRET`)
- Configure Facebook app for production domain

### 2. Database Migration

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 3. Build and Deploy

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

### 4. Verify Deployment

```bash
# Check health endpoint (create one)
curl https://your-domain.com/api/health

# Test authentication
curl https://your-domain.com/api/organizations \
  -H "Cookie: next-auth.session-token=TOKEN"
```

## Next Steps

1. ✅ Backend API infrastructure complete
2. 🔄 Build frontend UI components
3. 🔄 Implement campaign launch functionality
4. 🔄 Add performance analytics
5. 🔄 Integrate AI analysis features
6. 🔄 Setup background jobs with BullMQ
7. 🔄 Add caching with Redis
8. 🔄 Implement real-time updates with WebSockets

## Support Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Zod Validation](https://zod.dev)

For detailed API documentation, see: `README-BACKEND.md`
