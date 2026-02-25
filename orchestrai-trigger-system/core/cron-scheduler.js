/**
 * Cron Scheduler - Time-based trigger execution
 *
 * Features:
 * - Standard cron expressions
 * - Natural language scheduling
 * - Timezone support
 * - One-time and recurring jobs
 * - Job history and next run times
 */

const EventEmitter = require('events');
const cron = require('node-cron');

class CronScheduler extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      timezone: options.timezone || 'America/New_York',
      maxHistory: options.maxHistory || 100,
      ...options
    };

    // Scheduled jobs
    this.jobs = new Map();

    // Job history
    this.history = [];

    // Trigger engine (injected)
    this.triggerEngine = options.triggerEngine || null;

    // Statistics
    this.stats = {
      scheduled: 0,
      executed: 0,
      failed: 0,
      startTime: Date.now()
    };
  }

  /**
   * Schedule a cron job
   */
  schedule(jobConfig) {
    const jobId = jobConfig.id || `cron-${Date.now()}`;

    // Parse schedule
    const schedule = this.parseSchedule(jobConfig.schedule);

    if (!cron.validate(schedule)) {
      throw new Error(`Invalid cron expression: ${schedule}`);
    }

    // Create job configuration
    const job = {
      id: jobId,
      name: jobConfig.name || jobId,
      schedule,
      scheduleNatural: jobConfig.schedule,
      timezone: jobConfig.timezone || this.config.timezone,
      enabled: jobConfig.enabled !== false,

      // Trigger configuration
      trigger: {
        type: 'cron',
        agent: jobConfig.agent,
        parameters: jobConfig.parameters || {},
        priority: jobConfig.priority || 'normal'
      },

      // Metadata
      description: jobConfig.description || '',
      tags: jobConfig.tags || [],
      createdAt: new Date().toISOString(),
      lastRun: null,
      nextRun: null,
      runCount: 0
    };

    // Create cron task
    const task = cron.schedule(
      schedule,
      async () => {
        await this.executeJob(job);
      },
      {
        scheduled: job.enabled,
        timezone: job.timezone
      }
    );

    // Calculate next run
    job.nextRun = this.getNextRun(schedule, job.timezone);

    // Store job
    this.jobs.set(jobId, { ...job, task });
    this.stats.scheduled++;

    this.emit('job:scheduled', job);

    return job;
  }

  /**
   * Parse schedule (cron expression or natural language)
   */
  parseSchedule(schedule) {
    // If already valid cron, return it
    if (cron.validate(schedule)) {
      return schedule;
    }

    // Parse natural language
    const natural = schedule.toLowerCase().trim();

    // Every X minutes
    if (natural.match(/every (\d+) minutes?/)) {
      const minutes = natural.match(/every (\d+) minutes?/)[1];
      return `*/${minutes} * * * *`;
    }

    // Every hour
    if (natural === 'every hour' || natural === 'hourly') {
      return '0 * * * *';
    }

    // Every X hours
    if (natural.match(/every (\d+) hours?/)) {
      const hours = natural.match(/every (\d+) hours?/)[1];
      return `0 */${hours} * * *`;
    }

    // Daily at time
    if (natural.match(/daily at (\d+):(\d+)/)) {
      const match = natural.match(/daily at (\d+):(\d+)/);
      return `${match[2]} ${match[1]} * * *`;
    }

    // Every day
    if (natural === 'daily' || natural === 'every day') {
      return '0 0 * * *';
    }

    // Weekly
    if (natural === 'weekly' || natural === 'every week') {
      return '0 0 * * 0'; // Sunday
    }

    // Weekdays
    if (natural === 'weekdays') {
      return '0 9 * * 1-5'; // Monday-Friday at 9 AM
    }

    // Monthly
    if (natural === 'monthly' || natural === 'every month') {
      return '0 0 1 * *'; // 1st of month
    }

    // Couldn't parse
    throw new Error(`Could not parse schedule: ${schedule}. Use cron expression or natural language like "daily at 9:00", "every 30 minutes", etc.`);
  }

  /**
   * Execute a cron job
   */
  async executeJob(job) {
    if (!job.enabled) {
      return;
    }

    job.lastRun = new Date().toISOString();
    job.runCount++;

    this.emit('job:executing', job);

    try {
      // Create event for trigger engine
      const event = {
        type: 'cron',
        event: 'cron.scheduled',
        data: {
          jobId: job.id,
          jobName: job.name,
          schedule: job.schedule
        },
        metadata: {
          triggeredAt: job.lastRun,
          runCount: job.runCount
        }
      };

      // Process through trigger engine if available
      if (this.triggerEngine) {
        await this.triggerEngine.processEvent(event);
      } else {
        // Fallback: emit event
        this.emit('job:triggered', { job, event });
      }

      // Update history
      this.addToHistory({
        jobId: job.id,
        jobName: job.name,
        status: 'completed',
        timestamp: job.lastRun
      });

      this.stats.executed++;
      this.emit('job:completed', job);

    } catch (error) {
      this.addToHistory({
        jobId: job.id,
        jobName: job.name,
        status: 'failed',
        error: error.message,
        timestamp: job.lastRun
      });

      this.stats.failed++;
      this.emit('job:failed', { job, error });
    }

    // Calculate next run
    job.nextRun = this.getNextRun(job.schedule, job.timezone);
  }

  /**
   * Get next run time for a cron expression
   */
  getNextRun(schedule, timezone) {
    try {
      // This is approximate - for exact calculation, would need a full cron parser
      const now = new Date();
      // Simplified: just return near future
      return new Date(now.getTime() + 60000).toISOString(); // +1 minute
    } catch (error) {
      return null;
    }
  }

  /**
   * Add to history
   */
  addToHistory(entry) {
    this.history.unshift(entry);

    // Trim history
    if (this.history.length > this.config.maxHistory) {
      this.history = this.history.slice(0, this.config.maxHistory);
    }
  }

  /**
   * Unschedule a job
   */
  unschedule(jobId) {
    const jobData = this.jobs.get(jobId);
    if (!jobData) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Stop cron task
    jobData.task.stop();

    // Remove from jobs
    this.jobs.delete(jobId);

    this.emit('job:unscheduled', jobData);

    return jobData;
  }

  /**
   * Enable/disable job
   */
  setJobEnabled(jobId, enabled) {
    const jobData = this.jobs.get(jobId);
    if (!jobData) {
      throw new Error(`Job not found: ${jobId}`);
    }

    jobData.enabled = enabled;

    if (enabled) {
      jobData.task.start();
    } else {
      jobData.task.stop();
    }

    this.emit(enabled ? 'job:enabled' : 'job:disabled', jobData);

    return jobData;
  }

  /**
   * Get all jobs
   */
  getJobs(filter = {}) {
    const jobs = Array.from(this.jobs.values()).map(({ task, ...job }) => job);

    if (filter.enabled !== undefined) {
      return jobs.filter(j => j.enabled === filter.enabled);
    }

    if (filter.agent) {
      return jobs.filter(j => j.trigger.agent === filter.agent);
    }

    return jobs;
  }

  /**
   * Get job by ID
   */
  getJob(jobId) {
    const jobData = this.jobs.get(jobId);
    if (!jobData) {
      return null;
    }

    const { task, ...job } = jobData;
    return job;
  }

  /**
   * Get history
   */
  getHistory(limit = 50) {
    return this.history.slice(0, limit);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      active: Array.from(this.jobs.values()).filter(j => j.enabled).length,
      total: this.jobs.size,
      uptime: Date.now() - this.stats.startTime
    };
  }
}

module.exports = CronScheduler;
