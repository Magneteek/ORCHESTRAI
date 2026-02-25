#!/usr/bin/env node
/**
 * Session Viewer CLI
 * Command-line interface for viewing agent sessions
 */

const SessionRetrieval = require('../core/session-retrieval');
const SessionResumption = require('../core/session-resumption');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

class SessionViewerCLI {
  constructor() {
    this.retrieval = new SessionRetrieval({
      basePath: path.join(__dirname, '../../sessions')
    });

    this.resumption = new SessionResumption({
      basePath: path.join(__dirname, '../../sessions')
    });
  }

  /**
   * Main entry point
   */
  async run(args) {
    const command = args[2] || 'help';
    const params = args.slice(3);

    try {
      switch (command) {
        case 'view':
        case 'show':
          await this.viewSession(params[0]);
          break;

        case 'list':
        case 'ls':
          await this.listSessions(params);
          break;

        case 'search':
          await this.searchSessions(params);
          break;

        case 'transcript':
        case 'trans':
          await this.viewTranscript(params[0]);
          break;

        case 'deliverables':
        case 'files':
          await this.viewDeliverables(params[0]);
          break;

        case 'find-by-file':
        case 'find':
          await this.findByDeliverable(params[0]);
          break;

        case 'related':
          await this.viewRelated(params[0]);
          break;

        case 'stats':
          await this.viewStats();
          break;

        case 'resume-points':
        case 'resume':
          await this.viewResumePoints(params[0]);
          break;

        case 'forks':
          await this.viewForks(params[0]);
          break;

        case 'help':
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error(`${COLORS.red}Error: ${error.message}${COLORS.reset}`);
      process.exit(1);
    }
  }

  /**
   * View session details
   */
  async viewSession(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID required');
    }

    const session = await this.retrieval.getSession(sessionId);

    this.printHeader('Session Details');

    console.log(`${COLORS.bright}Session ID:${COLORS.reset} ${session.sessionId}`);
    console.log(`${COLORS.bright}Agent:${COLORS.reset} ${session.agent.type}`);
    console.log(`${COLORS.bright}Model:${COLORS.reset} ${session.agent.model}`);
    console.log(`${COLORS.bright}Status:${COLORS.reset} ${this.colorizeStatus(session.status)}`);
    console.log(`${COLORS.bright}Started:${COLORS.reset} ${this.formatDate(session.timestamp)}`);

    if (session.duration) {
      console.log(`${COLORS.bright}Duration:${COLORS.reset} ${(session.duration / 1000).toFixed(1)}s`);
    }

    console.log();
    this.printHeader('Execution Context');
    console.log(`${COLORS.dim}${session.invocation.prompt.substring(0, 200)}...${COLORS.reset}`);

    if (session.invocation.projectContext.projectId) {
      console.log();
      this.printHeader('Project Context');
      console.log(`${COLORS.bright}Project:${COLORS.reset} ${session.invocation.projectContext.projectId}`);
      console.log(`${COLORS.bright}Client:${COLORS.reset} ${session.invocation.projectContext.clientId || 'N/A'}`);
    }

    console.log();
    this.printHeader('Metrics');
    console.log(`${COLORS.bright}Total Tokens:${COLORS.reset} ${session.metrics.totalTokens.toLocaleString()}`);
    console.log(`${COLORS.bright}Cost:${COLORS.reset} $${session.metrics.cost.toFixed(4)}`);
    console.log(`${COLORS.bright}Tool Calls:${COLORS.reset} ${session.toolCalls.length}`);

    if (session.links.deliverables.length > 0) {
      console.log();
      this.printHeader('Deliverables');
      for (const deliverable of session.links.deliverables.slice(0, 5)) {
        console.log(`  ${COLORS.cyan}▸${COLORS.reset} ${deliverable}`);
      }
      if (session.links.deliverables.length > 5) {
        console.log(`  ${COLORS.dim}... and ${session.links.deliverables.length - 5} more${COLORS.reset}`);
      }
    }

    if (session.errors.length > 0) {
      console.log();
      this.printHeader('Errors', 'red');
      for (const error of session.errors) {
        console.log(`  ${COLORS.red}✗${COLORS.reset} ${error.message}`);
      }
    }

    if (session.warnings.length > 0) {
      console.log();
      this.printHeader('Warnings', 'yellow');
      for (const warning of session.warnings) {
        console.log(`  ${COLORS.yellow}⚠${COLORS.reset} ${warning.message}`);
      }
    }

    console.log();
    console.log(`${COLORS.dim}View transcript: orchestrai session transcript ${sessionId}${COLORS.reset}`);
    console.log(`${COLORS.dim}View deliverables: orchestrai session deliverables ${sessionId}${COLORS.reset}`);
  }

