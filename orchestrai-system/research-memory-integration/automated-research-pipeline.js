/**
 * ORCHESTRAI Automated Research-to-Memory Integration Pipeline
 * 
 * Automatically monitors client-intelligence folder and integrates research data
 * into crystalline memory system for seamless agent access
 */

const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar'); // File system watcher
const { v4: uuidv4 } = require('uuid');

class AutomatedResearchIntegration {
  constructor(memoryManager, mcpManager) {
    this.memoryManager = memoryManager;
    this.mcpManager = mcpManager;
    this.watchers = new Map();
    this.integrationQueue = [];
    this.isProcessing = false;
    
    // Integration patterns for different research types
    this.integrationPatterns = {
      'psychographic': {
        memoryPool: 'psychographic-intelligence',
        importance: 0.95,
        entityType: 'PsychographicSegment',
        processingFn: this.processPsychographicData.bind(this)
      },
      'seo': {
        memoryPool: 'seo-intelligence', 
        importance: 0.90,
        entityType: 'SEOResearch',
        processingFn: this.processSEOData.bind(this)
      },
      'semantic': {
        memoryPool: 'semantic-intelligence',
        importance: 0.88,
        entityType: 'SemanticClustering',
        processingFn: this.processSemanticData.bind(this)
      },
      'competitive': {
        memoryPool: 'competitive-intelligence',
        importance: 0.85,
        entityType: 'CompetitiveAnalysis',
        processingFn: this.processCompetitiveData.bind(this)
      },
      'content-strategy': {
        memoryPool: 'content-intelligence',
        importance: 0.87,
        entityType: 'ContentStrategy',
        processingFn: this.processContentStrategyData.bind(this)
      }
    };
  }

  /**
   * Start monitoring all project client-intelligence folders
   */
  async startAutomaticMonitoring(projectsBasePath = '/Users/kris/CLAUDEtools/ORCHESTRAI/projects') {
    console.log('🔍 Starting Automated Research Integration Pipeline...');
    
    try {
      const projects = await fs.readdir(projectsBasePath);
      
      for (const project of projects) {
        const projectPath = path.join(projectsBasePath, project);
        const clientIntelligencePath = path.join(projectPath, 'client-intelligence');
        const deliverablesSeoPath = path.join(projectPath, 'deliverables', 'seo');
        
        // Check if paths exist
        try {
          await fs.access(clientIntelligencePath);
          await this.watchClientIntelligenceFolder(project, clientIntelligencePath);
        } catch (error) {
          console.log(`⚠️  No client-intelligence folder for ${project}`);
        }
        
        try {
          await fs.access(deliverablesSeoPath);
          await this.watchClientIntelligenceFolder(project, deliverablesSeoPath);
        } catch (error) {
          console.log(`⚠️  No deliverables/seo folder for ${project}`);
        }
      }
      
      console.log(`✅ Monitoring ${this.watchers.size} project folders for research data`);
      
    } catch (error) {
      console.error('❌ Error starting automatic monitoring:', error);
    }
  }

  /**
   * Watch a specific client-intelligence folder for changes
   */
  async watchClientIntelligenceFolder(projectId, folderPath) {
    const watcher = chokidar.watch(folderPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: false
    });

    watcher
      .on('add', (filePath) => this.handleFileChange('add', projectId, filePath))
      .on('change', (filePath) => this.handleFileChange('change', projectId, filePath))
      .on('unlink', (filePath) => this.handleFileChange('unlink', projectId, filePath));

    this.watchers.set(projectId, watcher);
    
