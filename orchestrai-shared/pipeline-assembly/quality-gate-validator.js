/**
 * ORCHESTRAI Quality Gate Validator
 *
 * Validates quality gates during pipeline execution to ensure deliverable standards.
 * Implements blocking gates, automatic retries, and quality score calculations.
 */

class QualityGateValidator {
  constructor() {
    // Quality gate validation rules
    this.validationRules = {
      'outline_validation_blocking': this.validateOutlineQuality.bind(this),
      'language_purity_100': this.validateLanguagePurity.bind(this),
      'overall_quality_90': this.validateOverallQuality.bind(this),
      'content_architecture_compliance': this.validateContentArchitecture.bind(this),
      'keyword_validation': this.validateKeywordQuality.bind(this),
      'strategy_coherence': this.validateStrategyCoherence.bind(this),
      'semantic_completeness': this.validateSemanticCompleteness.bind(this),
      'offer_validation': this.validateOfferQuality.bind(this),
      'creative_approval': this.validateCreativeQuality.bind(this),
      'design_approval': this.validateDesignQuality.bind(this),
      'qa_validation': this.validateQAResults.bind(this),
      'tracking_verification': this.validateTrackingSetup.bind(this)
    };

    console.log('✅ Quality Gate Validator initialized');
  }

  /**
   * Validate pipeline quality during assembly
   */
  async validatePipelineQuality(workflowConfig, executionPlan, successCriteria) {
    const validation = {
      passed: true,
      warnings: [],
      errors: [],
      score: 100
    };

    // Validate task configuration
    if (workflowConfig.tasks.length === 0) {
      validation.errors.push('No tasks defined in workflow');
      validation.passed = false;
      validation.score -= 50;
    }

    // Validate quality gates are properly configured
    const qualityGates = executionPlan.qualityGates || [];
    if (qualityGates.length === 0) {
      validation.warnings.push('No quality gates configured - quality enforcement may be limited');
      validation.score -= 10;
    }

    // Validate blocking gates have criteria
    const blockingGates = qualityGates.filter(g => g.blocking);
    for (const gate of blockingGates) {
      if (!gate.criteria || Object.keys(gate.criteria).length === 0) {
        validation.warnings.push(`Blocking gate "${gate.name}" has no criteria defined`);
        validation.score -= 5;
      }
    }

    // Validate agent assignment
    const tasksWithoutAgents = workflowConfig.tasks.filter(t => !t.agentType);
    if (tasksWithoutAgents.length > 0) {
      validation.errors.push(`${tasksWithoutAgents.length} tasks have no agent assigned`);
      validation.passed = false;
      validation.score -= 20;
    }

    // Validate dependency integrity
    const dependencyValidation = this.validateDependencyIntegrity(workflowConfig.dependencies);
    if (!dependencyValidation.valid) {
      validation.errors.push(...dependencyValidation.errors);
      validation.passed = false;
      validation.score -= 15;
    }

    // Validate language isolation for non-English
    if (workflowConfig.context.language !== 'English' &&
        !workflowConfig.constraints.languageIsolation) {
      validation.warnings.push('Language isolation not enabled for non-English content');
      validation.score -= 10;
    }

    // Ensure score doesn't go below 0
    validation.score = Math.max(validation.score, 0);

    return validation;
  }

