# Role-Based Access Control (RBAC) System

## Overview

The Facebook Ads Manager implements a comprehensive Role-Based Access Control (RBAC) system to manage permissions across all features. This document provides a complete reference for the permission system.

## Roles

The system supports two primary roles defined in the Prisma schema:

### ADMIN
- Full access to all features
- Can manage organization settings
- Can invite and manage users
- Can create, edit, and delete global templates
- Can delete campaigns
- Can export analytics data
- Can view cross-account analytics

### USER
- Standard access for team members
- Can create and manage private templates
- Can create, pause, and resume campaigns (cannot delete)
- Can view analytics for their organization
- Cannot access admin-only features

## Permission Structure

Permissions are organized into functional domains:

### Template Management

| Permission | ADMIN | USER | Description |
|-----------|-------|------|-------------|
| `canCreateGlobalTemplate` | ✅ | ❌ | Create templates available to all organizations |
| `canCreatePrivateTemplate` | ✅ | ✅ | Create organization-specific templates |
| `canEditGlobalTemplate` | ✅ | ❌ | Edit global templates |
| `canEditTemplate` | ✅ | ⚠️ | Edit templates (users can edit their own private templates) |
| `canDeleteTemplate` | ✅ | ⚠️ | Delete templates (users can delete their own private templates) |
| `canViewTemplates` | ✅ | ✅ | View templates |
| `canForkTemplate` | ✅ | ✅ | Clone/fork existing templates |

### Campaign Management

| Permission | ADMIN | USER | Description |
|-----------|-------|------|-------------|
| `canCreateCampaign` | ✅ | ✅ | Create new campaigns |
| `canEditCampaignBudget` | ✅ | ✅ | Modify campaign budgets |
| `canPauseCampaign` | ✅ | ✅ | Pause active campaigns |
| `canResumeCampaign` | ✅ | ✅ | Resume paused campaigns |
| `canDeleteCampaign` | ✅ | ❌ | Permanently delete campaigns |
| `canDuplicateCampaign` | ✅ | ✅ | Duplicate existing campaigns |

### Analytics & Reporting

| Permission | ADMIN | USER | Description |
|-----------|-------|------|-------------|
| `canViewAnalytics` | ✅ | ✅ | View basic analytics |
| `canViewCrossAccountAnalytics` | ✅ | ❌ | View analytics across multiple ad accounts |
| `canExportData` | ✅ | ❌ | Export data as CSV or PDF |
| `canViewAiInsights` | ✅ | ✅ | View AI-generated insights |

### User Management

| Permission | ADMIN | USER | Description |
|-----------|-------|------|-------------|
| `canInviteUsers` | ✅ | ❌ | Invite new users to organization |
| `canChangeUserRoles` | ✅ | ❌ | Change user roles (ADMIN/USER) |
| `canRemoveUsers` | ✅ | ❌ | Remove users from organization |
| `canViewUsers` | ✅ | ❌ | View organization user list |

### Facebook Account Management

| Permission | ADMIN | USER | Description |
|-----------|-------|------|-------------|
| `canConnectFacebookAccount` | ✅ | ✅ | Connect Facebook Business accounts |
| `canDisconnectFacebookAccount` | ✅ | ❌ | Disconnect Facebook accounts |
| `canViewAdAccountSettings` | ✅ | ✅ | View ad account settings |

### Organization Management

| Permission | ADMIN | USER | Description |
|-----------|-------|------|-------------|
| `canUpdateOrganization` | ✅ | ❌ | Update organization settings |
| `canViewOrganizationSettings` | ✅ | ❌ | View organization settings |
| `canManageBilling` | ✅ | ❌ | Manage billing and subscription |

## Implementation

### File Structure

```
lib/auth/
├── permissions.ts          # Permission definitions
├── api-protection.ts       # API route middleware
├── types.ts               # TypeScript type definitions
├── config.ts              # NextAuth configuration
└── session.ts             # Session utilities (legacy)
```

### Using Permissions in API Routes

#### Basic Authentication

```typescript
import { requireAuth } from '@/lib/auth/api-protection';

export async function GET(request: Request) {
  const session = await requireAuth(request);
  // User is authenticated
  return Response.json({ userId: session.user.id });
}
```

#### Admin-Only Routes

```typescript
import { requireAdmin } from '@/lib/auth/api-protection';

export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  // User is admin
  await deleteResource();
  return Response.json({ success: true });
}
```

#### Specific Permission Checks

```typescript
import { requireAuth } from '@/lib/auth/api-protection';
import { hasPermission, UserRole } from '@/lib/auth/permissions';
import { ForbiddenError } from '@/lib/utils/errors';

export async function POST(request: Request) {
  const session = await requireAuth(request);
  const userRole = session.user.role as UserRole;

  if (!hasPermission(userRole, 'canCreateGlobalTemplate')) {
    throw new ForbiddenError('Only admins can create global templates');
  }

  // Proceed with creation
}
```

#### Resource-Specific Permissions

