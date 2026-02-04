# Phase 5: Cross-Account Analytics Dashboard - Implementation Guide

## Overview

Phase 5 implements a comprehensive cross-account analytics dashboard for Facebook Ads Manager, providing admin-only insights into template performance across all ad accounts in an organization.

## Architecture

### Components Structure

```
app/
├── dashboard/
│   └── analytics/
│       └── templates/
│           └── page.tsx                 # Main analytics dashboard

components/
└── analytics/
    ├── date-range-picker.tsx            # Already exists
    ├── metric-card.tsx                  # Already exists
    ├── template-performance-table.tsx   # New: Sortable table with expandable rows
    ├── expandable-template-row.tsx      # New: Per-account breakdown
    ├── template-roas-chart.tsx          # New: Horizontal bar chart
    └── spend-distribution-chart.tsx     # New: Pie chart

lib/
├── db/
│   └── analytics.ts                     # New: Database helpers
├── queue/
│   └── jobs/
│       └── template-performance-sync.ts # New: Background job
└── utils/
    └── errors.ts                        # Updated: Added handleApiError

app/
└── api/
    └── analytics/
        └── templates/
            ├── route.ts                 # GET: Template analytics
            └── [id]/
                └── breakdown/
                    └── route.ts         # GET: Per-account breakdown
```

### Database Schema

Uses existing Prisma models:
- `AdTemplate` - Template definitions
- `TemplatePerformanceAggregate` - Pre-computed metrics
- `TemplateLaunch` - Usage tracking
- `Campaign` - Campaign data
- `PerformanceMetric` - Daily metrics

## Features

### 1. Admin-Only Access

All endpoints and pages require ADMIN role:

```typescript
const session = await requireAdmin(request);
```

### 2. Key Metrics Cards

Four metric cards display:
- **Total Templates**: Count of templates with usage
- **Active Campaigns**: Count of ACTIVE status campaigns
- **Total Spend**: Aggregated spend across all templates
- **Avg ROAS**: Average return on ad spend

### 3. Interactive Charts

#### ROAS Chart (Horizontal Bar)
- Shows top 10 templates by ROAS
- Color-coded bars:
  - Green: ROAS ≥ 3.0
  - Yellow: ROAS 1.0-3.0
  - Red: ROAS < 1.0
- Interactive tooltips

#### Spend Distribution (Pie Chart)
- Shows top 5 templates + "Others"
- Displays spend amount and percentage
- Interactive legend

### 4. Performance Table

Features:
- **Sortable columns**: Click headers to sort
- **Expandable rows**: Click chevron to see per-account breakdown
- **Visual indicators**: ROAS badges color-coded
- **Quick actions**:
  - "View" - Navigate to template details
  - "Launch" - Launch new campaign from template

Columns:
- Template Name (with usage count)
- Category (badge)
- Accounts Using
- Total Spend
- Avg ROAS (color-coded badge)
- Avg CTR
- Avg CPC
- Actions

### 5. Per-Account Breakdown

When row is expanded, shows:
- Account Name
- Campaigns count
- Spend per account
- ROAS per account
- CTR per account
- CPC per account
- Totals row at bottom

### 6. Filters

- **Date Range Picker**: Last 7/30/90 days, or custom range
- **Category Filter**: Filter by template category

## API Endpoints

### GET /api/analytics/templates

**Description**: Fetch template analytics with filters

**Query Parameters**:
```typescript
{
  startDate?: string;  // ISO date string
  endDate?: string;    // ISO date string
  category?: string;   // Template category
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    analytics: {
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
    };
    categories: Array<{
      category: string;
      count: number;
    }>;
  }
}
```

### GET /api/analytics/templates/[id]/breakdown

**Description**: Get per-account breakdown for a template

**Path Parameters**:
- `id`: Template ID

**Response**:
```typescript
{
  success: true,
  data: Array<{
    accountId: string;
    accountName: string;
    campaigns: number;
    spend: number;
    roas: number | null;
    ctr: number | null;
    cpc: number | null;
  }>
}
```

