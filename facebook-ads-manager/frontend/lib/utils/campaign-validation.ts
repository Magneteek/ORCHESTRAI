import { z } from 'zod';

// ============ CAMPAIGN VALIDATION ============

export const createCampaignSchema = z.object({
  adAccountId: z.string().min(1, 'Ad account ID is required'),
  name: z.string().min(1, 'Campaign name is required').max(255),
  objective: z.string().min(1, 'Campaign objective is required'),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).default('PAUSED'),
  specialAdCategories: z.array(z.enum(['CREDIT', 'EMPLOYMENT', 'HOUSING', 'NONE'])).optional(),
  dailyBudget: z.number().positive().optional(),
  lifetimeBudget: z.number().positive().optional(),
  spendCap: z.number().positive().optional(),
  bidStrategy: z.string().optional(),
  startTime: z.string().datetime().optional(),
  stopTime: z.string().datetime().optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).optional(),
  dailyBudget: z.number().positive().optional(),
  lifetimeBudget: z.number().positive().optional(),
  spendCap: z.number().positive().optional(),
  bidStrategy: z.string().optional(),
  startTime: z.string().datetime().optional(),
  stopTime: z.string().datetime().optional(),
});

export const campaignQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  search: z.string().optional(),
  status: z.string().optional(),
  objective: z.string().optional(),
  adAccountId: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status', 'spend']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ============ AD SET VALIDATION ============

export const createAdSetSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  name: z.string().min(1, 'Ad set name is required').max(255),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).default('PAUSED'),
  dailyBudget: z.number().positive().optional(),
  lifetimeBudget: z.number().positive().optional(),
  billingEvent: z.string().optional(),
  optimizationGoal: z.string().optional(),
  bidAmount: z.number().positive().optional(),
  bidStrategy: z.string().optional(),
  targeting: z.record(z.any()).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
});

export const updateAdSetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).optional(),
  dailyBudget: z.number().positive().optional(),
  lifetimeBudget: z.number().positive().optional(),
  bidAmount: z.number().positive().optional(),
  targeting: z.record(z.any()).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
});

// ============ AD VALIDATION ============

export const createAdSchema = z.object({
  adSetId: z.string().min(1, 'Ad set ID is required'),
  name: z.string().min(1, 'Ad name is required').max(255),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).default('PAUSED'),
  creative: z.object({
    imageUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    imageHash: z.string().optional(),
    videoId: z.string().optional(),
    headline: z.string().max(255).optional(),
    primaryText: z.string().max(2000).optional(),
    description: z.string().max(500).optional(),
    callToActionType: z.string().optional(),
    linkUrl: z.string().url().optional(),
  }),
});

export const updateAdSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).optional(),
  creative: z.object({
    imageUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    headline: z.string().max(255).optional(),
    primaryText: z.string().max(2000).optional(),
    description: z.string().max(500).optional(),
    callToActionType: z.string().optional(),
    linkUrl: z.string().url().optional(),
  }).optional(),
});

export const uploadImageSchema = z.object({
  adAccountId: z.string().min(1, 'Ad account ID is required'),
  imageUrl: z.string().url().optional(),
  imageData: z.string().optional(), // Base64 encoded image
  fileName: z.string().optional(),
});

// Type exports
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignQueryInput = z.infer<typeof campaignQuerySchema>;
export type CreateAdSetInput = z.infer<typeof createAdSetSchema>;
export type UpdateAdSetInput = z.infer<typeof updateAdSetSchema>;
export type CreateAdInput = z.infer<typeof createAdSchema>;
export type UpdateAdInput = z.infer<typeof updateAdSchema>;
export type UploadImageInput = z.infer<typeof uploadImageSchema>;
