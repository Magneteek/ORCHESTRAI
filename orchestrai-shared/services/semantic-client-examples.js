/**
 * Semantic Intelligence Client - Usage Examples
 *
 * This file demonstrates how to use the unified semantic intelligence client
 * to access both ORCHESTRAI ML Service and VAIBE-SEMANTIC.
 */

const { getSemanticClient } = require('./semantic-intelligence-client');

// ========================================
// Example 1: Complete Semantic ICP Analysis
// ========================================

async function example1_SemanticICPAnalysis() {
  console.log('\n=== Example 1: Semantic ICP Analysis ===\n');

  const semanticClient = getSemanticClient();

  // Check if services are available
  const health = await semanticClient.checkHealth();
  console.log('Services Health:', JSON.stringify(health, null, 2));

  if (!health.healthy) {
    console.error('❌ Semantic services not available!');
    return;
  }

  // Analyze a psychographic segment with semantic intelligence
  const segmentData = {
    segmentName: 'Reputation-Damaged SMB',
    painPoints: [
      'Negative Google reviews harming business reputation',
      'Unable to remove unfair reviews legally',
      'Losing customers due to bad online presence'
    ],
    motivations: [
      'Restore business reputation quickly',
      'Protect brand image',
      'Regain customer trust'
    ],
    contentSamples: [
      'Need urgent help with review management',
      'Looking for professional reputation repair'
    ]
  };

  try {
    const semanticProfile = await semanticClient.analyzeSegmentSemantics(segmentData);

    console.log('\n✅ Semantic Analysis Complete!\n');
    console.log('ML Prediction:', {
      agent: semanticProfile.mlPrediction?.agent_id,
      confidence: semanticProfile.mlPrediction?.confidence
    });
    console.log('\nEntities Found:', semanticProfile.entities.length);
    console.log('Topics Identified:', semanticProfile.topics.length);
    console.log('Dominant Intent:', semanticProfile.intentPatterns.dominant);
    console.log('Intent Distribution:', semanticProfile.intentPatterns.distribution);
    console.log('\nFull Profile:', JSON.stringify(semanticProfile, null, 2));

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// ========================================
// Example 2: Entity Extraction
// ========================================

async function example2_EntityExtraction() {
  console.log('\n=== Example 2: Entity Extraction ===\n');

  const semanticClient = getSemanticClient();

  const text = `
    QuartzIQ is a project management platform designed for construction contractors.
    Based in San Francisco, the company helps teams track budgets and timelines
    using advanced AI-powered analytics.
  `;

  try {
    const result = await semanticClient.extractEntities(text);

    console.log('✅ Entities Extracted:\n');
    result.entities.forEach(entity => {
      console.log(`  - ${entity.text} (${entity.label}) - confidence: ${entity.confidence}`);
    });

    console.log('\nSentiment:', result.sentiment);

  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
  }
}

// ========================================
// Example 3: Topic Modeling
// ========================================

async function example3_TopicModeling() {
  console.log('\n=== Example 3: Topic Modeling ===\n');

  const semanticClient = getSemanticClient();

  const documents = [
    'Fear of dental procedures causes anxiety for first-time patients',
    'High cost of dental implants is a major financial concern',
    'Want expert guidance and reassurance from experienced dentists',
    'Looking for modern, painless treatment options',
    'Need transparent pricing and payment plans'
  ];

  try {
    const result = await semanticClient.modelTopics(documents, {
      numTopics: 3,
      method: 'lsa'
    });

    console.log('✅ Topics Modeled:\n');
    result.topics.forEach(topic => {
      console.log(`  Topic ${topic.id}:`);
      console.log(`    Keywords: ${topic.keywords?.join(', ')}`);
      console.log(`    Coherence: ${topic.coherence}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Modeling failed:', error.message);
  }
}

// ========================================
// Example 4: Intent Classification
// ========================================

async function example4_IntentClassification() {
  console.log('\n=== Example 4: Intent Classification ===\n');

  const semanticClient = getSemanticClient();

  const queries = [
    'How much do dental implants cost?',
    'Buy dental implants online',
    'Best dentist for implants near me',
    'What are dental implants made of?'
  ];

  try {
    console.log('✅ Intent Classification:\n');

    for (const query of queries) {
      const result = await semanticClient.classifyIntent(query);
      console.log(`  "${query}"`);
      console.log(`    Intent: ${result.intent} (${(result.confidence * 100).toFixed(0)}%)`);
      console.log(`    Sub-intent: ${result.sub_intent || 'N/A'}`);
      console.log(`    Journey Stage: ${result.user_journey_stage || 'N/A'}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Classification failed:', error.message);
  }
}

// ========================================
// Example 5: Content Gap Detection
// ========================================

async function example5_GapDetection() {
  console.log('\n=== Example 5: Content Gap Detection ===\n');

  const semanticClient = getSemanticClient();

  const myContent = `
    Our dental practice offers dental implants with experienced dentists.
    We provide quality care and modern facilities.
  `;

  const competitorContent = `
    Comprehensive Dental Implant Guide:
    - FDA-approved titanium materials
    - 98% success rates over 10 years
    - Step-by-step procedure explanation
    - Detailed recovery timeline (7-14 days)
    - Insurance coverage information
    - Pain management protocols
    - Before and after photos
  `;

  try {
    const result = await semanticClient.detectGaps(myContent, competitorContent);

    console.log('✅ Gaps Detected:\n');
    console.log('Topic Gaps:', result.topic_gaps);
    console.log('\nEntity Gaps:', result.entity_gaps);
    console.log('\nDepth Analysis:', result.depth_gaps);
    console.log('\nRecommendations:');
    result.recommendations?.forEach(rec => {
      console.log(`  - ${rec}`);
    });

  } catch (error) {
    console.error('❌ Gap detection failed:', error.message);
  }
}

// ========================================
// Example 6: ML Agent Selection
// ========================================

async function example6_AgentSelection() {
  console.log('\n=== Example 6: ML Agent Selection ===\n');

  const semanticClient = getSemanticClient();

  const taskContext = {
    task: 'Create comprehensive psychographic analysis for B2B SaaS client',
    domain: 'client-intelligence',
    complexity: 'high',
    required_capabilities: [
      'semantic-analysis',
      'psychographic-profiling',
      'b2b-expertise'
    ]
  };

  try {
    const result = await semanticClient.selectAgent(taskContext);

    if (result) {
      console.log('✅ Agent Selected by ML:\n');
      console.log(`  Agent: ${result.agent_id}`);
      console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`);
      console.log(`  Predicted Performance: ${(result.predicted_performance * 100).toFixed(0)}%`);
      console.log(`  Estimated Duration: ${result.estimated_duration_ms}ms`);
      console.log('\n  Reasoning:');
      result.reasoning?.forEach(reason => {
        console.log(`    - ${reason}`);
      });
      console.log('\n  Alternatives:');
      result.alternatives?.forEach(alt => {
        console.log(`    - ${alt.agent_id} (${(alt.confidence * 100).toFixed(0)}%)`);
      });
    } else {
      console.log('⚠️  ML Service not available, using fallback logic');
    }

  } catch (error) {
    console.error('❌ Agent selection failed:', error.message);
  }
}

// ========================================
// Example 7: Enhanced Keyword Research
// ========================================

async function example7_KeywordResearch() {
  console.log('\n=== Example 7: Enhanced Keyword Research ===\n');

  const semanticClient = getSemanticClient();

  const keywords = [
    'dental implants cost',
    'how much are dental implants',
    'dental implant procedure',
    'dental implant recovery',
    'dental implant success rate',
    'dental implant alternatives',
    'dental implant insurance',
    'dental implant pain'
  ];

  try {
    const result = await semanticClient.enhanceKeywordResearch(keywords);

    console.log('✅ Keyword Research Enhanced:\n');
    console.log('Semantic Clusters:');
    result.semanticClusters?.forEach(cluster => {
      console.log(`  - ${cluster.keywords?.slice(0, 3).join(', ')}`);
    });
    console.log('\nIntent Distribution:', result.intentDistribution);
    console.log('\nRecommendations:');
    result.recommendations?.forEach(rec => {
      console.log(`  [${rec.priority.toUpperCase()}] ${rec.type}: ${rec.message}`);
    });

  } catch (error) {
    console.error('❌ Keyword research failed:', error.message);
  }
}

// ========================================
// Run All Examples
// ========================================

async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Semantic Intelligence Client - Usage Examples         ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    // Run examples sequentially
    await example1_SemanticICPAnalysis();
    await example2_EntityExtraction();
    await example3_TopicModeling();
    await example4_IntentClassification();
    await example5_GapDetection();
    await example6_AgentSelection();
    await example7_KeywordResearch();

    console.log('\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('\n❌ Examples failed:', error);
  }
}

// Export for use in other modules
module.exports = {
  example1_SemanticICPAnalysis,
  example2_EntityExtraction,
  example3_TopicModeling,
  example4_IntentClassification,
  example5_GapDetection,
  example6_AgentSelection,
  example7_KeywordResearch,
  runAllExamples
};

// Run if executed directly
if (require.main === module) {
  runAllExamples()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