    // Process existing files on startup
    await this.processExistingResearchFiles(projectId, folderPath);
  }

  /**
   * Process existing research files when starting monitoring
   */
  async processExistingResearchFiles(projectId, folderPath) {
    try {
      const files = await this.getAllResearchFiles(folderPath);
      
      for (const filePath of files) {
        await this.handleFileChange('add', projectId, filePath);
      }
      
      console.log(`📚 Processed ${files.length} existing research files for ${projectId}`);
    } catch (error) {
      console.error(`❌ Error processing existing files for ${projectId}:`, error);
    }
  }

  /**
   * Recursively get all research files
   */
  async getAllResearchFiles(folderPath) {
    const files = [];
    
    try {
      const items = await fs.readdir(folderPath);
      
      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          files.push(...await this.getAllResearchFiles(itemPath));
        } else if (this.isResearchFile(itemPath)) {
          files.push(itemPath);
        }
      }
    } catch (error) {
      // Folder doesn't exist or not accessible
    }
    
    return files;
  }

  /**
   * Handle file system changes
   */
  async handleFileChange(action, projectId, filePath) {
    if (!this.isResearchFile(filePath)) return;
    
    console.log(`🔄 Research file ${action}: ${path.basename(filePath)} in ${projectId}`);
    
    this.integrationQueue.push({
      action,
      projectId,
      filePath,
      timestamp: Date.now()
    });
    
    if (!this.isProcessing) {
      await this.processIntegrationQueue();
    }
  }

  /**
   * Check if file is a research file we should monitor
   */
  isResearchFile(filePath) {
    const filename = path.basename(filePath).toLowerCase();
    const researchPatterns = [
      'psychographic', 'seo', 'semantic', 'competitive', 
      'keyword', 'content-strategy', 'market-analysis',
      'clustering', 'research', 'intelligence'
    ];
    
    return filename.endsWith('.json') || filename.endsWith('.md') && 
           researchPatterns.some(pattern => filename.includes(pattern));
  }

  /**
   * Process the integration queue
   */
  async processIntegrationQueue() {
    this.isProcessing = true;
    
    while (this.integrationQueue.length > 0) {
      const task = this.integrationQueue.shift();
      
      try {
        await this.processIntegrationTask(task);
      } catch (error) {
        console.error(`❌ Error processing integration task:`, error);
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Process a single integration task
   */
  async processIntegrationTask({ action, projectId, filePath }) {
    try {
      if (action === 'unlink') {
        // Handle file deletion - remove from memory
        return await this.removeFromMemory(projectId, filePath);
      }
      
      // Read and parse the file
      const fileContent = await fs.readFile(filePath, 'utf8');
      let data;
      
      if (filePath.endsWith('.json')) {
        data = JSON.parse(fileContent);
      } else {
        data = { content: fileContent, type: 'markdown' };
      }
      
      // Determine research type from filename/content
      const researchType = this.determineResearchType(filePath, data);
      const pattern = this.integrationPatterns[researchType];
      
      if (!pattern) {
        console.log(`⚠️  Unknown research type for ${path.basename(filePath)}`);
        return;
      }
      
      // Process the data using the appropriate function
      const entities = await pattern.processingFn(projectId, data, filePath);
      
      // Store in memory system
      for (const entity of entities) {
        await this.storeInMemory(projectId, entity, pattern);
      }
      
      console.log(`✅ Integrated ${entities.length} entities from ${path.basename(filePath)}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
    }
  }

  /**
   * Determine research type from file path and content
   */
  determineResearchType(filePath, data) {
    const filename = path.basename(filePath).toLowerCase();
    
    if (filename.includes('psychographic')) return 'psychographic';
    if (filename.includes('semantic') || filename.includes('clustering')) return 'semantic';
    if (filename.includes('seo') || filename.includes('keyword')) return 'seo';
    if (filename.includes('competitive') || filename.includes('competitor')) return 'competitive';
    if (filename.includes('content-strategy') || filename.includes('content-plan')) return 'content-strategy';
    
    // Analyze content for type determination
    const content = JSON.stringify(data).toLowerCase();
    
    if (content.includes('psychographic') || content.includes('segments')) return 'psychographic';
    if (content.includes('semantic') || content.includes('clustering')) return 'semantic';
    if (content.includes('keyword') || content.includes('search volume')) return 'seo';
    if (content.includes('competitor') || content.includes('competition')) return 'competitive';
    
    return 'seo'; // Default fallback
  }

  /**
   * Process psychographic research data
   */
  async processPsychographicData(projectId, data, filePath) {
    const entities = [];
    
    if (data.psihografskiSegmenti) {
      for (const [segmentName, segmentData] of Object.entries(data.psihografskiSegmenti)) {
        entities.push({
          name: `${projectId}_psychographic_${segmentName}`,
          entityType: 'PsychographicSegment',
          observations: [
            `Segment: ${segmentName} (${segmentData.odstotek}% of market)`,
            `Demographics: ${segmentData.demografija}`,
            `Core Values: ${segmentData.vrednote?.join(', ')}`,
            `Pain Points: ${segmentData.bolečineInFrustracije?.join('; ')}`,
            `Motivations: ${segmentData.motivacijeInAspiracije?.join('; ')}`,
            `Search Patterns: ${segmentData.tipičniIskaljniIzrazi?.join(', ')}`,
            `Emotional Tones: ${segmentData.emocionalniToni}`,
            `Content Approach: ${segmentData.vsebninskiPristop}`
          ].filter(obs => obs && !obs.includes('undefined'))
        });
      }
    }
    
    // Add cultural values
    if (data.slovenskeKulturneVrednote) {
      entities.push({
        name: `${projectId}_cultural_values`,
        entityType: 'CulturalValues',
        observations: [
          `Traditional Values: ${Object.keys(data.slovenskeKulturneVrednote.tradicionalneVrednote).join(', ')}`,
          `Regional Differences: ${Object.keys(data.slovenskeKulturneVrednote.regionalneRazlike).join(', ')}`,
          `Total Keywords Analyzed: ${data.totalKeywordsAnalyzed}`,
          `Confidence Score: ${data.confidenceScore}%`
        ]
      });
    }
    
    return entities;
  }

  /**
   * Process SEO research data
   */
  async processSEOData(projectId, data, filePath) {
    const entities = [];
    
    // Primary keywords
    if (data.targetKeywords) {
      for (const keyword of data.targetKeywords) {
        entities.push({
          name: `${projectId}_keyword_${keyword.keyword.replace(/\s+/g, '_')}`,
          entityType: 'TargetKeyword',
          observations: [
            `Keyword: ${keyword.keyword}`,
            `Search Volume: ${keyword.searchVolume}`,
            `Difficulty: ${keyword.difficulty}`,
            `Intent: ${keyword.intent}`,
            `Opportunity Score: ${keyword.opportunityScore}`
          ]
        });
      }
    }
    
    // Semantic clustering
    if (data.semanticFlow) {
      entities.push({
        name: `${projectId}_semantic_flow`,
        entityType: 'SemanticFlow',
        observations: [
          `Semantic Progression: ${data.semanticFlow}`,
          `Content Structure Optimized: ${data.contentStructure ? 'Yes' : 'No'}`,
          `Psychographic Alignment: ${data.psychographicAlignment ? 'Yes' : 'No'}`
        ]
      });
    }
    
    return entities;
  }

  /**
   * Process semantic clustering data
   */
  async processSemanticData(projectId, data, filePath) {
    const entities = [];
    
    if (data.crystallineMemoryUpdate?.newMemoryNodes) {
      for (const node of data.crystallineMemoryUpdate.newMemoryNodes) {
        entities.push({
          name: `${projectId}_${node.nodeId}`,
          entityType: 'SemanticCluster',
          observations: [
            `Analysis: ${node.content.analysis}`,
            `Key Findings: ${node.content.keyFindings?.join('; ')}`,
            `Semantic Bridges: ${JSON.stringify(node.content.semanticBridges)}`,
            `Psychographic Alignment: ${JSON.stringify(node.content.psychographicAlignment)}`
          ].filter(obs => obs && !obs.includes('undefined'))
        });
      }
    }
    
    return entities;
  }

  /**
   * Process competitive analysis data
   */
  async processCompetitiveData(projectId, data, filePath) {
    const entities = [];
    
    if (data.competitiveGaps) {
      entities.push({
        name: `${projectId}_competitive_gaps`,
        entityType: 'CompetitiveGaps',
        observations: [
          `Total Opportunities: ${data.competitiveGaps.length}`,
          `High Priority Gaps: ${data.competitiveGaps.filter(gap => gap.opportunityScore > 8.5).length}`,
          `Average Opportunity Score: ${(data.competitiveGaps.reduce((sum, gap) => sum + gap.opportunityScore, 0) / data.competitiveGaps.length).toFixed(1)}`
        ]
      });
    }
    
    return entities;
  }

  /**
   * Process content strategy data
   */
  async processContentStrategyData(projectId, data, filePath) {
    const entities = [];
    
    if (data.contentStrategy) {
      entities.push({
        name: `${projectId}_content_strategy`,
        entityType: 'ContentStrategy',
        observations: [
          `Strategy Type: ${data.contentStrategy.type}`,
          `Target Audience: ${data.contentStrategy.targetAudience}`,
          `Content Pillars: ${data.contentStrategy.pillars?.join(', ')}`,
          `Distribution Channels: ${data.contentStrategy.channels?.join(', ')}`
        ].filter(obs => obs && !obs.includes('undefined'))
      });
    }
    
    return entities;
  }

  /**
   * Store entity in crystalline memory system
   */
  async storeInMemory(projectId, entity, pattern) {
    try {
      // Store in crystalline memory
      const nodeId = await this.memoryManager.storeMemory(
        pattern.memoryPool,
        entity,
        {
          importance: pattern.importance,
          entityType: pattern.entityType,
          projectId: projectId,
          lastUpdated: Date.now()
        }
      );

      // Also store in MCP memory system for agent access
      if (this.mcpManager && this.mcpManager.isMemoryAvailable()) {
        await this.mcpManager.createMemoryEntity({
          name: entity.name,
          entityType: entity.entityType,
          observations: entity.observations
        });
      }

      return nodeId;
    } catch (error) {
      console.error('❌ Error storing in memory:', error);
      return null;
    }
  }

  /**
   * Remove from memory when file is deleted
   */
  async removeFromMemory(projectId, filePath) {
    // Implementation for removing memory nodes when research files are deleted
    console.log(`🗑️  Removing memory nodes for deleted file: ${path.basename(filePath)}`);
  }

  /**
   * Get integration statistics
   */
  getIntegrationStats() {
    return {
      watchedProjects: this.watchers.size,
      queueLength: this.integrationQueue.length,
      isProcessing: this.isProcessing,
      supportedTypes: Object.keys(this.integrationPatterns)
    };
  }

  /**
   * Stop monitoring (cleanup)
   */
  async stopMonitoring() {
    for (const [projectId, watcher] of this.watchers) {
      await watcher.close();
      console.log(`🛑 Stopped monitoring ${projectId}`);
    }
    this.watchers.clear();
  }
}

module.exports = AutomatedResearchIntegration;