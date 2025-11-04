/**
 * ORCHESTRAI Healthcare Content Pipeline - Executable Implementation
 *
 * Complete healthcare content creation workflow with medical accuracy validation,
 * HIPAA compliance enforcement, and patient education optimization.
 *
 * Stages:
 * 1. Medical Research & Patient Psychographics - Medical fact verification and audience analysis
 * 2. Outline Creation (Medical Structure) - Patient-friendly content planning
 *    ⚠️  CHECKPOINT: Outline Approval Required
 * 3. Content Writing (Patient-Friendly Medical) - Medically accurate, accessible writing
 * 4. Medical Accuracy & Compliance Validation - 100% medical accuracy + HIPAA compliance (BLOCKING)
 * 5. Healthcare SEO & Disclaimer Integration - YMYL SEO + legal disclaimers
 * 6. Memory Integration & Publishing - Knowledge graph and CMS preparation
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

class HealthcareContentPipeline extends EventEmitter {
  constructor(
    coordinationPatterns,
    dynamicAgentSelection,
    crystallineMemory,
    redis = null
  ) {
    super();

    this.coordinationPatterns = coordinationPatterns;
    this.dynamicAgentSelection = dynamicAgentSelection;
    this.crystallineMemory = crystallineMemory;
    this.redis = redis;

    // Pipeline metadata
    this.pipelineId = 'healthcare-content';
    this.pipelineName = 'Healthcare Content Pipeline';
    this.version = '1.0.0';

    // Stage configuration
    this.stages = [
      'medical_research',
      'outline_creation',
      'content_writing',
      'medical_validation',
      'healthcare_seo',
      'memory_publishing'
    ];

    // Required agents
    this.requiredAgents = {
      'medical_research': 'general-purpose', // healthcare-content-specialist
      'outline_creation': 'content-outline-architect',
      'content_writing': 'content-writer-specialist',
      'medical_validation': 'general-purpose', // medical-accuracy-validator
      'healthcare_seo': 'seo-content-optimization',
      'memory_publishing': 'general-purpose'
    };

    // Medical accuracy threshold (BLOCKING GATE)
    this.medicalAccuracyThreshold = 100; // Zero tolerance for medical inaccuracy
    this.hipaaComplianceThreshold = 100; // Zero tolerance for HIPAA violations
    this.patientSafetyThreshold = 100; // Zero tolerance for patient safety issues

    console.log('🏥 Healthcare Content Pipeline initialized');
  }

  /**
   * Execute complete healthcare content pipeline
   */
  async execute(projectSpec, options = {}) {
    const executionId = `exec-${Date.now()}`;
    const startTime = Date.now();

    console.log(`\n🚀 Starting Healthcare Content Pipeline Execution: ${executionId}`);
    console.log(`   Client: ${projectSpec.clientName}`);
    console.log(`   Medical Topic: ${projectSpec.medicalTopic || 'General Healthcare'}`);
    console.log(`   Content Type: ${projectSpec.contentType || 'Patient Education'}`);
    console.log(`   Language: ${projectSpec.language || 'English'}`);
    console.log(`   Target Audience: ${projectSpec.targetAudience || 'General Patients'}`);

    const execution = {
      executionId,
      pipelineId: this.pipelineId,
      projectSpec,
      options,
      startTime,
      currentStage: null,
      stageResults: {},
      deliverablePaths: {},
      performance: {
        stageTimings: {},
        agentPerformance: {}
      }
    };

    try {
      // Stage 1: Medical Research & Patient Psychographics
      execution.currentStage = 'medical_research';
      this.emit('stage-started', { executionId, stage: 'medical_research' });
      const medicalResearchData = await this.executeMedicalResearch(execution, projectSpec);
      execution.stageResults.medical_research = medicalResearchData;
      this.emit('stage-completed', { executionId, stage: 'medical_research', result: medicalResearchData });

      // Stage 2: Outline Creation (Medical Structure)
      execution.currentStage = 'outline_creation';
      this.emit('stage-started', { executionId, stage: 'outline_creation' });
      const outlineData = await this.executeOutlineCreation(execution, medicalResearchData, projectSpec);
      execution.stageResults.outline_creation = outlineData;
      this.emit('stage-completed', { executionId, stage: 'outline_creation', result: outlineData });

      // MANDATORY CHECKPOINT: Outline must be approved before proceeding
      if (!options.outlineApproved && !options.autoExecute) {
        console.log('\n⚠️  CHECKPOINT: Medical content outline created and requires approval before proceeding');
        console.log('   Medical accuracy review recommended before content writing');
        console.log('   Set options.outlineApproved = true to continue');

        return {
          status: 'pending-approval',
          checkpoint: 'outline_creation',
          executionId,
          outlineData,
          message: 'Outline requires approval before proceeding to content writing (medical accuracy review recommended)'
        };
      }

      // Stage 3: Content Writing (Patient-Friendly Medical)
      execution.currentStage = 'content_writing';
      this.emit('stage-started', { executionId, stage: 'content_writing' });
      const contentData = await this.executeContentWriting(execution, outlineData, medicalResearchData, projectSpec);
      execution.stageResults.content_writing = contentData;
      this.emit('stage-completed', { executionId, stage: 'content_writing', result: contentData });

      // Stage 4: Medical Accuracy & Compliance Validation (BLOCKING GATES)
      execution.currentStage = 'medical_validation';
      this.emit('stage-started', { executionId, stage: 'medical_validation' });
      const validationData = await this.executeMedicalValidation(execution, contentData, outlineData, medicalResearchData, projectSpec);
      execution.stageResults.medical_validation = validationData;
      this.emit('stage-completed', { executionId, stage: 'medical_validation', result: validationData });

      // BLOCKING GATES: Medical accuracy, HIPAA compliance, patient safety
      this.enforceBlockingGates(validationData, executionId);

      // Stage 5: Healthcare SEO & Disclaimer Integration
      execution.currentStage = 'healthcare_seo';
      this.emit('stage-started', { executionId, stage: 'healthcare_seo' });
      const seoData = await this.executeHealthcareSEO(execution, contentData, validationData, medicalResearchData, projectSpec);
      execution.stageResults.healthcare_seo = seoData;
      this.emit('stage-completed', { executionId, stage: 'healthcare_seo', result: seoData });

      // Stage 6: Memory Integration & Publishing
      execution.currentStage = 'memory_publishing';
      this.emit('stage-started', { executionId, stage: 'memory_publishing' });
      const publishingData = await this.executeMemoryPublishing(execution, seoData, projectSpec);
      execution.stageResults.memory_publishing = publishingData;
      this.emit('stage-completed', { executionId, stage: 'memory_publishing', result: publishingData });

      // Calculate execution metrics
      const duration = Date.now() - startTime;
      execution.duration = duration;
      execution.status = 'completed';

      console.log(`\n✅ Healthcare Content Pipeline Completed: ${executionId}`);
      console.log(`   Duration: ${Math.round(duration / 1000 / 60)} minutes`);
      console.log(`   Medical Accuracy: ${validationData.medicalAccuracy}%`);
      console.log(`   HIPAA Compliance: ${validationData.hipaaCompliance}%`);
      console.log(`   Patient Safety: ${validationData.patientSafety}%`);
      console.log(`   Patient Comprehension: ${validationData.patientComprehensionScore}%`);

      this.emit('pipeline-completed', {
        executionId,
        duration,
        results: execution.stageResults,
        deliverables: execution.deliverablePaths
      });

      return {
        success: true,
        executionId,
        duration,
        results: execution.stageResults,
        deliverablePaths: execution.deliverablePaths,
        performance: execution.performance,
        qualityMetrics: {
          medicalAccuracy: validationData.medicalAccuracy,
          hipaaCompliance: validationData.hipaaCompliance,
          patientSafety: validationData.patientSafety,
          patientComprehension: validationData.patientComprehensionScore,
          healthcareSEO: seoData.medicalSEOScore
        }
      };

    } catch (error) {
      console.error(`\n❌ Healthcare Content Pipeline Failed: ${executionId}`);
      console.error(`   Stage: ${execution.currentStage}`);
      console.error(`   Error:`, error.message);

      execution.status = 'failed';
      execution.error = error;

      this.emit('pipeline-failed', {
        executionId,
        stage: execution.currentStage,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Enforce blocking gates (medical accuracy, HIPAA, patient safety)
   */
  enforceBlockingGates(validationData, executionId) {
    const failures = [];

    // Gate 1: Medical Accuracy (100% required)
    if (validationData.medicalAccuracy < this.medicalAccuracyThreshold) {
      failures.push({
        gate: 'Medical Accuracy',
        required: 100,
        actual: validationData.medicalAccuracy,
        severity: 'CRITICAL',
        details: validationData.medicalAccuracyIssues || 'Medical facts require verification'
      });
    }

    // Gate 2: HIPAA Compliance (100% required)
    if (validationData.hipaaCompliance < this.hipaaComplianceThreshold) {
      failures.push({
        gate: 'HIPAA Compliance',
        required: 100,
        actual: validationData.hipaaCompliance,
        severity: 'CRITICAL',
        details: validationData.hipaaViolations || 'Privacy compliance violations detected'
      });
    }

    // Gate 3: Patient Safety (100% required)
    if (validationData.patientSafety < this.patientSafetyThreshold) {
      failures.push({
        gate: 'Patient Safety',
        required: 100,
        actual: validationData.patientSafety,
        severity: 'CRITICAL',
        details: validationData.patientSafetyIssues || 'Patient safety concerns identified'
      });
    }

    // Gate 4: Disclaimer Completeness (100% required)
    if (validationData.disclaimerCompleteness < 100) {
      failures.push({
        gate: 'Disclaimer Completeness',
        required: 100,
        actual: validationData.disclaimerCompleteness,
        severity: 'HIGH',
        details: validationData.missingDisclaimers || 'Required medical disclaimers missing'
      });
    }

    if (failures.length > 0) {
      console.error(`\n🚨 BLOCKING GATES FAILED - CANNOT PROCEED`);
      console.error(`   Execution ID: ${executionId}`);
      failures.forEach(failure => {
        console.error(`\n   ❌ ${failure.gate} FAILURE:`);
        console.error(`      Required: ${failure.required}%`);
        console.error(`      Actual: ${failure.actual}%`);
        console.error(`      Severity: ${failure.severity}`);
        console.error(`      Details: ${failure.details}`);
      });

      throw new Error(`Healthcare content validation failed blocking gates: ${failures.map(f => f.gate).join(', ')}`);
    }

    console.log(`\n✅ All blocking gates PASSED`);
    console.log(`   Medical Accuracy: ${validationData.medicalAccuracy}% ✓`);
    console.log(`   HIPAA Compliance: ${validationData.hipaaCompliance}% ✓`);
    console.log(`   Patient Safety: ${validationData.patientSafety}% ✓`);
    console.log(`   Disclaimer Completeness: ${validationData.disclaimerCompleteness}% ✓`);
  }

  /**
   * Stage 1: Medical Research & Patient Psychographics
   */
  async executeMedicalResearch(execution, projectSpec) {
    console.log('\n🔬 Stage 1: Medical Research & Patient Psychographics');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.medical_research,
      domain: 'healthcare',
      capabilities: ['medical-research', 'patient-psychographics', 'health-literacy-assessment', 'clinical-guidelines'],
      context: {
        medicalTopic: projectSpec.medicalTopic,
        contentType: projectSpec.contentType,
        targetAudience: projectSpec.targetAudience,
        language: projectSpec.language
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Retrieve existing medical content from memory
    const existingMedicalContent = await this.retrieveExistingMedicalContent(projectSpec);

    const medicalResearchPrompt = this.buildMedicalResearchPrompt(
      projectSpec,
      existingMedicalContent
    );

    const medicalResearchResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-medical-research`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: medicalResearchPrompt,
      context: {
        medicalTopic: projectSpec.medicalTopic,
        contentType: projectSpec.contentType,
        targetAudience: projectSpec.targetAudience,
        existingContent: existingMedicalContent
      }
    });

    // Save medical research deliverables
    const deliverablePath = await this.saveMedicalResearchDeliverables(
      execution,
      medicalResearchResult,
      projectSpec
    );

    execution.deliverablePaths.medical_research = deliverablePath;
    execution.performance.stageTimings.medical_research = Date.now() - stageStart;

    console.log(`   ✅ Medical research completed`);
    console.log(`   Medical Facts Verified: ${medicalResearchResult.factCount || 'N/A'}`);
    console.log(`   Patient Segments: ${medicalResearchResult.patientSegmentCount || 'N/A'}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      medicalResearch: medicalResearchResult.medicalResearch,
      patientPsychographics: medicalResearchResult.patientPsychographics,
      contentRequirements: medicalResearchResult.contentRequirements,
      healthLiteracyLevel: medicalResearchResult.healthLiteracyLevel,
      culturalConsiderations: medicalResearchResult.culturalConsiderations,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 2: Outline Creation (Medical Content Structure)
   */
  async executeOutlineCreation(execution, medicalResearchData, projectSpec) {
    console.log('\n📋 Stage 2: Outline Creation (Medical Content Structure)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.outline_creation,
      domain: 'content',
      capabilities: ['medical-outline-creation', 'patient-education-structuring', 'health-literacy-adaptation'],
      context: {
        medicalTopic: projectSpec.medicalTopic,
        patientPsychographics: medicalResearchData.patientPsychographics,
        healthLiteracyLevel: medicalResearchData.healthLiteracyLevel
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Retrieve related medical content for internal linking
    const relatedMedicalContent = await this.retrieveRelatedMedicalContent(projectSpec);

    const outlinePrompt = this.buildMedicalOutlinePrompt(
      projectSpec,
      medicalResearchData,
      relatedMedicalContent
    );

    const outlineResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-outline-creation`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: outlinePrompt,
      context: {
        medicalResearch: medicalResearchData.medicalResearch,
        patientPsychographics: medicalResearchData.patientPsychographics,
        healthLiteracyLevel: medicalResearchData.healthLiteracyLevel,
        language: projectSpec.language
      }
    });

    // Save outline deliverables
    const deliverablePath = await this.saveOutlineDeliverables(
      execution,
      outlineResult,
      projectSpec
    );

    execution.deliverablePaths.outline = deliverablePath;
    execution.performance.stageTimings.outline_creation = Date.now() - stageStart;

    console.log(`   ✅ Medical content outline created (100% ${projectSpec.language})`);
    console.log(`   Sections: ${outlineResult.sectionCount || 'N/A'}`);
    console.log(`   Medical Terms to Define: ${outlineResult.medicalTermCount || 'N/A'}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      outline: outlineResult.outline,
      patientPsychographicMapping: outlineResult.patientPsychographicMapping,
      medicalTerminology: outlineResult.medicalTerminology,
      disclaimerRequirements: outlineResult.disclaimerRequirements,
      internalLinkingPlan: outlineResult.internalLinkingPlan,
      complianceRequirements: outlineResult.complianceRequirements,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 3: Content Writing (Patient-Friendly Medical)
   */
  async executeContentWriting(execution, outlineData, medicalResearchData, projectSpec) {
    console.log('\n✍️  Stage 3: Content Writing (Patient-Friendly Medical Content)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.content_writing,
      domain: 'content',
      capabilities: ['medical-content-writing', 'patient-friendly-language', 'health-literacy-optimization', 'empathetic-medical-tone'],
      context: {
        medicalTopic: projectSpec.medicalTopic,
        healthLiteracyLevel: medicalResearchData.healthLiteracyLevel,
        patientPsychographics: medicalResearchData.patientPsychographics
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);
    console.log(`   🚨 MANDATORY: Using specialized content-writer-specialist for patient-friendly medical content`);

    const contentPrompt = this.buildMedicalContentWritingPrompt(
      projectSpec,
      outlineData,
      medicalResearchData
    );

    const contentResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-content-writing`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: contentPrompt,
      context: {
        language: projectSpec.language,
        outline: outlineData.outline,
        medicalTerminology: outlineData.medicalTerminology,
        patientPsychographics: medicalResearchData.patientPsychographics,
        healthLiteracyLevel: medicalResearchData.healthLiteracyLevel,
        medicalResearch: medicalResearchData.medicalResearch,
        naturalFlowRequired: true,
        patientFriendlyRequired: true
      }
    });

    // Save content deliverables
    const deliverablePath = await this.saveContentDeliverables(
      execution,
      contentResult,
      projectSpec
    );

    execution.deliverablePaths.content = deliverablePath;
    execution.performance.stageTimings.content_writing = Date.now() - stageStart;

    console.log(`   ✅ Medical content written (100% ${projectSpec.language})`);
    console.log(`   Word Count: ${contentResult.wordCount || 'N/A'}`);
    console.log(`   Medical Terms Defined: ${contentResult.medicalTermsDefined || 'N/A'}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      content: contentResult.content,
      wordCount: contentResult.wordCount,
      medicalTermsDefined: contentResult.medicalTermsDefined,
      patientFriendlinessScore: contentResult.patientFriendlinessScore,
      empathyScore: contentResult.empathyScore,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 4: Medical Accuracy & Compliance Validation (BLOCKING GATES)
   */
  async executeMedicalValidation(execution, contentData, outlineData, medicalResearchData, projectSpec) {
    console.log('\n🏥 Stage 4: Medical Accuracy & Compliance Validation (BLOCKING GATES)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.medical_validation,
      domain: 'validation',
      capabilities: ['medical-fact-checking', 'hipaa-compliance', 'patient-safety-validation', 'disclaimer-verification'],
      context: {
        medicalTopic: projectSpec.medicalTopic,
        content: contentData.content,
        medicalResearch: medicalResearchData.medicalResearch
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    const validationPrompt = this.buildMedicalValidationPrompt(
      projectSpec,
      contentData,
      outlineData,
      medicalResearchData
    );

    const validationResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-medical-validation`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: validationPrompt,
      context: {
        content: contentData.content,
        medicalResearch: medicalResearchData.medicalResearch,
        outline: outlineData.outline,
        disclaimerRequirements: outlineData.disclaimerRequirements,
        medicalAccuracyThreshold: this.medicalAccuracyThreshold,
        hipaaComplianceThreshold: this.hipaaComplianceThreshold
      }
    });

    // Save validation deliverables (including failures for medical review)
    const deliverablePath = await this.saveValidationDeliverables(
      execution,
      validationResult,
      projectSpec
    );

    execution.deliverablePaths.validation = deliverablePath;
    execution.performance.stageTimings.medical_validation = Date.now() - stageStart;

    console.log(`   Validation Results:`);
    console.log(`   Medical Accuracy: ${validationResult.medicalAccuracy}%`);
    console.log(`   HIPAA Compliance: ${validationResult.hipaaCompliance}%`);
    console.log(`   Patient Safety: ${validationResult.patientSafety}%`);
    console.log(`   Disclaimer Completeness: ${validationResult.disclaimerCompleteness}%`);
    console.log(`   Patient Comprehension: ${validationResult.patientComprehensionScore}%`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      medicalAccuracy: validationResult.medicalAccuracy,
      medicalAccuracyIssues: validationResult.medicalAccuracyIssues,
      hipaaCompliance: validationResult.hipaaCompliance,
      hipaaViolations: validationResult.hipaaViolations,
      patientSafety: validationResult.patientSafety,
      patientSafetyIssues: validationResult.patientSafetyIssues,
      disclaimerCompleteness: validationResult.disclaimerCompleteness,
      missingDisclaimers: validationResult.missingDisclaimers,
      patientComprehensionScore: validationResult.patientComprehensionScore,
      readabilityLevel: validationResult.readabilityLevel,
      contentArchitectureCompliance: validationResult.contentArchitectureCompliance,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 5: Healthcare SEO & Disclaimer Integration
   */
  async executeHealthcareSEO(execution, contentData, validationData, medicalResearchData, projectSpec) {
    console.log('\n🔍 Stage 5: Healthcare SEO & Disclaimer Integration (YMYL Optimization)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.healthcare_seo,
      domain: 'seo',
      capabilities: ['healthcare-seo', 'ymyl-optimization', 'medical-schema-markup', 'eat-signals', 'medical-disclaimer-integration'],
      context: {
        medicalTopic: projectSpec.medicalTopic,
        content: contentData.content,
        language: projectSpec.language
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Retrieve related medical content for internal linking
    const relatedMedicalContent = await this.retrieveRelatedMedicalContent(projectSpec);

    const seoPrompt = this.buildHealthcareSEOPrompt(
      projectSpec,
      contentData,
      validationData,
      medicalResearchData,
      relatedMedicalContent
    );

    const seoResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-healthcare-seo`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: seoPrompt,
      context: {
        content: contentData.content,
        medicalTopic: projectSpec.medicalTopic,
        language: projectSpec.language,
        relatedContent: relatedMedicalContent,
        disclaimerRequirements: validationData.missingDisclaimers || []
      }
    });

    // Save healthcare SEO deliverables
    const deliverablePath = await this.saveHealthcareSEODeliverables(
      execution,
      seoResult,
      projectSpec
    );

    execution.deliverablePaths.healthcare_seo = deliverablePath;
    execution.performance.stageTimings.healthcare_seo = Date.now() - stageStart;

    console.log(`   ✅ Healthcare SEO optimization completed`);
    console.log(`   Medical SEO Score: ${seoResult.medicalSEOScore || 'N/A'}%`);
    console.log(`   E-A-T Signals: ${seoResult.eatSignalsComplete ? '✓' : '✗'}`);
    console.log(`   Medical Schema Markup: ${seoResult.medicalSchemaPresent ? '✓' : '✗'}`);
    console.log(`   Disclaimers Integrated: ${seoResult.disclaimerCount || 0}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      optimizedContent: seoResult.optimizedContent,
      medicalSEOScore: seoResult.medicalSEOScore,
      eatSignals: seoResult.eatSignals,
      medicalSchemaMarkup: seoResult.medicalSchemaMarkup,
      integratedDisclaimers: seoResult.integratedDisclaimers,
      internalLinks: seoResult.internalLinks,
      metaData: seoResult.metaData,
      authorCredentials: seoResult.authorCredentials,
      medicalCitations: seoResult.medicalCitations,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 6: Memory Integration & Publishing
   */
  async executeMemoryPublishing(execution, seoData, projectSpec) {
    console.log('\n🧠 Stage 6: Memory Integration & Publishing (Medical Knowledge Graph)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.memory_publishing,
      domain: 'content',
      capabilities: ['medical-memory-integration', 'medical-knowledge-graph', 'cms-publishing'],
      context: {
        content: seoData.optimizedContent,
        medicalTopic: projectSpec.medicalTopic,
        clientName: projectSpec.clientName
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Store medical content in crystalline memory
    await this.storeMedicalContentInMemory(execution, seoData, projectSpec);

    // Create medical knowledge graph relations
    await this.createMedicalMemoryRelations(execution, seoData, projectSpec);

    const publishingPrompt = this.buildMemoryPublishingPrompt(
      projectSpec,
      seoData,
      execution.stageResults
    );

    const publishingResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-memory-publishing`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: publishingPrompt,
      context: {
        content: seoData.optimizedContent,
        medicalTopic: projectSpec.medicalTopic,
        clientName: projectSpec.clientName,
        language: projectSpec.language
      }
    });

    // Save publishing deliverables
    const deliverablePath = await this.savePublishingDeliverables(
      execution,
      publishingResult,
      projectSpec
    );

    execution.deliverablePaths.publishing = deliverablePath;
    execution.performance.stageTimings.memory_publishing = Date.now() - stageStart;

    console.log(`   ✅ Memory integration and publishing completed`);
    console.log(`   Medical Knowledge Entities: ${publishingResult.medicalEntityCount || 0}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      publishedContent: publishingResult.publishedContent,
      medicalMemoryEntities: publishingResult.medicalMemoryEntities,
      medicalKnowledgeRelations: publishingResult.medicalKnowledgeRelations,
      cmsReadyPackage: publishingResult.cmsReadyPackage,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Helper: Retrieve existing medical content from memory
   */
  async retrieveExistingMedicalContent(projectSpec) {
    if (!this.crystallineMemory) return null;

    try {
      const medicalMemory = await this.crystallineMemory.searchMemory(
        `${projectSpec.clientName} ${projectSpec.medicalTopic}`,
        { semantic_tags: ['medical-content', 'patient-education', projectSpec.language], limit: 5 }
      );

      return medicalMemory;
    } catch (error) {
      console.warn('Could not retrieve existing medical content:', error.message);
      return null;
    }
  }

  /**
   * Helper: Retrieve related medical content for internal linking
   */
  async retrieveRelatedMedicalContent(projectSpec) {
    if (!this.crystallineMemory) return null;

    try {
      const relatedContent = await this.crystallineMemory.searchMemory(
        projectSpec.clientName,
        { semantic_tags: ['medical-content', 'healthcare-cluster', projectSpec.language], limit: 10 }
      );

      return relatedContent;
    } catch (error) {
      console.warn('Could not retrieve related medical content:', error.message);
      return null;
    }
  }

  /**
   * Helper: Store medical content in crystalline memory
   */
  async storeMedicalContentInMemory(execution, seoData, projectSpec) {
    if (!this.crystallineMemory) return;

    try {
      await this.crystallineMemory.storeMemory({
        entity_type: 'medical-content-article',
        entity_name: `${projectSpec.clientName}-${projectSpec.medicalTopic}-${projectSpec.language}`,
        content: seoData.optimizedContent,
        semantic_tags: [
          'medical-content',
          'patient-education',
          projectSpec.contentType || 'healthcare',
          projectSpec.language,
          'healthcare-cluster'
        ],
        metadata: {
          executionId: execution.executionId,
          timestamp: Date.now(),
          medicalTopic: projectSpec.medicalTopic,
          contentType: projectSpec.contentType,
          language: projectSpec.language,
          wordCount: execution.stageResults.content_writing?.wordCount || 0,
          medicalSEOScore: seoData.medicalSEOScore || 0,
          medicalAccuracy: execution.stageResults.medical_validation?.medicalAccuracy || 0,
          hipaaCompliance: execution.stageResults.medical_validation?.hipaaCompliance || 0
        }
      });

      console.log('   💾 Medical content stored in crystalline memory');
    } catch (error) {
      console.warn('Could not store medical content in memory:', error.message);
    }
  }

  /**
   * Helper: Create medical knowledge graph relations
   */
  async createMedicalMemoryRelations(execution, seoData, projectSpec) {
    if (!this.crystallineMemory) return;

    try {
      const contentEntityName = `${projectSpec.clientName}-${projectSpec.medicalTopic}-${projectSpec.language}`;

      // Create relations to patient psychographic segments
      const patientSegments = execution.stageResults.medical_research?.patientPsychographics?.segments || [];

      for (const segment of patientSegments) {
        await this.crystallineMemory.createRelation({
          from: contentEntityName,
          to: segment.name || 'general-patient-segment',
          relationType: 'targets-patient-psychographic'
        });
      }

      // Create relations to related medical procedures/content
      const internalLinks = seoData.internalLinks || [];

      for (const link of internalLinks) {
        await this.crystallineMemory.createRelation({
          from: contentEntityName,
          to: link.targetArticle || link.title,
          relationType: link.relationType || 'related-medical-content'
        });
      }

      console.log('   🔗 Medical knowledge graph relations created');
    } catch (error) {
      console.warn('Could not create medical memory relations:', error.message);
    }
  }

  /**
   * Prompt Builders
   */
  buildMedicalResearchPrompt(projectSpec, existingContent) {
    return `Conduct comprehensive medical research and patient psychographic analysis for healthcare content creation.

**Medical Topic:** ${projectSpec.medicalTopic || 'General Healthcare'}
**Content Type:** ${projectSpec.contentType || 'Patient Education'}
**Target Audience:** ${projectSpec.targetAudience || 'General adult patients'}
**Language:** ${projectSpec.language || 'English'}
**Client:** ${projectSpec.clientName}

**Existing Medical Content:**
${existingContent ? JSON.stringify(existingContent, null, 2) : 'No existing content available'}

**Required Medical Research:**

1. **Medical Facts & Clinical Information:**
   - Accurate procedure/condition/treatment definition
   - Clinical guidelines and standard of care
   - Contraindications and risk factors
   - Evidence level (A, B, C) for claims
   - Typical timelines (recovery, treatment duration)
   - Success rates and outcomes (if applicable)
   - Medical terminology to be defined

2. **Patient Psychographics (Healthcare-Specific):**
   - **Demographics:** Age range, health literacy level, education
   - **Primary Concerns:** Pain, recovery time, cost, risks, alternatives
   - **Emotional State:** Pre-procedure anxiety, post-procedure expectations, trust needs
   - **Health Literacy:** Low (Grade 5-6), Medium (Grade 7-9), High (Grade 10+)
   - **Cultural Medical Considerations:** Language-specific health beliefs, medical system familiarity
   - **Information Seeking Behavior:** What questions patients typically ask

3. **Patient Segment Distribution:**
   Example:
   - "Anxious Pre-Procedure Patient" (45%): Fears pain, seeks reassurance, wants detailed preparation info
   - "Cost-Conscious Decider" (30%): Needs value justification, seeks alternatives comparison
   - "Health-Literate Researcher" (25%): Wants scientific details, evidence-based information

4. **Content Requirements for Patient Education:**
   - **Reading Level:** Grade 6-8 recommended (or specify based on audience)
   - **Medical Depth:** High-level overview vs. moderate clinical detail vs. simplified only
   - **Visual Support Needs:** Diagrams, before/after images, step-by-step illustrations
   - **Disclaimer Requirements:** Medical advice disclaimer, HIPAA notices, regional compliance

5. **Cultural & Linguistic Medical Considerations:**
   - Language-specific medical terminology (e.g., "tandarts" in Dutch, "stomatolog" in Slovenian)
   - Cultural health beliefs affecting content framing
   - Healthcare system differences (US insurance vs. EU universal care)
   - Measurement preferences (metric vs. imperial)

Provide comprehensive medical research framework for patient-friendly content creation with 100% medical accuracy.`;
  }

  buildMedicalOutlinePrompt(projectSpec, medicalResearchData, relatedContent) {
    return `Create comprehensive medical content outline with patient-friendly structure and 100% medical accuracy.

**CRITICAL: This outline must be 100% in ${projectSpec.language} - ZERO contamination allowed.**

**Medical Topic:** ${projectSpec.medicalTopic}
**Content Type:** ${projectSpec.contentType || 'Patient Education'}
**Word Count:** ${projectSpec.wordCount || 1500}
**Language:** ${projectSpec.language}
**Health Literacy Target:** ${medicalResearchData.healthLiteracyLevel || 'Grade 6-8'}

**Medical Research:**
${JSON.stringify(medicalResearchData.medicalResearch, null, 2)}

**Patient Psychographics:**
${JSON.stringify(medicalResearchData.patientPsychographics, null, 2)}

**Related Medical Content (for internal linking):**
${relatedContent ? JSON.stringify(relatedContent, null, 2) : 'No related content available'}

**Required Medical Content Outline Structure:**

1. **H1 Title** (in ${projectSpec.language}):
   - Patient-friendly language (avoid medical jargon)
   - Includes primary keyword naturally
   - Addresses primary patient concern
   - Example: "Understanding [Procedure]: What to Expect and How It Helps" (NOT technical title)

2. **Introduction** (150-200 words):
   - **Patient Psychographic:** [Primary segment] (percentage)
   - **Emotional Tone:** Reassuring, empathetic, professional
   - **Reader Concerns to Address:** [List patient anxieties to acknowledge]
   - **Medical Accuracy:** High-level overview, no intimidating jargon
   - **Plain Language Required:** Use analogies for complex concepts

3. **H2 Sections** (5-7 sections):
   For each H2 section, provide:

   **Section Title** (in ${projectSpec.language}):
   - Patient-friendly question format OR clear topic
   - Example: "What Is [Procedure] and When Do You Need It?" (NOT "Clinical Indications for [Procedure]")

   **Psychographic Target:** [Patient segment] (percentage)
   **Emotional Tone:** [Reassuring/Educational/Empowering]
   **Medical Depth:** [High-level/Moderate/Simplified]
   **Word Count:** [Exact count per section]

   **Content Requirements** (to cover in PARAGRAPH FORM):
   - [Medical fact 1 to explain in patient-friendly language]
   - [Medical fact 2 with analogy or everyday comparison]
   - [Patient concern to address empathetically]
   - [Timeline or expectation to set realistically]

   **Medical Terminology Handling:**
   - **Terms to Define:** [List medical terms, e.g., "osseointegration"]
   - **Terms to Avoid:** [Complex jargon to replace with plain language]
   - **Plain Language Alternatives:** [e.g., use "jawbone" not "mandible"]

   **Engagement Elements** (NOT lists of Content Requirements):
   - Comparison Table: [e.g., "This Procedure vs. Alternatives"]
   - Info Box: [e.g., "Quick Facts About Recovery"]
   - Patient Concern Callout: [e.g., "Common Question: Will It Hurt?"]

   **H3 Subsections** (if needed for complex topics):
   - [Subsection title in patient-friendly language]
   - [Content requirements]

4. **Medical Disclaimer Placement:**
   - **Primary Disclaimer Location:** After introduction, before main content
   - **Disclaimer Type:** Medical advice disclaimer, consultation recommendation
   - **HIPAA Considerations:** No patient-identifiable information allowed
   - **Regional Compliance:** [GDPR for EU, HIPAA for US, local healthcare advertising laws]

5. **Internal Linking Architecture:**
   - **Related Procedures:** [List related medical content to link]
   - **Post-Care Content:** [Link to aftercare instructions]
   - **Cost Information:** [Link to pricing guides if available]
   - **Alternative Treatments:** [Link to comparison content]
   - **Anchor Text:** Patient-friendly language (NOT "click here")

6. **Patient Safety & Risk Communication:**
   - **Risk Disclosure Requirements:** [What risks must be mentioned]
   - **When to Contact Provider:** [Emergency signs or concerning symptoms]
   - **Contraindications to Mention:** [Who should NOT undergo procedure]
   - **Realistic Expectations:** [Outcome ranges, typical vs. exceptional results]

7. **CTA Strategy (if applicable):**
   - **Primary CTA:** [e.g., "Schedule consultation", "Learn if you're a candidate"]
   - **Placement:** [After establishing trust and addressing concerns]
   - **Tone:** Empowering, not pushy (patient decides when ready)

**MANDATORY CONTENT ARCHITECTURE:**
- Paragraph Distribution: 40% short (1-2 sentences) / 40% medium (3-5 sentences) / 20% long (6+ sentences)
- Maximum bulleted lists: 16-20 total (use for symptoms, care steps, warning signs)
- Maximum tables: 6-8 (use for procedure comparison, timeline, recovery phases)
- Bold text: Minimal (medical terms at FIRST mention only, warnings)

**MEDICAL ACCURACY CHECKPOINTS:**
- All procedure descriptions clinically accurate
- Risk communication complete and balanced
- Timeline accuracy verified against clinical data
- Cost ranges appropriate for region (if mentioned)
- Contraindications comprehensive
- Evidence level noted for outcome claims

Provide complete medical content outline ready for patient-friendly writing.`;
  }

  buildMedicalContentWritingPrompt(projectSpec, outlineData, medicalResearchData) {
    return `Write natural, patient-friendly ${projectSpec.language} medical content following the approved outline.

**CRITICAL HEALTHCARE WRITING REQUIREMENTS:**

1. **100% Medical Accuracy (NON-NEGOTIABLE):**
   - Every medical fact must be clinically accurate
   - Follow current clinical guidelines and best practices
   - Verify dosages, timelines, procedural details
   - Cite evidence level when discussing treatment effectiveness
   - Use appropriate medical terminology with immediate definitions

2. **100% ${projectSpec.language} Language - ZERO contamination**

3. **Patient-Friendly Language Translation:**
   - Write as a caring healthcare provider explaining to a patient
   - Reading level: ${medicalResearchData.healthLiteracyLevel || 'Grade 6-8'}
   - Replace medical jargon with plain language UNLESS defining the term
   - Use analogies for complex medical concepts
   - Example: "Osseointegration (the process where your jawbone grows around the implant and bonds with it permanently)"

4. **Empathy & Reassurance for Patient Concerns:**
   - Acknowledge patient anxiety: "It's completely natural to feel concerned about..."
   - Provide realistic expectations: "Most patients report..."
   - Emphasize support: "Your healthcare team will guide you through every step..."
   - Balance honesty with reassurance (don't minimize real risks, but contextualize)

5. **Natural Conversational Medical Flow:**
   - Guide patients through understanding progressively: What → Why → How → What to Expect
   - Use transitions: "Here's what happens next...", "Now let's talk about what you can expect..."
   - Bridge medical concepts to daily life: "Think of it like..." analogies
   - Address "elephant in the room" concerns early (pain, cost, risks)

6. **Medical Term Handling Protocol:**
   - **First Mention:** Bold term + immediate definition
     Example: **Osseointegration** (the process where implant bonds with jawbone)
   - **Subsequent Mentions:** Use plain language term only
     Example: "During the bonding process..." (NOT "during osseointegration...")
   - **Complex Terms:** Consider glossary box if 10+ terms

**Approved Medical Outline:**
${JSON.stringify(outlineData.outline, null, 2)}

**Patient Psychographic Mapping:**
${JSON.stringify(outlineData.patientPsychographicMapping, null, 2)}

**Medical Research for Accuracy:**
${JSON.stringify(medicalResearchData.medicalResearch, null, 2)}

**EXAMPLES OF CORRECT MEDICAL WRITING:**

❌ INCORRECT (Too Clinical, Intimidating):
"The surgical placement involves incising the gingival tissue, creating an osteotomy in the alveolar bone, and inserting a titanium fixture which will undergo osseointegration over 3-6 months."

✅ CORRECT (Accurate + Patient-Friendly):
"During the procedure, your dentist will make a small opening in your gum and carefully create space in your jawbone for the implant. Think of it like planting a post in the ground—the titanium implant is placed into your jawbone, where it will gradually bond with the bone over the next 3-6 months. This bonding process, called **osseointegration**, is what makes dental implants so stable and long-lasting."

❌ INCORRECT (Minimizes Real Risks):
"The procedure is completely painless and there are no risks."

✅ CORRECT (Honest + Reassuring):
"While some discomfort is normal after the procedure, most patients find it very manageable with over-the-counter pain medication. You'll receive detailed aftercare instructions, and we'll monitor your healing closely. Serious complications are rare (less than 5% of cases), but we'll discuss all potential risks during your consultation so you can make an informed decision."

**SENTENCE VARIETY FOR NATURAL FLOW:**
- Short (3-6 words): "Here's what to expect."
- Medium (15-25 words): "Most patients return to normal activities within a few days, though complete healing takes several months."
- Long (25+ words): "During your consultation, your dentist will evaluate your overall oral health, take detailed imaging of your jaw, and discuss whether dental implants are the right choice for your specific situation."

**CONTENT ARCHITECTURE (MANDATORY):**
- 40% short paragraphs (1-2 sentences)
- 40% medium paragraphs (3-5 sentences)
- 20% long paragraphs (6+ sentences)
- Maximum 16-20 bulleted lists TOTAL (use for symptoms, post-care steps, warning signs ONLY)
- Bold text ONLY for medical terms at FIRST definition + critical warnings
- NO formulaic bold text at paragraph starts

**PATIENT CONCERN ADDRESSING:**
Address these naturally in flowing text:
${JSON.stringify(medicalResearchData.patientPsychographics?.primaryConcerns || [], null, 2)}

Write complete medical article that patients can understand, trust, and use to make informed healthcare decisions.`;
  }

  buildMedicalValidationPrompt(projectSpec, contentData, outlineData, medicalResearchData) {
    return `Validate medical content with STRICT medical accuracy, HIPAA compliance, and patient safety enforcement (ALL 100% required).

**Content to Validate:**
${JSON.stringify(contentData.content, null, 2)}

**Medical Research (Ground Truth for Fact-Checking):**
${JSON.stringify(medicalResearchData.medicalResearch, null, 2)}

**Outline Requirements:**
${JSON.stringify(outlineData.outline, null, 2)}

**Disclaimer Requirements:**
${JSON.stringify(outlineData.disclaimerRequirements, null, 2)}

**MANDATORY VALIDATION CHECKS (BLOCKING GATES):**

**1. Medical Accuracy Validation (BLOCKING - Must be 100%):**

   Verify EVERY medical fact against clinical guidelines:

   - **Procedure/Condition Description Accuracy:**
     Clinically accurate? [YES/NO]
     If NO, specify inaccuracies:

   - **Timeline Accuracy (Recovery, Treatment Duration):**
     Matches clinical data? [YES/NO]
     If NO, correct timeline:

   - **Risk & Complication Communication:**
     All significant risks mentioned? [YES/NO]
     Risk percentages accurate? [YES/NO]
     If NO, missing risks:

   - **Contraindications Completeness:**
     Who should NOT undergo procedure mentioned? [YES/NO]
     If NO, missing contraindications:

   - **Dosage/Medication Accuracy (if applicable):**
     Dosages correct? [YES/NO]
     Drug interactions mentioned? [YES/NO]

   - **Anatomical Accuracy:**
     Anatomical descriptions correct? [YES/NO]
     If NO, corrections needed:

   - **Outcome Claims Evidence:**
     Success rates accurate? [YES/NO]
     Evidence level noted for claims? [YES/NO]
     Realistic expectations set? [YES/NO]

   - **Medical Terminology Definitions:**
     All medical terms defined accurately? [YES/NO]
     Definitions patient-friendly? [YES/NO]

   **Report:**
   - medicalAccuracy: [0-100 percentage]
   - medicalAccuracyIssues: [Detailed list of any inaccuracies]

**2. HIPAA Compliance Validation (BLOCKING - Must be 100%):**

   Scan for ANY Protected Health Information (PHI):

   - **Patient Identifiers:** NO names, dates of birth, addresses, phone numbers, SSN
   - **Case Studies with PHI:** NO identifiable patient examples
   - **Photos with Identifiable Features:** NO faces or identifying characteristics
   - **Specific Dates:** NO specific treatment dates for identifiable patients
   - **Facility-Specific Info:** NO location-specific patient information

   **HIPAA Notices:**
   - Appropriate HIPAA privacy notice if collecting patient info? [YES/NO]
   - Privacy policy linked if applicable? [YES/NO]

   **Report:**
   - hipaaCompliance: [0-100 percentage]
   - hipaaViolations: [Detailed list of any PHI found or violations]

**3. Patient Safety Validation (BLOCKING - Must be 100%):**

   - **Risk Disclosure Completeness:**
     All significant risks disclosed? [YES/NO]
     Risk severity appropriate? [YES/NO]

   - **Contraindications Present:**
     Who should NOT undergo procedure clearly stated? [YES/NO]

   - **Consultation Advice:**
     Content clearly advises consulting healthcare provider? [YES/NO]

   - **"Not Medical Advice" Disclaimer:**
     Clear statement that content is educational, not medical advice? [YES/NO]

   - **Emergency Guidance (if applicable):**
     When to seek immediate medical help specified? [YES/NO]

   - **Realistic Outcome Expectations:**
     Outcomes presented realistically, not guaranteed? [YES/NO]
     Individual variation acknowledged? [YES/NO]

   **Report:**
   - patientSafety: [0-100 percentage]
   - patientSafetyIssues: [Detailed list of any safety concerns]

**4. Disclaimer Completeness (BLOCKING - Must be 100%):**

   Check for required disclaimers:
   - ☐ Medical Advice Disclaimer ("This is for educational purposes, not medical advice")
   - ☐ Consult Provider Advice ("Always consult your healthcare provider")
   - ☐ Individual Results Vary (if outcome claims made)
   - ☐ HIPAA Notice (if PHI collection relevant)
   - ☐ Regional Compliance (GDPR for EU, local healthcare advertising laws)
   - ☐ Last Reviewed Date
   - ☐ Medical Reviewer Credentials (if applicable)

   **Report:**
   - disclaimerCompleteness: [0-100 percentage]
   - missingDisclaimers: [List of missing required disclaimers]

**5. Patient Comprehension Assessment:**

   - **Reading Level:**
     Grade level: [Flesch-Kincaid score]
     Target level: ${medicalResearchData.healthLiteracyLevel || 'Grade 6-8'}
     Appropriate? [YES/NO]

   - **Medical Terms Explained:**
     All medical jargon defined? [YES/NO]
     Definitions patient-friendly? [YES/NO]

   - **Analogies Effective:**
     Complex concepts explained with analogies? [YES/NO]

   - **Empathy & Reassurance:**
     Patient concerns acknowledged? [YES/NO]
     Empathetic tone maintained? [YES/NO]

   **Report:**
   - patientComprehensionScore: [0-100]
   - readabilityLevel: [Grade level]

**6. Content Architecture Compliance:**

   - **Paragraph Distribution:**
     Count: Short ___ / Medium ___ / Long ___
     Target: 40% short / 40% medium / 20% long
     Compliant? [YES/NO]

   - **Bulleted Lists:** Total count: ___
     Limit: 16-20
     Compliant? [YES/NO]

   - **Tables:** Total count: ___
     Limit: 6-8
     Appropriate? [YES/NO]

   - **Bold Text Usage:**
     Count: ___
     Used only for medical terms + warnings? [YES/NO]

   **Report:**
   - contentArchitectureCompliance: [0-100]

**BLOCKING GATE ENFORCEMENT:**

If ANY of these < 100%, validation FAILS:
- medicalAccuracy < 100%
- hipaaCompliance < 100%
- patientSafety < 100%
- disclaimerCompleteness < 100%

Provide comprehensive validation report with ALL metrics and detailed issue identification.`;
  }

  buildHealthcareSEOPrompt(projectSpec, contentData, validationData, medicalResearchData, relatedContent) {
    return `Optimize medical content for healthcare SEO (YMYL - Your Money Your Life) and integrate required medical disclaimers.

**IMPORTANT: Healthcare content is YMYL content - Google applies STRICTER quality standards.**

**Content:**
${JSON.stringify(contentData.content, null, 2)}

**Validation Metrics:**
${JSON.stringify(validationData, null, 2)}

**Medical Topic:** ${projectSpec.medicalTopic}
**Content Type:** ${projectSpec.contentType}
**Language:** ${projectSpec.language}

**Related Medical Content (for internal linking):**
${relatedContent ? JSON.stringify(relatedContent, null, 2) : 'No related content available'}

**Required Healthcare SEO Optimization:**

**1. E-A-T Signal Optimization (Expertise, Authoritativeness, Trustworthiness):**

   These signals are CRITICAL for YMYL medical content:

   a) **Expertise Signals:**
      - Author byline: "Dr. [Name], [Credentials]" OR "Medically reviewed by..."
      - Author bio with medical credentials and specialization
      - Medical organization affiliation
      - Years of experience in specialty

   b) **Authoritativeness Signals:**
      - Medical citations and references to clinical guidelines
      - Links to peer-reviewed studies (PubMed, medical journals)
      - Cite authoritative sources: ADA, AMA, CDC, WHO, specialty organizations
      - Reference specific clinical guidelines by name

   c) **Trustworthiness Signals:**
      - Clear, prominent medical disclaimers
      - Privacy policy links
      - Contact information for healthcare provider/organization
      - Patient testimonials with consent (HIPAA-compliant)
      - Last reviewed date clearly visible
      - Transparent about limitations and when to see provider

**2. Medical Schema Markup (MedicalWebPage + MedicalProcedure):**

   Create JSON-LD schema markup including:
   - @type: "MedicalWebPage"
   - about: { @type: "MedicalProcedure", name, procedureType, bodyLocation }
   - medicalAudience: { @type: "MedicalAudience", audienceType: "Patient" }
   - lastReviewed: [Date]
   - reviewedBy: { @type: "Person", name, jobTitle, memberOf }

   Full schema example required for implementation.

**3. Medical Keyword Optimization:**

   - **Primary Medical Keyword:** [From projectSpec]
   - **Supporting Medical Keywords:** [Related procedures, symptoms, treatments]
   - **Patient Language Keywords:** [How patients actually search]
   - **Keyword Density:** 1-2% for primary (natural, not forced)
   - **LSI Medical Keywords:** [Semantically related medical terms]

   Balance: Medical terminology + patient-friendly search terms

**4. Internal Linking for Medical Content Clusters:**

   Identify 5-8 internal linking opportunities:
   - Related procedures: [Link to complementary treatments]
   - Pre-procedure content: [Preparation guides]
   - Post-procedure content: [Aftercare instructions]
   - Cost information: [Pricing guides]
   - Alternative treatments: [Comparison content]

   For each link:
   - Natural anchor text (patient-friendly language)
   - Placement within content flow
   - Relevance to patient journey (before/during/after decision)

**5. Medical Disclaimer Integration:**

   Integrate these disclaimers naturally into content:

   **Standard Medical Disclaimer Template:**
   📋 Medical Disclaimer

   This information is for educational purposes only and is not intended as medical advice, diagnosis, or treatment. The content provided describes general aspects of [procedure/condition] and may not apply to your specific situation.

   Always consult with a qualified healthcare provider for:
   • Personalized medical advice
   • Diagnosis of your condition
   • Treatment recommendations
   • Questions about your health

   Individual results may vary. The outcomes described represent typical experiences but are not guaranteed.

   If you experience a medical emergency, call emergency services immediately.

   Last reviewed: [Date]
   Medically reviewed by: [Dr. Name, Credentials]

   **Disclaimer Placement:**
   - Primary disclaimer: After introduction, before main content
   - Short disclaimer: In footer
   - Outcome claims: "Individual results vary" near any claims

**6. Meta Data Optimization (Medical SEO):**

   Create:
   - **SEO Title** (55-60 characters):
     Include: Primary keyword + patient benefit + year/credibility signal
     Example: "Dental Implant Procedure: Complete Patient Guide [2025]"

   - **Meta Description** (150-160 characters):
     Include: Primary keyword + patient value + CTA
     Example: "Understand the dental implant procedure, recovery, costs, and what to expect. Medically reviewed guide for patients considering tooth replacement."

   - **Focus Keyphrase:** [Primary medical keyword]
   - **SEO Slug:** [URL-friendly version]

**7. Medical Citations & References:**

   Add citations where appropriate:
   - Clinical guideline references: "(According to ADA guidelines...)"
   - Success rate sources: "(Studies show 95-98% success rates over 10 years)"
   - Evidence-based claims: "(Research published in [Journal]...)"

   Link to authoritative sources where possible (PubMed, medical associations).

**8. Content Structure SEO:**

   - **H1 Optimization:** Primary keyword + patient-friendly language
   - **H2 Optimization:** Supporting keywords + question format
   - **H3 Optimization:** Long-tail medical keywords
   - **Image Alt Text:** Descriptive medical + accessibility
   - **Lists & Tables:** Optimized for featured snippets (procedure steps, comparison, timeline)

**9. Medical SEO Score Calculation:**

   Evaluate:
   - E-A-T signals: [Score 0-100]
   - Medical keyword optimization: [Score 0-100]
   - Schema markup completeness: [Score 0-100]
   - Internal linking quality: [Score 0-100]
   - Disclaimer integration: [Score 0-100]
   - Medical citations: [Score 0-100]

   **Overall Medical SEO Score:** [0-100]

**10. YMYL Quality Checklist:**

    ☐ Medical expert author/reviewer identified
    ☐ Author credentials clearly stated
    ☐ Medical citations and references included
    ☐ Clear, prominent medical disclaimers
    ☐ Last reviewed date visible
    ☐ Privacy policy linked
    ☐ Contact information for provider
    ☐ Realistic expectations set (no guarantees)
    ☐ Emergency guidance if applicable
    ☐ Evidence-based information only

Provide complete healthcare SEO optimization with medical disclaimers integrated and YMYL compliance verified.`;
  }

  buildMemoryPublishingPrompt(projectSpec, seoData, stageResults) {
    return `Prepare medical content for publishing and create medical knowledge graph integration.

**Optimized Medical Content:**
${JSON.stringify(seoData.optimizedContent, null, 2)}

**Pipeline Results:**
${JSON.stringify(stageResults, null, 2)}

**Required Publishing Preparation:**

1. **CMS-Ready Medical Content Package:**
   - Formatted HTML content with medical styling
   - Medical schema markup integrated
   - Meta data package (title, description, keywords)
   - Internal linking implementation
   - Medical disclaimer placement
   - Image recommendations with alt text
   - Author/reviewer credentials box

2. **Medical Knowledge Graph Entities:**
   - Content entity details: [Topic, type, language]
   - Patient psychographic relations: [Segments targeted]
   - Related procedure relations: [Connected medical content]
   - Medical SEO entity connections: [Keywords, topics]
   - Clinical guideline references: [Sources cited]

3. **Publishing Checklist for Medical Content:**
   ☐ Medical accuracy verified (100%)
   ☐ HIPAA compliance verified (100%)
   ☐ Patient safety verified (100%)
   ☐ All disclaimers present and placed
   ☐ Medical schema markup validated
   ☐ E-A-T signals complete
   ☐ Internal links functional
   ☐ Meta data optimized
   ☐ Author credentials displayed
   ☐ Last reviewed date visible
   ☐ Emergency contact info if applicable

4. **Performance Tracking Setup (Healthcare Metrics):**
   - **SEO Tracking:**
     - Medical keyword rankings
     - Featured snippet opportunities
     - Local search visibility (if applicable)

   - **Engagement Metrics:**
     - Patient comprehension tracking
     - Time on page (indicates content clarity)
     - Scroll depth (content completion)

   - **Conversion Tracking:**
     - Consultation request forms
     - Phone call tracking
     - Appointment bookings

   - **Quality Metrics:**
     - Medical content update schedule
     - Fact-check review dates
     - Patient feedback collection

5. **Medical Content Maintenance Schedule:**
   - **Monthly:** Review patient questions/feedback
   - **Quarterly:** Update statistics, costs, timelines
   - **Annually:** Full medical fact review
   - **As Needed:** Clinical guideline updates, new research

Provide complete CMS-ready publishing package with medical knowledge graph integration and performance tracking setup.`;
  }

  /**
   * Deliverable Savers
   */
  async saveMedicalResearchDeliverables(execution, medicalResearchResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/research/medical'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const researchFile = path.join(deliverablePath, `${projectSpec.medicalTopic}-medical-research.json`);
    await fs.writeFile(
      researchFile,
      JSON.stringify(medicalResearchResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Medical research saved: ${researchFile}`);
    return deliverablePath;
  }

  async saveOutlineDeliverables(execution, outlineResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/outlines/medical'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const outlineFile = path.join(deliverablePath, `${projectSpec.medicalTopic}-medical-outline.json`);
    await fs.writeFile(
      outlineFile,
      JSON.stringify(outlineResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Medical outline saved: ${outlineFile}`);
    return deliverablePath;
  }

  async saveContentDeliverables(execution, contentResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/articles/medical'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const contentFile = path.join(deliverablePath, `${projectSpec.medicalTopic}-medical-article.json`);
    await fs.writeFile(
      contentFile,
      JSON.stringify(contentResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Medical content saved: ${contentFile}`);
    return deliverablePath;
  }

  async saveValidationDeliverables(execution, validationResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/quality-reports/medical'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const validationFile = path.join(deliverablePath, `${projectSpec.medicalTopic}-medical-validation.json`);
    await fs.writeFile(
      validationFile,
      JSON.stringify(validationResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Medical validation report saved: ${validationFile}`);
    return deliverablePath;
  }

  async saveHealthcareSEODeliverables(execution, seoResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/seo/medical-content'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const seoFile = path.join(deliverablePath, `${projectSpec.medicalTopic}-healthcare-seo.json`);
    await fs.writeFile(
      seoFile,
      JSON.stringify(seoResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Healthcare SEO saved: ${seoFile}`);
    return deliverablePath;
  }

  async savePublishingDeliverables(execution, publishingResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/publishing/medical'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const publishingFile = path.join(deliverablePath, `${projectSpec.medicalTopic}-medical-publishing.json`);
    await fs.writeFile(
      publishingFile,
      JSON.stringify(publishingResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Medical publishing package saved: ${publishingFile}`);
    return deliverablePath;
  }

  /**
   * Get pipeline metadata
   */
  getMetadata() {
    return {
      pipelineId: this.pipelineId,
      pipelineName: this.pipelineName,
      version: this.version,
      stages: this.stages,
      estimatedDuration: 85, // minutes (~1.4 hours)
      requiredAgents: this.requiredAgents,
      qualityGates: [
        'outline_approval',
        'medical_accuracy_100',
        'hipaa_compliance_100',
        'patient_safety_100',
        'disclaimer_completeness_100'
      ],
      blockingGates: [
        {
          gate: 'medical_accuracy',
          threshold: 100,
          severity: 'CRITICAL',
          description: 'Medical facts must be 100% clinically accurate'
        },
        {
          gate: 'hipaa_compliance',
          threshold: 100,
          severity: 'CRITICAL',
          description: 'Zero tolerance for HIPAA violations'
        },
        {
          gate: 'patient_safety',
          threshold: 100,
          severity: 'CRITICAL',
          description: 'Patient safety communications must be complete'
        },
        {
          gate: 'disclaimer_completeness',
          threshold: 100,
          severity: 'HIGH',
          description: 'All required medical disclaimers must be present'
        }
      ]
    };
  }
}

module.exports = HealthcareContentPipeline;
