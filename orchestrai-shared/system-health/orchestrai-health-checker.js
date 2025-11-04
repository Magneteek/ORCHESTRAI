#!/usr/bin/env node

// ORCHESTRAI System Health Checker
// Validates all critical system components before task execution

const Redis = require('redis');
const { exec } = require('child_process');
const http = require('http');
const util = require('util');

const execPromise = util.promisify(exec);

class ORCHESTRAIHealthChecker {
  constructor() {
    this.healthStatus = {
      redis: { status: 'unknown', details: null, critical: true },
      orchestrator: { status: 'unknown', details: null, critical: true },
      mcpServers: { status: 'unknown', details: null, critical: true },
      domainAgents: { status: 'unknown', details: null, critical: false },
      systemOverall: 'unknown'
    };
    
    this.config = {
      redis: {
        host: 'localhost',
        port: 6379,
        timeout: 3000
      },
      orchestrator: {
        host: 'localhost',
        port: 5501,
        timeout: 5000
      },
      checks: {
        timeout: 10000,
        retries: 2
      }
    };
  }

  // Main health check method
  async checkSystemHealth(verbose = false) {
    console.log('🔍 ORCHESTRAI System Health Check');
    console.log('═══════════════════════════════════');
    
    const startTime = Date.now();
    
    try {
      // Run all health checks in parallel for speed
      await Promise.allSettled([
        this.checkRedis(),
        this.checkOrchestrator(),
        this.checkMCPServers(),
        this.checkDomainAgents()
      ]);
      
      const duration = Date.now() - startTime;
      this.determineOverallStatus();
      
      // Display results
      this.displayHealthReport(verbose);
      
      // Return status for programmatic use
      return {
        healthy: this.healthStatus.systemOverall === 'healthy',
        status: this.healthStatus,
        duration: duration,
        recommendations: this.getRecommendations()
      };
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return {
        healthy: false,
        status: this.healthStatus,
        error: error.message,
        recommendations: ['Check system logs', 'Restart ORCHESTRAI services']
      };
    }
  }

  async checkRedis() {
    try {
      console.log('🔄 Checking Redis connection...');
      
      const redis = Redis.createClient({
        socket: {
          host: this.config.redis.host,
          port: this.config.redis.port,
          connectTimeout: this.config.redis.timeout
        }
      });

      // Test connection
      await redis.connect();
      await redis.ping();
      
      // Test basic operations
      await redis.set('orchestrai:health:test', 'ok', { EX: 60 });
      const testValue = await redis.get('orchestrai:health:test');
      
      if (testValue !== 'ok') {
        throw new Error('Redis read/write test failed');
      }
      
      await redis.disconnect();
      
      this.healthStatus.redis = {
        status: 'healthy',
        details: `Connected to Redis at ${this.config.redis.host}:${this.config.redis.port}`,
        critical: true
      };
      
      console.log('✅ Redis: HEALTHY');
      
    } catch (error) {
      this.healthStatus.redis = {
        status: 'unhealthy',
        details: `Redis connection failed: ${error.message}`,
        critical: true,
        error: error.message
      };
      
      console.log('❌ Redis: OFFLINE');
    }
  }

  async checkOrchestrator() {
    try {
      console.log('🔄 Checking ORCHESTRAI Orchestrator...');
      
      const healthData = await this.makeHttpRequest('GET', '/health');
      
      if (!healthData.status || healthData.status !== 'operational') {
        throw new Error(`Orchestrator status: ${healthData.status || 'unknown'}`);
      }
      
      // Check initialization state
      const init = healthData.initialization || {};
      const criticalServices = ['redis', 'mcp', 'mainAgent', 'domainManager'];
      const failedServices = criticalServices.filter(service => 
        init[service] === 'failed' || init[service] === 'error'
      );
      
      if (failedServices.length > 0) {
        throw new Error(`Critical services failed: ${failedServices.join(', ')}`);
      }
      
      this.healthStatus.orchestrator = {
        status: 'healthy',
        details: `Orchestrator operational (uptime: ${Math.round(healthData.uptime / 1000)}s)`,
        critical: true,
        metadata: {
          uptime: healthData.uptime,
          initializationProgress: init.initializationProgress,
          activeAgents: healthData.metrics?.activeAgents || 0
        }
      };
      
      console.log('✅ Orchestrator: HEALTHY');
      
    } catch (error) {
      this.healthStatus.orchestrator = {
        status: 'unhealthy',
        details: `Orchestrator not accessible: ${error.message}`,
        critical: true,
        error: error.message
      };
      
      console.log('❌ Orchestrator: OFFLINE');
    }
  }

