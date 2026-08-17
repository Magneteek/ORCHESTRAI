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
import type { AccountContext } from './account-context';
import { addDays, format } from 'date-fns';

const SYSTEM_PROMPT = `You are a senior paid-social analyst reviewing one Meta ad account. You are writing for the person who controls the budget, who will act on what you say.

HOW TO READ THE DATA

- \`clicks\` counts every interaction with the ad, including reactions, comments, saves and post expands. \`linkClicks\` counts people who followed the link. Conversion rate and cost per click are only meaningful against link clicks. Never divide conversions by \`clicks\`.
- On a lead-generation objective there is no purchase revenue, so ROAS is zero by definition. That is not broken tracking. Judge those accounts on cost per lead, lead volume and link conversion rate.
- Rates must be computed from summed totals over the period, never by averaging daily rates: a 50-impression day must not weigh the same as a 5,000-impression one.
- Conversion counts are small. Before calling any split a pattern — weekday, ad, placement — ask whether the count behind it could arise by chance. A difference resting on 9 events against 3 is not a finding.

WHAT MAKES YOUR ANALYSIS USEFUL

1. Name the entity. "Refresh creative" is worthless; "ad B - Stat Hook, 55 days live, link CTR 0.84% against 1.14% for the archived New Leads Ad" is actionable. Every claim about an ad, ad set or campaign must name it.
2. Quantify the expected effect. State the metric, its current value, and the range you expect after the change. If you cannot estimate it, say so rather than asserting impact.
3. Give the check. Every recommendation states what to measure and by when, so it can be falsified.
4. Separate what the data shows from what you infer. Distinguish "spend fell to 10.23 on the last two Saturdays" from "this looks like a delivery restriction, which would need checking in the ad set schedule".
5. Rank by money. Lead with whichever change moves cost per lead or lead volume most, not whichever is easiest to describe.
10. Say when the data cannot answer. Declining to recommend on thin data is a correct answer and is preferred over a confident guess. A "do not act yet" item still gets a priority, so it is visibly considered rather than missing.

Report every figure in the account's own currency, which is given below. Do not convert, and do not use a currency symbol that was not given to you.

CRITICAL: Respond ONLY with valid JSON matching this exact structure:
{
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "spend": number,
      "roas": number,
      "ctr": number,
      "impressions": number,
      "clicks": number,
      "conversions": number,
      "cpa": number
    }
  ],
  "confidence": number (0-1),
  "confidenceRationale": "one line on what drives this number up or down",
  "combinedOutcome": "where the account lands if everything here is done — one honest combined figure, NOT the sum of the individual values",
  "factors": ["factor1", "factor2"],
  "recommendations": [
    {
      "priority": number (1 = do this first),
      "action": "specific action naming the entity",
      "impact": "low|medium|high",
      "description": "the evidence, with figures",
      "expectedEffect": "metric: current -> expected range",
      "monthlyValue": "money per month at stake, observed figure first then any extrapolation",
      "valueBasis": "recovered_spend|redirected_spend|avoided_loss|opportunity|not_quantifiable",
      "evidenceStrength": "strong|moderate|speculative",
      "effort": "realistic hands-on time",
      "where": "the exact ad set, ad or setting to open",
      "dependsOn": number or null (priority of the step that must happen first),
      "verifyBy": "what to measure, and when to judge it"
    }
  ],
  "summary": "brief summary"
}

For a lead-generation account, "conversions" and "cpa" are the important forecast fields; still return roas as 0.`;

/**
 * Generate performance predictions for the next N days
 */