  /**
   * List sessions
   */
  async listSessions(params) {
    const limit = parseInt(params.find(p => p.match(/^\d+$/))) || 20;
    const sessions = await this.retrieval.getRecent(limit);

    this.printHeader(`Recent Sessions (${sessions.length})`);

    for (const session of sessions) {
      const duration = session.duration ? `${(session.duration / 1000).toFixed(1)}s` : 'N/A';
      const status = this.colorizeStatus(session.status);

      console.log(`${COLORS.cyan}${session.sessionId}${COLORS.reset}`);
      console.log(`  ${COLORS.dim}Agent:${COLORS.reset} ${session.agentType} ${COLORS.dim}|${COLORS.reset} ${status} ${COLORS.dim}|${COLORS.reset} ${duration}`);
      console.log(`  ${COLORS.dim}${this.formatDate(session.timestamp)}${COLORS.reset}`);
      console.log();
    }

    console.log(`${COLORS.dim}View session: orchestrai session view <session-id>${COLORS.reset}`);
  }

  /**
   * View transcript
   */
  async viewTranscript(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID required');
    }

    const transcript = await this.retrieval.getTranscript(sessionId);

    this.printHeader(`Transcript: ${sessionId}`);

    for (let i = 0; i < transcript.length; i++) {
      const entry = transcript[i];

      console.log(`${COLORS.dim}[${i}]${COLORS.reset} ${this.colorizeRole(entry.role)}`);

      if (entry.role === 'tool_use') {
        console.log(`  ${COLORS.magenta}Tool:${COLORS.reset} ${entry.tool}`);
        if (entry.parameters) {
          console.log(`  ${COLORS.dim}${JSON.stringify(entry.parameters).substring(0, 100)}...${COLORS.reset}`);
        }
      } else {
        const content = entry.content.substring(0, 200);
        console.log(`  ${COLORS.dim}${content}...${COLORS.reset}`);
      }

      if (entry.thinking) {
        console.log(`  ${COLORS.dim}💭 ${entry.thinking.substring(0, 150)}...${COLORS.reset}`);
      }

      console.log();
    }
  }

  /**
   * View deliverables
   */
  async viewDeliverables(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID required');
    }

    const session = await this.retrieval.getSession(sessionId);

    this.printHeader(`Deliverables: ${sessionId}`);

    if (session.links.deliverables.length === 0) {
      console.log(`${COLORS.dim}No deliverables${COLORS.reset}`);
      return;
    }

    for (const deliverable of session.links.deliverables) {
      console.log(`${COLORS.cyan}▸${COLORS.reset} ${deliverable}`);
    }
  }

  /**
   * Find session by deliverable
   */
  async findByDeliverable(deliverablePath) {
    if (!deliverablePath) {
      throw new Error('Deliverable path required');
    }

    const session = await this.retrieval.findByDeliverable(deliverablePath);

    if (!session) {
      console.log(`${COLORS.yellow}No session found for: ${deliverablePath}${COLORS.reset}`);
      return;
    }

    console.log(`${COLORS.green}Found session:${COLORS.reset} ${session.sessionId}`);
    console.log(`${COLORS.dim}View: orchestrai session view ${session.sessionId}${COLORS.reset}`);
  }

  /**
   * View related sessions
   */
  async viewRelated(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID required');
    }

    const related = await this.retrieval.getRelated(sessionId);

    this.printHeader(`Related Sessions: ${sessionId}`);

    if (related.length === 0) {
      console.log(`${COLORS.dim}No related sessions${COLORS.reset}`);
      return;
    }

    for (const session of related) {
      console.log(`${COLORS.cyan}${session.sessionId}${COLORS.reset}`);
      console.log(`  ${COLORS.dim}${session.agentType} | ${this.formatDate(session.timestamp)}${COLORS.reset}`);
      console.log();
    }
  }

  /**
   * View stats
   */
  async viewStats() {
    const stats = await this.retrieval.getStats();

    this.printHeader('Storage Statistics');

    console.log(`${COLORS.bright}Total Sessions:${COLORS.reset} ${stats.totalSessions}`);
    console.log();

    console.log(`${COLORS.bright}By Status:${COLORS.reset}`);
    for (const [status, count] of Object.entries(stats.byStatus)) {
      console.log(`  ${this.colorizeStatus(status)}: ${count}`);
    }
    console.log();

    console.log(`${COLORS.bright}Top Agents:${COLORS.reset}`);
    const topAgents = Object.entries(stats.byAgent)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [agent, count] of topAgents) {
      console.log(`  ${COLORS.cyan}${agent}${COLORS.reset}: ${count}`);
    }
  }

  /**
   * View resume points
   */
  async viewResumePoints(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID required');
    }

    const resumePoints = await this.resumption.getResumePoints(sessionId);

    this.printHeader(`Resume Points: ${sessionId}`);

    if (resumePoints.length === 0) {
      console.log(`${COLORS.dim}No resume points defined${COLORS.reset}`);
      return;
    }

    for (const point of resumePoints) {
      console.log(`${COLORS.green}Step ${point.step}${COLORS.reset}`);
      console.log(`  ${COLORS.dim}${point.description}${COLORS.reset}`);
      console.log(`  Can fork: ${point.canForkFrom ? COLORS.green + 'Yes' : COLORS.red + 'No'}${COLORS.reset}`);
      console.log();
    }
  }

  /**
   * View forks
   */
  async viewForks(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID required');
    }

    const forks = await this.resumption.getForks(sessionId);

    this.printHeader(`Forks: ${sessionId}`);

    if (forks.length === 0) {
      console.log(`${COLORS.dim}No forks${COLORS.reset}`);
      return;
    }

    for (const fork of forks) {
      console.log(`${COLORS.cyan}${fork.sessionId}${COLORS.reset}`);
      console.log(`  ${COLORS.dim}Fork point: Step ${fork.forkPoint}${COLORS.reset}`);
      console.log(`  ${COLORS.dim}Status: ${this.colorizeStatus(fork.status)}${COLORS.reset}`);
      if (fork.reason) {
        console.log(`  ${COLORS.dim}Reason: ${fork.reason}${COLORS.reset}`);
      }
      console.log();
    }
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
${COLORS.bright}ORCHESTRAI Session Viewer${COLORS.reset}

