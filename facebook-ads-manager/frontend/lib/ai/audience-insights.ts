/**
 * Audience Insights - AI-powered audience analysis and targeting recommendations
 */

import { callClaude, parseClaudeJson } from './client';
import {
  AudienceInsights,
  AudienceInsightsSchema,
  AudienceInsightsRequest,
} from './types';
import { prisma } from '@/lib/db/prisma';
import { addDays } from 'date-fns';

const SYSTEM_PROMPT = `You are an expert Facebook Ads audience strategist with deep knowledge of demographics, psychographics, and targeting optimization.

Your task is to analyze audience performance data and provide actionable insights for targeting improvements.

Consider these factors:
- Segment performance patterns and ROAS efficiency
- Cross-segment insights and opportunities
- Demographic and geographic optimization
- Device and placement preferences
- Audience expansion strategies
- Budget allocation recommendations

CRITICAL: Respond ONLY with valid JSON matching this exact structure:
{
  "topPerformingSegments": [
    {
      "segment": "segment name",
      "type": "age|gender|location|device|placement",
      "spend": number,
      "roas": number (omit on lead-generation accounts),
      "conversions": number,
      "cpa": number (cost per conversion; give this instead of roas on lead-gen),
      "insight": "why this segment performs well"
    }
  ],
  "underperformingSegments": [
    {
      "segment": "segment name",
      "type": "age|gender|location|device|placement",
      "spend": number,
      "roas": number (omit on lead-generation accounts),
      "conversions": number,
      "cpa": number (omit where the segment produced no conversions),
      "issue": "what's wrong",
      "recommendation": "how to fix it"
    }
  ],
  "expansionOpportunities": [
    {
      "opportunity": "opportunity name",
      "segment": "target segment",
      "reasoning": "why this will work",
      "expectedRoas": number (omit on lead-generation accounts),
      "expectedCpa": number (expected cost per lead; give this instead on lead-gen),
      "riskLevel": "low|medium|high"
    }
  ],
  "targetingRecommendations": [
    {
      "action": "specific action",
      "impact": "low|medium|high",
      "description": "detailed explanation"
    }
  ],
  "summary": "brief summary"
}

Never invent a stand-in figure for a metric the account does not produce. If
there is no purchase revenue, omit roas entirely rather than filling it with a
score, an index or a placeholder and explaining the substitution in prose.`;

/**
 * Generate audience insights and recommendations
 */
export async function analyzeAudience(
  request: AudienceInsightsRequest
): Promise<AudienceInsights> {
  const { adAccountId, audienceData, performanceBySegment, campaignObjective, currency = 'USD' } = request;

  // Check cache first
  const cachedInsights = await getCachedInsights(adAccountId);
  if (cachedInsights) {
    return cachedInsights;
  }

  // Prepare audience analysis
  // Report in the account's own currency; hardcoded "$" narrated dollars
  // against euro accounts, the same defect fixed in the predictor.
  const money = (n: number) => `${currency} ${(n ?? 0).toFixed(2)}`;

  // A lead-gen account records conversions but no purchase revenue, so every
  // segment's ROAS is zero by construction. Told to rank on ROAS anyway, the
  // model either calls tracking broken or substitutes an invented index.
  const isLeadGen = isLeadGenSegments(performanceBySegment);
  const analysisContext = prepareAudienceContext(
    audienceData,
    performanceBySegment,
    money,
    isLeadGen
  );

  const objectiveNote = isLeadGen
    ? `\nIMPORTANT: this is a lead-generation account. It records conversions and ` +
      `no purchase revenue, so ROAS is zero by definition — that is expected, NOT a ` +
      `tracking failure. Rank and judge every segment on cost per lead and lead ` +
      `volume. Omit the roas and expectedRoas fields entirely and give cpa and ` +
      `expectedCpa instead. Do not recommend fixing revenue attribution.\n`
    : '';

  const userPrompt = `Analyze this audience performance data and provide targeting insights:

DEMOGRAPHIC DATA:
${JSON.stringify(audienceData.demographics, null, 2)}

GEOGRAPHIC DATA:
${JSON.stringify(audienceData.geographic, null, 2)}

DEVICE BREAKDOWN:
${JSON.stringify(audienceData.device, null, 2)}

PLACEMENT PERFORMANCE:
${JSON.stringify(audienceData.placement, null, 2)}

PERFORMANCE BY SEGMENT:
${JSON.stringify(performanceBySegment, null, 2)}

CAMPAIGN OBJECTIVE: ${campaignObjective}
${objectiveNote}
ANALYSIS CONTEXT:
${analysisContext}

Provide insights on:
1. Top performing segments to scale
2. Underperforming segments to optimize or pause
3. Expansion opportunities (lookalike audiences, new demographics)
4. Budget reallocation recommendations
5. Targeting refinements for better ${isLeadGen ? 'cost per lead' : 'ROAS'}

Consider both current performance and growth potential.`;

  const { content } = await callClaude(
    SYSTEM_PROMPT,
    userPrompt,
    'audience_insights',
    { maxTokens: 16000 }
  );

  // Parse and validate response
  const insights = AudienceInsightsSchema.parse(parseClaudeJson(content));

  // Cache the insights (48 hour TTL)
  await cacheInsights(adAccountId, insights);

  // Store in database
  await storeAudienceAnalysis(adAccountId, insights);

  return insights;
}

