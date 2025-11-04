import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { uploadImageSchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * POST /api/ads/upload-image
 * Upload image to Facebook Ad Account
 *
 * Body:
 * - adAccountId: string (required) - Database ad account ID
 * - imageUrl?: string - URL of image to upload
 * - imageData?: string - Base64 encoded image data
 * - fileName?: string - Original file name
 *
 * Returns:
 * - imageHash: string - Facebook image hash to use in ad creative
 * - url: string - URL of uploaded image
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request body
    const data = uploadImageSchema.parse(body);

    if (!data.imageUrl && !data.imageData) {
      throw new BadRequestError('Either imageUrl or imageData is required');
    }

    // Get ad account to verify ownership
    const adAccount = await prisma.adAccount.findUnique({
      where: { id: data.adAccountId },
      include: {
        facebookBusinessAccount: {
          select: {
            organizationId: true,
            accessTokenEncrypted: true,
          },
        },
      },
    });

    if (!adAccount) {
      throw new NotFoundError('Ad account');
    }

    // Verify organization ownership
    if (adAccount.facebookBusinessAccount.organizationId !== user.organizationId) {
      throw new BadRequestError('You do not have access to this ad account');
    }

    // Initialize Facebook API
    const facebookAPI = getFacebookAPI(redis);
    facebookAPI.setAccessToken(adAccount.facebookBusinessAccount.accessTokenEncrypted);

    // Upload image to Facebook
    let imageHash: string;
    let imageUrl: string;

    if (data.imageUrl) {
      // Upload from URL
      const result = await uploadImageFromUrl(
        facebookAPI,
        adAccount.accountId,
        data.imageUrl
      );
      imageHash = result.hash;
      imageUrl = result.url;
    } else if (data.imageData) {
      // Upload from base64 data
      const result = await uploadImageFromData(
        facebookAPI,
        adAccount.accountId,
        data.imageData,
        data.fileName || 'image.jpg'
      );
      imageHash = result.hash;
      imageUrl = result.url;
    } else {
      throw new BadRequestError('Invalid upload data');
    }

    return successResponse(
      {
        imageHash,
        url: imageUrl,
        adAccountId: adAccount.accountId,
        uploadedAt: new Date().toISOString(),
      },
      {
        message: 'Image uploaded successfully',
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        new ValidationError('Validation failed', error.errors),
        422
      );
    }

    return errorResponse(error as Error);
  }
}

/**
 * Upload image from URL
 */
async function uploadImageFromUrl(
  facebookAPI: any,
  adAccountId: string,
  imageUrl: string
): Promise<{ hash: string; url: string }> {
  try {
    const sdk = facebookAPI.client.getSdk();
    const AdAccount = sdk.AdAccount;
    const account = new AdAccount(adAccountId);

    const response = await facebookAPI.client.makeRequest(adAccountId, () =>
      account.createAdImage([], {
        url: imageUrl,
      })
    );

    const imageHash = response.images?.[Object.keys(response.images)[0]]?.hash;

    if (!imageHash) {
      throw new Error('Failed to get image hash from Facebook response');
    }

    return {
      hash: imageHash,
      url: imageUrl,
    };
  } catch (error: any) {
    throw new Error(`Failed to upload image from URL: ${error.message}`);
  }
}

/**
 * Upload image from base64 data
 */
async function uploadImageFromData(
  facebookAPI: any,
  adAccountId: string,
  base64Data: string,
  fileName: string
): Promise<{ hash: string; url: string }> {
  try {
    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');

    const sdk = facebookAPI.client.getSdk();
    const AdAccount = sdk.AdAccount;
    const account = new AdAccount(adAccountId);

    const response = await facebookAPI.client.makeRequest(adAccountId, () =>
      account.createAdImage([], {
        bytes: base64Image,
        filename: fileName,
      })
    );

    const imageHash = response.images?.[Object.keys(response.images)[0]]?.hash;
    const imageUrl = response.images?.[Object.keys(response.images)[0]]?.url;

    if (!imageHash) {
      throw new Error('Failed to get image hash from Facebook response');
    }

    return {
      hash: imageHash,
      url: imageUrl || '',
    };
  } catch (error: any) {
    throw new Error(`Failed to upload image from data: ${error.message}`);
  }
}

/**
 * GET /api/ads/upload-image
 * Get uploaded images for an ad account
 *
 * Query params:
 * - adAccountId: string (required)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');

    if (!adAccountId) {
      throw new BadRequestError('adAccountId query parameter is required');
    }

    // Get ad account to verify ownership
    const adAccount = await prisma.adAccount.findUnique({
      where: { id: adAccountId },
      include: {
        facebookBusinessAccount: {
          select: {
            organizationId: true,
            accessTokenEncrypted: true,
          },
        },
      },
    });

    if (!adAccount) {
      throw new NotFoundError('Ad account');
    }

    // Verify organization ownership
    if (adAccount.facebookBusinessAccount.organizationId !== user.organizationId) {
      throw new BadRequestError('You do not have access to this ad account');
    }

    // Initialize Facebook API
    const facebookAPI = getFacebookAPI(redis);
    facebookAPI.setAccessToken(adAccount.facebookBusinessAccount.accessTokenEncrypted);

    // Get ad images from Facebook
    const sdk = facebookAPI.client.getSdk();
    const AdAccount = sdk.AdAccount;
    const account = new AdAccount(adAccount.accountId);

    const response = await facebookAPI.client.makeRequest(adAccount.accountId, () =>
      account.getAdImages(['id', 'hash', 'url', 'created_time', 'name', 'status'], {
        limit: 100,
      })
    );

    const images = (response as any[]).map((image: any) => ({
      id: image.id,
      hash: image.hash,
      url: image.url,
      name: image.name,
      status: image.status,
      createdTime: image.created_time,
    }));

    return successResponse({
      adAccountId: adAccount.accountId,
      images,
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}
