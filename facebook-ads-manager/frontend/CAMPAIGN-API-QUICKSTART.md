# Campaign API Quick Start Guide

## Installation & Setup

### 1. Prerequisites
```bash
# Ensure you have all dependencies installed
npm install
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Configure required variables
DATABASE_URL=postgresql://user:pass@localhost:5432/fbads
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Start Services
```bash
# Start Redis
redis-server

# Start development server
npm run dev
```

---

## Quick Examples

### Example 1: List All Campaigns

```typescript
// GET /api/campaigns?adAccountId={id}&page=1&limit=20

const response = await fetch(
  '/api/campaigns?adAccountId=abc123&page=1&limit=20&status=ACTIVE',
  {
    credentials: 'include', // Include session cookie
  }
);

const data = await response.json();

if (data.success) {
  console.log('Campaigns:', data.data);
  console.log('Total:', data.meta.total);
  console.log('Pages:', data.meta.totalPages);
}
```

### Example 2: Create a Campaign

```typescript
// POST /api/campaigns

const response = await fetch('/api/campaigns', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    adAccountId: 'abc123',
    name: 'Summer Sale 2024',
    objective: 'OUTCOME_SALES',
    status: 'PAUSED',
    dailyBudget: 100.00,
    specialAdCategories: [],
    bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
  }),
});

const data = await response.json();

if (data.success) {
  console.log('Campaign created:', data.data.id);
  console.log('Facebook ID:', data.data.campaignId);
}
```

### Example 3: Update Campaign

```typescript
// PATCH /api/campaigns/{id}

const response = await fetch(`/api/campaigns/${campaignId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Summer Sale 2024 - Updated',
    dailyBudget: 150.00,
    status: 'ACTIVE',
  }),
});

const data = await response.json();

if (data.success) {
  console.log('Campaign updated:', data.data);
}
```

### Example 4: Create Ad Set with Targeting

```typescript
// POST /api/ad-sets

const response = await fetch('/api/ad-sets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    campaignId: 'campaign-uuid',
    name: 'US Adults 25-45',
    status: 'PAUSED',
    dailyBudget: 50.00,
    optimizationGoal: 'LINK_CLICKS',
    billingEvent: 'IMPRESSIONS',
    targeting: {
      age_min: 25,
      age_max: 45,
      genders: [1, 2],
      geo_locations: {
        countries: ['US'],
      },
      interests: [
        { id: '6003139266461', name: 'Online shopping' },
      ],
    },
  }),
});

const data = await response.json();

if (data.success) {
  console.log('Ad Set created:', data.data.id);
}
```

### Example 5: Upload Image & Create Ad

```typescript
// Step 1: Upload Image
const imageResponse = await fetch('/api/ads/upload-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    adAccountId: 'ad-account-uuid',
    imageUrl: 'https://example.com/summer-sale.jpg',
  }),
});

const imageData = await imageResponse.json();
const imageHash = imageData.data.imageHash;

// Step 2: Create Ad
const adResponse = await fetch('/api/ads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    adSetId: 'adset-uuid',
    name: 'Summer Sale Ad - Image 1',
    status: 'PAUSED',
    creative: {
      imageHash: imageHash,
      headline: 'Summer Sale - 50% Off!',
      primaryText: 'Don\'t miss our biggest sale of the year. Shop now!',
      description: 'Limited time offer',
      callToActionType: 'SHOP_NOW',
      linkUrl: 'https://example.com/sale',
    },
  }),
});

const adData = await adResponse.json();

if (adData.success) {
  console.log('Ad created:', adData.data.id);
}
```

### Example 6: Get Campaign Insights

```typescript
// GET /api/campaigns/{id}/insights?datePreset=last_7d

const response = await fetch(
  `/api/campaigns/${campaignId}/insights?datePreset=last_7d`,
  {
    credentials: 'include',
  }
);

const data = await response.json();

if (data.success) {
  console.log('Impressions:', data.data.insights.impressions);
  console.log('Clicks:', data.data.insights.clicks);
  console.log('Spend:', data.data.insights.spend);
  console.log('CTR:', data.data.insights.ctr);
  console.log('From Cache:', data.data.fromCache);
}
```

### Example 7: Duplicate Campaign

```typescript
// POST /api/campaigns/{id}/duplicate

const response = await fetch(`/api/campaigns/${campaignId}/duplicate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Summer Sale 2024 - Copy',
    includeAdSets: true,
  }),
});

const data = await response.json();

if (data.success) {
  console.log('Campaign duplicated:', data.data.id);
}
```

---

## React/Next.js Integration

### Custom Hook Example

```typescript
// hooks/useCampaigns.ts

import { useState, useEffect } from 'react';

interface UseCampaignsOptions {
  adAccountId: string;
  page?: number;
  limit?: number;
  status?: string;
}

export function useCampaigns(options: UseCampaignsOptions) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          adAccountId: options.adAccountId,
          page: String(options.page || 1),
          limit: String(options.limit || 20),
          ...(options.status && { status: options.status }),
        });

        const response = await fetch(`/api/campaigns?${params}`);
        const data = await response.json();

        if (data.success) {
          setCampaigns(data.data);
          setMeta(data.meta);
        } else {
          setError(data.error.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, [options.adAccountId, options.page, options.limit, options.status]);

  return { campaigns, loading, error, meta };
}
```

### Component Example

```typescript
// components/CampaignList.tsx

