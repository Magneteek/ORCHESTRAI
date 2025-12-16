/**
 * ORCHESTRAI Resource Monitor
 *
 * Prevents crashes by monitoring system resources and taking action
 * when memory/CPU usage exceeds safe thresholds.
 *
 * Features:
 * - Real-time memory monitoring
 * - CPU load tracking
 * - Automatic agent throttling
 * - Crash prevention alerts
 * - Resource usage history
 */

const os = require('os');
const EventEmitter = require('events');

class ResourceMonitor extends EventEmitter {
  constructor(options = {}) {
    super();

    // Configuration
    this.config = {
      memoryThreshold: options.memoryThreshold || 0.85, // 85% of available memory
      cpuThreshold: options.cpuThreshold || 0.90,       // 90% CPU usage
      checkInterval: options.checkInterval || 10000,     // Check every 10 seconds
      historySize: options.historySize || 60,            // Keep 60 data points (10 mins at 10s interval)
      enableAutoThrottle: options.enableAutoThrottle !== false, // Auto-throttle agents
      enableGC: options.enableGC !== false               // Trigger GC when needed
    };

    // State
    this.isMonitoring = false;
    this.intervalId = null;
    this.history = {
      memory: [],
      cpu: [],
      timestamps: []
    };

    // Current state
    this.currentState = {
      memoryUsagePercent: 0,
      memoryUsedMB: 0,
      memoryTotalMB: 0,
      cpuLoadPercent: 0,
      heapUsedMB: 0,
      heapTotalMB: 0,
      isUnderPressure: false,
      pressureLevel: 'normal', // normal, warning, critical
      throttledAgents: 0
    };

    // Stats
    this.stats = {
      totalChecks: 0,
      warningEvents: 0,
      criticalEvents: 0,
      gcTriggered: 0,
      agentsThrottled: 0
    };
  }

  /**
   * Start monitoring resources
   */
  start() {
    if (this.isMonitoring) {
      console.log('Warning: Resource monitor is already running');
      return;
    }

    console.log('Starting resource monitor...');
    console.log('  Memory threshold:', (this.config.memoryThreshold * 100).toFixed(0) + '%');
    console.log('  CPU threshold:', (this.config.cpuThreshold * 100).toFixed(0) + '%');
    console.log('  Check interval:', this.config.checkInterval + 'ms');
    console.log('');

    this.isMonitoring = true;

    // Initial check
    this.checkResources();

    // Start interval
    this.intervalId = setInterval(() => {
      this.checkResources();
    }, this.config.checkInterval);

    this.emit('started');
  }

