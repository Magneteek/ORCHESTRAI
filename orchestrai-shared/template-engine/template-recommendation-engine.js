// Template Recommendation Engine - ORCHESTRAI Phase 3
// AI-powered template suggestion system for domain-specific content generation
// Integrates with Crystalline Memory and Domain Agent capabilities

const path = require('path');
const fs = require('fs').promises;
const EventEmitter = require('events');

class TemplateRecommendationEngine extends EventEmitter {
  constructor(crystallineMemory, domainAgentManager) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.domainAgentManager = domainAgentManager;
    this.templateBasePath = path.join(process.cwd(), 'orchestrai-system', 'templates');
    this.versionsPath = path.join(this.templateBasePath, 'version-control', 'template-versions.json');
    this.analyticsPath = path.join(this.templateBasePath, 'version-control', 'usage-analytics.json');
    
    // Template categories mapped to domain capabilities
    this.templateMapping = {
      'seo': {
        'keyword-research': ['content-templates/seo-structures'],
        'competitor-analysis': ['content-templates/seo-structures'],
        'content-optimization': ['content-templates/copywriting-frameworks', 'content-templates/seo-structures'],
        'technical-audit': ['code-patterns/api-patterns', 'content-templates/seo-structures']
      },
      'writer': {
        'content-creation': ['content-templates/copywriting-frameworks', 'content-templates/multi-language-patterns'],
        'blog-writing': ['content-templates/copywriting-frameworks', 'content-templates/seo-structures'],
        'technical-writing': ['content-templates/copywriting-frameworks'],
        'multilingual-content': ['content-templates/multi-language-patterns']
      },
      'webdev': {
        'frontend-development': ['code-patterns/react-components', 'design-systems/component-libraries'],
        'api-development': ['code-patterns/api-patterns', 'code-patterns/database-schemas'],
        'deployment': ['code-patterns/deployment-configs'],
        'ui-design': ['wireframes/web-app-layouts', 'design-systems/style-guides']
      },
      'research': {
        'data-analysis': ['wireframes/dashboard-templates'],
        'report-generation': ['content-templates/copywriting-frameworks'],
        'visualization': ['wireframes/dashboard-templates']
      },
      'maintenance': {
        'system-monitoring': ['code-patterns/deployment-configs'],
        'performance-optimization': ['code-patterns/api-patterns'],
        'documentation': ['content-templates/copywriting-frameworks']
      },
      'copywriting': {
        'direct-response-copy': ['content-templates/copywriting-frameworks/direct-response'],
        'cold-email-sequences': ['content-templates/copywriting-frameworks/cold-email'],
        'nurture-email-sequences': ['content-templates/copywriting-frameworks/nurture-email'],
        'sales-funnel-copy': ['content-templates/copywriting-frameworks/sales-funnel'],
        'followup-automation': ['content-templates/copywriting-frameworks/follow-up-automation'],
        'conversion-optimization': ['content-templates/copywriting-frameworks/direct-response', 'content-templates/copywriting-frameworks/sales-funnel'],
        'email-marketing': ['content-templates/copywriting-frameworks/cold-email', 'content-templates/copywriting-frameworks/nurture-email'],
        'personalization-at-scale': ['content-templates/copywriting-frameworks/cold-email', 'content-templates/copywriting-frameworks/follow-up-automation']
      }
    };
    
    // AI recommendation weights
    this.recommendationWeights = {
      domainRelevance: 0.4,
      usageHistory: 0.3,
      taskComplexity: 0.2,
      templateQuality: 0.1
    };
    
    this.templateCache = new Map();
    this.usageAnalytics = {};
    
