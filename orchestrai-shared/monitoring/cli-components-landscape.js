/**
 * CLI Components - Landscape Layout
 * Wide, compact layout with analytics display
 */

const blessed = require('blessed');
const {
  formatNumber,
  formatCost,
  formatDuration,
  formatTime,
  createProgressBar,
  getPercentageColor
} = require('./cli-formatters');

/**
 * Create the main screen
 */
function createScreen() {
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: 'Claude Code Token Monitor - Landscape'
  });

  screen.key(['q', 'C-c'], () => {
    return process.exit(0);
  });

  return screen;
}

/**
 * Create compact header
 */
function createHeader(screen) {
  const header = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    content: '{center}{bold}🚀 CLAUDE CODE TOKEN MONITOR - Real-Time Analytics{/bold}{/center}',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'blue',
      border: { fg: 'cyan' }
    }
  });

  return header;
}

/**
 * Create session info box (compact - top left)
 */
function createSessionInfo(screen) {
  return blessed.box({
    parent: screen,
    top: 3,
    left: 0,
    width: '25%',
    height: 7,
    label: ' SESSION ',
    tags: true,
    border: { type: 'line' },
    style: {
      border: { fg: 'cyan' }
    }
  });
}

/**
 * Create burn rate box (compact - top second)
 */
function createBurnRateBox(screen) {
  return blessed.box({
    parent: screen,
    top: 3,
    left: '25%',
    width: '25%',
    height: 7,
    label: ' BURN RATE ',
    tags: true,
    border: { type: 'line' },
    style: {
      border: { fg: 'yellow' }
    }
  });
}

/**
 * Create cost analytics box (NEW - top third)
 */
function createCostAnalyticsBox(screen) {
  return blessed.box({
    parent: screen,
    top: 3,
    left: '50%',
    width: '25%',
    height: 7,
    label: ' COST ANALYTICS ',
    tags: true,
    border: { type: 'line' },
    style: {
      border: { fg: 'green' }
    }
  });
}

/**
 * Create efficiency metrics box (NEW - top fourth)
 */
function createEfficiencyBox(screen) {
  return blessed.box({
    parent: screen,
    top: 3,
    left: '75%',
    width: '25%',
    height: 7,
    label: ' EFFICIENCY ',
    tags: true,
    border: { type: 'line' },
    style: {
      border: { fg: 'magenta' }
    }
  });
}

/**
 * Create 5-hour rolling window box (bottom left - 50%)
 */
function createRollingWindowBox(screen) {
  return blessed.box({
    parent: screen,
    top: 10,
    left: 0,
    width: '50%',
    height: 7,
    label: ' 5-HOUR ROLLING WINDOW ',
    tags: true,
    border: { type: 'line' },
    style: {
      border: { fg: 'red' }
    }
  });
}

/**
 * Create workflow table (bottom right - 50%)
 */
function createWorkflowTable(screen) {
  return blessed.listtable({
    parent: screen,
    top: 10,
    left: '50%',
    width: '50%',
    height: 7,
    label: ' RECENT WORKFLOWS ',
    tags: true,
    border: { type: 'line' },
    align: 'left',
    keys: true,
    vi: true,
    style: {
      border: { fg: 'blue' },
      header: {
        fg: 'white',
        bold: true,
        bg: 'blue'
      },
      cell: {
        fg: 'white',
        selected: {
          bg: 'blue'
        }
      }
    }
  });
}

/**
 * Create compact footer
 */
function createFooter(screen) {
  return blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    width: '100%',
    height: 2,
    content: ' [Q]uit  [R]eset  [C]lear  [H]elp  |  Press keys for actions',
    tags: true,
    border: { type: 'line' },
    style: {
      fg: 'white',
      border: { fg: 'cyan' }
    }
  });
}

/**
 * Update session info (compact format)
 */
function updateSessionInfo(box, data) {
  const uptime = formatDuration(data.uptime || 0);
  const content = `
  ID: ${(data.sessionId || 'unknown').substring(0, 20)}...

  Input:  ${formatNumber(data.inputTokens)}
  Output: ${formatNumber(data.outputTokens)}
  Total:  ${formatNumber(data.totalTokens)}
  Cost:   ${formatCost(data.totalCost)}`;

  box.setContent(content);
}

/**
 * Update burn rate box (compact format)
 */
