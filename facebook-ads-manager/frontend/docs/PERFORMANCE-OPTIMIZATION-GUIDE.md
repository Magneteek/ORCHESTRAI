# Performance Optimization Guide

## Overview

This guide covers all performance optimizations implemented in the Facebook Ads Manager application to achieve:

- **Lighthouse Performance Score**: ≥90
- **Core Web Vitals**: All metrics in "Good" range
- **Bundle Size**: <300KB gzipped
- **Time to Interactive**: <3.8s

## Table of Contents

1. [Core Web Vitals Tracking](#core-web-vitals-tracking)
2. [Bundle Size Optimization](#bundle-size-optimization)
3. [Image Optimization](#image-optimization)
4. [React Performance](#react-performance)
5. [D3.js Optimization](#d3js-optimization)
6. [Network Optimization](#network-optimization)
7. [Performance Monitoring](#performance-monitoring)
8. [Lighthouse CI](#lighthouse-ci)
9. [Performance Budgets](#performance-budgets)
10. [Best Practices](#best-practices)

---

## Core Web Vitals Tracking

### Implementation

Core Web Vitals are automatically tracked using the `web-vitals` library:

```typescript
// lib/performance/web-vitals.ts
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

export function initWebVitals() {
  onCLS(handleMetric);
  onFID(handleMetric);
  onLCP(handleMetric);
  onFCP(handleMetric);
  onTTFB(handleMetric);
}
```

### Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤2.5s | 2.5s - 4.0s | >4.0s |
| **FID** (First Input Delay) | ≤100ms | 100ms - 300ms | >300ms |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | 0.1 - 0.25 | >0.25 |
| **FCP** (First Contentful Paint) | ≤1.8s | 1.8s - 3.0s | >3.0s |
| **TTFB** (Time to First Byte) | ≤800ms | 800ms - 1800ms | >1800ms |

### Usage

Web Vitals are automatically initialized in the root layout:

```tsx
// app/layout.tsx
import { WebVitalsReporter } from '@/components/performance/web-vitals-reporter';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
```

### Viewing Metrics

Metrics are sent to `/api/analytics/performance` and can be viewed:

```bash
# Get all metrics
curl http://localhost:3001/api/analytics/performance

# Get metrics for specific session
curl http://localhost:3001/api/analytics/performance?sessionId=SESSION_ID

# Get specific metric
curl http://localhost:3001/api/analytics/performance?metric=LCP
```

---

## Bundle Size Optimization

### Code Splitting Strategy

**Route-based splitting** is automatically handled by Next.js App Router:

```
/dashboard/campaigns       → campaigns chunk
/dashboard/templates       → templates chunk
/dashboard/analytics       → analytics chunk
/dashboard/ai-insights     → ai-insights chunk
```

### Dynamic Imports

**For heavy components:**

```tsx
// BEFORE: Imports entire D3.js library upfront
import * as d3 from 'd3';

// AFTER: Lazy load D3.js components
const D3Chart = dynamic(() => import('@/components/analytics/d3-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

**For feature-based splitting:**

```tsx
import dynamic from 'next/dynamic';

const TemplateWizard = dynamic(
  () => import('@/components/templates/template-wizard'),
  { loading: () => <LoadingSkeleton /> }
);

const AIInsights = dynamic(
  () => import('@/components/ai/insights-panel'),
  { ssr: false }
);
```

### Webpack Configuration

Optimized chunk splitting in `next.config.js`:

```javascript
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    // React/Next.js framework
    framework: {
      name: 'framework',
      test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
      priority: 40,
    },
    // D3.js separate chunk
    d3: {
      name: 'd3',
      test: /[\\/]node_modules[\\/](d3|d3-.*)[\\/]/,
      priority: 30,
    },
    // UI libraries
    ui: {
      name: 'ui',
      test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
      priority: 25,
    },
  },
}
```

### Tree Shaking

**Import only what you need:**

```tsx
// ❌ BAD: Imports entire library
import _ from 'lodash';
import * as dateFns from 'date-fns';

// ✅ GOOD: Import specific functions
import sortBy from 'lodash/sortBy';
import { format, parseISO } from 'date-fns';
```

### Bundle Analysis

Check bundle size after each build:

```bash
npm run build
node scripts/performance-check.js
```

Expected output:

```
✓ PASS Total JavaScript: 280.5 KB / 300 KB (93.5%)
✓ PASS First Load JS: 168.3 KB / 200 KB (84.2%)
✓ PASS Total CSS: 42.1 KB / 50 KB (84.2%)
```

---

## Image Optimization

### Next.js Image Component

**Always use `next/image` for automatic optimization:**

```tsx
import Image from 'next/image';

// ✅ Optimized image with proper dimensions
<Image
  src="/campaign-preview.png"
  alt="Campaign preview"
  width={1200}
  height={630}
  quality={85}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Image Formats

Next.js automatically serves images in modern formats:

1. **AVIF** (best compression) - if browser supports
2. **WebP** (good compression) - fallback
3. **Original format** - final fallback

Configure in `next.config.js`:

```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
}
```

### Lazy Loading

**Below-the-fold images:**

```tsx
<Image
  src="/gallery-image.jpg"
  alt="Gallery"
  width={800}
  height={600}
  loading="lazy"  // Default for non-priority images
/>
```

**Above-the-fold images (LCP candidates):**

```tsx
<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority  // Preload immediately
/>
```

### Remote Images

For Facebook images, configure remote patterns:

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'platform-lookaside.fbsbx.com',
    },
  ],
}
```

---

## React Performance

### Component Memoization

**Expensive components:**

```tsx
import { memo } from 'react';

const CampaignCard = memo(({ campaign }) => {
  return (
    <div>
      {/* Expensive rendering */}
    </div>
  );
});
```

### Hook Optimization

**useMemo for expensive calculations:**

```tsx
const sortedCampaigns = useMemo(() => {
  return campaigns.sort((a, b) => b.performance - a.performance);
}, [campaigns]);
```

**useCallback for event handlers:**

```tsx
const handleCampaignClick = useCallback((campaignId: string) => {
  router.push(`/dashboard/campaigns/${campaignId}`);
}, [router]);
```

### Virtualization for Long Lists

**For lists with 100+ items:**

```tsx
import { VirtualizedTable } from '@/components/analytics/virtualized-table';

<VirtualizedTable
  data={campaigns}
  columns={columns}
  rowHeight={64}
  overscan={5}
/>
```

**Performance characteristics:**

- Handles 10,000+ rows smoothly
- Constant memory usage
- 60fps scrolling

### Suspense Boundaries

**For code splitting:**

```tsx
import { Suspense } from 'react';

<Suspense fallback={<LoadingSkeleton />}>
  <HeavyComponent />
</Suspense>
```

### React DevTools Profiler

**Profile component performance:**

```bash
# Build for production
npm run build
npm run start

# Open React DevTools → Profiler
# Record interaction
# Analyze render times
```

---

## D3.js Optimization

### Canvas vs SVG

**Use canvas for large datasets (>1000 points):**

```typescript
// For scatter plots with 5000+ points
const canvas = d3.select('canvas');
const context = canvas.node()!.getContext('2d')!;

data.forEach(d => {
  context.beginPath();
  context.arc(xScale(d.x), yScale(d.y), 3, 0, 2 * Math.PI);
  context.fill();
});
```

**Use SVG for smaller datasets (<1000 points):**

```typescript
const svg = d3.select('svg');

svg.selectAll('circle')
  .data(data)
  .join('circle')
  .attr('cx', d => xScale(d.x))
  .attr('cy', d => yScale(d.y))
  .attr('r', 4);
```

### Request Animation Frame

**For smooth animations:**

```typescript
function animate() {
  // Update visualization
  updateChart();

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

### Debounce Resize Handlers

**Prevent excessive recalculations:**

```typescript
import { useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';

const handleResize = useCallback(
  debounce(() => {
    // Recalculate chart dimensions
    updateDimensions();
  }, 250),
  []
);

useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]);
```

### Cache Computed Layouts

**Avoid recalculating scales:**

```typescript
const scales = useMemo(() => ({
  x: d3.scaleLinear()
    .domain([0, d3.max(data, d => d.x)])
    .range([0, width]),
  y: d3.scaleLinear()
    .domain([0, d3.max(data, d => d.y)])
    .range([height, 0]),
}), [data, width, height]);
```

---

## Network Optimization

### Compression

**Enabled by default in Next.js:**

```javascript
// next.config.js
{
  compress: true, // Enables gzip compression
}
```

For Brotli compression in production, configure your server (Nginx, etc.).

### Cache Headers

**Static assets:**

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

**API responses:**

```typescript
// app/api/campaigns/route.ts
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

### Preconnect to External Domains

**In root layout:**

```tsx
<head>
  <link rel="dns-prefetch" href="https://platform-lookaside.fbsbx.com" />
  <link rel="preconnect" href="https://platform-lookaside.fbsbx.com" crossOrigin="anonymous" />
</head>
```

### API Response Optimization

**Pagination:**

```typescript
// Return paginated data
{
  data: campaigns.slice(offset, offset + limit),
  total: campaigns.length,
  hasMore: offset + limit < campaigns.length,
}
```

**Field selection:**

```typescript
// Allow clients to request specific fields
const fields = searchParams.get('fields')?.split(',') || ['id', 'name'];
const filtered = campaigns.map(c => pick(c, fields));
```

---

## Performance Monitoring

### Custom Performance Marks

**Track specific operations:**

```typescript
import { markPerformance, measurePerformance } from '@/lib/performance';

// Start timing
markPerformance('campaign-load-start');

// Fetch campaigns
const campaigns = await fetchCampaigns();

// End timing
markPerformance('campaign-load-end');
measurePerformance('campaign-load', 'campaign-load-start', 'campaign-load-end');
```

### Long Task Monitoring

**Detect blocking operations:**

```typescript
import { monitorLongTasks } from '@/lib/performance';

monitorLongTasks((duration) => {
  if (duration > 50) {
    console.warn(`Long task detected: ${duration}ms`);
  }
});
```

### Memory Usage

**Track memory consumption:**

```typescript
import { getMemoryUsage } from '@/lib/performance';

const memory = getMemoryUsage();
console.log('Memory usage:', memory?.usagePercentage.toFixed(2), '%');
```

### Network Information

**Adapt to connection quality:**

```typescript
import { getNetworkInformation } from '@/lib/performance';

const network = getNetworkInformation();

if (network?.effectiveType === 'slow-2g' || network?.effectiveType === '2g') {
  // Load lower quality images
  imageQuality = 60;
}
```

---

## Lighthouse CI

### Installation

```bash
npm install -g @lhci/cli
```

### Running Lighthouse

**Single page:**

```bash
lhci autorun --collect.url=http://localhost:3001/dashboard
```

**Multiple pages:**

```bash
lhci autorun
```

This uses the configuration in `.lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3001",
        "http://localhost:3001/dashboard",
        "http://localhost:3001/dashboard/campaigns"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}]
      }
    }
  }
}
```

### Continuous Integration

**GitHub Actions workflow:**

```yaml
- name: Build application
  run: npm run build

