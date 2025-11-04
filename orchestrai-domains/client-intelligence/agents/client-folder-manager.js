// Client Folder Manager Agent - Node.js Coordination Agent
// Creates and manages client folder structures and organization

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ClientFolderManager extends EventEmitter {
  constructor(clientIntelligenceHub, orchestrator, crystallineMemory) {
    super();
    
    this.clientIntelligenceHub = clientIntelligenceHub;
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    
    this.agentId = 'client-folder-manager';
    this.status = 'initializing';
    
    // Metrics tracking
    this.metrics = {
      clientsCreated: 0,
      foldersCreated: 0,
      templatesApplied: 0,
      organizationOperations: 0,
      errorCount: 0,
      lastOperation: null
    };
    
    // Client folder structure template
    this.folderStructure = {
      'client-intelligence': [
        'additional-context',
        'brand-assets',
        'industry-reports'
      ],
      'deliverables': [
        'content',
        'seo', 
        'web-development',
        'research',
        'design'
      ]
    };
  }

  async initialize() {
    try {
      console.log('📁 Initializing Client Folder Manager...');
      
      // Setup base clients directory
      this.clientsBasePath = path.join(process.cwd(), 'clients');
      await this.ensureDirectoryExists(this.clientsBasePath);
      
      // Create templates directory if needed
      this.templatesPath = path.join(process.cwd(), 'orchestrai-system', 'templates', 'client-templates');
      await this.ensureDirectoryExists(this.templatesPath);
      
      // Setup template files
      await this.setupClientTemplates();
      
      this.status = 'active';
      console.log('✅ Client Folder Manager initialized and ready');
      
    } catch (error) {
      console.error('❌ Client Folder Manager initialization failed:', error);
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

  async setupClientTemplates() {
    try {
      // Create template files for client intelligence
      const templates = {
        'branding.md': this.getBrandingTemplate(),
        'icp.md': this.getICPTemplate(),
        'eos.md': this.getEOSTemplate(),
        'business-model.md': this.getBusinessModelTemplate(),
        'target-audience.md': this.getTargetAudienceTemplate()
      };
      
      for (const [filename, content] of Object.entries(templates)) {
        const templatePath = path.join(this.templatesPath, filename);
        await fs.writeFile(templatePath, content);
      }
      
      console.log('📝 Client intelligence templates created');
      
    } catch (error) {
      console.error('❌ Error setting up client templates:', error);
      this.metrics.errorCount++;
    }
  }

  async createClientProject(clientData) {
    try {
      console.log(`🚀 Creating client project: ${clientData.clientName}`);
      
      // Generate client UUID and folder name
      const clientUUID = uuidv4();
      const clientSlug = this.generateClientSlug(clientData.clientName);
      const clientFolderName = `${clientSlug}-${clientUUID.substring(0, 8)}`;
      
      // Create client base directory
      const clientPath = path.join(this.clientsBasePath, clientFolderName);
      await this.ensureDirectoryExists(clientPath);
      
      // Create folder structure
      await this.createFolderStructure(clientPath);
      
      // Create client metadata file
      const metadata = await this.createClientMetadata(clientData, clientUUID, clientFolderName);
      const metadataPath = path.join(clientPath, 'client-metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      
      // Apply context file templates
      await this.applyClientTemplates(clientPath, clientData);
      
      // Create crystalline memory client context cluster
      const memoryCoordinates = await this.initializeClientMemoryCluster(clientUUID);
      
      // Update metrics
      this.metrics.clientsCreated++;
      this.metrics.lastOperation = new Date().toISOString();
      
      const projectInfo = {
        clientId: clientUUID,
        clientSlug: clientSlug,
        folderName: clientFolderName,
        folderPath: clientPath,
        metadata: metadata,
        memoryCoordinates: memoryCoordinates,
        created: new Date().toISOString()
      };
      
      console.log(`✅ Client project created: ${clientFolderName}`);
      
      // Emit event for other coordination agents
      this.emit('clientCreated', projectInfo);
      
      return projectInfo;
      
    } catch (error) {
      console.error(`❌ Error creating client project:`, error);
      this.metrics.errorCount++;
      throw error;
    }
  }

  generateClientSlug(clientName) {
    return clientName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  }

  async createFolderStructure(clientPath) {
    try {
      for (const [mainFolder, subFolders] of Object.entries(this.folderStructure)) {
        const mainFolderPath = path.join(clientPath, mainFolder);
        await this.ensureDirectoryExists(mainFolderPath);
        this.metrics.foldersCreated++;
        
        for (const subFolder of subFolders) {
          const subFolderPath = path.join(mainFolderPath, subFolder);
          await this.ensureDirectoryExists(subFolderPath);
          this.metrics.foldersCreated++;
        }
      }
      
      // Create additional organizational folders
      const additionalFolders = [
        'crystalline-memory-index.json',
        'workflow-history.json', 
        'active-projects.json',
        'project-analytics.json'
      ];
      
      for (const fileName of additionalFolders) {
        if (fileName.endsWith('.json')) {
          const filePath = path.join(clientPath, fileName);
          await fs.writeFile(filePath, JSON.stringify({}, null, 2));
        }
      }
      
      console.log(`📁 Created complete folder structure for client`);
      
    } catch (error) {
      console.error('❌ Error creating folder structure:', error);
      this.metrics.errorCount++;
      throw error;
    }
  }

  async createClientMetadata(clientData, clientUUID, clientFolderName) {
    return {
      clientId: clientUUID,
      clientName: clientData.clientName,
      folderName: clientFolderName,
      industry: clientData.industry || 'Not specified',
      projectType: clientData.projectType || 'full-service',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'active',
      contextFiles: clientData.contextFiles || [],
      domains: {
        content: { active: false, lastActivity: null },
        seo: { active: false, lastActivity: null },
        web: { active: false, lastActivity: null },
        research: { active: false, lastActivity: null }
      },
      metrics: {
        totalProjects: 0,
        completedDeliverables: 0,
        contextUpdates: 0
      }
    };
  }

  async applyClientTemplates(clientPath, clientData) {
    try {
      const intelligencePath = path.join(clientPath, 'client-intelligence');
      
      // Copy template files to client intelligence folder
      const templateFiles = await fs.readdir(this.templatesPath);
      
      for (const templateFile of templateFiles) {
        const templatePath = path.join(this.templatesPath, templateFile);
        const clientFilePath = path.join(intelligencePath, templateFile);
        
        let templateContent = await fs.readFile(templatePath, 'utf-8');
        
        // Customize template with client data
        templateContent = templateContent
          .replace(/\{CLIENT_NAME\}/g, clientData.clientName)
          .replace(/\{INDUSTRY\}/g, clientData.industry || 'Your Industry')
          .replace(/\{PROJECT_TYPE\}/g, clientData.projectType || 'full-service');
        
        await fs.writeFile(clientFilePath, templateContent);
        this.metrics.templatesApplied++;
      }
      
      console.log(`📝 Applied ${templateFiles.length} client templates`);
      
    } catch (error) {
      console.error('❌ Error applying client templates:', error);
      this.metrics.errorCount++;
    }
  }

  async initializeClientMemoryCluster(clientUUID) {
    try {
      // Create client memory cluster in crystalline lattice
      const memoryCluster = {
        clientId: clientUUID,
        contextCoordinates: {
          branding: `client-${clientUUID}-branding`,
          icp: `client-${clientUUID}-icp`,
          business: `client-${clientUUID}-business`,
          market: `client-${clientUUID}-market`,
          integrated: `client-${clientUUID}-integrated`
        },
        created: new Date().toISOString()
      };
      
      // Store client cluster information
      await this.crystallineMemory.storeMemory(`client-cluster-${clientUUID}`, memoryCluster);
      
      console.log(`🧠 Client memory cluster initialized for ${clientUUID}`);
      
      return memoryCluster;
      
    } catch (error) {
      console.error('❌ Error initializing client memory cluster:', error);
      this.metrics.errorCount++;
      throw error;
    }
  }

  async organizeClientDeliverables(clientId, deliverableType, files) {
    try {
      // Find client folder
      const clientInfo = await this.findClientFolder(clientId);
      if (!clientInfo) {
        throw new Error(`Client ${clientId} not found`);
      }
      
      const deliverablePath = path.join(clientInfo.folderPath, 'deliverables', deliverableType);
      await this.ensureDirectoryExists(deliverablePath);
      
      // Organize files by type and date
      for (const file of files) {
        const fileName = file.name || `${deliverableType}-${Date.now()}.${file.extension || 'txt'}`;
        const filePath = path.join(deliverablePath, fileName);
        
        await fs.writeFile(filePath, file.content || '');
      }
      
      this.metrics.organizationOperations++;
      console.log(`📊 Organized ${files.length} deliverables for ${clientId}/${deliverableType}`);
      
    } catch (error) {
      console.error('❌ Error organizing client deliverables:', error);
      this.metrics.errorCount++;
      throw error;
    }
  }

  async findClientFolder(clientId) {
    try {
      const clients = await fs.readdir(this.clientsBasePath, { withFileTypes: true });
      
      for (const client of clients) {
        if (client.isDirectory()) {
          const metadataPath = path.join(this.clientsBasePath, client.name, 'client-metadata.json');
          try {
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
            if (metadata.clientId === clientId) {
              return {
                folderName: client.name,
                folderPath: path.join(this.clientsBasePath, client.name),
                metadata: metadata
              };
            }
          } catch {
            // Skip folders without proper metadata
            continue;
          }
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Error finding client folder:', error);
      this.metrics.errorCount++;
      return null;
    }
  }

  // Template content generators
  getBrandingTemplate() {
    return `# Branding Guidelines for {CLIENT_NAME}

## Brand Overview
- **Company Name**: {CLIENT_NAME}
- **Industry**: {INDUSTRY}
- **Brand Position**: [Define your unique market position]

## Brand Voice & Personality
- **Tone**: [Professional/Friendly/Authoritative/etc.]
- **Personality Traits**: [Innovative, Trustworthy, Results-driven, etc.]
- **Communication Style**: [Direct, Conversational, Technical, etc.]

## Visual Identity
- **Primary Colors**: #[HEX] (Brand Primary)
- **Secondary Colors**: #[HEX] (Brand Secondary)
- **Typography**: 
  - Headlines: [Font Name]
  - Body Text: [Font Name]

## Key Messaging
- **Value Proposition**: [What makes you unique]
- **Core Messages**: 
  1. [Key message 1]
  2. [Key message 2]
  3. [Key message 3]

## Brand Guidelines
- **Do**: [What aligns with brand]
- **Don't**: [What to avoid]
- **Voice Examples**: [Sample brand voice applications]

*This file will be automatically analyzed by ORCHESTRAI to ensure brand consistency across all content and design deliverables.*`;
  }

  getICPTemplate() {
    return `# Ideal Customer Profile (ICP) for {CLIENT_NAME}

## Primary Customer Profile

### Demographics
- **Role/Title**: [Decision maker title]
- **Company Size**: [Employee count range]
- **Industry**: [Target industry]
- **Geography**: [Location/regions]
- **Age Range**: [If applicable]

### Psychographics  
- **Values**: [What they care about]
- **Motivations**: [What drives them]
- **Pain Points**: 
  1. [Major challenge 1]
  2. [Major challenge 2] 
  3. [Major challenge 3]
- **Goals**: [What they want to achieve]

### Behavioral Patterns
- **Content Consumption**: [How they consume information]
- **Decision Making Process**: [How they make purchasing decisions]
- **Communication Preferences**: [Preferred channels and styles]
- **Buying Journey**: [Awareness → Consideration → Decision stages]

## Customer Journey Mapping

### Awareness Stage
- **Triggers**: [What makes them aware of the problem]
- **Content Needs**: [What information they seek]
- **Channels**: [Where they look for information]

### Consideration Stage  
- **Evaluation Criteria**: [How they evaluate solutions]
- **Content Needs**: [What helps them compare options]
- **Touchpoints**: [Where they interact with solutions]

### Decision Stage
- **Decision Factors**: [Final decision criteria]
- **Concerns**: [What might prevent purchase]
- **Success Metrics**: [How they measure success]

*This file will be automatically analyzed by ORCHESTRAI to ensure all content, SEO, and web development aligns with your ideal customer needs and behaviors.*`;
  }

  getEOSTemplate() {
    return `# Entrepreneurial Operating System (EOS) for {CLIENT_NAME}

## Vision Framework

### Core Values
1. [Core Value 1]: [Description]
2. [Core Value 2]: [Description] 
3. [Core Value 3]: [Description]

### Core Focus
- **Purpose**: [Why you exist]
- **Niche**: [What you do and for whom]

### 10-Year Target
[Your big, audacious goal for the next 10 years]

### Marketing Strategy
- **Target Market**: [Who you serve]
- **Three Uniques**: 
  1. [What makes you unique #1]
  2. [What makes you unique #2]
  3. [What makes you unique #3]
- **Proven Process**: [Your methodology/system]

## Traction (Execution)
### Quarterly Rocks (Current Quarter)
1. [Priority #1]: [Measurable outcome]
2. [Priority #2]: [Measurable outcome]
3. [Priority #3]: [Measurable outcome]

### Key Metrics (Weekly)
- [Metric 1]: [Target number]
- [Metric 2]: [Target number]
- [Metric 3]: [Target number]

## People
### Organizational Chart
[Key roles and responsibilities]

### Team Core Values Alignment
[How team members embody core values]

## Issues
### Current Top Issues
1. [Issue #1]: [Description and owner]
2. [Issue #2]: [Description and owner]
3. [Issue #3]: [Description and owner]

## Process
### Core Processes
1. [Process Name]: [Brief description]
2. [Process Name]: [Brief description]
3. [Process Name]: [Brief description]

*This file will be automatically analyzed by ORCHESTRAI to ensure all marketing and business development efforts align with your strategic priorities and operational system.*`;
  }

  getBusinessModelTemplate() {
    return `# Business Model Canvas for {CLIENT_NAME}

## Value Propositions
- **Primary Value Prop**: [Main value you deliver]
- **Secondary Value Props**: [Additional benefits]
- **Unique Selling Proposition**: [What sets you apart]

## Customer Segments
- **Primary Segment**: [Main customer type]
- **Secondary Segments**: [Other customer types]
- **Customer Jobs**: [What customers are trying to accomplish]

## Revenue Streams
1. **[Stream 1]**: [Description and pricing model]
2. **[Stream 2]**: [Description and pricing model] 
3. **[Stream 3]**: [Description and pricing model]

## Key Partners
- **Strategic Partners**: [Who you work with]
- **Suppliers**: [Key suppliers]
- **Technology Partners**: [Tech integrations]

## Key Activities
- **Core Activities**: [What you do to deliver value]
- **Supporting Activities**: [What supports core activities]

## Key Resources
- **Physical**: [Physical assets]
- **Intellectual**: [IP, brand, data]
- **Human**: [Key people and skills]
- **Financial**: [Funding, cash flow]

## Customer Relationships
- **Acquisition**: [How you get customers]
- **Retention**: [How you keep customers]
- **Growth**: [How you grow customer value]

## Channels
- **Direct**: [Direct sales/marketing channels]
- **Indirect**: [Partner channels]
- **Digital**: [Online channels]

## Cost Structure
- **Fixed Costs**: [Ongoing operational costs]
- **Variable Costs**: [Costs that scale with business]
- **Key Cost Drivers**: [Major expense categories]

*This file will be automatically analyzed by ORCHESTRAI to ensure all strategic content and positioning aligns with your business model and revenue objectives.*`;
  }

  getTargetAudienceTemplate() {
    return `# Target Audience Analysis for {CLIENT_NAME}

## Audience Segmentation

### Primary Audience: [Segment Name]
- **Demographics**: [Age, location, role, company size]
- **Needs**: [What they need from you]
- **Challenges**: [What problems they face]
- **Goals**: [What success looks like for them]
- **Media Consumption**: [How they consume content]

### Secondary Audience: [Segment Name]
- **Demographics**: [Age, location, role, company size]
- **Needs**: [What they need from you]
- **Challenges**: [What problems they face]
- **Goals**: [What success looks like for them]
- **Media Consumption**: [How they consume content]

## Persona Development

### Persona 1: "[Name]"
- **Role**: [Job title and responsibilities]
- **Background**: [Professional background]
- **Pain Points**: 
  1. [Specific challenge]
  2. [Specific challenge]
  3. [Specific challenge]
- **Information Sources**: [Where they get information]
- **Decision Process**: [How they make decisions]
- **Success Metrics**: [How they measure success]

### Persona 2: "[Name]"
- **Role**: [Job title and responsibilities]
- **Background**: [Professional background]
- **Pain Points**:
  1. [Specific challenge]
  2. [Specific challenge]
  3. [Specific challenge]
- **Information Sources**: [Where they get information]
- **Decision Process**: [How they make decisions]
- **Success Metrics**: [How they measure success]

## Audience Insights
- **Common Themes**: [What all segments share]
- **Key Differentiators**: [What separates segments]
- **Content Preferences**: [Format, length, topics]
- **Engagement Patterns**: [When and how they engage]

*This file will be automatically analyzed by ORCHESTRAI to ensure all audience targeting across content, SEO, and web development is precisely focused on your ideal prospects.*`;
  }

  // Status and health methods
  getStatus() {
    return {
      agentId: this.agentId,
      status: this.status,
      metrics: this.metrics,
      folderStructure: this.folderStructure
    };
  }

  async shutdown() {
    try {
      console.log('🔄 Shutting down Client Folder Manager...');
      this.status = 'shutdown';
      console.log('✅ Client Folder Manager shutdown complete');
    } catch (error) {
      console.error('❌ Error during Client Folder Manager shutdown:', error);
    }
  }
}

module.exports = ClientFolderManager;