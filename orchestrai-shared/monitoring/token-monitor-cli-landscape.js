#!/usr/bin/env node

/**
 * Token Monitor CLI - Landscape Layout
 * Compact, wide dashboard with cost analytics and efficiency metrics
 */

const WebSocket = require('ws');
const http = require('http');
const {
  createScreen,
  createHeader,
  createSessionInfo,
  createBurnRateBox,
  createCostAnalyticsBox,
  createEfficiencyBox,
  createRollingWindowBox,
  createWorkflowTable,
  createFooter,
  updateSessionInfo,
  updateBurnRateBox,
  updateCostAnalyticsBox,
  updateEfficiencyBox,
  updateRollingWindowBox,
  updateWorkflowTable
} = require('./cli-components-landscape');

// Configuration
const config = {
  tokenBudget: parseInt(process.env.TOKEN_BUDGET || '200000', 10),
  websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:5505',
  apiUrl: process.env.API_URL || 'http://localhost:5505',
  refreshRate: parseInt(process.env.REFRESH_RATE || '1000', 10), // 1 second for analytics
  reconnectDelay: 3000
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
  connectionStatus: 'disconnected',
  ws: null,
  burnRate: {
    tokensPerSecond: 0,
    tokensPerMinute: 0,
    costPerMinute: 0,
    costPerHour: 0
  },
  dailyUsage: {
    tokens: 0,
    cost: 0,
    limit: 200000,
    remaining: 200000
  },
  weeklyUsage: {
    tokens: 0,
    cost: 0,
    limit: 1400000,
    remaining: 1400000
  },
  // NEW: Analytics data
  costAnalytics: null,
  efficiencyMetrics: null,
  rollingWindow: null
};

// UI components
let screen, header, sessionBox, burnRateBox, costAnalyticsBox, efficiencyBox, rollingWindowBox, workflowTable, footer;

/**
 * Initialize the UI
 */
function initializeUI() {
  screen = createScreen();
  header = createHeader(screen);
  sessionBox = createSessionInfo(screen);
  burnRateBox = createBurnRateBox(screen);
  costAnalyticsBox = createCostAnalyticsBox(screen);
  efficiencyBox = createEfficiencyBox(screen);
  rollingWindowBox = createRollingWindowBox(screen);
  workflowTable = createWorkflowTable(screen);
  footer = createFooter(screen);

  // Keyboard handlers
  screen.key(['r'], resetCounters);
  screen.key(['c'], () => screen.render());
  screen.key(['h'], () => {});

  updateUI();
  screen.render();
}

/**
 * Fetch analytics from API
 */
async function fetchAnalytics() {
  try {
    // Fetch cost analytics
    const costResponse = await fetch(`${config.apiUrl}/api/cost-analytics`);
    if (costResponse.ok) {
      const costData = await costResponse.json();
      state.costAnalytics = costData.data;
    }

    // Fetch efficiency metrics
    const efficiencyResponse = await fetch(`${config.apiUrl}/api/efficiency-metrics`);
    if (efficiencyResponse.ok) {
      const efficiencyData = await efficiencyResponse.json();
      state.efficiencyMetrics = efficiencyData.data;
    }
  } catch (error) {
    // Silently fail - analytics are optional
  }
}

/**
 * Fetch analytics using http module (Node.js native)
 */
function fetchAnalyticsNode() {
  // Cost analytics
  http.get(`${config.apiUrl}/api/cost-analytics`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        state.costAnalytics = JSON.parse(data).data;
      } catch(e) {}
    });
  }).on('error', () => {});

  // Efficiency metrics
  http.get(`${config.apiUrl}/api/efficiency-metrics`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        state.efficiencyMetrics = JSON.parse(data).data;
      } catch(e) {}
    });
  }).on('error', () => {});

  // Rolling window
  http.get(`${config.apiUrl}/api/rolling-window`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        state.rollingWindow = JSON.parse(data).data;
      } catch(e) {}
    });
  }).on('error', () => {});
}

/**
 * Update all UI components
 */
