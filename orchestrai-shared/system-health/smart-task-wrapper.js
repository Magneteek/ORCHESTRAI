// Smart Task Wrapper with Automatic Health Checking
// Ensures ORCHESTRAI system is healthy before executing Task tool operations

const ORCHESTRAIHealthChecker = require('./orchestrai-health-checker');

class SmartTaskWrapper {
  constructor() {
    this.healthChecker = new ORCHESTRAIHealthChecker();
    this.lastHealthCheck = null;
    this.healthCacheTimeout = 30000; // Cache health status for 30 seconds
    this.autoStart = true; // Automatically attempt to start services
  }

  /**
   * Pre-execution health check with automatic service recovery
   */
  async ensureSystemReady(taskDescription = 'Task execution') {
    console.log(`🔍 Checking ORCHESTRAI system health for: ${taskDescription}`);
    
    try {
      // Use cached health status if recent
      if (this.isCachedHealthValid()) {
        if (this.lastHealthCheck.ready) {
          console.log('✅ System ready (cached status)');
          return { ready: true, fromCache: true };
        }
      }
      
      // Perform quick health check
      const quickStatus = await this.healthChecker.quickCheck();
      
      if (quickStatus.ready) {
        this.cacheHealthStatus(quickStatus);
        console.log('✅ System ready');
        return { ready: true, fromCache: false };
      }
      
      // System not ready - show detailed status and recovery options
      console.log('⚠️  System not ready - running detailed diagnostics...\n');
      
      const fullHealth = await this.healthChecker.checkSystemHealth(false);
      
      if (!fullHealth.healthy) {
        return await this.handleUnhealthySystem(fullHealth);
      }
      
      return { ready: true, fromCache: false };
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return {
        ready: false,
        error: error.message,
        recommendations: ['Check system manually', 'Restart ORCHESTRAI services']
      };
    }
  }

  async handleUnhealthySystem(healthReport) {
    console.log('🚨 ORCHESTRAI System Issues Detected');
    console.log('═══════════════════════════════════════');
    
    const criticalIssues = this.identifyCriticalIssues(healthReport.status);
    
    if (criticalIssues.length > 0) {
      console.log('❌ Critical Issues:');
      criticalIssues.forEach(issue => {
        console.log(`   • ${issue.component}: ${issue.problem}`);
      });
      console.log('');
    }
    
    // Show recommendations
    const recommendations = healthReport.recommendations || [];
    if (recommendations.length > 0) {
      console.log('💡 Recommended Actions:');
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      console.log('');
    }
    
    // Auto-recovery attempt if enabled
    if (this.autoStart && criticalIssues.length > 0) {
      console.log('🔧 Attempting automatic service recovery...');
      
      const recoveryResult = await this.attemptAutoRecovery(criticalIssues);
      
      if (recoveryResult.success) {
        console.log('✅ Auto-recovery successful!');
        
        // Re-check system health
        const recheckStatus = await this.healthChecker.quickCheck();
        if (recheckStatus.ready) {
          return { ready: true, recovered: true };
        }
      } else {
        console.log('❌ Auto-recovery failed');
      }
    }
    
    console.log('🚫 Cannot proceed with Task execution - system not ready');
    console.log('   Please resolve the issues above and try again.\n');
    
    return {
      ready: false,
      issues: criticalIssues,
      recommendations,
      autoRecoveryAttempted: this.autoStart
    };
  }

  identifyCriticalIssues(healthStatus) {
    const issues = [];
    
    if (healthStatus.redis?.status === 'unhealthy') {
      issues.push({
        component: 'Redis',
        problem: 'Not running or not accessible',
        severity: 'critical',
        autoRecoverable: true
      });
    }
    
    if (healthStatus.orchestrator?.status === 'unhealthy') {
      issues.push({
        component: 'ORCHESTRAI Orchestrator',
        problem: 'Service offline or not responding',
        severity: 'critical',
        autoRecoverable: true
      });
    }
    
    if (healthStatus.mcpServers?.status === 'unhealthy') {
      issues.push({
        component: 'MCP Servers',
        problem: 'Required servers not running',
        severity: 'critical',
        autoRecoverable: false
      });
    }
    
    return issues;
  }

