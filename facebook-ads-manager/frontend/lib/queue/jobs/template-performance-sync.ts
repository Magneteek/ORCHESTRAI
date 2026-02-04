/**
 * Template Performance Sync Background Job
 * Aggregates performance data from campaigns into TemplatePerformanceAggregate table
 */

import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import { queueConnection, defaultQueueOptions, defaultWorkerOptions } from '../config';
import { prisma } from '@/lib/db/prisma';
import { updateTemplatePerformance } from '@/lib/db/analytics';
import { subDays } from 'date-fns';

export const TEMPLATE_PERFORMANCE_QUEUE_NAME = 'template-performance-sync';

interface TemplatePerformanceSyncJobData {
  templateId: string;
}

/**
 * Process template performance sync job
 */
async function processTemplatePerformanceSync(job: Job<TemplatePerformanceSyncJobData>) {
  const { templateId } = job.data;

  console.log(`Syncing performance for template ${templateId}`);

  try {
    await job.updateProgress(10);

    // Get all campaigns using this template
    const campaigns = await prisma.campaign.findMany({
      where: {
        templateId,
        status: {
          in: ['ACTIVE', 'PAUSED'],
        },
      },
      include: {
        adAccount: {
          select: {
            id: true,
          },
        },
        adSets: {
          include: {
            ads: {
              include: {
                performanceMetrics: {
                  where: {
                    date: {
                      gte: subDays(new Date(), 30), // Last 30 days
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    await job.updateProgress(30);

    if (campaigns.length === 0) {
      console.log(`No campaigns found for template ${templateId}`);
      return {
        success: true,
        templateId,
        skipped: true,
        reason: 'No campaigns',
      };
    }

    // Aggregate metrics
    let totalSpend = 0;
    let totalImpressions = BigInt(0);
    let totalClicks = BigInt(0);
    let totalConversions = BigInt(0);
    const uniqueAccounts = new Set<string>();

    for (const campaign of campaigns) {
      uniqueAccounts.add(campaign.adAccount.id);

      for (const adSet of campaign.adSets) {
        for (const ad of adSet.ads) {
          for (const metric of ad.performanceMetrics) {
            totalSpend += metric.spend;
            totalImpressions += metric.impressions;
            totalClicks += metric.clicks;
            totalConversions += metric.conversions;
          }
        }
      }
    }

    await job.updateProgress(70);

    // Calculate averages
    const avgCtr =
      totalImpressions > BigInt(0)
        ? Number((totalClicks * BigInt(100)) / totalImpressions) / 100
        : null;

    const avgCpc = totalClicks > BigInt(0) ? totalSpend / Number(totalClicks) : null;

    const avgCpm =
      totalImpressions > BigInt(0)
        ? (totalSpend / Number(totalImpressions)) * 1000
        : null;

    const avgRoas = totalSpend > 0 ? Number(totalConversions) / totalSpend : null;

    // Update aggregate (convert null → undefined to match the optional parameter types)
    await updateTemplatePerformance(templateId, {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgRoas: avgRoas ?? undefined,
      avgCtr: avgCtr ?? undefined,
      avgCpc: avgCpc ?? undefined,
      avgCpm: avgCpm ?? undefined,
      accountsUsing: uniqueAccounts.size,
    });

    await job.updateProgress(100);

    console.log(
      `Template ${templateId} performance synced: $${totalSpend.toFixed(2)} spend, ${uniqueAccounts.size} accounts`
    );

    return {
      success: true,
      templateId,
      metrics: {
        totalSpend,
        accountsUsing: uniqueAccounts.size,
        avgRoas,
      },
    };
  } catch (error: any) {
    console.error(`Template performance sync failed for ${templateId}:`, error);
    throw error;
  }
}

/**
 * Create queue instance
 */
export const templatePerformanceSyncQueue = new Queue(
  TEMPLATE_PERFORMANCE_QUEUE_NAME,
  defaultQueueOptions
);

/**
 * Create worker instance
 */
export const templatePerformanceSyncWorker = new Worker(
  TEMPLATE_PERFORMANCE_QUEUE_NAME,
  processTemplatePerformanceSync,
  {
    ...defaultWorkerOptions,
    concurrency: 3, // Process 3 templates at a time
  }
);

/**
 * Schedule performance sync for a single template
 */
export async function scheduleTemplatePerformanceSync(
  templateId: string
): Promise<void> {
  await templatePerformanceSyncQueue.add(
    'sync-template-performance',
    { templateId },
    {
      priority: 5,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  );

  console.log(`Performance sync scheduled for template ${templateId}`);
}

/**
 * Schedule performance sync for all templates with usage
 * Should be called by a cron job (e.g., every 6 hours)
 */
export async function scheduleAllTemplatePerformanceSync(): Promise<void> {
  const templates = await prisma.adTemplate.findMany({
    where: {
      timesUsed: {
        gt: 0,
      },
    },
    select: {
      id: true,
    },
  });

  console.log(
    `Scheduling performance sync for ${templates.length} templates with usage`
  );

  for (const template of templates) {
    await scheduleTemplatePerformanceSync(template.id);
  }

  console.log(`${templates.length} template performance sync jobs scheduled`);
}

/**
 * Schedule recurring performance sync
 * Runs every 6 hours
 */
export async function scheduleRecurringTemplatePerformanceSync(): Promise<void> {
  await templatePerformanceSyncQueue.add(
    'sync-all-templates',
    {},
    {
      repeat: {
        pattern: '0 */6 * * *', // Every 6 hours
      },
      priority: 5,
    }
  );

  console.log('Recurring template performance sync scheduled (every 6 hours)');
}

/**
 * Get sync job status for a template
 */
export async function getTemplateSyncStatus(templateId: string): Promise<{
  lastSync: Date | null;
  nextSync: Date | null;
  status: 'idle' | 'running' | 'failed';
}> {
  const jobs = await templatePerformanceSyncQueue.getJobs(['active', 'waiting']);
  const templateJob = jobs.find((j) => j.data.templateId === templateId);

  const aggregate = await prisma.templatePerformanceAggregate.findUnique({
    where: { templateId },
  });

  let status: 'idle' | 'running' | 'failed' = 'idle';
  if (templateJob) {
    const state = await templateJob.getState();
    status = state === 'active' ? 'running' : state === 'failed' ? 'failed' : 'idle';
  }

  const repeatableJobs = await templatePerformanceSyncQueue.getRepeatableJobs();
  const nextSync = repeatableJobs[0]?.next ? new Date(repeatableJobs[0].next) : null;

  return {
    lastSync: aggregate?.lastUpdated || null,
    nextSync,
    status,
  };
}

/**
 * Trigger immediate sync for a template
 */
export async function triggerImmediateTemplateSync(templateId: string): Promise<any> {
  const job = await templatePerformanceSyncQueue.add(
    'sync-template-immediate',
    { templateId },
    {
      priority: 1, // High priority
      attempts: 1,
    }
  );

  // Wait for completion using QueueEvents
  const queueEvents = new QueueEvents(TEMPLATE_PERFORMANCE_QUEUE_NAME, {
    connection: queueConnection,
  });
  const result = await job.waitUntilFinished(queueEvents, 10000);
  await queueEvents.close();

  return result;
}

// Worker event handlers
templatePerformanceSyncWorker.on('completed', (job) => {
  const result = job.returnvalue;
  if (!result.skipped) {
    console.log(
      `✓ Template ${result.templateId} performance synced: $${result.metrics?.totalSpend?.toFixed(2)}, ${result.metrics?.accountsUsing} accounts, ${result.metrics?.avgRoas?.toFixed(2)}x ROAS`
    );
  }
});

templatePerformanceSyncWorker.on('failed', (job, error) => {
  console.error(`Template performance sync job ${job?.id} failed:`, error);
});

templatePerformanceSyncWorker.on('error', (error) => {
  console.error('Template performance sync worker error:', error);
});

console.log('Template Performance Sync worker initialized');
