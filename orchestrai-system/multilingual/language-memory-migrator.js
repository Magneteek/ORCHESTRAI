/**
 * ORCHESTRAI Language-Specific Memory Migrator
 * 
 * Migrates existing research data from mixed memory pools to language-isolated pools
 * Ensures clean separation and prevents cross-language contamination
 */

const fs = require('fs').promises;
const path = require('path');

class LanguageMemoryMigrator {
  constructor(memoryManager, mcpManager, languageFramework) {
    this.memoryManager = memoryManager;
    this.mcpManager = mcpManager;
    this.languageFramework = languageFramework;
    this.migrationLog = [];
  }

  /**
   * Migrate nasmehPG research data to Slovenian memory pool
   */
  async migrateNasmehPGToSlovenian() {
    console.log('🔄 Migrating nasmehPG research data to Slovenian memory pool...');
    
    const projectPath = '/Users/kris/CLAUDEtools/ORCHESTRAI/projects/nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e';
    const slovenianPool = this.languageFramework.getLanguageMemoryPool('sl');
    
    const migrationTasks = [
      {
        name: 'Psychographic Segments',
        source: 'mixed-memory',
        entities: [
          'Pragmatični Varčevalci',
          'Zavedni Eko', 
          'Statusni Iskovalci',
          'Družinski Srednji'
        ],
        targetPool: slovenianPool
      },
      {
        name: 'SEO Research Data',
        source: `${projectPath}/deliverables/seo`,
        targetPool: slovenianPool,
        filePatterns: ['*.json']
      },
      {
        name: 'Content Strategy',
        source: `${projectPath}/deliverables/content`,
        targetPool: slovenianPool,
        filePatterns: ['*outline*.md', '*strategy*.json']
      },
      {
        name: 'Client Intelligence',
        source: `${projectPath}/client-intelligence`,
        targetPool: slovenianPool,
        filePatterns: ['*.json']
      }
    ];

    const migrationResults = [];

    for (const task of migrationTasks) {
      try {
        console.log(`  📦 Migrating: ${task.name}`);
        
        let result;
        if (task.source === 'mixed-memory') {
          result = await this.migrateMemoryEntities(task.entities, task.targetPool);
        } else {
          result = await this.migrateFileBasedData(task.source, task.targetPool, task.filePatterns);
        }
        
        migrationResults.push({
          task: task.name,
          status: 'completed',
          entitiesCreated: result.entitiesCreated || 0,
          relationsCreated: result.relationsCreated || 0,
          filesProcessed: result.filesProcessed || 0
        });
        
        console.log(`  ✅ ${task.name}: ${result.entitiesCreated || result.filesProcessed || 0} items migrated`);
        
      } catch (error) {
        console.error(`  ❌ Migration failed for ${task.name}:`, error.message);
        migrationResults.push({
          task: task.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    await this.generateMigrationReport(migrationResults);
    return migrationResults;
  }

  /**
   * Migrate memory entities to language-specific pool
   */
  async migrateMemoryEntities(entityNames, targetPool) {
    const migratedEntities = [];
    const createdRelations = [];

    // First, retrieve existing entities
    for (const entityName of entityNames) {
      try {
        const entities = await this.mcpManager.memory.open_nodes({ names: [entityName] });
        
        if (entities.entities && entities.entities.length > 0) {
          const entity = entities.entities[0];
          
          // Create Slovenian-specific entity
          const slovenianEntity = {
            name: `${entity.name} (SL)`,
            entityType: `slovenian-${entity.entityType}`,
            observations: [
              `Slovenian market segment: ${entity.name}`,
              `Language context: Slovenian (sl)`,
              `Memory pool: slovenian-intelligence`,
              ...entity.observations.map(obs => `[SL] ${obs}`)
            ]
          };

          await this.mcpManager.memory.create_entities({
            entities: [slovenianEntity]
          });

          migratedEntities.push(slovenianEntity);

          // Create relation to original (for reference)
          await this.mcpManager.memory.create_relations({
            relations: [{
              from: slovenianEntity.name,
              to: 'nasmehPG Slovenian Market',
              relationType: 'belongs_to_market'
            }]
          });

          createdRelations.push({
            from: slovenianEntity.name,
            to: 'nasmehPG Slovenian Market',
            type: 'belongs_to_market'
          });
        }
      } catch (error) {
        console.error(`Failed to migrate entity ${entityName}:`, error.message);
      }
    }

    return {
      entitiesCreated: migratedEntities.length,
      relationsCreated: createdRelations.length,
      entities: migratedEntities
    };
  }

  /**
   * Migrate file-based research data
   */
  async migrateFileBasedData(sourcePath, targetPool, filePatterns) {
    const processedFiles = [];
    const createdEntities = [];

    try {
      const files = await this.findMatchingFiles(sourcePath, filePatterns);
      
      for (const filePath of files) {
        try {
          const fileName = path.basename(filePath, path.extname(filePath));
          const content = await fs.readFile(filePath, 'utf8');
          
          let entityData;
          if (filePath.endsWith('.json')) {
            entityData = JSON.parse(content);
          } else {
            entityData = { content, type: 'text' };
          }

          // Create Slovenian-specific entity from file data
          const slovenianEntity = {
            name: `${fileName} (SL)`,
            entityType: 'slovenian-research-data',
            observations: [
              `Source file: ${filePath}`,
              `Language context: Slovenian (sl)`,
              `Memory pool: slovenian-intelligence`,
              `Content type: ${path.extname(filePath)}`,
              `Processed: ${new Date().toISOString()}`,
              ...(this.extractObservationsFromData(entityData))
            ]
          };

          await this.mcpManager.memory.create_entities({
            entities: [slovenianEntity]
          });

          createdEntities.push(slovenianEntity);
          processedFiles.push(filePath);

          // Create relation to nasmehPG project
          await this.mcpManager.memory.create_relations({
            relations: [{
              from: slovenianEntity.name,
              to: 'nasmehPG Slovenian Project',
              relationType: 'research_data_for'
            }]
          });

        } catch (error) {
          console.error(`Failed to process file ${filePath}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`Failed to access source path ${sourcePath}:`, error.message);
    }

    return {
      filesProcessed: processedFiles.length,
      entitiesCreated: createdEntities.length,
      files: processedFiles
    };
  }

  /**
   * Find files matching patterns
   */
  async findMatchingFiles(sourcePath, patterns) {
    const matchingFiles = [];
    
    try {
      const items = await fs.readdir(sourcePath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isFile()) {
          const fileName = item.name;
          const matches = patterns.some(pattern => {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(fileName);
          });
          
          if (matches) {
            matchingFiles.push(path.join(sourcePath, fileName));
          }
        } else if (item.isDirectory()) {
          // Recursively search subdirectories
          const subFiles = await this.findMatchingFiles(path.join(sourcePath, item.name), patterns);
          matchingFiles.push(...subFiles);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${sourcePath}:`, error.message);
    }
    
    return matchingFiles;
  }

  /**
   * Extract observations from data structure
   */
  extractObservationsFromData(data) {
    const observations = [];
    
    if (typeof data === 'object' && data !== null) {
      // Extract key information based on data structure
      if (data.psychographic_segments) {
        observations.push(`Psychographic segments: ${Object.keys(data.psychographic_segments).length}`);
      }
      
      if (data.keywords) {
        observations.push(`Keywords analyzed: ${Array.isArray(data.keywords) ? data.keywords.length : Object.keys(data.keywords).length}`);
      }
      
      if (data.semantic_clusters) {
        observations.push(`Semantic clusters: ${Object.keys(data.semantic_clusters).length}`);
      }
      
      if (data.competitors) {
        observations.push(`Competitors analyzed: ${Array.isArray(data.competitors) ? data.competitors.length : Object.keys(data.competitors).length}`);
      }
      
      // Add general summary
      const keyCount = Object.keys(data).length;
      observations.push(`Data structure contains ${keyCount} main sections`);
      
    } else {
      observations.push(`Text content: ${data.toString().substring(0, 200)}...`);
    }
    
    return observations;
  }

  /**
   * Generate migration report
   */
  async generateMigrationReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      totalTasks: results.length,
      successfulTasks: results.filter(r => r.status === 'completed').length,
      failedTasks: results.filter(r => r.status === 'failed').length,
      totalEntitiesCreated: results.reduce((sum, r) => sum + (r.entitiesCreated || 0), 0),
      totalRelationsCreated: results.reduce((sum, r) => sum + (r.relationsCreated || 0), 0),
      totalFilesProcessed: results.reduce((sum, r) => sum + (r.filesProcessed || 0), 0),
      details: results
    };

    const reportPath = '/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-system/multilingual/migration-report.json';
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Successful tasks: ${report.successfulTasks}/${report.totalTasks}`);
    console.log(`  📦 Entities created: ${report.totalEntitiesCreated}`);
    console.log(`  🔗 Relations created: ${report.totalRelationsCreated}`);
    console.log(`  📄 Files processed: ${report.totalFilesProcessed}`);
    console.log(`  📋 Report saved: ${reportPath}`);

    return report;
  }

  /**
   * Create core Slovenian project entities
   */
  async createCoreSlovenianEntities() {
    console.log('🏗️  Creating core Slovenian project entities...');

    const coreEntities = [
      {
        name: 'nasmehPG Slovenian Project',
        entityType: 'slovenian-project',
        observations: [
          'Dental implants project for Slovenian market',
          'Language: Slovenian (sl)',
          'Target audience: Slovenian dental patients',
          'Memory pool: slovenian-intelligence',
          'Project focus: Zobni implantati Slovenia'
        ]
      },
      {
        name: 'nasmehPG Slovenian Market',
        entityType: 'slovenian-market',
        observations: [
          'Slovenian dental implant market',
          'Language context: Slovenian cultural values',
          'Market characteristics: Price-conscious, quality-focused',
          'Cultural values: Practicality, family-oriented, health-conscious'
        ]
      },
      {
        name: 'Slovenian Dental Content Strategy',
        entityType: 'slovenian-content-strategy',
        observations: [
          'Content strategy for Slovenian dental market',
          'Focus: Educational, trustworthy, price-transparent',
          'Cultural adaptation: Slovenian communication patterns',
          'SEO targeting: Slovenian dental keywords'
        ]
      }
    ];

    await this.mcpManager.memory.create_entities({ entities: coreEntities });

    // Create relationships between core entities
    const coreRelations = [
      {
        from: 'nasmehPG Slovenian Project',
        to: 'nasmehPG Slovenian Market',
        relationType: 'targets'
      },
      {
        from: 'Slovenian Dental Content Strategy',
        to: 'nasmehPG Slovenian Project',
        relationType: 'guides'
      },
      {
        from: 'nasmehPG Slovenian Market',
        to: 'Slovenian Dental Content Strategy',
        relationType: 'informs'
      }
    ];

    await this.mcpManager.memory.create_relations({ relations: coreRelations });

    console.log('✅ Core Slovenian entities created successfully');
    return { entities: coreEntities, relations: coreRelations };
  }
}

module.exports = LanguageMemoryMigrator;