## Background Jobs

### Template Performance Sync

**Queue Name**: `template-performance-sync`

**Purpose**: Aggregates performance data from campaigns into `TemplatePerformanceAggregate` table

**Frequency**: Every 6 hours (configurable)

**Job Data**:
```typescript
{
  templateId: string;
}
```

**Process**:
1. Fetch all campaigns using the template
2. Aggregate metrics from last 30 days
3. Calculate averages (ROAS, CTR, CPC, CPM)
4. Count unique ad accounts
5. Update `TemplatePerformanceAggregate` record

**Functions**:

```typescript
// Schedule sync for single template
await scheduleTemplatePerformanceSync(templateId);

// Schedule sync for all templates (called by cron)
await scheduleAllTemplatePerformanceSync();

// Schedule recurring sync (every 6 hours)
await scheduleRecurringTemplatePerformanceSync();

// Trigger immediate sync
await triggerImmediateTemplateSync(templateId);

// Get sync status
await getTemplateSyncStatus(templateId);
```

## Database Helpers

### `lib/db/analytics.ts`

#### getTemplateAnalytics()
```typescript
getTemplateAnalytics(
  organizationId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
  }
): Promise<TemplateAnalytics>
```

Fetches template analytics with optional filters.

#### getTemplateAccountBreakdown()
```typescript
getTemplateAccountBreakdown(
  templateId: string,
  organizationId: string
): Promise<AccountBreakdown[]>
```

Gets per-account breakdown for a template.

#### updateTemplatePerformance()
```typescript
updateTemplatePerformance(
  templateId: string,
  metrics: PerformanceMetrics
): Promise<void>
```

Updates template performance aggregate (upsert).

#### getTemplateCategories()
```typescript
getTemplateCategories(
  organizationId: string
): Promise<Array<{ category: string; count: number }>>
```

Gets available template categories with counts.

#### getTemplatePerformanceTimeSeries()
```typescript
getTemplatePerformanceTimeSeries(
  templateId: string,
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<TimeSeriesData[]>
```

Gets template performance over time (not used in Phase 5 but available for future enhancements).

## Setup Instructions

### 1. Database Migration

The Prisma schema already includes `TemplatePerformanceAggregate` from Phase 1. No new migrations needed.

### 2. Environment Variables

Ensure Redis connection is configured:

```env
BULLMQ_REDIS_HOST=localhost
BULLMQ_REDIS_PORT=6379
REDIS_PASSWORD=optional
```

### 3. Start Background Workers

The worker starts automatically when the module is imported. To manually control:

```typescript
import { templatePerformanceSyncWorker } from '@/lib/queue/jobs/template-performance-sync';

// Worker is auto-started

// To schedule recurring sync (run once on app startup)
import { scheduleRecurringTemplatePerformanceSync } from '@/lib/queue/jobs/template-performance-sync';
await scheduleRecurringTemplatePerformanceSync();
```

### 4. Access Dashboard

Navigate to: `/dashboard/analytics/templates`

**Required**: User must have ADMIN role.

## Performance Considerations

### 1. Data Aggregation

- Background job runs every 6 hours (configurable)
- Processes 3 templates concurrently
- Aggregates last 30 days of metrics
- Uses Prisma's efficient aggregation queries

### 2. Query Optimization

- Indexed fields: `templateId`, `avgRoas`, `category`
- Lazy loading of account breakdowns (only when row expanded)
- React Query caching with stale-while-revalidate

### 3. UI Performance

- Client-side sorting (no server round-trips)
- Skeleton loading states
- Debounced filter changes
- Responsive design with mobile support

## Testing Checklist

