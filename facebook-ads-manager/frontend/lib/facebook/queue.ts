/**
 * Facebook API Queue Manager
 * Background job processing for Facebook API operations using BullMQ
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { FacebookAPI } from './index';
import { FacebookErrorLogger } from './errors';

// Job types
export type FacebookJobType =
  | 'sync-businesses'
  | 'sync-ad-accounts'
  | 'sync-campaigns'
  | 'sync-ad-sets'
  | 'sync-ads'
  | 'sync-insights'
  | 'create-campaign'
  | 'update-campaign'
  | 'create-ad-set'
  | 'create-ad'
  | 'upload-image';

export interface FacebookJobData {
  type: FacebookJobType;
  userId: string;
  accessToken: string;
  [key: string]: any;
}

export interface FacebookJobResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Facebook API Queue Manager
 */
export class FacebookQueueManager {
  private queue: Queue<FacebookJobData, FacebookJobResult>;
  private worker: Worker<FacebookJobData, FacebookJobResult> | null = null;
  private queueEvents: QueueEvents | null = null;
  private redis: Redis;
  private facebookAPI: FacebookAPI;

  constructor(redis: Redis, facebookAPI: FacebookAPI) {
    this.redis = redis;
    this.facebookAPI = facebookAPI;

    // Initialize queue
    this.queue = new Queue<FacebookJobData, FacebookJobResult>('facebook-api', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 86400, // Keep for 24 hours
          count: 1000,
        },
        removeOnFail: {
          age: 604800, // Keep for 7 days
        },
      },
    });

    FacebookErrorLogger.info('Facebook API queue initialized');
  }

  /**
   * Start worker to process jobs
   */
  startWorker(concurrency: number = 5): void {
    if (this.worker) {
      FacebookErrorLogger.warn('Worker already started');
      return;
    }

    this.worker = new Worker<FacebookJobData, FacebookJobResult>(
      'facebook-api',
      async (job: Job<FacebookJobData, FacebookJobResult>) => {
        return this.processJob(job);
      },
      {
        connection: this.redis,
        concurrency,
      }
    );

    // Worker event listeners
    this.worker.on('completed', (job) => {
      FacebookErrorLogger.info('Job completed', {
        jobId: job.id,
        type: job.data.type,
        userId: job.data.userId,
      });
    });

    this.worker.on('failed', (job, error) => {
      FacebookErrorLogger.log(error, {
        jobId: job?.id,
        type: job?.data.type,
        userId: job?.data.userId,
        attemptsMade: job?.attemptsMade,
      });
    });

    this.worker.on('error', (error) => {
      FacebookErrorLogger.log(error, { component: 'worker' });
    });

    // Queue events
    this.queueEvents = new QueueEvents('facebook-api', {
      connection: this.redis,
    });

    this.queueEvents.on('completed', ({ jobId }) => {
      FacebookErrorLogger.info('Job event: completed', { jobId });
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      FacebookErrorLogger.warn('Job event: failed', { jobId, failedReason });
    });

    FacebookErrorLogger.info('Facebook API worker started', { concurrency });
  }

  /**
   * Stop worker
   */
  async stopWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }

    if (this.queueEvents) {
      await this.queueEvents.close();
      this.queueEvents = null;
    }

    FacebookErrorLogger.info('Facebook API worker stopped');
  }

  /**
   * Add job to queue
   */
  async addJob(
    jobData: FacebookJobData,
    options?: {
      priority?: number;
      delay?: number;
      jobId?: string;
    }
  ): Promise<Job<FacebookJobData, FacebookJobResult>> {
    const job = await this.queue.add(jobData.type, jobData, {
      priority: options?.priority,
      delay: options?.delay,
      jobId: options?.jobId,
    });

    FacebookErrorLogger.info('Job added to queue', {
      jobId: job.id,
      type: jobData.type,
      userId: jobData.userId,
    });

    return job;
  }

  /**
   * Process individual job
   */
  private async processJob(
    job: Job<FacebookJobData, FacebookJobResult>
  ): Promise<FacebookJobResult> {
    const { type, userId, accessToken, ...params } = job.data;

    try {
      FacebookErrorLogger.info('Processing job', {
        jobId: job.id,
        type,
        userId,
        attempt: job.attemptsMade + 1,
      });

      // Set access token
      this.facebookAPI.setAccessToken(accessToken);

      let result: any;

      // Route to appropriate handler
      switch (type) {
        case 'sync-businesses':
          result = await this.facebookAPI.businesses.syncBusinessAccounts(
            userId,
            params.options
          );
          break;

        case 'sync-ad-accounts':
          result = await this.facebookAPI.adAccounts.syncAdAccounts(
            params.businessId,
            params.options
          );
          break;

        case 'sync-campaigns':
          result = await this.facebookAPI.campaigns.syncCampaigns(
            params.adAccountId,
            params.options
          );
          break;

        case 'sync-ad-sets':
          result = await this.facebookAPI.adSets.syncAdSets(
            params.campaignId,
            params.adAccountId,
            params.options
          );
          break;

        case 'sync-ads':
          result = await this.facebookAPI.ads.syncAds(
            params.adSetId,
            params.adAccountId,
            params.options
          );
          break;

        case 'sync-insights':
          result = await this.facebookAPI.insights.getAccountInsights(
            params.adAccountId,
            params.params
          );
          break;

        case 'create-campaign':
          result = await this.facebookAPI.campaignCreator.createCampaign(
            params.adAccountId,
            params.campaignParams
          );
          break;

        case 'update-campaign':
          result = await this.facebookAPI.campaignUpdater.updateCampaign(
            params.campaignId,
            params.adAccountId,
            params.updates
          );
          break;

        case 'create-ad-set':
          result = await this.facebookAPI.adSetCreator.createAdSet(
            params.adAccountId,
            params.adSetParams
          );
          break;

        case 'create-ad':
          result = await this.facebookAPI.adCreator.createAd(
            params.adAccountId,
            params.adParams
          );
          break;

        case 'upload-image':
          result = await this.facebookAPI.adCreator.uploadImage(
            params.adAccountId,
            params.imageUrl,
            params.fileName
          );
          break;

        default:
          throw new Error(`Unknown job type: ${type}`);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        jobId: job.id,
        type,
        userId,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(
    jobId: string
  ): Promise<{
    state: string;
    progress?: number;
    result?: FacebookJobResult;
    failedReason?: string;
  } | null> {
    const job = await this.queue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress;
    const returnValue = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      state,
      progress: typeof progress === 'number' ? progress : undefined,
      result: returnValue,
      failedReason,
    };
  }

  /**
   * Wait for job completion
   */
  async waitForJobCompletion(
    jobId: string,
    timeoutMs: number = 60000
  ): Promise<FacebookJobResult> {
    const job = await this.queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const result = await job.waitUntilFinished(this.queueEvents!, timeoutMs);
    return result;
  }

  /**
   * Get queue metrics
   */
  async getMetrics(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
    };
  }

  /**
   * Clean old jobs
   */
  async cleanJobs(
    grace: number = 86400000, // 24 hours
    limit: number = 1000
  ): Promise<string[]> {
    const cleaned = await this.queue.clean(grace, limit);
    FacebookErrorLogger.info('Cleaned old jobs', { count: cleaned.length });
    return cleaned;
  }

  /**
   * Pause queue
   */
  async pause(): Promise<void> {
    await this.queue.pause();
    FacebookErrorLogger.info('Queue paused');
  }

  /**
   * Resume queue
   */
  async resume(): Promise<void> {
    await this.queue.resume();
    FacebookErrorLogger.info('Queue resumed');
  }

  /**
   * Close queue and worker
   */
  async close(): Promise<void> {
    await this.stopWorker();
    await this.queue.close();
    FacebookErrorLogger.info('Queue closed');
  }
}

/**
 * Create queue manager instance
 */
export function createQueueManager(
  redis: Redis,
  facebookAPI: FacebookAPI
): FacebookQueueManager {
  return new FacebookQueueManager(redis, facebookAPI);
}
