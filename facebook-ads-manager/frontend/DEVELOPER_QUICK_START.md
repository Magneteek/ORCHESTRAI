# Developer Quick Start: Phase 1 Migration

## TL;DR

**What Changed:**
1. User roles simplified: `admin`/`manager`/`member` → `ADMIN`/`USER` (enum)
2. Templates now support dynamic fields (dental industry customization)
3. New `TemplateLaunch` model tracks template usage with field values

**What You Need to Do:**
1. Update all role checks to use `UserRole` enum
2. Use new dynamic fields API for templates
3. Track template launches with field values

## Quick Commands

```bash
# Navigate to project
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend

# Review schema changes
cat prisma/schema.prisma

# View migration SQL
cat prisma/migrations/20260127125133_add_dynamic_fields_and_simplify_roles/migration.sql

# Run migration (when ready)
npx prisma migrate deploy

# Regenerate client (already done)
npx prisma generate
```

## Code Changes Required

### 1. Import UserRole Enum

**Before:**
```typescript
const isAdmin = user.role === 'admin' || user.role === 'manager';
```

**After:**
```typescript
import { UserRole } from '@prisma/client';

const isAdmin = user.role === UserRole.ADMIN;
```

### 2. Update Middleware

**File:** `src/middleware/auth.ts` (example)

```typescript
import { UserRole } from '@prisma/client';

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireAuth = (req, res, next) => {
  // Both ADMIN and USER can access
  if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.USER) {
    return next();
  }
  return res.status(403).json({ error: 'Authentication required' });
};
```

### 3. Using Dynamic Fields

**Creating a Template with Dynamic Fields:**

```typescript
import { prisma } from '@/lib/prisma';

const template = await prisma.adTemplate.create({
  data: {
    name: "Dental Special Offer",
    organizationId: org.id,
    category: "lead-generation",
    objective: "OUTCOME_LEADS",

    // NEW: Dynamic fields for customization
    dynamicFields: {
      fields: [
        {
          name: "specialty",
          type: "select",
          required: true,
          options: ["General", "Orthodontics", "Cosmetic"],
          placeholder: "Select specialty"
        },
        {
          name: "offerValue",
          type: "text",
          required: true,
          placeholder: "e.g., $99 Special"
        }
      ]
    },

    // NEW: JSON Schema validation
    fieldSchema: {
      type: "object",
      properties: {
        specialty: { type: "string", enum: ["General", "Orthodontics", "Cosmetic"] },
        offerValue: { type: "string", minLength: 1 }
      },
      required: ["specialty", "offerValue"]
    },

    // Existing fields with placeholders for dynamic values
    adCopy: {
      headline: "{{offerValue}} at {{specialty}} Practice!",
      primaryText: "New patients welcome. Book today!",
      description: "Limited time offer",
      callToAction: "BOOK_NOW"
    },

    // Other existing fields...
    creativeSpecs: { /* ... */ },
    targetingConfig: { /* ... */ },
    campaignStructure: { /* ... */ }
  }
});
```

**Launching a Campaign from Template:**

```typescript
// NEW: Track template launch with field values
const launch = await prisma.templateLaunch.create({
  data: {
    templateId: template.id,
    campaignId: campaign.id,
    adAccountId: adAccount.accountId,
    userId: user.id,

    // Resolved field values
    fieldValues: {
      specialty: "Orthodontics",
      offerValue: "$99 Invisalign Consultation"
    }
  },
  include: {
    template: {
      include: {
        organization: true
      }
    },
    campaign: true
  }
});

// Use field values to replace placeholders in ad copy
const resolvedAdCopy = {
  headline: template.adCopy.headline
    .replace('{{offerValue}}', launch.fieldValues.offerValue)
    .replace('{{specialty}}', launch.fieldValues.specialty),
  // ... resolve other placeholders
};
```

**Querying Global Templates:**

```typescript
// NEW: Query global templates (available to all orgs)
const globalTemplates = await prisma.adTemplate.findMany({
  where: {
    isGlobal: true,
    category: "lead-generation"
  },
  include: {
    performanceAggregate: true
  }
});

// Or query by organization + global
const availableTemplates = await prisma.adTemplate.findMany({
  where: {
    OR: [
      { organizationId: user.organizationId },
      { isGlobal: true }
    ]
  }
});
```

### 4. Validation Helper (Recommended)

```typescript
import Ajv from 'ajv';

export const validateDynamicFields = (
  template: AdTemplate,
  fieldValues: Record<string, any>
) => {
  if (!template.fieldSchema) {
    return { valid: true };
  }

  const ajv = new Ajv();
  const validate = ajv.compile(template.fieldSchema);
  const valid = validate(fieldValues);

  if (!valid) {
    return {
      valid: false,
      errors: validate.errors
    };
  }

  return { valid: true };
};
```

