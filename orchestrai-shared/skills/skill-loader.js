/**
 * Progressive Disclosure Skill Loader
 *
 * Reduces token overhead from ~254K (all agents) to ~5K (lightweight index)
 * Loads full skill prompts only when needed (on-demand)
 *
 * Token Savings: 95% reduction in agent definition overhead
 */

const fs = require('fs');
const path = require('path');
const logger = require('../logging/logger').forDomain('skill-loader');

class SkillLoader {
  constructor() {
    this.skillsRoot = path.join(__dirname, '../../orchestrai-skills');
    this.loadedSkills = new Map();
    this.skillIndex = null;
    this.indexBuilt = false;
  }

  /**
   * Build lightweight index (just overviews, not full content)
   * This stays in context - full prompts load on demand
   *
   * @returns {Object} Lightweight skill index (~5000 tokens)
   */
  buildLightweightIndex() {
    if (this.indexBuilt && this.skillIndex) {
      return this.skillIndex;
    }

    logger.info('Building lightweight skill index...');
    const index = {};
    const startTime = Date.now();

    try {
      const domains = fs.readdirSync(this.skillsRoot);

      for (const domain of domains) {
        const domainPath = path.join(this.skillsRoot, domain);

        // Skip non-directories and hidden files
        if (!fs.statSync(domainPath).isDirectory() || domain.startsWith('.')) {
          continue;
        }

        // Check for domain SKILL.md
        const domainSkillMd = path.join(domainPath, 'SKILL.md');

        index[domain] = {
          overview: fs.existsSync(domainSkillMd)
            ? this.extractOverview(fs.readFileSync(domainSkillMd, 'utf8'))
            : `${domain} domain skills`,
          keywords: fs.existsSync(domainSkillMd)
            ? this.extractKeywords(fs.readFileSync(domainSkillMd, 'utf8'))
            : [domain],
          subskills: this.indexSubskills(domainPath)
        };
      }

      this.skillIndex = index;
      this.indexBuilt = true;

      const duration = Date.now() - startTime;
      const skillCount = Object.values(index).reduce((sum, d) => sum + d.subskills.length, 0);

      logger.info(`Skill index built: ${Object.keys(index).length} domains, ${skillCount} skills in ${duration}ms`);

      return index;

    } catch (error) {
      logger.error('Failed to build skill index:', error);
      throw error;
    }
  }

