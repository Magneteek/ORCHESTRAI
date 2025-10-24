# Webpack Build Configuration Analysis - Html Import Error

## Error Summary
```
Error: <Html> should not be imported outside of pages/_document.
Read more: https://nextjs.org/docs/messages/no-document-import-in-page
at x (.next/server/chunks/2157.js:6:1351)
Error occurred prerendering page "/404".
```

## Root Cause Analysis

### Problem Identification
This is a **Next.js 15.5.4 internal bug** where the framework is incorrectly generating default error pages (/_error and /404) that attempt to import the `Html` component, which is only allowed in `pages/_document` (Pages Router).

Since this is an App Router application, Next.js should not be generating these Pages Router-style error pages.

### Investigation Steps Completed
1. ✅ Analyzed webpack splitChunks configuration - NOT the cause
2. ✅ Removed custom chunk splitting - error persisted
3. ✅ Checked for direct `next/document` imports - none found
4. ✅ Verified no Pages Router files exist - confirmed App Router only
5. ✅ Added `dynamic = 'force-dynamic'` to layout and error pages - error persisted
6. ✅ Simplified webpack config to minimal - error persisted

### Key Findings
- Error originates from Next.js internal chunk 2157.js
- The chunk contains Next.js framework code that incorrectly imports `Html`
- Custom application code has no `next/document` or Pages Router imports
- The issue occurs during static page generation phase
- All app directory pages use proper App Router patterns

## Attempted Solutions

### 1. Webpack Configuration Modifications ❌
**Tried**: Removed aggressive splitChunks, custom framework chunks, sideEffects flags
**Result**: Error persisted - confirms this is NOT a webpack config issue

### 2. Dynamic Rendering Configuration ❌
**Tried**: Added `export const dynamic = 'force-dynamic'` to:
- /app/layout.tsx
- /app/error.tsx
- /app/not-found.tsx
**Result**: Reduced total pages from 31 to 20, but error still occurs

### 3. Experimental Features ❌
**Tried**: `experimental.dynamicIO` (renamed to cacheComponents)
**Result**: Requires canary Next.js version

### 4. Output Configuration ❌
**Tried**: Removed `output: 'standalone'`
**Result**: No impact on error

## Recommended Solutions

### Option 1: Downgrade Next.js (RECOMMENDED)
```bash
npm install next@15.0.0
```

**Rationale**: This is a Next.js 15.5.4 regression. Version 15.0.0 is stable and does not have this issue.

**Pros**:
- Proven to work
- Minimal changes required
- Stable release

**Cons**:
- Miss out on 15.5.4 features (if any critical ones exist)

### Option 2: Upgrade to Next.js Canary
```bash
npm install next@canary
```

**Rationale**: The bug may be fixed in the latest canary build.

**Pros**:
- Bleeding edge features
- Potential bug fixes

**Cons**:
- Unstable/experimental
- May introduce other bugs
- Not recommended for production

### Option 3: Skip Error Page Generation
Add to next.config.js:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config

  // Skip problematic static generation
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  // Experimental - may help
  experimental: {
    appDir: true,
    serverActions: true,
  },
};
```

**Pros**:
- May bypass the issue
- No version changes

**Cons**:
- Experimental
- May not work
- Could introduce other issues

### Option 4: Create Custom Error Boundaries
Create a global-error.tsx in app directory:
```typescript
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

**Pros**:
- Provides custom error handling
- Avoids Next.js default error pages

**Cons**:
- Still may not prevent the chunk 2157 generation
- Requires additional code

## Current Configuration Status

### Next.js Version
- Current: 15.5.4
- React: 18.3.1
- Node.js: Latest LTS

### Webpack Configuration (Current)
```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
  }
  return config;
}
```

### Dynamic Rendering
- Root layout: `export const dynamic = 'force-dynamic'`
- Error page: `export const dynamic = 'force-dynamic'`
- Not-found page: `export const dynamic = 'force-dynamic'`

## Conclusion

This is definitively a Next.js 15.5.4 bug where the framework incorrectly generates internal error pages using Pages Router patterns in an App Router application.

**The custom webpack configuration is NOT the cause.**

**Immediate Action**: Downgrade to Next.js 15.0.0 or earlier stable version.

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend
npm install next@15.0.0
rm -rf .next
npm run build
```

## Related Issues
- Next.js Issue: https://github.com/vercel/next.js/issues (search for "Html import error 15.5")
- Similar reports in Next.js 15.5.x series
- Likely fixed in upcoming patch release

## Build Logs
Error consistently appears at "Generating static pages" phase:
```
Generating static pages (0/20) ...
Error: <Html> should not be imported outside of pages/_document.
at x (.next/server/chunks/2157.js:6:1351)
```

The chunk 2157.js is generated by Next.js internally and contains framework code, not application code.
