/**
 * Session Capture Hook
 * Automatically captures agent sessions when Task tool is invoked
 *
 * This hook integrates the Session Manager with Claude Code
 * to provide full transparency and recoverability for all agent executions.
 */

const path = require('path');
const fs = require('fs');

// Initialize Session Manager
let SessionManager;
let sessionManager;

try {
  const SessionManagerPath = path.join(__dirname, '../../orchestrai-session-manager');
  SessionManager = require(SessionManagerPath);
  sessionManager = new SessionManager({
    storage: {
      basePath: path.join(__dirname, '../../sessions')
    }
  });
  console.log('✅ Session Manager initialized');
} catch (error) {
  console.warn('⚠️  Session Manager not available:', error.message);
}

// Store active sessions
const activeSessions = new Map();

module.exports = {
  name: 'session-capture',
  version: '1.0.0',
  description: 'Automatically capture agent sessions for transparency and recoverability',

  /**
   * PreToolUse Hook - Captures session start when Task tool is invoked
   */
  async preToolUse(context) {
    // Only capture Task tool invocations
    if (context.toolName !== 'Task') {
      return { allowExecution: true };
    }

    if (!sessionManager) {
      return { allowExecution: true };
    }

    try {
      const params = context.parameters || {};

      // Extract project context from working directory or environment
      const projectContext = extractProjectContext(context);

      // Start session
      const session = await sessionManager.startSession({
        agentType: params.subagent_type || 'unknown',
        prompt: params.prompt || '',
        parameters: {
          description: params.description,
          model: params.model,
          run_in_background: params.run_in_background
        },
        projectContext,
        invokedBy: context.parentAgent || 'user',
        tags: extractTags(params)
      });

      // Store session for PostToolUse
      activeSessions.set(context.toolUseId, session.sessionId);

      // Output session info to user
      console.log(`\n🔍 Session: ${session.sessionId}`);
      console.log(`   Agent: ${params.subagent_type}`);
      console.log(`   View: node orchestrai-session-manager/cli/session-viewer.js view ${session.sessionId}\n`);

      // Allow execution to proceed
      return {
        allowExecution: true,
        metadata: {
          sessionId: session.sessionId
        }
      };
    } catch (error) {
      console.error('❌ Failed to start session:', error.message);
      // Don't block execution if session capture fails
      return { allowExecution: true };
    }
  },

  /**
   * PostToolUse Hook - Captures session completion
   */
  async postToolUse(context) {
    // Only process Task tool
    if (context.toolName !== 'Task') {
      return;
    }

    if (!sessionManager) {
      return;
    }

    const sessionId = activeSessions.get(context.toolUseId);
    if (!sessionId) {
      return;
    }

    try {
      const result = context.result || {};

      // Extract deliverables from result
      const deliverables = extractDeliverables(result);

      // Extract metrics
      const metrics = {
        totalTokens: result.totalTokens || 0,
        inputTokens: result.inputTokens || 0,
        outputTokens: result.outputTokens || 0
      };

      // Determine status
      const status = context.error ? 'failed' : 'completed';

      // End session
      await sessionManager.endSession(sessionId, {
        status,
        outputs: result.outputs,
        deliverables,
        ...metrics,
        error: context.error ? context.error.message : undefined
      });

      // Output completion info
      if (status === 'completed') {
        console.log(`\n✅ Session completed: ${sessionId}`);
        if (deliverables.length > 0) {
          console.log(`   Deliverables: ${deliverables.length}`);
        }
        console.log(`   View: node orchestrai-session-manager/cli/session-viewer.js view ${sessionId}\n`);
      } else {
        console.log(`\n❌ Session failed: ${sessionId}`);
        console.log(`   Error: ${context.error.message}`);
        console.log(`   View: node orchestrai-session-manager/cli/session-viewer.js view ${sessionId}\n`);
      }

      // Clean up
      activeSessions.delete(context.toolUseId);
    } catch (error) {
      console.error('❌ Failed to end session:', error.message);
    }
  }
};

/**
 * Extract project context from environment
 */
function extractProjectContext(context) {
  const cwd = context.workingDirectory || process.cwd();

  // Try to find project ID from current directory
  let projectId = null;
  let clientId = null;

  // Check if we're in a project directory
  if (cwd.includes('/projects/')) {
    const match = cwd.match(/\/projects\/([^\/]+)/);
    if (match) {
      const projectName = match[1];
      // Extract UUID if present
      const uuidMatch = projectName.match(/([0-9a-f-]{36})/i);
      if (uuidMatch) {
        projectId = `proj-${uuidMatch[1].substring(0, 8)}`;
      } else {
        projectId = projectName;
      }
    }
  }

  // Try to extract client ID from project metadata
  try {
    const projectMetadataPath = path.join(cwd, 'project-metadata.json');
    if (fs.existsSync(projectMetadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(projectMetadataPath, 'utf8'));
      clientId = metadata.clientId || metadata.clientName;
      projectId = metadata.projectId || projectId;
    }
  } catch (error) {
    // Ignore errors
  }

  return {
    projectId,
    clientId,
    workingDirectory: cwd
  };
}

/**
 * Extract tags from parameters
 */
function extractTags(params) {
  const tags = [];

  // Add agent type as tag
  if (params.subagent_type) {
    const parts = params.subagent_type.split('-');
    tags.push(parts[0]); // e.g., "content" from "content-writer-specialist"
  }

  // Add description-based tags
  if (params.description) {
    const desc = params.description.toLowerCase();
    if (desc.includes('article')) tags.push('article');
    if (desc.includes('seo')) tags.push('seo');
    if (desc.includes('research')) tags.push('research');
    if (desc.includes('content')) tags.push('content');
  }

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Extract deliverables from result
 */
function extractDeliverables(result) {
  const deliverables = [];

  // Check for deliverables array
  if (Array.isArray(result.deliverables)) {
    deliverables.push(...result.deliverables);
  }

  // Check for outputs with files
  if (result.outputs && Array.isArray(result.outputs.files)) {
    for (const file of result.outputs.files) {
      if (file.path && !deliverables.includes(file.path)) {
        deliverables.push(file.path);
      }
    }
  }

  // Check for files array
  if (Array.isArray(result.files)) {
    for (const file of result.files) {
      const filePath = typeof file === 'string' ? file : file.path;
      if (filePath && !deliverables.includes(filePath)) {
        deliverables.push(filePath);
      }
    }
  }

  return deliverables;
}