export async function predictPerformance(
  request: PerformancePredictionRequest
): Promise<PerformancePrediction> {
  const {
    adAccountId,
    historicalData,
    campaignContext,
    predictionDays = 7,
    currency = 'USD',
    adBreakdown = [],
    accountContext,
  } = request;

  // Check cache first
  const cachedPrediction = await getCachedPrediction(adAccountId, predictionDays);
  if (cachedPrediction) {
    return cachedPrediction;
  }

  // Report in the account's own currency. Hardcoded "$" meant the analysis
  // narrated dollars while the UI beside it rendered euros.
  const money = (n: number) => `${currency} ${n.toFixed(2)}`;

  // Prepare analysis context
  const dataContext = prepareDataContext(historicalData, campaignContext, money);

  const adTable = adBreakdown.length
    ? adBreakdown
        .map(
          (a) =>
            `  ${a.name} [${a.status}] — ${a.activeDays} days delivering (${a.firstDay}..${a.lastDay}), ` +
            `spend ${money(a.spend)}, ${a.impressions} impressions, ${a.linkClicks} link clicks, ` +
            `${a.conversions} conversions, cost per conversion ${a.conversions ? money(a.cpa) : 'n/a'}, ` +
            `link CTR ${(a.linkCtr * 100).toFixed(2)}%, link-click conversion rate ${(a.cvr * 100).toFixed(1)}%`
        )
        .join('\n')
    : '  (no per-ad data available)';

  const contextBlocks = accountContext
    ? renderAccountContext(accountContext, money)
    : '';

  const userPrompt = `Analyze this account's performance and predict the next ${predictionDays} days:

CURRENCY: all amounts below are in ${currency}. Report your figures in ${currency}.

HISTORICAL DATA (Last 30 days):
${JSON.stringify(historicalData, null, 2)}

CAMPAIGN CONTEXT:
- Objective: ${campaignContext.objective}
- Daily Budget: ${campaignContext.dailyBudget ? money(campaignContext.dailyBudget) : 'Not set'}
- Lifetime Budget: ${campaignContext.lifetimeBudget ? money(campaignContext.lifetimeBudget) : 'Not set'}
- Status: ${campaignContext.status}
- Start Date: ${campaignContext.startDate}

PER-AD BREAKDOWN (last 120 days — deliberately wider than the daily series\nabove, so stopped ads remain comparable against the ones running now):
${adTable}

${contextBlocks}
ANALYSIS INSIGHTS:
${dataContext}

Provide a daily forecast for the next ${predictionDays} days, then recommendations
ranked by how much they move cost per conversion or conversion volume.

Use the per-ad breakdown: if one creative is materially cheaper or more
efficient than another, name both and say what to do about it. Note how long
each ad has been delivering — a long-running ad with a falling link CTR is
fatigue, and a cheaper ad that has been stopped is worth asking about.

Return the recommendations already sorted by priority, so the first item is
what to do this morning. Someone should be able to work down the list without
deciding anything for themselves about order.

Then sanity-check your own numbers before returning them. The per-item values
overlap — the same euro cannot be recovered, redirected and saved at once — so
state the realistic combined position once in combinedOutcome, as leads and
cost per lead at a stated monthly spend. If your individual figures added
together would exceed what the account spends, say so there explicitly rather
than leaving the reader to notice.

For a lead-generation account, forecast conversions as whole leads where the
daily number is small: a day cannot produce 1.2 leads. Give the honest weekly
total in the summary and keep daily figures coarse.`;

  const { content } = await callClaude(
    SYSTEM_PROMPT,
    userPrompt,
    'performance_prediction',
    { maxTokens: 16000 }
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
  campaignContext: any,
  money: (n: number) => string
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
      `- Cost per Lead: ${money(overallCpa)} overall, ` +
      `${money(recentCpa)} over the last 7 days\n- Recent Trend: ${trend}`;
  } else {
    const recentRoas = recentSpend > 0 ? recentRevenue / recentSpend : 0;
    const trend = recentRoas > overallRoas ? 'improving' : 'declining';
    trendLine =
      `- ROAS: ${overallRoas.toFixed(2)}x overall, ` +
      `${recentRoas.toFixed(2)}x over the last 7 days\n- Recent Trend: ${trend}`;
  }

  // Day of week analysis
  const dayOfWeekPerf = analyzeDayOfWeek(historicalData, isLeadGen, money);

  // Conversion counts per weekday are small enough that a large cost-per-lead
  // spread appears from chance alone. Without this caveat the model reads the
  // spread as a schedule and leads with "shift budget to <day>", which is
  // advice built on noise.
  const dayOfWeekCaveat =
    totalConversions > 0 && totalConversions < 70
      ? `\nNOTE ON DAY-OF-WEEK DATA: only ${totalConversions} conversions are spread ` +
        `across seven weekdays here (about ${(totalConversions / 7).toFixed(1)} each), ` +
        `so differences between days are unlikely to be statistically meaningful. Do ` +
        `not recommend day-parting, weekday budget shifts or schedule changes on the ` +
        `basis of this spread unless one day is extreme and backed by a large share of ` +
        `the conversions. Say explicitly that more data is needed instead.\n`
      : '';

  const objectiveNote = isLeadGen
    ? `\nIMPORTANT: this is a lead-generation campaign. It records ${totalConversions} ` +
      `conversions and no purchase revenue, so ROAS is zero by definition — that is ` +
      `expected, NOT a tracking failure. Judge it on cost per lead and lead volume, ` +
      `and do not recommend fixing revenue attribution.\n`
    : '';

  return `
Summary Statistics:
- Total Spend: ${money(totalSpend)}
- Total Conversions: ${totalConversions}
${trendLine}
- Average CTR: ${(avgCtr * 100).toFixed(2)}%
${objectiveNote}
Day of Week Performance:
${dayOfWeekPerf}
${dayOfWeekCaveat}

Data Completeness: ${historicalData.length} days of data available
`;
}