- name: Start server
  run: npm run start &

- name: Run Lighthouse CI
  run: lhci autorun
```

---

## Performance Budgets

### Defined Budgets

| Metric | Budget | Warning | Fail |
|--------|--------|---------|------|
| Total JavaScript | 300KB | >270KB (90%) | >330KB (110%) |
| First Load JS | 200KB | >180KB | >220KB |
| Total CSS | 50KB | >45KB | >55KB |
| LCP | 2.5s | >2.25s | >2.75s |
| FID | 100ms | >90ms | >110ms |
| CLS | 0.1 | >0.09 | >0.11 |
| TTI | 3.8s | >3.4s | >4.2s |

### Checking Budgets

**After build:**

```bash
npm run build
node scripts/performance-check.js
```

### Enforcing Budgets

**In CI/CD:**

```bash
# Fail build if budgets exceeded
npm run build && node scripts/performance-check.js || exit 1
```

---

## Best Practices

### 1. Font Loading

**Use font-display: swap:**

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true,
});
```

### 2. Critical CSS

**Inline critical styles:**

```tsx
// app/layout.tsx
<head>
  <style dangerouslySetInnerHTML={{
    __html: `
      .critical-element {
        /* Above-the-fold styles */
      }
    `
  }} />
</head>
```

### 3. Resource Hints

