/**
 * ORCHESTRAI Healthcare Content Pipeline Integration Tests
 *
 * Tests the complete 6-stage healthcare content creation workflow:
 * Stage 1: Medical Research & Patient Psychographics
 * Stage 2: Outline Creation (Medical Structure) + CHECKPOINT
 * Stage 3: Content Writing (Patient-Friendly Medical)
 * Stage 4: Medical Accuracy & Compliance Validation + BLOCKING GATES
 * Stage 5: Healthcare SEO & Disclaimer Integration
 * Stage 6: Memory Integration & Publishing
 *
 * CRITICAL TESTING AREAS:
 * - Medical accuracy validation (100% required)
 * - HIPAA compliance enforcement (100% required)
 * - Patient safety verification (100% required)
 * - BLOCKING GATE enforcement (pipeline must stop on failures)
 * - Multi-language medical translation accuracy
 * - Health literacy optimization (Grade 6-8 targeting)
 */

const HealthcareContentPipeline = require('../orchestrai-domains/healthcare-content/pipelines/healthcare-content-pipeline');
const CoordinationPatterns = require('../orchestrai-shared/orchestration/coordination-patterns');
const DynamicAgentSelection = require('../orchestrai-shared/orchestration/dynamic-agent-selection');
const CrystallineMemory = require('../orchestrai-shared/memory/advanced-crystalline-memory');
const Redis = require('ioredis');

// Mock implementations for testing
class MockCoordinationPatterns {
  constructor() {
    this.executedTasks = [];
  }

  async executeTask(taskConfig) {
    this.executedTasks.push(taskConfig);

    // Return mock data based on task type
    if (taskConfig.taskId.includes('medical-research')) {
      return this.mockMedicalResearchResult();
    } else if (taskConfig.taskId.includes('outline')) {
      return this.mockOutlineResult();
    } else if (taskConfig.taskId.includes('content-writing')) {
      return this.mockContentWritingResult();
    } else if (taskConfig.taskId.includes('validation')) {
      return this.mockValidationResult();
    } else if (taskConfig.taskId.includes('seo')) {
      return this.mockSEOResult();
    } else if (taskConfig.taskId.includes('publishing')) {
      return this.mockPublishingResult();
    }
  }