- [ ] Admin user can access `/dashboard/analytics/templates`
- [ ] Non-admin user receives 403 Forbidden
- [ ] Metric cards display correct aggregated data
- [ ] ROAS chart shows top 10 templates with color coding
- [ ] Spend distribution chart shows top 5 + others
- [ ] Table is sortable by all columns
- [ ] Table rows expand to show account breakdown
- [ ] Account breakdown loads via API
- [ ] Date range filter updates data
- [ ] Category filter updates data
- [ ] "View" button navigates to template page
- [ ] "Launch" button navigates to campaign launch with templateId
- [ ] Background job successfully syncs template performance
- [ ] Loading states display during API calls
- [ ] Error states display for failed API calls
- [ ] Empty states display when no data available

## Security Notes

1. **Admin-Only Access**: All endpoints use `requireAdmin()` middleware
2. **Organization Isolation**: All queries filter by `organizationId`
3. **No Data Leakage**: Account breakdown only shows accounts in user's organization
4. **Input Validation**: Date ranges and category filters validated
5. **Error Handling**: Generic error messages in production

## Future Enhancements

### Potential Phase 6 Features

1. **Export Analytics**: Download CSV/Excel reports
2. **Time Series Charts**: Performance trends over time
3. **Comparison Mode**: Compare templates side-by-side
4. **Custom Metrics**: Define and track custom KPIs
5. **Scheduled Reports**: Email reports on schedule
6. **Template Recommendations**: AI-powered template suggestions
7. **A/B Test Analytics**: Compare template variants
8. **Budget Optimization**: Suggest budget allocation
9. **Forecasting**: Predict future performance
10. **Anomaly Alerts**: Notify on performance anomalies

## Troubleshooting

### Issue: Background job not running

**Solution**: Verify Redis connection and ensure worker is started:

```bash
# Check Redis
redis-cli ping

# Check BullMQ queue
redis-cli KEYS "bull:template-performance-sync:*"
```

### Issue: Empty analytics dashboard

**Solution**:
1. Verify templates have `timesUsed > 0`
2. Run immediate sync: `await triggerImmediateTemplateSync(templateId)`
3. Check `TemplatePerformanceAggregate` table has data

### Issue: Slow query performance

**Solution**:
1. Ensure database indexes are created (Prisma migrations handle this)
2. Consider adding composite indexes for frequent query patterns
3. Implement pagination if dataset grows very large

### Issue: Account breakdown not loading

**Solution**:
1. Check browser console for API errors
2. Verify template campaigns exist with performance metrics
3. Ensure user has access to the organization

## Dependencies

- **@tanstack/react-query**: Data fetching and caching
- **recharts**: Chart library
- **bullmq**: Background job queue
- **date-fns**: Date manipulation
- **lucide-react**: Icons
- **ShadCN UI**: Component library

## Files Modified

- `lib/utils/errors.ts` - Added `handleApiError` function

## Files Created

1. `lib/db/analytics.ts` - Database helpers
2. `lib/queue/jobs/template-performance-sync.ts` - Background job
3. `app/api/analytics/templates/route.ts` - Analytics API
4. `app/api/analytics/templates/[id]/breakdown/route.ts` - Breakdown API
5. `components/analytics/template-performance-table.tsx` - Performance table
6. `components/analytics/expandable-template-row.tsx` - Expandable rows
7. `components/analytics/template-roas-chart.tsx` - ROAS chart
8. `components/analytics/spend-distribution-chart.tsx` - Spend chart
9. `app/dashboard/analytics/templates/page.tsx` - Main dashboard page
10. `docs/PHASE-5-ANALYTICS-IMPLEMENTATION.md` - This documentation

## Summary

Phase 5 successfully implements a comprehensive cross-account analytics dashboard with:
- ✅ Admin-only access control
- ✅ Real-time data fetching with caching
- ✅ Interactive charts and tables
- ✅ Per-account performance breakdown
- ✅ Background job for data aggregation
- ✅ Responsive mobile-friendly design
- ✅ Type-safe API contracts
- ✅ Proper error handling
- ✅ Loading and empty states
- ✅ Comprehensive documentation

The implementation follows Next.js 15 best practices, uses ShadCN UI components, and maintains RBAC patterns from Phase 3.
