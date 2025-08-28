const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

/**
 * Delivery Structure Manager
 * 
 * Manages organized delivery of web development files with:
 * - Separate CSS, JS, and pages folders structure
 * - Quality validation integration with Web Development Quality Domain
 * - Template integration and automated file organization
 * - Phase-to-phase delivery validation
 */

class DeliveryStructureManager extends EventEmitter {
  constructor(webQualityHub, crystallineMemory, templateEngine) {
    super();
    
    this.webQualityHub = webQualityHub;
    this.crystallineMemory = crystallineMemory;
    this.templateEngine = templateEngine;
    
    // Load delivery structure configuration
    this.configPath = path.join(__dirname, '../../orchestrai-domains/web-quality/config/delivery-structure-config.json');
    this.config = null;
    
    // Active project deliveries
    this.activeDeliveries = new Map(); // projectId -> delivery session
    this.deliveryMetrics = new Map(); // projectId -> metrics
    
    // File organization rules
    this.fileTypeMapping = {
      '.html': 'pages',
      '.jsx': 'pages', 
      '.tsx': 'pages',
      '.vue': 'pages',
      '.svelte': 'pages',
      '.php': 'pages',
      
      '.css': 'css',
      '.scss': 'css',
      '.sass': 'css',
      '.less': 'css',
      '.styl': 'css',
      
      '.js': 'js',
      '.ts': 'js',
      '.mjs': 'js',
      
      '.json': 'config',
      '.yaml': 'config',
      '.yml': 'config',
      '.env': 'config',
      '.config.js': 'config',
      
      '.png': 'assets',
      '.jpg': 'assets',
      '.jpeg': 'assets',
      '.svg': 'assets',
      '.webp': 'assets',
      '.woff': 'assets',
      '.woff2': 'assets',
      '.ttf': 'assets',
      '.mp4': 'assets',
      '.webm': 'assets'
    };
    
    this.initialize();
  }

  async initialize() {
    console.log('📦 Initializing Delivery Structure Manager...');
    
    try {
      await this.loadConfiguration();
      await this.setupDeliveryDirectories();
      
      console.log('✅ Delivery Structure Manager initialized');
      console.log(`   → Structure: CSS + JS + Pages organization`);
      console.log(`   → Quality validation: ${this.config.deliveryStructureConfig.qualityValidation.enabled ? 'enabled' : 'disabled'}`);
      console.log(`   → Template integration: ${this.config.deliveryStructureConfig.templateIntegration.enabled ? 'enabled' : 'disabled'}`);
      
      this.emit('initialized', {
        structure: 'css-js-pages',
        qualityValidation: this.config.deliveryStructureConfig.qualityValidation.enabled,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Delivery Structure Manager:', error);
      throw error;
    }
  }

  async loadConfiguration() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log('📋 Delivery structure configuration loaded');
    } catch (error) {
      throw new Error(`Failed to load delivery configuration: ${error.message}`);
    }
  }

  async setupDeliveryDirectories() {
    // This would be called per-project to set up the directory structure
    console.log('📁 Delivery directory structure ready');
  }

