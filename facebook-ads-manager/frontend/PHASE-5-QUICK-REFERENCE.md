# Phase 5 Quick Reference Card

## 🚀 Quick Start

### Access Dashboard
```
URL: /dashboard/analytics/templates
Required: ADMIN role
```

### Run Background Job Manually
```typescript
import { scheduleAllTemplatePerformanceSync } from '@/lib/queue/jobs/template-performance-sync';

// Schedule sync for all templates
await scheduleAllTemplatePerformanceSync();
```

### Trigger Immediate Sync
```typescript
import { triggerImmediateTemplateSync } from '@/lib/queue/jobs/template-performance-sync';

// Sync specific template and wait
const result = await triggerImmediateTemplateSync('template-id');
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `/app/dashboard/analytics/templates/page.tsx` | Main dashboard page |
| `/app/api/analytics/templates/route.ts` | Analytics API |
| `/lib/db/analytics.ts` | Database helpers |
| `/lib/queue/jobs/template-performance-sync.ts` | Background job |

---

## 🔌 API Endpoints

### Get Analytics
```http
GET /api/analytics/templates?startDate=2024-01-01&endDate=2024-01-31&category=dental
```

### Get Account Breakdown
```http
GET /api/analytics/templates/{templateId}/breakdown
```

---

## 🎨 Components

### Import Components
```typescript
import { TemplatePerformanceTable } from '@/components/analytics/template-performance-table';
import { TemplateRoasChart } from '@/components/analytics/template-roas-chart';
import { SpendDistributionChart } from '@/components/analytics/spend-distribution-chart';
```

### Usage
```typescript
<TemplatePerformanceTable templates={data} isLoading={loading} />
<TemplateRoasChart templates={data} limit={10} />
<SpendDistributionChart templates={data} topN={5} />
```

---

## 💾 Database Functions

```typescript
import {
  getTemplateAnalytics,
  getTemplateAccountBreakdown,
  updateTemplatePerformance,
} from '@/lib/db/analytics';

// Get analytics with filters
const analytics = await getTemplateAnalytics(orgId, {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  category: 'general-dentist',
});

// Get per-account breakdown
const breakdown = await getTemplateAccountBreakdown(templateId, orgId);

// Update performance (usually done by background job)
await updateTemplatePerformance(templateId, {
  totalSpend: 1000,
  avgRoas: 3.5,
  accountsUsing: 5,
});
```

---

## ⚙️ Background Job Control

```typescript
import {
  scheduleTemplatePerformanceSync,
  scheduleAllTemplatePerformanceSync,
  scheduleRecurringTemplatePerformanceSync,
  triggerImmediateTemplateSync,
  getTemplateSyncStatus,
} from '@/lib/queue/jobs/template-performance-sync';

// Single template
await scheduleTemplatePerformanceSync('template-id');

// All templates
await scheduleAllTemplatePerformanceSync();

// Recurring (every 6 hours)
await scheduleRecurringTemplatePerformanceSync();

// Immediate with wait
const result = await triggerImmediateTemplateSync('template-id');

// Check status
const status = await getTemplateSyncStatus('template-id');
// Returns: { lastSync, nextSync, status: 'idle' | 'running' | 'failed' }
```

---

## 🎯 Color Coding

### ROAS Indicators
- 🟢 Green: ROAS ≥ 3.0 (Excellent)
- 🟡 Yellow: ROAS 1.0-3.0 (Good)
- 🔴 Red: ROAS < 1.0 (Poor)

### Badge Variants
```typescript
const variant = roas >= 3 ? 'success' : roas >= 1 ? 'warning' : 'destructive';
```

---

## 📊 Data Structures

### Template Analytics
```typescript
interface TemplateAnalytics {
  totals: {
    totalTemplates: number;
    activeCampaigns: number;
    totalSpend: number;
    avgRoas: number;
  };
  templates: Array<{
    id: string;
    name: string;
    category: string;
    accountsUsing: number;
    totalSpend: number;
    avgRoas: number | null;
    avgCtr: number | null;
    avgCpc: number | null;
    timesUsed: number;
  }>;
}
```

### Account Breakdown
```typescript
interface AccountBreakdown {
  accountId: string;
  accountName: string;
  campaigns: number;
  spend: number;
  roas: number | null;
  ctr: number | null;
  cpc: number | null;
}
```

---

## 🔐 Security

### Admin Check
```typescript
import { requireAdmin } from '@/lib/auth/api-protection';