  async checkMCPServers() {
    try {
      console.log('🔄 Checking MCP Servers...');
      
      const mcpData = await this.makeHttpRequest('GET', '/mcp/status');
      
      const totalServers = mcpData.totalServers || 0;
      const runningServers = mcpData.runningServers || 0;
      
      if (totalServers === 0) {
        throw new Error('No MCP servers configured');
      }
      
      if (runningServers < totalServers * 0.8) {
        throw new Error(`Only ${runningServers}/${totalServers} MCP servers running`);
      }
      
      this.healthStatus.mcpServers = {
        status: 'healthy',
        details: `${runningServers}/${totalServers} MCP servers running`,
        critical: true,
        metadata: {
          totalServers,
          runningServers,
          serverList: Object.keys(mcpData.servers || {})
        }
      };
      
      console.log('✅ MCP Servers: HEALTHY');
      
    } catch (error) {
      this.healthStatus.mcpServers = {
        status: 'unhealthy',
        details: `MCP servers check failed: ${error.message}`,
        critical: true,
        error: error.message
      };
      
      console.log('❌ MCP Servers: DEGRADED');
    }
  }

  async checkDomainAgents() {
    try {
      console.log('🔄 Checking Domain Agents...');
      
      const domainsData = await this.makeHttpRequest('GET', '/domains');
      const agentsData = await this.makeHttpRequest('GET', '/agents/live-status');
      
      const activeDomains = Object.keys(domainsData || {}).length;
      const totalAgents = agentsData.totalAgents || 0;
      const activeAgents = agentsData.activeAgents || 0;
      
      if (activeDomains === 0) {
        throw new Error('No domain agents registered');
      }
      
      this.healthStatus.domainAgents = {
        status: activeDomains >= 3 ? 'healthy' : 'degraded',
        details: `${activeDomains} domains, ${activeAgents}/${totalAgents} agents active`,
        critical: false,
        metadata: {
          activeDomains,
          totalAgents,
          activeAgents,
          domains: Object.keys(domainsData || {})
        }
      };
      
      console.log('✅ Domain Agents: OPERATIONAL');
      
    } catch (error) {
      this.healthStatus.domainAgents = {
        status: 'unhealthy',
        details: `Domain agents check failed: ${error.message}`,
        critical: false,
        error: error.message
      };
      
      console.log('❌ Domain Agents: UNKNOWN');
    }
  }

