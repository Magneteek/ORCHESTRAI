/**
 * Performance Predictor - ROAS and CTR predictions using Claude
 */

import { callClaude, parseClaudeJson } from './client';
import {
  PerformancePrediction,
  PerformancePredictionSchema,
  PerformancePredictionRequest,
} from './types';
import { prisma } from '@/lib/db/prisma';
import { addDays, format } from 'date-fns';

const SYSTEM_PROMPT = `You are an expert Facebook Ads performance analyst with deep knowledge of advertising metrics, seasonality, and optimization strategies.

Your task is to analyze historical campaign performance data and predict future performance with high accuracy.

Consider these factors in your analysis:
- Trend patterns and momentum
- Day-of-week seasonality
- Budget changes and their impact
- Campaign objectives and optimization goals
- Historical performance consistency
- External factors (holidays, market conditions)

CRITICAL: Respond ONLY with valid JSON matching this exact structure:
{
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "spend": number,
      "roas": number,
      "ctr": number,
      "impressions": number,
      "clicks": number
    }
  ],
  "confidence": number (0-1),
  "factors": ["factor1", "factor2"],
  "recommendations": [
    {
      "action": "specific action",
      "impact": "low|medium|high",
      "description": "detailed description"
    }
  ],
  "summary": "brief summary"
}`;

/**
 * Generate performance predictions for the next N days
 */
export async function predictPerformance(
  request: PerformancePredictionRequest
): Promise<PerformancePrediction> {
  const { adAccountId, historicalData, campaignContext, predictionDays = 7 } = request;

  // Check cache first
  const cachedPrediction = await getCachedPrediction(adAccountId, predictionDays);
  if (cachedPrediction) {
    return cachedPrediction;
  }

  // Prepare analysis context
  const dataContext = prepareDataContext(historicalData, campaignContext);

  const userPrompt = `Analyze this campaign's performance and predict the next ${predictionDays} days:

HISTORICAL DATA (Last 30 days):
${JSON.stringify(historicalData, null, 2)}

CAMPAIGN CONTEXT:
- Objective: ${campaignContext.objective}
- Daily Budget: ${campaignContext.dailyBudget ? `$${campaignContext.dailyBudget}` : 'Not set'}
- Lifetime Budget: ${campaignContext.lifetimeBudget ? `$${campaignContext.lifetimeBudget}` : 'Not set'}
- Status: ${campaignContext.status}
- Start Date: ${campaignContext.startDate}

ANALYSIS INSIGHTS:
${dataContext}

Provide detailed predictions for each of the next ${predictionDays} days, considering:
1. Recent trend momentum
2. Day-of-week patterns
3. Budget pacing
4. Seasonal factors

Include actionable recommendations for optimization.`;

  const { content } = await callClaude(
    SYSTEM_PROMPT,
    userPrompt,
    'performance_prediction',
    { maxTokens: 4096, temperature: 0.3 }
  );

  // Parse and validate response
  const prediction = PerformancePredictionSchema.parse(parseClaudeJson(content));

  // Cache the prediction (24 hour TTL)
  await cachePrediction(adAccountId, prediction, predictionDays);

  // Store in database
  await storePredictionAnalysis(adAccountId, prediction);

  return prediction;
}

/**
 * Prepare data context for Claude analysis
 */
function prepareDataContext(
  historicalData: any[],
  campaignContext: any
): string {
  if (historicalData.length === 0) {
    return 'No historical data available';
  }

  // Calculate basic statistics
  const totalSpend = historicalData.reduce((sum, d) => sum + d.spend, 0);
  const totalRevenue = historicalData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalConversions = historicalData.reduce((sum, d) => sum + (d.conversions || 0), 0);
  const avgCtr = historicalData.reduce((sum, d) => sum + (d.ctr || 0), 0) / historicalData.length;

  // A lead-gen campaign books no purchase revenue, so its ROAS is structurally
  // zero. Presented as "ROAS 0.00x" the model reads that as broken conversion
  // tracking and spends its recommendations telling the user to fix it. Cost
  // per lead is the metric that actually means something here.
  const isLeadGen = totalRevenue === 0 && totalConversions > 0;

  // Ratios come from summed totals, never an average of per-day ratios: a
  // 50-impression day would otherwise weigh as much as a 5,000-impression one.
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const overallCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

  // Trend on whichever metric is meaningful. Comparing ROAS on a lead-gen
  // campaign compares 0 against 0, which always reported "declining".
  const recentData = historicalData.slice(-7);
  const recentSpend = recentData.reduce((sum, d) => sum + d.spend, 0);
  const recentRevenue = recentData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const recentConversions = recentData.reduce((sum, d) => sum + (d.conversions || 0), 0);

  let trendLine: string;
  if (isLeadGen) {
    const recentCpa = recentConversions > 0 ? recentSpend / recentConversions : 0;
    const trend =
      recentConversions === 0
        ? 'no conversions in the last 7 days'
        : recentCpa < overallCpa
        ? 'improving (cost per lead falling)'
        : 'declining (cost per lead rising)';
    trendLine =
      `- Cost per Lead: $${overallCpa.toFixed(2)} overall, ` +
      `$${recentCpa.toFixed(2)} over the last 7 days\n- Recent Trend: ${trend}`;
  } else {
    const recentRoas = recentSpend > 0 ? recentRevenue / recentSpend : 0;
    const trend = recentRoas > overallRoas ? 'improving' : 'declining';
    trendLine =
      `- ROAS: ${overallRoas.toFixed(2)}x overall, ` +
      `${recentRoas.toFixed(2)}x over the last 7 days\n- Recent Trend: ${trend}`;
  }

  // Day of week analysis
  const dayOfWeekPerf = analyzeDayOfWeek(historicalData, isLeadGen);

  const objectiveNote = isLeadGen
    ? `\nIMPORTANT: this is a lead-generation campaign. It records ${totalConversions} ` +
      `conversions and no purchase revenue, so ROAS is zero by definition — that is ` +
      `expected, NOT a tracking failure. Judge it on cost per lead and lead volume, ` +
      `and do not recommend fixing revenue attribution.\n`
    : '';

  return `
Summary Statistics:
- Total Spend: $${totalSpend.toFixed(2)}
- Total Conversions: ${totalConversions}
${trendLine}
- Average CTR: ${(avgCtr * 100).toFixed(2)}%
${objectiveNote}
Day of Week Performance:
${dayOfWeekPerf}

Data Completeness: ${historicalData.length} days of data available
`;
}