  /**
   * Stop monitoring resources
   */
  stop() {
    if (!this.isMonitoring) {
      return;
    }

    console.log('Stopping resource monitor...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isMonitoring = false;
    this.emit('stopped');
  }

  /**
   * Check current resource usage
   */
  checkResources() {
    this.stats.totalChecks++;

    // Memory metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercent = usedMem / totalMem;

    // Heap metrics
    const heapStats = process.memoryUsage();
    const heapUsedMB = Math.round(heapStats.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(heapStats.heapTotal / 1024 / 1024);

    // CPU metrics
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const cpuPercent = 1 - (totalIdle / totalTick);

    // Update current state
    this.currentState = {
      memoryUsagePercent: memoryPercent,
      memoryUsedMB: Math.round(usedMem / 1024 / 1024),
      memoryTotalMB: Math.round(totalMem / 1024 / 1024),
      cpuLoadPercent: cpuPercent,
      heapUsedMB,
      heapTotalMB,
      isUnderPressure: false,
      pressureLevel: 'normal',
      throttledAgents: 0
    };

    // Determine pressure level
    if (memoryPercent > this.config.memoryThreshold || cpuPercent > this.config.cpuThreshold) {
      this.currentState.isUnderPressure = true;

      if (memoryPercent > 0.95 || cpuPercent > 0.95) {
        this.currentState.pressureLevel = 'critical';
        this.handleCriticalPressure();
      } else {
        this.currentState.pressureLevel = 'warning';
        this.handleWarningPressure();
      }
    }

    // Store in history
    this.history.memory.push(memoryPercent);
    this.history.cpu.push(cpuPercent);
    this.history.timestamps.push(Date.now());

    // Trim history to configured size
    if (this.history.memory.length > this.config.historySize) {
      this.history.memory.shift();
      this.history.cpu.shift();
      this.history.timestamps.shift();
    }

    // Emit update event
    this.emit('update', this.currentState);

    return this.currentState;
  }

  /**
   * Handle warning level pressure (85-95% usage)
   */
  handleWarningPressure() {
    this.stats.warningEvents++;

    console.log('WARNING: Resource pressure detected');
    console.log('  Memory:', (this.currentState.memoryUsagePercent * 100).toFixed(1) + '%');
    console.log('  Heap:', this.currentState.heapUsedMB + 'MB /', this.currentState.heapTotalMB + 'MB');

    // Emit warning event
    this.emit('pressure:warning', this.currentState);

    // Auto-throttle if enabled
    if (this.config.enableAutoThrottle) {
      console.log('  Auto-throttling: Reducing concurrent agents');
      this.emit('throttle:request', { level: 'moderate' });
    }
  }

  /**
   * Handle critical level pressure (>95% usage)
   */
  handleCriticalPressure() {
    this.stats.criticalEvents++;

    console.log('CRITICAL: Resource pressure detected!');
    console.log('  Memory:', (this.currentState.memoryUsagePercent * 100).toFixed(1) + '%');
    console.log('  Heap:', this.currentState.heapUsedMB + 'MB /', this.currentState.heapTotalMB + 'MB');
    console.log('  CPU:', (this.currentState.cpuLoadPercent * 100).toFixed(1) + '%');

    // Emit critical event
    this.emit('pressure:critical', this.currentState);

    // Aggressive throttling
    if (this.config.enableAutoThrottle) {
      console.log('  Auto-throttling: Pausing new agents, queuing tasks');
      this.emit('throttle:request', { level: 'aggressive' });
    }

    // Trigger garbage collection if available
    if (this.config.enableGC && global.gc) {
      console.log('  Triggering garbage collection...');
      try {
        global.gc();
        this.stats.gcTriggered++;
        console.log('  GC completed');
      } catch (error) {
        console.log('  GC failed:', error.message);
      }
    }
  }

  /**
   * Get current resource state
   */
  getState() {
    return Object.assign({}, this.currentState);
  }

  /**
   * Get resource statistics
   */
  getStats() {
    return Object.assign({}, this.stats, {
      uptime: this.isMonitoring ? Date.now() - this.history.timestamps[0] : 0,
      averageMemory: this.getAverageMemory(),
      averageCPU: this.getAverageCPU(),
      peakMemory: this.getPeakMemory(),
      peakCPU: this.getPeakCPU()
    });
  }

  /**
   * Get resource history
   */
  getHistory() {
    return {
      memory: Array.from(this.history.memory),
      cpu: Array.from(this.history.cpu),
      timestamps: Array.from(this.history.timestamps)
    };
  }

  /**
   * Calculate average memory usage
   */
  getAverageMemory() {
    if (this.history.memory.length === 0) return 0;
    const sum = this.history.memory.reduce((a, b) => a + b, 0);
    return sum / this.history.memory.length;
  }

  /**
   * Calculate average CPU usage
   */
  getAverageCPU() {
    if (this.history.cpu.length === 0) return 0;
    const sum = this.history.cpu.reduce((a, b) => a + b, 0);
    return sum / this.history.cpu.length;
  }

  /**
   * Get peak memory usage
   */
  getPeakMemory() {
    if (this.history.memory.length === 0) return 0;
    return Math.max.apply(null, this.history.memory);
  }

  /**
   * Get peak CPU usage
   */
  getPeakCPU() {
    if (this.history.cpu.length === 0) return 0;
    return Math.max.apply(null, this.history.cpu);
  }

  /**
   * Check if system is safe for heavy operations
   */
  isSafeForHeavyOperation() {
    return !this.currentState.isUnderPressure &&
           this.currentState.memoryUsagePercent < 0.70 &&
           this.currentState.cpuLoadPercent < 0.70;
  }

  /**
   * Get recommended max parallel agents
   */
  getRecommendedMaxAgents() {
    const memPercent = this.currentState.memoryUsagePercent;

    if (memPercent < 0.50) return 6;  // Light load: 6 agents
    if (memPercent < 0.70) return 3;  // Medium load: 3 agents
    if (memPercent < 0.85) return 2;  // Heavy load: 2 agents
    return 1;                         // Critical: 1 agent only
  }
}

// Singleton instance
let monitorInstance = null;

/**
 * Get or create resource monitor instance
 */
function getResourceMonitor(options) {
  if (!monitorInstance) {
    monitorInstance = new ResourceMonitor(options);
  }
  return monitorInstance;
}

module.exports = {
  ResourceMonitor,
  getResourceMonitor
};
