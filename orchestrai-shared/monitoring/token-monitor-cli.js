#!/usr/bin/env node

/**
 * Token Monitor CLI
 * Beautiful terminal UI for real-time Claude Code token usage monitoring
 */

const WebSocket = require('ws');
const {
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
} = require('./cli-components');

// Configuration from environment variables
const config = {
  tokenBudget: parseInt(process.env.TOKEN_BUDGET || '200000', 10),
  websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:5505',
  refreshRate: parseInt(process.env.REFRESH_RATE || '100', 10),
  reconnectDelay: 3000,
  maxReconnectAttempts: 10
};

// Application state
const state = {
  sessionId: null,
  startTime: Date.now(),
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  totalCost: 0,
  workflows: [],
  events: [],
  connectionStatus: 'disconnected',
  reconnectAttempts: 0,
  ws: null,
  // Enhanced tracking
  burnRate: {
    tokensPerSecond: 0,
    tokensPerMinute: 0,
    costPerMinute: 0,
    costPerHour: 0
  },
  dailyUsage: initializeDailyUsage(),
  weeklyUsage: initializeWeeklyUsage(),
  projections: {
    tokensExhaustedAt: null,
    timeRemaining: null,
    dailyLimitExhaustedAt: null
  }
};

/**
 * Initialize daily usage
 */
function initializeDailyUsage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  return {
    date: startOfDay.toISOString().split('T')[0],
    startTime: startOfDay.getTime(),
    resetTime: endOfDay.getTime(),
    tokens: 0,
    cost: 0,
    limit: 200000,
    remaining: 200000
  };
}

/**
 * Initialize weekly usage
 */
function initializeWeeklyUsage() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    weekStart: startOfWeek.toISOString().split('T')[0],
    startTime: startOfWeek.getTime(),
    resetTime: endOfWeek.getTime(),
    tokens: 0,
    cost: 0,
    limit: 1400000,
    remaining: 1400000
  };
}

// Create the UI
let screen, header, sessionBox, burnRateBox, usageLimitsBox, tokenGauge, workflowTable, eventLog, footer, connectionStatus;

/**
 * Initialize the terminal UI
 */
function initializeUI() {
  screen = createScreen();
  header = createHeader(screen);
  sessionBox = createSessionInfo(screen);
  burnRateBox = createBurnRateBox(screen);
  usageLimitsBox = createUsageLimitsBox(screen);
  tokenGauge = createTokenGauge(screen);
  workflowTable = createWorkflowTable(screen);
  eventLog = createEventLog(screen);
  footer = createFooter(screen);
  connectionStatus = createConnectionStatus(screen);

  // Keyboard handlers
  screen.key(['r'], resetCounters);
  screen.key(['c'], clearLog);
  screen.key(['h'], () => showHelpDialog(screen));

  // Initial render
  updateUI();
  screen.render();
}

/**
 * Update all UI components
 */
function updateUI() {
  const now = Date.now();
  const sessionDuration = now - state.startTime;
  const sessionSeconds = sessionDuration / 1000;
  const sessionMinutes = sessionDuration / (1000 * 60);
  const uptime = Math.floor(sessionSeconds);

  // Calculate burn rate
  if (sessionSeconds > 0) {
    state.burnRate = {
      tokensPerSecond: state.totalTokens / sessionSeconds,
      tokensPerMinute: sessionMinutes > 0 ? state.totalTokens / sessionMinutes : 0,
      costPerMinute: sessionMinutes > 0 ? state.totalCost / sessionMinutes : 0,
      costPerHour: sessionMinutes > 0 ? (state.totalCost / sessionMinutes) * 60 : 0
    };
  }

  // Update daily usage
  if (now >= state.dailyUsage.resetTime) {
    state.dailyUsage = initializeDailyUsage();
  }
  state.dailyUsage.tokens = state.totalTokens;
  state.dailyUsage.cost = state.totalCost;
  state.dailyUsage.remaining = Math.max(0, state.dailyUsage.limit - state.dailyUsage.tokens);

  // Update weekly usage
  if (now >= state.weeklyUsage.resetTime) {
    state.weeklyUsage = initializeWeeklyUsage();
  }
  state.weeklyUsage.tokens = state.totalTokens;
  state.weeklyUsage.cost = state.totalCost;
  state.weeklyUsage.remaining = Math.max(0, state.weeklyUsage.limit - state.weeklyUsage.tokens);

  // Calculate projections
  if (state.burnRate.tokensPerSecond > 0) {
    const dailyRemaining = state.dailyUsage.remaining;
    if (dailyRemaining > 0) {
      const secondsUntilDailyExhausted = dailyRemaining / state.burnRate.tokensPerSecond;
      state.projections.dailyLimitExhaustedAt = now + (secondsUntilDailyExhausted * 1000);
      state.projections.timeRemaining = secondsUntilDailyExhausted * 1000;
    } else {
      state.projections.dailyLimitExhaustedAt = now;
      state.projections.timeRemaining = 0;
    }

    const sessionRemaining = config.tokenBudget - state.totalTokens;
    if (sessionRemaining > 0) {
      const secondsUntilExhausted = sessionRemaining / state.burnRate.tokensPerSecond;
      state.projections.tokensExhaustedAt = now + (secondsUntilExhausted * 1000);
    }
  }

  // Update UI components
  updateSessionInfo(sessionBox, {
    sessionId: state.sessionId,
    inputTokens: state.inputTokens,
    outputTokens: state.outputTokens,
    totalTokens: state.totalTokens,
    totalCost: state.totalCost,
    uptime: uptime
  });

  updateBurnRateBox(burnRateBox, {
    burnRate: state.burnRate,
    projections: state.projections,
    dailyUsage: state.dailyUsage
  });

  updateUsageLimitsBox(usageLimitsBox, {
    dailyUsage: state.dailyUsage,
    weeklyUsage: state.weeklyUsage
  });

  if (tokenGauge) {
    updateTokenGauge(tokenGauge, state.totalTokens, config.tokenBudget);
  }

  updateWorkflowTable(workflowTable, state.workflows);
  updateConnectionStatus(connectionStatus, state.connectionStatus);

  screen.render();
}