// In API route
const session = await requireAdmin(request);
```

### Organization Isolation
All queries automatically filter by `organizationId` from session.

---

## 🐛 Debugging

### Check Redis Queue
```bash
# Redis CLI
redis-cli

# List all keys for queue
KEYS "bull:template-performance-sync:*"

# Get job status
HGETALL "bull:template-performance-sync:job-id"
```

### Check Background Job Logs
```bash
# Look for these logs:
# "Syncing performance for template {id}"
# "Template {id} performance synced: $X spend, Y accounts"
# "Template performance sync worker initialized"
```

### Test API Endpoints
```bash
# Get analytics (replace token)
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3001/api/analytics/templates?startDate=2024-01-01"

# Get breakdown
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3001/api/analytics/templates/TEMPLATE_ID/breakdown"
```

---

## ⚡ Performance Tips

1. **Use Date Range Filters**: Limit data to specific periods
2. **Lazy Load Breakdowns**: Only expand rows when needed
3. **Cache with React Query**: Automatic caching reduces API calls
4. **Client-Side Sorting**: No server round-trips
5. **Indexed Queries**: Database indexes on key fields

---

## 🔧 Common Issues

### Issue: No data showing
**Solution**: Run immediate sync for templates
```typescript
await scheduleAllTemplatePerformanceSync();
```

### Issue: Background job not running
**Solution**: Check Redis connection
```bash
redis-cli ping
# Should return: PONG
```

### Issue: Permission denied
**Solution**: Verify user has ADMIN role
```sql
SELECT role FROM users WHERE id = 'user-id';
```

---

## 📝 Formatting Helpers

```typescript
// Currency
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);

// Percentage
const formatPercent = (value: number) => `${value.toFixed(2)}%`;

// ROAS
const formatRoas = (value: number) => `${value.toFixed(2)}x`;

// Number with commas
const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);
```

---

## 🧪 Testing Commands

```bash
# Type check
npm run type-check

# Build
npm run build

# Development
npm run dev

# Access dashboard
open http://localhost:3001/dashboard/analytics/templates
```

---

## 📚 Related Documentation

- Full Implementation Guide: `/docs/PHASE-5-ANALYTICS-IMPLEMENTATION.md`
- Deliverables Summary: `/PHASE-5-DELIVERABLES.md`
- API Documentation: Check `/app/api/analytics/templates/` files
- Component Documentation: Check `/components/analytics/` files

---

## 💡 Pro Tips

1. **Batch Updates**: Background job runs every 6 hours automatically
2. **Real-Time Insights**: Use immediate sync for critical analysis
3. **Filter Combinations**: Combine date range + category for deep dives
4. **Export Data**: Use browser dev tools to copy table data (future: CSV export)
5. **Mobile Friendly**: Dashboard works great on tablets/phones

---

## 🎓 Learning Resources

### React Query
- Docs: https://tanstack.com/query/latest
- Caching strategy: stale-while-revalidate

### Recharts
- Docs: https://recharts.org/
- Examples: https://recharts.org/en-US/examples

### BullMQ
- Docs: https://docs.bullmq.io/
- Queue patterns: https://docs.bullmq.io/patterns

### ShadCN UI
- Components: https://ui.shadcn.com/
- Theming: Uses Tailwind CSS variables

---

## 🚦 Status Indicators

| Status | Meaning |
|--------|---------|
| 🟢 Running | Background job active |
| 🟡 Idle | Job scheduled, waiting |
| 🔴 Failed | Job failed, check logs |
| ⏸️ Paused | Queue paused manually |

---

## 📞 Quick Help

### Dashboard Not Loading
1. Check admin permissions
2. Verify API endpoint accessible
3. Check browser console
4. Verify database connection

### Data Not Updating
1. Check background job status
2. Verify templates have usage
3. Check TemplatePerformanceAggregate table
4. Run immediate sync manually

### Chart Not Rendering
1. Verify data structure
2. Check for null/undefined values
3. Ensure Recharts imported correctly
4. Check browser console for errors

---

**Last Updated**: Phase 5 Implementation - January 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
