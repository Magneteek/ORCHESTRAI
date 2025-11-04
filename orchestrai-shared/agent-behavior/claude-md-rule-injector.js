// CLAUDE.md Rule Auto-Injector
// Automatically injects CLAUDE.md rules into all agent prompts for consistent behavior
// Ensures every agent follows project structure, file organization, and workflow rules

const fs = require('fs');
const path = require('path');

class ClaudeMdRuleInjector {
  constructor() {
    this.claudeMdPath = path.join(__dirname, '../../CLAUDE.md');
    this.ruleCache = null;
    this.lastModified = null;
    
    // Core rule categories extracted from CLAUDE.md
    this.ruleSections = {
      fileOrganization: {
        priority: 'critical',
        enforcementLevel: 'strict'
      },
      projectCoherence: {
        priority: 'critical', 
        enforcementLevel: 'strict'
      },
      technologyChoice: {
        priority: 'important',
        enforcementLevel: 'guided'
      },
      agentCoordination: {
        priority: 'important',
        enforcementLevel: 'guided'
      }
    };
    
    // Registered agents tracking
    this.registeredAgents = new Map();
    
    console.log('🧠 CLAUDE.md Rule Auto-Injector initialized - Ensuring consistent agent behavior');
  }

  /**
   * Register an agent with rule injection configuration
   */
  async registerAgent(agentId, config) {
    this.registeredAgents.set(agentId, {
      agentId,
      config,
      registeredAt: Date.now(),
      lastRuleInjection: null
    });
    
    console.log(`📋 Agent ${agentId} registered for rule injection with rules: ${config.enabledRules?.join(', ') || 'all'}`);
    return true;
  }

  /**
   * Get registered agents
   */
  getRegisteredAgents() {
    return Array.from(this.registeredAgents.keys());
  }

  /**
   * Load and parse CLAUDE.md rules with caching
   */
  async loadRules() {
    try {
      const stats = fs.statSync(this.claudeMdPath);
      
      // Check if rules need to be reloaded
      if (this.ruleCache && this.lastModified && stats.mtime <= this.lastModified) {
        return this.ruleCache;
      }
      
      const claudeMdContent = fs.readFileSync(this.claudeMdPath, 'utf-8');
      this.lastModified = stats.mtime;
      
      // Parse and structure CLAUDE.md content
      this.ruleCache = this.parseClaudeMdRules(claudeMdContent);
      
      console.log('✅ CLAUDE.md rules loaded and parsed');
      return this.ruleCache;
      
    } catch (error) {
      console.error('❌ Failed to load CLAUDE.md rules:', error.message);
      
      // Return fallback rules if CLAUDE.md is not accessible
      return this.getFallbackRules();
    }
  }

  /**
   * Parse CLAUDE.md content into structured rule categories
   */
  parseClaudeMdRules(content) {
    const rules = {
      fileOrganization: this.extractFileOrganizationRules(content),
      projectCoherence: this.extractProjectCoherenceRules(content),
      technologyChoice: this.extractTechnologyRules(content),
      agentCoordination: this.extractAgentCoordinationRules(content),
      quality: this.extractQualityRules(content)
    };
    
    // Add metadata about rule extraction
    rules.metadata = {
      extractedAt: new Date().toISOString(),
      totalSections: Object.keys(rules).length - 1,
      enforcementMode: 'automatic-injection'
    };
    
    return rules;
  }

