const { spawn } = require('child_process');
const EventEmitter = require('events');

/**
 * Process lifecycle manager for MCP servers
 * Handles spawning, monitoring, and graceful shutdown of server processes
 */
class MCPProcessManager extends EventEmitter {
  constructor(logger) {
    super();
    this.logger = logger;
    this.processes = new Map();
    this.processMetrics = new Map();
  }

  /**
   * Start an MCP server process
   * @param {string} serverName - Server identifier
   * @param {Object} serverConfig - Server configuration
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Server process information
   */
  async startServer(serverName, serverConfig, options = {}) {
    if (this.processes.has(serverName)) {
      throw new Error(`Server ${serverName} is already running`);
    }

    this.logger.info(`Starting server: ${serverName}`, {
      command: serverConfig.command,
      args: serverConfig.args
    });

    try {
      const env = this.prepareEnvironment(serverConfig.env || {});
      const processOptions = {
        env,
        stdio: options.stdio || ['pipe', 'pipe', 'pipe'],
        cwd: options.cwd || process.cwd()
      };

      const serverProcess = spawn(
        serverConfig.command,
        serverConfig.args,
        processOptions
      );

      const processInfo = {
        process: serverProcess,
        config: serverConfig,
        startTime: Date.now(),
        status: 'starting',
        pid: serverProcess.pid,
        restartCount: 0
      };

      this.processes.set(serverName, processInfo);
      this.initializeProcessMetrics(serverName);
      this.attachProcessHandlers(serverName, serverProcess, serverConfig);

      // Wait for startup confirmation or timeout
      await this.waitForStartup(serverName, options.startupTimeout || 10000);

      processInfo.status = 'running';
      this.logger.success(`Server started: ${serverName}`, { pid: serverProcess.pid });

      this.emit('server:started', { serverName, pid: serverProcess.pid });

      return processInfo;
    } catch (error) {
      this.processes.delete(serverName);
      this.logger.error(`Failed to start server: ${serverName}`, {
        error: error.message
      });
      this.emit('server:error', { serverName, error });
      throw error;
    }
  }

