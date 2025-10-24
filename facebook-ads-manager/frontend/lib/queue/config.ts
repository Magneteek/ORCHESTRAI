/**
 * BullMQ Queue Configuration
 */

import { Queue, Worker, QueueOptions, WorkerOptions } from 'bullmq';
import { redis } from '@/lib/redis/client';

// Queue connection configuration
export const queueConnection = {
  host: process.env.BULLMQ_REDIS_HOST || 'localhost',
  port: parseInt(process.env.BULLMQ_REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

// Default queue options
export const defaultQueueOptions: QueueOptions = {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 200, // Keep last 200 failed jobs
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
};

// Default worker options
export const defaultWorkerOptions: WorkerOptions = {
  connection: queueConnection,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000, // 10 jobs per second max
  },
};

// Queue names
export enum QueueName {
  AI_ANALYSIS = 'ai-analysis',
  ANOMALY_DETECTION = 'anomaly-detection',
  FACEBOOK_SYNC = 'facebook-sync',
  CAMPAIGN_OPTIMIZATION = 'campaign-optimization',
  REPORT_GENERATION = 'report-generation',
}

// Job types
export enum JobType {
  PERFORMANCE_PREDICTION = 'performance-prediction',
  ANOMALY_DETECTION = 'anomaly-detection',
  COPY_OPTIMIZATION = 'copy-optimization',
  AUDIENCE_INSIGHTS = 'audience-insights',
  FACEBOOK_DATA_SYNC = 'facebook-data-sync',
  GENERATE_REPORT = 'generate-report',
}

/**
 * Create a queue instance
 */
export function createQueue(name: QueueName, options?: Partial<QueueOptions>): Queue {
  return new Queue(name, {
    ...defaultQueueOptions,
    ...options,
  });
}

/**
 * Create a worker instance
 */
export function createWorker(
  name: QueueName,
  processor: any,
  options?: Partial<WorkerOptions>
): Worker {
  return new Worker(name, processor, {
    ...defaultWorkerOptions,
    ...options,
  });
}

// Export queue instances
export const aiAnalysisQueue = createQueue(QueueName.AI_ANALYSIS);
export const anomalyDetectionQueue = createQueue(QueueName.ANOMALY_DETECTION);
export const facebookSyncQueue = createQueue(QueueName.FACEBOOK_SYNC);
export const campaignOptimizationQueue = createQueue(QueueName.CAMPAIGN_OPTIMIZATION);
export const reportGenerationQueue = createQueue(QueueName.REPORT_GENERATION);

/**
 * Gracefully close all queues
 */
export async function closeAllQueues(): Promise<void> {
  await Promise.all([
    aiAnalysisQueue.close(),
    anomalyDetectionQueue.close(),
    facebookSyncQueue.close(),
    campaignOptimizationQueue.close(),
    reportGenerationQueue.close(),
  ]);
  console.log('All queues closed');
}

process.on('SIGTERM', async () => {
  await closeAllQueues();
});

process.on('SIGINT', async () => {
  await closeAllQueues();
});