  mockMedicalResearchResult() {
    return {
      medicalResearch: {
        clinicalDefinition: "Dental implant is a surgical procedure where a titanium post is placed into the jawbone...",
        procedureSteps: [
          {
            step: 1,
            name: "Initial Consultation and Imaging",
            duration: "1-2 hours",
            description: "Clinical assessment, X-rays, treatment planning"
          },
          {
            step: 2,
            name: "Implant Placement Surgery",
            duration: "1-2 hours per implant",
            description: "Surgical placement of titanium post into jawbone"
          },
          {
            step: 3,
            name: "Osseointegration Healing",
            duration: "3-6 months",
            description: "Bone grows around and bonds with implant"
          },
          {
            step: 4,
            name: "Abutment Placement",
            duration: "30-60 minutes",
            description: "Connector piece attached to implant"
          },
          {
            step: 5,
            name: "Crown Placement",
            duration: "1-2 weeks after abutment",
            description: "Final restoration attached"
          }
        ],
        timeline: {
          initialHealing: "7-14 days",
          osseointegration: "3-6 months",
          crownPlacement: "1-2 weeks after integration",
          totalProcess: "4-8 months"
        },
        successRates: {
          shortTerm: "98% (5 years)",
          longTerm: "95% (10+ years)",
          evidenceLevel: "A",
          source: "ADA Clinical Guidelines 2024"
        },
        risks: [
          {
            risk: "Infection",
            incidence: "1-5%",
            severity: "Moderate",
            management: "Antibiotics, possible removal"
          },
          {
            risk: "Nerve damage",
            incidence: "<1%",
            severity: "Rare but serious",
            management: "May be permanent, requires specialist evaluation"
          },
          {
            risk: "Implant failure",
            incidence: "2-5%",
            severity: "Moderate",
            management: "Removal and replacement possible"
          }
        ],
        contraindications: [
          "Uncontrolled diabetes",
          "Active periodontal disease",
          "Heavy smoking (relative contraindication)",
          "Insufficient bone density without grafting",
          "Recent radiation therapy to jaw area",
          "Certain medications (bisphosphonates)"
        ],
        medicalTerminology: [
          {
            term: "Osseointegration",
            definition: "Process where jawbone grows around and bonds with implant",
            patientFriendly: "The bonding process between bone and implant"
          },
          {
            term: "Abutment",
            definition: "Connector piece between implant and crown",
            patientFriendly: "The connector that holds the crown to the implant"
          }
        ]
      },
      patientPsychographics: {
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
              "Will it hurt?",
              "How long is recovery?",
              "What happens during the procedure?",
              "Can I eat normally after?"
            ],
            emotionalState: {
              primaryEmotion: "Anxiety/Fear",
              secondaryEmotion: "Hope for solution",
              trustNeeds: "Reassurance, transparency, empathy"
            }
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
              "Is it worth it vs. alternatives?",
              "Insurance coverage?",
              "How long will it last?"
            ],
            emotionalState: {
              primaryEmotion: "Practical/Analytical",
              secondaryEmotion: "Skepticism about value",
              trustNeeds: "ROI justification, transparent pricing, comparisons"
            }
          }
        ]
      }
    };
  }

  mockOutlineResult() {
    return {
      outline: {
        title: "Dental Implant Procedure: Complete Patient Guide",
        targetWordCount: 2500,
        readingLevel: "Grade 7-8",
        psychographicTargeting: "45% Anxious, 30% Cost-Conscious, 25% Health-Literate",
        sections: [
          {
            h2: "What Are Dental Implants?",
            wordCount: 250,
            psychographicFocus: "All segments",
            contentRequirements: [
              "Simple definition with analogy",
              "Visual description",
              "Patient-friendly explanation of how they work"
            ]
          },
          {
            h2: "The Dental Implant Procedure: Step by Step",
            wordCount: 400,
            psychographicFocus: "Anxious Pre-Procedure (45%)",
            contentRequirements: [
              "Detailed procedure steps",
              "What to expect at each stage",
              "Timeline clarity",
              "Pain management information"
            ]
          },
          {
            h2: "Recovery and Healing Timeline",
            wordCount: 300,
            psychographicFocus: "Anxious Pre-Procedure (45%)",
            contentRequirements: [
              "Realistic recovery expectations",
              "Day-by-day healing guide",
              "Activity restrictions",
              "When to contact doctor"
            ]
          },
          {
            h2: "Dental Implant Costs and Financing",
            wordCount: 350,
            psychographicFocus: "Cost-Conscious (30%)",
            contentRequirements: [
              "Transparent pricing breakdown",
              "Insurance coverage explanation",
              "Financing options",
              "Long-term value vs. alternatives"
            ]
          },
          {
            h2: "Success Rates and Long-Term Outcomes",
            wordCount: 250,
            psychographicFocus: "Health-Literate Researcher (25%)",
            contentRequirements: [
              "Evidence-based success rates",
              "Clinical study citations",
              "Factors affecting success",
              "Long-term maintenance"
            ]
          },
          {
            h2: "Risks and Potential Complications",
            wordCount: 300,
            psychographicFocus: "All segments",
            contentRequirements: [
              "Complete risk disclosure",
              "Incidence percentages",
              "Management strategies",
              "When risks are higher"
            ]
          }
        ]
      },
      approved: false // Requires checkpoint approval
    };
  }

  mockContentWritingResult() {
    return {
      content: {
        title: "Dental Implant Procedure: Complete Patient Guide",
        wordCount: 2487,
        readabilityScore: {
          fleschReadingEase: 65.2,
          fleschKincaidGrade: 7.8,
          targetMet: true
        },
        sections: [
          {
            h2: "What Are Dental Implants?",
            content: "Think of a dental implant as an artificial tooth root that provides a permanent foundation for a replacement tooth. Unlike dentures that can slip or bridges that rely on neighboring teeth, a dental implant stands independently—just like your natural tooth did...",
            wordCount: 248
          }
          // ... other sections
        ],
        keywordsIntegrated: {
          primary: ["dental implant", "dental implant procedure", "tooth replacement"],
          secondary: ["osseointegration", "implant surgery", "dental restoration"]
        },
        internalLinksPlanned: [
          { anchor: "bone grafting procedures", url: "/bone-grafting-guide" },
          { anchor: "compare implants vs bridges", url: "/implants-vs-bridges" }
        ]
      }
    };
  }

  mockValidationResult(passValidation = true) {
    if (passValidation) {
      return {
        medicalAccuracy: 100,
        hipaaCompliance: 100,
        patientSafety: 100,
        validationDetails: {
          successRateAccuracy: "✅ 95-98% matches ADA guidelines, evidence level cited",
          timelineAccuracy: "✅ 3-6 months correct for osseointegration",
          terminologyAccuracy: "✅ Osseointegration correctly defined",
          riskCommunication: "✅ All major risks with accurate incidence",
          contraindications: "✅ Key contraindications mentioned",
          phiDetection: "✅ No PHI detected",
          disclaimerCompliance: "✅ Medical advice disclaimer present"
        }
      };
    } else {
      return {
        medicalAccuracy: 85,
        hipaaCompliance: 100,
        patientSafety: 90,
        blockingIssues: [
          {
            category: "Timeline Accuracy",
            severity: "CRITICAL",
            issue: "Recovery timeline stated as '2-4 weeks' but clinical guidelines show '3-6 months for osseointegration'",
            clinicalEvidence: "ADA Clinical Practice Guidelines 2024, Page 47",
            requiredCorrection: "Change to '3-6 months' to match clinical evidence",
            cannotProceed: true
          }
        ]
      };
    }
  }

  mockSEOResult() {
    return {
      seoOptimization: {
        metaTitle: "Dental Implant Procedure: Complete Guide [2025] - Dr. Smith DDS",
        metaDescription: "Understand the dental implant procedure, recovery timeline, costs, and success rates. Medically reviewed guide for patients considering tooth replacement. Learn more →",
        schemaMarkup: {
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          "name": "Dental Implant Procedure: Complete Patient Guide"
        },
        eatSignals: {
          expertise: "✅ Author credentials displayed",
          authoritativeness: "✅ ADA guidelines cited",
          trustworthiness: "✅ Medical disclaimers present"
        }
      }
    };
  }

  mockPublishingResult() {
    return {
      published: true,
      deliverablePath: "/projects/test-project/deliverables/healthcare/dental-implant-guide.md",
      memoryEntities: ["dental-implants", "implant-procedure", "patient-education"]
    };
  }
}

