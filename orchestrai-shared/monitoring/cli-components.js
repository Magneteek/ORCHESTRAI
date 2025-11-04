/**
 * CLI Components
 * Reusable blessed widgets for the token monitor dashboard
 */

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const {
  formatNumber,
  formatCost,
  formatDuration,
  formatTime,
  createProgressBar,
  getPercentageColor,
  formatStatus,
  truncate,
  pad
} = require('./cli-formatters');

/**
 * Create the main screen
 * @returns {blessed.Screen} The blessed screen instance
 */
function createScreen() {
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: 'Claude Code Token Monitor'
  });

  screen.key(['q', 'C-c'], () => {
    return process.exit(0);
  });

  return screen;
}

/**
 * Create the header box
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {blessed.Box} Header box
 */
function createHeader(screen) {
  const header = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    content: ' CLAUDE CODE TOKEN MONITOR',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'blue',
      border: {
        fg: 'cyan'
      }
    }
  });

  return header;
}

/**
 * Create the session info box
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {blessed.Box} Session info box
 */
function createSessionInfo(screen) {
  const sessionBox = blessed.box({
    parent: screen,
    top: 3,
    left: 0,
    width: '50%',
    height: 9,
    label: ' CURRENT SESSION ',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'cyan'
      }
    }
  });

  return sessionBox;
}

/**
 * Create the burn rate metrics box
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {blessed.Box} Burn rate box
 */
function createBurnRateBox(screen) {
  const burnRateBox = blessed.box({
    parent: screen,
    top: 3,
    left: '50%',
    width: '50%',
    height: 9,
    label: ' BURN RATE & PROJECTIONS ',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'yellow'
      }
    }
  });

  return burnRateBox;
}

/**
 * Create the daily/weekly usage box
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {blessed.Box} Usage limits box
 */
function createUsageLimitsBox(screen) {
  const limitsBox = blessed.box({
    parent: screen,
    top: 12,
    left: 0,
    width: '100%',
    height: 8,
    label: ' DAILY & WEEKLY LIMITS ',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'green'
      }
    }
  });

  return limitsBox;
}

/**
 * Create the token usage gauge (removed - integrated into other views)
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {null} Deprecated
 */
function createTokenGauge(screen) {
  // Deprecated - token usage now shown in session info and limits boxes
  return null;
}

/**
 * Create the workflow history table
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {contrib.Table} Workflow table
 */
function createWorkflowTable(screen) {
  const table = blessed.listtable({
    parent: screen,
    top: 20,
    left: 0,
    width: '100%',
    height: 10,
    label: ' WORKFLOW HISTORY ',
    tags: true,
    border: {
      type: 'line',
      fg: 'cyan'
    },
    style: {
      header: {
        fg: 'cyan',
        bold: true
      },
      cell: {
        selected: {
          bg: 'blue'
        }
      }
    }
  });

  return table;
}

/**
 * Create the live event log
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {blessed.Log} Event log
 */
function createEventLog(screen) {
  const log = blessed.log({
    parent: screen,
    top: 30,
    left: 0,
    width: '100%',
    height: '70%-32',
    label: ' LIVE TOKEN STREAM ',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'cyan'
      }
    },
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      ch: ' ',
      inverse: true
    }
  });

  return log;
}

/**
 * Create the footer with keyboard shortcuts
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {blessed.Box} Footer box
 */
function createFooter(screen) {
  const footer = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    width: '100%',
    height: 1,
    content: '{center}[q] Quit  [r] Reset  [c] Clear  [h] Help{/center}',
    tags: true,
    style: {
      fg: 'white',
      bg: 'blue'
    }
  });

  return footer;
}

/**
 * Create the connection status indicator
 * @param {blessed.Screen} screen - The blessed screen
 * @returns {blessed.Box} Connection status box
 */
function createConnectionStatus(screen) {
  const status = blessed.box({
    parent: screen,
    top: 1,
    right: 2,
    width: 20,
    height: 1,
    content: '',
    tags: true,
    style: {
      fg: 'white'
    }
  });

  return status;
}

/**
 * Update session info display
 * @param {blessed.Box} box - Session info box
 * @param {Object} data - Session data
 */
function updateSessionInfo(box, data) {
  const {
    inputTokens = 0,
    outputTokens = 0,
    totalTokens = 0,
    totalCost = 0,
    uptime = 0
  } = data;

  const content = [
    '',
    `  Session ID:  ${truncate(data.sessionId || 'N/A', 30)}`,
    `  Uptime:      ${formatDuration(uptime)}`,
    '',
    `  Input:       ${createProgressBar(inputTokens, 100000, 10)} ${pad(formatNumber(inputTokens), 8, 'right')}`,
    `  Output:      ${createProgressBar(outputTokens, 100000, 10)} ${pad(formatNumber(outputTokens), 8, 'right')}`,
    `  Total:       ${createProgressBar(totalTokens, 200000, 10)} ${pad(formatNumber(totalTokens), 8, 'right')}`,
    `  Cost:        ${formatCost(totalCost)}`,
    ''
  ].join('\n');

  box.setContent(content);
}

