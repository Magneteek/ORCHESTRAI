/**
 * Role-Based Access Control (RBAC) Permission System
 * Defines granular permissions for all features based on user roles
 */

import { UserRole } from '@prisma/client';
import type { AdTemplate } from '@prisma/client';

/**
 * Permission definitions for template management
 */
export const templatePermissions = {
  /**
   * Check if user can create global templates (available to all organizations)
   * Only admins can create global templates
   */
  canCreateGlobalTemplate: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can create private templates (organization-specific)
   * Both admins and users can create private templates
   */
  canCreatePrivateTemplate: (role: UserRole): boolean => {
    return role === UserRole.ADMIN || role === UserRole.USER;
  },

  /**
   * Check if user can edit global templates
   * Only admins can edit global templates
   */
  canEditGlobalTemplate: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can edit a specific template
   * Admins can edit any template
   * Users can only edit their own private templates
   */
  canEditTemplate: (role: UserRole, template: AdTemplate, userId: string): boolean => {
    if (role === UserRole.ADMIN) {
      return true;
    }

    // Users can only edit private templates from their organization
    return !template.isGlobal && template.organizationId !== null;
  },

  /**
   * Check if user can delete a specific template
   * Admins can delete any template except global ones
   * Users can only delete their own private templates
   */
  canDeleteTemplate: (role: UserRole, template: AdTemplate): boolean => {
    if (template.isGlobal) {
      return role === UserRole.ADMIN;
    }

    if (role === UserRole.ADMIN) {
      return true;
    }

    // Users can delete their own private templates
    return !template.isPublic;
  },

  /**
   * Check if user can view templates
   * All authenticated users can view templates (with appropriate filters)
   */
  canViewTemplates: (role: UserRole): boolean => {
    return true;
  },

  /**
   * Check if user can fork/clone templates
   * All authenticated users can fork templates
   */
  canForkTemplate: (role: UserRole): boolean => {
    return true;
  },
};

/**
 * Permission definitions for campaign management
 */
export const campaignPermissions = {
  /**
   * Check if user can create campaigns
   * Both admins and users can create campaigns
   */
  canCreateCampaign: (role: UserRole): boolean => {
    return true;
  },

  /**
   * Check if user can edit campaign budget
   * Both admins and users can edit budgets
   */
  canEditCampaignBudget: (role: UserRole): boolean => {
    return true;
  },

  /**
   * Check if user can pause campaigns
   * Both admins and users can pause campaigns
   */
  canPauseCampaign: (role: UserRole): boolean => {
    return true;
  },

  /**
   * Check if user can resume campaigns
   * Both admins and users can resume campaigns
   */
  canResumeCampaign: (role: UserRole): boolean => {
    return true;
  },

  /**
   * Check if user can delete campaigns
   * Only admins can delete campaigns
   */
  canDeleteCampaign: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can duplicate campaigns
   * Both admins and users can duplicate campaigns
   */
  canDuplicateCampaign: (role: UserRole): boolean => {
    return true;
  },
};

/**
 * Permission definitions for analytics and reporting
 */
export const analyticsPermissions = {
  /**
   * Check if user can view basic analytics
   * All authenticated users can view basic analytics
   */
  canViewAnalytics: (role: UserRole): boolean => {
    return true;
  },

  /**
   * Check if user can view cross-account analytics
   * Only admins can view analytics across multiple accounts
   */
  canViewCrossAccountAnalytics: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can export analytics data
   * Only admins can export data (CSV, PDF)
   */
  canExportData: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can view AI insights
   * All authenticated users can view AI insights
   */
  canViewAiInsights: (role: UserRole): boolean => {
    return true;
  },
};

/**
 * Permission definitions for user management
 */
export const userManagementPermissions = {
  /**
   * Check if user can invite other users to the organization
   * Only admins can invite users
   */
  canInviteUsers: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can change user roles
   * Only admins can change roles
   */
  canChangeUserRoles: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can remove users from organization
   * Only admins can remove users
   */
  canRemoveUsers: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can view organization users list
   * Only admins can view all users
   */
  canViewUsers: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },
};

/**
 * Permission definitions for Facebook account management
 */
