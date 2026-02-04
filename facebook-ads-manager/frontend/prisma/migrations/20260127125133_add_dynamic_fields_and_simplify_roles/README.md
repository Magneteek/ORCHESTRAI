# Migration: Add Dynamic Fields and Simplify Roles

**Migration ID:** `20260127125133_add_dynamic_fields_and_simplify_roles`
**Created:** 2026-01-27
**Phase:** Phase 1 of Facebook Ads Manager Enhancement Plan

## Overview

This migration implements Phase 1 of the Facebook Ads Manager enhancement plan with two major changes:

1. **Simplified Role System**: Convert from 3 roles (admin, manager, member) to 2 roles (ADMIN, USER)
2. **Dynamic Fields Support**: Add dynamic field capabilities to ad templates for industry-specific customization

## Changes

### 1. User Role System Simplification

**Before:**
- `role` field: String type with values ('admin', 'manager', 'member')
- Default: 'member'

**After:**
- `role` field: UserRole enum with values (ADMIN, USER)
- Default: USER
- Migration logic:
  - 'admin' → ADMIN
  - 'manager' → ADMIN
  - 'member' → USER

**Impact:** All existing users will be automatically converted to the new role system.

### 2. AdTemplate Dynamic Fields

**New Fields Added:**
- `dynamicFields` (Json, optional): Schema for dynamic fields
  - Structure: `{ fields: [{ name, type, required, defaultValue, placeholder }] }`
- `fieldSchema` (Json, optional): JSON Schema for validation
- `isGlobal` (Boolean, default: false): Template available to all organizations
- `requiresApproval` (Boolean, default: false): Future feature flag

**New Index:**
- `ad_templates_isGlobal_idx` on `isGlobal` field for filtering global templates

### 3. TemplateLaunch Model

**New Table:** `template_launches`

Tracks each instance of launching a campaign from a template with resolved dynamic field values.

**Fields:**
- `id` (UUID, primary key)
- `templateId` (UUID, foreign key → ad_templates)
- `campaignId` (UUID, foreign key → campaigns)
- `adAccountId` (String)
- `userId` (String)
- `fieldValues` (Json): Resolved dynamic field values
- `createdAt` (Timestamp)

**Indexes:**
- `template_launches_templateId_idx`
- `template_launches_campaignId_idx`
- `template_launches_userId_idx`

**Relations:**
- `AdTemplate.templateLaunches` (one-to-many)
- `Campaign.templateLaunches` (one-to-many)

## Pre-Migration Checklist

- [ ] **Backup database** before running migration
- [ ] Review current role distribution using `role_conversion_verification.sql`
- [ ] Verify no custom roles exist beyond (admin, manager, member)
- [ ] Confirm all users have valid role values
- [ ] Test migration on staging environment first

## Running the Migration

### Option 1: Automatic (Recommended for Development)

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend
npx prisma migrate deploy
```

### Option 2: Manual (Recommended for Production)

```bash
# Connect to your production database
psql $DATABASE_URL

# Run the migration SQL
\i prisma/migrations/20260127125133_add_dynamic_fields_and_simplify_roles/migration.sql

# Verify the changes
\i prisma/migrations/20260127125133_add_dynamic_fields_and_simplify_roles/role_conversion_verification.sql
```

## Post-Migration Verification

### 1. Verify Role Conversion

Run the post-migration query in `role_conversion_verification.sql`:

```sql
SELECT role, COUNT(*) as user_count
FROM users
GROUP BY role;
```

Expected output:
- Only `ADMIN` and `USER` roles exist
- No orphaned or invalid roles

### 2. Verify Schema Changes

```sql
-- Check new columns in ad_templates
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ad_templates'
  AND column_name IN ('dynamicFields', 'fieldSchema', 'isGlobal', 'requiresApproval');

