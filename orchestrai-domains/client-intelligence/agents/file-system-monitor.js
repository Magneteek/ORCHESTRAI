// File System Monitor Agent - Node.js Coordination Agent
// Monitors client folders for file changes and triggers context updates

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');

class FileSystemMonitor extends EventEmitter {
  constructor(clientIntelligenceHub, orchestrator, crystallineMemory) {
    super();
    
    this.clientIntelligenceHub = clientIntelligenceHub;
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    
    this.agentId = 'file-system-monitor';
    this.status = 'initializing';
    this.watchers = new Map();
    this.monitoredPaths = new Set();
    
    // Metrics tracking
    this.metrics = {
      filesWatched: 0,
      changeEventsProcessed: 0,
      contextUpdatesTriggered: 0,
      errorCount: 0,
      lastActivity: null
    };
    
    // Client intelligence file patterns to monitor
    this.watchPatterns = [
      'branding.md',
      'icp.md', 
      'eos.md',
      'business-model.md',
      'target-audience.md',
      'market-research.pdf',
      'competitor-analysis.pdf'
    ];
  }

  async initialize() {
    try {
      console.log('📂 Initializing File System Monitor...');
      
      // Setup base clients directory
      this.clientsBasePath = path.join(process.cwd(), 'clients');
      await this.ensureDirectoryExists(this.clientsBasePath);
      
      // Start monitoring existing client folders
      await this.scanExistingClients();
      
      // Setup global client directory watcher for new clients
      await this.setupGlobalWatcher();
      
      this.status = 'active';
      console.log('✅ File System Monitor initialized and ready');
      
    } catch (error) {
      console.error('❌ File System Monitor initialization failed:', error);
      this.status = 'error';
      this.metrics.errorCount++;
    }
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
    }
  }

  async scanExistingClients() {
    try {
      const clients = await fs.readdir(this.clientsBasePath, { withFileTypes: true });
      
      for (const client of clients) {
        if (client.isDirectory()) {
          const clientPath = path.join(this.clientsBasePath, client.name);
          await this.startWatchingClient(client.name, clientPath);
        }
      }
      
      console.log(`📊 Monitoring ${this.watchers.size} existing client folders`);
      
    } catch (error) {
      console.error('❌ Error scanning existing clients:', error);
      this.metrics.errorCount++;
    }
  }

  async setupGlobalWatcher() {
    try {
      // Watch for new client folders being created
      this.globalWatcher = chokidar.watch(this.clientsBasePath, {
        depth: 1,
        ignoreInitial: true
      });
      
      this.globalWatcher.on('addDir', (clientPath) => {
        const clientId = path.basename(clientPath);
        if (clientPath !== this.clientsBasePath) {
          console.log(`📁 New client folder detected: ${clientId}`);
          this.startWatchingClient(clientId, clientPath);
        }
      });
      
      this.globalWatcher.on('unlinkDir', (clientPath) => {
        const clientId = path.basename(clientPath);
        console.log(`📁 Client folder removed: ${clientId}`);
        this.stopWatchingClient(clientId);
      });
      
    } catch (error) {
      console.error('❌ Error setting up global watcher:', error);
      this.metrics.errorCount++;
    }
  }

  async startWatchingClient(clientId, clientPath) {
    try {
      if (this.watchers.has(clientId)) {
        return; // Already watching
      }
      
      // Setup client intelligence folder path
      const intelligencePath = path.join(clientPath, 'client-intelligence');
      await this.ensureDirectoryExists(intelligencePath);
      
      // Create watcher for client intelligence files
      const watcher = chokidar.watch(intelligencePath, {
        depth: 2,
        ignoreInitial: false
      });
      
      // File change handlers
      watcher.on('add', (filePath) => this.handleFileChange(clientId, filePath, 'added'));
      watcher.on('change', (filePath) => this.handleFileChange(clientId, filePath, 'changed'));
      watcher.on('unlink', (filePath) => this.handleFileChange(clientId, filePath, 'removed'));
      
      watcher.on('error', (error) => {
        console.error(`❌ File watcher error for client ${clientId}:`, error);
        this.metrics.errorCount++;
      });
      
      this.watchers.set(clientId, watcher);
      this.monitoredPaths.add(intelligencePath);
      this.metrics.filesWatched++;
      
      console.log(`👀 Started monitoring client: ${clientId}`);
      
    } catch (error) {
      console.error(`❌ Error starting watcher for client ${clientId}:`, error);
      this.metrics.errorCount++;
    }
  }

  async stopWatchingClient(clientId) {
    try {
      const watcher = this.watchers.get(clientId);
      if (watcher) {
        await watcher.close();
        this.watchers.delete(clientId);
        this.metrics.filesWatched--;
        console.log(`⏹️ Stopped monitoring client: ${clientId}`);
      }
    } catch (error) {
      console.error(`❌ Error stopping watcher for client ${clientId}:`, error);
      this.metrics.errorCount++;
    }
  }

  async handleFileChange(clientId, filePath, changeType) {
    try {
      const fileName = path.basename(filePath);
      const isContextFile = this.watchPatterns.some(pattern => 
        fileName === pattern || fileName.includes(pattern.replace('.pdf', ''))
      );
      
      if (!isContextFile) {
        return; // Not a monitored context file
      }
      
      console.log(`📝 Client context file ${changeType}: ${clientId}/${fileName}`);
      
      // Update metrics
      this.metrics.changeEventsProcessed++;
      this.metrics.lastActivity = new Date().toISOString();
      
      // Determine context type based on file name
      const contextType = this.getContextType(fileName);
      
      // Trigger context analysis and update
      await this.triggerContextUpdate(clientId, filePath, contextType, changeType);
      
      // Emit event for other coordination agents
      this.emit('clientFileChanged', {
        clientId,
        filePath,
        fileName,
        contextType,
        changeType,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Error handling file change for ${clientId}:`, error);
      this.metrics.errorCount++;
    }
  }

  getContextType(fileName) {
    const contextMapping = {
      'branding.md': 'branding',
      'icp.md': 'icp',
      'eos.md': 'business',
      'business-model.md': 'business',
      'target-audience.md': 'icp',
      'market-research.pdf': 'market',
      'competitor-analysis.pdf': 'market'
    };
    
    return contextMapping[fileName] || 'general';
  }

  async triggerContextUpdate(clientId, filePath, contextType, changeType) {
    try {
      // Create task for appropriate Claude Code agent based on context type
      const agentMapping = {
        'branding': 'client-branding-intelligence',
        'icp': 'client-icp-analyst', 
        'business': 'client-business-context-analyzer',
        'market': 'client-market-intelligence-synthesizer'
      };
      
      const targetAgent = agentMapping[contextType] || 'client-context-integration-coordinator';
      
      // Read file content for analysis
      const fileContent = await this.readFileContent(filePath);
      
      // Delegate to Claude Code agent for context analysis
      const taskPrompt = `Analyze updated client context file:

Client ID: ${clientId}
File: ${path.basename(filePath)}
Change Type: ${changeType}
Context Type: ${contextType}

File Content:
${fileContent}

Please:
1. Extract key intelligence from this ${contextType} context file
2. Update client context profile for crystalline memory storage
3. Identify cross-domain implications for Content, SEO, and Web domains
4. Generate context injection instructions for domain agents

Provide comprehensive context analysis and update recommendations.`;

      const result = await this.clientIntelligenceHub.delegateToClaudeCodeAgent(
        targetAgent,
        taskPrompt,
        {
          type: 'file-change-analysis',
          clientId,
          contextType,
          changeType
        }
      );
      
      // Store updated context in crystalline memory
      await this.crystallineMemory.storeMemory(`client-${clientId}-${contextType}`, result);
      
      // Trigger cross-domain context update notification
      this.clientIntelligenceHub.emit('clientContextUpdated', {
        clientId,
        contextType,
        changeType,
        analysis: result
      });
      
      this.metrics.contextUpdatesTriggered++;
      console.log(`🧠 Context update completed for ${clientId}/${contextType}`);
      
    } catch (error) {
      console.error(`❌ Error triggering context update:`, error);
      this.metrics.errorCount++;
    }
  }

  async readFileContent(filePath) {
    try {
      if (filePath.endsWith('.pdf')) {
        return '[PDF file detected - content extraction would be handled by specialized PDF parser]';
      }
      
      const content = await fs.readFile(filePath, 'utf-8');
      return content.substring(0, 10000); // Limit content size for analysis
      
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error);
      return '[Error reading file content]';
    }
  }

  // Health and status methods
  getStatus() {
    return {
      agentId: this.agentId,
      status: this.status,
      metrics: this.metrics,
      activeWatchers: this.watchers.size,
      monitoredPaths: Array.from(this.monitoredPaths)
    };
  }

  async shutdown() {
    try {
      console.log('🔄 Shutting down File System Monitor...');
      
      // Close all watchers
      for (const [clientId, watcher] of this.watchers) {
        await watcher.close();
      }
      
      if (this.globalWatcher) {
        await this.globalWatcher.close();
      }
      
      this.status = 'shutdown';
      console.log('✅ File System Monitor shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during File System Monitor shutdown:', error);
    }
  }
}

module.exports = FileSystemMonitor;