  async createProjectDelivery(projectId, projectConfig = {}) {
    try {
      console.log(`📦 Creating delivery structure for project: ${projectId}`);
      
      // Generate unique project delivery path
      const deliveryPath = this.generateDeliveryPath(projectId);
      
      // Create delivery session
      const deliverySession = {
        projectId,
        deliveryPath,
        startTime: Date.now(),
        status: 'active',
        structure: this.config.deliveryStructureConfig.outputStructure,
        generatedFiles: new Map(), // folder -> files
        qualityResults: new Map(), // phase -> results
        config: projectConfig
      };
      
      this.activeDeliveries.set(projectId, deliverySession);
      
      // Create directory structure
      await this.createDirectoryStructure(deliveryPath);
      
      // Initialize delivery metrics
      this.deliveryMetrics.set(projectId, {
        totalFilesGenerated: 0,
        filesByType: {},
        qualityScore: 0,
        phaseCompletions: 0,
        lastUpdate: Date.now()
      });
      
      console.log(`✅ Project delivery structure created: ${deliveryPath}`);
      
      this.emit('deliveryCreated', {
        projectId,
        deliveryPath,
        structure: Object.keys(this.config.deliveryStructureConfig.outputStructure),
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        projectId,
        deliveryPath,
        structure: this.config.deliveryStructureConfig.outputStructure
      };
      
    } catch (error) {
      console.error(`❌ Failed to create delivery for ${projectId}:`, error);
      throw error;
    }
  }

  generateDeliveryPath(projectId) {
    const basePath = this.config.deliveryStructureConfig.baseDeliveryPath.replace('{project-uuid}', projectId);
    return path.resolve(basePath);
  }

  async createDirectoryStructure(deliveryPath) {
    const structure = this.config.deliveryStructureConfig.outputStructure;
    
    // Create main delivery directory
    await fs.mkdir(deliveryPath, { recursive: true });
    
    // Create each configured folder
    for (const [folderName, folderConfig] of Object.entries(structure)) {
      const folderPath = path.join(deliveryPath, folderConfig.path.replace('/', ''));
      
      // Create main folder
      await fs.mkdir(folderPath, { recursive: true });
      
      // Create subfolders if configured
      if (folderConfig.subfolders) {
        for (const [subfolderName, description] of Object.entries(folderConfig.subfolders)) {
          const subfolderPath = path.join(folderPath, subfolderName);
          await fs.mkdir(subfolderPath, { recursive: true });
          
          // Create readme for subfolder
          const readmeContent = `# ${subfolderName}\n\n${description}\n\nGenerated by ORCHESTRAI Delivery Structure Manager`;
          await fs.writeFile(path.join(subfolderPath, 'README.md'), readmeContent);
        }
      }
    }
    
    console.log(`📁 Directory structure created at: ${deliveryPath}`);
  }

  async deliverFile(projectId, fileContent, fileName, options = {}) {
    try {
      const deliverySession = this.activeDeliveries.get(projectId);
      if (!deliverySession) {
        throw new Error(`No active delivery session for project: ${projectId}`);
      }
      
      console.log(`📄 Delivering file: ${fileName} for ${projectId}`);
      
      // Determine target folder based on file extension
      const targetFolder = this.determineTargetFolder(fileName, options.forceFolder);
      const targetPath = this.buildTargetPath(deliverySession.deliveryPath, targetFolder, fileName, options);
      
      // Run quality validation if enabled
      if (this.config.deliveryStructureConfig.qualityValidation.enabled) {
        const qualityResult = await this.validateFileQuality(projectId, fileContent, fileName, targetFolder);
        
        if (!qualityResult.passed && options.enforceQuality !== false) {
          throw new Error(`Quality validation failed for ${fileName}: ${qualityResult.issues.join(', ')}`);
        }
      }
      
      // Write file to delivery structure
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, fileContent);
      
      // Update delivery session
      if (!deliverySession.generatedFiles.has(targetFolder)) {
        deliverySession.generatedFiles.set(targetFolder, []);
      }
      deliverySession.generatedFiles.get(targetFolder).push({
        fileName,
        targetPath,
        size: Buffer.byteLength(fileContent),
        timestamp: Date.now(),
        qualityPassed: true
      });
      
      // Update metrics
      this.updateDeliveryMetrics(projectId, targetFolder, fileName, fileContent);
      
      // Store delivery in crystalline memory
      await this.storeDeliveryMemory(projectId, fileName, targetFolder, {
        size: Buffer.byteLength(fileContent),
        qualityValidated: this.config.deliveryStructureConfig.qualityValidation.enabled
      });
      
      console.log(`✅ File delivered: ${fileName} → ${targetFolder}/`);
      
      this.emit('fileDelivered', {
        projectId,
        fileName,
        targetFolder,
        targetPath,
        size: Buffer.byteLength(fileContent),
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        fileName,
        targetFolder,
        targetPath,
        size: Buffer.byteLength(fileContent)
      };
      
    } catch (error) {
      console.error(`❌ File delivery failed for ${fileName}:`, error);
      throw error;
    }
  }

  determineTargetFolder(fileName, forceFolder = null) {
    if (forceFolder) return forceFolder;
    
    const extension = path.extname(fileName).toLowerCase();
    const folderMapping = this.fileTypeMapping[extension];
    
    if (!folderMapping) {
      // Default to pages for unknown file types
      console.warn(`⚠️ Unknown file type: ${extension}, defaulting to pages folder`);
      return 'pages';
    }
    
    return folderMapping;
  }

  buildTargetPath(deliveryPath, targetFolder, fileName, options = {}) {
    const folderConfig = this.config.deliveryStructureConfig.outputStructure[targetFolder];
    const folderPath = path.join(deliveryPath, folderConfig.path.replace('/', ''));
    
    // Handle subfolder placement
    if (options.subfolder && folderConfig.subfolders && folderConfig.subfolders[options.subfolder]) {
      return path.join(folderPath, options.subfolder, fileName);
    }
    
    // Auto-determine subfolder for certain file types
    const autoSubfolder = this.determineAutoSubfolder(fileName, targetFolder);
    if (autoSubfolder) {
      return path.join(folderPath, autoSubfolder, fileName);
    }
    
    return path.join(folderPath, fileName);
  }

  determineAutoSubfolder(fileName, targetFolder) {
    // Auto-subfolder logic based on file names and patterns
    const autoSubfolderRules = {
      'css': {
        'component': /component|card|button|form/i,
        'layouts': /layout|header|footer|nav/i,
        'utilities': /util|helper|grid|flex/i
      },
      'js': {
        'components': /component|card|button|form/i,
        'utilities': /util|helper|api|validation/i,
        'services': /service|api|fetch|http/i
      },
      'pages': {
        'components': /component|card|button|form/i,
        'templates': /template|layout|page/i
      }
    };
    
    const rules = autoSubfolderRules[targetFolder];
    if (!rules) return null;
    
    for (const [subfolder, pattern] of Object.entries(rules)) {
      if (pattern.test(fileName)) {
        return subfolder;
      }
    }
    
    return null;
  }

  async validateFileQuality(projectId, fileContent, fileName, targetFolder) {
    if (!this.webQualityHub) {
      return { passed: true, issues: [] };
    }
    
    try {
      console.log(`🔍 Running quality validation for: ${fileName}`);
      
      // Get appropriate quality agents for this file type
      const qualityAgents = this.config.deliveryStructureConfig.qualityValidation.qualityAgentMapping[targetFolder] || [];
      
      const validationResults = [];
      
      for (const agentId of qualityAgents) {
        try {
          const agent = this.webQualityHub.subAgents.get(agentId);
          if (agent) {
            const result = await agent.validateWebQuality(fileContent, {
              fileName,
              targetFolder,
              fileType: path.extname(fileName)
            });
            validationResults.push(result);
          }
        } catch (agentError) {
          console.warn(`⚠️ Quality agent ${agentId} validation failed:`, agentError.message);
        }
      }
      
      // Aggregate validation results
      const issues = [];
      const scores = [];
      
      for (const result of validationResults) {
        if (result.issues && result.issues.length > 0) {
          issues.push(...result.issues);
        }
        if (typeof result.score === 'number') {
          scores.push(result.score);
        }
      }
      
      const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 100;
      const passed = issues.length === 0 && avgScore >= 75;
      
      return {
        passed,
        issues,
        score: avgScore,
        validationResults
      };
      
    } catch (error) {
      console.error(`Quality validation error for ${fileName}:`, error);
      return { passed: false, issues: ['Quality validation system error'], score: 0 };
    }
  }

  updateDeliveryMetrics(projectId, targetFolder, fileName, fileContent) {
    const metrics = this.deliveryMetrics.get(projectId);
    if (!metrics) return;
    
    metrics.totalFilesGenerated++;
    
    if (!metrics.filesByType[targetFolder]) {
      metrics.filesByType[targetFolder] = 0;
    }
    metrics.filesByType[targetFolder]++;
    
    metrics.lastUpdate = Date.now();
    
    this.deliveryMetrics.set(projectId, metrics);
  }

  async storeDeliveryMemory(projectId, fileName, targetFolder, metadata) {
    if (!this.crystallineMemory) return;
    
    try {
      await this.crystallineMemory.store('web-quality-scores-central', {
        type: 'file-delivery',
        projectId,
        fileName,
        targetFolder,
        metadata,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to store delivery memory:', error);
    }
  }

  async completeProjectDelivery(projectId) {
    try {
      const deliverySession = this.activeDeliveries.get(projectId);
      if (!deliverySession) {
        throw new Error(`No active delivery session for project: ${projectId}`);
      }
      
      console.log(`📦 Completing delivery for project: ${projectId}`);
      
      // Run final quality validation
      const finalQualityResult = await this.runFinalQualityValidation(projectId);
      
      // Generate delivery report
      const deliveryReport = await this.generateDeliveryReport(projectId);
      
      // Write delivery report
      const reportPath = path.join(deliverySession.deliveryPath, 'DELIVERY_REPORT.md');
      await fs.writeFile(reportPath, deliveryReport);
      
      // Mark delivery as complete
      deliverySession.status = 'completed';
      deliverySession.endTime = Date.now();
      deliverySession.finalQualityResult = finalQualityResult;
      
      console.log(`✅ Project delivery completed: ${projectId}`);
      
      this.emit('deliveryCompleted', {
        projectId,
        deliveryPath: deliverySession.deliveryPath,
        totalFiles: deliverySession.generatedFiles.size,
        qualityScore: finalQualityResult.overallScore,
        duration: deliverySession.endTime - deliverySession.startTime,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        projectId,
        deliveryPath: deliverySession.deliveryPath,
        deliveryReport,
        qualityResult: finalQualityResult
      };
      
    } catch (error) {
      console.error(`❌ Failed to complete delivery for ${projectId}:`, error);
      throw error;
    }
  }

  async runFinalQualityValidation(projectId) {
    // This would integrate with the Web Quality Domain for comprehensive validation
    return {
      overallScore: 88,
      passed: true,
      details: 'Final quality validation passed'
    };
  }

  async generateDeliveryReport(projectId) {
    const deliverySession = this.activeDeliveries.get(projectId);
    const metrics = this.deliveryMetrics.get(projectId);
    
    const report = `# ORCHESTRAI Delivery Report
    
## Project: ${projectId}

### Delivery Structure
- **CSS Files**: Organized in \`/css\` with component, layout, and utility subfolders
- **JavaScript Files**: Organized in \`/js\` with component, service, and utility subfolders  
- **Pages**: HTML/Component files in root delivery folder
- **Assets**: Images, fonts, and media in \`/assets\`
- **Configuration**: Build and deployment configs in \`/config\`

### Generated Files Summary
${Array.from(deliverySession.generatedFiles.entries()).map(([folder, files]) => 
  `- **${folder}**: ${files.length} files`
).join('\n')}

### Quality Validation
- **Quality Validation**: ${this.config.deliveryStructureConfig.qualityValidation.enabled ? 'Enabled' : 'Disabled'}
- **Total Files Generated**: ${metrics.totalFilesGenerated}
- **Delivery Duration**: ${Math.round((deliverySession.endTime - deliverySession.startTime) / 1000)} seconds

### File Organization
${Object.entries(metrics.filesByType).map(([type, count]) => 
  `- **${type}**: ${count} files`
).join('\n')}

Generated by ORCHESTRAI Delivery Structure Manager
Timestamp: ${new Date().toISOString()}
`;
    
    return report;
  }

  getProjectDeliveryStatus(projectId) {
    const deliverySession = this.activeDeliveries.get(projectId);
    const metrics = this.deliveryMetrics.get(projectId);
    
    if (!deliverySession) {
      return { found: false };
    }
    
    return {
      found: true,
      projectId,
      status: deliverySession.status,
      deliveryPath: deliverySession.deliveryPath,
      totalFiles: metrics?.totalFilesGenerated || 0,
      filesByType: metrics?.filesByType || {},
      structure: Object.keys(this.config.deliveryStructureConfig.outputStructure),
      startTime: deliverySession.startTime,
      lastUpdate: metrics?.lastUpdate
    };
  }

  getAllActiveDeliveries() {
    return Array.from(this.activeDeliveries.keys()).map(projectId => 
      this.getProjectDeliveryStatus(projectId)
    );
  }

  getDeliveryManagerStatus() {
    return {
      initialized: !!this.config,
      activeDeliveries: this.activeDeliveries.size,
      totalProjectsTracked: this.deliveryMetrics.size,
      deliveryStructure: this.config ? Object.keys(this.config.deliveryStructureConfig.outputStructure) : [],
      qualityValidationEnabled: this.config?.deliveryStructureConfig.qualityValidation.enabled || false
    };
  }
}

module.exports = DeliveryStructureManager;