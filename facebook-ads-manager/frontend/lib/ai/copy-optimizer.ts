/**
 * Copy Optimizer - AI-powered ad copy suggestions and A/B testing recommendations
 */

import { callClaude, parseClaudeJson } from './client';
import {
  CopyOptimization,
  CopyOptimizationSchema,
  CopyOptimizationRequest,
} from './types';
import { prisma } from '@/lib/db/prisma';
import { addDays } from 'date-fns';

const SYSTEM_PROMPT = `You are an expert Facebook Ads copywriter with deep knowledge of direct response marketing, conversion optimization, and A/B testing strategies.

Your task is to analyze ad copy and provide specific, actionable suggestions for improvement.

Consider these factors:
- Headline hook strength and curiosity gap
- Benefit clarity and value proposition
- Emotional triggers and pain points
- Call-to-action effectiveness
- Length optimization for platform
- Audience psychographics and messaging fit
- Competitive differentiation

When you propose variants, make them genuinely different from each other — vary
the angle, the opening hook and the sentence rhythm, not just a few words. Two
variants that differ only in wording test nothing. This call previously relied
on a high sampling temperature for that variety; current models do not accept
sampling parameters, so the variety has to be asked for here.

CRITICAL: Respond ONLY with valid JSON matching this exact structure:
{
  "analysis": {
    "currentPerformance": {
      "ctr": number,
      "engagement": "low|medium|high",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"]
    }
  },
  "suggestions": [
    {
      "type": "headline|primaryText|description|callToAction",
      "original": "original text",
      "alternatives": [
        {
          "text": "alternative copy",
          "reasoning": "why this works better",
          "predictedCtrImprovement": number (percentage)
        }
      ]
    }
  ],
  "abTestRecommendations": [
    {
      "variant": "variant name",
      "hypothesis": "what we're testing",
      "expectedLift": "expected improvement"
    }
  ],
  "summary": "brief summary"
}`;

/**
 * Generate copy optimization suggestions
 */
export async function optimizeAdCopy(
  request: CopyOptimizationRequest
): Promise<CopyOptimization> {
  const { adAccountId, adCopy, campaignObjective, targetAudience } = request;

  // Check cache first
  const cachedOptimization = await getCachedOptimization(adAccountId, adCopy.headline);
  if (cachedOptimization) {
    return cachedOptimization;
  }

  const userPrompt = `Analyze this Facebook ad copy and provide optimization suggestions:

CURRENT AD COPY:
Headline: "${adCopy.headline}"
Primary Text: "${adCopy.primaryText}"
${adCopy.description ? `Description: "${adCopy.description}"` : ''}
Call-to-Action: "${adCopy.callToAction}"

PERFORMANCE DATA:
- CTR: ${(adCopy.performance.ctr * 100).toFixed(2)}%
- Impressions: ${(adCopy.performance.impressions ?? 0).toLocaleString()}
- Clicks: ${(adCopy.performance.clicks ?? 0).toLocaleString()}

CAMPAIGN CONTEXT:
- Objective: ${campaignObjective}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}

Provide specific copy improvements that:
1. Increase click-through rate
2. Better align with campaign objective
3. Resonate with target audience psychographics
4. Include emotional triggers and benefit clarity
5. Optimize call-to-action effectiveness

For each suggestion:
- Explain why it will perform better
- Provide 2-3 alternative variations
- Estimate CTR improvement potential
- Consider A/B testing opportunities`;

  const { content } = await callClaude(
    SYSTEM_PROMPT,
    userPrompt,
    'copy_optimization',
    // Variety here used to come from temperature 0.8; on current models it has
    // to be asked for in the prompt instead (see the variation instruction above).
    { maxTokens: 16000 }
  );

  // Parse and validate response
  const optimization = CopyOptimizationSchema.parse(parseClaudeJson(content));

  // Cache the optimization (7 day TTL)
  await cacheOptimization(adAccountId, adCopy.headline, optimization);

  // Store in database
  await storeOptimizationAnalysis(adAccountId, optimization);

  return optimization;
}

/**
 * Get cached optimization if available
 */
async function getCachedOptimization(
  adAccountId: string,
  headline: string
): Promise<CopyOptimization | null> {
  const cacheKey = generateCacheKey(headline);

  // TODO: Add metadata field to AIAnalysis model for caching
  // For now, disable caching
  return null;
}

/**
 * Cache optimization results
 */
async function cacheOptimization(
  adAccountId: string,
  headline: string,
  optimization: CopyOptimization
): Promise<void> {
  const validUntil = addDays(new Date(), 7); // 7 day cache

  // TODO: Add metadata field to AIAnalysis model for proper caching with cache keys
  await prisma.aiAnalysis.create({
    data: {
      adAccountId,
      analysisType: 'copy_optimization',
      insights: optimization as any,
      recommendations: optimization.suggestions.flatMap(s =>
        s.alternatives.map(a => a.text)
      ) as any,
      confidence: 0.8,
      validUntil,
    },
  });
}

