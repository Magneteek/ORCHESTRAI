/**
 * Queue Manager - Background execution queue with priorities
 *
 * Features:
 * - Priority-based execution (critical, high, normal, low)
 * - Concurrent execution limits
 * - Retry logic with exponential backoff
 * - Job status tracking
 * - Dead letter queue for failures
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class QueueManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      maxConcurrent: options.maxConcurrent || 5,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 5000,
      retryBackoff: options.retryBackoff || 2, // Exponential multiplier
      jobTimeout: options.jobTimeout || 600000, // 10 minutes
      ...options
    };

    // Job queues by priority
    this.queues = {
      critical: [],
      high: [],
      normal: [],
      low: []
    };

    // Currently executing jobs
    this.executing = new Map();

    // Job history
    this.completed = new Map();
    this.failed = new Map();

    // Statistics
    this.stats = {
      enqueued: 0,
      completed: 0,
      failed: 0,
      retried: 0,
      currentlyExecuting: 0,
      startTime: Date.now()
    };

    // Executor function (injected)
    this.executor = options.executor || null;

    // Start processing
    this.processing = false;
  }

  /**
   * Start queue processing
   */
  start() {
    if (this.processing) {
      return;
    }

    this.processing = true;
    this.processQueue();
    this.emit('queue:started');
  }

  /**
   * Stop queue processing
   */
  stop() {
    this.processing = false;
    this.emit('queue:stopped');
  }

  /**
   * Enqueue a job
   */
  enqueue(job) {
    const jobId = uuidv4();

    const queueJob = {
      id: jobId,
      ...job,
      priority: job.priority || 'normal',
      retries: 0,
      maxRetries: job.maxRetries !== undefined ? job.maxRetries : this.config.maxRetries,
      timeout: job.timeout || this.config.jobTimeout,
      enqueuedAt: Date.now(),
      status: 'queued'
    };

    // Add to appropriate queue
    const priority = queueJob.priority;
    if (!this.queues[priority]) {
      queueJob.priority = 'normal';
    }

    this.queues[queueJob.priority].push(queueJob);
    this.stats.enqueued++;

    this.emit('job:enqueued', queueJob);

    // Start processing if not already
    if (!this.processing) {
      this.start();
    }

    return jobId;
  }

  /**
   * Get next job to execute
   */
  dequeue() {
    // Check priorities in order: critical, high, normal, low
    for (const priority of ['critical', 'high', 'normal', 'low']) {
      if (this.queues[priority].length > 0) {
        return this.queues[priority].shift();
      }
    }

    return null;
  }

  /**
   * Process queue
   */
  async processQueue() {
    while (this.processing) {
      try {
        // Check if we can execute more jobs
        if (this.executing.size >= this.config.maxConcurrent) {
          // Wait a bit and check again
          await this.sleep(100);
          continue;
        }

        // Get next job
        const job = this.dequeue();

        if (!job) {
          // No jobs, wait a bit
          await this.sleep(500);
          continue;
        }

        // Execute job
        this.executeJob(job);

      } catch (error) {
        console.error('Queue processing error:', error);
        await this.sleep(1000);
      }
    }
  }

  /**
   * Execute a job
   */
  async executeJob(job) {
    job.status = 'executing';
    job.startedAt = Date.now();

    this.executing.set(job.id, job);
    this.stats.currentlyExecuting = this.executing.size;

    this.emit('job:started', job);

    try {
      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), job.timeout);
      });

      // Execute with timeout
      const result = await Promise.race([
        this.executor(job),
        timeoutPromise
      ]);

      // Success
      job.status = 'completed';
      job.completedAt = Date.now();
      job.duration = job.completedAt - job.startedAt;
      job.result = result;

      this.executing.delete(job.id);
      this.completed.set(job.id, job);

      this.stats.completed++;
      this.stats.currentlyExecuting = this.executing.size;

      this.emit('job:completed', job);

    } catch (error) {
      job.error = error.message;
      job.errorStack = error.stack;

      // Retry if not exceeded max retries
      if (job.retries < job.maxRetries) {
        await this.retryJob(job);
      } else {
        // Failed permanently
        job.status = 'failed';
        job.failedAt = Date.now();

        this.executing.delete(job.id);
        this.failed.set(job.id, job);

        this.stats.failed++;
        this.stats.currentlyExecuting = this.executing.size;

        this.emit('job:failed', job);
      }
    }
  }

  /**
   * Retry a job
   */
  async retryJob(job) {
    job.retries++;
    job.status = 'retrying';

    this.executing.delete(job.id);
    this.stats.retried++;
    this.stats.currentlyExecuting = this.executing.size;

    this.emit('job:retry', job);

    // Calculate backoff delay
    const delay = this.config.retryDelay * Math.pow(this.config.retryBackoff, job.retries - 1);

    // Wait before retrying
    await this.sleep(delay);

    // Re-enqueue
    job.status = 'queued';
    this.queues[job.priority].push(job);
  }

  /**
   * Get job status
   */
  getJob(jobId) {
    // Check executing
    if (this.executing.has(jobId)) {
      return this.executing.get(jobId);
    }

    // Check completed
    if (this.completed.has(jobId)) {
      return this.completed.get(jobId);
    }

    // Check failed
    if (this.failed.has(jobId)) {
      return this.failed.get(jobId);
    }

    // Check queued
    for (const queue of Object.values(this.queues)) {
      const job = queue.find(j => j.id === jobId);
      if (job) {
        return job;
      }
    }

    return null;
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId) {
    // Remove from queues
    for (const queue of Object.values(this.queues)) {
      const index = queue.findIndex(j => j.id === jobId);
      if (index !== -1) {
        const job = queue.splice(index, 1)[0];
        job.status = 'cancelled';
        this.emit('job:cancelled', job);
        return job;
      }
    }

    // Can't cancel if already executing
    if (this.executing.has(jobId)) {
      throw new Error('Cannot cancel job that is currently executing');
    }

    throw new Error(`Job not found: ${jobId}`);
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      ...this.stats,
      queued: {
        critical: this.queues.critical.length,
        high: this.queues.high.length,
        normal: this.queues.normal.length,
        low: this.queues.low.length,
        total: Object.values(this.queues).reduce((sum, q) => sum + q.length, 0)
      },
      executing: this.executing.size,
      completed: this.completed.size,
      failed: this.failed.size,
      uptime: Date.now() - this.stats.startTime
    };
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      processing: this.processing,
      stats: this.getStats(),
      config: {
        maxConcurrent: this.config.maxConcurrent,
        maxRetries: this.config.maxRetries,
        jobTimeout: this.config.jobTimeout
      }
    };
  }

  /**
   * Clear completed jobs (older than specified time)
   */
  clearCompleted(olderThanMs = 3600000) { // Default: 1 hour
    const cutoff = Date.now() - olderThanMs;
    let cleared = 0;

    for (const [jobId, job] of this.completed) {
      if (job.completedAt < cutoff) {
        this.completed.delete(jobId);
        cleared++;
      }
    }

    this.emit('completed:cleared', { count: cleared });
    return cleared;
  }

  /**
   * Clear failed jobs
   */
  clearFailed(olderThanMs = 86400000) { // Default: 24 hours
    const cutoff = Date.now() - olderThanMs;
    let cleared = 0;

    for (const [jobId, job] of this.failed) {
      if (job.failedAt < cutoff) {
        this.failed.delete(jobId);
        cleared++;
      }
    }

    this.emit('failed:cleared', { count: cleared });
    return cleared;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Need to install uuid
// npm install uuid

module.exports = QueueManager;
