/**
 * Anomaly Detector - Identifies unusual patterns in campaign performance
 */

import { callClaude, parseClaudeJson } from './client';
import {
  AnomalyDetectionResult,
  AnomalyDetectionSchema,
  AnomalyDetectionRequest,
  HistoricalPerformanceData,
} from './types';
import { prisma } from '@/lib/db/prisma';
import { addHours } from 'date-fns';

const SYSTEM_PROMPT = `You are an expert Facebook Ads anomaly detection system with deep knowledge of advertising metrics and performance patterns.

Your task is to analyze campaign metrics and identify anomalies that require attention.

Consider these factors:
- Statistical significance of deviations
- Metric interdependencies (e.g., high CTR but low conversions)
- Time-based patterns and seasonality
- Budget utilization anomalies
- Performance degradation trends

CRITICAL: Respond ONLY with valid JSON matching this exact structure:
{
  "anomalies": [
    {
      "metric": "roas|ctr|cpc|conversions",
      "severity": "minor|moderate|critical",
      "currentValue": number,
      "expectedValue": number,
      "deviation": number (percentage),
      "description": "clear description",
      "likelyCauses": ["cause1", "cause2"],
      "recommendations": ["action1", "action2"]
    }
  ],
  "overallStatus": "healthy|warning|critical",
  "summary": "brief summary"
}`;

/**
 * Detect anomalies in campaign performance
 */
export async function detectAnomalies(
  request: AnomalyDetectionRequest
): Promise<AnomalyDetectionResult> {
  const { adAccountId, currentMetrics, historicalAverage, standardDeviation } = request;

  // Calculate deviations
  const deviations = calculateDeviations(currentMetrics, historicalAverage, standardDeviation);

  const userPrompt = `Analyze these campaign metrics for anomalies:

CURRENT METRICS (Today):
${JSON.stringify(currentMetrics, null, 2)}

HISTORICAL AVERAGE (Last 30 days):
${JSON.stringify(historicalAverage, null, 2)}

STANDARD DEVIATION:
${JSON.stringify(standardDeviation, null, 2)}

CALCULATED DEVIATIONS:
${JSON.stringify(deviations, null, 2)}

Identify any anomalies that require attention. Consider:
1. Metrics deviating > 2 standard deviations
2. Unusual combinations (e.g., high spend but low conversions)
3. Sudden trend changes
4. Budget pacing issues

For each anomaly, provide:
- Severity assessment
- Likely causes
- Actionable recommendations`;

  const { content } = await callClaude(
    SYSTEM_PROMPT,
    userPrompt,
    'anomaly_detection',
    // Runs on a schedule across every account, so trade some depth for cost.
    { maxTokens: 8192, effort: 'medium' }
  );

  // Parse and validate response
  const result = AnomalyDetectionSchema.parse(parseClaudeJson(content));

  // Store anomalies in database
  await storeAnomalies(adAccountId, result);

  // Trigger alerts for critical anomalies
  if (result.overallStatus === 'critical') {
    await triggerCriticalAlert(adAccountId, result);
  }

  return result;
}

/**
 * Calculate statistical deviations
 */
function calculateDeviations(
  current: HistoricalPerformanceData,
  average: Partial<HistoricalPerformanceData>,
  stdDev: Partial<HistoricalPerformanceData>
): Record<string, { deviation: number; zScore: number }> {
  const deviations: Record<string, { deviation: number; zScore: number }> = {};

  const metrics: (keyof HistoricalPerformanceData)[] = [
    'spend', 'impressions', 'clicks', 'conversions', 'roas', 'ctr', 'cpc', 'cpm'
  ];

  metrics.forEach(metric => {
    const currentValue = current[metric];
    const avgValue = average[metric];
    const stdDevValue = stdDev[metric];

    if (
      typeof currentValue === 'number' &&
      typeof avgValue === 'number' &&
      typeof stdDevValue === 'number' &&
      stdDevValue > 0
    ) {
      const deviation = ((currentValue - avgValue) / avgValue) * 100;
      const zScore = (currentValue - avgValue) / stdDevValue;

      deviations[metric] = { deviation, zScore };
    }
  });

  return deviations;
}

/**
 * Store anomalies in database
 */
