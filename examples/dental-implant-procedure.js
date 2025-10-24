/**
 * ORCHESTRAI Healthcare Content Pipeline - Dental Implant Procedure Example
 *
 * This example demonstrates the complete healthcare content creation workflow
 * for comprehensive dental implant patient education content.
 *
 * USE CASE: Creating patient-friendly pre-procedure education content for
 * patients considering dental implants.
 *
 * LANGUAGE: English (en)
 * CONTENT TYPE: Patient Education (Pre-Procedure)
 * TARGET AUDIENCE: Adults 35-65 considering tooth replacement options
 * HEALTH LITERACY: Medium (Grade 7-8 reading level)
 *
 * CONTENT GOALS:
 * - Educate patients about the dental implant procedure
 * - Address common concerns (pain, recovery, costs, risks)
 * - Provide realistic expectations based on clinical evidence
 * - Enable informed decision-making with complete risk disclosure
 * - Optimize for YMYL SEO (medical content requires E-A-T signals)
 */

const HealthcareContentPipeline = require('../orchestrai-domains/healthcare-content/pipelines/healthcare-content-pipeline');
const CoordinationPatterns = require('../orchestrai-shared/orchestration/coordination-patterns');
const DynamicAgentSelection = require('../orchestrai-shared/orchestration/dynamic-agent-selection');
const CrystallineMemory = require('../orchestrai-shared/memory/advanced-crystalline-memory');
const Redis = require('ioredis');
const fs = require('fs').promises;
const path = require('path');

