import { describe, it, expect } from '@jest/globals';
import {
  hasPermission,
  isAdmin,
  isUser,
  templatePermissions,
  campaignPermissions,
  analyticsPermissions,
  userManagementPermissions,
  facebookAccountPermissions,
  organizationPermissions,
  UserRole,
} from '@/lib/auth/permissions';
import type { AdTemplate } from '@prisma/client';

describe('Permission System', () => {
  const mockTemplate: AdTemplate = {
    id: 'template-1',
    name: 'Test Template',
    description: 'Test',
    category: 'E-COMMERCE',
    isGlobal: false,
    isPublic: false,
    dynamicFields: null,
    organizationId: 'org-1',
    createdBy: 'user-1',
    adCopy: {},
    creativeSpecs: {},
    targetingConfig: {},
    campaignStructure: {},
    timesUsed: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AdTemplate;

  const mockGlobalTemplate: AdTemplate = {
    ...mockTemplate,
    id: 'global-template-1',
    isGlobal: true,
    organizationId: null,
  };

  describe('hasPermission', () => {
    it('should return true for valid admin permission', () => {
      const result = hasPermission(UserRole.ADMIN, 'canCreateGlobalTemplate');

      expect(result).toBe(true);
    });

    it('should return false for invalid user permission', () => {
      const result = hasPermission(UserRole.USER, 'canCreateGlobalTemplate');

      expect(result).toBe(false);
    });

    it('should handle permissions with additional arguments', () => {
      const result = hasPermission(
        UserRole.ADMIN,
        'canEditTemplate',
        mockTemplate,
        'user-1'
      );

      expect(result).toBe(true);
    });

    it('should return false for non-existent permission', () => {
      const result = hasPermission(
        UserRole.ADMIN,
        'nonExistentPermission' as any
      );

      expect(result).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      expect(isAdmin(UserRole.ADMIN)).toBe(true);
    });

    it('should return false for USER role', () => {
      expect(isAdmin(UserRole.USER)).toBe(false);
    });
  });

  describe('isUser', () => {
    it('should return true for USER role', () => {
      expect(isUser(UserRole.USER)).toBe(true);
    });

    it('should return false for ADMIN role', () => {
      expect(isUser(UserRole.ADMIN)).toBe(false);
    });
  });

  describe('Template Permissions', () => {
    describe('canCreateGlobalTemplate', () => {
      it('should allow admins to create global templates', () => {
        expect(templatePermissions.canCreateGlobalTemplate(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should not allow users to create global templates', () => {
        expect(templatePermissions.canCreateGlobalTemplate(UserRole.USER)).toBe(
          false
        );
      });
    });

    describe('canCreatePrivateTemplate', () => {
      it('should allow admins to create private templates', () => {
        expect(
          templatePermissions.canCreatePrivateTemplate(UserRole.ADMIN)
        ).toBe(true);
      });

      it('should allow users to create private templates', () => {
        expect(templatePermissions.canCreatePrivateTemplate(UserRole.USER)).toBe(
          true
        );
      });
    });

    describe('canEditGlobalTemplate', () => {
      it('should allow admins to edit global templates', () => {
        expect(templatePermissions.canEditGlobalTemplate(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should not allow users to edit global templates', () => {
        expect(templatePermissions.canEditGlobalTemplate(UserRole.USER)).toBe(
          false
        );
      });
    });

    describe('canEditTemplate', () => {
      it('should allow admins to edit any template', () => {
        expect(
          templatePermissions.canEditTemplate(
            UserRole.ADMIN,
            mockTemplate,
            'user-1'
          )
        ).toBe(true);
      });

      it('should allow admins to edit global templates', () => {
        expect(
          templatePermissions.canEditTemplate(
            UserRole.ADMIN,
            mockGlobalTemplate,
            'user-1'
          )
        ).toBe(true);
      });

      it('should allow users to edit private templates from their organization', () => {
        const privateTemplate = { ...mockTemplate, isGlobal: false };

        expect(
          templatePermissions.canEditTemplate(
            UserRole.USER,
            privateTemplate,
            'user-1'
          )
        ).toBe(true);
      });

      it('should not allow users to edit global templates', () => {
        expect(
          templatePermissions.canEditTemplate(
            UserRole.USER,
            mockGlobalTemplate,
            'user-1'
          )
        ).toBe(false);
      });

      it('should not allow users to edit templates without organizationId', () => {
        const templateWithoutOrg = { ...mockTemplate, organizationId: null };

        expect(
          templatePermissions.canEditTemplate(
            UserRole.USER,
            templateWithoutOrg,
            'user-1'
          )
        ).toBe(false);
      });
    });

    describe('canDeleteTemplate', () => {
      it('should allow admins to delete global templates', () => {
        expect(
          templatePermissions.canDeleteTemplate(UserRole.ADMIN, mockGlobalTemplate)
        ).toBe(true);
      });

      it('should allow admins to delete private templates', () => {
        expect(
          templatePermissions.canDeleteTemplate(UserRole.ADMIN, mockTemplate)
        ).toBe(true);
      });

      it('should not allow users to delete global templates', () => {
        expect(
          templatePermissions.canDeleteTemplate(UserRole.USER, mockGlobalTemplate)
        ).toBe(false);
      });

      it('should allow users to delete their own private templates', () => {
        const privateTemplate = { ...mockTemplate, isPublic: false };

        expect(
          templatePermissions.canDeleteTemplate(UserRole.USER, privateTemplate)
        ).toBe(true);
      });

      it('should not allow users to delete public templates', () => {
        const publicTemplate = { ...mockTemplate, isPublic: true };

        expect(
          templatePermissions.canDeleteTemplate(UserRole.USER, publicTemplate)
        ).toBe(false);
      });
    });

    describe('canViewTemplates', () => {
      it('should allow admins to view templates', () => {
        expect(templatePermissions.canViewTemplates(UserRole.ADMIN)).toBe(true);
      });

      it('should allow users to view templates', () => {
        expect(templatePermissions.canViewTemplates(UserRole.USER)).toBe(true);
      });
    });

    describe('canForkTemplate', () => {
      it('should allow admins to fork templates', () => {
        expect(templatePermissions.canForkTemplate(UserRole.ADMIN)).toBe(true);
      });

      it('should allow users to fork templates', () => {
        expect(templatePermissions.canForkTemplate(UserRole.USER)).toBe(true);
      });
    });
  });

  describe('Campaign Permissions', () => {
    describe('canCreateCampaign', () => {
      it('should allow admins to create campaigns', () => {
        expect(campaignPermissions.canCreateCampaign(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should allow users to create campaigns', () => {
        expect(campaignPermissions.canCreateCampaign(UserRole.USER)).toBe(true);
      });
    });

    describe('canEditCampaignBudget', () => {
      it('should allow admins to edit campaign budgets', () => {
        expect(campaignPermissions.canEditCampaignBudget(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should allow users to edit campaign budgets', () => {
        expect(campaignPermissions.canEditCampaignBudget(UserRole.USER)).toBe(
          true
        );
      });
    });

    describe('canPauseCampaign', () => {
      it('should allow admins to pause campaigns', () => {
        expect(campaignPermissions.canPauseCampaign(UserRole.ADMIN)).toBe(true);
      });

      it('should allow users to pause campaigns', () => {
        expect(campaignPermissions.canPauseCampaign(UserRole.USER)).toBe(true);
      });
    });

    describe('canResumeCampaign', () => {
      it('should allow admins to resume campaigns', () => {
        expect(campaignPermissions.canResumeCampaign(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should allow users to resume campaigns', () => {
        expect(campaignPermissions.canResumeCampaign(UserRole.USER)).toBe(true);
      });
    });

    describe('canDeleteCampaign', () => {
      it('should allow admins to delete campaigns', () => {
        expect(campaignPermissions.canDeleteCampaign(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should not allow users to delete campaigns', () => {
        expect(campaignPermissions.canDeleteCampaign(UserRole.USER)).toBe(
          false
        );
      });
    });

    describe('canDuplicateCampaign', () => {
      it('should allow admins to duplicate campaigns', () => {
        expect(campaignPermissions.canDuplicateCampaign(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should allow users to duplicate campaigns', () => {
        expect(campaignPermissions.canDuplicateCampaign(UserRole.USER)).toBe(
          true
        );
      });
    });
  });

  describe('Analytics Permissions', () => {
    describe('canViewAnalytics', () => {
      it('should allow admins to view analytics', () => {
        expect(analyticsPermissions.canViewAnalytics(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should allow users to view analytics', () => {
        expect(analyticsPermissions.canViewAnalytics(UserRole.USER)).toBe(true);
      });
    });

    describe('canViewCrossAccountAnalytics', () => {
      it('should allow admins to view cross-account analytics', () => {
        expect(
          analyticsPermissions.canViewCrossAccountAnalytics(UserRole.ADMIN)
        ).toBe(true);
      });

      it('should not allow users to view cross-account analytics', () => {
        expect(
          analyticsPermissions.canViewCrossAccountAnalytics(UserRole.USER)
        ).toBe(false);
      });
    });

    describe('canExportData', () => {
      it('should allow admins to export data', () => {
        expect(analyticsPermissions.canExportData(UserRole.ADMIN)).toBe(true);
      });

      it('should not allow users to export data', () => {
        expect(analyticsPermissions.canExportData(UserRole.USER)).toBe(false);
      });
    });

    describe('canViewAiInsights', () => {
      it('should allow admins to view AI insights', () => {
        expect(analyticsPermissions.canViewAiInsights(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should allow users to view AI insights', () => {
        expect(analyticsPermissions.canViewAiInsights(UserRole.USER)).toBe(
          true
        );
      });
    });
  });

  describe('User Management Permissions', () => {
    describe('canInviteUsers', () => {
      it('should allow admins to invite users', () => {
        expect(userManagementPermissions.canInviteUsers(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should not allow users to invite users', () => {
        expect(userManagementPermissions.canInviteUsers(UserRole.USER)).toBe(
          false
        );
      });
    });

    describe('canChangeUserRoles', () => {
      it('should allow admins to change user roles', () => {
        expect(
          userManagementPermissions.canChangeUserRoles(UserRole.ADMIN)
        ).toBe(true);
      });

      it('should not allow users to change user roles', () => {
        expect(userManagementPermissions.canChangeUserRoles(UserRole.USER)).toBe(
          false
        );
      });
    });

    describe('canRemoveUsers', () => {
      it('should allow admins to remove users', () => {
        expect(userManagementPermissions.canRemoveUsers(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should not allow users to remove users', () => {
        expect(userManagementPermissions.canRemoveUsers(UserRole.USER)).toBe(
          false
        );
      });
    });

    describe('canViewUsers', () => {
      it('should allow admins to view users', () => {
        expect(userManagementPermissions.canViewUsers(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should not allow users to view all users', () => {
        expect(userManagementPermissions.canViewUsers(UserRole.USER)).toBe(
          false
        );
      });
    });
  });

  describe('Facebook Account Permissions', () => {
    describe('canConnectFacebookAccount', () => {
      it('should allow admins to connect Facebook accounts', () => {
        expect(
          facebookAccountPermissions.canConnectFacebookAccount(UserRole.ADMIN)
        ).toBe(true);
      });

      it('should allow users to connect Facebook accounts', () => {
        expect(
          facebookAccountPermissions.canConnectFacebookAccount(UserRole.USER)
        ).toBe(true);
      });
    });

    describe('canDisconnectFacebookAccount', () => {
      it('should allow admins to disconnect Facebook accounts', () => {
        expect(
          facebookAccountPermissions.canDisconnectFacebookAccount(UserRole.ADMIN)
        ).toBe(true);
      });

      it('should not allow users to disconnect Facebook accounts', () => {
        expect(
          facebookAccountPermissions.canDisconnectFacebookAccount(UserRole.USER)
        ).toBe(false);
      });
    });

    describe('canViewAdAccountSettings', () => {
      it('should allow admins to view ad account settings', () => {
        expect(
          facebookAccountPermissions.canViewAdAccountSettings(UserRole.ADMIN)
        ).toBe(true);
      });

      it('should allow users to view ad account settings', () => {
        expect(
          facebookAccountPermissions.canViewAdAccountSettings(UserRole.USER)
        ).toBe(true);
      });
    });
  });

  describe('Organization Permissions', () => {
    describe('canUpdateOrganization', () => {
      it('should allow admins to update organization', () => {
        expect(
          organizationPermissions.canUpdateOrganization(UserRole.ADMIN)
        ).toBe(true);
      });

      it('should not allow users to update organization', () => {
        expect(
          organizationPermissions.canUpdateOrganization(UserRole.USER)
        ).toBe(false);
      });
    });

    describe('canViewOrganizationSettings', () => {
      it('should allow admins to view organization settings', () => {
        expect(
          organizationPermissions.canViewOrganizationSettings(UserRole.ADMIN)
        ).toBe(true);
      });

      it('should not allow users to view organization settings', () => {
        expect(
          organizationPermissions.canViewOrganizationSettings(UserRole.USER)
        ).toBe(false);
      });
    });

    describe('canManageBilling', () => {
      it('should allow admins to manage billing', () => {
        expect(organizationPermissions.canManageBilling(UserRole.ADMIN)).toBe(
          true
        );
      });

      it('should not allow users to manage billing', () => {
        expect(organizationPermissions.canManageBilling(UserRole.USER)).toBe(
          false
        );
      });
    });
  });

  describe('Permission Combinations and Edge Cases', () => {
    it('should handle all admin permissions consistently', () => {
      const allPermissions = [
        'canCreateGlobalTemplate',
        'canCreatePrivateTemplate',
        'canEditGlobalTemplate',
        'canViewTemplates',
        'canForkTemplate',
        'canCreateCampaign',
        'canEditCampaignBudget',
        'canPauseCampaign',
        'canResumeCampaign',
        'canDeleteCampaign',
        'canDuplicateCampaign',
        'canViewAnalytics',
        'canViewCrossAccountAnalytics',
        'canExportData',
        'canViewAiInsights',
        'canInviteUsers',
        'canChangeUserRoles',
        'canRemoveUsers',
        'canViewUsers',
        'canConnectFacebookAccount',
        'canDisconnectFacebookAccount',
        'canViewAdAccountSettings',
        'canUpdateOrganization',
        'canViewOrganizationSettings',
        'canManageBilling',
      ] as const;

      for (const permission of allPermissions) {
        const result = hasPermission(UserRole.ADMIN, permission);
        expect(result).toBe(true);
      }
    });

    it('should properly restrict user permissions', () => {
      const restrictedPermissions = [
        'canCreateGlobalTemplate',
        'canEditGlobalTemplate',
        'canDeleteCampaign',
        'canViewCrossAccountAnalytics',
        'canExportData',
        'canInviteUsers',
        'canChangeUserRoles',
        'canRemoveUsers',
        'canViewUsers',
        'canDisconnectFacebookAccount',
        'canUpdateOrganization',
        'canViewOrganizationSettings',
        'canManageBilling',
      ] as const;

      for (const permission of restrictedPermissions) {
        const result = hasPermission(UserRole.USER, permission);
        expect(result).toBe(false);
      }
    });

    it('should allow users basic operational permissions', () => {
      const allowedPermissions = [
        'canCreatePrivateTemplate',
        'canViewTemplates',
        'canForkTemplate',
        'canCreateCampaign',
        'canEditCampaignBudget',
        'canPauseCampaign',
        'canResumeCampaign',
        'canDuplicateCampaign',
        'canViewAnalytics',
        'canViewAiInsights',
        'canConnectFacebookAccount',
        'canViewAdAccountSettings',
      ] as const;

      for (const permission of allowedPermissions) {
        const result = hasPermission(UserRole.USER, permission);
        expect(result).toBe(true);
      }
    });
  });
});
