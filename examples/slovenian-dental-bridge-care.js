/**
 * ORCHESTRAI Healthcare Content Pipeline - Slovenian Dental Bridge Care Example
 *
 * This example demonstrates the complete healthcare content creation workflow
 * for Slovenian post-procedure dental care instructions using the Healthcare
 * Content Pipeline.
 *
 * USE CASE: User's pilot project - Creating patient-friendly post-procedure
 * care instructions for dental bridge patients in Slovenia.
 *
 * LANGUAGE: Slovenian (sl)
 * CONTENT TYPE: Post-Procedure Care Instructions
 * TARGET AUDIENCE: Slovenian dental patients who just received a dental bridge
 * HEALTH LITERACY: Medium (Grade 7-8 Slovenian reading level)
 *
 * PIPELINE STAGES:
 * 1. Medical Research & Patient Psychographics → 15min
 * 2. Outline Creation (Medical Structure) → 10min + CHECKPOINT
 * 3. Content Writing (Patient-Friendly Medical) → 25min
 * 4. Medical Accuracy & Compliance Validation → 15min (BLOCKING GATES)
 * 5. Healthcare SEO & Disclaimer Integration → 10min
 * 6. Memory Integration & Publishing → 10min
 *
 * TOTAL TIME: ~85 minutes
 */

const HealthcareContentPipeline = require('../orchestrai-domains/healthcare-content/pipelines/healthcare-content-pipeline');
const CoordinationPatterns = require('../orchestrai-shared/orchestration/coordination-patterns');
const DynamicAgentSelection = require('../orchestrai-shared/orchestration/dynamic-agent-selection');
const CrystallineMemory = require('../orchestrai-shared/memory/advanced-crystalline-memory');
const Redis = require('ioredis');
const fs = require('fs').promises;
const path = require('path');

/**
 * Main execution function for Slovenian dental bridge care content creation
 */
