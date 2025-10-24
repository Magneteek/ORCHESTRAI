import { z } from 'zod';

// ============ AUTHENTICATION ============

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============ ORGANIZATION ============

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  plan: z.enum(['free', 'starter', 'professional', 'enterprise']).default('free'),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  plan: z.enum(['free', 'starter', 'professional', 'enterprise']).optional(),
  status: z.enum(['active', 'suspended', 'cancelled']).optional(),
});

// ============ USER ============

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'member']).optional(),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'member']).default('member'),
});

// ============ FACEBOOK INTEGRATION ============

export const createFacebookAccountSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  name: z.string().min(1, 'Account name is required'),
  accessToken: z.string().min(1, 'Access token is required'),
  systemUserToken: z.string().optional(),
  tokenExpiresAt: z.string().datetime().optional(),
});

export const updateFacebookAccountSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  accessToken: z.string().min(1).optional(),
  tokenExpiresAt: z.string().datetime().optional(),
});

// ============ TEMPLATES ============

export const adCopySchema = z.object({
  headline: z.string().min(1).max(255),
  primaryText: z.string().min(1).max(2000),
  description: z.string().max(500).optional(),
  callToAction: z.string().min(1),
});

export const creativeSpecsSchema = z.object({
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  format: z.enum(['image', 'video', 'carousel', 'collection']),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
});

export const targetingConfigSchema = z.object({
  interests: z.array(z.string()).optional(),
  demographics: z.object({
    ageMin: z.number().min(13).max(65).optional(),
    ageMax: z.number().min(13).max(65).optional(),
    genders: z.array(z.enum(['male', 'female', 'all'])).optional(),
  }).optional(),
  behaviors: z.array(z.string()).optional(),
  locations: z.array(
    z.object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional(),
    })
  ).optional(),
});

export const campaignStructureSchema = z.object({
  budget: z.number().positive(),
  bidStrategy: z.string(),
  placements: z.array(z.string()),
  schedule: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  category: z.string().min(1),
  objective: z.string().min(1),
  visibility: z.enum(['private', 'public']).default('private'),
  adCopy: adCopySchema,
  creativeSpecs: creativeSpecsSchema,
  targetingConfig: targetingConfigSchema,
  campaignStructure: campaignStructureSchema,
});

export const updateTemplateSchema = createTemplateSchema.partial();

// ============ PAGINATION ============

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().positive().max(100)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ============ QUERY FILTERS ============

export const templateFilterSchema = paginationSchema.extend({
  category: z.string().optional(),
  visibility: z.enum(['private', 'public', 'all']).optional().default('all'),
  search: z.string().optional(),
});

export const adAccountFilterSchema = paginationSchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'all']).optional().default('all'),
});

// ============ TYPE EXPORTS ============

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type CreateFacebookAccountInput = z.infer<typeof createFacebookAccountSchema>;
export type UpdateFacebookAccountInput = z.infer<typeof updateFacebookAccountSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type TemplateFilterInput = z.infer<typeof templateFilterSchema>;
export type AdAccountFilterInput = z.infer<typeof adAccountFilterSchema>;
