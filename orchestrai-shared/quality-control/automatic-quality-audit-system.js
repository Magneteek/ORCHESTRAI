// Automatic Quality Audit System
// Continuous outline scrutinization and quality validation with automatic feedback loops
// Ensures every writing step maintains consistency with strategic outlines

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class AutomaticQualityAuditSystem extends EventEmitter {
  constructor(crystallineMemory, contextPreservation, redis = null) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.contextPreservation = contextPreservation;
    this.redis = redis;
    
    // Quality audit configuration
    this.auditConfig = {
      scrutinizationLevel: 'comprehensive',
      feedbackMode: 'immediate',
      autoCorrection: true,
      qualityThresholds: {
        outlineAdherence: 0.85,
        contentQuality: 0.80,
        structuralIntegrity: 0.90,
        strategicAlignment: 0.85
      }
    };
    
    // Audit patterns for different content types
    this.auditPatterns = {
      'dental-content': {
        requiredElements: ['introduction', 'procedure-steps', 'recovery-info', 'cost-information', 'faq'],
        qualityCriteria: ['medical-accuracy', 'patient-focused', 'actionable-advice'],
        structuralRequirements: ['h2-sections', 'bullet-lists', 'clear-transitions'],
        seoRequirements: ['target-keywords', 'meta-description', 'internal-links']
      },
      'technical-content': {
        requiredElements: ['overview', 'implementation', 'examples', 'troubleshooting'],
        qualityCriteria: ['technical-accuracy', 'completeness', 'clarity'],
        structuralRequirements: ['code-examples', 'step-by-step', 'clear-headings'],
        seoRequirements: ['technical-keywords', 'related-topics', 'resource-links']
      },
      'business-content': {
        requiredElements: ['problem-definition', 'solution-overview', 'benefits', 'implementation'],
        qualityCriteria: ['business-relevance', 'roi-focused', 'actionable'],
        structuralRequirements: ['executive-summary', 'detailed-sections', 'conclusion'],
        seoRequirements: ['business-keywords', 'industry-terms', 'competitive-links']
      }
    };
    
    // Active audits tracking
    this.activeAudits = new Map();
    this.auditHistory = [];
    this.feedbackQueue = [];
    
    // Quality metrics
    this.qualityMetrics = {
      auditsPerformed: 0,
      issuesFound: 0,
      autoCorrectionsApplied: 0,
      qualityImprovements: 0,
      averageQualityScore: 0
    };
    
    console.log('🔍 Automatic Quality Audit System initialized - Continuous outline scrutinization active');
  }

  /**
   * Start continuous quality audit for a content piece
   */
  async startContinuousAudit(contentId, auditConfig) {
    const auditId = uuidv4();
    const timestamp = Date.now();
    
    try {
      // Create audit session
      const audit = {
        auditId,
        contentId,
        config: { ...this.auditConfig, ...auditConfig },
        status: 'active',
        startedAt: timestamp,
        outline: auditConfig.outline,
        contentType: auditConfig.contentType || 'general',
        currentStep: 0,
        totalSteps: auditConfig.outline?.sections?.length || 0,
        qualityScores: {
          overall: 0,
          outlineAdherence: 0,
          contentQuality: 0,
          structuralIntegrity: 0,
          strategicAlignment: 0
        },
        issues: [],
        corrections: [],
        feedback: []
      };
      
      // Store audit session
      this.activeAudits.set(auditId, audit);
      
      // Store in Redis for distributed access
      if (this.redis) {
        await this.redis.setex(
          `orchestrai:quality-audit:${auditId}`,
          86400, // 24 hours
          JSON.stringify(audit)
        );
      }
      
      console.log(`🔍 Started continuous quality audit for ${contentId}: ${auditId}`);
      
      this.emit('audit-started', {
        auditId,
        contentId,
        contentType: audit.contentType,
        totalSteps: audit.totalSteps
      });
      
      return auditId;
      
    } catch (error) {
      console.error('❌ Failed to start quality audit:', error.message);
      throw error;
    }
  }

  /**
   * Scrutinize content step against outline
   */
  async scrutinizeStep(auditId, stepContent, stepIndex) {
    try {
      const audit = await this.getAudit(auditId);
      if (!audit) {
        throw new Error(`Audit ${auditId} not found`);
      }
      
      console.log(`🔍 Scrutinizing step ${stepIndex + 1}/${audit.totalSteps} for audit ${auditId}`);
      
      // Get expected content from outline
      const expectedSection = audit.outline?.sections?.[stepIndex];
      if (!expectedSection) {
        console.warn(`⚠️ No outline section found for step ${stepIndex}`);
        return { passed: true, issues: [] };
      }
      
      // Perform comprehensive scrutinization
      const scrutinizationResults = await this.performComprehensiveScrutinization(
        stepContent,
        expectedSection,
        audit.contentType,
        audit.config
      );
      
      // Update audit with results
      audit.currentStep = stepIndex + 1;
      audit.qualityScores = this.calculateQualityScores(scrutinizationResults);
      
      // Handle issues found
      if (scrutinizationResults.issues.length > 0) {
        audit.issues.push(...scrutinizationResults.issues.map(issue => ({
          ...issue,
          stepIndex,
          timestamp: Date.now()
        })));
        
        // Generate automatic feedback
        const feedback = await this.generateAutomaticFeedback(
          scrutinizationResults.issues,
          expectedSection,
          stepContent
        );
        
        audit.feedback.push({
          stepIndex,
          timestamp: Date.now(),
          feedback,
          severity: this.calculateFeedbackSeverity(scrutinizationResults.issues)
        });
        
        // Queue feedback for immediate delivery
        this.feedbackQueue.push({
          auditId,
          contentId: audit.contentId,
          stepIndex,
          feedback,
          issues: scrutinizationResults.issues,
          timestamp: Date.now()
        });
        
        console.log(`⚠️ Step ${stepIndex + 1} scrutinization found ${scrutinizationResults.issues.length} issues`);
        
        this.emit('quality-issues-found', {
          auditId,
          stepIndex,
          issueCount: scrutinizationResults.issues.length,
          feedback
        });
      } else {
        console.log(`✅ Step ${stepIndex + 1} passed scrutinization`);
      }
      
      // Update audit
      this.activeAudits.set(auditId, audit);
      
      // Update metrics
      this.qualityMetrics.auditsPerformed++;
      this.qualityMetrics.issuesFound += scrutinizationResults.issues.length;
      
      return {
        passed: scrutinizationResults.issues.length === 0,
        issues: scrutinizationResults.issues,
        qualityScore: audit.qualityScores.overall,
        feedback: audit.feedback[audit.feedback.length - 1]?.feedback
      };
      
    } catch (error) {
      console.error('❌ Step scrutinization failed:', error.message);
      throw error;
    }
  }

  /**
   * Perform comprehensive scrutinization of content step
   */
  async performComprehensiveScrutinization(stepContent, expectedSection, contentType, config) {
    const issues = [];
    const auditPattern = this.auditPatterns[contentType] || this.auditPatterns['technical-content'];
    
    // 1. Outline Adherence Check
    const outlineAdherence = await this.checkOutlineAdherence(stepContent, expectedSection);
    if (outlineAdherence.score < config.qualityThresholds.outlineAdherence) {
      issues.push({
        type: 'outline-deviation',
        severity: 'high',
        description: `Content deviates from outline expectations`,
        expected: expectedSection.content || expectedSection.description,
        actual: stepContent.substring(0, 200) + '...',
        suggestions: outlineAdherence.suggestions
      });
    }
    
    // 2. Required Elements Check
    const missingElements = await this.checkRequiredElements(stepContent, auditPattern.requiredElements);
    for (const missing of missingElements) {
      issues.push({
        type: 'missing-element',
        severity: 'medium',
        description: `Missing required element: ${missing}`,
        suggestions: [`Add ${missing} section to complete the content structure`]
      });
    }
    
    // 3. Quality Criteria Check
    const qualityIssues = await this.checkQualityCriteria(stepContent, auditPattern.qualityCriteria);
    issues.push(...qualityIssues);
    
    // 4. Structural Integrity Check
    const structuralIssues = await this.checkStructuralIntegrity(stepContent, auditPattern.structuralRequirements);
    issues.push(...structuralIssues);
    
    // 5. Strategic Alignment Check
    const alignmentIssues = await this.checkStrategicAlignment(stepContent, expectedSection);
    issues.push(...alignmentIssues);
    
    return {
      issues,
      scores: {
        outlineAdherence: outlineAdherence.score,
        contentQuality: this.calculateContentQualityScore(stepContent),
        structuralIntegrity: this.calculateStructuralScore(stepContent),
        strategicAlignment: this.calculateAlignmentScore(stepContent, expectedSection)
      }
    };
  }

  /**
   * Check outline adherence
   */
  async checkOutlineAdherence(content, expectedSection) {
    const suggestions = [];
    
    // Check if content covers expected topics
    const expectedKeywords = expectedSection.keywords || [];
    const contentLower = content.toLowerCase();
    
    let coverageScore = 0;
    const missingKeywords = [];
    
    for (const keyword of expectedKeywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        coverageScore += 1;
      } else {
        missingKeywords.push(keyword);
      }
    }
    
    const adherenceScore = expectedKeywords.length > 0 ? coverageScore / expectedKeywords.length : 0.8;
    
    if (missingKeywords.length > 0) {
      suggestions.push(`Include missing topics: ${missingKeywords.join(', ')}`);
    }
    
    // Check content length expectations
    const expectedLength = expectedSection.expectedLength || 300;
    if (content.length < expectedLength * 0.7) {
      suggestions.push(`Content is too short. Expected ~${expectedLength} characters, got ${content.length}`);
    }
    
    return {
      score: adherenceScore,
      suggestions,
      missingKeywords,
      lengthRatio: content.length / expectedLength
    };
  }

  /**
   * Generate automatic feedback for issues
   */
  async generateAutomaticFeedback(issues, expectedSection, content) {
    const feedback = {
      summary: `Found ${issues.length} issues requiring attention`,
      priority: this.calculateFeedbackSeverity(issues),
      corrections: [],
      suggestions: []
    };
    
    // Group issues by type
    const issuesByType = {};
    for (const issue of issues) {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      issuesByType[issue.type].push(issue);
    }
    
    // Generate specific feedback for each issue type
    for (const [type, typeIssues] of Object.entries(issuesByType)) {
      switch (type) {
        case 'outline-deviation':
          feedback.corrections.push({
            type: 'outline-alignment',
            action: 'Revise content to better align with outline expectations',
            details: typeIssues.map(i => i.suggestions).flat(),
            priority: 'high'
          });
          break;
          
        case 'missing-element':
          feedback.corrections.push({
            type: 'content-completion',
            action: 'Add missing required elements',
            details: typeIssues.map(i => `Add ${i.description.split(': ')[1]}`),
            priority: 'medium'
          });
          break;
          
        case 'quality-criteria':
          feedback.suggestions.push({
            type: 'quality-improvement',
            action: 'Enhance content quality',
            details: typeIssues.map(i => i.suggestions).flat(),
            priority: 'medium'
          });
          break;
      }
    }
    
    // Add outline-specific guidance
    if (expectedSection) {
      feedback.suggestions.push({
        type: 'outline-guidance',
        action: 'Follow outline structure',
        details: [
          `Ensure coverage of: ${expectedSection.keywords?.join(', ') || 'section topics'}`,
          `Target length: ~${expectedSection.expectedLength || 300} characters`,
          `Include: ${expectedSection.requiredElements?.join(', ') || 'key elements'}`
        ],
        priority: 'high'
      });
    }
    
    return feedback;
  }

  /**
   * Get pending feedback for agent
   */
  async getPendingFeedback(agentId) {
    const pending = this.feedbackQueue.filter(f => f.assignedTo === agentId || !f.assignedTo);
    
    // Mark as delivered
    this.feedbackQueue = this.feedbackQueue.filter(f => !pending.includes(f));
    
    return pending;
  }

  /**
   * Apply automatic corrections
   */
  async applyAutomaticCorrections(auditId, corrections) {
    try {
      const audit = await this.getAudit(auditId);
      if (!audit || !audit.config.autoCorrection) {
        return { applied: false, reason: 'Auto-correction disabled or audit not found' };
      }
      
      const appliedCorrections = [];
      
      for (const correction of corrections) {
        if (this.canAutoApply(correction)) {
          const result = await this.applyCorrection(correction);
          appliedCorrections.push({
            correction,
            result,
            appliedAt: Date.now()
          });
        }
      }
      
      // Update audit
      audit.corrections.push(...appliedCorrections);
      this.activeAudits.set(auditId, audit);
      
      // Update metrics
      this.qualityMetrics.autoCorrectionsApplied += appliedCorrections.length;
      
      console.log(`🔧 Applied ${appliedCorrections.length} automatic corrections for audit ${auditId}`);
      
      return {
        applied: true,
        correctionCount: appliedCorrections.length,
        corrections: appliedCorrections
      };
      
    } catch (error) {
      console.error('❌ Failed to apply automatic corrections:', error.message);
      throw error;
    }
  }

  /**
   * Calculate quality scores
   */
  calculateQualityScores(scrutinizationResults) {
    const scores = scrutinizationResults.scores || {};
    
    return {
      overall: (scores.outlineAdherence + scores.contentQuality + scores.structuralIntegrity + scores.strategicAlignment) / 4,
      outlineAdherence: scores.outlineAdherence || 0,
      contentQuality: scores.contentQuality || 0,
      structuralIntegrity: scores.structuralIntegrity || 0,
      strategicAlignment: scores.strategicAlignment || 0
    };
  }

  /**
   * Check required elements presence
   */
  async checkRequiredElements(content, requiredElements) {
    const missing = [];
    const contentLower = content.toLowerCase();
    
    for (const element of requiredElements) {
      const elementPatterns = this.getElementPatterns(element);
      
      let found = false;
      for (const pattern of elementPatterns) {
        if (contentLower.includes(pattern)) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        missing.push(element);
      }
    }
    
    return missing;
  }

  /**
   * Get element detection patterns
   */
  getElementPatterns(element) {
    const patterns = {
      'introduction': ['uvod', 'introduction', 'začetek', 'overview'],
      'procedure-steps': ['koraki', 'postopek', 'steps', 'procedure'],
      'recovery-info': ['okrevanje', 'recovery', 'healing', 'navodila'],
      'cost-information': ['cena', 'cost', 'price', 'stroški'],
      'faq': ['pogosto', 'faq', 'frequently', 'vprašanja'],
      'conclusion': ['zaključek', 'conclusion', 'povzetek', 'summary']
    };
    
    return patterns[element] || [element];
  }

  /**
   * Get audit session
   */
  async getAudit(auditId) {
    let audit = this.activeAudits.get(auditId);
    
    if (!audit && this.redis) {
      try {
        const data = await this.redis.get(`orchestrai:quality-audit:${auditId}`);
        if (data) {
          audit = JSON.parse(data);
          this.activeAudits.set(auditId, audit);
        }
      } catch (error) {
        console.warn('Failed to retrieve audit from Redis:', error.message);
      }
    }
    
    return audit;
  }

  /**
   * Calculate feedback severity
   */
  calculateFeedbackSeverity(issues) {
    const severityCounts = { high: 0, medium: 0, low: 0 };
    
    for (const issue of issues) {
      severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
    }
    
    if (severityCounts.high > 0) return 'high';
    if (severityCounts.medium > 2) return 'high';
    if (severityCounts.medium > 0) return 'medium';
    return 'low';
  }

  /**
   * Get quality audit statistics
   */
  getQualityStatistics() {
    const stats = {
      ...this.qualityMetrics,
      activeAudits: this.activeAudits.size,
      pendingFeedback: this.feedbackQueue.length,
      auditHistory: this.auditHistory.length
    };
    
    // Calculate quality improvement rate
    if (stats.auditsPerformed > 0) {
      stats.qualityImprovementRate = (stats.qualityImprovements / stats.auditsPerformed) * 100;
    }
    
    return stats;
  }
}

module.exports = AutomaticQualityAuditSystem;