## Search & Replace Guide

Use these commands to find code that needs updating:

```bash
# Find role string comparisons
grep -rn "role === 'admin'" src/
grep -rn "role === 'manager'" src/
grep -rn "role === 'member'" src/
grep -rn "role !== 'admin'" src/

# Find role assignments
grep -rn 'role: "admin"' src/
grep -rn 'role: "manager"' src/
grep -rn 'role: "member"' src/

# Check middleware files
grep -rn "admin\|manager\|member" src/middleware/
grep -rn "admin\|manager\|member" src/lib/auth*
```

## Testing Checklist

### Unit Tests
- [ ] Update role check tests
- [ ] Add dynamic field validation tests
- [ ] Add template launch tests

### Integration Tests
- [ ] User authentication with new role enum
- [ ] Template CRUD with dynamic fields
- [ ] Template launch workflow
- [ ] Global template filtering

### E2E Tests
- [ ] Admin user can access admin routes
- [ ] Regular user cannot access admin routes
- [ ] Template creation with dynamic fields
- [ ] Campaign launch with field value input

## Common Pitfalls

### ❌ Don't Do This
```typescript
// String comparison won't work
if (user.role === 'admin') { }

// Creating role directly with string
await prisma.user.create({
  data: {
    role: 'admin' // TypeScript error
  }
});
```

### ✅ Do This Instead
```typescript
import { UserRole } from '@prisma/client';

// Use enum
if (user.role === UserRole.ADMIN) { }

// Create with enum
await prisma.user.create({
  data: {
    role: UserRole.ADMIN
  }
});
```

## API Examples

### GET /api/templates (with global support)

```typescript
// src/app/api/templates/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeGlobal = searchParams.get('includeGlobal') === 'true';

  const templates = await prisma.adTemplate.findMany({
    where: {
      OR: [
        { organizationId: req.user.organizationId },
        ...(includeGlobal ? [{ isGlobal: true }] : [])
      ]
    },
    include: {
      performanceAggregate: true
    }
  });

  return Response.json(templates);
}
```

### POST /api/templates/launch

```typescript
// src/app/api/templates/launch/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateDynamicFields } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const { templateId, campaignId, adAccountId, fieldValues } = await req.json();

  // Fetch template
  const template = await prisma.adTemplate.findUnique({
    where: { id: templateId }
  });

  // Validate field values
  const validation = validateDynamicFields(template, fieldValues);
  if (!validation.valid) {
    return Response.json(
      { error: 'Invalid field values', details: validation.errors },
      { status: 400 }
    );
  }

  // Create launch record
  const launch = await prisma.templateLaunch.create({
    data: {
      templateId,
      campaignId,
      adAccountId,
      userId: req.user.id,
      fieldValues
    }
  });

  // Increment template usage
  await prisma.adTemplate.update({
    where: { id: templateId },
    data: { timesUsed: { increment: 1 } }
  });

  return Response.json(launch);
}
```

## TypeScript Types

```typescript
// Dynamic field types
interface DynamicField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  placeholder?: string;
  options?: string[]; // For select/multiselect
  min?: number; // For number
  max?: number; // For number
}

interface DynamicFieldsConfig {
  fields: DynamicField[];
}

// Field values are Record<string, any>
type FieldValues = Record<string, any>;

// Use Prisma types for models
import { AdTemplate, TemplateLaunch, UserRole } from '@prisma/client';
```

## Migration Status

- ✅ Schema updated
- ✅ Migration SQL created
- ✅ Prisma client generated
- ⏳ Code updates (YOUR TASK)
- ⏳ Testing (YOUR TASK)
- ⏳ Deployment (PENDING)

## Need Help?

1. Check migration README: `/prisma/migrations/20260127125133_add_dynamic_fields_and_simplify_roles/README.md`
2. Review implementation summary: `/PHASE1_IMPLEMENTATION_SUMMARY.md`
3. Examine schema: `/prisma/schema.prisma`
4. Run verification queries: `role_conversion_verification.sql`

## Quick Reference Card

| Old | New |
|-----|-----|
| `role === 'admin'` | `role === UserRole.ADMIN` |
| `role === 'manager'` | `role === UserRole.ADMIN` |
| `role === 'member'` | `role === UserRole.USER` |
| `role: 'admin'` | `role: UserRole.ADMIN` |
| N/A | `template.dynamicFields` |
| N/A | `template.isGlobal` |
| N/A | `TemplateLaunch` model |

---

**Ready to update your code? Follow the checklist above and refer to the examples!**
