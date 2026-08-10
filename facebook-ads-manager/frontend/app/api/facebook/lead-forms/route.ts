import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';

async function resolveAdAccount(adAccountId: string, userId: string, orgId: string) {
  const adAccount = await prisma.adAccount.findUnique({
    where: { id: adAccountId },
    include: {
      facebookBusinessAccount: {
        select: { accessTokenEncrypted: true, organizationId: true },
      },
    },
  });
  if (!adAccount) throw new NotFoundError('Ad account');
  if (adAccount.facebookBusinessAccount.organizationId !== orgId) throw new NotFoundError('Ad account');
  return {
    accessToken: decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted),
    accountId: adAccount.accountId.replace(/^act_/, ''),
  };
}

/**
 * GET /api/facebook/lead-forms?adAccountId=...&pageId=...
 * List lead gen forms for a Facebook Page
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');
    const pageId = searchParams.get('pageId');

    if (!adAccountId) throw new BadRequestError('adAccountId is required');
    if (!pageId) throw new BadRequestError('pageId is required');

    const { accessToken: adAccountToken } = await resolveAdAccount(adAccountId, user.id, user.organizationId);
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';

    // leadgen_forms requires a page token with leads_retrieval or pages_manage_ads permission.
    let accessToken = adAccountToken;
    try {
      const ptRes = await fetch(
        `https://graph.facebook.com/${apiVersion}/${pageId}?fields=access_token&access_token=${adAccountToken}`
      );
      const ptJson = await ptRes.json();
      if (ptJson.access_token) accessToken = ptJson.access_token;
    } catch { /* fall back to ad account token */ }

    const res = await fetch(
      `https://graph.facebook.com/${apiVersion}/${pageId}/leadgen_forms?fields=id,name,status,created_time,leads_count&limit=50&access_token=${accessToken}`
    );
    const json = await res.json();

    if (json.error) throw new Error(json.error.message);

    return successResponse(json.data || []);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * POST /api/facebook/lead-forms
 * Create a new lead gen form on a Facebook Page
 *
 * Body:
 *   adAccountId, pageId, name, privacyPolicyUrl,
 *   questions: string[]   ("EMAIL" | "FULL_NAME" | "PHONE" | "COMPANY_NAME" | "JOB_TITLE" | custom label)
 *   thankYouTitle?, thankYouBody?, thankYouButtonText?, thankYouWebsiteUrl?
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { adAccountId, pageId, name, privacyPolicyUrl, questions = [], thankYouTitle, thankYouBody, thankYouButtonText, thankYouWebsiteUrl } = body;

    if (!adAccountId) throw new BadRequestError('adAccountId is required');
    if (!pageId) throw new BadRequestError('pageId is required');
    if (!name) throw new BadRequestError('Form name is required');
    if (!privacyPolicyUrl) throw new BadRequestError('Privacy policy URL is required');
    if (!questions.length) throw new BadRequestError('At least one question is required');

    const { accessToken: adAccountToken } = await resolveAdAccount(adAccountId, user.id, user.organizationId);
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';

    // Facebook requires a page access token (not an ad account token) to create lead forms.
    // Exchange by fetching the page's own token using the stored token.
    let accessToken = adAccountToken;
    try {
      const ptRes = await fetch(
        `https://graph.facebook.com/${apiVersion}/${pageId}?fields=access_token&access_token=${adAccountToken}`
      );
      const ptJson = await ptRes.json();
      if (ptJson.error) {
        // System user tokens can't exchange — fall back and let Facebook return the real error
        console.warn('Page token exchange failed (will retry with ad account token):', ptJson.error.message);
      } else if (ptJson.access_token) {
        accessToken = ptJson.access_token;
      }
    } catch { /* network error — fall back to ad account token */ }

    // Standard question types vs custom
    const STANDARD_TYPES = new Set([
      'EMAIL', 'FULL_NAME', 'FIRST_NAME', 'LAST_NAME', 'PHONE',
      'COMPANY_NAME', 'JOB_TITLE', 'WORK_EMAIL',
      'CITY', 'STATE', 'ZIP_CODE', 'COUNTRY', 'DATE_OF_BIRTH',
    ]);

    const formQuestions = (questions as string[]).map((q: string) => {
      if (STANDARD_TYPES.has(q)) return { type: q };
      // Treat as custom question label
      return { type: 'CUSTOM', key: q.toLowerCase().replace(/\s+/g, '_'), label: q };
    });

    const formPayload: Record<string, any> = {
      name,
      questions: formQuestions,
      privacy_policy: { url: privacyPolicyUrl },
    };

    if (thankYouTitle || thankYouBody) {
      formPayload.thank_you_page = {
        title: thankYouTitle || 'Thank you!',
        body: thankYouBody || "We'll be in touch.",
        ...(thankYouButtonText ? { button_text: thankYouButtonText } : {}),
        ...(thankYouWebsiteUrl ? { website_url: thankYouWebsiteUrl } : {}),
      };
    }

    const res = await fetch(
      `https://graph.facebook.com/${apiVersion}/${pageId}/leadgen_forms`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formPayload, access_token: accessToken }),
      }
    );
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);

    return createdResponse({ id: json.id, name }, 'Lead form created successfully');
  } catch (error) {
    return errorResponse(error as Error);
  }
}