-- Check template_launches table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'template_launches';
```

### 3. Test Application

- [ ] User authentication works with new role system
- [ ] Role-based access control functions correctly
- [ ] ADMIN users have appropriate permissions
- [ ] USER users have appropriate permissions
- [ ] AdTemplate CRUD operations work
- [ ] New dynamic fields are accessible

## Code Changes Required

### Update Role References

**Before:**
```typescript
if (user.role === 'admin' || user.role === 'manager') {
  // Admin operations
}
```

**After:**
```typescript
import { UserRole } from '@prisma/client';

if (user.role === UserRole.ADMIN) {
  // Admin operations
}
```

### Using Dynamic Fields

```typescript
// Example: Creating a template with dynamic fields
const template = await prisma.adTemplate.create({
  data: {
    name: "Dental Special Offer",
    organizationId: "...",
    // ... other required fields
    dynamicFields: {
      fields: [
        {
          name: "specialtyType",
          type: "select",
          required: true,
          options: ["General Dentistry", "Orthodontics", "Cosmetic"],
          placeholder: "Select specialty"
        },
        {
          name: "promotionEndDate",
          type: "date",
          required: true,
          placeholder: "When does the promotion end?"
        }
      ]
    },
    fieldSchema: {
      type: "object",
      properties: {
        specialtyType: { type: "string", enum: ["General Dentistry", "Orthodontics", "Cosmetic"] },
        promotionEndDate: { type: "string", format: "date" }
      },
      required: ["specialtyType", "promotionEndDate"]
    }
  }
});

// Example: Launching a template with field values
const launch = await prisma.templateLaunch.create({
  data: {
    templateId: template.id,
    campaignId: campaign.id,
    adAccountId: "act_123456",
    userId: user.id,
    fieldValues: {
      specialtyType: "Orthodontics",
      promotionEndDate: "2026-03-01"
    }
  }
});
```

## Rollback Procedure

If you need to rollback this migration, use the rollback script in `role_conversion_verification.sql`.

**Warning:** This will result in data loss for:
- TemplateLaunch records
- Dynamic field data in templates

**Rollback Steps:**
1. Backup current database state
2. Run the rollback SQL from `role_conversion_verification.sql`
3. Regenerate Prisma client: `npx prisma generate`
4. Revert code changes to use old role system

## Backward Compatibility

### Breaking Changes
- ✅ **User.role**: Changed from String to Enum (breaking)
  - All code checking `user.role === 'admin'` must be updated
  - TypeScript will catch these at compile time

### Non-Breaking Changes
- ✅ **AdTemplate**: All new fields are optional
- ✅ **TemplateLaunch**: New table, no existing dependencies

## Testing

### Unit Tests to Update
- [ ] User authentication tests (role checks)
- [ ] Authorization middleware tests
- [ ] Role-based permission tests

### Integration Tests to Add
- [ ] Dynamic field validation
- [ ] Template launch workflow
- [ ] Global template filtering
- [ ] Field value resolution

### E2E Tests to Add
- [ ] Template creation with dynamic fields
- [ ] Campaign launch from template
- [ ] Field value input and validation

## Performance Considerations

### Indexes Added
- `ad_templates_isGlobal_idx`: Improves global template queries
- `template_launches_templateId_idx`: Improves template usage analytics
- `template_launches_campaignId_idx`: Improves campaign history queries
- `template_launches_userId_idx`: Improves user activity tracking

### Query Impact
- ✅ Role checks: Slightly faster (enum vs string comparison)
- ✅ Global template filtering: Faster with new index
- ✅ Template launch history: Efficient with proper indexes

## Next Steps (Future Phases)

- **Phase 2**: Industry-specific template library (dental, orthodontics, etc.)
- **Phase 3**: Template approval workflow
- **Phase 4**: Template versioning and branching
- **Phase 5**: Template performance analytics by industry

## Support

For issues or questions about this migration, contact the development team or review:
- Prisma schema: `prisma/schema.prisma`
- Migration plan: [Enhancement Plan Document]
- API documentation: [API Docs]

---

**Migration Status:** ⚠️ Ready for Review - DO NOT DEPLOY WITHOUT APPROVAL