${COLORS.bright}USAGE${COLORS.reset}
  orchestrai session <command> [options]

${COLORS.bright}COMMANDS${COLORS.reset}
  ${COLORS.cyan}view <session-id>${COLORS.reset}        View session details
  ${COLORS.cyan}list [limit]${COLORS.reset}              List recent sessions (default: 20)
  ${COLORS.cyan}transcript <session-id>${COLORS.reset}  View full session transcript
  ${COLORS.cyan}deliverables <session-id>${COLORS.reset} View session deliverables
  ${COLORS.cyan}find-by-file <path>${COLORS.reset}      Find session that created a file
  ${COLORS.cyan}related <session-id>${COLORS.reset}     View related sessions
  ${COLORS.cyan}resume-points <session-id>${COLORS.reset} View resume points
  ${COLORS.cyan}forks <session-id>${COLORS.reset}       View forked sessions
  ${COLORS.cyan}stats${COLORS.reset}                    View storage statistics
  ${COLORS.cyan}help${COLORS.reset}                     Show this help message

${COLORS.bright}EXAMPLES${COLORS.reset}
  orchestrai session view ses-2026-02-12-abc123
  orchestrai session list 50
  orchestrai session find-by-file /projects/client-123/article.md
  orchestrai session transcript ses-2026-02-12-abc123

${COLORS.bright}INTEGRATION${COLORS.reset}
  Sessions are automatically captured when agents are invoked via Task tool.
  Every agent execution creates a unique session ID that can be viewed later.
    `);
  }

  /**
   * Helpers
   */
  printHeader(text, color = 'bright') {
    console.log(`${COLORS[color]}═══ ${text} ═══${COLORS.reset}`);
  }

  colorizeStatus(status) {
    const colors = {
      'completed': COLORS.green,
      'in_progress': COLORS.yellow,
      'failed': COLORS.red,
      'cancelled': COLORS.dim
    };

    const color = colors[status] || COLORS.reset;
    return `${color}${status}${COLORS.reset}`;
  }

  colorizeRole(role) {
    const colors = {
      'user': COLORS.blue,
      'assistant': COLORS.green,
      'tool_use': COLORS.magenta
    };

    const color = colors[role] || COLORS.reset;
    return `${color}${role}${COLORS.reset}`;
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }
}

// Run CLI
if (require.main === module) {
  const cli = new SessionViewerCLI();
  cli.run(process.argv).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = SessionViewerCLI;