    this.initialize();
  }

  async initialize() {
    console.log('🎯 Initializing Template Recommendation Engine...');
    
    try {
      await this.loadTemplateVersions();
      await this.loadUsageAnalytics();
      await this.scanTemplateDirectories();
      
      console.log('✅ Template Recommendation Engine initialized');
      this.emit('initialized', {
        totalTemplates: this.templateCache.size,
        domains: Object.keys(this.templateMapping).length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Template Recommendation Engine:', error);
      throw error;
    }
  }

  async loadTemplateVersions() {
    try {
      const versionsData = await fs.readFile(this.versionsPath, 'utf8');
      this.templateVersions = JSON.parse(versionsData);
    } catch (error) {
      console.warn('⚠️ No template versions found, creating default structure');
      this.templateVersions = { version: '1.0.0', templates: {} };
    }
  }

  async loadUsageAnalytics() {
    try {
      const analyticsData = await fs.readFile(this.analyticsPath, 'utf8');
      this.usageAnalytics = JSON.parse(analyticsData);
    } catch (error) {
      console.warn('⚠️ No usage analytics found, starting fresh');
      this.usageAnalytics = {
        totalRecommendations: 0,
        templateUsage: {},
        domainPreferences: {},
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async scanTemplateDirectories() {
    const categories = ['wireframes', 'design-systems', 'code-patterns', 'content-templates'];
    
    for (const category of categories) {
      const categoryPath = path.join(this.templateBasePath, 'global', category);
      
      try {
        const subcategories = await fs.readdir(categoryPath);
        
        for (const subcategory of subcategories) {
          const subcategoryPath = path.join(categoryPath, subcategory);
          const stats = await fs.stat(subcategoryPath);
          
          if (stats.isDirectory()) {
            const templateKey = `${category}/${subcategory}`;
            const templates = await this.loadTemplatesFromDirectory(subcategoryPath);
            
            this.templateCache.set(templateKey, {
              category,
              subcategory,
              path: subcategoryPath,
              templates,
              lastModified: stats.mtime,
              quality: this.calculateTemplateQuality(templates)
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not scan category ${category}:`, error.message);
      }
    }
    
    console.log(`📋 Scanned ${this.templateCache.size} template categories`);
  }

  async loadTemplatesFromDirectory(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      const templates = [];
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          templates.push({
            name: file,
            path: filePath,
            size: stats.size,
            lastModified: stats.mtime,
            extension: path.extname(file)
          });
        }
      }
      
      return templates;
    } catch (error) {
      return [];
    }
  }

  calculateTemplateQuality(templates) {
    if (templates.length === 0) return 0;
    
    // Quality factors: number of templates, recent updates, file sizes
    const templateCount = templates.length;
    const avgSize = templates.reduce((sum, t) => sum + t.size, 0) / templates.length;
    const recentUpdates = templates.filter(t => 
      Date.now() - t.lastModified.getTime() < 30 * 24 * 60 * 60 * 1000 // 30 days
    ).length;
    
    return Math.min(100, (templateCount * 10) + (recentUpdates * 5) + Math.min(avgSize / 100, 20));
  }

  async recommendTemplates(taskData) {
    const { domain, taskType, complexity = 'medium', context = {} } = taskData;
    
    console.log(`🎯 Generating template recommendations for ${domain}:${taskType}`);
    
    try {
      // Get domain-specific template mappings
      const domainMappings = this.templateMapping[domain] || {};
      const relevantCategories = domainMappings[taskType] || [];
      
      // Generate scored recommendations
      const recommendations = [];
      
      for (const templateCategory of this.templateCache.keys()) {
        const templateData = this.templateCache.get(templateCategory);
        const score = this.calculateRecommendationScore(
          templateCategory,
          templateData,
          domain,
          taskType,
          complexity,
          relevantCategories
        );
        
        if (score > 0) {
          recommendations.push({
            templateCategory,
            ...templateData,
            score,
            reason: this.generateRecommendationReason(templateCategory, domain, taskType, score)
          });
        }
      }
      
      // Sort by score and return top recommendations
      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      // Update usage analytics
      await this.updateUsageAnalytics(domain, taskType, sortedRecommendations);
      
      // Store recommendation in crystalline memory
      await this.storeRecommendationMemory(taskData, sortedRecommendations);
      
      console.log(`✅ Generated ${sortedRecommendations.length} template recommendations`);
      
      this.emit('recommendationsGenerated', {
        domain,
        taskType,
        recommendationCount: sortedRecommendations.length,
        topRecommendation: sortedRecommendations[0]?.templateCategory,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        recommendations: sortedRecommendations,
        metadata: {
          domain,
          taskType,
          complexity,
          totalCandidates: recommendations.length,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('❌ Template recommendation failed:', error);
      return {
        success: false,
        error: error.message,
        fallbackRecommendations: await this.getFallbackRecommendations(domain)
      };
    }
  }

  calculateRecommendationScore(templateCategory, templateData, domain, taskType, complexity, relevantCategories) {
    let score = 0;
    
    // Domain relevance weight (40%)
    const domainRelevance = relevantCategories.includes(templateCategory) ? 100 : 
      this.calculateSemanticSimilarity(templateCategory, domain, taskType);
    score += domainRelevance * this.recommendationWeights.domainRelevance;
    
    // Usage history weight (30%)
    const usageHistory = this.getUsageScore(templateCategory);
    score += usageHistory * this.recommendationWeights.usageHistory;
    
    // Task complexity weight (20%)
    const complexityMatch = this.getComplexityMatch(templateData, complexity);
    score += complexityMatch * this.recommendationWeights.taskComplexity;
    
    // Template quality weight (10%)
    score += templateData.quality * this.recommendationWeights.templateQuality;
    
    return Math.round(score);
  }

  calculateSemanticSimilarity(templateCategory, domain, taskType) {
    // Simple keyword-based similarity for now
    const templateKeywords = templateCategory.toLowerCase().split(/[-\/]/);
    const domainKeywords = [domain, taskType].join(' ').toLowerCase().split(/[-\s]/);
    
    const matches = templateKeywords.filter(keyword => 
      domainKeywords.some(domainKeyword => 
        domainKeyword.includes(keyword) || keyword.includes(domainKeyword)
      )
    );
    
    return (matches.length / templateKeywords.length) * 100;
  }

  getUsageScore(templateCategory) {
    const usage = this.usageAnalytics.templateUsage[templateCategory];
    if (!usage) return 0;
    
    const totalUsage = Object.values(this.usageAnalytics.templateUsage)
      .reduce((sum, count) => sum + count, 0);
    
    return totalUsage > 0 ? (usage / totalUsage) * 100 : 0;
  }

  getComplexityMatch(templateData, complexity) {
    const templateCount = templateData.templates.length;
    
    const complexityMapping = {
      'low': [0, 2],
      'medium': [2, 5],
      'high': [5, Infinity]
    };
    
    const [min, max] = complexityMapping[complexity] || complexityMapping['medium'];
    return templateCount >= min && templateCount <= max ? 100 : 50;
  }

  generateRecommendationReason(templateCategory, domain, taskType, score) {
    const reasons = [];
    
    if (score > 80) {
      reasons.push('Perfect match for domain and task type');
    } else if (score > 60) {
      reasons.push('High relevance to requested task');
    } else if (score > 40) {
      reasons.push('Good general fit with some customization needed');
    } else {
      reasons.push('Basic template that can be adapted');
    }
    
    const [category, subcategory] = templateCategory.split('/');
    reasons.push(`Specialized for ${subcategory.replace(/-/g, ' ')}`);
    
    return reasons.join('. ');
  }

  async updateUsageAnalytics(domain, taskType, recommendations) {
    this.usageAnalytics.totalRecommendations++;
    
    if (!this.usageAnalytics.domainPreferences[domain]) {
      this.usageAnalytics.domainPreferences[domain] = {};
    }
    
    if (!this.usageAnalytics.domainPreferences[domain][taskType]) {
      this.usageAnalytics.domainPreferences[domain][taskType] = 0;
    }
    
    this.usageAnalytics.domainPreferences[domain][taskType]++;
    
    // Track recommended template categories
    for (const rec of recommendations) {
      if (!this.usageAnalytics.templateUsage[rec.templateCategory]) {
        this.usageAnalytics.templateUsage[rec.templateCategory] = 0;
      }
      this.usageAnalytics.templateUsage[rec.templateCategory]++;
    }
    
    this.usageAnalytics.lastUpdated = new Date().toISOString();
    
    // Save analytics (debounced)
    if (!this.saveAnalyticsTimeout) {
      this.saveAnalyticsTimeout = setTimeout(async () => {
        await this.saveUsageAnalytics();
        this.saveAnalyticsTimeout = null;
      }, 5000);
    }
  }

  async saveUsageAnalytics() {
    try {
      await fs.writeFile(this.analyticsPath, JSON.stringify(this.usageAnalytics, null, 2));
    } catch (error) {
      console.error('Failed to save usage analytics:', error);
    }
  }

  async storeRecommendationMemory(taskData, recommendations) {
    if (!this.crystallineMemory) return;
    
    try {
      await this.crystallineMemory.storeMemory('template-recommendations', {
        taskData,
        recommendations: recommendations.slice(0, 3), // Top 3
        generatedAt: new Date().toISOString(),
        domain: taskData.domain,
        taskType: taskData.taskType
      }, {
        domain: 'template-engine',
        category: 'recommendations',
        retention: 'medium-term'
      });
    } catch (error) {
      console.error('Failed to store recommendation memory:', error);
    }
  }

  async getFallbackRecommendations(domain) {
    // Return generic templates that are commonly useful
    const fallbacks = [
      'content-templates/copywriting-frameworks',
      'code-patterns/api-patterns',
      'design-systems/component-libraries'
    ];
    
    return fallbacks
      .filter(category => this.templateCache.has(category))
      .map(category => ({
        templateCategory: category,
        ...this.templateCache.get(category),
        score: 25,
        reason: 'Fallback recommendation - versatile template'
      }));
  }

  async getTemplateContent(templateCategory, templateName) {
    const templateData = this.templateCache.get(templateCategory);
    if (!templateData) {
      throw new Error(`Template category not found: ${templateCategory}`);
    }
    
    const template = templateData.templates.find(t => t.name === templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName} in ${templateCategory}`);
    }
    
    try {
      const content = await fs.readFile(template.path, 'utf8');
      return {
        content,
        metadata: template,
        category: templateData.category,
        subcategory: templateData.subcategory
      };
    } catch (error) {
      throw new Error(`Failed to read template content: ${error.message}`);
    }
  }

  getStatus() {
    return {
      initialized: this.templateCache.size > 0,
      templateCategories: this.templateCache.size,
      totalRecommendations: this.usageAnalytics.totalRecommendations || 0,
      supportedDomains: Object.keys(this.templateMapping),
      lastAnalyticsUpdate: this.usageAnalytics.lastUpdated,
      cacheSize: this.templateCache.size
    };
  }
}

module.exports = TemplateRecommendationEngine;