/**
 * Does this account's segment data describe lead generation rather than sales?
 *
 * Spend and conversions with no revenue anywhere is the signature: ROAS is
 * zero for every segment because there is nothing to divide, not because
 * tracking failed.
 */
export function isLeadGenSegments(performanceBySegment: Record<string, any>): boolean {
  const segments = Object.values(performanceBySegment);
  if (segments.length === 0) return false;

  const conversions = segments.reduce((sum, p) => sum + (p.conversions || 0), 0);
  const revenue = segments.reduce(
    (sum, p) => sum + (p.revenue ?? (p.roas || 0) * (p.spend || 0)),
    0
  );

  return conversions > 0 && revenue === 0;
}

/**
 * Prepare audience context for analysis
 */
function prepareAudienceContext(
  audienceData: any,
  performanceBySegment: Record<string, any>,
  money: (n: number) => string,
  isLeadGen = false
): string {
  const segments = Object.entries(performanceBySegment);

  if (segments.length === 0) {
    return 'No segment performance data available';
  }

  // Calculate aggregate statistics
  const totalSpend = segments.reduce((sum, [_, perf]) => sum + (perf.spend || 0), 0);
  const totalConversions = segments.reduce((sum, [_, perf]) => sum + (perf.conversions || 0), 0);

  // Efficiency is cost per lead where there is no revenue, ROAS where there is.
  // Both are computed from summed totals, never as an average of per-segment
  // ratios, which would weight a EUR 3 segment the same as a EUR 300 one.
  const cpa = (perf: any) =>
    perf.conversions > 0 ? perf.spend / perf.conversions : Infinity;
  const blendedCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const avgRoas =
    totalSpend > 0
      ? segments.reduce((sum, [_, p]) => sum + (p.roas || 0) * (p.spend || 0), 0) / totalSpend
      : 0;

  // Rank on whichever metric means something. Sorting by an all-zero ROAS made
  // "best" and "worst" whatever order the map happened to produce.
  const ranked = [...segments].sort((a, b) =>
    isLeadGen ? cpa(a[1]) - cpa(b[1]) : (b[1].roas || 0) - (a[1].roas || 0)
  );
  const topPerformer = ranked[0];
  const worstPerformer = ranked[ranked.length - 1];

  const describe = ([name, perf]: [string, any]) =>
    isLeadGen
      ? `- Segment: ${name}\n- Conversions: ${perf.conversions || 0}\n` +
        `- Cost per Lead: ${perf.conversions > 0 ? money(cpa(perf)) : 'no leads'}\n` +
        `- Spend: ${money(perf.spend)}`
      : `- Segment: ${name}\n- ROAS: ${(perf.roas || 0).toFixed(2)}x\n` +
        `- Spend: ${money(perf.spend)}`;

  const headline = isLeadGen
    ? `- Total Conversions: ${totalConversions}\n- Blended Cost per Lead: ${money(blendedCpa)}`
    : `- Average ROAS: ${avgRoas.toFixed(2)}x`;

  const betterThanBlended = isLeadGen
    ? segments.filter(([_, p]) => p.conversions > 0 && cpa(p) < blendedCpa).length
    : segments.filter(([_, p]) => (p.roas || 0) > avgRoas).length;

  return `
Aggregate Statistics:
- Total Spend: ${money(totalSpend)}
${headline}
- Segment Count: ${segments.length}

Best Performer:
${describe(topPerformer)}

Worst Performer:
${describe(worstPerformer)}

Performance Distribution: ${betterThanBlended}/${segments.length} segments better than the ${
    isLeadGen ? 'blended cost per lead' : 'average ROAS'
  }
`;
}

/**
 * Get cached insights if available
 */