  async makeHttpRequest(method, path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.config.orchestrator.host,
        port: this.config.orchestrator.port,
        path: path,
        method: method,
        timeout: this.config.orchestrator.timeout
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data.substring(0, 100)}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${this.config.orchestrator.timeout}ms`));
      });

      req.end();
    });
  }

  determineOverallStatus() {
    const criticalServices = Object.entries(this.healthStatus).filter(
      ([key, value]) => value.critical && key !== 'systemOverall'
    );
    
    const failedCritical = criticalServices.filter(
      ([key, value]) => value.status === 'unhealthy'
    );
    
    if (failedCritical.length > 0) {
      this.healthStatus.systemOverall = 'critical';
    } else {
      const allHealthy = Object.entries(this.healthStatus).every(
        ([key, value]) => key === 'systemOverall' || value.status === 'healthy'
      );
      
      this.healthStatus.systemOverall = allHealthy ? 'healthy' : 'degraded';
    }
  }

  displayHealthReport(verbose = false) {
    console.log('\n📊 HEALTH REPORT');
    console.log('═══════════════════');
    
    // Overall status
    const statusEmoji = {
      'healthy': '✅',
      'degraded': '⚠️',
      'critical': '❌',
      'unknown': '❓'
    };
    
    console.log(`${statusEmoji[this.healthStatus.systemOverall]} Overall Status: ${this.healthStatus.systemOverall.toUpperCase()}`);
    console.log('');
    
    // Component details
    Object.entries(this.healthStatus).forEach(([component, status]) => {
      if (component === 'systemOverall') return;
      
      const emoji = statusEmoji[status.status] || '❓';
      const critical = status.critical ? ' (CRITICAL)' : '';
      
      console.log(`${emoji} ${component.toUpperCase()}${critical}: ${status.status.toUpperCase()}`);
      
      if (verbose || status.status !== 'healthy') {
        console.log(`   ${status.details}`);
        if (status.error && verbose) {
          console.log(`   Error: ${status.error}`);
        }
      }
    });
    
    console.log('');
    
    // Recommendations
    const recommendations = this.getRecommendations();
    if (recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      recommendations.forEach(rec => console.log(`   • ${rec}`));
      console.log('');
    }
    
    // Usage guidance
    if (this.healthStatus.systemOverall === 'healthy') {
      console.log('🚀 System ready for Task tool usage!');
    } else if (this.healthStatus.systemOverall === 'degraded') {
      console.log('⚠️  System partially functional - some features may be limited');
    } else {
      console.log('🚨 System not ready - please resolve critical issues before using Task tool');
    }
  }

  getRecommendations() {
    const recommendations = [];
    
    if (this.healthStatus.redis.status === 'unhealthy') {
      recommendations.push('Start Redis: npm run redis');
    }
    
    if (this.healthStatus.orchestrator.status === 'unhealthy') {
      recommendations.push('Start ORCHESTRAI: npm run orchestrator');
    }
    
    if (this.healthStatus.mcpServers.status === 'unhealthy') {
      recommendations.push('Check MCP server configuration and restart orchestrator');
    }
    
    if (this.healthStatus.domainAgents.status === 'unhealthy') {
      recommendations.push('Wait for domain agents to initialize (may take 30-60 seconds)');
    }
    
    if (this.healthStatus.systemOverall === 'critical') {
      recommendations.push('Run: npm run setup to initialize all services');
    }
    
    return recommendations;
  }

  // Quick status check method for inline usage
  async quickCheck() {
    try {
      // Fast checks only
      const [redisOk, orchestratorOk] = await Promise.allSettled([
        this.isRedisRunning(),
        this.isOrchestratorRunning()
      ]);
      
      const redisHealthy = redisOk.status === 'fulfilled' && redisOk.value;
      const orchestratorHealthy = orchestratorOk.status === 'fulfilled' && orchestratorOk.value;
      
      return {
        ready: redisHealthy && orchestratorHealthy,
        redis: redisHealthy,
        orchestrator: orchestratorHealthy
      };
      
    } catch (error) {
      return {
        ready: false,
        redis: false,
        orchestrator: false,
        error: error.message
      };
    }
  }

  async isRedisRunning() {
    try {
      const redis = Redis.createClient({
        socket: {
          host: this.config.redis.host,
          port: this.config.redis.port,
          connectTimeout: 1000
        }
      });
      
      await redis.connect();
      await redis.ping();
      await redis.disconnect();
      return true;
    } catch (error) {
      return false;
    }
  }

  async isOrchestratorRunning() {
    try {
      const healthData = await this.makeHttpRequest('GET', '/health');
      return healthData.status === 'operational';
    } catch (error) {
      return false;
    }
  }

  // Static method for easy CLI usage
  static async run() {
    const checker = new ORCHESTRAIHealthChecker();
    const result = await checker.checkSystemHealth(true);
    
    // Exit with appropriate code
    process.exit(result.healthy ? 0 : 1);
  }
}

// CLI execution
if (require.main === module) {
  ORCHESTRAIHealthChecker.run().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = ORCHESTRAIHealthChecker;