  async attemptAutoRecovery(issues) {
    const results = {
      success: false,
      attempted: [],
      succeeded: [],
      failed: []
    };
    
    for (const issue of issues) {
      if (!issue.autoRecoverable) continue;
      
      const recoveryAction = this.getRecoveryAction(issue.component);
      if (!recoveryAction) continue;
      
      results.attempted.push(issue.component);
      
      try {
        console.log(`🔧 Starting ${issue.component}...`);
        
        const success = await recoveryAction();
        
        if (success) {
          results.succeeded.push(issue.component);
          console.log(`✅ ${issue.component} started successfully`);
        } else {
          results.failed.push(issue.component);
          console.log(`❌ Failed to start ${issue.component}`);
        }
        
      } catch (error) {
        results.failed.push(issue.component);
        console.log(`❌ Error starting ${issue.component}: ${error.message}`);
      }
      
      // Wait between recovery attempts
      if (results.attempted.length > 1) {
        await this.sleep(2000);
      }
    }
    
    results.success = results.succeeded.length > 0 && results.failed.length === 0;
    
    return results;
  }

  getRecoveryAction(component) {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    const recoveryActions = {
      'Redis': async () => {
        try {
          // Try to start Redis via npm script
          await execPromise('npm run redis', { 
            timeout: 10000,
            cwd: '/Users/kris/CLAUDEtools/ORCHESTRAI'
          });
          
          // Wait for Redis to be ready
          await this.sleep(3000);
          
          // Verify Redis is running
          return await this.healthChecker.isRedisRunning();
          
        } catch (error) {
          console.log(`Redis start attempt failed: ${error.message}`);
          return false;
        }
      },
      
      'ORCHESTRAI Orchestrator': async () => {
        try {
          // Redis must be running first
          const redisRunning = await this.healthChecker.isRedisRunning();
          if (!redisRunning) {
            console.log('Cannot start orchestrator - Redis not running');
            return false;
          }
          
          // Start orchestrator in background
          exec('npm run orchestrator', {
            cwd: '/Users/kris/CLAUDEtools/ORCHESTRAI',
            detached: true,
            stdio: 'ignore'
          });
          
          // Wait for orchestrator to initialize
          await this.sleep(10000);
          
          // Verify orchestrator is running
          return await this.healthChecker.isOrchestratorRunning();
          
        } catch (error) {
          console.log(`Orchestrator start attempt failed: ${error.message}`);
          return false;
        }
      }
    };
    
    return recoveryActions[component];
  }

  isCachedHealthValid() {
    if (!this.lastHealthCheck) return false;
    
    const age = Date.now() - this.lastHealthCheck.timestamp;
    return age < this.healthCacheTimeout;
  }

  cacheHealthStatus(status) {
    this.lastHealthCheck = {
      ...status,
      timestamp: Date.now()
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main wrapper method for Task tool execution
   */
  async executeTaskSafely(taskFunction, taskDescription) {
    const healthResult = await this.ensureSystemReady(taskDescription);
    
    if (!healthResult.ready) {
      console.log('🚫 Task execution blocked due to system health issues');
      return {
        success: false,
        error: 'System not ready',
        healthResult
      };
    }
    
    try {
      console.log(`🚀 Executing task: ${taskDescription}`);
      const result = await taskFunction();
      
      console.log('✅ Task completed successfully');
      return {
        success: true,
        result
      };
      
    } catch (error) {
      console.error(`❌ Task execution failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        taskError: true
      };
    }
  }

  /**
   * Create a pre-validated Task wrapper function
   */
  createValidatedTaskWrapper() {
    const self = this;
    
    return async function safeTaskCall(subagent_type, description, prompt) {
      const taskDescription = `${subagent_type}: ${description}`;
      
      return await self.executeTaskSafely(async () => {
        // This would be replaced with actual Task tool call
        // For now, we'll simulate the call
        return await self.simulateTaskCall(subagent_type, description, prompt);
      }, taskDescription);
    };
  }

  // Simulation method for demonstration
  async simulateTaskCall(subagent_type, description, prompt) {
    console.log(`📡 Task call: ${subagent_type}`);
    console.log(`📝 Description: ${description}`);
    console.log(`💬 Prompt length: ${prompt.length} characters`);
    
    // Simulate Task processing time
    await this.sleep(1000);
    
    return {
      subagent_type,
      description,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Manual health check command
   */
  async checkHealth(verbose = false) {
    return await this.healthChecker.checkSystemHealth(verbose);
  }
}

// Export for use in other modules
module.exports = SmartTaskWrapper;

// CLI usage examples
if (require.main === module) {
  const wrapper = new SmartTaskWrapper();
  
  // Example: Check health manually
  if (process.argv.includes('--health')) {
    wrapper.checkHealth(true).then(result => {
      process.exit(result.healthy ? 0 : 1);
    });
  }
  
  // Example: Test task execution
  if (process.argv.includes('--test')) {
    const safeTask = wrapper.createValidatedTaskWrapper();
    
    safeTask('content-writer-specialist', 'Test task execution', 'This is a test prompt')
      .then(result => {
        console.log('Task result:', result);
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('Task execution error:', error);
        process.exit(1);
      });
  }
}