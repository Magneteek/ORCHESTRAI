/**
 * Filesystem Handler - Watch for file system changes
 *
 * Uses chokidar for robust file watching
 */

const chokidar = require('chokidar');
const path = require('path');
const EventEmitter = require('events');

class FilesystemHandler extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      persistent: options.persistent !== false,
      ignoreInitial: options.ignoreInitial !== false,
      ignored: options.ignored || /(^|[\/\\])\../, // Ignore dot files
      ...options
    };

    // Active watchers
    this.watchers = new Map();

    // Trigger engine (injected)
    this.triggerEngine = options.triggerEngine || null;
  }

  /**
   * Watch a path
   */
  watch(watchConfig) {
    const watchId = watchConfig.id || `watch-${Date.now()}`;

    if (this.watchers.has(watchId)) {
      throw new Error(`Watcher already exists: ${watchId}`);
    }

    // Create watcher
    const watcher = chokidar.watch(watchConfig.path, {
      ...this.config,
      ...watchConfig.options
    });

    // Register event handlers
    const events = watchConfig.events || ['add', 'change', 'unlink'];

    events.forEach(eventType => {
      watcher.on(eventType, async (filepath, stats) => {
        await this.handleFileEvent(watchId, eventType, filepath, stats, watchConfig);
      });
    });

    watcher.on('error', error => {
      this.emit('watcher:error', { watchId, error });
    });

    // Store watcher
    this.watchers.set(watchId, {
      id: watchId,
      watcher,
      config: watchConfig,
      createdAt: new Date().toISOString()
    });

    this.emit('watcher:started', { watchId, path: watchConfig.path });

    return watchId;
  }

  /**
   * Handle file system event
   */
  async handleFileEvent(watchId, eventType, filepath, stats, config) {
    // Create event
    const event = {
      type: 'filesystem',
      event: `filesystem.${eventType}`,
      data: {
        watchId,
        path: filepath,
        filename: path.basename(filepath),
        dirname: path.dirname(filepath),
        ext: path.extname(filepath),
        stats: stats ? {
          size: stats.size,
          modified: stats.mtime,
          created: stats.birthtime
        } : null
      },
      metadata: {
        watchConfig: config,
        triggeredAt: new Date().toISOString()
      }
    };

    // Process through trigger engine if available
    if (this.triggerEngine) {
      try {
        await this.triggerEngine.processEvent(event);
      } catch (error) {
        this.emit('event:error', { event, error });
      }
    } else {
      // Fallback: emit event
      this.emit('file:event', event);
    }
  }

  /**
   * Handle an externally-dispatched filesystem event (satisfies TriggerEngine handler interface)
   */
  async handleEvent(event) {
    if (this.triggerEngine) {
      return await this.triggerEngine.processEvent(event);
    }
    this.emit('file:event', event);
  }

  /**
   * Unwatch a path
   */
  async unwatch(watchId) {
    const watcherData = this.watchers.get(watchId);
    if (!watcherData) {
      throw new Error(`Watcher not found: ${watchId}`);
    }

    await watcherData.watcher.close();
    this.watchers.delete(watchId);

    this.emit('watcher:stopped', { watchId });

    return watcherData;
  }

  /**
   * Get all watchers
   */
  getWatchers() {
    return Array.from(this.watchers.values()).map(({ watcher, ...data }) => data);
  }

  /**
   * Close all watchers
   */
  async closeAll() {
    const promises = [];

    for (const [watchId, watcherData] of this.watchers) {
      promises.push(watcherData.watcher.close());
    }

    await Promise.all(promises);
    this.watchers.clear();

    this.emit('watchers:closed');
  }
}

module.exports = FilesystemHandler;