/**
 * Update token gauge
 * @param {contrib.Gauge} gauge - The gauge widget
 * @param {number} used - Tokens used
 * @param {number} budget - Token budget
 */
function updateTokenGauge(gauge, used, budget) {
  const percentage = Math.min(100, (used / budget) * 100);

  gauge.setPercent(Math.round(percentage));

  // Update gauge color based on usage
  if (percentage < 70) {
    gauge.setStack([{percent: percentage, stroke: 'green'}]);
  } else if (percentage < 90) {
    gauge.setStack([{percent: percentage, stroke: 'yellow'}]);
  } else {
    gauge.setStack([{percent: percentage, stroke: 'red'}]);
  }
}

/**
 * Update workflow table
 * @param {blessed.ListTable} table - The table widget
 * @param {Array} workflows - Workflow data
 */
function updateWorkflowTable(table, workflows) {
  const headers = ['ID', 'Tokens', 'Cost', 'Status', 'Time'];
  const data = workflows.slice(-10).map(wf => {
    return [
      truncate(wf.workflowId || 'N/A', 18),
      formatNumber(wf.totalTokens || 0),
      formatCost(wf.cost || 0),
      formatStatus(wf.status || 'pending'),
      formatTime(wf.timestamp || new Date())
    ];
  });

  // blessed.listtable expects rows array with headers as first row
  const rows = [headers, ...data];
  table.setData(rows);
}

/**
 * Add event to log
 * @param {blessed.Log} log - The log widget
 * @param {Object} event - Event data
 */
function addEventToLog(log, event) {
  const {
    timestamp = new Date(),
    eventType = 'unknown',
    inputTokens = 0,
    outputTokens = 0,
    description = ''
  } = event;

  const time = formatTime(timestamp);
  const tokens = inputTokens + outputTokens;

  let message = `[${time}] `;

  if (eventType === 'token-usage') {
    if (inputTokens > 0) {
      message += `{green-fg}+${formatNumber(inputTokens)} input tokens{/green-fg}`;
    }
    if (outputTokens > 0) {
      if (inputTokens > 0) message += ' / ';
      message += `{blue-fg}+${formatNumber(outputTokens)} output tokens{/blue-fg}`;
    }
  } else {
    message += `{yellow-fg}${eventType}{/yellow-fg}`;
    if (description) {
      message += ` - ${description}`;
    }
  }

  log.log(message);
}

/**
 * Update connection status
 * @param {blessed.Box} statusBox - Status box
 * @param {string} status - Connection status
 */
function updateConnectionStatus(statusBox, status) {
  const statusMap = {
    'connected': '{green-fg}● Connected{/green-fg}',
    'connecting': '{yellow-fg}● Connecting...{/yellow-fg}',
    'disconnected': '{red-fg}● Disconnected{/red-fg}',
    'error': '{red-fg}● Error{/red-fg}'
  };

  statusBox.setContent(statusMap[status] || statusMap['disconnected']);
}

/**
 * Update burn rate display
 * @param {blessed.Box} box - Burn rate box
 * @param {Object} data - Burn rate and projection data
 */
function updateBurnRateBox(box, data) {
  const {
    burnRate = {},
    projections = {},
    dailyUsage = {}
  } = data;

  const {
    tokensPerSecond = 0,
    tokensPerMinute = 0,
    costPerMinute = 0,
    costPerHour = 0
  } = burnRate;

  const { timeRemaining, dailyLimitExhaustedAt } = projections;

  let exhaustionText = '{green-fg}Within Limits{/green-fg}';
  if (timeRemaining !== null && timeRemaining > 0) {
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      exhaustionText = `{red-fg}${minutes}m remaining{/red-fg}`;
    } else if (hours < 6) {
      exhaustionText = `{yellow-fg}${hours}h ${minutes}m remaining{/yellow-fg}`;
    } else {
      exhaustionText = `{green-fg}${hours}h ${minutes}m remaining{/green-fg}`;
    }
  }

  const content = [
    '',
    '  {bold}BURN RATE{/bold}',
    `  Tokens/sec:   ${pad(formatNumber(tokensPerSecond), 10, 'right')} tok/s`,
    `  Tokens/min:   ${pad(formatNumber(tokensPerMinute), 10, 'right')} tok/min`,
    '',
    '  {bold}COST RATE{/bold}',
    `  Per Minute:   ${formatCost(costPerMinute)}/min`,
    `  Per Hour:     ${formatCost(costPerHour)}/hour`,
    '',
    `  {bold}STATUS:{/bold} ${exhaustionText}`,
    ''
  ].join('\n');

  box.setContent(content);
}

