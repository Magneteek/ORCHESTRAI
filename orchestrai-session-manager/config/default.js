/**
 * Default Configuration
 * Can be overridden via environment variables or config files
 */

const path = require('path');

module.exports = {
  // Storage Configuration
  storage: {
    // Storage type: 'file' or 'postgres'
    type: process.env.SESSION_STORAGE_TYPE || 'file',

    // Base path for file storage
    basePath: process.env.SESSION_STORAGE_PATH ||
             path.join(__dirname, '../../sessions'),

    // Compression settings
    compression: {
      enabled: true,
      olderThan: 30, // days
      algorithm: 'gzip'
    },

    // Retention policy
    retention: {
      keepCompleted: 180, // days
      keepFailed: 90,
      keepArchived: 365
    },

    // PostgreSQL settings (if type === 'postgres')
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'orchestrai_sessions',
      user: process.env.POSTGRES_USER || 'orchestrai',
      password: process.env.POSTGRES_PASSWORD,
      ssl: process.env.POSTGRES_SSL === 'true'
    }
  },

  // Capture Configuration
  capture: {
    // Transcript detail level: 'full', 'summary', 'minimal'
    transcriptDetail: process.env.SESSION_TRANSCRIPT_DETAIL || 'full',

    // Capture thinking steps
    captureThinking: process.env.SESSION_CAPTURE_THINKING !== 'false',

    // Capture tool calls
    captureToolCalls: process.env.SESSION_CAPTURE_TOOL_CALLS !== 'false',

    // Capture outputs and deliverables
    captureOutputs: process.env.SESSION_CAPTURE_OUTPUTS !== 'false',

    // Debounce save interval (ms)
    saveDebounceCLI: 1000,

    // Maximum transcript entries before automatic archival
    maxTranscriptLength: 10000
  },

  // Viewer Configuration
  viewer: {
    // Web UI settings
    web: {
      enabled: process.env.SESSION_VIEWER_WEB_ENABLED !== 'false',
      port: process.env.SESSION_VIEWER_PORT || 5502,
      host: process.env.SESSION_VIEWER_HOST || 'localhost',
      auth: process.env.SESSION_VIEWER_AUTH === 'true',
      cors: process.env.SESSION_VIEWER_CORS !== 'false'
    },

    // CLI settings
    cli: {
      defaultLimit: 20,
      colorize: process.env.SESSION_VIEWER_COLORIZE !== 'false',
      verbose: process.env.SESSION_VIEWER_VERBOSE === 'true'
    }
  },

  // API Configuration
  api: {
    enabled: process.env.SESSION_API_ENABLED !== 'false',
    port: process.env.SESSION_API_PORT || 5503,
    host: process.env.SESSION_API_HOST || 'localhost',
    cors: process.env.SESSION_API_CORS !== 'false',

    // Rate limiting
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 100 // max requests per window
    },

    // Authentication
    auth: {
      enabled: process.env.SESSION_API_AUTH === 'true',
      type: 'jwt', // 'jwt' or 'api-key'
      secret: process.env.SESSION_API_SECRET || 'change-me-in-production'
    }
  },

  // Resumption Configuration
  resumption: {
    // Enable session resumption
    enabled: process.env.SESSION_RESUMPTION_ENABLED !== 'false',

    // Maximum fork depth
    maxForkDepth: 5,

    // Auto-identify resume points
    autoResumePoints: true,

    // Minimum steps between resume points
    minStepsBetweenResumePoints: 10
  },

  // Integration Configuration
  integration: {
    // Claude Code integration
    claudeCode: {
      enabled: process.env.CLAUDE_CODE_INTEGRATION !== 'false',
      hookPath: process.env.CLAUDE_CODE_HOOK_PATH || '.claude/hooks'
    },

    // GitHub integration
    github: {
      enabled: process.env.GITHUB_INTEGRATION === 'true',
      linkPRs: true,
      linkIssues: true
    },

    // Slack notifications
    slack: {
      enabled: process.env.SLACK_INTEGRATION === 'true',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      notifyOnCompletion: true,
      notifyOnFailure: true
    }
  },

  // Analytics Configuration
  analytics: {
    // Track agent performance metrics
    enabled: process.env.SESSION_ANALYTICS_ENABLED !== 'false',

    // Export metrics to external systems
    export: {
      enabled: false,
      destinations: []
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'pretty',
    destination: process.env.LOG_DESTINATION || 'console'
  }
};
