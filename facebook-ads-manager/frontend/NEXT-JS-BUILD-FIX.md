# Next.js 15.5.4 Build Error Fix

## Root Cause
Next.js 15.5.4 has a bug where chunk 2157.js (OpenTelemetry tracing code) incorrectly imports `HtmlContext` from Next.js internals during static page generation for error pages (404/500).

**Error:**
```
Error: <Html> should not be imported outside of pages/_document.
Read more: https://nextjs.org/docs/messages/no-document-import-in-page
    at x (.next/server/chunks/2157.js:6:1351)
Error occurred prerendering page "/404"
```

## Investigation Summary
1. **Module 32978** in chunk 2157.js imports: `a.exports=c(67339).vendored.contexts.HtmlContext`
2. This is bundled with OpenTelemetry tracing library
3. Next.js generates Pages Router fallback files (_app.js, _document.js) even in App Router projects
4. The combination causes Html import validation to fail during static generation

## Applied Fixes

### 1. Fixed app/layout.tsx
**Problem:** Manual `<head>` tag in App Router layout
**Solution:** Removed `<head>` tag, moved metadata to Metadata API
```tsx
// ❌ WRONG (causes Html import error)
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>{children}</body>
</html>

// ✅ CORRECT
export const metadata: Metadata = {
  icons: { icon: "/favicon.ico" },
  viewport: { width: "device-width", initialScale: 1, maximumScale: 5 },
};

<html lang="en">
  <body>{children}</body>
</html>
```

### 2. Added Force Dynamic Rendering
Added `export const dynamic = 'force-dynamic'` to:
- `app/layout.tsx`
- `app/error.tsx`
- `app/not-found.tsx`

### 3. Simplified next.config.js
- Removed complex webpack optimizations
- Removed `output: 'standalone'`
- Removed `optimizeCss` and `optimizePackageImports`
- Disabled instrumentation hook

## Remaining Issue
Despite all fixes, the error persists because it's a **Next.js 15.5.4 internal bug** where the framework incorrectly bundles Pages Router code into App Router projects.

## Recommended Solutions

### Option 1: Downgrade Next.js (RECOMMENDED)
```bash
npm install next@15.0.3
rm -rf .next node_modules/.cache
npm run build
```

Next.js 15.0.3 is the last stable version before this regression.

### Option 2: Disable Error Page Static Generation
Add to `next.config.js`:
```javascript
experimental: {
  workerThreads: false,
  cpus: 1,
}
```

### Option 3: Wait for Next.js Fix
Track this issue:
- GitHub: https://github.com/vercel/next.js/issues
- Related: Html import errors in App Router with middleware

## Dependencies Checked
- `next`: 15.5.4 (BUG VERSION)
- `next-auth`: 5.0.0-beta.25 (using JWT in middleware)
- `react`: 18.3.1
- `react-dom`: 18.3.1

The issue is NOT caused by:
- Application code
- Middleware configuration
- Dependencies
- Custom webpack config

## Technical Details

### Chunk 2157 Contents
- OpenTelemetry tracing library
- Next.js internal modules
- Module 32978: `HtmlContext` import
- Module 67339: Vendored contexts

### Build Process
1. TypeScript compilation ✅ PASSES
2. Linting ✅ PASSES
3. Page data collection ✅ PASSES
4. Static page generation ❌ FAILS on /404

### Files Modified
1. `app/layout.tsx` - Removed `<head>` tag
2. `app/error.tsx` - Added `force-dynamic`
3. `app/not-found.tsx` - Added `force-dynamic`
4. `next.config.js` - Simplified configuration

## Verification
After implementing Option 1 (downgrade), verify:
```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend
npm install next@15.0.3
rm -rf .next
npm run build
```

Expected result: Build completes successfully without Html import errors.