```typescript
import { requireAuth } from '@/lib/auth/api-protection';
import { hasPermission, UserRole } from '@/lib/auth/permissions';
import { ForbiddenError } from '@/lib/utils/errors';

export async function DELETE(request: Request, { params }) {
  const session = await requireAuth(request);
  const userRole = session.user.role as UserRole;

  // Fetch the resource
  const template = await getTemplateById(params.id);

  // Check permission with resource context
  if (!hasPermission(userRole, 'canDeleteTemplate', template)) {
    throw new ForbiddenError('You cannot delete this template');
  }

  await deleteTemplate(params.id);
}
```

### Helper Functions

#### `hasPermission()`

Type-safe permission checker:

```typescript
import { hasPermission, UserRole } from '@/lib/auth/permissions';

const canDelete = hasPermission(
  user.role as UserRole,
  'canDeleteTemplate',
  template
);
```

#### `requireAuth()`

Require authentication (401 if not authenticated):

```typescript
const session = await requireAuth(request);
```

#### `requireAdmin()`

Require admin role (403 if not admin):

```typescript
const session = await requireAdmin(request);
```

#### `requireOrganizationMember()`

Verify organization membership:

```typescript
const session = await requireOrganizationMember(request, organizationId);
```

#### `requireAllPermissions()`

Require multiple permissions (AND logic):

```typescript
const session = await requireAllPermissions(request, [
  'canCreateCampaign',
  'canEditCampaignBudget'
]);
```

#### `requireAnyPermission()`

Require at least one permission (OR logic):

```typescript
const session = await requireAnyPermission(request, [
  'canViewAnalytics',
  'canViewCrossAccountAnalytics'
]);
```

## API Routes Updated

The following API routes have been updated with RBAC:

### Templates
- `GET /api/templates` - View templates (all users)
- `POST /api/templates` - Create templates (checks global vs private)
- `GET /api/templates/[id]` - View template (all users)
- `PATCH /api/templates/[id]` - Edit template (ownership + global check)
- `DELETE /api/templates/[id]` - Delete template (ownership + global check)

### Campaigns
- `GET /api/campaigns/[id]` - View campaign (all users)
- `PATCH /api/campaigns/[id]` - Update campaign (all users)
- `DELETE /api/campaigns/[id]` - Delete campaign (admin only)

### Analytics
- `GET /api/analytics/export` - Export data (admin only)

### Organizations
- `GET /api/organizations/[id]` - View organization (all users)
- `PATCH /api/organizations/[id]` - Update organization (admin only)
- `DELETE /api/organizations/[id]` - Delete organization (admin only)

## Error Handling

### Standard Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "You must be signed in to access this resource",
    "code": "UNAUTHORIZED"
  }
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "You do not have permission to perform this action",
    "code": "FORBIDDEN"
  }
}
```

## TypeScript Types

### Session Type

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    organizationId: string;
    image?: string | null;
  };
}
```

### UserRole Enum

```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}
```

## Testing Permissions

### Example Test Cases

```typescript
describe('Template Permissions', () => {
  it('admin can create global template', async () => {
    const session = { user: { role: UserRole.ADMIN } };
    expect(hasPermission(session.user.role, 'canCreateGlobalTemplate')).toBe(true);
  });

  it('user cannot create global template', async () => {
    const session = { user: { role: UserRole.USER } };
    expect(hasPermission(session.user.role, 'canCreateGlobalTemplate')).toBe(false);
  });

  it('user can delete own private template', async () => {
    const template = { isGlobal: false, isPublic: false };
    expect(hasPermission(UserRole.USER, 'canDeleteTemplate', template)).toBe(true);
  });
});
```

## Migration Notes

### Changes from Legacy System

1. **Removed Role**: The `manager` role has been simplified into the `USER` role
2. **Simplified Permissions**: Consolidated `canManageTemplates` into more granular permissions
3. **New API Protection**: Replaced `requirePermission` from session.ts with more flexible API protection utilities
4. **Type Safety**: Added proper TypeScript types for all permission checks

### Breaking Changes

- `requirePermission('canManageTemplates')` → Use specific permission checks
- `requireRole('manager')` → No longer supported (use ADMIN or USER)
- Session utilities moved from `lib/auth/session.ts` to `lib/auth/api-protection.ts`

## Best Practices

1. **Always use type-safe permission checks**: Import `UserRole` from Prisma client
2. **Check permissions early**: Validate permissions before expensive operations
3. **Provide clear error messages**: Include context about why permission was denied
4. **Use resource-specific checks**: Pass resources to permission functions when needed
5. **Document permission requirements**: Add JSDoc comments to API routes

## Future Enhancements

Potential additions to the RBAC system:

- **Custom Roles**: Organization-specific role definitions
- **Permission Groups**: Reusable permission sets
- **Audit Logging**: Track permission checks and denials
- **Rate Limiting**: Per-role rate limits
- **Field-Level Permissions**: Control access to specific fields
- **Time-Based Permissions**: Temporary elevated access
