/**
 * Anomaly Detection Background Jobs
 * Periodic scanning for performance anomalies
 */

import { Job } from 'bullmq';
import { createWorker, QueueName, anomalyDetectionQueue, JobType } from '../config';
import { detectAnomalies, calculateHistoricalStats } from '@/lib/ai/anomaly-detector';
import { prisma } from '@/lib/db/prisma';
import { subDays, format } from 'date-fns';

interface AnomalyDetectionJobData {
  adAccountId: string;
  campaignId?: string;
  threshold?: number;
}

/**
 * Process anomaly detection jobs
 */
async function processAnomalyDetection(job: Job<AnomalyDetectionJobData>) {
  const { adAccountId, campaignId, threshold = 2.0 } = job.data;

  console.log(`Processing anomaly detection for account ${adAccountId}`);

  try {
    // Get today's metrics
    const currentMetrics = await getCurrentMetrics(adAccountId, campaignId);

    if (!currentMetrics) {
      console.log(`No current metrics for ${adAccountId}, skipping anomaly detection`);
      return { success: true, skipped: true };
    }

    // Get historical data (last 30 days)
    const historicalData = await getHistoricalData(adAccountId, campaignId, 30);

    if (historicalData.length < 7) {
      console.log(`Insufficient historical data for ${adAccountId}, skipping`);
      return { success: true, skipped: true };
    }

    // Calculate statistical baselines
    const { average, standardDeviation } = await calculateHistoricalStats(historicalData);

    // Run anomaly detection
    const result = await detectAnomalies({
      adAccountId,
      currentMetrics,
      historicalAverage: average,
      standardDeviation,
    });

    await job.updateProgress(100);

    return {
      success: true,
      adAccountId,
      status: result.overallStatus,
      anomalyCount: result.anomalies.length,
      criticalCount: result.anomalies.filter(a => a.severity === 'critical').length,
    };
  } catch (error: any) {
    console.error(`Anomaly detection failed for ${adAccountId}:`, error);
    throw error;
  }
}

/**
 * Get current day's metrics
 */
async function getCurrentMetrics(
  adAccountId: string,
  campaignId?: string
): Promise<any | null> {
  // TODO: Add CampaignInsights model to Prisma schema
  // const today = format(new Date(), 'yyyy-MM-dd');
  //
  // const insights = await prisma.campaignInsights.findFirst({
  //   where: {
  //     adAccountId,
  //     ...(campaignId && { campaignId }),
  //     date: new Date(today),
  //   },
  //   orderBy: { date: 'desc' },
  // });
  //
  // if (!insights) return null;
  //
  // return {
  //   date: format(insights.date, 'yyyy-MM-dd'),
  //   spend: insights.spend,
  //   impressions: insights.impressions,
  //   clicks: insights.clicks,
  //   conversions: insights.conversions || 0,
  //   roas: insights.roas || 0,
  //   ctr: insights.ctr || 0,
  //   cpc: insights.cpc || 0,
  //   cpm: insights.cpm || 0,
  // };

  return null;
}

/**
 * Get historical performance data
 */
async function getHistoricalData(
  adAccountId: string,
  campaignId: string | undefined,
  days: number
): Promise<any[]> {
  // TODO: Add CampaignInsights model to Prisma schema
  // const since = subDays(new Date(), days);
  // const until = subDays(new Date(), 1); // Exclude today
  //
  // const insights = await prisma.campaignInsights.findMany({
  //   where: {
  //     adAccountId,
  //     ...(campaignId && { campaignId }),
  //     date: {
  //       gte: since,
  //       lte: until,
  //     },
  //   },
  //   orderBy: { date: 'asc' },
  // });
  //
  // return insights.map(i => ({
  //   date: format(i.date, 'yyyy-MM-dd'),
  //   spend: i.spend,
  //   impressions: i.impressions,
  //   clicks: i.clicks,
  //   conversions: i.conversions || 0,
  //   roas: i.roas || 0,
  //   ctr: i.ctr || 0,
  //   cpc: i.cpc || 0,
  //   cpm: i.cpm || 0,
  // }));

  return [];
}

/**
 * Schedule anomaly detection for an account
 */