/**
 * Analyze day-of-week patterns
 */
function analyzeDayOfWeek(
  historicalData: any[],
  isLeadGen = false,
  money: (n: number) => string = (n) => n.toFixed(2)
): string {
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
      const avgSpend = money(stats.spend / stats.count);
      if (isLeadGen) {
        const cpa = stats.conversions > 0 ? stats.spend / stats.conversions : 0;
        const leads = cpa > 0 ? `${money(cpa)} per lead` : 'no leads';
        return `  ${day}: ${stats.conversions} leads (${leads}), Avg Spend ${avgSpend}`;
      }
      // Ratio from summed totals, not an average of per-day ratios.
      const roas = stats.spend > 0 ? stats.revenue / stats.spend : 0;
      return `  ${day}: ROAS ${roas.toFixed(2)}x, Avg Spend ${avgSpend}`;
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


/**
 * Render the enrichment blocks. Sections that could not be fetched say so
 * explicitly rather than being omitted — the model must be able to tell
 * "no placement problem" from "no placement data", and an empty change log is
 * evidence against a configuration explanation rather than an absence of
 * information.
 */
function renderAccountContext(
  ctx: AccountContext,
  money: (n: number) => string
): string {
  const parts: string[] = [];

  if (ctx.placements === null) {
    parts.push('PLACEMENT BREAKDOWN: unavailable — do not infer anything about placements.');
  } else if (ctx.placements.length === 0) {
    parts.push('PLACEMENT BREAKDOWN: no placement-level delivery in this period.');
  } else {
    const rows = ctx.placements
      .map(
        (p) =>
          `  ${p.platform}/${p.position}: spend ${money(p.spend)}, ${p.impressions} impressions, ` +
          `${p.linkClicks} link clicks, ${p.conversions} conversions, ` +
          `cost per conversion ${p.conversions ? money(p.cpa) : 'no conversions'}`
      )
      .join('\n');
    parts.push(
      `PLACEMENT BREAKDOWN (where the budget actually went):\n${rows}\n` +
        `  Compare each placement's cost per conversion against the account figure before ` +
        `suggesting an exclusion, and check the conversion count behind it is large enough to act on.`
    );
  }

  if (ctx.creatives.length > 0) {
    const rows = ctx.creatives
      .map((c) => {
        const lines = [`  ${c.adName} [${c.status}]`];
        if (c.titles.length) lines.push(`    headlines: ${c.titles.map((t) => `"${t}"`).join(' | ')}`);
        if (c.bodies.length) lines.push(`    body copy: ${c.bodies.map((b) => `"${b}"`).join(' | ')}`);
        if (c.descriptions.length) lines.push(`    descriptions: ${c.descriptions.join(' | ')}`);
        if (c.callToAction) lines.push(`    call to action: ${c.callToAction}`);
        if (c.landingUrls.length) lines.push(`    landing page: ${c.landingUrls.join(', ')}`);
        return lines.join('\n');
      })
      .join('\n');
    parts.push(
      `AD COPY (what each ad actually said):\n${rows}\n` +
        `  Use this to explain WHY an ad performs as it does — the angle, the offer, the ` +
        `landing page it sends to. Flag any asset that is truncated, garbled or duplicated, ` +
        `since those run live exactly as written here.`
    );
  }

  if (ctx.changes === null) {
    parts.push('CHANGE LOG: unavailable — you cannot rule a configuration change in or out.');
  } else if (ctx.changes.length === 0) {
    parts.push(
      'CHANGE LOG: read successfully and contains no configuration changes in this period ' +
        '(billing events excluded). Treat a delivery shift as an auction or pacing effect ' +
        'rather than an edit, unless something else contradicts that.'
    );
  } else {
    const rows = ctx.changes
      .map((c) => `  ${c.date}  ${c.eventType}${c.objectName ? ` — ${c.objectName}` : ''}`)
      .join('\n');
    parts.push(`CHANGE LOG (configuration changes, billing excluded):\n${rows}`);
  }

  if (ctx.audiences && ctx.audiences.length > 0) {
    const rows = ctx.audiences
      .map((a) => {
        const size =
          a.lowerBound && a.upperBound
            ? `${a.lowerBound.toLocaleString()}–${a.upperBound.toLocaleString()} monthly active people`
            : 'size unavailable';
        return `  ${a.adSetName}: ${size}${a.ready ? '' : ' (estimate not ready)'}`;
      })
      .join('\n');
    parts.push(
      `AUDIENCE SIZE (active ad sets):\n${rows}\n` +
        `  Use this with frequency to judge headroom: a large pool with low frequency means a ` +
        `budget increase has somewhere to go; a small pool means it mostly raises frequency.`
    );
  }

  return parts.length ? `${parts.join('\n\n')}\n` : '';
}