**Preload critical resources:**

```tsx
<head>
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
</head>
```

### 4. Avoid Layout Shifts

**Reserve space for dynamic content:**

```tsx
// ❌ BAD: No height specified
<div>
  {loading ? <Spinner /> : <Content />}
</div>

// ✅ GOOD: Fixed height prevents shift
<div style={{ minHeight: '400px' }}>
  {loading ? <Spinner /> : <Content />}
</div>
```

### 5. Optimize Third-Party Scripts

**Load asynchronously:**

```tsx
<Script
  src="https://example.com/analytics.js"
  strategy="lazyOnload"
/>
```

### 6. Database Query Optimization

**Add indexes:**

```prisma
model Campaign {
  id String @id
  name String
  status String
  createdAt DateTime

  @@index([status, createdAt])
}
```

**Use select to limit fields:**

```typescript
const campaigns = await prisma.campaign.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    // Only fields needed
  },
});
```

### 7. API Response Caching

**Use React Query for client-side caching:**

```typescript
const { data } = useQuery({
  queryKey: ['campaigns'],
  queryFn: fetchCampaigns,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
});
```

---

## Performance Checklist

### Before Deployment

- [ ] Run `npm run build` successfully
- [ ] Check bundle sizes with `node scripts/performance-check.js`
- [ ] Run Lighthouse CI on all major pages
- [ ] Verify Core Web Vitals in production
- [ ] Test on slow 3G network
- [ ] Test with React DevTools Profiler
- [ ] Check memory leaks with Chrome DevTools
- [ ] Validate image optimization
- [ ] Ensure proper caching headers
- [ ] Test with disabled JavaScript
- [ ] Verify accessibility (a11y)
- [ ] Check mobile performance