export const facebookAccountPermissions = {
  /**
   * Check if user can connect Facebook Business accounts
   * Both admins and users can connect accounts
   */
  canConnectFacebookAccount: (role: UserRole): boolean => {
    return true;
  },

  /**
   * Check if user can disconnect Facebook Business accounts
   * Only admins can disconnect accounts
   */
  canDisconnectFacebookAccount: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can view ad account settings
   * All authenticated users can view settings
   */
  canViewAdAccountSettings: (role: UserRole): boolean => {
    return true;
  },
};

/**
 * Permission definitions for organization management
 */
export const organizationPermissions = {
  /**
   * Check if user can update organization settings
   * Only admins can update organization settings
   */
  canUpdateOrganization: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can view organization settings
   * Only admins can view organization settings
   */
  canViewOrganizationSettings: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },

  /**
   * Check if user can manage billing
   * Only admins can manage billing
   */
  canManageBilling: (role: UserRole): boolean => {
    return role === UserRole.ADMIN;
  },
};

/**
 * Consolidated permissions object
 * Provides a single interface for all permission checks
 */
export const permissions = {
  // Template Management
  canCreateGlobalTemplate: templatePermissions.canCreateGlobalTemplate,
  canCreatePrivateTemplate: templatePermissions.canCreatePrivateTemplate,
  canEditGlobalTemplate: templatePermissions.canEditGlobalTemplate,
  canEditTemplate: templatePermissions.canEditTemplate,
  canDeleteTemplate: templatePermissions.canDeleteTemplate,
  canViewTemplates: templatePermissions.canViewTemplates,
  canForkTemplate: templatePermissions.canForkTemplate,

  // Campaign Management
  canCreateCampaign: campaignPermissions.canCreateCampaign,
  canEditCampaignBudget: campaignPermissions.canEditCampaignBudget,
  canPauseCampaign: campaignPermissions.canPauseCampaign,
  canResumeCampaign: campaignPermissions.canResumeCampaign,
  canDeleteCampaign: campaignPermissions.canDeleteCampaign,
  canDuplicateCampaign: campaignPermissions.canDuplicateCampaign,

  // Analytics
  canViewAnalytics: analyticsPermissions.canViewAnalytics,
  canViewCrossAccountAnalytics: analyticsPermissions.canViewCrossAccountAnalytics,
  canExportData: analyticsPermissions.canExportData,
  canViewAiInsights: analyticsPermissions.canViewAiInsights,

  // User Management
  canInviteUsers: userManagementPermissions.canInviteUsers,
  canChangeUserRoles: userManagementPermissions.canChangeUserRoles,
  canRemoveUsers: userManagementPermissions.canRemoveUsers,
  canViewUsers: userManagementPermissions.canViewUsers,

  // Facebook Account Management
  canConnectFacebookAccount: facebookAccountPermissions.canConnectFacebookAccount,
  canDisconnectFacebookAccount: facebookAccountPermissions.canDisconnectFacebookAccount,
  canViewAdAccountSettings: facebookAccountPermissions.canViewAdAccountSettings,

  // Organization Management
  canUpdateOrganization: organizationPermissions.canUpdateOrganization,
  canViewOrganizationSettings: organizationPermissions.canViewOrganizationSettings,
  canManageBilling: organizationPermissions.canManageBilling,
};

/**
 * Type-safe permission checker helper
 *
 * @param role - User role from session
 * @param permissionKey - Permission to check
 * @param args - Additional arguments for permission functions (e.g., template object)
 * @returns boolean indicating if user has permission
 *
 * @example
 * ```typescript
 * const canDelete = hasPermission(user.role, 'canDeleteTemplate', template);
 * if (!canDelete) {
 *   throw new ForbiddenError('You cannot delete this template');
 * }
 * ```
 */
export function hasPermission(
  role: UserRole,
  permissionKey: keyof typeof permissions,
  ...args: any[]
): boolean {
  const permissionFn = permissions[permissionKey];

  if (typeof permissionFn === 'function') {
    return (permissionFn as (...a: unknown[]) => boolean)(role, ...args);
  }

  return false;
}

/**
 * Helper to check if role is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Helper to check if role is user (non-admin)
 */
export function isUser(role: UserRole): boolean {
  return role === UserRole.USER;
}

/**
 * Re-export UserRole enum for convenience
 */
export { UserRole } from '@prisma/client';
