/**
 * Integration Example
 * How to integrate Session Manager with orchestrai-master-coordinator
 */

const SessionManager = require('../index');

// Initialize session manager
const sessionManager = new SessionManager({
  storage: {
    basePath: '/Users/kris/CLAUDEtools/ORCHESTRAI/sessions'
  }
});

/**
 * Example 1: Basic Session Capture
 */
async function example1_BasicCapture() {
  console.log('\n=== Example 1: Basic Session Capture ===\n');

  // Start session
  const session = await sessionManager.startSession({
    agentType: 'content-writer-specialist',
    prompt: 'Write comprehensive article about dental implants...',
    projectContext: {
      clientId: 'client-123',
      projectId: 'proj-456'
    },
    tags: ['content', 'healthcare', 'article']
  });

  console.log(`Session started: ${session.sessionId}`);

  // Simulate agent work...
  // In real usage, this is where Task tool would be invoked

  // Record tool calls
  await sessionManager.recordToolCall(session.sessionId, {
    tool: 'Read',
    parameters: { file_path: '/outline.md' },
    duration: 150
  });

  await sessionManager.recordToolCall(session.sessionId, {
    tool: 'Write',
    parameters: { file_path: '/article.md' },
    duration: 800
  });

  // Link deliverable
  await sessionManager.linkDeliverable(session.sessionId, {
    path: '/projects/client-123/deliverables/content/article.md',
    type: 'content',
    size: 15420
  });

  // End session
  const completedSession = await sessionManager.endSession(session.sessionId, {
    status: 'completed',
    totalTokens: 45000,
    inputTokens: 12000,
    outputTokens: 33000
  });

  console.log(`Session completed: ${completedSession.sessionId}`);
  console.log(`Duration: ${completedSession.duration}ms`);
  console.log(`Cost: $${completedSession.metrics.cost}`);
}

/**
 * Example 2: Wrap Task Tool Invocation
 */
async function example2_TaskToolWrapper() {
  console.log('\n=== Example 2: Task Tool Wrapper ===\n');

  // Simulate Task tool function
  const mockTaskTool = async (params) => {
    // In real usage, this would be the actual Claude Code Task tool
    console.log(`Executing agent: ${params.subagent_type}`);

    return {
      success: true,
      outputs: [
        { path: '/article.md', type: 'file' }
      ],
      deliverables: ['/projects/client-123/deliverables/content/article.md'],
      totalTokens: 45000,
      inputTokens: 12000,
      outputTokens: 33000
    };
  };

  // Use wrapper to capture session automatically
  const result = await sessionManager.wrapper.invokeTask(
    mockTaskTool,
    {
      subagent_type: 'content-writer-specialist',
      description: 'Article creation',
      prompt: 'Write article about dental implants...',
      model: 'sonnet'
    },
    {
      projectContext: {
        clientId: 'client-123',
        projectId: 'proj-456'
      },
      tags: ['content', 'healthcare']
    }
  );

  console.log(`Result with session ID: ${result.sessionId}`);
}

/**
 * Example 3: Session Retrieval
 */
async function example3_Retrieval() {
  console.log('\n=== Example 3: Session Retrieval ===\n');

  // Get recent sessions
  const recent = await sessionManager.search({ limit: 5 });
  console.log(`Found ${recent.length} recent sessions`);

  if (recent.length > 0) {
    const sessionId = recent[0].sessionId;

    // Get full session
    const session = await sessionManager.getSession(sessionId);
    console.log(`\nSession: ${session.sessionId}`);
    console.log(`Agent: ${session.agent.type}`);
    console.log(`Status: ${session.status}`);

    // Get transcript
    const transcript = await sessionManager.getTranscript(sessionId);
    console.log(`Transcript entries: ${transcript.length}`);

    // Get related sessions
    const related = await sessionManager.retrieval.getRelated(sessionId);
    console.log(`Related sessions: ${related.length}`);
  }
}

/**
 * Example 4: Resume & Fork
 */
async function example4_ResumeAndFork() {
  console.log('\n=== Example 4: Resume & Fork ===\n');

  // Get recent completed session
  const recent = await sessionManager.search({
    status: 'completed',
    limit: 1
  });

  if (recent.length === 0) {
    console.log('No completed sessions to resume from');
    return;
  }

  const sessionId = recent[0].sessionId;

  // Resume session
  const resumeContext = await sessionManager.resumeSession(sessionId, {
    resumePoint: 10,
    prompt: 'Continue but focus more on recovery process...'
  });

  console.log(`Resume context created for: ${sessionId}`);
  console.log(`Prior transcript length: ${resumeContext.priorTranscript.length}`);

  // Fork session
  const forkContext = await sessionManager.forkSession(sessionId, {
    forkPoint: 10,
    prompt: 'Try a different approach focusing on cost...',
    reason: 'Exploring cost-focused alternative'
  });

  console.log(`\nFork created: ${forkContext.sessionId}`);
  console.log(`Forked from: ${forkContext.forkedFrom}`);
  console.log(`Fork point: ${forkContext.forkPoint}`);
}

/**
 * Example 5: Search & Analytics
 */
async function example5_SearchAndAnalytics() {
  console.log('\n=== Example 5: Search & Analytics ===\n');

  // Search by agent type
  const contentSessions = await sessionManager.search({
    agentType: 'content-writer-specialist',
    limit: 10
  });

  console.log(`Content sessions: ${contentSessions.length}`);

  // Search by project
  const projectSessions = await sessionManager.search({
    projectId: 'proj-456',
    limit: 10
  });

  console.log(`Project sessions: ${projectSessions.length}`);

  // Get stats
  const stats = await sessionManager.getStats();
  console.log(`\nTotal sessions: ${stats.totalSessions}`);
  console.log('By status:', stats.byStatus);
  console.log('By agent:', Object.keys(stats.byAgent).length, 'different agents');

  // Get agent performance
  const performance = await sessionManager.retrieval.getAgentPerformance(
    'content-writer-specialist'
  );

  console.log(`\nAgent performance (content-writer-specialist):`);
  console.log(`Success rate: ${performance.successRate.toFixed(1)}%`);
  console.log(`Average duration: ${(performance.averageDuration / 1000).toFixed(1)}s`);
  console.log(`Average cost: $${performance.averageCost.toFixed(4)}`);
}

/**
 * Example 6: Find Session by Deliverable
 */
async function example6_FindByDeliverable() {
  console.log('\n=== Example 6: Find Session by Deliverable ===\n');

  const deliverablePath = '/projects/client-123/deliverables/content/article.md';

  const session = await sessionManager.findByDeliverable(deliverablePath);

  if (session) {
    console.log(`Found session: ${session.sessionId}`);
    console.log(`Agent: ${session.agent.type}`);
    console.log(`Created: ${session.timestamp}`);
  } else {
    console.log(`No session found for: ${deliverablePath}`);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    await example1_BasicCapture();
    await example2_TaskToolWrapper();
    await example3_Retrieval();
    await example4_ResumeAndFork();
    await example5_SearchAndAnalytics();
    await example6_FindByDeliverable();

    console.log('\n=== All examples completed ===\n');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export examples for individual testing
module.exports = {
  example1_BasicCapture,
  example2_TaskToolWrapper,
  example3_Retrieval,
  example4_ResumeAndFork,
  example5_SearchAndAnalytics,
  example6_FindByDeliverable,
  runAllExamples
};

// Run if called directly
if (require.main === module) {
  runAllExamples();
}
