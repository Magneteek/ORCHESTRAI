// Project Management System - ORCHESTRAI Phase 3
// Comprehensive project lifecycle management with UUID tracking
// Integrates with Domain Agents, Template Engine, and Crystalline Memory

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

class ProjectManager extends EventEmitter {
  constructor(crystallineMemory, domainAgentManager, templateEngine) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.domainAgentManager = domainAgentManager;
    this.templateEngine = templateEngine;
    
    // Project registry and tracking
    this.projects = new Map();
    this.projectTemplates = new Map();
    this.deliverableTracking = new Map();
    
    // Project lifecycle states
    this.projectStates = {
      PLANNING: 'planning',
      IN_PROGRESS: 'in_progress', 
      REVIEW: 'review',
      COMPLETED: 'completed',
      ARCHIVED: 'archived',
      CANCELLED: 'cancelled'
    };
    
    // File system paths
    this.projectsBasePath = path.join(process.cwd(), 'projects');
    this.deliverableBasePath = path.join(this.projectsBasePath, '{projectUUID}', 'deliverables');
    
    // Metrics and analytics
    this.projectMetrics = {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      avgCompletionTime: 0,
      deliverableCount: 0,
      domainDistribution: {}
    };
    
    this.initialize();
  }

  async initialize() {
    console.log('📋 Initializing Project Management System...');
    
    try {
      // Create project directories if they don't exist
      await this.ensureProjectDirectories();
      
      // Load existing projects from filesystem
      await this.loadExistingProjects();
      
      // Set up event listeners for domain agents
      this.setupDomainAgentListeners();
      
      // Initialize project templates from template engine
      await this.initializeProjectTemplates();
      
      // Start periodic cleanup and maintenance
      this.startMaintenanceRoutines();
      
      console.log('✅ Project Management System initialized');
      this.emit('initialized', {
        totalProjects: this.projects.size,
        projectStates: Object.values(this.projectStates),
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Project Management System:', error);
      throw error;
    }
  }

  async ensureProjectDirectories() {
    try {
      await fs.mkdir(this.projectsBasePath, { recursive: true });
      console.log(`📁 Projects directory ensured at ${this.projectsBasePath}`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async loadExistingProjects() {
    try {
      const projectDirs = await fs.readdir(this.projectsBasePath);
      
      for (const dir of projectDirs) {
        const projectPath = path.join(this.projectsBasePath, dir);
        const stats = await fs.stat(projectPath);
        
        if (stats.isDirectory() && this.isValidUUID(dir)) {
          await this.loadProjectFromDisk(dir, projectPath);
        }
      }
      
      console.log(`📊 Loaded ${this.projects.size} existing projects`);
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading existing projects:', error);
      }
    }
  }

  async loadProjectFromDisk(projectUUID, projectPath) {
    try {
      const metadataPath = path.join(projectPath, 'project-metadata.json');
      const metadataData = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataData);
      
      // Reconstruct project object
      const project = {
        ...metadata,
        uuid: projectUUID,
        path: projectPath,
        loaded: true
      };
      
      this.projects.set(projectUUID, project);
      this.updateMetricsForProject(project, 'loaded');
      
    } catch (error) {
      console.warn(`⚠️ Could not load project ${projectUUID}:`, error.message);
    }
  }

  setupDomainAgentListeners() {
    if (!this.domainAgentManager) return;
    
    // Listen for task assignments and completions to track project progress
    this.domainAgentManager.on('taskAssigned', (task) => {
      if (task.projectUUID) {
        this.updateProjectProgress(task.projectUUID, 'task_assigned', task);
      }
    });
    
    this.domainAgentManager.on('taskCompleted', (taskEvent) => {
      const { task } = taskEvent;
      if (task.projectUUID) {
        this.updateProjectProgress(task.projectUUID, 'task_completed', task);
        this.handleDeliverableGeneration(task);
      }
    });
    
    this.domainAgentManager.on('taskFailed', (taskEvent) => {
      const { task } = taskEvent;
      if (task.projectUUID) {
        this.updateProjectProgress(task.projectUUID, 'task_failed', task);
      }
    });
  }

  async initializeProjectTemplates() {
    if (!this.templateEngine) return;
    
    // Create project-specific template mappings
    const projectTemplateTypes = [
      'content-creation-project',
      'seo-optimization-project', 
      'web-development-project',
      'research-analysis-project',
      'maintenance-project'
    ];
    
    for (const templateType of projectTemplateTypes) {
      const templateStructure = this.generateProjectTemplateStructure(templateType);
      this.projectTemplates.set(templateType, templateStructure);
    }
    
    console.log(`🎯 Initialized ${this.projectTemplates.size} project templates`);
  }

  generateProjectTemplateStructure(templateType) {
    const baseStructure = {
      directories: ['deliverables', 'assets', 'documentation', 'temp'],
      files: ['project-metadata.json', 'README.md', 'progress.md'],
      workflows: []
    };
    
    switch (templateType) {
      case 'seo-optimization-project':
        return {
          ...baseStructure,
          directories: [...baseStructure.directories, 'seo', 'analytics', 'content'],
          workflows: ['keyword-research', 'competitor-analysis', 'content-optimization', 'reporting']
        };
        
      case 'content-creation-project':
        return {
          ...baseStructure,
          directories: [...baseStructure.directories, 'content', 'media', 'drafts'],
          workflows: ['planning', 'writing', 'editing', 'publishing']
        };
        
      case 'web-development-project':
        return {
          ...baseStructure,
          directories: [...baseStructure.directories, 'src', 'tests', 'docs', 'build'],
          workflows: ['design', 'development', 'testing', 'deployment']
        };
        
      case 'research-analysis-project':
        return {
          ...baseStructure,
          directories: [...baseStructure.directories, 'data', 'analysis', 'reports'],
          workflows: ['data-collection', 'analysis', 'visualization', 'reporting']
        };
        
      default:
        return baseStructure;
    }
  }

  async createProject(projectConfig) {
    const {
      name,
      description,
      domains = [],
      templateType = 'general',
      priority = 'medium',
      deadline,
      client,
      tags = [],
      metadata = {}
    } = projectConfig;
    
    const projectUUID = uuidv4();
    const projectPath = path.join(this.projectsBasePath, projectUUID);
    
    console.log(`📋 Creating new project: ${name} (${projectUUID})`);
    
    try {
      // Create project directory structure
      await this.createProjectStructure(projectUUID, projectPath, templateType);
      
      // Generate project metadata
      const project = {
        uuid: projectUUID,
        name,
        description,
        domains,
        templateType,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        client,
        tags,
        metadata,
        
        // Project lifecycle
        state: this.projectStates.PLANNING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
        
        // Progress tracking
        tasks: [],
        deliverables: [],
        progress: {
          tasksTotal: 0,
          tasksCompleted: 0,
          percentage: 0
        },
        
        // File system
        path: projectPath,
        
        // Agent assignments
        assignedAgents: [],
        domainDistribution: {}
      };
      
      // Save project metadata to disk
      await this.saveProjectMetadata(project);
      
      // Store in memory registry
      this.projects.set(projectUUID, project);
      
      // Update metrics
      this.updateMetricsForProject(project, 'created');
      
      // Store in crystalline memory
      await this.storeProjectMemory(project, 'created');
      
      console.log(`✅ Project created successfully: ${projectUUID}`);
      
      this.emit('projectCreated', {
        projectUUID,
        name,
        domains,
        timestamp: new Date().toISOString()
      });
      
      return project;
      
    } catch (error) {
      console.error(`❌ Failed to create project ${name}:`, error);
      
      // Cleanup partial project creation
      try {
        await fs.rm(projectPath, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Error during project cleanup:', cleanupError);
      }
      
      throw error;
    }
  }

  async createProjectStructure(projectUUID, projectPath, templateType) {
    // Create main project directory
    await fs.mkdir(projectPath, { recursive: true });
    
    // Get template structure
    const template = this.projectTemplates.get(templateType) || this.projectTemplates.get('general');
    
    // Create directories
    for (const dir of template.directories) {
      const dirPath = path.join(projectPath, dir);
      await fs.mkdir(dirPath, { recursive: true });
    }
    
    // Create initial files
    for (const file of template.files) {
      const filePath = path.join(projectPath, file);
      
      switch (file) {
        case 'README.md':
          await fs.writeFile(filePath, this.generateReadmeTemplate(projectUUID));
          break;
        case 'progress.md':
          await fs.writeFile(filePath, this.generateProgressTemplate());
          break;
        default:
          if (!file.endsWith('.json')) {
            await fs.writeFile(filePath, '');
          }
      }
    }
    
    console.log(`📁 Created project structure for ${projectUUID} using ${templateType} template`);
  }

  generateReadmeTemplate(projectUUID) {
    return `# Project ${projectUUID}

## Overview

This project was created and managed by ORCHESTRAI Project Management System.

## Project Structure

- \`deliverables/\` - Final project outputs
- \`assets/\` - Media and resources
- \`documentation/\` - Project documentation
- \`temp/\` - Temporary files and work-in-progress

## Progress

See [progress.md](./progress.md) for detailed progress tracking.

## Generated by ORCHESTRAI
- Project UUID: ${projectUUID}
- Created: ${new Date().toISOString()}
- System: ORCHESTRAI Phase 3 - Domain Agent Coordination
`;
  }

  generateProgressTemplate() {
    return `# Project Progress

## Timeline

- **Created**: ${new Date().toISOString()}

## Tasks

_Tasks will be automatically tracked here as they are assigned and completed._

## Deliverables

_Deliverables will be listed here as they are generated._

## Metrics

- Tasks Assigned: 0
- Tasks Completed: 0
- Progress: 0%

---
_This file is automatically maintained by ORCHESTRAI Project Management System_
`;
  }

  async saveProjectMetadata(project) {
    const metadataPath = path.join(project.path, 'project-metadata.json');
    const metadataContent = JSON.stringify({
      ...project,
      path: undefined // Don't store absolute path in metadata
    }, null, 2);
    
    await fs.writeFile(metadataPath, metadataContent);
  }

  async updateProjectProgress(projectUUID, event, taskData) {
    const project = this.projects.get(projectUUID);
    if (!project) {
      console.warn(`Project ${projectUUID} not found for progress update`);
      return;
    }
    
    project.updatedAt = new Date().toISOString();
    
    switch (event) {
      case 'task_assigned':
        project.tasks.push({
          id: taskData.id,
          type: taskData.type,
          assignedTo: taskData.assignedTo,
          assignedAt: taskData.assignedAt,
          status: 'assigned'
        });
        project.progress.tasksTotal++;
        break;
        
      case 'task_completed':
        const taskIndex = project.tasks.findIndex(t => t.id === taskData.id);
        if (taskIndex !== -1) {
          project.tasks[taskIndex].status = 'completed';
          project.tasks[taskIndex].completedAt = taskData.completedAt;
          project.progress.tasksCompleted++;
        }
        break;
        
      case 'task_failed':
        const failedTaskIndex = project.tasks.findIndex(t => t.id === taskData.id);
        if (failedTaskIndex !== -1) {
          project.tasks[failedTaskIndex].status = 'failed';
          project.tasks[failedTaskIndex].error = taskData.error;
        }
        break;
    }
    
    // Update progress percentage
    if (project.progress.tasksTotal > 0) {
      project.progress.percentage = Math.round(
        (project.progress.tasksCompleted / project.progress.tasksTotal) * 100
      );
    }
    
    // Update project state based on progress
    this.updateProjectState(project);
    
    // Save updated metadata
    await this.saveProjectMetadata(project);
    
    // Update progress file
    await this.updateProgressFile(project);
    
    this.emit('projectProgressUpdated', {
      projectUUID,
      event,
      progress: project.progress,
      timestamp: new Date().toISOString()
    });
  }

  updateProjectState(project) {
    const { progress } = project;
    
    if (progress.percentage === 100) {
      if (project.state !== this.projectStates.COMPLETED) {
        project.state = this.projectStates.COMPLETED;
        project.completedAt = new Date().toISOString();
        this.emit('projectCompleted', { project });
      }
    } else if (progress.tasksTotal > 0 && project.state === this.projectStates.PLANNING) {
      project.state = this.projectStates.IN_PROGRESS;
      project.startedAt = new Date().toISOString();
      this.emit('projectStarted', { project });
    }
  }

  async updateProgressFile(project) {
    const progressPath = path.join(project.path, 'progress.md');
    
    const progressContent = `# Project Progress

## Timeline

- **Created**: ${project.createdAt}
${project.startedAt ? `- **Started**: ${project.startedAt}` : ''}
${project.completedAt ? `- **Completed**: ${project.completedAt}` : ''}

## Status

- **Current State**: ${project.state.toUpperCase()}
- **Progress**: ${project.progress.percentage}%

## Tasks (${project.progress.tasksCompleted}/${project.progress.tasksTotal})

${project.tasks.map(task => 
  `- [${task.status === 'completed' ? 'x' : ' '}] **${task.type}** (${task.assignedTo}) - ${task.status}`
).join('\n')}

## Deliverables (${project.deliverables.length})

${project.deliverables.map(deliverable => 
  `- **${deliverable.type}**: ${deliverable.filename} (${deliverable.generatedAt})`
).join('\n') || '_No deliverables generated yet._'}

---
_Last updated: ${new Date().toISOString()}_
_Managed by ORCHESTRAI Project Management System_
`;
    
    await fs.writeFile(progressPath, progressContent);
  }

  async handleDeliverableGeneration(task) {
    if (!task.result || !task.result.data) return;
    
    const project = this.projects.get(task.projectUUID);
    if (!project) return;
    
    try {
      const deliverable = await this.generateDeliverable(project, task);
      
      if (deliverable) {
        project.deliverables.push(deliverable);
        await this.saveProjectMetadata(project);
        await this.updateProgressFile(project);
        
        this.emit('deliverableGenerated', {
          projectUUID: project.uuid,
          deliverable,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error(`Error generating deliverable for task ${task.id}:`, error);
    }
  }

  async generateDeliverable(project, task) {
    const deliverablesPath = path.join(project.path, 'deliverables');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    let filename;
    let content;
    let format = 'json';
    
    switch (task.type) {
      case 'keyword-research':
        filename = `keyword-research-${timestamp}.json`;
        content = JSON.stringify(task.result.data, null, 2);
        break;
        
      case 'competitor-analysis':
        filename = `competitor-analysis-${timestamp}.json`;
        content = JSON.stringify(task.result.data, null, 2);
        break;
        
      case 'serp-analysis':
        filename = `serp-analysis-${timestamp}.json`;
        content = JSON.stringify(task.result.data, null, 2);
        break;
        
      case 'content-optimization':
        filename = `content-optimization-${timestamp}.md`;
        content = this.formatContentOptimizationDeliverable(task.result.data);
        format = 'markdown';
        break;
        
      default:
        filename = `${task.type}-${timestamp}.json`;
        content = JSON.stringify(task.result, null, 2);
    }
    
    const filePath = path.join(deliverablesPath, filename);
    await fs.writeFile(filePath, content);
    
    const deliverable = {
      id: uuidv4(),
      taskId: task.id,
      type: task.type,
      filename,
      filePath,
      format,
      size: Buffer.byteLength(content, 'utf8'),
      generatedAt: new Date().toISOString(),
      agentId: task.assignedTo
    };
    
    console.log(`📄 Generated deliverable: ${filename} for project ${project.uuid}`);
    
    return deliverable;
  }

  formatContentOptimizationDeliverable(data) {
    return `# Content Optimization Report

## Target Keywords
${data.targetKeywords?.map(kw => `- ${kw}`).join('\n') || 'Not specified'}

## Current Content Analysis
${data.currentContent ? `\`\`\`\n${data.currentContent.substring(0, 500)}...\n\`\`\`` : 'No content provided'}

## Optimization Recommendations
${data.recommendations?.map(rec => `- ${rec}`).join('\n') || 'No recommendations available'}

## Optimized Version
${data.optimizedVersion || 'Optimization not provided'}

## Metrics
- Keyword Density: ${JSON.stringify(data.keywordDensity, null, 2)}
- Readability Score: ${data.readabilityScore || 'Not calculated'}

---
Generated by ORCHESTRAI Content Optimization Agent
${new Date().toISOString()}
`;
  }

  async storeProjectMemory(project, event) {
    if (!this.crystallineMemory) return;
    
    try {
      await this.crystallineMemory.storeMemory('project-management', {
        projectUUID: project.uuid,
        event,
        projectData: {
          name: project.name,
          domains: project.domains,
          state: project.state,
          progress: project.progress
        },
        timestamp: new Date().toISOString()
      }, {
        domain: 'project-management',
        category: 'projects',
        retention: 'long-term'
      });
    } catch (error) {
      console.error('Failed to store project memory:', error);
    }
  }

  updateMetricsForProject(project, event) {
    switch (event) {
      case 'created':
        this.projectMetrics.totalProjects++;
        this.projectMetrics.activeProjects++;
        break;
        
      case 'completed':
        this.projectMetrics.completedProjects++;
        this.projectMetrics.activeProjects--;
        break;
        
      case 'loaded':
        this.projectMetrics.totalProjects++;
        if (project.state !== this.projectStates.COMPLETED) {
          this.projectMetrics.activeProjects++;
        } else {
          this.projectMetrics.completedProjects++;
        }
        break;
    }
    
    // Update domain distribution
    for (const domain of project.domains || []) {
      this.projectMetrics.domainDistribution[domain] = 
        (this.projectMetrics.domainDistribution[domain] || 0) + 1;
    }
  }

  startMaintenanceRoutines() {
    // Periodic project cleanup and optimization
    setInterval(async () => {
      await this.performMaintenanceTasks();
    }, 300000); // Every 5 minutes
  }

  async performMaintenanceTasks() {
    // Clean up old temporary files
    // Archive completed projects older than 30 days
    // Update project metrics
    // Optimize crystalline memory storage
  }

  isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  getProject(projectUUID) {
    return this.projects.get(projectUUID);
  }

  getProjectsByDomain(domain) {
    return Array.from(this.projects.values())
      .filter(project => project.domains.includes(domain));
  }

  getProjectMetrics() {
    return {
      ...this.projectMetrics,
      projects: Array.from(this.projects.values()).map(p => ({
        uuid: p.uuid,
        name: p.name,
        state: p.state,
        progress: p.progress,
        domains: p.domains
      }))
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Project Management System...');
    
    // Save all project metadata
    for (const project of this.projects.values()) {
      try {
        await this.saveProjectMetadata(project);
      } catch (error) {
        console.error(`Error saving project ${project.uuid}:`, error);
      }
    }
    
    console.log('✅ Project Management System shut down gracefully');
  }
}

module.exports = ProjectManager;