/**
 * Generate cache key for copy
 */
function generateCacheKey(text: string): string {
  // Simple hash function for cache key
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `copy_${Math.abs(hash)}`;
}

/**
 * Store optimization analysis
 */
async function storeOptimizationAnalysis(
  adAccountId: string,
  optimization: CopyOptimization
): Promise<void> {
  console.log(`Copy optimization generated for account ${adAccountId}:`, {
    suggestions: optimization.suggestions.length,
    abTests: optimization.abTestRecommendations.length,
    engagement: optimization.analysis.currentPerformance.engagement,
  });
}

/**
 * Optimize multiple ad copies in batch
 */
export async function optimizeCopiesBatch(
  requests: CopyOptimizationRequest[]
): Promise<Map<string, CopyOptimization>> {
  const results = new Map<string, CopyOptimization>();

  // Process in batches with rate limiting
  const batchSize = 3;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async req => {
        try {
          const result = await optimizeAdCopy(req);
          return { headline: req.adCopy.headline, result };
        } catch (error) {
          console.error(`Copy optimization failed for ${req.adCopy.headline}:`, error);
          return null;
        }
      })
    );

    batchResults.forEach(item => {
      if (item) {
        results.set(item.headline, item.result);
      }
    });

    // Rate limiting delay
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  return results;
}

/**
 * Generate A/B test variants from copy suggestions
 */
export async function generateABTestVariants(
  originalCopy: string,
  optimization: CopyOptimization,
  variantCount: number = 3
): Promise<Array<{ variant: string; hypothesis: string; text: string }>> {
  const variants: Array<{ variant: string; hypothesis: string; text: string }> = [];

  // Get top suggestions
  const topSuggestions = optimization.suggestions
    .flatMap(s => s.alternatives)
    .sort((a, b) => b.predictedCtrImprovement - a.predictedCtrImprovement)
    .slice(0, variantCount);

  topSuggestions.forEach((suggestion, index) => {
    variants.push({
      variant: `Variant ${String.fromCharCode(65 + index)}`, // A, B, C...
      hypothesis: suggestion.reasoning,
      text: suggestion.text,
    });
  });

  return variants;
}

/**
 * Analyze A/B test results
 */
export async function analyzeABTestResults(
  testResults: Array<{
    variant: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  }>
): Promise<{
  winner: string;
  confidenceLevel: number;
  insights: string[];
}> {
  // Calculate CTR and conversion rate for each variant
  const variantsWithMetrics = testResults.map(v => ({
    ...v,
    ctr: v.clicks / v.impressions,
    conversionRate: v.conversions / v.clicks,
    cpa: v.spend / v.conversions,
  }));

  // Find winner (highest CTR with statistical significance)
  const winner = variantsWithMetrics.reduce((best, current) => {
    return current.ctr > best.ctr ? current : best;
  });

  // Calculate confidence level (simplified chi-square test)
  const controlVariant = variantsWithMetrics[0];
  const zScore = calculateZScore(
    winner.ctr,
    controlVariant.ctr,
    winner.impressions,
    controlVariant.impressions
  );
  const confidenceLevel = getConfidenceLevel(zScore);

  const insights = [
    `Winner: ${winner.variant} with ${(winner.ctr * 100).toFixed(2)}% CTR`,
    `${((winner.ctr / controlVariant.ctr - 1) * 100).toFixed(1)}% improvement over control`,
    `Statistical confidence: ${(confidenceLevel * 100).toFixed(1)}%`,
    winner.conversionRate > controlVariant.conversionRate
      ? 'Also shows improved conversion rate'
      : 'Note: CTR improved but monitor conversion rate',
  ];

  return {
    winner: winner.variant,
    confidenceLevel,
    insights,
  };
}

/**
 * Calculate Z-score for statistical significance
 */
function calculateZScore(
  p1: number,
  p2: number,
  n1: number,
  n2: number
): number {
  const pPooled = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
  const se = Math.sqrt(pPooled * (1 - pPooled) * ((1 / n1) + (1 / n2)));
  return (p1 - p2) / se;
}

/**
 * Convert Z-score to confidence level
 */
function getConfidenceLevel(zScore: number): number {
  const absZ = Math.abs(zScore);
  if (absZ >= 2.576) return 0.99; // 99% confidence
  if (absZ >= 1.96) return 0.95;  // 95% confidence
  if (absZ >= 1.645) return 0.90; // 90% confidence
  return 0.5 + (absZ / 3.29) * 0.4; // Approximate for lower values
}