function updateUI() {
  const now = Date.now();
  const sessionDuration = now - state.startTime;
  const sessionSeconds = sessionDuration / 1000;
  const sessionMinutes = sessionDuration / (1000 * 60);

  // Calculate burn rate
  if (sessionSeconds > 0) {
    state.burnRate = {
      tokensPerSecond: state.totalTokens / sessionSeconds,
      tokensPerMinute: sessionMinutes > 0 ? state.totalTokens / sessionMinutes : 0,
      costPerMinute: sessionMinutes > 0 ? state.totalCost / sessionMinutes : 0,
      costPerHour: sessionMinutes > 0 ? (state.totalCost / sessionMinutes) * 60 : 0
    };
  }

  // Update daily/weekly usage
  state.dailyUsage.tokens = state.totalTokens;
  state.dailyUsage.cost = state.totalCost;
  state.dailyUsage.remaining = Math.max(0, state.dailyUsage.limit - state.dailyUsage.tokens);

  state.weeklyUsage.tokens = state.totalTokens;
  state.weeklyUsage.cost = state.totalCost;
  state.weeklyUsage.remaining = Math.max(0, state.weeklyUsage.limit - state.weeklyUsage.tokens);

  // Calculate time until tokens run out
  const projection = {
    timeUntilEmpty: null
  };

  if (state.burnRate.tokensPerSecond > 0) {
    const remaining = state.dailyUsage.limit - state.totalTokens;
    if (remaining > 0) {
      projection.timeUntilEmpty = (remaining / state.burnRate.tokensPerSecond) * 1000; // ms
    }
  }

  // Update UI components
  updateSessionInfo(sessionBox, {
    sessionId: state.sessionId,
    inputTokens: state.inputTokens,
    outputTokens: state.outputTokens,
    totalTokens: state.totalTokens,
    totalCost: state.totalCost,
    uptime: sessionDuration
  });

  updateBurnRateBox(burnRateBox, state.burnRate, projection);
  updateCostAnalyticsBox(costAnalyticsBox, state.costAnalytics);
  updateEfficiencyBox(efficiencyBox, state.efficiencyMetrics);
  updateRollingWindowBox(rollingWindowBox, state.rollingWindow);
  updateWorkflowTable(workflowTable, state.workflows);

  screen.render();
}

/**
 * Handle incoming WebSocket message
 */
function handleMessage(data) {
  try {
    const message = JSON.parse(data);

    if (message.sessionId && !state.sessionId) {
      state.sessionId = message.sessionId;
    }

    switch (message.type) {
      case 'token_usage':
      case 'token-usage':
        // Data can be nested under message.data or directly on message
        const tokenData = message.data || message;
        const costData = tokenData.costData || {};

        const inputTokens = costData.inputTokens || tokenData.inputTokens || 0;
        const outputTokens = costData.outputTokens || tokenData.outputTokens || 0;
        const totalTokens = inputTokens + outputTokens;
        const cost = costData.totalCost || tokenData.cost || tokenData.totalCost || 0;

        state.inputTokens += inputTokens;
        state.outputTokens += outputTokens;
        state.totalTokens = state.inputTokens + state.outputTokens;
        state.totalCost += cost;

        // Add to workflows history
        if (totalTokens > 0) {
          state.workflows.unshift({
            id: tokenData.workflowId || message.workflowId || `wf-${Date.now()}`,
            totalTokens: totalTokens,
            totalCost: cost,
            timestamp: Date.now()
          });

          // Keep only last 10 workflows
          if (state.workflows.length > 10) {
            state.workflows = state.workflows.slice(0, 10);
          }
        }
        break;

      case 'connection':
        if (message.data?.snapshot?.session) {
          const session = message.data.snapshot.session;
          state.inputTokens = session.totalInputTokens || 0;
          state.outputTokens = session.totalOutputTokens || 0;
          state.totalTokens = session.totalTokens || 0;
          state.totalCost = session.totalCost || 0;
          state.sessionId = session.sessionId;
        }
        break;
    }

    updateUI();
  } catch (error) {
    // Silently ignore parse errors
  }
}

/**
 * Connect to WebSocket server
 */
function connect() {
  try {
    state.ws = new WebSocket(config.websocketUrl);
    state.connectionStatus = 'connecting';

    state.ws.on('open', () => {
      state.connectionStatus = 'connected';
      updateUI();
    });

    state.ws.on('message', handleMessage);

    state.ws.on('close', () => {
      state.connectionStatus = 'disconnected';
      updateUI();
      setTimeout(connect, config.reconnectDelay);
    });

    state.ws.on('error', () => {
      state.connectionStatus = 'error';
      updateUI();
    });
  } catch (error) {
    state.connectionStatus = 'error';
    updateUI();
  }
}

/**
 * Reset counters
 */
function resetCounters() {
  state.inputTokens = 0;
  state.outputTokens = 0;
  state.totalTokens = 0;
  state.totalCost = 0;
  state.workflows = [];
  state.startTime = Date.now();
  updateUI();
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
  console.log('Starting Claude Code Token Monitor (Landscape Layout)...');
  console.log(`Token Budget: ${config.tokenBudget.toLocaleString()}`);
  console.log(`WebSocket URL: ${config.websocketUrl}`);
  console.log('');

  // Initialize UI
  initializeUI();

  // Connect to WebSocket
  connect();

  // Update UI periodically
  setInterval(updateUI, config.refreshRate);

  // Fetch analytics periodically (every 5 seconds)
  fetchAnalyticsNode();
  setInterval(fetchAnalyticsNode, 5000);

  // Handle process termination
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

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