export async function scheduleAnomalyDetection(
  adAccountId: string,
  campaignId?: string,
  threshold?: number
): Promise<void> {
  await anomalyDetectionQueue.add(
    JobType.ANOMALY_DETECTION,
    {
      adAccountId,
      campaignId,
      threshold,
    },
    {
      priority: 10, // High priority
      attempts: 2,
    }
  );

  console.log(`Anomaly detection scheduled for account ${adAccountId}`);
}

/**
 * Schedule recurring anomaly detection for all active accounts
 * Runs every 4 hours
 */
export async function scheduleRecurringAnomalyDetection(): Promise<void> {
  // TODO: Add status field to AdAccount model
  const activeAccounts = await prisma.adAccount.findMany();

  console.log(`Scheduling recurring anomaly detection for ${activeAccounts.length} accounts`);

  for (const account of activeAccounts) {
    await anomalyDetectionQueue.add(
      JobType.ANOMALY_DETECTION,
      {
        adAccountId: account.id,
      },
      {
        repeat: {
          pattern: '0 */4 * * *', // Every 4 hours
        },
        priority: 10,
      }
    );
  }
}

/**
 * Run immediate anomaly detection for critical monitoring
 */
export async function runImmediateAnomalyDetection(
  adAccountId: string,
  campaignId?: string
): Promise<any> {
  const currentMetrics = await getCurrentMetrics(adAccountId, campaignId);

  if (!currentMetrics) {
    return { error: 'No current metrics available' };
  }

  const historicalData = await getHistoricalData(adAccountId, campaignId, 30);

  if (historicalData.length < 7) {
    return { error: 'Insufficient historical data' };
  }

  const { average, standardDeviation } = await calculateHistoricalStats(historicalData);

  const result = await detectAnomalies({
    adAccountId,
    currentMetrics,
    historicalAverage: average,
    standardDeviation,
  });

  return result;
}

/**
 * Get anomaly detection status for dashboard
 */
export async function getAnomalyDetectionStatus(adAccountId: string): Promise<{
  lastRun: Date | null;
  nextRun: Date | null;
  recentAnomalies: number;
  criticalAnomalies: number;
}> {
  // Get last analysis
  const lastAnalysis = await prisma.aiAnalysis.findFirst({
    where: {
      adAccountId,
      analysisType: 'anomaly_detection',
    },
    orderBy: { analyzedAt: 'desc' },
  });

  // Get recent anomalies (last 24 hours)
  const recentAnalyses = await prisma.aiAnalysis.findMany({
    where: {
      adAccountId,
      analysisType: 'anomaly_detection',
      analyzedAt: {
        gte: subDays(new Date(), 1),
      },
    },
  });

  let recentAnomalies = 0;
  let criticalAnomalies = 0;

  recentAnalyses.forEach(analysis => {
    const insights = analysis.insights as any;
    if (insights && insights.anomalies) {
      recentAnomalies += insights.anomalies.length;
      criticalAnomalies += insights.anomalies.filter(
        (a: any) => a.severity === 'critical'
      ).length;
    }
  });

  // Get next scheduled run
  const jobs = await anomalyDetectionQueue.getRepeatableJobs();
  const accountJob = jobs.find(j => (j as any).id?.includes(adAccountId));
  const nextRun = accountJob?.next ? new Date(accountJob.next) : null;

  return {
    lastRun: lastAnalysis?.analyzedAt || null,
    nextRun,
    recentAnomalies,
    criticalAnomalies,
  };
}

// Create worker
export const anomalyDetectionWorker = createWorker(
  QueueName.ANOMALY_DETECTION,
  processAnomalyDetection,
  {
    concurrency: 5, // Higher concurrency for frequent checks
  }
);

// Worker event handlers
anomalyDetectionWorker.on('completed', (job) => {
  const result = job.returnvalue;
  if (result.criticalCount > 0) {
    console.log(`⚠️  CRITICAL: ${result.criticalCount} anomalies detected for ${result.adAccountId}`);
  } else if (!result.skipped) {
    console.log(`✓ Anomaly detection completed for ${result.adAccountId}: ${result.status}`);
  }
});

anomalyDetectionWorker.on('failed', (job, error) => {
  console.error(`Anomaly detection job ${job?.id} failed:`, error);
});

anomalyDetectionWorker.on('error', (error) => {
  console.error('Anomaly detection worker error:', error);
});

console.log('Anomaly Detection worker initialized');
