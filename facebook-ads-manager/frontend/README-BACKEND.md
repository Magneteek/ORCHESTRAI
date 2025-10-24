# Facebook Ads Manager - Backend API Documentation

## Overview

This backend API infrastructure provides a complete, production-ready system for managing a multi-tenant Facebook Ads Manager SaaS platform built with Next.js 15, Prisma ORM, and PostgreSQL.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with JWT sessions
- **Encryption**: AES-256-GCM for Facebook tokens
- **Validation**: Zod schemas
- **Type Safety**: TypeScript throughout

### Security Features
- Row Level Security (RLS) - All database queries enforce organization-based access
- AES-256-GCM encryption for Facebook access tokens
- JWT-based authentication with secure sessions
- Role-based access control (Admin, Manager, Member)
- Input validation with Zod
- CSRF protection via NextAuth.js

## Project Structure

```
frontend/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth.js handler
│       │   └── register/route.ts       # User registration
│       ├── organizations/
│       │   ├── route.ts                # List/create organizations
│       │   └── [id]/route.ts           # Get/update/delete organization
│       ├── ad-accounts/
│       │   ├── route.ts                # List ad accounts
│       │   └── [id]/route.ts           # Get/update/delete ad account
│       ├── templates/
│       │   ├── route.ts                # List/create templates
│       │   ├── [id]/route.ts           # Get/update/delete template
│       │   └── [id]/fork/route.ts      # Fork template
│       └── facebook/
│           ├── connect/route.ts        # Initiate OAuth
│           └── callback/route.ts       # OAuth callback handler
├── lib/
│   ├── db/
│   │   ├── prisma.ts                   # Prisma client singleton
│   │   ├── organizations.ts            # Organization queries
│   │   ├── users.ts                    # User queries
│   │   ├── facebook-accounts.ts        # Facebook account queries
│   │   └── templates.ts                # Template queries
│   ├── auth/
│   │   ├── config.ts                   # NextAuth configuration
│   │   └── session.ts                  # Session helpers & RLS
│   ├── utils/
│   │   ├── encryption.ts               # Token encryption
│   │   ├── errors.ts                   # Custom error classes
│   │   ├── api-response.ts             # Response formatters
│   │   └── validation.ts               # Zod schemas
│   └── helpers/
│       └── api-client.ts               # Frontend API client
├── types/
│   ├── api.ts                          # API types
│   ├── database.ts                     # Database types
│   └── next-auth.d.ts                  # NextAuth type extensions
├── prisma/
│   └── schema.prisma                   # Database schema
└── middleware.ts                       # Route protection
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `ENCRYPTION_SECRET`: Generate with `openssl rand -base64 32` (min 32 chars)
- `FACEBOOK_APP_ID`: Facebook App ID
- `FACEBOOK_APP_SECRET`: Facebook App Secret

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

## API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Body: { email, password, name, organizationName }
Response: { user, organization }
```

#### Login (via NextAuth)
```
POST /api/auth/signin
Body: { email, password }
Response: Session token
```

### Organizations

#### Get Current Organization
```
GET /api/organizations
Response: Organization details
```

#### Get Organization by ID
```
GET /api/organizations/[id]
Response: Organization with users
```

#### Update Organization (Admin only)
```
PATCH /api/organizations/[id]
Body: { name?, plan?, status? }
Response: Updated organization
```

### Facebook Integration

#### Initiate OAuth
```
GET /api/facebook/connect
Response: { authUrl }
```

#### OAuth Callback (Handled automatically)
```
GET /api/facebook/callback?code=xxx&state=xxx
Redirects to: /dashboard/facebook/success or /dashboard/facebook/error
```

### Ad Accounts

#### List Ad Accounts
```
GET /api/ad-accounts
Response: Array of ad accounts with business account info
```

#### Get Ad Account
```
GET /api/ad-accounts/[id]
Response: Ad account details
```

#### Update Ad Account
```
PATCH /api/ad-accounts/[id]
Body: { name?, accountStatus? }
Response: Updated ad account
```

### Templates

#### List Templates (with filters)
```
GET /api/templates?page=1&limit=20&category=ecommerce&visibility=all&search=query
Response: { data: [...], meta: { page, limit, total, totalPages } }
```

#### Create Template (Manager/Admin only)
```
POST /api/templates
Body: { name, description, category, objective, visibility, adCopy, creativeSpecs, targetingConfig, campaignStructure }
Response: Created template
```

#### Get Template
```
GET /api/templates/[id]
Response: Template with performance aggregate
```

#### Update Template (Manager/Admin only)
```
PATCH /api/templates/[id]
Body: Partial template data
Response: Updated template
```

#### Fork Template (Manager/Admin only)
```
POST /api/templates/[id]/fork
Body: { name? }
Response: Cloned template
```

## Database Schema

### Core Models
- **Organization**: Multi-tenant organization
- **User**: Users with roles (admin, manager, member)
- **Session/Account**: NextAuth.js authentication
- **FacebookBusinessAccount**: Facebook Business Manager integration
- **AdAccount**: Facebook Ad Accounts
- **AdTemplate**: Ad campaign templates
- **TemplatePerformanceAggregate**: Performance metrics per template

### Relationships
- Organization → Users (1:N)
- Organization → FacebookBusinessAccounts (1:N)
- Organization → AdTemplates (1:N)
- FacebookBusinessAccount → AdAccounts (1:N)
- AdTemplate → TemplatePerformanceAggregate (1:1)

## Security & Access Control

### Row Level Security

All database queries enforce organization-based access through user session validation:

```typescript
// Example: Get organization with RLS
const organization = await prisma.organization.findFirst({
  where: {
    id: organizationId,
    users: {
      some: {
        id: userId, // Ensures user belongs to organization
      },
    },
  },
});
```

### Role Permissions

| Permission | Admin | Manager | Member |
|-----------|-------|---------|--------|
| Manage Organization | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Manage Templates | ✅ | ✅ | ❌ |
| Connect Facebook | ✅ | ✅ | ❌ |
| Launch Campaigns | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ |

### Token Encryption

Facebook access tokens are encrypted using AES-256-GCM:

```typescript
import { encrypt, decrypt } from '@/lib/utils/encryption';

// Encrypt before storage
const encryptedToken = encrypt(accessToken);

// Decrypt when needed
const accessToken = decrypt(encryptedToken);
```

## Error Handling

All API routes use standardized error responses:

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human readable message",
    details?: { ... }
  }
}
```

Common error codes:
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (422): Invalid input
- `INTERNAL_SERVER_ERROR` (500): Server error

## Frontend Usage

Use the type-safe API client:

```typescript
import { apiClient } from '@/lib/helpers/api-client';

// Example: Fetch templates
const templates = await apiClient.get('/api/templates?page=1&limit=20');

// Example: Create template
const template = await apiClient.post('/api/templates', templateData);

// Example: Update template
const updated = await apiClient.patch(`/api/templates/${id}`, updates);
```

## Testing

### Run Prisma Studio
```bash
npx prisma studio
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Production Deployment

1. Set all environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Generate Prisma client: `npx prisma generate`
4. Build application: `npm run build`
5. Start production server: `npm start`

## Additional Features to Implement

- [ ] Campaign launch endpoints
- [ ] Performance metrics aggregation
- [ ] AI analysis endpoints
- [ ] Anomaly detection
- [ ] Webhook handlers for Facebook updates
- [ ] Background job processing with BullMQ
- [ ] Caching layer with Redis
- [ ] Rate limiting
- [ ] API documentation with OpenAPI/Swagger

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