'use client';

import { useCampaigns } from '@/hooks/useCampaigns';

export function CampaignList({ adAccountId }: { adAccountId: string }) {
  const { campaigns, loading, error, meta } = useCampaigns({
    adAccountId,
    page: 1,
    limit: 20,
    status: 'ACTIVE',
  });

  if (loading) return <div>Loading campaigns...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Campaigns ({meta?.total})</h2>
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-4 border rounded">
            <h3>{campaign.name}</h3>
            <p>Status: {campaign.status}</p>
            <p>Budget: ${campaign.dailyBudget}/day</p>
            <p>Ad Sets: {campaign.adSetCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Error Handling

### Standard Error Handler

```typescript
async function handleApiRequest(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    const data = await response.json();

    if (!data.success) {
      // Handle specific error codes
      switch (data.error.code) {
        case 'UNAUTHORIZED':
          // Redirect to login
          window.location.href = '/auth/signin';
          break;

        case 'FORBIDDEN':
          // Show permission error
          console.error('You do not have permission to perform this action');
          break;

        case 'VALIDATION_ERROR':
          // Show validation errors
          console.error('Validation errors:', data.error.details);
          break;

        case 'RATE_LIMIT_EXCEEDED':
          // Show rate limit message
          console.error('Too many requests. Please try again later.');
          break;

        default:
          console.error('Error:', data.error.message);
      }

      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

---

## Testing with cURL

### List Campaigns
```bash
curl -X GET \
  'http://localhost:3000/api/campaigns?adAccountId=abc123&page=1&limit=20' \
  -H 'Cookie: next-auth.session-token=your-session-token'
```

### Create Campaign
```bash
curl -X POST \
  'http://localhost:3000/api/campaigns' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=your-session-token' \
  -d '{
    "adAccountId": "abc123",
    "name": "Test Campaign",
    "objective": "OUTCOME_SALES",
    "status": "PAUSED",
    "dailyBudget": 100.00
  }'
```

### Pause Campaign
```bash
curl -X POST \
  'http://localhost:3000/api/campaigns/campaign-id/pause' \
  -H 'Cookie: next-auth.session-token=your-session-token'
```

---

## Common Patterns

### 1. Paginated List with Search

```typescript
const [page, setPage] = useState(1);
const [search, setSearch] = useState('');

const { campaigns, meta } = useCampaigns({
  adAccountId,
  page,
  limit: 20,
  search,
});

// In component:
<input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search campaigns..."
/>

<Pagination
  currentPage={page}
  totalPages={meta?.totalPages}
  onPageChange={setPage}
/>
```

### 2. Optimistic Updates

```typescript
async function pauseCampaign(campaignId: string) {
  // Optimistic update
  setCampaigns(campaigns.map(c =>
    c.id === campaignId ? { ...c, status: 'PAUSED' } : c
  ));

  try {
    await fetch(`/api/campaigns/${campaignId}/pause`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    // Revert on error
    setCampaigns(originalCampaigns);
    console.error('Failed to pause campaign:', error);
  }
}
```

### 3. Form Validation

```typescript
import { createCampaignSchema } from '@/lib/utils/campaign-validation';

function validateCampaignForm(data: any) {
  try {
    createCampaignSchema.parse(data);
    return { valid: true, errors: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        valid: false,
        errors: error.errors.reduce((acc, err) => ({
          ...acc,
          [err.path[0]]: err.message,
        }), {}),
      };
    }
    return { valid: false, errors: { general: 'Validation failed' } };
  }
}
```

---

## Performance Tips

1. **Use Pagination:** Always paginate large lists
2. **Cache Results:** Use SWR or React Query for client-side caching
3. **Debounce Search:** Debounce search inputs to reduce API calls
4. **Batch Operations:** Group related operations when possible
5. **Lazy Load Details:** Only fetch full campaign details when needed

---

## Security Checklist

- ✅ Always include `credentials: 'include'` for session cookies
- ✅ Never expose Facebook access tokens in client code
- ✅ Validate all user inputs before API calls
- ✅ Handle all error cases appropriately
- ✅ Use HTTPS in production
- ✅ Implement CSRF protection
- ✅ Rate limit client-side requests

---

## Troubleshooting

### Issue: "Unauthorized" errors
**Solution:** Ensure you're logged in and session cookie is being sent

### Issue: "Forbidden" errors
**Solution:** Verify you have access to the organization/ad account

### Issue: Validation errors
**Solution:** Check request body matches schema requirements

### Issue: Stale data
**Solution:** Use `forceRefresh` parameter or clear cache

### Issue: Rate limit errors
**Solution:** Implement exponential backoff and retry logic

---

## Next Steps

1. Read the full [API Documentation](./API-DOCUMENTATION.md)
2. Review [Implementation Details](./CAMPAIGN-API-IMPLEMENTATION.md)
3. Explore the TypeScript types in `/types/facebook.ts`
4. Check out example implementations in `/app/dashboard/campaigns/`

---

**Happy Coding!** 🚀