async function getCachedInsights(
  adAccountId: string
): Promise<AudienceInsights | null> {
  const cached = await prisma.aiAnalysis.findFirst({
    where: {
      adAccountId,
      analysisType: 'audience_insights',
      validUntil: {
        gte: new Date(),
      },
    },
    orderBy: {
      analyzedAt: 'desc',
    },
  });

  if (!cached) return null;

  try {
    return AudienceInsightsSchema.parse(cached.insights);
  } catch (error) {
    console.error('Failed to parse cached insights:', error);
    return null;
  }
}

/**
 * Cache audience insights
 */
async function cacheInsights(
  adAccountId: string,
  insights: AudienceInsights
): Promise<void> {
  const validUntil = addDays(new Date(), 2); // 48 hour cache

  await prisma.aiAnalysis.create({
    data: {
      adAccountId,
      analysisType: 'audience_insights',
      insights: insights as any,
      recommendations: insights.targetingRecommendations.map(r => r.action) as any,
      confidence: 0.85,
      validUntil,
    },
  });
}

/**
 * Store audience analysis
 */
async function storeAudienceAnalysis(
  adAccountId: string,
  insights: AudienceInsights
): Promise<void> {
  console.log(`Audience insights generated for account ${adAccountId}:`, {
    topSegments: insights.topPerformingSegments.length,
    underperformingSegments: insights.underperformingSegments.length,
    expansionOpportunities: insights.expansionOpportunities.length,
  });
}

/**
 * Calculate segment performance score
 */
export function calculateSegmentScore(
  spend: number,
  roas: number,
  conversions: number,
  weights: { spend: number; roas: number; conversions: number } = { spend: 0.3, roas: 0.5, conversions: 0.2 }
): number {
  // Normalize metrics to 0-100 scale
  const normalizedSpend = Math.min(spend / 1000, 100); // Cap at $1000
  const normalizedRoas = Math.min(roas * 20, 100); // 5x ROAS = 100
  const normalizedConversions = Math.min(conversions / 10, 100); // 10 conversions = 100

  // Calculate weighted score
  const score =
    normalizedSpend * weights.spend +
    normalizedRoas * weights.roas +
    normalizedConversions * weights.conversions;

  return Math.min(score, 100);
}

/**
 * Generate lookalike audience recommendations
 */
export async function generateLookalikeRecommendations(
  topSegments: Array<{ segment: string; roas?: number; conversions: number; cpa?: number }>,
  campaignObjective: string
): Promise<Array<{ name: string; source: string; size: string; reasoning: string }>> {
  const recommendations: Array<{ name: string; source: string; size: string; reasoning: string }> = [];

  // High-value converter lookalike. The ROAS > 3 test can never pass on a
  // lead-gen account, where ROAS is zero everywhere, so volume alone qualifies
  // a segment there — a seed audience needs converters, not revenue.
  const hasRevenue = topSegments.some(s => (s.roas ?? 0) > 0);
  if (topSegments.some(s => s.conversions > 50 && (hasRevenue ? (s.roas ?? 0) > 3 : true))) {
    recommendations.push({
      name: 'High-Value Converter Lookalike',
      source: 'Top converting customers (90 days)',
      size: '1% (Narrow)',
      reasoning: 'Target similar users to your best converters for maximum ROAS',
    });
  }

  // Engagement-based lookalike for awareness campaigns
  if (campaignObjective.includes('AWARENESS') || campaignObjective.includes('ENGAGEMENT')) {
    recommendations.push({
      name: 'Engaged Audience Lookalike',
      source: 'Page engagers (180 days)',
      size: '3-5% (Broader)',
      reasoning: 'Expand reach to similar users for awareness goals',
    });
  }

  // Geographic expansion
  const topGeoSegments = topSegments.filter(s => s.segment.length === 2); // Country codes
  if (topGeoSegments.length > 0) {
    recommendations.push({
      name: 'Geographic Expansion Lookalike',
      source: `Converters from ${topGeoSegments[0].segment}`,
      size: '1-3% (Adjacent markets)',
      reasoning: 'Expand to similar demographics in new geographic markets',
    });
  }

  return recommendations;
}

/**
 * Analyze budget allocation efficiency
 */