  /**
   * Search for relevant skills based on task query
   *
   * @param {string} query - User's task description
   * @returns {Array} Matching skills sorted by relevance score
   */
  search(query) {
    if (!this.indexBuilt) {
      this.buildLightweightIndex();
    }

    const matches = [];
    const queryLower = query.toLowerCase();

    for (const [domain, info] of Object.entries(this.skillIndex)) {
      const score = this.calculateRelevance(queryLower, info);

      if (score > 0.3) {
        matches.push({
          domain,
          score: Math.round(score * 100) / 100,
          overview: info.overview,
          keywords: info.keywords,
          skills: info.subskills.map(s => s.name)
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Load full skill content on demand
   * This is the "progressive disclosure" - only loaded when needed
   *
   * @param {string} domain - Domain name (e.g., 'seo', 'content')
   * @param {string} skillName - Skill name (e.g., 'keyword-research')
   * @returns {string} Full skill prompt
   */
  loadSkill(domain, skillName) {
    const key = `${domain}/${skillName}`;

    // Return cached if already loaded
    if (this.loadedSkills.has(key)) {
      logger.debug(`Returning cached skill: ${key}`);
      return this.loadedSkills.get(key);
    }

    const skillPath = path.join(this.skillsRoot, domain, skillName);
    const promptPath = path.join(skillPath, 'prompts/main-prompt.md');

    if (!fs.existsSync(promptPath)) {
      throw new Error(`Skill not found: ${key} (expected: ${promptPath})`);
    }

    logger.info(`Loading skill on-demand: ${key}`);
    const fullPrompt = fs.readFileSync(promptPath, 'utf8');

    // Cache for subsequent use
    this.loadedSkills.set(key, fullPrompt);

    return fullPrompt;
  }

  /**
   * Extract overview section from SKILL.md
   *
   * @param {string} content - SKILL.md content
   * @returns {string} Overview text (~100-300 chars)
   */
  extractOverview(content) {
    const match = content.match(/## Overview\n\n(.*?)(?=\n\n##|\n\n$)/s);
    return match ? match[1].trim().substring(0, 300) : '';
  }

  /**
   * Extract keywords from SKILL.md
   *
   * @param {string} content - SKILL.md content
   * @returns {Array<string>} Keywords
   */
  extractKeywords(content) {
    const match = content.match(/Keywords?: (.*)/i);
    return match ? match[1].split(',').map(k => k.trim()) : [];
  }

  /**
   * Index subskills in a domain directory
   *
   * @param {string} domainPath - Path to domain directory
   * @returns {Array} Subskill metadata
   */
  indexSubskills(domainPath) {
    const subskills = [];

    try {
      const items = fs.readdirSync(domainPath);

      for (const item of items) {
        const itemPath = path.join(domainPath, item);

        // Skip files and hidden directories
        if (!fs.statSync(itemPath).isDirectory() || item.startsWith('.')) {
          continue;
        }

        const skillMd = path.join(itemPath, 'SKILL.md');

        if (fs.existsSync(skillMd)) {
          const content = fs.readFileSync(skillMd, 'utf8');
          subskills.push({
            name: item,
            overview: this.extractOverview(content).substring(0, 200) + '...'
          });
        }
      }
    } catch (error) {
      logger.warn(`Failed to index subskills in ${domainPath}:`, error.message);
    }

    return subskills;
  }

  /**
   * Calculate relevance score between query and skill
   *
   * @param {string} query - Lowercase query string
   * @param {Object} skillInfo - Skill metadata
   * @returns {number} Relevance score (0-1)
   */
  calculateRelevance(query, skillInfo) {
    let score = 0;

    // Check keywords (highest weight)
    for (const keyword of skillInfo.keywords) {
      if (query.includes(keyword.toLowerCase())) {
        score += 0.3;
      }
    }

    // Check overview
    if (skillInfo.overview && skillInfo.overview.toLowerCase().includes(query)) {
      score += 0.2;
    }

    // Check subskills
    for (const subskill of skillInfo.subskills) {
      if (subskill.name.toLowerCase().includes(query) ||
          query.includes(subskill.name.toLowerCase())) {
        score += 0.15;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get lightweight index for context
   * Total: ~5000 tokens vs 254000+ for all agents
   *
   * @returns {Object} Context-friendly skill summary
   */
  getContextIndex() {
    if (!this.indexBuilt) {
      this.buildLightweightIndex();
    }

    const summary = {};

    for (const [domain, info] of Object.entries(this.skillIndex)) {
      summary[domain] = {
        overview: info.overview,
        skills: info.subskills.map(s => s.name),
        keywords: info.keywords.slice(0, 5) // Top 5 keywords only
      };
    }

    return summary;
  }

  /**
   * Get statistics about the skill system
   *
   * @returns {Object} Statistics
   */
  getStats() {
    if (!this.indexBuilt) {
      this.buildLightweightIndex();
    }

    const stats = {
      domains: Object.keys(this.skillIndex).length,
      totalSkills: 0,
      loadedSkills: this.loadedSkills.size,
      averageSkillsPerDomain: 0
    };

    for (const domain of Object.values(this.skillIndex)) {
      stats.totalSkills += domain.subskills.length;
    }

    stats.averageSkillsPerDomain = Math.round(
      stats.totalSkills / stats.domains * 10
    ) / 10;

    return stats;
  }

  /**
   * Clear loaded skills cache
   */
  clearCache() {
    this.loadedSkills.clear();
    logger.info('Skill cache cleared');
  }

  /**
   * Rebuild index (useful after adding new skills)
   */
  rebuildIndex() {
    this.indexBuilt = false;
    this.skillIndex = null;
    this.clearCache();
    return this.buildLightweightIndex();
  }
}

module.exports = SkillLoader;