/**
 * Reset token counters
 */
function resetCounters() {
  state.inputTokens = 0;
  state.outputTokens = 0;
  state.totalTokens = 0;
  state.totalCost = 0;
  state.workflows = [];
  state.startTime = Date.now();

  // Reset enhanced tracking
  state.burnRate = {
    tokensPerSecond: 0,
    tokensPerMinute: 0,
    costPerMinute: 0,
    costPerHour: 0
  };
  state.dailyUsage = initializeDailyUsage();
  state.weeklyUsage = initializeWeeklyUsage();
  state.projections = {
    tokensExhaustedAt: null,
    timeRemaining: null,
    dailyLimitExhaustedAt: null
  };

  addEventToLog(eventLog, {
    timestamp: new Date(),
    eventType: 'system',
    description: 'Counters reset'
  });

  updateUI();
}

/**
 * Clear event log
 */
function clearLog() {
  eventLog.setContent('');
  state.events = [];

  addEventToLog(eventLog, {
    timestamp: new Date(),
    eventType: 'system',
    description: 'Log cleared'
  });

  screen.render();
}

/**
 * Calculate token cost
 * Using Claude Sonnet 4.5 pricing as example
 * @param {number} inputTokens - Input tokens
 * @param {number} outputTokens - Output tokens
 * @returns {number} Cost in USD
 */
function calculateCost(inputTokens, outputTokens) {
  const inputCostPerMillion = 3.00;   // $3 per million input tokens
  const outputCostPerMillion = 15.00; // $15 per million output tokens

  const inputCost = (inputTokens / 1000000) * inputCostPerMillion;
  const outputCost = (outputTokens / 1000000) * outputCostPerMillion;

  return inputCost + outputCost;
}

/**
 * Handle incoming WebSocket message
 * @param {string} data - Raw message data
 */
function handleMessage(data) {
  try {
    const message = JSON.parse(data);

    // Update session ID
    if (message.sessionId && !state.sessionId) {
      state.sessionId = message.sessionId;
    }

    // Handle different message types
    switch (message.type) {
      case 'token_usage':  // Fixed: underscore to match server
      case 'token-usage':  // Keep hyphen for backwards compatibility
        handleTokenUsage(message);
        break;

      case 'workflow_completed':
      case 'workflow-complete':
        handleWorkflowComplete(message);
        break;

      case 'task-start':
      case 'task_start':
      case 'task-complete':
      case 'task_complete':
      case 'tool-call':
      case 'tool_call':
      case 'user-prompt-submit':
      case 'user_prompt_submit':
        handleGeneralEvent(message);
        break;

      case 'connection':
        // Handle connection message - extract snapshot data
        if (message.data && message.data.snapshot) {
          const snapshot = message.data.snapshot;
          if (snapshot.session) {
            handleSnapshotUpdate(snapshot.session);
          }
        }
        break;

      default:
        // Generic message handling
        if (message.data && message.data.session) {
          // Handle data from API responses
          handleSnapshotUpdate(message.data.session);
        } else if (message.inputTokens || message.outputTokens) {
          handleTokenUsage(message);
        }
    }

    updateUI();
  } catch (error) {
    addEventToLog(eventLog, {
      timestamp: new Date(),
      eventType: 'error',
      description: `Parse error: ${error.message}`
    });
    screen.render();
  }
}

/**
 * Handle token usage update
 * @param {Object} message - Token usage message
 */
function handleTokenUsage(message) {
  const inputTokens = message.inputTokens || 0;
  const outputTokens = message.outputTokens || 0;

  state.inputTokens += inputTokens;
  state.outputTokens += outputTokens;
  state.totalTokens += inputTokens + outputTokens;
  state.totalCost = calculateCost(state.inputTokens, state.outputTokens);

  addEventToLog(eventLog, {
    timestamp: message.timestamp || new Date(),
    eventType: 'token-usage',
    inputTokens: inputTokens,
    outputTokens: outputTokens
  });

  // Check budget threshold
  const percentage = (state.totalTokens / config.tokenBudget) * 100;
  if (percentage >= 90 && percentage < 90.5) {
    addEventToLog(eventLog, {
      timestamp: new Date(),
      eventType: 'warning',
      description: `⚠ Token budget at ${Math.round(percentage)}%`
    });
  }
}