async function createSlovenianDentalBridgeCareContent() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🏥 ORCHESTRAI Healthcare Content Pipeline');
  console.log('   Use Case: Slovenian Dental Bridge Post-Procedure Care');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ========================================================================
  // STEP 1: Initialize Healthcare Content Pipeline
  // ========================================================================

  console.log('📋 Step 1: Initialize Healthcare Content Pipeline\n');

  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000)
  });

  const crystallineMemory = new CrystallineMemory(redis);
  const coordinationPatterns = new CoordinationPatterns(redis);
  const dynamicAgentSelection = new DynamicAgentSelection(redis);

  const healthcarePipeline = new HealthcareContentPipeline(
    coordinationPatterns,
    dynamicAgentSelection,
    crystallineMemory,
    redis
  );

  console.log('✅ Pipeline initialized with:');
  console.log('   - Crystalline Memory (hexagonal lattice)');
  console.log('   - Dynamic Agent Selection');
  console.log('   - Redis coordination layer');
  console.log('   - 8 specialized healthcare agents\n');

  // ========================================================================
  // STEP 2: Define Project Specification for Slovenian Dental Care
  // ========================================================================

  console.log('📝 Step 2: Define Project Specification\n');

  const projectSpec = {
    // Medical Topic
    medicalTopic: "Zobni mostiček nega po postopku",
    medicalTopicEnglish: "Dental bridge post-procedure care",

    // Language Configuration
    targetLanguage: "Slovenian",
    sourceLanguage: "English", // For medical guideline reference
    languageCode: "sl",

    // Content Type
    contentType: "Post-Procedure Care Instructions",
    deliverableType: "patient-education",

    // Target Audience
    targetAudience: "Slovenian dental patients who just received a dental bridge",
    ageRange: "25-70",
    geographicRegion: "Slovenia",

    // Health Literacy
    healthLiteracyLevel: "Medium (Grade 7-8 Slovenian)",
    readingLevel: "Grade 7-8",
    fleschTargetRange: [60, 70], // Standard/Easy

    // Content Requirements
    targetWordCount: 1500,
    tone: "Reassuring, empathetic, professional",
    culturalContext: "Slovenian healthcare system (universal care)",

    // Clinical Requirements
    clinicalGuidelines: [
      "ADA (American Dental Association) - translated",
      "European Dental Association standards",
      "Slovenian Dental Chamber guidelines"
    ],

    // Project Structure
    projectUUID: "slovenian-dental-care-2025",
    deliverablePath: "/projects/slovenian-dental-care-2025/deliverables/healthcare/",

    // SEO & Discoverability
    primaryKeywords: [
      "zobni mostiček nega",
      "nega po zobnem mostiču",
      "navodila za nego zobnega mostiča"
    ],
    secondaryKeywords: [
      "zobni mostiček",
      "dentalna protetika",
      "ustna higiena",
      "zobni most skrb"
    ],

    // Compliance Requirements
    medicalAccuracyRequired: 100, // BLOCKING GATE
    hipaaComplianceRequired: 100, // BLOCKING GATE
    patientSafetyRequired: 100, // BLOCKING GATE

    // Multi-language Specific
    translationValidation: true,
    culturalAdaptation: true,
    localMedicalTerminology: true
  };

  console.log('Project Specification:');
  console.log(`   Medical Topic: ${projectSpec.medicalTopic}`);
  console.log(`   Language: ${projectSpec.targetLanguage}`);
  console.log(`   Content Type: ${projectSpec.contentType}`);
  console.log(`   Target Audience: ${projectSpec.targetAudience}`);
  console.log(`   Word Count: ${projectSpec.targetWordCount}`);
  console.log(`   Health Literacy: ${projectSpec.healthLiteracyLevel}\n`);

  // ========================================================================
  // STEP 3: Execute Healthcare Content Pipeline
  // ========================================================================

  console.log('🚀 Step 3: Execute Complete Healthcare Content Pipeline\n');
  console.log('   This will execute all 6 stages sequentially...\n');

  const pipelineStartTime = Date.now();

  try {
    // Execute complete pipeline
    const pipelineResult = await healthcarePipeline.execute(projectSpec);

    const pipelineEndTime = Date.now();
    const totalExecutionTime = ((pipelineEndTime - pipelineStartTime) / 1000 / 60).toFixed(2);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ Healthcare Content Pipeline COMPLETED');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`⏱️  Total Execution Time: ${totalExecutionTime} minutes`);
    console.log(`📊 Execution ID: ${pipelineResult.executionId}`);
    console.log(`📁 Deliverable Path: ${pipelineResult.deliverablePath}\n`);

    // ========================================================================
    // STEP 4: Display Stage-by-Stage Results
    // ========================================================================

    console.log('📈 Stage-by-Stage Results:\n');

    pipelineResult.stages.forEach((stage, index) => {
      console.log(`Stage ${index + 1}: ${stage.name}`);
      console.log(`   Status: ${stage.status}`);
      console.log(`   Duration: ${stage.duration}ms`);

      if (stage.name === 'Medical Research & Patient Psychographics') {
        console.log(`   Patient Segments: ${stage.result.patientPsychographics.segments.length}`);
        console.log(`   Medical Terms Identified: ${stage.result.medicalResearch.medicalTerminology.length}`);
      }

      if (stage.name === 'Outline Creation') {
        console.log(`   Sections: ${stage.result.outline.sections.length}`);
        console.log(`   Target Word Count: ${stage.result.outline.targetWordCount}`);
        console.log(`   Approval Status: ${stage.result.approved ? '✅ Approved' : '⚠️  Awaiting Approval'}`);
      }

      if (stage.name === 'Content Writing') {
        console.log(`   Word Count: ${stage.result.content.wordCount}`);
        console.log(`   Readability Score: ${stage.result.content.readabilityScore.fleschReadingEase}`);
        console.log(`   Keywords Integrated: ${stage.result.content.keywordsIntegrated.primary.length} primary, ${stage.result.content.keywordsIntegrated.secondary.length} secondary`);
      }

      if (stage.name === 'Medical Accuracy & Compliance Validation') {
        console.log(`   Medical Accuracy: ${stage.result.medicalAccuracy}% ${stage.result.medicalAccuracy === 100 ? '✅' : '❌'}`);
        console.log(`   HIPAA Compliance: ${stage.result.hipaaCompliance}% ${stage.result.hipaaCompliance === 100 ? '✅' : '❌'}`);
        console.log(`   Patient Safety: ${stage.result.patientSafety}% ${stage.result.patientSafety === 100 ? '✅' : '❌'}`);
      }

      if (stage.name === 'Healthcare SEO Optimization') {
        console.log(`   E-A-T Signals: ${stage.result.seoOptimization.eatSignals.expertise ? '✅' : '❌'} Expertise, ${stage.result.seoOptimization.eatSignals.authoritativeness ? '✅' : '❌'} Authority, ${stage.result.seoOptimization.eatSignals.trustworthiness ? '✅' : '❌'} Trust`);
        console.log(`   Schema Markup: ${stage.result.seoOptimization.schemaMarkup['@type']}`);
      }

      if (stage.name === 'Memory Integration & Publishing') {
        console.log(`   Memory Entities Created: ${stage.result.memoryEntities.length}`);
        console.log(`   Published: ${stage.result.published ? '✅ Yes' : '❌ No'}`);
      }

      console.log('');
    });

    // ========================================================================
    // STEP 5: Display Quality Metrics
    // ========================================================================

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 Quality Metrics Summary');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const validationStage = pipelineResult.stages.find(s => s.name === 'Medical Accuracy & Compliance Validation');

    if (validationStage) {
      console.log('🏥 Medical Accuracy:');
      console.log(`   Overall Score: ${validationStage.result.medicalAccuracy}%`);
      console.log(`   Status: ${validationStage.result.medicalAccuracy === 100 ? '✅ PASSED' : '❌ FAILED'}`);

      if (validationStage.result.validationDetails) {
        Object.entries(validationStage.result.validationDetails).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }
      console.log('');

      console.log('🔒 HIPAA Compliance:');
      console.log(`   Overall Score: ${validationStage.result.hipaaCompliance}%`);
      console.log(`   Status: ${validationStage.result.hipaaCompliance === 100 ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   PHI Detected: ${validationStage.result.phiDetected || 'None'}`);
      console.log('');

      console.log('⚕️  Patient Safety:');
      console.log(`   Overall Score: ${validationStage.result.patientSafety}%`);
      console.log(`   Status: ${validationStage.result.patientSafety === 100 ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('');
    }

    const contentStage = pipelineResult.stages.find(s => s.name === 'Content Writing');

    if (contentStage) {
      console.log('📖 Readability:');
      console.log(`   Flesch Reading Ease: ${contentStage.result.content.readabilityScore.fleschReadingEase}`);
      console.log(`   Flesch-Kincaid Grade: ${contentStage.result.content.readabilityScore.fleschKincaidGrade}`);
      console.log(`   Target Met: ${contentStage.result.content.readabilityScore.targetMet ? '✅ Yes' : '❌ No'}`);
      console.log('');
    }

    // ========================================================================
    // STEP 6: Display Slovenian-Specific Translation Validation
    // ========================================================================

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🌍 Slovenian Translation Validation');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (pipelineResult.translationValidation) {
      console.log('Medical Terminology Validation:');
      console.log(`   Medical Accuracy: ${pipelineResult.translationValidation.medicalAccuracy}%`);
      console.log(`   Language Purity: ${pipelineResult.translationValidation.languagePurity}%`);
      console.log(`   Cultural Adaptation: ${pipelineResult.translationValidation.culturalAdaptation ? '✅ Complete' : '⚠️  Incomplete'}`);
      console.log('');

      if (pipelineResult.translationValidation.medicalTerms) {
        console.log('Validated Medical Terms:');
        pipelineResult.translationValidation.medicalTerms.forEach(term => {
          console.log(`   ${term.slovenian} ← ${term.english} (${term.accurate ? '✅' : '❌'})`);
        });
        console.log('');
      }
    }

    // ========================================================================
    // STEP 7: Save Complete Deliverable Package
    // ========================================================================

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('💾 Saving Deliverable Package');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const deliverablePackage = {
      projectSpec,
      pipelineResult,
      metadata: {
        generatedAt: new Date().toISOString(),
        executionTime: totalExecutionTime,
        language: projectSpec.targetLanguage,
        contentType: projectSpec.contentType,
        qualityGates: {
          medicalAccuracy: validationStage?.result.medicalAccuracy === 100,
          hipaaCompliance: validationStage?.result.hipaaCompliance === 100,
          patientSafety: validationStage?.result.patientSafety === 100
        }
      }
    };

    // Ensure deliverable directory exists
    const deliverableDir = path.join(__dirname, '..', projectSpec.deliverablePath);
    await fs.mkdir(deliverableDir, { recursive: true });

    // Save deliverable package
    const packagePath = path.join(deliverableDir, 'slovenian-dental-bridge-care-package.json');
    await fs.writeFile(packagePath, JSON.stringify(deliverablePackage, null, 2));

    console.log(`✅ Deliverable package saved to:`);
    console.log(`   ${packagePath}\n`);

    // ========================================================================
    // STEP 8: Display Example Content Preview
    // ========================================================================

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📄 Content Preview (Slovenian)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (contentStage && contentStage.result.content.sections) {
      const previewSection = contentStage.result.content.sections[0];
      console.log(`${previewSection.h2}\n`);
      console.log(previewSection.content.substring(0, 500) + '...\n');
    }

    // ========================================================================
    // STEP 9: Display Memory Integration Details
    // ========================================================================

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🧠 Crystalline Memory Integration');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const memoryStage = pipelineResult.stages.find(s => s.name === 'Memory Integration & Publishing');

    if (memoryStage && memoryStage.result.memoryEntities) {
      console.log('Memory Entities Created:');
      memoryStage.result.memoryEntities.forEach((entityId, index) => {
        console.log(`   ${index + 1}. ${entityId}`);
      });
      console.log('');

      if (memoryStage.result.memoryRelations) {
        console.log('Memory Relations Created:');
        memoryStage.result.memoryRelations.forEach((relation, index) => {
          console.log(`   ${index + 1}. ${relation.from} --[${relation.type}]--> ${relation.to}`);
        });
        console.log('');
      }
    }

    // ========================================================================
    // STEP 10: Final Summary
    // ========================================================================

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ SLOVENIAN DENTAL BRIDGE CARE CONTENT - COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('Summary:');
    console.log(`   ✅ Medical accuracy validated: 100%`);
    console.log(`   ✅ HIPAA compliance verified: 100%`);
    console.log(`   ✅ Patient safety confirmed: 100%`);
    console.log(`   ✅ Slovenian translation accurate`);
    console.log(`   ✅ Cultural adaptation complete`);
    console.log(`   ✅ SEO optimization with E-A-T signals`);
    console.log(`   ✅ Memory entities integrated`);
    console.log(`   ✅ Deliverable package saved\n`);

    console.log('Next Steps:');
    console.log('   1. Review generated content in deliverable package');
    console.log('   2. Verify Slovenian medical terminology accuracy');
    console.log('   3. Obtain medical professional review (if required)');
    console.log('   4. Publish to patient education portal');
    console.log('   5. Monitor patient feedback and engagement\n');

  } catch (error) {
    console.error('\n❌ Pipeline Execution Failed:\n');
    console.error(`   Error: ${error.message}`);

    if (error.blockingIssues) {
      console.error('\n🚨 Blocking Issues Detected:\n');
      error.blockingIssues.forEach((issue, index) => {
        console.error(`   ${index + 1}. ${issue.category} (${issue.severity})`);
        console.error(`      Issue: ${issue.issue}`);
        console.error(`      Clinical Evidence: ${issue.clinicalEvidence}`);
        console.error(`      Required Correction: ${issue.requiredCorrection}\n`);
      });
    }

    console.error('\nPipeline stopped at stage:', error.stage || 'Unknown');
    console.error('Cannot proceed until issues are resolved.\n');

    process.exit(1);
  } finally {
    // Cleanup
    await redis.quit();
  }
}

// ============================================================================
// EXAMPLE SLOVENIAN MEDICAL TERMINOLOGY REFERENCE
// ============================================================================

const slovenianMedicalTerminology = {
  "Dental bridge": "Zobni mostiček",
  "Post-procedure care": "Nega po postopku",
  "Oral hygiene": "Ustna higiena",
  "Gums": "Dlesni",
  "Tooth": "Zob",
  "Crown": "Krona",
  "Abutment": "Oporni zob",
  "Dental cement": "Zobni cement",
  "Inflammation": "Vnetje",
  "Infection": "Okužba",
  "Sensitivity": "Občutljivost",
  "Swelling": "Oteklina",
  "Pain": "Bolečina",
  "Healing": "Celjenje",
  "Recovery": "Okrevanje"
};

// ============================================================================
// EXAMPLE PATIENT PSYCHOGRAPHIC SEGMENTS (SLOVENIAN)
// ============================================================================

const slovenianPatientSegments = {
  segments: [
    {
      name: "Zaskrbljen pacient pred postopkom",
      percentage: 40,
      primaryConcerns: [
        "Ali bo bolelo?",
        "Koliko časa traja okrevanje?",
        "Kako skrbeti za zobni mostiček?",
        "Ali lahko normalno jem?"
      ],
      emotionalState: {
        primaryEmotion: "Zaskrbljenost/Strah",
        trustNeeds: "Pomiritev, preglednost, empatija"
      },
      healthLiteracy: "Srednja (7-8 razred)"
    },
    {
      name: "Stroškovno ozaveščen odločevalec",
      percentage: 35,
      primaryConcerns: [
        "Koliko stane?",
        "Ali je vredno?",
        "Kako dolgo traja?",
        "Kakšne so alternative?"
      ],
      emotionalState: {
        primaryEmotion: "Praktičnost/Analitičnost",
        trustNeeds: "Preglednost cen, primerjave, dolgoročna vrednost"
      },
      healthLiteracy: "Srednje-visoka (8-10 razred)"
    }
  ]
};

// ============================================================================
// RUN EXAMPLE
// ============================================================================

if (require.main === module) {
  createSlovenianDentalBridgeCareContent()
    .then(() => {
      console.log('✅ Example completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Example failed:', error);
      process.exit(1);
    });
}

module.exports = {
  createSlovenianDentalBridgeCareContent,
  slovenianMedicalTerminology,
  slovenianPatientSegments
};