/**
 * Update usage limits display
 * @param {blessed.Box} box - Usage limits box
 * @param {Object} data - Daily and weekly usage data
 */
function updateUsageLimitsBox(box, data) {
  const {
    dailyUsage = {},
    weeklyUsage = {}
  } = data;

  const dailyPercentage = (dailyUsage.tokens / dailyUsage.limit) * 100;
  const weeklyPercentage = (weeklyUsage.tokens / weeklyUsage.limit) * 100;

  const dailyColor = dailyPercentage < 70 ? 'green' : dailyPercentage < 90 ? 'yellow' : 'red';
  const weeklyColor = weeklyPercentage < 70 ? 'green' : weeklyPercentage < 90 ? 'yellow' : 'red';

  // Format reset times
  const dailyResetTime = new Date(dailyUsage.resetTime);
  const weeklyResetTime = new Date(weeklyUsage.resetTime);
  const now = new Date();

  const dailyTimeLeft = Math.max(0, dailyResetTime - now);
  const weeklyTimeLeft = Math.max(0, weeklyResetTime - now);

  const dailyHours = Math.floor(dailyTimeLeft / (1000 * 60 * 60));
  const dailyMinutes = Math.floor((dailyTimeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const weeklyDays = Math.floor(weeklyTimeLeft / (1000 * 60 * 60 * 24));
  const weeklyHours = Math.floor((weeklyTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const content = [
    '',
    `  {bold}DAILY LIMIT{/bold}  (Resets in ${dailyHours}h ${dailyMinutes}m)`,
    `  Used:      {${dailyColor}-fg}${createProgressBar(dailyUsage.tokens, dailyUsage.limit, 20)} ${pad(formatNumber(dailyUsage.tokens), 10, 'right')}{/${dailyColor}-fg}`,
    `  Limit:     ${pad(formatNumber(dailyUsage.limit), 10, 'right')} tokens`,
    `  Remaining: ${pad(formatNumber(dailyUsage.remaining), 10, 'right')} tokens (${Math.max(0, 100 - dailyPercentage).toFixed(1)}%)`,
    '',
    `  {bold}WEEKLY LIMIT{/bold}  (Resets in ${weeklyDays}d ${weeklyHours}h)`,
    `  Used:      {${weeklyColor}-fg}${createProgressBar(weeklyUsage.tokens, weeklyUsage.limit, 20)} ${pad(formatNumber(weeklyUsage.tokens), 10, 'right')}{/${weeklyColor}-fg}`,
    `  Limit:     ${pad(formatNumber(weeklyUsage.limit), 10, 'right')} tokens`,
    `  Remaining: ${pad(formatNumber(weeklyUsage.remaining), 10, 'right')} tokens (${Math.max(0, 100 - weeklyPercentage).toFixed(1)}%)`,
    ''
  ].join('\n');

  box.setContent(content);
}

/**
 * Show help dialog
 * @param {blessed.Screen} screen - The blessed screen
 */
function showHelpDialog(screen) {
  const helpBox = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '60%',
    height: '60%',
    label: ' HELP ',
    content: [
      '',
      '  KEYBOARD SHORTCUTS',
      '  ==================',
      '',
      '  q, Ctrl+C     Quit the application',
      '  r             Reset token counters',
      '  c             Clear event log',
      '  h             Show this help dialog',
      '',
      '  DASHBOARD SECTIONS',
      '  ==================',
      '',
      '  Current Session      - Real-time token usage',
      '  Burn Rate            - Tokens per second/minute',
      '  Daily/Weekly Limits  - Usage limits and reset times',
      '  Workflow History     - Last 10 completed workflows',
      '  Live Token Stream    - Real-time event log',
      '',
      '  COLOR CODING',
      '  ============',
      '',
      '  Green   - Usage < 70% of limit',
      '  Yellow  - Usage 70-90% of limit',
      '  Red     - Usage > 90% of limit',
      '',
      '  Press any key to close...',
      ''
    ].join('\n'),
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'cyan'
      }
    }
  });

  helpBox.focus();
  helpBox.key(['escape', 'enter', 'space'], () => {
    helpBox.destroy();
    screen.render();
  });

  screen.render();
}

module.exports = {
  createScreen,
  createHeader,
  createSessionInfo,
  createBurnRateBox,
  createUsageLimitsBox,
  createTokenGauge,
  createWorkflowTable,
  createEventLog,
  createFooter,
  createConnectionStatus,
  updateSessionInfo,
  updateBurnRateBox,
  updateUsageLimitsBox,
  updateTokenGauge,
  updateWorkflowTable,
  addEventToLog,
  updateConnectionStatus,
  showHelpDialog
};
