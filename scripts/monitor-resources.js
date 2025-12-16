#!/usr/bin/env node

/**
 * ORCHESTRAI Resource Monitor CLI
 * Real-time system resource monitoring
 */

const { getResourceMonitor } = require('../orchestrai-shared/monitoring/resource-monitor');

const monitor = getResourceMonitor({
  memoryThreshold: 0.85,
  cpuThreshold: 0.90,
  checkInterval: 5000, // Check every 5 seconds
  enableAutoThrottle: false, // Just monitoring, no throttling
  enableGC: false
});

console.log('=======================================================');
console.log('ORCHESTRAI Resource Monitor');
console.log('=======================================================');
console.log('');
console.log('Press Ctrl+C to stop');
console.log('');

// Event listeners
monitor.on('update', (state) => {
  console.clear();
  console.log('=======================================================');
  console.log('ORCHESTRAI Resource Monitor');
  console.log('=======================================================');
  console.log('');

  // Memory status
  const memBar = createBar(state.memoryUsagePercent, 40);
  const memColor = state.memoryUsagePercent > 0.85 ? '\x1b[31m' : state.memoryUsagePercent > 0.70 ? '\x1b[33m' : '\x1b[32m';
  console.log('Memory Usage:');
  console.log('  ' + memColor + memBar + '\x1b[0m');
  console.log('  ' + (state.memoryUsagePercent * 100).toFixed(1) + '% (' + state.memoryUsedMB + 'MB / ' + state.memoryTotalMB + 'MB)');
  console.log('');

  // Heap status
  const heapPercent = state.heapUsedMB / state.heapTotalMB;
  const heapBar = createBar(heapPercent, 40);
  const heapColor = heapPercent > 0.85 ? '\x1b[31m' : heapPercent > 0.70 ? '\x1b[33m' : '\x1b[32m';
  console.log('Node.js Heap:');
  console.log('  ' + heapColor + heapBar + '\x1b[0m');
  console.log('  ' + (heapPercent * 100).toFixed(1) + '% (' + state.heapUsedMB + 'MB / ' + state.heapTotalMB + 'MB)');
  console.log('');

  // CPU status
  const cpuBar = createBar(state.cpuLoadPercent, 40);
  const cpuColor = state.cpuLoadPercent > 0.85 ? '\x1b[31m' : state.cpuLoadPercent > 0.70 ? '\x1b[33m' : '\x1b[32m';
  console.log('CPU Load:');
  console.log('  ' + cpuColor + cpuBar + '\x1b[0m');
  console.log('  ' + (state.cpuLoadPercent * 100).toFixed(1) + '%');
  console.log('');

  // Pressure level
  const pressureIcon = state.pressureLevel === 'critical' ? '🚨' : state.pressureLevel === 'warning' ? '⚠️' : '✅';
  const pressureText = state.pressureLevel.toUpperCase();
  console.log('Pressure Level: ' + pressureIcon + ' ' + pressureText);
  console.log('');

  // Recommendations
  const recommended = monitor.getRecommendedMaxAgents();
  console.log('Recommended Max Parallel Agents: ' + recommended);
  console.log('Safe for Heavy Operations: ' + (monitor.isSafeForHeavyOperation() ? '✅ YES' : '❌ NO'));
  console.log('');

  // Stats
  const stats = monitor.getStats();
  console.log('Statistics:');
  console.log('  Total Checks: ' + stats.totalChecks);
  console.log('  Warning Events: ' + stats.warningEvents);
  console.log('  Critical Events: ' + stats.criticalEvents);
  console.log('  Average Memory: ' + (stats.averageMemory * 100).toFixed(1) + '%');
  console.log('  Peak Memory: ' + (stats.peakMemory * 100).toFixed(1) + '%');
  console.log('');
  console.log('Press Ctrl+C to stop');
});

monitor.on('pressure:warning', (state) => {
  console.log('\x1b[33m⚠️  WARNING: Resource pressure detected!\x1b[0m');
});

monitor.on('pressure:critical', (state) => {
  console.log('\x1b[31m🚨 CRITICAL: Resource pressure detected!\x1b[0m');
});

// Start monitoring
monitor.start();

// Handle exit
process.on('SIGINT', () => {
  console.log('');
  console.log('Stopping resource monitor...');
  monitor.stop();

  const stats = monitor.getStats();
  console.log('');
  console.log('Final Statistics:');
  console.log('  Total Checks: ' + stats.totalChecks);
  console.log('  Warning Events: ' + stats.warningEvents);
  console.log('  Critical Events: ' + stats.criticalEvents);
  console.log('  GC Triggered: ' + stats.gcTriggered);
  console.log('');

  process.exit(0);
});

// Helper function to create progress bars
function createBar(percent, length) {
  const filled = Math.round(percent * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}
