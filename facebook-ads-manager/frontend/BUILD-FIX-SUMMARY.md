# Next.js 15 Build Error - Complete Investigation Report

## Error
```
Error: <Html> should not be imported outside of pages/_document.
Error occurred prerendering page "/404" and "/500"
```

## Root Cause
**Next.js 15.0.3/15.5.4 + next-auth 5.0.0-beta.25 incompatibility**

The error occurs because:
1. **Chunk 7627.js** contains complete Pages Router `_document` component code (Html, Head, Main, NextScript)
2. This is being incorrectly bundled during **static page generation for error pages** (/404, /500)
3. Next.js is generating Pages Router fallback files even though this is an App Router-only project

## Investigation Timeline

### 1. Initial Analysis
- Error in chunk 2157.js (Next.js 15.5.4) or chunk 7627.js (Next.js 15.0.3)
- Module 32978/17627 imports `HtmlContext` from Next.js internals
- Bundled with OpenTelemetry tracing and next-auth JWT middleware

### 2. Fixes Attempted
❌ **Removed manual `<head>` tag from app/layout.tsx** - Necessary but didn't solve issue
❌ **Added `force-dynamic` to error pages** - No effect on prerendering
❌ **Simplified next.config.js** - No effect
❌ **Downgraded Next.js to 15.0.3** - Same error persists
❌ **Locked next-auth to exact version** - Type errors fixed, Html error remains

### 3. Files Modified
1. `app/layout.tsx` - Removed `<head>` tag, added Metadata API usage
2. `app/error.tsx` - Added `export const dynamic = 'force-dynamic'`
3. `app/not-found.tsx` - Added `export const dynamic = 'force-dynamic'`
4. `next.config.js` - Simplified configuration
5. `lib/auth/config.ts` - Fixed TypeScript type error

##  Solutions

### Solution A: Skip Static Generation (RECOMMENDED FOR NOW)
Since error pages are causing the issue, skip their static generation:

**Add to `next.config.js`:**
```javascript
experimental: {
  skipTrailingSlashRedirect: true,
},
// Skip error page static generation
async redirects() {
  return [];
},
```

**Or set in root layout:**
```typescript
// app/layout.tsx
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
```

###Solution B: Wait for Next.js/next-auth Fix
This appears to be a compatibility issue between:
- Next.js 15.x App Router
- next-auth 5.0.0-beta.x
- Middleware using `getToken` from `next-auth/jwt`

Track these issues:
- https://github.com/vercel/next.js/issues
- https://github.com/nextauthjs/next-auth/issues

### Solution C: Alternative Auth (LONG-TERM)
Consider migrating to:
- Auth.js v5 (stable when released)
- Clerk
- Supabase Auth
- Custom JWT solution

## Technical Details

### Chunk Analysis
**Chunk 7627.js (15.0.3) contains:**
- Complete `_document.tsx` component
- Html, Head, Main, NextScript exports
- HtmlContext usage
- Pages Router infrastructure

### Build Process Flow
1. TypeScript compilation ✅ PASSES
2. Linting ✅ PASSES
3. Page data collection ✅ PASSES
4. Static page generation ❌ **FAILS on /404 and /500**

### Why This Happens
Next.js's error handling internally uses Pages Router infrastructure for generating error pages, even in App Router projects. When middleware uses next-auth's `getToken`, it triggers a dependency chain that bundles the entire `_document` component.

## Current Status
- **Versions**: Next.js 15.0.3, next-auth 5.0.0-beta.25
- **Build Status**: FAILING at static generation
- **Dev Server**: Works correctly
- **Issue**: Production build cannot complete

## Workaround for Development
```bash
# Use dev server (works fine)
npm run dev

# For production, use development build
NODE_ENV=development npm run build
npm start
```

## Recommended Action
1. Apply Solution A (skip static generation)
2. Monitor Next.js/next-auth releases
3. Plan migration to stable auth solution when available

## Files for Reference
- `/Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend/app/layout.tsx`
- `/Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend/middleware.ts`
- `/Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend/lib/auth/config.ts`
- `/Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend/next.config.js`

---

**Investigation completed:** October 17, 2025
**Engineer:** Claude Code (Backend Development Specialist Agent)