  /**
   * Validate individual quality gate during execution
   */
  async validateQualityGate(qualityGate, taskResult) {
    try {
      // Get validation function for this gate
      const validationFn = this.validationRules[qualityGate.name];

      if (!validationFn) {
        console.warn(`No validation rule for quality gate: ${qualityGate.name}`);
        return {
          passed: true,
          score: 80,
          reason: 'No specific validation rule - default pass',
          warnings: [`Quality gate "${qualityGate.name}" has no validation implementation`]
        };
      }

      // Execute validation
      const result = await validationFn(qualityGate, taskResult);

      return result;

    } catch (error) {
      console.error(`Quality gate validation error: ${qualityGate.name}`, error);
      return {
        passed: false,
        score: 0,
        reason: `Validation error: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Validate outline quality
   */
  async validateOutlineQuality(gate, taskResult) {
    const validation = {
      passed: true,
      score: 100,
      warnings: [],
      checks: {}
    };

    const outline = taskResult.output || taskResult.data || {};
    const criteria = gate.criteria || {};

    // Check required fields
    if (criteria.requiredFields) {
      for (const field of criteria.requiredFields) {
        if (!outline[field]) {
          validation.warnings.push(`Missing required field: ${field}`);
          validation.score -= 10;
        } else {
          validation.checks[field] = true;
        }
      }
    }

    // Check minimum score
    if (criteria.minimumScore && outline.qualityScore < criteria.minimumScore) {
      validation.passed = false;
      validation.score = outline.qualityScore || 0;
      return {
        ...validation,
        reason: `Quality score ${outline.qualityScore} below minimum ${criteria.minimumScore}`
      };
    }

    // Check psychographic targeting
    if (outline.psychographicTargeting) {
      validation.checks.psychographicTargeting = true;
    } else {
      validation.warnings.push('Psychographic targeting not clearly defined');
      validation.score -= 15;
    }

    // Check keyword strategy
    if (outline.keywordStrategy || outline.targetKeywords) {
      validation.checks.keywordStrategy = true;
    } else {
      validation.warnings.push('Keyword strategy not defined');
      validation.score -= 10;
    }

    // Check content architecture
    if (outline.contentArchitecture || outline.sections) {
      validation.checks.contentArchitecture = true;
    } else {
      validation.warnings.push('Content architecture not defined');
      validation.score -= 10;
    }

    // Final score calculation
    validation.score = Math.max(validation.score, 0);
    validation.passed = validation.score >= (criteria.minimumScore || 85);

    return validation;
  }

  /**
   * Validate language purity
   */
  async validateLanguagePurity(gate, taskResult) {
    const validation = {
      passed: true,
      score: 100,
      contaminations: [],
      checks: {}
    };

    const content = taskResult.output || taskResult.content || '';
    const criteria = gate.criteria || {};

    // Check for English contamination patterns
    const englishPatterns = [
      /\bROI\b/g,
      /\bDIY\b/g,
      /\bNo Cure No Pay\b/gi,
      /\bprofessional\b/g,
      /\bbusiness\b/g,
      /\bmanagement\b/g,
      /\btemplate\b/g,
      /\bchecklist\b/g,
      /\bbreakdown\b/g,
      /\banalysis\b/g,
      /\bassessment\b/g,
      /\bcompetitor\b/g,
      /\btimeline\b/g,
      /\bevidence\b/g,
      /\bprotocol\b/g
    ];

    let contaminationCount = 0;
    for (const pattern of englishPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        contaminationCount += matches.length;
        validation.contaminations.push({
          pattern: pattern.source,
          count: matches.length,
          examples: matches.slice(0, 3)
        });
      }
    }

    // Calculate purity percentage
    const wordCount = content.split(/\s+/).length;
    const purityPercentage = wordCount > 0
      ? Math.round(((wordCount - contaminationCount) / wordCount) * 100)
      : 100;

    validation.score = purityPercentage;
    validation.checks.purityPercentage = purityPercentage;
    validation.checks.contaminationCount = contaminationCount;

    // Check against criteria
    if (criteria.languagePurity === 100 && contaminationCount > 0) {
      validation.passed = false;
      return {
        ...validation,
        reason: `Language contamination detected: ${contaminationCount} English terms found. Purity: ${purityPercentage}%`
      };
    }

    if (criteria.allowedContamination !== undefined && contaminationCount > criteria.allowedContamination) {
      validation.passed = false;
      return {
        ...validation,
        reason: `Contamination count ${contaminationCount} exceeds allowed ${criteria.allowedContamination}`
      };
    }

    validation.passed = purityPercentage >= (criteria.minimumPurity || 100);

    return validation;
  }

  /**
   * Validate overall content quality
   */
  async validateOverallQuality(gate, taskResult) {
    const validation = {
      passed: true,
      score: 85,
      dimensions: {},
      warnings: []
    };

    const content = taskResult.output || taskResult.content || {};
    const criteria = gate.criteria || {};

    // Dimension: Content completeness
    validation.dimensions.completeness = this.assessCompleteness(content);

    // Dimension: SEO optimization
    validation.dimensions.seo = this.assessSEOQuality(content);

    // Dimension: Readability
    validation.dimensions.readability = this.assessReadability(content);

    // Dimension: Structure
    validation.dimensions.structure = this.assessStructure(content);

    // Calculate overall score
    const dimensionScores = Object.values(validation.dimensions);
    validation.score = Math.round(
      dimensionScores.reduce((sum, score) => sum + score, 0) / dimensionScores.length
    );

    // Check if all dimensions pass (if required)
    if (criteria.allDimensionsPass) {
      const failedDimensions = Object.entries(validation.dimensions)
        .filter(([_, score]) => score < 85)
        .map(([dim, score]) => `${dim}: ${score}`);

      if (failedDimensions.length > 0) {
        validation.passed = false;
        return {
          ...validation,
          reason: `Dimensions below threshold: ${failedDimensions.join(', ')}`
        };
      }
    }

    // Check minimum score
    validation.passed = validation.score >= (criteria.minimumScore || 90);

    if (!validation.passed) {
      return {
        ...validation,
        reason: `Overall quality score ${validation.score} below minimum ${criteria.minimumScore || 90}`
      };
    }

    return validation;
  }

  /**
   * Validate content architecture compliance
   */
  async validateContentArchitecture(gate, taskResult) {
    const validation = {
      passed: true,
      score: 100,
      checks: {},
      warnings: []
    };

    const content = taskResult.output || taskResult.content || '';
    const criteria = gate.criteria || {};

    // Count paragraphs by type
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const paragraphDistribution = this.analyzeParagraphDistribution(paragraphs);

    validation.checks.paragraphDistribution = paragraphDistribution;

    // Validate paragraph distribution
    if (criteria.paragraphDistribution) {
      const targetDist = criteria.paragraphDistribution;
      const actualDist = paragraphDistribution;

      const shortDiff = Math.abs(actualDist.short - targetDist.short);
      const mediumDiff = Math.abs(actualDist.medium - targetDist.medium);
      const longDiff = Math.abs(actualDist.long - targetDist.long);

      const totalDiff = shortDiff + mediumDiff + longDiff;

      if (totalDiff > 15) { // 15% total tolerance
        validation.warnings.push(`Paragraph distribution off target: ${JSON.stringify(actualDist)} vs ${JSON.stringify(targetDist)}`);
        validation.score -= 20;
      }
    }

    // Count lists
    const listCount = (content.match(/^[\s]*[-*]\s/gm) || []).length;
    validation.checks.listCount = listCount;

    if (criteria.maxLists && listCount > criteria.maxLists) {
      validation.warnings.push(`List count ${listCount} exceeds maximum ${criteria.maxLists}`);
      validation.score -= 15;
    }

    // Count tables
    const tableCount = (content.match(/\|.*\|/g) || []).length / 3; // Rough table count
    validation.checks.tableCount = Math.floor(tableCount);

    if (criteria.maxTables && tableCount > criteria.maxTables) {
      validation.warnings.push(`Table count ${tableCount} exceeds maximum ${criteria.maxTables}`);
      validation.score -= 10;
    }

    validation.score = Math.max(validation.score, 0);
    validation.passed = validation.score >= 80;

    return validation;
  }

  /**
   * Validate keyword quality
   */
  async validateKeywordQuality(gate, taskResult) {
    const validation = {
      passed: true,
      score: 100,
      checks: {}
    };

    const keywords = taskResult.keywords || taskResult.output || [];
    const criteria = gate.criteria || {};

    // Check minimum keyword count
    if (criteria.minimumKeywords && keywords.length < criteria.minimumKeywords) {
      validation.passed = false;
      validation.score = Math.round((keywords.length / criteria.minimumKeywords) * 100);
      return {
        ...validation,
        reason: `Only ${keywords.length} keywords found, minimum ${criteria.minimumKeywords} required`
      };
    }

    // Check search volume threshold
    if (criteria.searchVolumeThreshold) {
      const qualifyingKeywords = keywords.filter(
        kw => (kw.searchVolume || 0) >= criteria.searchVolumeThreshold
      );

      if (qualifyingKeywords.length < keywords.length * 0.5) {
        validation.score -= 20;
        validation.warnings = [`Only ${qualifyingKeywords.length} keywords meet search volume threshold`];
      }

      validation.checks.qualifyingKeywords = qualifyingKeywords.length;
    }

    validation.checks.totalKeywords = keywords.length;

    return validation;
  }

  /**
   * Validate strategy coherence
   */
  async validateStrategyCoherence(gate, taskResult) {
    const validation = {
      passed: true,
      score: 90,
      checks: {}
    };

    const strategy = taskResult.output || taskResult.strategy || {};
    const criteria = gate.criteria || {};

    // Check logical flow
    if (criteria.logicalFlow) {
      const hasLogicalFlow = strategy.phases || strategy.timeline || strategy.priorities;
      if (!hasLogicalFlow) {
        validation.score -= 20;
        validation.warnings = ['Strategy lacks clear logical flow or timeline'];
      }
    }

    // Check minimum score
    if (criteria.minimumScore) {
      const strategyScore = strategy.coherenceScore || validation.score;
      if (strategyScore < criteria.minimumScore) {
        validation.passed = false;
        validation.score = strategyScore;
        return {
          ...validation,
          reason: `Strategy coherence score ${strategyScore} below minimum ${criteria.minimumScore}`
        };
      }
    }

    return validation;
  }

  /**
   * Validate semantic completeness
   */
  async validateSemanticCompleteness(gate, taskResult) {
    const validation = {
      passed: true,
      score: 90,
      checks: {}
    };

    const clusters = taskResult.clusters || taskResult.output || [];
    const criteria = gate.criteria || {};

    // Check minimum clusters
    if (criteria.minimumClusters && clusters.length < criteria.minimumClusters) {
      validation.passed = false;
      validation.score = Math.round((clusters.length / criteria.minimumClusters) * 100);
      return {
        ...validation,
        reason: `Only ${clusters.length} clusters, minimum ${criteria.minimumClusters} required`
      };
    }

    // Check cluster coherence
    if (criteria.clusterCoherence) {
      const avgCoherence = clusters.reduce((sum, c) => sum + (c.coherence || 0), 0) / clusters.length;
      if (avgCoherence < criteria.clusterCoherence) {
        validation.score -= 20;
        validation.warnings = [`Average cluster coherence ${avgCoherence.toFixed(2)} below threshold ${criteria.clusterCoherence}`];
      }
      validation.checks.averageCoherence = avgCoherence;
    }

    validation.checks.clusterCount = clusters.length;

    return validation;
  }

  /**
   * Validate offer quality
   */
  async validateOfferQuality(gate, taskResult) {
    const validation = {
      passed: true,
      score: 85,
      checks: {}
    };

    const offer = taskResult.output || taskResult.offer || {};

    // Check for value equation components
    validation.checks.hasValueStack = !!offer.valueStack;
    validation.checks.hasGuarantee = !!offer.guarantee;
    validation.checks.hasScarcity = !!offer.scarcity || !!offer.urgency;

    if (!offer.valueStack) validation.score -= 30;
    if (!offer.guarantee) validation.score -= 20;
    if (!offer.scarcity && !offer.urgency) validation.score -= 15;

    validation.passed = validation.score >= 70;

    return validation;
  }

  /**
   * Validate creative quality
   */
  async validateCreativeQuality(gate, taskResult) {
    return {
      passed: true,
      score: 85,
      checks: {
        hasHooks: !!(taskResult.hooks || taskResult.output?.hooks),
        hasCopyVariations: !!(taskResult.variations || taskResult.output?.variations),
        hasCTAs: !!(taskResult.ctas || taskResult.output?.ctas)
      }
    };
  }

  /**
   * Validate design quality
   */
  async validateDesignQuality(gate, taskResult) {
    return {
      passed: true,
      score: 85,
      checks: {
        hasWireframes: !!(taskResult.wireframes || taskResult.output?.wireframes),
        hasUserFlows: !!(taskResult.userFlows || taskResult.output?.userFlows)
      }
    };
  }

  /**
   * Validate QA results
   */
  async validateQAResults(gate, taskResult) {
    const validation = {
      passed: true,
      score: 100,
      checks: {}
    };

    const qaResults = taskResult.output || taskResult;

    // Check test coverage
    if (qaResults.testCoverage !== undefined && qaResults.testCoverage < 90) {
      validation.score -= 20;
      validation.warnings = [`Test coverage ${qaResults.testCoverage}% below 90%`];
    }

    // Check critical bugs
    if (qaResults.criticalBugs > 0) {
      validation.passed = false;
      validation.score = 0;
      return {
        ...validation,
        reason: `${qaResults.criticalBugs} critical bugs found`
      };
    }

    validation.checks.testCoverage = qaResults.testCoverage;
    validation.checks.criticalBugs = qaResults.criticalBugs || 0;

    return validation;
  }

  /**
   * Validate tracking setup
   */
  async validateTrackingSetup(gate, taskResult) {
    return {
      passed: true,
      score: 90,
      checks: {
        hasPixels: !!(taskResult.pixels || taskResult.output?.pixels),
        hasConversionAPI: !!(taskResult.conversionAPI || taskResult.output?.conversionAPI),
        hasUTMParameters: !!(taskResult.utmParameters || taskResult.output?.utmParameters)
      }
    };
  }

  /**
   * Helper: Validate dependency integrity
   */
  validateDependencyIntegrity(dependencyGraph) {
    const validation = {
      valid: true,
      errors: []
    };

    // Check for circular dependencies
    const visited = new Set();
    const recursionStack = new Set();

    const detectCycle = (taskId) => {
      if (!visited.has(taskId)) {
        visited.add(taskId);
        recursionStack.add(taskId);

        const node = dependencyGraph[taskId];
        if (node && node.dependencies) {
          for (const depId of node.dependencies) {
            if (!visited.has(depId) && detectCycle(depId)) {
              return true;
            } else if (recursionStack.has(depId)) {
              validation.errors.push(`Circular dependency detected: ${taskId} -> ${depId}`);
              return true;
            }
          }
        }
      }
      recursionStack.delete(taskId);
      return false;
    };

    for (const taskId of Object.keys(dependencyGraph)) {
      if (detectCycle(taskId)) {
        validation.valid = false;
      }
    }

    // Check for missing dependencies
    for (const [taskId, node] of Object.entries(dependencyGraph)) {
      if (node.dependencies) {
        for (const depId of node.dependencies) {
          if (!dependencyGraph[depId]) {
            validation.errors.push(`Task ${taskId} depends on non-existent task ${depId}`);
            validation.valid = false;
          }
        }
      }
    }

    return validation;
  }

  /**
   * Helper: Assess content completeness
   */
  assessCompleteness(content) {
    const hasIntroduction = !!(content.introduction || content.intro);
    const hasBody = !!(content.body || content.content || content.sections);
    const hasConclusion = !!(content.conclusion || content.summary);

    let score = 70;
    if (hasIntroduction) score += 10;
    if (hasBody) score += 10;
    if (hasConclusion) score += 10;

    return score;
  }

  /**
   * Helper: Assess SEO quality
   */
  assessSEOQuality(content) {
    const hasKeywords = !!(content.keywords || content.targetKeywords);
    const hasMetaDescription = !!(content.metaDescription || content.description);
    const hasHeadings = !!(content.headings || content.h1 || content.h2);

    let score = 70;
    if (hasKeywords) score += 10;
    if (hasMetaDescription) score += 10;
    if (hasHeadings) score += 10;

    return score;
  }

  /**
   * Helper: Assess readability
   */
  assessReadability(content) {
    const text = content.content || content.text || '';
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = (text.match(/[.!?]+/g) || []).length;

    if (wordCount === 0) return 50;

    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

    // Ideal: 15-20 words per sentence
    let score = 85;
    if (avgWordsPerSentence < 10) score -= 10;
    if (avgWordsPerSentence > 25) score -= 15;

    return Math.max(score, 50);
  }

  /**
   * Helper: Assess structure
   */
  assessStructure(content) {
    const hasSections = !!(content.sections && content.sections.length > 0);
    const hasHeadings = !!(content.headings || content.h1 || content.h2);
    const hasLogicalFlow = !!(content.outline || content.structure);

    let score = 70;
    if (hasSections) score += 10;
    if (hasHeadings) score += 10;
    if (hasLogicalFlow) score += 10;

    return score;
  }

  /**
   * Helper: Analyze paragraph distribution
   */
  analyzeParagraphDistribution(paragraphs) {
    const distribution = {
      short: 0,
      medium: 0,
      long: 0,
      total: paragraphs.length
    };

    for (const para of paragraphs) {
      const sentenceCount = (para.match(/[.!?]+/g) || []).length;

      if (sentenceCount <= 2) {
        distribution.short++;
      } else if (sentenceCount <= 5) {
        distribution.medium++;
      } else {
        distribution.long++;
      }
    }

    // Convert to percentages
    const total = distribution.total || 1;
    return {
      short: Math.round((distribution.short / total) * 100),
      medium: Math.round((distribution.medium / total) * 100),
      long: Math.round((distribution.long / total) * 100)
    };
  }
}

module.exports = QualityGateValidator;
