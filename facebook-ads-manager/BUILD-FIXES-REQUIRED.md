# Facebook Ads Manager - Build Fixes Required

**Date**: October 16, 2025
**Status**: ⚠️ **BUILD ISSUES IDENTIFIED**

---

## ✅ Fixed Issues

### 1. Import Typo in Template Wizard ✅
**File**: `components/templates/use-template-wizard.tsx`
**Issue**: Typo in import path `@tantml:query/react-query`
**Fix**: Changed to `@tanstack/react-query`
**Status**: FIXED

### 2. Duplicate Variable Declaration ✅
**File**: `lib/facebook/campaigns/create.ts`
**Issue**: Variable `campaignData` declared twice in same scope
**Fix**: Renamed second declaration to `createdCampaign`
**Status**: FIXED

### 3. Next.js Config Warning ✅
**File**: `next.config.js`
**Issue**: `swcMinify` option deprecated in Next.js 15
**Fix**: Removed deprecated option (SWC is default)
**Status**: FIXED

---

## ⚠️ Remaining Build Warnings & Errors

### 1. Web Vitals API Change
**Files**: `lib/performance/web-vitals.ts`
**Issue**: `onFID` no longer exported from 'web-vitals' v4+
**Reason**: FID (First Input Delay) was replaced by INP (Interaction to Next Paint)
**Fix Required**:
```typescript
// Change:
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

// To:
import { getCLS, getFCP, getINP, getLCP, getTTFB } from 'web-vitals';

// And update usage:
getFID(handleMetric); // Remove
getINP(handleMetric); // Add
```

### 2. NextAuth v5 Import Changes
**Files**: Multiple API routes
**Issue**: `getServerSession` not exported from 'next-auth'
**Reason**: NextAuth v5 changed export location
**Fix Required**:
```typescript
// Change:
import { getServerSession } from 'next-auth';

// To:
import { auth } from '@/lib/auth/config';
// Or use the new pattern:
const session = await auth();
```

**Affected Files**:
- `app/api/ai/anomalies/route.ts`
- `app/api/ai/audience-insights/route.ts`
- `app/api/ai/optimize-copy/route.ts`
- `app/api/ai/predict/route.ts`
- `app/api/analytics/route.ts`
- `lib/auth/session.ts`

### 3. Facebook SDK Import Issue
**File**: `lib/facebook/client.ts`
**Issue**: No default export from 'facebook-nodejs-business-sdk'
**Fix Required**:
```typescript
// Change:
import bizSdk from 'facebook-nodejs-business-sdk';

// To:
import * as bizSdk from 'facebook-nodejs-business-sdk';
```

### 4. Route Parameter Type Error
**File**: `app/api/ad-accounts/[id]/route.ts`
**Issue**: Invalid type for route's second argument
**Fix Required**:
```typescript
// Change:
export async function GET(
  request: Request,
  { params }: RouteParams
) {

// To:
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
```

---

## 🔧 Quick Fix Commands

### Fix Web Vitals
```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend

# Update web-vitals import
sed -i '' 's/getFID/getINP/g' lib/performance/web-vitals.ts
sed -i '' 's/FID/INP/g' lib/performance/web-vitals.ts
```

### Fix NextAuth Imports
```bash
# Update getServerSession imports (manual review recommended)
find app/api -name "*.ts" -exec sed -i '' "s/import { getServerSession } from 'next-auth'/import { auth } from '@\/lib\/auth\/config'/g" {} \;
```

### Fix Facebook SDK Import
```bash
# Update Facebook SDK import
sed -i '' "s/import bizSdk from 'facebook-nodejs-business-sdk'/import * as bizSdk from 'facebook-nodejs-business-sdk'/g" lib/facebook/client.ts
```

---

## 📋 Manual Fixes Required

### 1. Update Web Vitals Implementation
**File**: `lib/performance/web-vitals.ts`

Change INP configuration (INP has different thresholds than FID):
```typescript
const thresholds: Record<string, [number, number]> = {
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  INP: [200, 500],  // Changed from FID: [100, 300]
  LCP: [2500, 4000],
  TTFB: [800, 1800],
};
```

### 2. Update NextAuth Session Retrieval
**Files**: All API routes using `getServerSession`

Update to NextAuth v5 pattern:
```typescript
// Old pattern:
const session = await getServerSession(authOptions);

// New pattern (Option 1 - using auth()):
import { auth } from '@/lib/auth/config';
const session = await auth();

// New pattern (Option 2 - using headers):
import { auth } from '@/auth';
const session = await auth();
```

### 3. Fix Route Parameter Types
**Files**: Dynamic route handlers

Update type definitions:
```typescript
type RouteContext = {
  params: { id: string };
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  const { params } = context;
  // ... rest of code
}
```

---

## ✅ Recommended Fix Order

1. **Fix Web Vitals** (5 minutes)
   - Update imports from getFID to getINP
   - Update thresholds
   - Test: Should eliminate web-vitals warnings

2. **Fix Facebook SDK** (2 minutes)
   - Change default import to namespace import
   - Test: Should eliminate SDK import warnings

3. **Fix NextAuth** (15 minutes)
   - Update all getServerSession imports
   - Test each API route
   - Verify authentication still works

4. **Fix Route Types** (10 minutes)
   - Update dynamic route parameter types
   - Test: TypeScript compilation should pass

5. **Run Full Build** (5 minutes)
   ```bash
   npm run type-check
   npm run build
   ```

---

## 🎯 Expected Results After Fixes

```bash
✅ No TypeScript errors
✅ No build warnings (or minimal)
✅ Production build succeeds
✅ Bundle size: ~285KB gzipped
✅ All routes compile successfully
```

---

## 📞 Current Status

**Build Compilation**: ⚠️ Compiles with warnings
**Type Checking**: ❌ Fails
**Production Ready**: ❌ Not yet

**After Fixes**: ✅ Production Ready

---

## 🚀 Alternative: Deploy with Warnings

If time is critical, the build can be deployed with warnings using:

```bash
# Skip type checking during build
npm run build --no-check

# Or modify package.json:
"build": "next build --no-lint"
```

⚠️ **Not recommended for production** - Fix issues properly first.

---

*Status: Fixes in progress*
*Estimated time to complete: 30-40 minutes*
