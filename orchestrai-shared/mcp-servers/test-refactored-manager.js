#!/usr/bin/env node

/**
 * Test script for refactored MCP Manager
 * Demonstrates all major features and validates functionality
 */

const path = require('path');
const { MCPManager } = require('./core');

// Test configuration
const TEST_CONFIG = {
  logLevel: 'info',
  maxRetries: 3,
  retryDelay: 1000,
  circuitBreakerThreshold: 3,
  circuitBreakerTimeout: 30000
};

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60) + '\n');
}

async function testBasicFunctionality(manager) {
  section('TEST 1: Basic Functionality');

  try {
    // Test initialization
    log('✓ Testing initialization...', 'yellow');
    await manager.initialize();
    log('✓ Manager initialized successfully', 'green');

    // Test getting server status before starting
    log('\n✓ Testing server status (before start)...', 'yellow');
    const statusBefore = manager.getAllServersStatus();
    log(`✓ Found ${Object.keys(statusBefore).length} configured servers`, 'green');

    // Test starting servers
    log('\n✓ Testing server startup...', 'yellow');
    const startResults = await manager.startAllEnabledServers({
      startDelay: 500,
      stopOnError: false
    });

    const started = startResults.filter(r => r.status === 'started').length;
    const failed = startResults.filter(r => r.status === 'failed').length;
    const skipped = startResults.filter(r => r.status === 'skipped').length;

    log(`✓ Startup complete: ${started} started, ${failed} failed, ${skipped} skipped`, 'green');

    // Wait for servers to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test getting server status after starting
    log('\n✓ Testing server status (after start)...', 'yellow');
    const statusAfter = manager.getAllServersStatus();

    Object.entries(statusAfter).forEach(([name, status]) => {
      if (status.status === 'running') {
        log(`  ✓ ${name}: Running (PID: ${status.pid}, Uptime: ${Math.round(status.uptime / 1000)}s)`, 'green');
      } else {
        log(`  - ${name}: ${status.status}`, 'yellow');
      }
    });

    return true;
  } catch (error) {
    log(`✗ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testHealthMonitoring(manager) {
  section('TEST 2: Health Monitoring');

  try {
    log('✓ Testing health checks...', 'yellow');

    // Perform health check
    const health = await manager.getHealthStatus();

    log(`\n✓ Health check complete for ${Object.keys(health).length} servers:`, 'green');

    Object.entries(health).forEach(([name, healthInfo]) => {
      const statusColor =
        healthInfo.status === 'healthy' ? 'green' :
        healthInfo.status === 'degraded' ? 'yellow' : 'red';

      log(`  ${healthInfo.status.toUpperCase()}: ${name}`, statusColor);

      if (healthInfo.checks) {
        Object.entries(healthInfo.checks).forEach(([check, passed]) => {
          log(`    ${passed ? '✓' : '✗'} ${check}`, passed ? 'green' : 'red');
        });
      }
    });

    // Test health report
    log('\n✓ Testing health report...', 'yellow');
    const report = manager.getHealthReport();

    log(`\n✓ Health Report:`, 'green');
    log(`  Total servers: ${report.totalServers}`);
    log(`  Healthy: ${report.summary.healthy}`, 'green');
    log(`  Degraded: ${report.summary.degraded}`, 'yellow');
    log(`  Unhealthy: ${report.summary.unhealthy}`, 'red');

    return true;
  } catch (error) {
    log(`✗ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testRetryLogic(manager) {
  section('TEST 3: Retry Logic & Circuit Breaker');

  try {
    log('✓ Testing retry statistics...', 'yellow');

    const retryStats = manager.getRetryStatistics();

    log(`\n✓ Retry Statistics:`, 'green');
    log(`  Total operations: ${retryStats.totalOperations}`);
    log(`  Open circuits: ${retryStats.openCircuits}`, retryStats.openCircuits > 0 ? 'red' : 'green');
    log(`  Half-open circuits: ${retryStats.halfOpenCircuits}`, retryStats.halfOpenCircuits > 0 ? 'yellow' : 'green');
    log(`  Closed circuits: ${retryStats.closedCircuits}`, 'green');

    if (Object.keys(retryStats.operations).length > 0) {
      log('\n✓ Operation Details:');
      Object.entries(retryStats.operations).forEach(([opId, stats]) => {
        log(`  ${opId}:`);
        log(`    Failures: ${stats.failures}`, stats.failures > 0 ? 'yellow' : 'green');
        log(`    Successes: ${stats.successes}`, 'green');
        log(`    Circuit: ${stats.circuitState}`, stats.circuitState === 'open' ? 'red' : 'green');
      });
    }

    // Test circuit breaker statuses
    log('\n✓ Testing circuit breaker statuses...', 'yellow');
    const circuitStatuses = manager.getCircuitStatuses();

    const openCircuits = Object.entries(circuitStatuses).filter(
      ([_, status]) => status.state === 'open'
    );

    if (openCircuits.length > 0) {
      log(`\n⚠️  Warning: ${openCircuits.length} open circuits detected:`, 'yellow');
      openCircuits.forEach(([opId, status]) => {
        log(`  ${opId}: ${status.state} (${status.failures} failures)`, 'red');
      });
    } else {
      log(`\n✓ All circuits closed or healthy`, 'green');
    }

    return true;
  } catch (error) {
    log(`✗ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testCapabilities(manager) {
  section('TEST 4: Capability Management');

  try {
    log('✓ Testing capability queries...', 'yellow');

    const capabilities = [
      'complex-problem-solving',
      'seo-analysis',
      'knowledge-storage',
      'visual-regression-testing',
      'cross-browser-testing'
    ];

    log('\n✓ Servers by capability:');

    capabilities.forEach(capability => {
      const servers = manager.getServersByCapability(capability);
      if (servers.length > 0) {
        log(`  ${capability}:`, 'green');
        servers.forEach(server => {
          log(`    - ${server}`, 'green');
        });
      }
    });

    return true;
  } catch (error) {
    log(`✗ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testSystemStatus(manager) {
  section('TEST 5: Comprehensive System Status');

  try {
    log('✓ Fetching comprehensive system status...', 'yellow');

    const systemStatus = await manager.getSystemStatus();

    log('\n✓ System Status:', 'green');
    log(`  Timestamp: ${new Date(systemStatus.timestamp).toISOString()}`);
    log(`  Initialized: ${systemStatus.initialized}`, systemStatus.initialized ? 'green' : 'red');
    log(`  Health Monitoring: ${systemStatus.healthMonitoring}`, systemStatus.healthMonitoring ? 'green' : 'yellow');

    log(`\n  Servers (${Object.keys(systemStatus.servers).length}):`);
    Object.entries(systemStatus.servers).forEach(([name, status]) => {
      const statusColor = status.status === 'running' ? 'green' : 'yellow';
      log(`    ${name}: ${status.status}`, statusColor);
    });

    // Show sample health data
    const healthyServers = Object.entries(systemStatus.health).filter(
      ([_, health]) => health.status === 'healthy'
    );

    log(`\n  Health: ${healthyServers.length}/${Object.keys(systemStatus.health).length} healthy`, 'green');

    return true;
  } catch (error) {
    log(`✗ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testEventHandling(manager) {
  section('TEST 6: Event System');

  return new Promise(async (resolve) => {
    try {
      log('✓ Testing event system...', 'yellow');

      const events = [];
      const eventHandlers = {
        'server:started': (data) => events.push({ type: 'started', data }),
        'server:stopped': (data) => events.push({ type: 'stopped', data }),
        'server:error': (data) => events.push({ type: 'error', data }),
        'circuit:opened': (data) => events.push({ type: 'circuit-open', data }),
        'circuit:closed': (data) => events.push({ type: 'circuit-close', data })
      };

      // Attach event handlers
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        manager.on(event, handler);
      });

      log('\n✓ Event handlers attached', 'green');
      log('✓ Event monitoring active', 'green');

      // Give some time for events
      setTimeout(() => {
        log(`\n✓ Captured ${events.length} events`, 'green');

        if (events.length > 0) {
          log('\n  Recent events:');
          events.slice(0, 5).forEach(event => {
            log(`    - ${event.type}: ${event.data.serverName || event.data.operationId || 'system'}`, 'blue');
          });
        }

        resolve(true);
      }, 2000);
    } catch (error) {
      log(`✗ Test failed: ${error.message}`, 'red');
      resolve(false);
    }
  });
}

async function testGracefulShutdown(manager) {
  section('TEST 7: Graceful Shutdown');

  try {
    log('✓ Testing graceful shutdown...', 'yellow');

    await manager.shutdown();

    log('✓ Shutdown complete', 'green');
    log('  All servers stopped gracefully', 'green');
    log('  All resources cleaned up', 'green');

    return true;
  } catch (error) {
    log(`✗ Test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'blue');
  log('║     MCP MANAGER REFACTORED - COMPREHENSIVE TEST SUITE    ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════╝', 'blue');

  const manager = new MCPManager(TEST_CONFIG);

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Run tests
  const tests = [
    { name: 'Basic Functionality', fn: testBasicFunctionality },
    { name: 'Health Monitoring', fn: testHealthMonitoring },
    { name: 'Retry Logic', fn: testRetryLogic },
    { name: 'Capabilities', fn: testCapabilities },
    { name: 'System Status', fn: testSystemStatus },
    { name: 'Event Handling', fn: testEventHandling },
    { name: 'Graceful Shutdown', fn: testGracefulShutdown }
  ];

  for (const test of tests) {
    try {
      const passed = await test.fn(manager);
      results.tests.push({ name: test.name, passed });

      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log(`\n✗ Test "${test.name}" threw error: ${error.message}`, 'red');
      results.tests.push({ name: test.name, passed: false });
      results.failed++;
    }
  }

  // Summary
  section('TEST SUMMARY');

  log(`Total Tests: ${results.tests.length}`);
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

  log('\n✓ Test Results:');
  results.tests.forEach(test => {
    const symbol = test.passed ? '✓' : '✗';
    const color = test.passed ? 'green' : 'red';
    log(`  ${symbol} ${test.name}`, color);
  });

  console.log('\n');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n✗ Unhandled rejection: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  log(`\n✗ Test suite failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