export async function analyzeBudgetAllocation(
  segmentPerformance: Record<string, { spend: number; roas: number; conversions: number }>
): Promise<{
  currentAllocation: Record<string, number>;
  recommendedAllocation: Record<string, number>;
  projectedRoasIncrease: number;
}> {
  const segments = Object.entries(segmentPerformance);
  const totalSpend = segments.reduce((sum, [_, p]) => sum + p.spend, 0);

  // Current allocation (percentage of spend)
  const currentAllocation: Record<string, number> = {};
  segments.forEach(([segment, perf]) => {
    currentAllocation[segment] = (perf.spend / totalSpend) * 100;
  });

  // Calculate optimal allocation based on ROAS and conversions
  const segmentScores = segments.map(([segment, perf]) => ({
    segment,
    score: calculateSegmentScore(perf.spend, perf.roas, perf.conversions),
    roas: perf.roas,
  }));

  const totalScore = segmentScores.reduce((sum, s) => sum + s.score, 0);

  // Recommended allocation (weighted by performance score)
  const recommendedAllocation: Record<string, number> = {};
  segmentScores.forEach(({ segment, score }) => {
    recommendedAllocation[segment] = (score / totalScore) * 100;
  });

  // Project ROAS increase
  const currentAvgRoas = segments.reduce((sum, [_, p]) => sum + (p.roas * p.spend), 0) / totalSpend;
  const projectedAvgRoas = segmentScores.reduce((sum, s) => {
    const recommendedSpend = (recommendedAllocation[s.segment] / 100) * totalSpend;
    return sum + (s.roas * recommendedSpend);
  }, 0) / totalSpend;

  // On a lead-gen account every ROAS is zero, so this divides 0 by 0 and ships
  // NaN, which JSON renders as null. There is no ROAS improvement to project
  // when there is no ROAS; report zero rather than a non-number.
  const projectedRoasIncrease =
    currentAvgRoas > 0 ? ((projectedAvgRoas - currentAvgRoas) / currentAvgRoas) * 100 : 0;

  return {
    currentAllocation,
    recommendedAllocation,
    projectedRoasIncrease,
  };
}

/**
 * Detect audience fatigue
 */
export async function detectAudienceFatigue(
  historicalPerformance: Array<{ date: string; ctr: number; cpm: number; frequency: number }>
): Promise<{
  isFatigued: boolean;
  fatigueLevel: 'none' | 'low' | 'medium' | 'high';
  indicators: string[];
  recommendations: string[];
}> {
  if (historicalPerformance.length < 7) {
    return {
      isFatigued: false,
      fatigueLevel: 'none',
      indicators: ['Insufficient data for fatigue analysis'],
      recommendations: [],
    };
  }

  const recent = historicalPerformance.slice(-7);
  const older = historicalPerformance.slice(0, 7);

  const avgRecentCtr = recent.reduce((sum, d) => sum + d.ctr, 0) / recent.length;
  const avgOlderCtr = older.reduce((sum, d) => sum + d.ctr, 0) / older.length;
  const ctrDecline = ((avgOlderCtr - avgRecentCtr) / avgOlderCtr) * 100;

  const avgRecentCpm = recent.reduce((sum, d) => sum + d.cpm, 0) / recent.length;
  const avgOlderCpm = older.reduce((sum, d) => sum + d.cpm, 0) / older.length;
  const cpmIncrease = ((avgRecentCpm - avgOlderCpm) / avgOlderCpm) * 100;

  const avgFrequency = recent.reduce((sum, d) => sum + d.frequency, 0) / recent.length;

  const indicators: string[] = [];
  const recommendations: string[] = [];
  let fatigueLevel: 'none' | 'low' | 'medium' | 'high' = 'none';

  // Check indicators
  if (ctrDecline > 20) {
    indicators.push(`CTR declined ${ctrDecline.toFixed(1)}% in last 7 days`);
  }

  if (cpmIncrease > 15) {
    indicators.push(`CPM increased ${cpmIncrease.toFixed(1)}%`);
  }

  if (avgFrequency > 3) {
    indicators.push(`High frequency: ${avgFrequency.toFixed(1)} impressions per user`);
  }

  // Determine fatigue level
  if (indicators.length === 0) {
    fatigueLevel = 'none';
  } else if (indicators.length === 1 || ctrDecline < 15) {
    fatigueLevel = 'low';
    recommendations.push('Monitor performance closely');
    recommendations.push('Consider refreshing ad creative');
  } else if (indicators.length === 2 || ctrDecline < 30) {
    fatigueLevel = 'medium';
    recommendations.push('Refresh ad creative immediately');
    recommendations.push('Expand audience targeting');
    recommendations.push('Consider frequency capping');
  } else {
    fatigueLevel = 'high';
    recommendations.push('URGENT: Pause campaign and refresh creative');
    recommendations.push('Create new lookalike audiences');
    recommendations.push('Test different audience segments');
    recommendations.push('Implement strict frequency capping (max 2-3)');
  }

  return {
    isFatigued: fatigueLevel !== 'none',
    fatigueLevel,
    indicators,
    recommendations,
  };
}
