# RBAC Quick Reference Card

## Common Patterns

### 1. Basic Authentication

```typescript
import { requireAuth } from '@/lib/auth/api-protection';

export async function GET(request: Request) {
  const session = await requireAuth(request);
  const userId = session.user.id;
  const orgId = session.user.organizationId;
  // ... your logic
}
```

### 2. Admin-Only Routes

```typescript
import { requireAdmin } from '@/lib/auth/api-protection';

export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  // Only admins reach here
  await performAdminAction();
}
```

### 3. Check Single Permission

```typescript
import { requireAuth } from '@/lib/auth/api-protection';
import { hasPermission, UserRole } from '@/lib/auth/permissions';
import { ForbiddenError } from '@/lib/utils/errors';

export async function POST(request: Request) {
  const session = await requireAuth(request);
  const userRole = session.user.role as UserRole;

  if (!hasPermission(userRole, 'canExportData')) {
    throw new ForbiddenError('Only admins can export data');
  }

  await exportData();
}
```

### 4. Resource-Specific Permission

```typescript
import { requireAuth } from '@/lib/auth/api-protection';
import { hasPermission, UserRole } from '@/lib/auth/permissions';
import { ForbiddenError } from '@/lib/utils/errors';

export async function DELETE(request: Request, { params }) {
  const session = await requireAuth(request);
  const userRole = session.user.role as UserRole;

  // Fetch resource first
  const template = await getTemplateById(params.id);

  // Check permission with resource context
  if (!hasPermission(userRole, 'canDeleteTemplate', template)) {
    throw new ForbiddenError('Cannot delete this template');
  }

  await deleteTemplate(params.id);
}
```

### 5. Multiple Permissions (AND)

```typescript
import { requireAllPermissions } from '@/lib/auth/api-protection';

export async function POST(request: Request) {
  const session = await requireAllPermissions(request, [
    'canCreateCampaign',
    'canEditCampaignBudget'
  ]);
  // User has both permissions
}
```

### 6. Multiple Permissions (OR)

```typescript
import { requireAnyPermission } from '@/lib/auth/api-protection';

export async function GET(request: Request) {
  const session = await requireAnyPermission(request, [
    'canViewAnalytics',
    'canViewCrossAccountAnalytics'
  ]);
  // User has at least one permission
}
```

### 7. Optional Authentication

```typescript
import { optionalAuth } from '@/lib/auth/api-protection';

export async function GET(request: Request) {
  const session = await optionalAuth(request);

  if (session) {
    // Return personalized data
    return getPrivateTemplates(session.user.organizationId);
  } else {
    // Return public data
    return getPublicTemplates();
  }
}
```

### 8. Organization Verification

```typescript
import { requireOrganizationMember } from '@/lib/auth/api-protection';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const orgId = searchParams.get('organizationId');

  const session = await requireOrganizationMember(request, orgId!);
  // User belongs to this organization
}
```

## Permission Reference

### Quick Lookup Table

| What you want to do | Permission to check |
|---------------------|---------------------|
| Create global template | `canCreateGlobalTemplate` |
| Create private template | `canCreatePrivateTemplate` |
| Edit global template | `canEditGlobalTemplate` |
| Delete template | `canDeleteTemplate` (pass template) |
| Delete campaign | `canDeleteCampaign` |
| Export analytics | `canExportData` |
| View cross-account data | `canViewCrossAccountAnalytics` |
| Invite users | `canInviteUsers` |
| Change user roles | `canChangeUserRoles` |
| Update organization | `canUpdateOrganization` |
| Disconnect Facebook | `canDisconnectFacebookAccount` |

### Role Capabilities

**ADMIN can:**
- Everything USER can do, plus:
- Create/edit/delete global templates
- Delete campaigns
- Export data
- View cross-account analytics
- Manage users and roles
- Manage organization settings
- Disconnect Facebook accounts

**USER can:**
- Create/edit private templates
- Fork any template
- Create/edit/pause campaigns
- View their org's analytics
- Connect Facebook accounts

## Error Responses

### 401 Unauthorized (Not Signed In)

```typescript
throw new UnauthorizedError('Custom message');
// Returns: { success: false, error: { message: "...", code: "UNAUTHORIZED" } }
```

### 403 Forbidden (No Permission)

```typescript
throw new ForbiddenError('Custom message');
// Returns: { success: false, error: { message: "...", code: "FORBIDDEN" } }
```

## Common Mistakes to Avoid

❌ **Don't** use old session utilities:
```typescript
import { requireAuth } from '@/lib/auth/session'; // OLD
```

✅ **Do** use new API protection:
```typescript
import { requireAuth } from '@/lib/auth/api-protection'; // NEW
```

---

❌ **Don't** forget to pass request:
```typescript
const session = await requireAuth(); // WRONG
```

✅ **Do** pass request object:
```typescript
const session = await requireAuth(request); // CORRECT
```

---

❌ **Don't** use string literals for roles:
```typescript
if (user.role === 'ADMIN') // Untyped
```

✅ **Do** use UserRole enum:
```typescript
import { UserRole } from '@/lib/auth/permissions';
if (user.role === UserRole.ADMIN) // Type-safe
```

---

❌ **Don't** check permissions without auth:
```typescript
if (hasPermission(userRole, 'canDeleteCampaign')) {
  // User might not be authenticated!
}
```

✅ **Do** authenticate first:
```typescript
const session = await requireAuth(request);
if (hasPermission(session.user.role, 'canDeleteCampaign')) {
  // User is authenticated and has permission
}
```

## Testing Examples

```typescript
import { hasPermission, UserRole } from '@/lib/auth/permissions';

describe('Permissions', () => {
  it('admin can delete campaign', () => {
    expect(hasPermission(UserRole.ADMIN, 'canDeleteCampaign')).toBe(true);
  });

  it('user cannot delete campaign', () => {
    expect(hasPermission(UserRole.USER, 'canDeleteCampaign')).toBe(false);
  });

  it('user can delete own private template', () => {
    const template = { isGlobal: false, isPublic: false };
    expect(hasPermission(UserRole.USER, 'canDeleteTemplate', template)).toBe(true);
  });

  it('user cannot delete global template', () => {
    const template = { isGlobal: true };
    expect(hasPermission(UserRole.USER, 'canDeleteTemplate', template)).toBe(false);
  });
});
```

## File Locations

- Permission definitions: `/lib/auth/permissions.ts`
- API protection middleware: `/lib/auth/api-protection.ts`
- Type definitions: `/lib/auth/types.ts`
- Full documentation: `/docs/RBAC-SYSTEM.md`

## Need Help?

1. Check full documentation: `/docs/RBAC-SYSTEM.md`
2. See implementation examples in updated API routes
3. Review permission matrix for your use case
4. Test with both ADMIN and USER roles
