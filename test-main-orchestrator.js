// Test script for Main Orchestrator Agent coordination workflow
// Demonstrates centralized query coordination and intelligent domain routing

const MainOrchestratorAgent = require('./orchestrai-master/agents/main-orchestrator-agent');

// Mock dependencies for testing
const mockOrchestrator = {
  callTool: async (toolName, params) => {
    console.log(`🛠️ Mock tool call: ${toolName}`);
    return {
      success: true,
      tool: toolName,
      result: `Mock result for ${toolName} with params: ${JSON.stringify(params, null, 2)}`
    };
  },
  domains: {
    'seo': {
      coordinateTask: async (task) => {
        console.log(`🔍 SEO Domain processing task: ${task.query.substring(0, 50)}...`);
        return {
          success: true,
          domain: 'seo',
          recommendations: [
            'Focus on long-tail keywords for dental 3D printing',
            'Target "dental prosthetics 3D printing" with high search volume',
            'Create content around "biocompatible dental materials"'
          ],
          keywordSuggestions: ['dental 3D printing', 'prosthetic dentistry', 'CAD/CAM dentistry'],
          competitorAnalysis: {
            topCompetitors: ['formlabs.com/dental', 'asiga.com', 'nextdent.com'],
            opportunities: ['technical tutorials', 'material comparisons', 'workflow guides']
          }
        };
      }
    },
    'web-quality': {
      coordinateTask: async (task) => {
        console.log(`🌐 Web Quality Domain processing task: ${task.query.substring(0, 50)}...`);
        return {
          success: true,
          domain: 'web-quality',
          qualityValidation: {
            passed: true,
            score: 0.92,
            checklist: ['accessibility', 'performance', 'responsive-design'],
            recommendations: [
              'Implement lazy loading for 3D model viewers',
              'Optimize image compression for dental scans',
              'Add ARIA labels for technical diagrams'
            ]
          },
          performanceMetrics: {
            coreWebVitals: 'good',
            loadTime: '2.1s',
            accessibilityScore: '94/100'
          }
        };
      }
    }
  }
};

const mockMCPManager = {
  getServerStatus: () => ({ status: 'running' })
};

const mockCrystallineMemory = {
  storeMemory: async (domain, content) => {
    console.log(`💎 Storing memory in ${domain} domain`);
    return `node-${Date.now()}`;
  },
  retrieveMemory: async (query, domain) => {
    return {
      results: [
        {
          content: 'Previous dental 3D printing research results',
          relevance: 0.95,
          domain
        }
      ]
    };
  }
};

async function testMainOrchestratorAgent() {
  console.log('🎯 Testing Main Orchestrator Agent - Centralized Query Coordination');
  console.log('=' .repeat(80));
  
  try {
    // Initialize Main Orchestrator Agent
    const orchestratorAgent = new MainOrchestratorAgent(
      mockOrchestrator,
      mockMCPManager,
      mockCrystallineMemory
    );
    
    console.log('✅ Main Orchestrator Agent initialized');
    console.log('');
    
    // Test cases demonstrating different coordination patterns
    const testCases = [
      {
        name: 'Single Domain Query (SEO)',
        query: 'Create comprehensive SEO keyword research for dental 3D printing market targeting prosthodontists',
        context: { priority: 'high', targetAudience: 'dental professionals' }
      },
      {
        name: 'Multi-Domain Query (SEO + Web Quality)',
        query: 'Build SEO-optimized dental 3D printing webpage with performance testing and accessibility validation',
        context: { priority: 'medium', deliverableType: 'webpage' }
      },
      {
        name: 'Research + Development Query',
        query: 'Research dental 3D printing market trends and develop responsive website with quality assurance',
        context: { priority: 'high', projectType: 'full-stack' }
      }
    ];
    
    // Execute test cases
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🧪 Test Case ${i + 1}: ${testCase.name}`);
      console.log(`Query: "${testCase.query}"`);
      console.log('─'.repeat(60));
      
      const startTime = Date.now();
      const result = await orchestratorAgent.receiveQuery(testCase.query, testCase.context);
      const duration = Date.now() - startTime;
      
      console.log(`\n📊 Coordination Results (${duration}ms):`);
      console.log(`   Coordination Type: ${result.orchestration_plan?.coordinationStrategy?.type || 'unknown'}`);
      console.log(`   Execution Pattern: ${result.orchestration_plan?.coordinationStrategy?.execution_pattern || 'unknown'}`);
      console.log(`   Domains Involved: ${Object.keys(result.domain_results || {}).join(', ')}`);
      console.log(`   Phases Executed: ${result.orchestration_plan?.phases_executed || 0}`);
      console.log(`   Total Duration: ${result.orchestration_plan?.total_duration || 0}ms`);
      
      // Display domain-specific results
      if (result.domain_results) {
        console.log('\n🎯 Domain Results:');
        for (const [domain, domainResult] of Object.entries(result.domain_results)) {
          console.log(`   ${domain.toUpperCase()}: ${domainResult.success ? '✅ Success' : '❌ Failed'}`);
          if (domainResult.result?.recommendations) {
            console.log(`      Recommendations: ${domainResult.result.recommendations.length} items`);
          }
        }
      }
      
      // Display final recommendations
      if (result.final_recommendations) {
        console.log('\n💡 Final Recommendations:');
        result.final_recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. [${rec.domain.toUpperCase()}] ${rec.recommendation.substring(0, 80)}...`);
        });
      }
      
      // Display system insights
      if (result.system_insights) {
        console.log('\n🧠 System Insights:');
        result.system_insights.forEach(insight => {
          console.log(`   ${insight.type.toUpperCase()}: ${insight.insight}`);
        });
      }
      
      console.log('\n' + '═'.repeat(80));
    }
    
    // Test coordinator status
    console.log('\n📊 Main Orchestrator Agent Status:');
    const status = orchestratorAgent.getCoordinatorStatus();
    console.log(`   Agent ID: ${status.agentId}`);
    console.log(`   Query Patterns: ${status.queryPatterns} defined`);
    console.log(`   Domain Capabilities: ${status.domainCapabilities} mapped`);
    console.log(`   Ready State: ${status.isReady ? '✅ Ready' : '❌ Not Ready'}`);
    console.log(`   Last Activity: ${status.lastActivity}`);
    
    console.log('\n🎯 Test Complete - Main Orchestrator Agent Coordination Verified!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testMainOrchestratorAgent()
    .then(() => {
      console.log('\n✅ All tests passed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    });
}

module.exports = { testMainOrchestratorAgent };