### Continuous Monitoring

- [ ] Set up performance monitoring dashboard
- [ ] Configure alerts for performance regressions
- [ ] Track Core Web Vitals in production
- [ ] Monitor bundle size trends
- [ ] Review Lighthouse CI reports
- [ ] Analyze real user metrics (RUM)

---

## Troubleshooting

### High LCP

**Causes:**
- Large images without `priority` prop
- Slow server response (TTFB)
- Render-blocking resources

**Solutions:**
- Add `priority` to hero images
- Optimize server/API response time
- Use `preload` for critical resources
- Implement CDN for static assets

### High CLS

**Causes:**
- Images without dimensions
- Dynamic content injection
- Web fonts causing layout shift

**Solutions:**
- Always specify `width` and `height` for images
- Reserve space for dynamic content
- Use `font-display: swap` for web fonts

### Large Bundle Size

**Causes:**
- Importing entire libraries
- No code splitting
- Unused dependencies

**Solutions:**
- Use tree-shaking (import specific functions)
- Implement dynamic imports
- Remove unused packages
- Analyze bundle with webpack-bundle-analyzer

---

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [React Performance](https://react.dev/reference/react/memo)
- [D3.js Performance](https://observablehq.com/@d3/learn-d3)

---

## Support

For performance-related issues:

1. Check this guide first
2. Run performance check script
3. Review Lighthouse report
4. Check browser console for errors
5. Profile with React DevTools

---

**Last Updated**: 2025-10-16