function updateBurnRateBox(box, burnRate, projection) {
  let projectionText = '';
  if (projection && projection.timeUntilEmpty) {
    const minutes = Math.floor(projection.timeUntilEmpty / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      projectionText = `  Empty in: ${hours}h ${mins}m`;
    } else if (minutes > 0) {
      projectionText = `  Empty in: ${minutes}m`;
    } else {
      projectionText = `  Empty in: <1m`;
    }
  }

  const content = `
  ${formatNumber(burnRate.tokensPerSecond, 1)} tok/s
  ${formatNumber(burnRate.tokensPerMinute)} tok/min

  ${formatCost(burnRate.costPerMinute)}/min
  ${formatCost(burnRate.costPerHour)}/hr
${projectionText}`;

  box.setContent(content);
}

/**
 * Update cost analytics box (NEW)
 */
function updateCostAnalyticsBox(box, analytics) {
  if (!analytics) {
    box.setContent('\n  Loading...');
    return;
  }

  const daily = analytics.projections?.daily || {};
  const monthly = analytics.projections?.monthly || {};
  const budgets = analytics.budgets || {};

  const content = `
  Today:  ${formatCost(daily.cost || 0)}
  Month:  ${formatCost(monthly.cost || 0)}

  Budget: ${budgets.daily?.percentage || 0}% used
  Status: {green-fg}${analytics.recommendations?.[0]?.level || 'OK'}{/}`;

  box.setContent(content);
}

/**
 * Update efficiency box (NEW)
 */
function updateEfficiencyBox(box, metrics) {
  if (!metrics) {
    box.setContent('\n  Loading...');
    return;
  }

  const score = metrics.overall?.efficiencyScore || 0;
  const rating = metrics.overall?.rating || 'Unknown';
  const ioRatio = metrics.overall?.ioRatio || 0;

  const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';

  const content = `
  Score: {${scoreColor}-fg}${score}/100{/}
  Rating: {bold}${rating}{/}

  I/O Ratio: ${ioRatio.toFixed(2)}
  Optimized: {green-fg}✓{/}`;

  box.setContent(content);
}

/**
 * Update 5-hour rolling window box
 */
function updateRollingWindowBox(box, windowStatus) {
  if (!windowStatus) {
    box.setContent('\n  Loading...');
    return;
  }

  const usage = windowStatus.usage || {};
  const limit = windowStatus.limit || {};
  const timing = windowStatus.timing || {};

  const percentage = limit.percentageUsed || 0;
  const progressBar = createProgressBar(percentage, 30);

  // Time until reset
  const resetTime = timing.timeUntilReset || 0;
  const resetHours = Math.floor(resetTime / (1000 * 60 * 60));
  const resetMins = Math.floor((resetTime % (1000 * 60 * 60)) / (1000 * 60));

  const content = `
  ${progressBar}  ${percentage.toFixed(1)}%
  ${formatNumber(usage.totalTokens || 0)} / ${formatNumber(limit.current || 400000)} tokens

  Remaining: ${formatNumber(limit.remaining || 0)} tokens
  Resets in: ${resetHours}h ${resetMins}m`;

  box.setContent(content);
}

/**
 * Update workflow table
 */
function updateWorkflowTable(table, workflows) {
  const headers = ['ID', 'Tokens', 'Cost', 'Time'];
  const data = [headers];

  workflows.slice(0, 4).forEach(w => {
    data.push([
      w.id ? w.id.substring(0, 12) + '...' : 'N/A',
      formatNumber(w.totalTokens || 0),
      formatCost(w.totalCost || 0),
      formatTime(new Date(w.timestamp))
    ]);
  });

  table.setData(data);
}

// Connection status and event log removed for compactness
function createConnectionStatus() { return null; }
function createEventLog() { return null; }
function createTokenGauge() { return null; }
function updateConnectionStatus() {}
function addEventToLog() {}
function updateTokenGauge() {}
function showHelpDialog() {}

module.exports = {
  createScreen,
  createHeader,
  createSessionInfo,
  createBurnRateBox,
  createCostAnalyticsBox,
  createEfficiencyBox,
  createRollingWindowBox,
  createWorkflowTable,
  createFooter,
  createConnectionStatus,
  createEventLog,
  createTokenGauge,
  updateSessionInfo,
  updateBurnRateBox,
  updateCostAnalyticsBox,
  updateEfficiencyBox,
  updateRollingWindowBox,
  updateWorkflowTable,
  updateConnectionStatus,
  addEventToLog,
  updateTokenGauge,
  showHelpDialog
};
