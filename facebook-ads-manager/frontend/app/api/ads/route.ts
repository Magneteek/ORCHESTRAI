import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getAdSetById, createAdInDb } from '@/lib/db/campaigns';
import { createAdSchema, adQuerySchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * GET /api/ads
 * List ads for an ad set, campaign, or ad account
 *
 * Query params:
 * - adAccountId: string (optional - filter by ad account)
 * - campaignId: string (optional - filter by campaign)
 * - adSetId: string (optional - filter by ad set)
 * - search: string (optional - search by name)
 * - status: string (optional - filter by status)
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Validate query parameters (convert null to undefined for Zod)
    const queryParams = adQuerySchema.parse({
      adAccountId: searchParams.get('adAccountId') ?? undefined,
      campaignId: searchParams.get('campaignId') ?? undefined,
      adSetId: searchParams.get('adSetId') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    // Build where clause for Prisma query
    const whereClause: any = {};

    if (queryParams.adSetId) {
      whereClause.adSetId = queryParams.adSetId;
    }

    if (queryParams.campaignId) {
      whereClause.adSet = {
        campaignId: queryParams.campaignId,
      };
    }

    if (queryParams.adAccountId) {
      whereClause.adSet = {
        ...whereClause.adSet,
        campaign: {
          adAccountId: queryParams.adAccountId,
        },
      };
    }

    if (queryParams.search) {
      whereClause.name = {
        contains: queryParams.search,
        mode: 'insensitive',
      };
    }

    if (queryParams.status) {
      whereClause.status = queryParams.status;
    }

    // Add organization check
    whereClause.adSet = {
      ...whereClause.adSet,
      campaign: {
        ...whereClause.adSet?.campaign,
        adAccount: {
          facebookBusinessAccount: {
            organization: {
              users: {
                some: {
                  id: user.id,
                },
              },
            },
          },
        },
      },
    };

    // Get total count
    const total = await prisma.ad.count({ where: whereClause });

    // Get ads with pagination
    const ads = await prisma.ad.findMany({
      where: whereClause,
      include: {
        adSet: {
          select: {
            id: true,
            name: true,
            adSetId: true,
            campaign: {
              select: {
                id: true,
                name: true,
                campaignId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (queryParams.page - 1) * queryParams.limit,
      take: queryParams.limit,
    });

    // Transform ads
    const transformedAds = ads.map(ad => ({
      id: ad.id,
      adId: ad.adId,
      name: ad.name,
      status: ad.status,
      creative: ad.creative,
      templateId: ad.templateId,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt,
      adSet: ad.adSet,
    }));

    return paginatedResponse(transformedAds, {
      page: queryParams.page,
      limit: queryParams.limit,
      total,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        new ValidationError('Invalid query parameters', error.errors),
        422
      );
    }
    return errorResponse(error as Error);
  }
}

/**
 * POST /api/ads
 * Create a new ad with creative
 *
 * Body:
 * - adSetId: string (required) - Database ad set ID
 * - name: string (required)
 * - status: CampaignStatus (default: PAUSED)
 * - creative: {
 *     imageUrl?: string
 *     videoUrl?: string
 *     imageHash?: string
 *     videoId?: string
 *     headline?: string
 *     primaryText?: string
 *     description?: string
 *     callToActionType?: string
 *     linkUrl?: string
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request body
    const data = createAdSchema.parse(body);

    // Get ad set to verify ownership
    const adSet = await getAdSetById(data.adSetId, user.id, user.organizationId);

    if (!adSet) {
      throw new NotFoundError('Ad set');
    }

    // Get campaign and ad account info
    const campaign = await prisma.campaign.findUnique({
      where: { id: adSet.campaignId },
      include: {
        adAccount: {
          include: {
            facebookBusinessAccount: {
              select: {
                accessTokenEncrypted: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    // Decrypt access token
    const accessToken = decrypt(campaign.adAccount.facebookBusinessAccount.accessTokenEncrypted);
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';
    const adAccountNum = campaign.adAccount.accountId.replace(/^act_/, '');

    const format = data.format || 'SINGLE_IMAGE';
    const destType = data.destinationType || 'WEBSITE';
    const cr = data.creative;
    const pageId = data.pageId;
    const pageFallback = `https://www.facebook.com/${pageId}`;

    // Resolve destination link.
    // For WHATSAPP, link_data.link must be a normal URL (Facebook rejects wa.me).
    // WhatsApp routing is handled entirely by the WHATSAPP_MESSAGE CTA type; the
    // number is linked to the Page through Facebook Business Suite.
    const destLink = destType === 'WHATSAPP'
      ? pageFallback
      : cr.linkUrl || pageFallback;

    // Guard: lead form is required for Instant Form destination
    if (destType === 'INSTANT_FORM' && !data.leadFormId) {
      throw new BadRequestError('A lead form is required for Instant Form ads');
    }

    // Build CTA object based on destination type
    function buildCta(): Record<string, any> | null {
      if (destType === 'INSTANT_FORM') {
        // Honour whatever CTA type the user chose; default to SIGN_UP
        const ctaType = cr.callToActionType || 'SIGN_UP';
        return { type: ctaType, value: { lead_gen_form_id: data.leadFormId! } };
      }
      if (destType === 'WHATSAPP') {
        return { type: 'WHATSAPP_MESSAGE', value: { app_destination: 'WHATSAPP' } };
      }
      const c = cr.callToActionType;
      if (!c || c === 'NO_BUTTON') return null;
      return { type: c, value: { link: destLink } };
    }

    // Upload image URL → hash (skips if hash already provided)
    async function resolveHash(imageHash?: string | null, imageUrl?: string | null): Promise<string | null> {
      if (imageHash) return imageHash;
      if (!imageUrl) return null;
      try {
        const params = new URLSearchParams({ url: imageUrl, access_token: accessToken });
        const res = await fetch(
          `https://graph.facebook.com/${apiVersion}/act_${adAccountNum}/adimages`,
          { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() }
        );
        const json = await res.json();
        if (json.images) return json.images[Object.keys(json.images)[0]]?.hash || null;
        return null;
      } catch { return null; }
    }

    const creativePayload: Record<string, any> = { name: `${data.name} Creative` };

    if (format === 'CAROUSEL') {
      const cards = cr.carouselCards || [];
      const childAttachments = await Promise.all(
        cards.map(async (card: any) => {
          const cardLink = card.linkUrl || cr.linkUrl || pageFallback;
          const att: Record<string, any> = {
            name: card.headline || '',
            description: card.description || '',
          };
          // INSTANT_FORM and WHATSAPP don't use a `link` per card — destination is set via CTA
          if (destType === 'WEBSITE') att.link = cardLink;
          const hash = await resolveHash(card.imageHash, card.imageUrl);
          if (hash) att.image_hash = hash;
          else if (card.imageUrl) att.picture = card.imageUrl;
          const cta = buildCta();
          if (cta) {
            // Only inject per-card link for WEBSITE; INSTANT_FORM/WHATSAPP CTAs don't use link
            const ctaValue = destType === 'WEBSITE'
              ? { ...cta.value, link: cardLink }
              : cta.value;
            att.call_to_action = { ...cta, value: ctaValue };
          }
          return att;
        })
      );
      const topCta = buildCta();
      creativePayload.object_story_spec = {
        page_id: pageId,
        link_data: {
          link: destLink,
          message: (cr.primaryTexts || [])[0] || '',
          child_attachments: childAttachments,
          ...(topCta ? { call_to_action: { type: topCta.type } } : {}),
        },
      };
    } else if (format === 'VIDEO') {
      const cta = buildCta();
      creativePayload.object_story_spec = {
        page_id: pageId,
        video_data: {
          video_id: cr.videoId || '',
          message: (cr.primaryTexts || [])[0] || '',
          title: (cr.headlines || [])[0] || '',
          ...(cta ? { call_to_action: cta } : {}),
        },
      };
    } else {
      // SINGLE_IMAGE
      const headlines = (cr.headlines || []).filter(Boolean) as string[];
      const primaryTexts = (cr.primaryTexts || []).filter(Boolean) as string[];
      const descriptions = (cr.descriptions || []).filter(Boolean) as string[];

      // Resolve all images: pre-hashed first, then upload URLs
      const allHashes: string[] = [];
      for (const h of (cr.imageHashes || [])) { if (h) allHashes.push(h); }
      for (const u of (cr.imageUrls || [])) {
        const h = await resolveHash(null, u);
        if (h) allHashes.push(h);
      }
      // Fall back to primary single image fields
      if (!allHashes.length) {
        const h = await resolveHash(cr.imageHash, cr.imageUrl);
        if (h) allHashes.push(h);
      }

      const hasMultipleImages = allHashes.length > 1;
      const hasMultipleTexts = headlines.length > 1 || primaryTexts.length > 1 || descriptions.length > 1;
      const useAssetFeed = hasMultipleImages || hasMultipleTexts;

      if (useAssetFeed) {
        // asset_feed_spec — supports Dynamic Creative for all destination types.
        // CTA structure differs: WEBSITE uses call_to_action_types + link_urls;
        // INSTANT_FORM and WHATSAPP use call_to_actions (object array with value).
        const cta = buildCta();
        const imageAssets = allHashes.map(h => ({ hash: h }));

        // Descriptions are not supported in asset_feed_spec for INSTANT_FORM / WHATSAPP
        // (Facebook rejects them with "Invalid parameter" for lead gen creatives).
        const feedDescriptions = destType === 'WEBSITE' ? descriptions : [];

        const feedSpec: Record<string, any> = {
          ...(headlines.length ? { titles: headlines.map(h => ({ text: h })) } : {}),
          ...(primaryTexts.length ? { bodies: primaryTexts.map(t => ({ text: t })) } : {}),
          ...(feedDescriptions.length ? { descriptions: feedDescriptions.map(d => ({ text: d })) } : {}),
          ...(imageAssets.length ? { images: imageAssets } : {}),
          ad_formats: ['SINGLE_IMAGE'],
        };

        if (destType === 'WEBSITE') {
          // WEBSITE: standard call_to_action_types + link_urls
          if (cta) feedSpec.call_to_action_types = [cta.type];
          if (cr.linkUrl) feedSpec.link_urls = [{ website_url: cr.linkUrl }];
        } else {
          // INSTANT_FORM / WHATSAPP: must use call_to_actions array with value object
          if (cta) feedSpec.call_to_actions = [{ type: cta.type, value: cta.value }];
        }

        creativePayload.object_story_spec = { page_id: pageId };
        creativePayload.asset_feed_spec = feedSpec;
      } else {
        // Single image, single text — use object_story_spec
        const linkData: Record<string, any> = {
          link: destLink,
          message: primaryTexts[0] || '',
        };
        if (headlines[0]) linkData.name = headlines[0];
        if (descriptions[0]) linkData.description = descriptions[0];
        if (allHashes[0]) linkData.image_hash = allHashes[0];
        else if (cr.imageUrl) linkData.picture = cr.imageUrl;
        const cta = buildCta();
        if (cta) linkData.call_to_action = cta;
        creativePayload.object_story_spec = { page_id: pageId, link_data: linkData };
      }
    }

    const creativeRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/act_${adAccountNum}/adcreatives`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creativePayload, access_token: accessToken }),
      }
    );
    const creativeJson = await creativeRes.json();
    if (creativeJson.error) {
      const fb = creativeJson.error;
      const detail = fb.error_user_msg || fb.error_data || '';
      throw new Error(`Creative error: ${fb.message}${detail ? ` — ${detail}` : ''} (subcode ${fb.error_subcode ?? fb.code})`);
    }
    const creativeId: string = creativeJson.id;

    // Create the ad
    const adPayload: Record<string, any> = {
      name: data.name,
      adset_id: adSet.adSetId,
      status: data.status || 'PAUSED',
      creative: { creative_id: creativeId },
    };
    if (data.urlTags) adPayload.url_tags = data.urlTags;

    const fbRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/act_${campaign.adAccount.accountId.replace(/^act_/, '')}/ads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adPayload, access_token: accessToken }),
      }
    );
    const fbJson = await fbRes.json();

    if (fbJson.error) {
      throw new Error(fbJson.error.message || 'Facebook API error');
    }

    // Save ad to database
    const ad = await createAdInDb({
      adSetId: adSet.id,
      adId: fbJson.id,
      name: data.name,
      status: data.status || 'PAUSED',
      creative: data.creative,
    });

    // Invalidate cache
    await redis.del(`campaign:${campaign.campaignId}`);

    return createdResponse(
      {
        id: ad.id,
        adId: ad.adId,
        name: ad.name,
        status: ad.status,
        creative: ad.creative,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
      },
      'Ad created successfully'
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
