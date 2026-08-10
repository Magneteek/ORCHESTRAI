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

export const adSetQuerySchema = z.object({
  adAccountId: z.string().optional(),
  campaignId: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
});

export const createAdSetSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  name: z.string().min(1, 'Ad set name is required').max(255),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).default('PAUSED'),
  pageId: z.string().optional(),
  dailyBudget: z.number().positive().optional(),
  lifetimeBudget: z.number().positive().optional(),
  billingEvent: z.string().optional(),
  optimizationGoal: z.string().optional(),
  bidAmount: z.number().positive().optional(),
  bidStrategy: z.string().optional(),
  targeting: z.record(z.any()).optional(),
  dynamicCreative: z.boolean().optional(),
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

export const adQuerySchema = z.object({
  adAccountId: z.string().optional(),
  campaignId: z.string().optional(),
  adSetId: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
});

export const createAdSchema = z.object({
  adSetId: z.string().min(1, 'Ad set ID is required'),
  name: z.string().min(1, 'Ad name is required').max(255),
  status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']).default('PAUSED'),
  pageId: z.string().min(1, 'Facebook Page is required'),
  format: z.enum(['SINGLE_IMAGE', 'CAROUSEL', 'VIDEO']).default('SINGLE_IMAGE'),
  destinationType: z.enum(['WEBSITE', 'INSTANT_FORM', 'WHATSAPP']).default('WEBSITE'),
  urlTags: z.string().optional(),
  leadFormId: z.string().optional(),
  whatsappNumber: z.string().optional(),
  creative: z.object({
    headlines: z.array(z.string().max(255)).max(5).optional(),
    primaryTexts: z.array(z.string().max(2000)).max(5).optional(),
    descriptions: z.array(z.string().max(500)).max(5).optional(),
    callToActionType: z.string().optional(),
    linkUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    imageHash: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
    imageHashes: z.array(z.string()).optional(),
    videoId: z.string().optional(),
    carouselCards: z.array(z.object({
      imageUrl: z.string().optional(),
      imageHash: z.string().optional(),
      headline: z.string().max(255).optional(),
      description: z.string().max(500).optional(),
      linkUrl: z.string().optional(),
    })).optional(),
  }),
}).superRefine((val, ctx) => {
  if (val.destinationType === 'INSTANT_FORM' && !val.leadFormId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['leadFormId'], message: 'A lead form is required for Instant Form ads' });
  }
  if (val.destinationType === 'WHATSAPP' && !val.whatsappNumber) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['whatsappNumber'], message: 'A WhatsApp number is required' });
  }
  const format = val.format || 'SINGLE_IMAGE';
  if (format !== 'CAROUSEL') {
    if (!val.creative.primaryTexts?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['creative', 'primaryTexts'], message: 'At least one primary text is required' });
    }
    if (!val.creative.headlines?.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['creative', 'headlines'], message: 'At least one headline is required' });
    }
  }
  if (format === 'SINGLE_IMAGE') {
    const hasImage = val.creative.imageHash || val.creative.imageUrl ||
      val.creative.imageHashes?.length || val.creative.imageUrls?.length;
    if (!hasImage) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['creative', 'imageHash'], message: 'At least one image is required for Single Image ads' });
    }
  }
  if (format === 'VIDEO' && !val.creative.videoId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['creative', 'videoId'], message: 'A video ID is required for Video ads' });
  }
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
export type AdSetQueryInput = z.infer<typeof adSetQuerySchema>;
export type CreateAdSetInput = z.infer<typeof createAdSetSchema>;
export type UpdateAdSetInput = z.infer<typeof updateAdSetSchema>;
export type AdQueryInput = z.infer<typeof adQuerySchema>;
export type CreateAdInput = z.infer<typeof createAdSchema>;
export type UpdateAdInput = z.infer<typeof updateAdSchema>;
export type UploadImageInput = z.infer<typeof uploadImageSchema>;