  /**
   * Attach event handlers to server process
   */
  attachProcessHandlers(serverName, serverProcess, serverConfig) {
    const metrics = this.processMetrics.get(serverName);

    // Stdout handler
    serverProcess.stdout.on('data', (data) => {
      const message = data.toString();
      metrics.outputCount++;
      metrics.lastOutput = Date.now();

      this.logger.debug(`[${serverName}] stdout`, { message: message.trim() });
      this.emit('server:stdout', { serverName, data: message });
    });

    // Stderr handler - differentiate between info and errors
    serverProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      metrics.errorCount++;

      const normalPatterns = [
        'running on stdio',
        'Server running',
        'MCP Server running',
        'started successfully',
        'waiting for client'
      ];

      const isNormalMessage = normalPatterns.some(pattern =>
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isNormalMessage) {
        this.logger.info(`[${serverName}] ${message}`);
        this.emit('server:info', { serverName, message });
      } else {
        this.logger.warn(`[${serverName}] stderr`, { message });
        this.emit('server:stderr', { serverName, data: message });
      }
    });

    // Process exit handler
    serverProcess.on('exit', (code, signal) => {
      const processInfo = this.processes.get(serverName);
      const uptime = processInfo ? Date.now() - processInfo.startTime : 0;

      this.logger.info(`Server exited: ${serverName}`, {
        code,
        signal,
        uptime,
        pid: serverProcess.pid
      });

      this.processes.delete(serverName);

      this.emit('server:exit', {
        serverName,
        code,
        signal,
        uptime,
        metrics: this.processMetrics.get(serverName)
      });

      // Auto-restart logic if configured
      if (
        serverConfig.autoRestart &&
        processInfo &&
        processInfo.restartCount < (serverConfig.maxRestarts || 3)
      ) {
        this.logger.info(`Auto-restarting server: ${serverName}`);
        setTimeout(() => {
          this.startServer(serverName, serverConfig).catch(err => {
            this.logger.error(`Auto-restart failed: ${serverName}`, {
              error: err.message
            });
          });
        }, serverConfig.restartDelay || 5000);
      }
    });

    // Process error handler
    serverProcess.on('error', (error) => {
      this.logger.error(`Process error: ${serverName}`, {
        error: error.message,
        pid: serverProcess.pid
      });

      this.emit('server:process-error', { serverName, error });
    });
  }

  /**
   * Prepare environment variables for server process
   */
  prepareEnvironment(envConfig) {
    const env = { ...process.env };

    for (const [key, value] of Object.entries(envConfig)) {
      if (typeof value === 'string') {
        env[key] = value.replace(/\$\{(\w+)\}/g, (match, varName) => {
          const envValue = process.env[varName];
          if (!envValue) {
            this.logger.warn(`Environment variable not found: ${varName}`);
          }
          return envValue || match;
        });
      } else {
        env[key] = value;
      }
    }

    return env;
  }

  /**
   * Initialize metrics tracking for a server
   */
  initializeProcessMetrics(serverName) {
    this.processMetrics.set(serverName, {
      outputCount: 0,
      errorCount: 0,
      lastOutput: null,
      memoryUsage: [],
      cpuUsage: []
    });
  }

  /**
   * Wait for server startup confirmation
   */
  async waitForStartup(serverName, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Server startup timeout: ${serverName}`));
      }, timeout);

      const checkStartup = () => {
        const processInfo = this.processes.get(serverName);
        if (
          processInfo &&
          processInfo.process &&
          !processInfo.process.killed
        ) {
          clearTimeout(timer);
          resolve();
        }
      };

      // Check immediately and then periodically
      checkStartup();
      const interval = setInterval(checkStartup, 100);

      setTimeout(() => clearInterval(interval), timeout);
    });
  }

  /**
   * Stop a server gracefully
   * @param {string} serverName - Server identifier
   * @param {Object} options - Stop options
   * @returns {Promise<void>}
   */
  async stopServer(serverName, options = {}) {
    const processInfo = this.processes.get(serverName);

    if (!processInfo) {
      throw new Error(`Server ${serverName} is not running`);
    }

    this.logger.info(`Stopping server: ${serverName}`, {
      pid: processInfo.pid,
      graceful: options.graceful !== false
    });

    processInfo.status = 'stopping';

    return new Promise((resolve) => {
      const { process: serverProcess } = processInfo;
      const gracefulTimeout = options.timeout || 5000;

      // Try graceful shutdown first
      if (options.graceful !== false) {
        serverProcess.kill('SIGTERM');

        const timer = setTimeout(() => {
          if (this.processes.has(serverName)) {
            this.logger.warn(`Forcing shutdown: ${serverName}`);
            serverProcess.kill('SIGKILL');
          }
        }, gracefulTimeout);

        serverProcess.once('exit', () => {
          clearTimeout(timer);
          this.processes.delete(serverName);
          this.logger.success(`Server stopped: ${serverName}`);
          this.emit('server:stopped', { serverName });
          resolve();
        });
      } else {
        serverProcess.kill('SIGKILL');
        this.processes.delete(serverName);
        this.emit('server:stopped', { serverName, forced: true });
        resolve();
      }
    });
  }

  /**
   * Stop all running servers
   */
  async stopAll(options = {}) {
    const serverNames = Array.from(this.processes.keys());
    this.logger.info(`Stopping ${serverNames.length} servers`);

    const stopPromises = serverNames.map(name =>
      this.stopServer(name, options).catch(err => {
        this.logger.error(`Failed to stop ${name}`, { error: err.message });
      })
    );

    await Promise.all(stopPromises);
    this.logger.success('All servers stopped');
  }

  /**
   * Get server process information
   */
  getServerInfo(serverName) {
    const processInfo = this.processes.get(serverName);
    const metrics = this.processMetrics.get(serverName);

    if (!processInfo) {
      return null;
    }

    return {
      name: serverName,
      pid: processInfo.pid,
      status: processInfo.status,
      uptime: Date.now() - processInfo.startTime,
      startTime: processInfo.startTime,
      restartCount: processInfo.restartCount,
      metrics: metrics || {}
    };
  }

  /**
   * Get all server information
   */
  getAllServersInfo() {
    const info = {};

    for (const serverName of this.processes.keys()) {
      info[serverName] = this.getServerInfo(serverName);
    }

    return info;
  }

  /**
   * Check if server is running
   */
  isRunning(serverName) {
    const processInfo = this.processes.get(serverName);
    return processInfo && processInfo.status === 'running';
  }

  /**
   * Restart a server
   */
  async restartServer(serverName, serverConfig) {
    this.logger.info(`Restarting server: ${serverName}`);

    const processInfo = this.processes.get(serverName);
    if (processInfo) {
      processInfo.restartCount++;
      await this.stopServer(serverName);
    }

    await this.startServer(serverName, serverConfig);
  }

  /**
   * Send signal to server process
   */
  sendSignal(serverName, signal) {
    const processInfo = this.processes.get(serverName);

    if (!processInfo) {
      throw new Error(`Server ${serverName} is not running`);
    }

    processInfo.process.kill(signal);
    this.logger.info(`Signal sent to ${serverName}`, { signal, pid: processInfo.pid });
  }
}

module.exports = MCPProcessManager;