/**
 * Handle workflow completion
 * @param {Object} message - Workflow completion message
 */
function handleWorkflowComplete(message) {
  const workflow = {
    workflowId: message.workflowId || `wf_${Date.now()}`,
    totalTokens: message.totalTokens || 0,
    cost: message.cost || calculateCost(message.inputTokens || 0, message.outputTokens || 0),
    status: message.status || 'completed',
    timestamp: message.timestamp || new Date()
  };

  state.workflows.push(workflow);

  // Keep only last 50 workflows in memory
  if (state.workflows.length > 50) {
    state.workflows = state.workflows.slice(-50);
  }

  addEventToLog(eventLog, {
    timestamp: workflow.timestamp,
    eventType: 'workflow-complete',
    description: `Workflow ${workflow.workflowId} completed - ${workflow.totalTokens} tokens`
  });
}

/**
 * Handle snapshot update from server
 * @param {Object} session - Session data from server
 */
function handleSnapshotUpdate(session) {
  // Update state from server snapshot
  if (session.totalInputTokens !== undefined) {
    state.inputTokens = session.totalInputTokens;
  }
  if (session.totalOutputTokens !== undefined) {
    state.outputTokens = session.totalOutputTokens;
  }
  if (session.totalTokens !== undefined) {
    state.totalTokens = session.totalTokens;
  }
  if (session.totalCost !== undefined) {
    state.totalCost = session.totalCost;
  }
  if (session.sessionId && !state.sessionId) {
    state.sessionId = session.sessionId;
  }

  addEventToLog(eventLog, {
    timestamp: new Date(),
    eventType: 'sync',
    description: `Synced: ${session.totalTokens || 0} tokens, $${(session.totalCost || 0).toFixed(4)}`
  });
}

/**
 * Handle general events
 * @param {Object} message - Event message
 */
function handleGeneralEvent(message) {
  addEventToLog(eventLog, {
    timestamp: message.timestamp || new Date(),
    eventType: message.type,
    description: message.description || message.prompt || ''
  });
}

/**
 * Connect to WebSocket server
 */
function connect() {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    return;
  }

  state.connectionStatus = 'connecting';
  updateUI();

  try {
    state.ws = new WebSocket(config.websocketUrl);

    state.ws.on('open', () => {
      state.connectionStatus = 'connected';
      state.reconnectAttempts = 0;

      addEventToLog(eventLog, {
        timestamp: new Date(),
        eventType: 'system',
        description: `Connected to ${config.websocketUrl}`
      });

      updateUI();
    });

    state.ws.on('message', handleMessage);

    state.ws.on('close', () => {
      state.connectionStatus = 'disconnected';

      addEventToLog(eventLog, {
        timestamp: new Date(),
        eventType: 'system',
        description: 'Connection closed'
      });

      updateUI();

      // Attempt reconnection
      if (state.reconnectAttempts < config.maxReconnectAttempts) {
        state.reconnectAttempts++;
        setTimeout(connect, config.reconnectDelay);

        addEventToLog(eventLog, {
          timestamp: new Date(),
          eventType: 'system',
          description: `Reconnecting in ${config.reconnectDelay / 1000}s (attempt ${state.reconnectAttempts}/${config.maxReconnectAttempts})`
        });
      } else {
        addEventToLog(eventLog, {
          timestamp: new Date(),
          eventType: 'error',
          description: 'Max reconnection attempts reached'
        });
      }

      screen.render();
    });

    state.ws.on('error', (error) => {
      state.connectionStatus = 'error';

      addEventToLog(eventLog, {
        timestamp: new Date(),
        eventType: 'error',
        description: `Connection error: ${error.message}`
      });

      updateUI();
    });
  } catch (error) {
    state.connectionStatus = 'error';

    addEventToLog(eventLog, {
      timestamp: new Date(),
      eventType: 'error',
      description: `Failed to connect: ${error.message}`
    });

    updateUI();
  }
}

/**
 * Cleanup and exit
 */
function cleanup() {
  if (state.ws) {
    state.ws.close();
  }

  if (screen) {
    screen.destroy();
  }

  process.exit(0);
}

/**
 * Main entry point
 */
function main() {
  console.log('Starting Claude Code Token Monitor...');
  console.log(`Token Budget: ${config.tokenBudget.toLocaleString()}`);
  console.log(`WebSocket URL: ${config.websocketUrl}`);
  console.log('');

  // Initialize UI
  initializeUI();

  // Connect to WebSocket server
  connect();

  // Update UI periodically
  setInterval(updateUI, config.refreshRate);

  // Handle process termination
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Welcome message
  addEventToLog(eventLog, {
    timestamp: new Date(),
    eventType: 'system',
    description: 'Token monitor started'
  });

  screen.render();
}

// Start the application
if (require.main === module) {
  main();
}

module.exports = {
  main,
  config,
  state
};