class MockDynamicAgentSelection {
  async selectAgentForTask(taskConfig) {
    return {
      agentId: `mock-agent-${taskConfig.agentType}`,
      agentType: taskConfig.agentType,
      capabilities: taskConfig.capabilities
    };
  }
}

class MockCrystallineMemory {
  constructor() {
    this.entities = new Map();
    this.relations = [];
  }

  async createEntity(entityData) {
    const entityId = `entity-${Date.now()}-${Math.random()}`;
    this.entities.set(entityId, entityData);
    return { entityId, ...entityData };
  }

  async createRelation(relationData) {
    this.relations.push(relationData);
    return relationData;
  }

  async getEntity(entityId) {
    return this.entities.get(entityId);
  }
}

class MockRedis {
  constructor() {
    this.data = new Map();
  }

  async set(key, value) {
    this.data.set(key, value);
  }

  async get(key) {
    return this.data.get(key);
  }

  async setex(key, seconds, value) {
    this.data.set(key, value);
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Healthcare Content Pipeline Integration Tests', () => {
  let pipeline;
  let mockCoordination;
  let mockAgentSelection;
  let mockMemory;
  let mockRedis;

  beforeEach(() => {
    mockCoordination = new MockCoordinationPatterns();
    mockAgentSelection = new MockDynamicAgentSelection();
    mockMemory = new MockCrystallineMemory();
    mockRedis = new MockRedis();

    pipeline = new HealthcareContentPipeline(
      mockCoordination,
      mockAgentSelection,
      mockMemory,
      mockRedis
    );
  });

  // ========================================================================
  // STAGE 1: Medical Research & Patient Psychographics
  // ========================================================================

  describe('Stage 1: Medical Research & Patient Psychographics', () => {
    test('should execute medical research with healthcare content specialist', async () => {
      const projectSpec = {
        medicalTopic: "Dental Implant Procedure",
        targetLanguage: "English",
        targetAudience: "Adults 35-65 considering tooth replacement",
        contentType: "Patient Education (Pre-procedure Information)"
      };

      const execution = {
        executionId: 'test-execution-001',
        projectUUID: 'test-project-uuid',
        deliverablePath: '/projects/test-project/deliverables/healthcare/'
      };

      const result = await pipeline.executeMedicalResearch(execution, projectSpec);

      expect(result).toHaveProperty('medicalResearch');
      expect(result).toHaveProperty('patientPsychographics');
      expect(result.medicalResearch).toHaveProperty('clinicalDefinition');
      expect(result.medicalResearch).toHaveProperty('successRates');
      expect(result.medicalResearch.successRates.evidenceLevel).toBe('A');
      expect(result.patientPsychographics.segments).toHaveLength(2);
    });

    test('should identify patient segments with health literacy levels', async () => {
      const projectSpec = {
        medicalTopic: "Dental Implant Procedure",
        targetLanguage: "English"
      };

      const execution = { executionId: 'test-002', projectUUID: 'test-uuid' };
      const result = await pipeline.executeMedicalResearch(execution, projectSpec);

      const anxiousSegment = result.patientPsychographics.segments.find(
        s => s.name === "Anxious Pre-Procedure Patient"
      );

      expect(anxiousSegment).toBeDefined();
      expect(anxiousSegment.demographics.healthLiteracy).toBe("Medium (Grade 7-8)");
      expect(anxiousSegment.percentage).toBe(45);
      expect(anxiousSegment.emotionalState.primaryEmotion).toBe("Anxiety/Fear");
    });

    test('should identify medical terminology requiring patient-friendly translation', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const execution = { executionId: 'test-003' };
      const result = await pipeline.executeMedicalResearch(execution, projectSpec);

      expect(result.medicalResearch.medicalTerminology).toContainEqual(
        expect.objectContaining({
          term: "Osseointegration",
          patientFriendly: "The bonding process between bone and implant"
        })
      );
    });

    test('should identify all contraindications', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const execution = { executionId: 'test-004' };
      const result = await pipeline.executeMedicalResearch(execution, projectSpec);

      expect(result.medicalResearch.contraindications).toContain("Uncontrolled diabetes");
      expect(result.medicalResearch.contraindications).toContain("Active periodontal disease");
      expect(result.medicalResearch.contraindications.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ========================================================================
  // STAGE 2: Outline Creation + Checkpoint
  // ========================================================================

  describe('Stage 2: Outline Creation with Checkpoint', () => {
    test('should create comprehensive outline with psychographic targeting', async () => {
      const projectSpec = {
        medicalTopic: "Dental Implant Procedure",
        targetWordCount: 2500
      };

      const medicalResearch = mockCoordination.mockMedicalResearchResult();
      const execution = { executionId: 'test-005', projectUUID: 'test-uuid' };

      const result = await pipeline.executeOutlineCreation(
        execution,
        projectSpec,
        medicalResearch
      );

      expect(result.outline).toHaveProperty('title');
      expect(result.outline).toHaveProperty('sections');
      expect(result.outline.targetWordCount).toBe(2500);
      expect(result.outline.readingLevel).toBe("Grade 7-8");
    });

    test('should map sections to psychographic segments', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const medicalResearch = mockCoordination.mockMedicalResearchResult();
      const execution = { executionId: 'test-006' };

      const result = await pipeline.executeOutlineCreation(
        execution,
        projectSpec,
        medicalResearch
      );

      const procedureSection = result.outline.sections.find(
        s => s.h2 === "The Dental Implant Procedure: Step by Step"
      );

      expect(procedureSection).toBeDefined();
      expect(procedureSection.psychographicFocus).toBe("Anxious Pre-Procedure (45%)");
      expect(procedureSection.wordCount).toBeGreaterThan(0);
    });

    test('should require checkpoint approval before proceeding', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const medicalResearch = mockCoordination.mockMedicalResearchResult();
      const execution = { executionId: 'test-007' };

      const result = await pipeline.executeOutlineCreation(
        execution,
        projectSpec,
        medicalResearch
      );

      expect(result.approved).toBe(false); // Requires manual approval
    });
  });

  // ========================================================================
  // STAGE 3: Content Writing (Patient-Friendly Medical)
  // ========================================================================

  describe('Stage 3: Content Writing with Patient-Friendly Language', () => {
    test('should write content meeting readability targets', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const outline = mockCoordination.mockOutlineResult().outline;
      const execution = { executionId: 'test-008' };

      const result = await pipeline.executeContentWriting(
        execution,
        projectSpec,
        outline
      );

      expect(result.content.readabilityScore.fleschReadingEase).toBeGreaterThanOrEqual(60);
      expect(result.content.readabilityScore.fleschKincaidGrade).toBeLessThanOrEqual(8);
      expect(result.content.readabilityScore.targetMet).toBe(true);
    });

    test('should integrate primary and secondary keywords naturally', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const outline = mockCoordination.mockOutlineResult().outline;
      const execution = { executionId: 'test-009' };

      const result = await pipeline.executeContentWriting(
        execution,
        projectSpec,
        outline
      );

      expect(result.content.keywordsIntegrated.primary).toContain("dental implant");
      expect(result.content.keywordsIntegrated.primary).toContain("dental implant procedure");
      expect(result.content.keywordsIntegrated.secondary).toContain("osseointegration");
    });

    test('should plan internal linking architecture', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const outline = mockCoordination.mockOutlineResult().outline;
      const execution = { executionId: 'test-010' };

      const result = await pipeline.executeContentWriting(
        execution,
        projectSpec,
        outline
      );

      expect(result.content.internalLinksPlanned.length).toBeGreaterThan(0);
      expect(result.content.internalLinksPlanned).toContainEqual(
        expect.objectContaining({
          anchor: "bone grafting procedures",
          url: "/bone-grafting-guide"
        })
      );
    });
  });

  // ========================================================================
  // STAGE 4: Medical Accuracy & Compliance Validation (BLOCKING GATES)
  // ========================================================================

  describe('Stage 4: Medical Accuracy & HIPAA Compliance Validation', () => {
    test('should pass validation with 100% medical accuracy', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const content = mockCoordination.mockContentWritingResult().content;
      const execution = { executionId: 'test-011' };

      // Mock passing validation
      mockCoordination.mockValidationResult = () => ({
        medicalAccuracy: 100,
        hipaaCompliance: 100,
        patientSafety: 100,
        validationDetails: {
          successRateAccuracy: "✅ Accurate",
          timelineAccuracy: "✅ Accurate",
          riskCommunication: "✅ Complete"
        }
      });

      const result = await pipeline.executeValidation(
        execution,
        projectSpec,
        content
      );

      expect(result.medicalAccuracy).toBe(100);
      expect(result.hipaaCompliance).toBe(100);
      expect(result.patientSafety).toBe(100);
    });

    test('should BLOCK pipeline when medical accuracy < 100%', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const content = mockCoordination.mockContentWritingResult().content;
      const execution = { executionId: 'test-012' };

      // Mock failing validation
      mockCoordination.mockValidationResult = () => ({
        medicalAccuracy: 85, // BELOW THRESHOLD
        hipaaCompliance: 100,
        patientSafety: 100,
        blockingIssues: [
          {
            category: "Timeline Accuracy",
            severity: "CRITICAL",
            issue: "Recovery timeline inaccurate",
            cannotProceed: true
          }
        ]
      });

      await expect(
        pipeline.executeValidation(execution, projectSpec, content)
      ).rejects.toThrow(/Medical Accuracy/);
    });

    test('should BLOCK pipeline when HIPAA compliance < 100%', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const content = mockCoordination.mockContentWritingResult().content;
      const execution = { executionId: 'test-013' };

      // Mock HIPAA violation
      mockCoordination.mockValidationResult = () => ({
        medicalAccuracy: 100,
        hipaaCompliance: 0, // CRITICAL VIOLATION
        patientSafety: 100,
        blockingIssues: [
          {
            category: "HIPAA Compliance",
            severity: "CRITICAL",
            issue: "Patient name detected in content",
            phiElements: ["Name: John Smith"],
            cannotProceed: true
          }
        ]
      });

      await expect(
        pipeline.executeValidation(execution, projectSpec, content)
      ).rejects.toThrow(/HIPAA Compliance/);
    });

    test('should validate all risks mentioned with accurate incidence', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const content = mockCoordination.mockContentWritingResult().content;
      const execution = { executionId: 'test-014' };

      const result = await pipeline.executeValidation(
        execution,
        projectSpec,
        content
      );

      expect(result.validationDetails.riskCommunication).toContain("✅");
    });
  });

  // ========================================================================
  // STAGE 5: Healthcare SEO & Disclaimer Integration
  // ========================================================================

  describe('Stage 5: Healthcare SEO Optimization with YMYL Standards', () => {
    test('should implement E-A-T signals (Expertise, Authoritativeness, Trustworthiness)', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const validatedContent = mockCoordination.mockContentWritingResult().content;
      const execution = { executionId: 'test-015' };

      const result = await pipeline.executeSEOOptimization(
        execution,
        projectSpec,
        validatedContent
      );

      expect(result.seoOptimization.eatSignals.expertise).toContain("✅");
      expect(result.seoOptimization.eatSignals.authoritativeness).toContain("✅");
      expect(result.seoOptimization.eatSignals.trustworthiness).toContain("✅");
    });

    test('should generate medical schema markup', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const validatedContent = mockCoordination.mockContentWritingResult().content;
      const execution = { executionId: 'test-016' };

      const result = await pipeline.executeSEOOptimization(
        execution,
        projectSpec,
        validatedContent
      );

      expect(result.seoOptimization.schemaMarkup["@type"]).toBe("MedicalWebPage");
      expect(result.seoOptimization.schemaMarkup).toHaveProperty("name");
    });

    test('should optimize meta title for YMYL content', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const validatedContent = mockCoordination.mockContentWritingResult().content;
      const execution = { executionId: 'test-017' };

      const result = await pipeline.executeSEOOptimization(
        execution,
        projectSpec,
        validatedContent
      );

      const titleLength = result.seoOptimization.metaTitle.length;
      expect(titleLength).toBeGreaterThanOrEqual(40);
      expect(titleLength).toBeLessThanOrEqual(60);
      expect(result.seoOptimization.metaTitle).toContain("Dental Implant");
    });
  });

  // ========================================================================
  // STAGE 6: Memory Integration & Publishing
  // ========================================================================

  describe('Stage 6: Crystalline Memory Integration & Publishing', () => {
    test('should create memory entities for medical content', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const seoOptimizedContent = mockCoordination.mockSEOResult();
      const execution = { executionId: 'test-018', projectUUID: 'test-uuid' };

      const result = await pipeline.executePublishing(
        execution,
        projectSpec,
        seoOptimizedContent
      );

      expect(result.memoryEntities).toContain("dental-implants");
      expect(result.memoryEntities).toContain("patient-education");
    });

    test('should save deliverable to correct project path', async () => {
      const projectSpec = { medicalTopic: "Dental Implant Procedure" };
      const seoOptimizedContent = mockCoordination.mockSEOResult();
      const execution = {
        executionId: 'test-019',
        projectUUID: 'test-project-uuid',
        deliverablePath: '/projects/test-project/deliverables/healthcare/'
      };

      const result = await pipeline.executePublishing(
        execution,
        projectSpec,
        seoOptimizedContent
      );

      expect(result.deliverablePath).toContain('/projects/test-project/deliverables/healthcare/');
      expect(result.published).toBe(true);
    });
  });

  // ========================================================================
  // FULL PIPELINE INTEGRATION TESTS
  // ========================================================================

  describe('Complete 6-Stage Pipeline Execution', () => {
    test('should execute complete pipeline successfully', async () => {
      const projectSpec = {
        medicalTopic: "Dental Implant Procedure",
        targetLanguage: "English",
        targetAudience: "Adults 35-65",
        targetWordCount: 2500,
        projectUUID: 'full-pipeline-test-uuid'
      };

      const result = await pipeline.execute(projectSpec);

      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('stages');
      expect(result.stages).toHaveLength(6);
      expect(result.status).toBe('completed');
    });

    test('should track execution time for all stages', async () => {
      const projectSpec = {
        medicalTopic: "Dental Implant Procedure",
        targetLanguage: "English"
      };

      const startTime = Date.now();
      const result = await pipeline.execute(projectSpec);
      const totalTime = Date.now() - startTime;

      expect(result.executionTime).toBeDefined();
      expect(totalTime).toBeLessThan(90000); // Should complete within 90 seconds (target: 85min in production)
    });

    test('should stop pipeline at checkpoint if outline not approved', async () => {
      const projectSpec = {
        medicalTopic: "Dental Implant Procedure",
        requireCheckpointApproval: true
      };

      const result = await pipeline.execute(projectSpec);

      expect(result.status).toBe('awaiting_approval');
      expect(result.currentStage).toBe('outline_checkpoint');
    });
  });

  // ========================================================================
  // MULTI-LANGUAGE SUPPORT TESTS
  // ========================================================================

  describe('Multi-Language Healthcare Content', () => {
    test('should handle Slovenian medical content translation', async () => {
      const projectSpec = {
        medicalTopic: "Zobni implantat postopek",
        targetLanguage: "Slovenian",
        sourceLanguage: "English"
      };

      const result = await pipeline.execute(projectSpec);

      expect(result.language).toBe("Slovenian");
      expect(result.medicalTerminologyTranslated).toBe(true);
    });

    test('should validate medical terminology accuracy in translation', async () => {
      const projectSpec = {
        medicalTopic: "Tandimplantaat procedure",
        targetLanguage: "Dutch"
      };

      const result = await pipeline.execute(projectSpec);

      // Healthcare multilang adapter should validate medical term accuracy
      expect(result.translationValidation).toBeDefined();
      expect(result.translationValidation.medicalAccuracy).toBe(100);
    });
  });

  // ========================================================================
  // ERROR HANDLING AND RECOVERY
  // ========================================================================

  describe('Error Handling and Recovery', () => {
    test('should handle agent failure gracefully', async () => {
      mockCoordination.executeTask = async () => {
        throw new Error('Agent execution failed');
      };

      const projectSpec = { medicalTopic: "Dental Implant Procedure" };

      await expect(pipeline.execute(projectSpec)).rejects.toThrow('Agent execution failed');
    });

    test('should retry on transient failures', async () => {
      let attemptCount = 0;
      mockCoordination.executeTask = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Transient failure');
        }
        return mockCoordination.mockMedicalResearchResult();
      };

      const projectSpec = { medicalTopic: "Dental Implant Procedure", maxRetries: 3 };
      const result = await pipeline.execute(projectSpec);

      expect(attemptCount).toBe(3);
      expect(result.status).toBe('completed');
    });
  });

  // ========================================================================
  // PERFORMANCE AND SCALABILITY
  // ========================================================================

  describe('Performance and Scalability', () => {
    test('should handle concurrent pipeline executions', async () => {
      const pipelines = [
        { medicalTopic: "Dental Implant Procedure" },
        { medicalTopic: "Root Canal Treatment" },
        { medicalTopic: "Wisdom Tooth Extraction" }
      ];

      const results = await Promise.all(
        pipelines.map(spec => pipeline.execute(spec))
      );

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.status).toBe('completed');
      });
    });

    test('should cache medical research for related topics', async () => {
      const projectSpec1 = { medicalTopic: "Dental Implant Procedure" };
      const projectSpec2 = { medicalTopic: "Dental Implant Cost" };

      await pipeline.execute(projectSpec1);
      const startTime = Date.now();
      await pipeline.execute(projectSpec2);
      const executionTime = Date.now() - startTime;

      // Second execution should be faster due to cached research
      expect(executionTime).toBeLessThan(60000); // < 60 seconds
    });
  });
});

