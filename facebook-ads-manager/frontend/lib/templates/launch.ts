import type { AdTemplate, Campaign } from '@prisma/client';
import type { DynamicField } from './dynamic-fields';

/**
 * Launch configuration for creating a campaign from a template
 */
export interface LaunchConfig {
  campaignName: string;
  fieldValues: Record<string, any>;
  targeting: TargetingConfig;
  budget: BudgetConfig;
}

/**
 * Targeting configuration for campaign launch
 */
export interface TargetingConfig {
  locations: string[];
  ageMin?: number;
  ageMax?: number;
  genders?: ('male' | 'female' | 'all')[];
  interests?: string[];
  behaviors?: string[];
}

/**
 * Budget configuration for campaign launch
 */
export interface BudgetConfig {
  budgetType: 'daily' | 'lifetime';
  budget: number;
  startTime?: string;
  stopTime?: string;
  bidStrategy?: string;
}

/**
 * Launch a campaign from a template
 *
 * @param templateId - ID of the template to launch from
 * @param adAccountId - Facebook ad account ID
 * @param userId - User ID creating the campaign
 * @param launchConfig - Configuration for the campaign launch
 * @returns Created campaign object
 *
 * @example
 * ```typescript
 * const campaign = await launchCampaignFromTemplate(
 *   'template-123',
 *   'act_123456789',
 *   'user-123',
 *   {
 *     campaignName: 'Summer Sale 2024',
 *     fieldValues: { company_name: 'Acme Corp', discount: 20 },
 *     targeting: { locations: ['US'], ageMin: 25, ageMax: 54 },
 *     budget: { budgetType: 'daily', budget: 100 }
 *   }
 * );
 * ```
 */
export async function launchCampaignFromTemplate(
  templateId: string,
  adAccountId: string,
  userId: string,
  launchConfig: LaunchConfig
): Promise<Campaign> {
  // TODO: Implement in Phase 5
  // This is a stub implementation for Phase 4

  // For now, return a mock campaign object matching the Prisma Campaign model
  return {
    id: `mock-campaign-${Date.now()}`,
    adAccountId,
    campaignId: `fb-campaign-${Date.now()}`,
    name: launchConfig.campaignName,
    objective: 'OUTCOME_SALES',
    status: 'PAUSED',
    templateId,
    dailyBudget: launchConfig.budget.budgetType === 'daily' ? launchConfig.budget.budget : null,
    lifetimeBudget: launchConfig.budget.budgetType === 'lifetime' ? launchConfig.budget.budget : null,
    startTime: launchConfig.budget.startTime ? new Date(launchConfig.budget.startTime) : null,
    stopTime: launchConfig.budget.stopTime ? new Date(launchConfig.budget.stopTime) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Campaign;
}

/**
 * Validate launch configuration
 *
 * @param config - Launch configuration to validate
 * @param template - Template being used
 * @param dynamicFields - Dynamic field definitions
 * @returns Validation result
 */
export interface LaunchValidationResult {
  valid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

export function validateLaunchConfig(
  config: LaunchConfig,
  template: AdTemplate,
  dynamicFields: DynamicField[]
): LaunchValidationResult {
  const errors: { field: string; message: string }[] = [];

  // Validate campaign name
  if (!config.campaignName || config.campaignName.trim().length === 0) {
    errors.push({
      field: 'campaignName',
      message: 'Campaign name is required',
    });
  }

  // Validate budget
  if (!config.budget.budget || config.budget.budget <= 0) {
    errors.push({
      field: 'budget',
      message: 'Budget must be greater than 0',
    });
  }

  // Validate targeting locations
  if (!config.targeting.locations || config.targeting.locations.length === 0) {
    errors.push({
      field: 'targeting.locations',
      message: 'At least one location is required',
    });
  }

  // Validate age range
  if (config.targeting.ageMin && config.targeting.ageMax) {
    if (config.targeting.ageMin > config.targeting.ageMax) {
      errors.push({
        field: 'targeting.age',
        message: 'Minimum age must be less than maximum age',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