/**
 * Analyze day-of-week patterns
 */
function analyzeDayOfWeek(historicalData: any[], isLeadGen = false): string {
  const dayData: Record<
    string,
    { spend: number; revenue: number; conversions: number; count: number }
  > = {};

  historicalData.forEach(data => {
    const date = new Date(data.date);
    const dayName = format(date, 'EEEE');

    if (!dayData[dayName]) {
      dayData[dayName] = { spend: 0, revenue: 0, conversions: 0, count: 0 };
    }

    dayData[dayName].spend += data.spend;
    dayData[dayName].revenue += data.revenue || 0;
    dayData[dayName].conversions += data.conversions || 0;
    dayData[dayName].count += 1;
  });

  return Object.entries(dayData)
    .map(([day, stats]) => {
      const avgSpend = (stats.spend / stats.count).toFixed(2);
      if (isLeadGen) {
        const cpa = stats.conversions > 0 ? stats.spend / stats.conversions : 0;
        const leads = cpa > 0 ? `$${cpa.toFixed(2)} per lead` : 'no leads';
        return `  ${day}: ${stats.conversions} leads (${leads}), Avg Spend $${avgSpend}`;
      }
      // Ratio from summed totals, not an average of per-day ratios.
      const roas = stats.spend > 0 ? stats.revenue / stats.spend : 0;
      return `  ${day}: ROAS ${roas.toFixed(2)}x, Avg Spend $${avgSpend}`;
    })
    .join('\n');
}

/**
 * Get cached prediction if available and still valid
 */
async function getCachedPrediction(
  adAccountId: string,
  predictionDays: number
): Promise<PerformancePrediction | null> {
  const cached = await prisma.aiAnalysis.findFirst({
    where: {
      adAccountId,
      analysisType: 'performance_prediction',
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
    const prediction = cached.insights as PerformancePrediction;
    // Validate it matches requested days
    if (prediction.predictions.length === predictionDays) {
      return prediction;
    }
  } catch (error) {
    console.error('Failed to parse cached prediction:', error);
  }

  return null;
}

/**
 * Cache prediction with 24-hour TTL
 */
async function cachePrediction(
  adAccountId: string,
  prediction: PerformancePrediction,
  predictionDays: number
): Promise<void> {
  const validUntil = addDays(new Date(), 1); // 24 hour cache

  await prisma.aiAnalysis.create({
    data: {
      adAccountId,
      analysisType: 'performance_prediction',
      insights: prediction as any,
      recommendations: prediction.recommendations as any,
      confidence: prediction.confidence,
      validUntil,
    },
  });
}

/**
 * Store prediction analysis in database
 */
async function storePredictionAnalysis(
  adAccountId: string,
  prediction: PerformancePrediction
): Promise<void> {
  // Analysis is already stored by cachePrediction
  // This function can be used for additional logging or metrics tracking
  console.log(`Performance prediction generated for account ${adAccountId}:`, {
    confidence: prediction.confidence,
    days: prediction.predictions.length,
    recommendations: prediction.recommendations.length,
  });
}

/**
 * Compare actual performance against predictions
 */
export async function evaluatePredictionAccuracy(
  adAccountId: string,
  actualData: any[]
): Promise<{
  accuracy: number;
  mae: number; // Mean Absolute Error
  insights: string[];
}> {
  const predictions = await prisma.aiAnalysis.findMany({
    where: {
      adAccountId,
      analysisType: 'performance_prediction',
      analyzedAt: {
        gte: addDays(new Date(), -7),
      },
    },
    orderBy: {
      analyzedAt: 'desc',
    },
  });

  if (predictions.length === 0 || actualData.length === 0) {
    return {
      accuracy: 0,
      mae: 0,
      insights: ['Insufficient data for accuracy evaluation'],
    };
  }

  // Calculate prediction accuracy
  let totalError = 0;
  let count = 0;

  predictions.forEach(pred => {
    const prediction = pred.insights as PerformancePrediction;
    prediction.predictions.forEach(p => {
      const actual = actualData.find(d => d.date === p.date);
      if (actual) {
        totalError += Math.abs(actual.roas - p.roas) / actual.roas;
        count++;
      }
    });
  });

  const mae = count > 0 ? totalError / count : 0;
  const accuracy = Math.max(0, 1 - mae);

  const insights = [
    `Prediction accuracy: ${(accuracy * 100).toFixed(1)}%`,
    `Mean absolute error: ${(mae * 100).toFixed(1)}%`,
    count > 0 ? `Evaluated across ${count} predictions` : 'No predictions to evaluate',
  ];

  return { accuracy, mae, insights };
}