async function storeAnomalies(
  adAccountId: string,
  result: AnomalyDetectionResult
): Promise<void> {
  if (result.anomalies.length === 0) return;

  await prisma.aiAnalysis.create({
    data: {
      adAccountId,
      analysisType: 'anomaly_detection',
      insights: result as any,
      recommendations: result.anomalies.flatMap(a => a.recommendations) as any,
      confidence: result.overallStatus === 'critical' ? 0.9 : 0.7,
      validUntil: addHours(new Date(), 4), // Valid for 4 hours
    },
  });

  // Log individual anomalies
  console.log(`Anomaly detection for account ${adAccountId}:`, {
    status: result.overallStatus,
    anomalyCount: result.anomalies.length,
    criticalCount: result.anomalies.filter(a => a.severity === 'critical').length,
  });
}

/**
 * Trigger critical alert (email, webhook, etc.)
 */
async function triggerCriticalAlert(
  adAccountId: string,
  result: AnomalyDetectionResult
): Promise<void> {
  const criticalAnomalies = result.anomalies.filter(a => a.severity === 'critical');

  // TODO: Add AIAlert model to Prisma schema
  // await prisma.aiAlert.create({
  //   data: {
  //     adAccountId,
  //     alertType: 'critical_anomaly',
  //     severity: 'critical',
  //     title: 'Critical Performance Anomaly Detected',
  //     message: result.summary,
  //     metadata: {
  //       anomalies: criticalAnomalies,
  //     } as any,
  //     status: 'unread',
  //   },
  // });

  // TODO: Send email notification
  // TODO: Send webhook to external systems
  // TODO: Slack/Teams notification integration

  console.log(`CRITICAL ALERT for account ${adAccountId}:`, {
    anomalyCount: criticalAnomalies.length,
    summary: result.summary,
  });
}

/**
 * Get recent anomalies for an account
 */
export async function getRecentAnomalies(
  adAccountId: string,
  hoursBack: number = 24
): Promise<AnomalyDetectionResult[]> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const analyses = await prisma.aiAnalysis.findMany({
    where: {
      adAccountId,
      analysisType: 'anomaly_detection',
      analyzedAt: {
        gte: since,
      },
    },
    orderBy: {
      analyzedAt: 'desc',
    },
  });

  return analyses
    .map(a => {
      try {
        return AnomalyDetectionSchema.parse(a.insights);
      } catch (error) {
        console.error('Failed to parse anomaly result:', error);
        return null;
      }
    })
    .filter((r): r is AnomalyDetectionResult => r !== null);
}

/**
 * Calculate historical statistics for anomaly detection
 */
export async function calculateHistoricalStats(
  historicalData: HistoricalPerformanceData[]
): Promise<{
  average: Partial<HistoricalPerformanceData>;
  standardDeviation: Partial<HistoricalPerformanceData>;
}> {
  if (historicalData.length === 0) {
    return { average: {}, standardDeviation: {} };
  }

  const metrics: (keyof HistoricalPerformanceData)[] = [
    'spend', 'impressions', 'clicks', 'conversions', 'roas', 'ctr', 'cpc', 'cpm'
  ];

  const average: Partial<HistoricalPerformanceData> = {};
  const standardDeviation: Partial<HistoricalPerformanceData> = {};

  metrics.forEach(metric => {
    const values = historicalData
      .map(d => d[metric])
      .filter((v): v is number => v !== undefined);

    if (values.length > 0) {
      // Calculate average
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      (average as any)[metric] = avg;

      // Calculate standard deviation
      const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
      const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
      (standardDeviation as any)[metric] = Math.sqrt(variance);
    }
  });

  return { average, standardDeviation };
}

/**
 * Batch anomaly detection for multiple campaigns
 */
export async function detectAnomaliesBatch(
  requests: AnomalyDetectionRequest[]
): Promise<Map<string, AnomalyDetectionResult>> {
  const results = new Map<string, AnomalyDetectionResult>();

  // Process in parallel with rate limiting
  const batchSize = 5;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async req => {
        try {
          const result = await detectAnomalies(req);
          return { id: req.adAccountId, result };
        } catch (error) {
          console.error(`Anomaly detection failed for ${req.adAccountId}:`, error);
          return null;
        }
      })
    );

    batchResults.forEach(item => {
      if (item) {
        results.set(item.id, item.result);
      }
    });

    // Rate limiting delay between batches
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}
