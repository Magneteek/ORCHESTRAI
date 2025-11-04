/**
 * Compliance Agents Index
 *
 * Centralized export of all real-time compliance monitoring agents.
 * These agents run embedded within parallel streams to catch quality issues
 * during creation (shift-left approach).
 */

const BaseComplianceAgent = require('./base-compliance-agent');
const CodeQualityAgent = require('./code-quality-agent');
const ContentQualityAgent = require('./content-quality-agent');
const {
  AccessibilityAgent,
  SecurityAgent,
  PerformanceAgent
} = require('./accessibility-security-performance-agents');

/**
 * ComplianceAgentFactory
 * Factory for creating appropriate compliance agents based on stream type
 */
class ComplianceAgentFactory {
  static createAgents(streamType, config = {}) {
    const agents = [];

    switch (streamType) {
      case 'frontend':
      case 'development':
      case 'web-development':
        agents.push(
          new CodeQualityAgent(config),
          new AccessibilityAgent(config),
          new SecurityAgent(config),
          new PerformanceAgent(config)
        );
        break;

      case 'backend':
      case 'api':
        agents.push(
          new CodeQualityAgent(config),
          new SecurityAgent(config),
          new PerformanceAgent(config)
        );
        break;

      case 'content':
      case 'copywriting':
      case 'article-writing':
        agents.push(
          new ContentQualityAgent(config)
        );
        break;

      case 'seo':
      case 'keyword-research':
        agents.push(
          new ContentQualityAgent({
            ...config,
            enableSEOValidation: true,
            enableReadabilityChecks: true
          })
        );
        break;

      case 'design':
      case 'ui-ux':
        agents.push(
          new AccessibilityAgent(config)
        );
        break;

      default:
        // For unknown types, add basic compliance
        agents.push(
          new CodeQualityAgent(config)
        );
    }

    return agents;
  }

  /**
   * Create specific agent by type
   */
  static createAgent(agentType, config = {}) {
    switch (agentType) {
      case 'code-quality':
        return new CodeQualityAgent(config);

      case 'content-quality':
        return new ContentQualityAgent(config);

      case 'accessibility':
        return new AccessibilityAgent(config);

      case 'security':
        return new SecurityAgent(config);

      case 'performance':
        return new PerformanceAgent(config);

      default:
        throw new Error(`Unknown compliance agent type: ${agentType}`);
    }
  }

  /**
   * Get all available agent types
   */
  static getAvailableAgentTypes() {
    return [
      'code-quality',
      'content-quality',
      'accessibility',
      'security',
      'performance'
    ];
  }
}

module.exports = {
  // Base class
  BaseComplianceAgent,

  // Specialized agents
  CodeQualityAgent,
  ContentQualityAgent,
  AccessibilityAgent,
  SecurityAgent,
  PerformanceAgent,

  // Factory
  ComplianceAgentFactory
};