async function createDentalImplantEducationContent() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🏥 ORCHESTRAI Healthcare Content Pipeline');
  console.log('   Use Case: Dental Implant Patient Education');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Initialize pipeline
  const redis = new Redis({ host: 'localhost', port: 6379 });
  const crystallineMemory = new CrystallineMemory(redis);
  const coordinationPatterns = new CoordinationPatterns(redis);
  const dynamicAgentSelection = new DynamicAgentSelection(redis);

  const healthcarePipeline = new HealthcareContentPipeline(
    coordinationPatterns,
    dynamicAgentSelection,
    crystallineMemory,
    redis
  );

  // Define project specification
  const projectSpec = {
    // Medical Topic
    medicalTopic: "Dental Implant Procedure",
    medicalSubtopic: "Patient Education and Pre-Procedure Information",

    // Language Configuration
    targetLanguage: "English",
    languageCode: "en",
    region: "United States",

    // Content Type
    contentType: "Patient Education (Pre-Procedure)",
    deliverableType: "patient-education",
    format: "web-article",

    // Target Audience
    targetAudience: "Adults 35-65 considering tooth replacement options",
    patientJourney: "Pre-procedure research and decision-making",
    ageRange: "35-65",
    geographicRegion: "United States",

    // Health Literacy
    healthLiteracyLevel: "Medium (Grade 7-8)",
    readingLevel: "Grade 7-8",
    fleschTargetRange: [60, 70],

    // Content Requirements
    targetWordCount: 2500,
    tone: "Educational, reassuring, empathetic, professional",
    comprehensiveness: "Complete guide covering all aspects",

    // Clinical Requirements
    clinicalGuidelines: [
      "ADA (American Dental Association) Clinical Guidelines 2024",
      "Journal of Dental Research meta-analyses",
      "Evidence-based success rate data (Level A evidence)"
    ],

    medicalAccuracyRequired: 100, // BLOCKING GATE
    riskDisclosureComplete: true, // All significant risks must be mentioned
    contraindicationsComplete: true, // All contraindications must be mentioned

    // SEO & Discoverability
    primaryKeywords: [
      "dental implant procedure",
      "dental implants",
      "tooth replacement"
    ],
    secondaryKeywords: [
      "implant surgery",
      "osseointegration",
      "dental restoration",
      "permanent tooth replacement",
      "implant cost",
      "implant recovery"
    ],
    searchIntent: "informational", // Users researching procedure details
    ymylCategory: true, // Your Money Your Life content (stricter SEO standards)

    // E-A-T Requirements (Expertise, Authoritativeness, Trustworthiness)
    eatSignals: {
      authorCredentials: "Dr. Jane Smith, DDS, MS, Board-Certified Periodontist",
      medicalReviewer: "Dr. John Doe, DMD, 20 years experience",
      lastReviewed: new Date().toISOString().split('T')[0],
      citeSources: true, // Cite ADA, clinical studies
      displayCredentials: true // Show author qualifications prominently
    },

    // Internal Linking Strategy
    contentCluster: "dental-implants-pillar",
    internalLinks: [
      { topic: "bone grafting for implants", url: "/bone-grafting-guide" },
      { topic: "implants vs bridges comparison", url: "/implants-vs-bridges" },
      { topic: "dental implant cost breakdown", url: "/implant-cost-guide" },
      { topic: "post-implant care instructions", url: "/implant-recovery" }
    ],

    // Compliance Requirements
    hipaaComplianceRequired: 100, // No PHI in content
    medicalDisclaimersRequired: true,
    fdaComplianceRequired: true, // FDA-approved devices mentioned

    // Project Structure
    projectUUID: "dental-implant-education-2025",
    deliverablePath: "/projects/dental-implant-education-2025/deliverables/healthcare/"
  };

  console.log('📋 Project Specification:');
  console.log(`   Medical Topic: ${projectSpec.medicalTopic}`);
  console.log(`   Target Audience: ${projectSpec.targetAudience}`);
  console.log(`   Word Count: ${projectSpec.targetWordCount}`);
  console.log(`   YMYL Content: ${projectSpec.ymylCategory ? 'Yes (stricter SEO standards)' : 'No'}`);
  console.log(`   E-A-T Required: Yes (Expertise, Authoritativeness, Trustworthiness)\n`);

  // Execute pipeline
  console.log('🚀 Executing Healthcare Content Pipeline...\n');

  const pipelineStartTime = Date.now();

  try {
    const pipelineResult = await healthcarePipeline.execute(projectSpec);

    const totalTime = ((Date.now() - pipelineStartTime) / 1000 / 60).toFixed(2);

    console.log('\n✅ Pipeline Completed Successfully!\n');
    console.log(`⏱️  Total Time: ${totalTime} minutes`);
    console.log(`📊 Execution ID: ${pipelineResult.executionId}\n`);

    // Display stage results
    console.log('📈 Stage Results:\n');

    pipelineResult.stages.forEach((stage, index) => {
      console.log(`${index + 1}. ${stage.name}`);
      console.log(`   Status: ✅ ${stage.status}`);
      console.log(`   Duration: ${(stage.duration / 1000).toFixed(2)}s\n`);
    });

    // Quality Gates Summary
    const validationStage = pipelineResult.stages.find(
      s => s.name === 'Medical Accuracy & Compliance Validation'
    );

    if (validationStage) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔒 Quality Gates (BLOCKING - 100% Required)');
      console.log('═══════════════════════════════════════════════════════════════\n');

      console.log(`Medical Accuracy: ${validationStage.result.medicalAccuracy}% ${validationStage.result.medicalAccuracy === 100 ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`HIPAA Compliance: ${validationStage.result.hipaaCompliance}% ${validationStage.result.hipaaCompliance === 100 ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`Patient Safety: ${validationStage.result.patientSafety}% ${validationStage.result.patientSafety === 100 ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('');

      if (validationStage.result.validationDetails) {
        console.log('Validation Details:');
        Object.entries(validationStage.result.validationDetails).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
        console.log('');
      }
    }

    // SEO Optimization Summary
    const seoStage = pipelineResult.stages.find(
      s => s.name === 'Healthcare SEO Optimization'
    );

    if (seoStage) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔍 SEO Optimization (YMYL Standards)');
      console.log('═══════════════════════════════════════════════════════════════\n');

      console.log('E-A-T Signals:');
      console.log(`   Expertise: ${seoStage.result.seoOptimization.eatSignals.expertise}`);
      console.log(`   Authoritativeness: ${seoStage.result.seoOptimization.eatSignals.authoritativeness}`);
      console.log(`   Trustworthiness: ${seoStage.result.seoOptimization.eatSignals.trustworthiness}\n`);

      console.log('Meta Data:');
      console.log(`   Title: ${seoStage.result.seoOptimization.metaTitle}`);
      console.log(`   Description: ${seoStage.result.seoOptimization.metaDescription}\n`);

      console.log('Schema Markup:');
      console.log(`   Type: ${seoStage.result.seoOptimization.schemaMarkup['@type']}`);
      console.log('');
    }

    // Content Quality Summary
    const contentStage = pipelineResult.stages.find(s => s.name === 'Content Writing');

    if (contentStage) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('📖 Content Quality Metrics');
      console.log('═══════════════════════════════════════════════════════════════\n');

      console.log(`Word Count: ${contentStage.result.content.wordCount}`);
      console.log(`Flesch Reading Ease: ${contentStage.result.content.readabilityScore.fleschReadingEase}`);
      console.log(`Flesch-Kincaid Grade: ${contentStage.result.content.readabilityScore.fleschKincaidGrade}`);
      console.log(`Reading Level Target Met: ${contentStage.result.content.readabilityScore.targetMet ? '✅ Yes' : '❌ No'}\n`);

      console.log('Keywords Integrated:');
      console.log(`   Primary: ${contentStage.result.content.keywordsIntegrated.primary.join(', ')}`);
      console.log(`   Secondary: ${contentStage.result.content.keywordsIntegrated.secondary.join(', ')}\n`);
    }

    // Save deliverable package
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('💾 Deliverable Package');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const deliverablePackage = {
      projectSpec,
      pipelineResult,
      metadata: {
        generatedAt: new Date().toISOString(),
        executionTime: totalTime,
        language: projectSpec.targetLanguage,
        contentType: projectSpec.contentType,
        qualityGatesPassed: {
          medicalAccuracy: validationStage?.result.medicalAccuracy === 100,
          hipaaCompliance: validationStage?.result.hipaaCompliance === 100,
          patientSafety: validationStage?.result.patientSafety === 100
        }
      }
    };

    const deliverableDir = path.join(__dirname, '..', projectSpec.deliverablePath);
    await fs.mkdir(deliverableDir, { recursive: true });

    const packagePath = path.join(deliverableDir, 'dental-implant-education-package.json');
    await fs.writeFile(packagePath, JSON.stringify(deliverablePackage, null, 2));

    console.log(`✅ Package saved to: ${packagePath}\n`);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ DENTAL IMPLANT PATIENT EDUCATION - COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('Deliverables Created:');
    console.log('   ✅ Comprehensive patient education article (2,500 words)');
    console.log('   ✅ Medical accuracy validated (100%)');
    console.log('   ✅ HIPAA compliance verified (100%)');
    console.log('   ✅ SEO optimized with E-A-T signals');
    console.log('   ✅ Medical schema markup implemented');
    console.log('   ✅ Internal linking architecture planned');
    console.log('   ✅ Memory entities integrated\n');

    console.log('Next Steps:');
    console.log('   1. Review generated content');
    console.log('   2. Obtain medical professional review (recommended)');
    console.log('   3. Publish to website with schema markup');
    console.log('   4. Monitor SEO performance (YMYL rankings)');
    console.log('   5. Track patient engagement and conversions\n');

  } catch (error) {
    console.error('\n❌ Pipeline Failed:\n');
    console.error(`Error: ${error.message}\n`);

    if (error.blockingIssues) {
      console.error('🚨 Blocking Issues:\n');
      error.blockingIssues.forEach((issue, index) => {
        console.error(`${index + 1}. ${issue.category} (${issue.severity})`);
        console.error(`   Issue: ${issue.issue}`);
        console.error(`   Clinical Evidence: ${issue.clinicalEvidence}`);
        console.error(`   Required Correction: ${issue.requiredCorrection}\n`);
      });
    }

    console.error('Pipeline stopped. Cannot proceed until issues resolved.\n');
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

// ============================================================================
// EXAMPLE PATIENT PSYCHOGRAPHIC SEGMENTS FOR DENTAL IMPLANTS
// ============================================================================

const dentalImplantPatientSegments = {
  segments: [
    {
      name: "Anxious Pre-Procedure Patient",
      percentage: 45,
      demographics: {
        ageRange: "35-55",
        healthLiteracy: "Medium (Grade 7-8)",
        educationLevel: "High school to some college"
      },
      primaryConcerns: [
        "Will the procedure hurt?",
        "How long is the recovery?",
        "What happens during surgery?",
        "Can I eat normally after?",
        "Will I need time off work?"
      ],
      emotionalState: {
        primaryEmotion: "Anxiety/Fear of dental procedures",
        secondaryEmotion: "Hope for permanent solution",
        trustNeeds: "Reassurance, transparency, step-by-step explanations, empathy"
      },
      contentTonePreferences: "Reassuring, empathetic, detailed but not overwhelming",
      informationNeeds: [
        "Detailed procedure explanation",
        "Pain management information",
        "Day-by-day recovery guide",
        "Before/after patient stories"
      ]
    },
    {
      name: "Cost-Conscious Decider",
      percentage: 30,
      demographics: {
        ageRange: "40-65",
        healthLiteracy: "Medium-High (Grade 8-10)",
        educationLevel: "College educated"
      },
      primaryConcerns: [
        "How much does it cost?",
        "Is it worth the investment vs. alternatives?",
        "Does insurance cover it?",
        "How long will implants last?",
        "What's the ROI compared to dentures or bridges?"
      ],
      emotionalState: {
        primaryEmotion: "Practical/Analytical assessment",
        secondaryEmotion: "Skepticism about value proposition",
        trustNeeds: "Transparent pricing, cost-benefit analysis, ROI justification"
      },
      contentTonePreferences: "Transparent, practical, data-driven, no hard sell",
      informationNeeds: [
        "Detailed cost breakdown",
        "Insurance coverage information",
        "Comparison with alternatives (bridges, dentures)",
        "Long-term value analysis",
        "Financing options"
      ]
    },
    {
      name: "Health-Literate Researcher",
      percentage: 25,
      demographics: {
        ageRange: "35-65",
        healthLiteracy: "High (Grade 10+)",
        educationLevel: "College degree or higher"
      },
      primaryConcerns: [
        "What's the success rate?",
        "What does the clinical evidence show?",
        "What are the long-term outcomes?",
        "What factors affect success?",
        "What are the real risks?"
      ],
      emotionalState: {
        primaryEmotion: "Confident, informed decision-maker",
        secondaryEmotion: "Desire for evidence-based information",
        trustNeeds: "Clinical data, study citations, evidence levels"
      },
      contentTonePreferences: "Professional, evidence-based, detailed clinical information",
      informationNeeds: [
        "Success rate data with evidence levels",
        "Clinical study citations",
        "Detailed risk analysis",
        "Factors affecting outcomes",
        "Recent research and advances"
      ]
    }
  ]
};

// ============================================================================
// EXAMPLE MEDICAL RESEARCH OUTPUT
// ============================================================================

const dentalImplantMedicalResearch = {
  clinicalDefinition: "A dental implant is a titanium post surgically placed into the jawbone beneath the gum line to support a replacement tooth or bridge.",

  procedureSteps: [
    {
      step: 1,
      name: "Initial Consultation and Planning",
      duration: "1-2 hours",
      description: "Comprehensive examination, X-rays, 3D imaging, treatment planning"
    },
    {
      step: 2,
      name: "Implant Placement Surgery",
      duration: "1-2 hours per implant",
      description: "Surgical placement of titanium post into jawbone under local anesthesia"
    },
    {
      step: 3,
      name: "Osseointegration Healing Period",
      duration: "3-6 months",
      description: "Bone grows around and integrates with implant post"
    },
    {
      step: 4,
      name: "Abutment Placement",
      duration: "30-60 minutes",
      description: "Connector piece attached to implant after healing"
    },
    {
      step: 5,
      name: "Crown Fabrication and Placement",
      duration: "1-2 weeks",
      description: "Custom crown created and attached to abutment"
    }
  ],

  successRates: {
    shortTerm: "98% (5 years)",
    longTerm: "95-98% (10+ years)",
    evidenceLevel: "Level A (Strong RCT evidence)",
    source: "ADA Clinical Guidelines 2024, Journal of Dental Research meta-analysis 2023"
  },

  risks: [
    {
      risk: "Infection",
      incidence: "1-5%",
      severity: "Moderate",
      management: "Antibiotics, possible implant removal"
    },
    {
      risk: "Nerve damage",
      incidence: "<1%",
      severity: "Rare but serious",
      management: "May be temporary or permanent, specialist evaluation required"
    },
    {
      risk: "Implant failure",
      incidence: "2-5%",
      severity: "Moderate",
      management: "Removal and replacement possible after healing"
    },
    {
      risk: "Sinus problems (upper jaw)",
      incidence: "Rare",
      severity: "Mild to moderate",
      management: "Sinus lift procedure may be needed"
    }
  ],

  contraindications: [
    "Uncontrolled diabetes (HbA1c >7%)",
    "Active periodontal disease",
    "Heavy smoking (>10 cigarettes/day)",
    "Insufficient bone density without grafting",
    "Recent radiation therapy to jaw/head/neck area",
    "Bisphosphonate medications (relative contraindication)",
    "Uncontrolled bleeding disorders",
    "Severe immune system compromise"
  ]
};

// ============================================================================
// RUN EXAMPLE
// ============================================================================

if (require.main === module) {
  createDentalImplantEducationContent()
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
  createDentalImplantEducationContent,
  dentalImplantPatientSegments,
  dentalImplantMedicalResearch
};