  /**
   * Extract file organization rules from CLAUDE.md
   */
  extractFileOrganizationRules(content) {
    const rules = [];
    
    // Extract global template system rules
    const globalTemplateMatch = content.match(/#### Global Template System[\s\S]*?```\n([\s\S]*?)```/);
    if (globalTemplateMatch) {
      rules.push({
        type: 'global-template-access',
        rule: 'Only access templates from /orchestrai-system/templates/global/',
        enforcement: 'strict',
        validation: 'pre-operation'
      });
    }
    
    // Extract project structure rules
    const projectStructureMatch = content.match(/#### Project Structure[\s\S]*?```\n([\s\S]*?)```/);
    if (projectStructureMatch) {
      rules.push({
        type: 'project-deliverables',
        rule: 'Only write final outputs to /projects/[uuid]/deliverables/',
        enforcement: 'strict',
        validation: 'pre-operation'
      });
    }
    
    // Extract client project coherence rules
    const coherenceMatch = content.match(/### CRITICAL: Client Project Coherence Rules([\s\S]*?)###/);
    if (coherenceMatch) {
      rules.push({
        type: 'client-project-coherence',
        rule: 'All work for single client MUST remain within same project structure',
        enforcement: 'critical',
        validation: 'continuous'
      });
    }
    
    return rules;
  }

  /**
   * Extract project coherence rules from CLAUDE.md  
   */
  extractProjectCoherenceRules(content) {
    const rules = [];
    
    // Single client = single project folder rule
    rules.push({
      type: 'single-client-folder',
      rule: 'All deliverables for one client belong in their existing /projects/[client-uuid]/ directory',
      enforcement: 'critical',
      validation: 'pre-operation'
    });
    
    // Memory system integration rule
    rules.push({
      type: 'memory-integration',
      rule: 'New deliverables must be integrated into client existing crystalline memory system',
      enforcement: 'critical',
      validation: 'post-operation'
    });
    
    return rules;
  }

  /**
   * Extract technology choice rules from CLAUDE.md
   */
  extractTechnologyRules(content) {
    const rules = [];
    
    // Appropriate complexity principle
    const complexityMatch = content.match(/#### Principle of Appropriate Complexity([\s\S]*?)####/);
    if (complexityMatch) {
      rules.push({
        type: 'appropriate-complexity',
        rule: 'Always choose simplest solution that meets project requirements',
        enforcement: 'guided',
        validation: 'design-time'
      });
    }
    
    // Static-first development
    rules.push({
      type: 'static-first',
      rule: 'Default to static HTML unless dynamic features explicitly required',
      enforcement: 'guided',
      validation: 'design-time'
    });
    
    return rules;
  }

  /**
   * Extract agent coordination rules from CLAUDE.md
   */
  extractAgentCoordinationRules(content) {
    const rules = [];
    
    // Agent deployment protocol
    rules.push({
      type: 'agent-deployment',
      rule: 'Always specify existing client project directory in agent prompts',
      enforcement: 'important',
      validation: 'pre-operation'
    });
    
    // Memory integration instructions
    rules.push({
      type: 'memory-integration-instructions', 
      rule: 'Instruct agents to integrate with existing client memory entities',
      enforcement: 'important',
      validation: 'post-operation'
    });
    
    return rules;
  }

  /**
   * Extract quality and standards rules from CLAUDE.md
   */
  extractQualityRules(content) {
    const rules = [];
    
    // Code standards
    rules.push({
      type: 'code-standards',
      rule: 'All code must be typed, follow ESLint rules, maintain JSDoc comments',
      enforcement: 'important',
      validation: 'post-operation'
    });
    
    return rules;
  }

  /**
   * Inject rules into agent prompts based on agent type and task context
   */
  async injectRulesIntoPrompt(originalPrompt, agentContext = {}) {
    const rules = await this.loadRules();
    
    // Determine which rules apply to this agent and task
    const applicableRules = this.determineApplicableRules(rules, agentContext);
    
    // Build rule injection text
    const ruleInjection = this.buildRuleInjection(applicableRules, agentContext);
    
    // Inject rules into prompt at optimal position
    const enhancedPrompt = this.performRuleInjection(originalPrompt, ruleInjection, agentContext);
    
    console.log(`📝 Rules injected for ${agentContext.agentType || 'generic'} agent: ${applicableRules.length} rules applied`);
    
    return {
      enhancedPrompt,
      injectedRules: applicableRules,
      metadata: {
        originalPromptLength: originalPrompt.length,
        enhancedPromptLength: enhancedPrompt.length,
        rulesApplied: applicableRules.length,
        agentType: agentContext.agentType
      }
    };
  }

  /**
   * Determine which rules apply to specific agent and context
   */
  determineApplicableRules(rules, agentContext) {
    const applicableRules = [];
    
    // Always apply critical file organization rules
    applicableRules.push(...rules.fileOrganization.filter(rule => 
      rule.enforcement === 'critical' || rule.enforcement === 'strict'
    ));
    
    // Always apply project coherence rules
    applicableRules.push(...rules.projectCoherence.filter(rule =>
      rule.enforcement === 'critical'
    ));
    
    // Apply technology rules for development agents
    if (this.isDevelopmentAgent(agentContext)) {
      applicableRules.push(...rules.technologyChoice);
    }
    
    // Apply coordination rules for orchestration agents
    if (this.isOrchestrationAgent(agentContext)) {
      applicableRules.push(...rules.agentCoordination);
    }
    
    // Apply quality rules for content/code agents
    if (this.isContentOrCodeAgent(agentContext)) {
      applicableRules.push(...rules.quality);
    }
    
    return applicableRules;
  }

  /**
   * Build formatted rule injection text
   */
  buildRuleInjection(applicableRules, agentContext) {
    if (applicableRules.length === 0) {
      return '';
    }
    
    const ruleText = [
      '## ORCHESTRAI System Rules (Auto-Injected)',
      '',
      'You MUST follow these rules derived from CLAUDE.md:',
      ''
    ];
    
    // Group rules by enforcement level
    const criticalRules = applicableRules.filter(r => r.enforcement === 'critical');
    const strictRules = applicableRules.filter(r => r.enforcement === 'strict');
    const guidedRules = applicableRules.filter(r => r.enforcement === 'guided');
    
    if (criticalRules.length > 0) {
      ruleText.push('### CRITICAL Rules (Must Follow):');
      criticalRules.forEach(rule => {
        ruleText.push(`- **${rule.type}**: ${rule.rule}`);
      });
      ruleText.push('');
    }
    
    if (strictRules.length > 0) {
      ruleText.push('### STRICT Rules (Always Follow):');
      strictRules.forEach(rule => {
        ruleText.push(`- **${rule.type}**: ${rule.rule}`);
      });
      ruleText.push('');
    }
    
    if (guidedRules.length > 0) {
      ruleText.push('### GUIDED Rules (Strong Preference):');
      guidedRules.forEach(rule => {
        ruleText.push(`- **${rule.type}**: ${rule.rule}`);
      });
      ruleText.push('');
    }
    
    // Add context-specific guidance
    if (agentContext.projectUuid) {
      ruleText.push(`### Project Context:`);
      ruleText.push(`- Working on project: ${agentContext.projectUuid}`);
      ruleText.push(`- All deliverables must go to: /projects/${agentContext.projectUuid}/deliverables/`);
      ruleText.push('');
    }
    
    ruleText.push('---');
    ruleText.push('');
    
    return ruleText.join('\n');
  }

  /**
   * Perform actual rule injection into prompt
   */
  performRuleInjection(originalPrompt, ruleInjection, agentContext) {
    if (!ruleInjection) {
      return originalPrompt;
    }
    
    // Strategy: Insert rules after any existing system context but before main instructions
    const promptSections = originalPrompt.split('\n\n');
    
    // Find optimal insertion point (after context, before main task)
    let insertionPoint = 0;
    
    // Look for common prompt patterns
    for (let i = 0; i < promptSections.length; i++) {
      const section = promptSections[i].toLowerCase();
      
      // Insert after context sections but before task sections
      if (section.includes('context:') || section.includes('background:') || section.includes('system:')) {
        insertionPoint = i + 1;
      } else if (section.includes('task:') || section.includes('objective:') || section.includes('instructions:')) {
        break;
      }
    }
    
    // Insert rules at determined position
    promptSections.splice(insertionPoint, 0, ruleInjection.trim());
    
    return promptSections.join('\n\n');
  }

  /**
   * Check if agent is development-related
   */
  isDevelopmentAgent(agentContext) {
    const devAgentTypes = [
      'web-frontend-developer', 'web-performance-optimizer', 'web-ux-research-agent',
      'web-responsive-design-agent', 'general-purpose'
    ];
    return devAgentTypes.includes(agentContext.agentType) || 
           (agentContext.capabilities && agentContext.capabilities.includes('development'));
  }

  /**
   * Check if agent is orchestration-related
   */
  isOrchestrationAgent(agentContext) {
    const orchestrationTypes = [
      'orchestrai-master-coordinator', 'enhanced-main-orchestrator-agent'
    ];
    return orchestrationTypes.includes(agentContext.agentType) ||
           (agentContext.role && agentContext.role.includes('orchestrat'));
  }

  /**
   * Check if agent produces content or code
   */
  isContentOrCodeAgent(agentContext) {
    const contentCodeTypes = [
      'content-writer-specialist', 'content-outline-architect', 'content-quality-validator',
      'seo-content-optimization', 'web-frontend-developer'
    ];
    return contentCodeTypes.includes(agentContext.agentType) ||
           (agentContext.capabilities && 
            (agentContext.capabilities.includes('content') || agentContext.capabilities.includes('code')));
  }

  /**
   * Fallback rules if CLAUDE.md is not accessible
   */
  getFallbackRules() {
    return {
      fileOrganization: [
        {
          type: 'global-template-access',
          rule: 'Only access templates from /orchestrai-system/templates/global/',
          enforcement: 'strict',
          validation: 'pre-operation'
        },
        {
          type: 'project-deliverables',
          rule: 'Only write final outputs to /projects/[uuid]/deliverables/',
          enforcement: 'strict', 
          validation: 'pre-operation'
        }
      ],
      projectCoherence: [
        {
          type: 'single-client-folder',
          rule: 'All deliverables for one client belong in existing project directory',
          enforcement: 'critical',
          validation: 'pre-operation'
        }
      ],
      technologyChoice: [],
      agentCoordination: [],
      quality: [],
      metadata: {
        extractedAt: new Date().toISOString(),
        fallbackMode: true
      }
    };
  }

  /**
   * Get rule enforcement statistics
   */
  async getRuleStatistics() {
    const rules = await this.loadRules();
    
    const stats = {
      totalRules: 0,
      byEnforcement: {
        critical: 0,
        strict: 0,
        important: 0,
        guided: 0
      },
      byCategory: {
        fileOrganization: rules.fileOrganization.length,
        projectCoherence: rules.projectCoherence.length,
        technologyChoice: rules.technologyChoice.length,
        agentCoordination: rules.agentCoordination.length,
        quality: rules.quality.length
      }
    };
    
    // Count by enforcement level
    Object.values(rules).forEach(categoryRules => {
      if (Array.isArray(categoryRules)) {
        categoryRules.forEach(rule => {
          stats.totalRules++;
          stats.byEnforcement[rule.enforcement]++;
        });
      }
    });
    
    return stats;
  }

  /**
   * Validate agent compliance with injected rules
   */
  async validateAgentCompliance(agentOutput, agentContext, injectedRules) {
    const violations = [];
    
    for (const rule of injectedRules) {
      const compliance = await this.checkRuleCompliance(rule, agentOutput, agentContext);
      
      if (!compliance.isCompliant) {
        violations.push({
          rule: rule.type,
          violation: compliance.violation,
          severity: rule.enforcement,
          recommendation: compliance.recommendation
        });
      }
    }
    
    return {
      isCompliant: violations.length === 0,
      violations,
      score: Math.max(0, 100 - (violations.length * 20)),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check specific rule compliance
   */
  async checkRuleCompliance(rule, agentOutput, agentContext) {
    // Implementation varies by rule type
    switch (rule.type) {
      case 'project-deliverables':
        return this.checkProjectDeliverableCompliance(rule, agentOutput);
      case 'global-template-access':
        return this.checkTemplateAccessCompliance(rule, agentOutput);
      case 'single-client-folder':
        return this.checkClientFolderCompliance(rule, agentOutput, agentContext);
      default:
        return { isCompliant: true }; // Default to compliant for unknown rules
    }
  }

  /**
   * Check project deliverable path compliance
   */
  checkProjectDeliverableCompliance(rule, agentOutput) {
    const filePathRegex = /\/projects\/[a-zA-Z0-9-]+\/deliverables\//;
    
    // Check if agent mentions file paths and if they follow the pattern
    const mentionedPaths = agentOutput.match(/\/[a-zA-Z0-9/-]+\.(js|md|html|css|json)/g) || [];
    
    for (const path of mentionedPaths) {
      if (!filePathRegex.test(path) && !path.includes('orchestrai-system/templates')) {
        return {
          isCompliant: false,
          violation: `File path ${path} does not follow deliverables structure`,
          recommendation: 'Use /projects/[uuid]/deliverables/ structure for output files'
        };
      }
    }
    
    return { isCompliant: true };
  }

  /**
   * Check template access compliance
   */
  checkTemplateAccessCompliance(rule, agentOutput) {
    const templateAccessRegex = /orchestrai-system\/templates\/global/;
    
    // Look for template references in output
    if (agentOutput.includes('template') && !templateAccessRegex.test(agentOutput)) {
      return {
        isCompliant: false,
        violation: 'Template access not using global template system',
        recommendation: 'Access templates from /orchestrai-system/templates/global/ only'
      };
    }
    
    return { isCompliant: true };
  }

  /**
   * Check client folder compliance
   */
  checkClientFolderCompliance(rule, agentOutput, agentContext) {
    if (!agentContext.projectUuid) {
      return { isCompliant: true }; // Cannot validate without project context
    }
    
    // Check if agent mentions creating new projects when project context exists
    const newProjectRegex = /create.*new.*project|new.*project.*folder/i;
    
    if (newProjectRegex.test(agentOutput)) {
      return {
        isCompliant: false,
        violation: 'Agent attempting to create new project when existing project context available',
        recommendation: `Use existing project ${agentContext.projectUuid} for all deliverables`
      };
    }
    
    return { isCompliant: true };
  }
}

module.exports = ClaudeMdRuleInjector;