// ============================================================================
// SPECIALIZED SLOVENIAN DENTAL CARE TEST (User's Pilot Use Case)
// ============================================================================

describe('Slovenian Dental Bridge Care Content Pipeline', () => {
  let pipeline;
  let mockCoordination;
  let mockAgentSelection;
  let mockMemory;
  let mockRedis;

  beforeEach(() => {
    mockCoordination = new MockCoordinationPatterns();
    mockAgentSelection = new MockDynamicAgentSelection();
    mockMemory = new MockCrystallineMemory();
    mockRedis = new MockRedis();

    pipeline = new HealthcareContentPipeline(
      mockCoordination,
      mockAgentSelection,
      mockMemory,
      mockRedis
    );
  });

  test('should create Slovenian dental bridge care content', async () => {
    const projectSpec = {
      medicalTopic: "Zobni mostiček nega po postopku",
      targetLanguage: "Slovenian",
      contentType: "Post-Procedure Care Instructions",
      targetAudience: "Slovenian dental patients",
      targetWordCount: 1500
    };

    const result = await pipeline.execute(projectSpec);

    expect(result.language).toBe("Slovenian");
    expect(result.contentType).toBe("Post-Procedure Care Instructions");
    expect(result.status).toBe('completed');
  });

  test('should validate Slovenian medical terminology accuracy', async () => {
    const projectSpec = {
      medicalTopic: "Zobni mostiček",
      targetLanguage: "Slovenian"
    };

    const result = await pipeline.execute(projectSpec);

    // Healthcare multilang adapter validates medical term translations
    expect(result.translationValidation).toBeDefined();
    expect(result.translationValidation.medicalAccuracy).toBe(100);
    expect(result.translationValidation.languagePurity).toBe(100); // No English words mixed in
  });
});

// ============================================================================
// EXPORT TEST SUITE
// ============================================================================

module.exports = {
  MockCoordinationPatterns,
  MockDynamicAgentSelection,
  MockCrystallineMemory,
  MockRedis
};
