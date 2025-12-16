/**
 * Import Client Intelligence Data from External Systems
 *
 * This script imports ICP and intelligence data from other agentic systems
 * and integrates them into ORCHESTRAI with proper memory registration.
 *
 * Usage:
 *   node import-client-data.js /path/to/source/data.json ClientName
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ClientDataImporter {
    constructor(projectsBasePath = '/Users/kris/CLAUDEtools/ORCHESTRAI/projects') {
        this.projectsBasePath = projectsBasePath;
    }

    /**
     * Generate a unique project UUID
     */
    generateUUID() {
        return crypto.randomUUID();
    }

    /**
     * Create a sanitized project folder name
     */
    sanitizeProjectName(clientName) {
        return clientName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '')
            .substring(0, 20);
    }

    /**
     * Create ORCHESTRAI project structure
     */
    createProjectStructure(clientName, uuid) {
        const sanitizedName = this.sanitizeProjectName(clientName);
        const projectId = `${sanitizedName}-${uuid}`;
        const projectPath = path.join(this.projectsBasePath, projectId);

        // Create directory structure
        const directories = [
            projectPath,
            path.join(projectPath, 'client-intelligence'),
            path.join(projectPath, 'client-intelligence/assets'),
            path.join(projectPath, 'deliverables'),
            path.join(projectPath, 'deliverables/research'),
            path.join(projectPath, 'deliverables/seo'),
            path.join(projectPath, 'deliverables/content')
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        return { projectId, projectPath };
    }

    /**
     * Map external data format to ORCHESTRAI format
     *
     * This handles different source formats and normalizes them
     */
    mapDataToORCHESTRAIFormat(sourceData, clientName) {
        // Detect source format and map accordingly
        const mappedData = {
            metadata: {
                aggregatedAt: new Date().toISOString(),
                sources: sourceData.sources || ['Imported Data'],
                completeness: this.calculateCompleteness(sourceData),
                importedFrom: sourceData.systemName || 'External System',
                originalFormat: this.detectSourceFormat(sourceData)
            }
        };

        // Map EOS data
        if (sourceData.eos || sourceData.coreValues) {
            mappedData.eos = this.mapEOSData(sourceData);
        }

        // Map ICP data
        if (sourceData.icp || sourceData.idealCustomerProfile) {
            mappedData.icp = this.mapICPData(sourceData);
        }

        // Map Personas
        if (sourceData.personas || sourceData.customerSegments) {
            mappedData.personas = this.mapPersonasData(sourceData);
        }

        // Map Psychographic data
        if (sourceData.psychographic || sourceData.psychographics) {
            mappedData.psychographic = this.mapPsychographicData(sourceData);
        }

        // Map Market Intelligence
        if (sourceData.marketIntelligence || sourceData.market) {
            mappedData.marketIntelligence = this.mapMarketData(sourceData);
        }

        // Map Brand data
        if (sourceData.brand || sourceData.branding) {
            mappedData.brand = this.mapBrandData(sourceData);
        }

        // Map Business Context
        if (sourceData.business || sourceData.businessContext) {
            mappedData.business = this.mapBusinessData(sourceData);
        }

        return mappedData;
    }

    /**
     * Detect source data format
     */
    detectSourceFormat(data) {
        if (data.systemName) return data.systemName;
        if (data._meta?.system) return data._meta.system;
        if (data.format) return data.format;
        return 'Unknown';
    }

    /**
     * Map EOS Framework data
     */
    mapEOSData(sourceData) {
        const source = sourceData.eos || sourceData.coreValues || {};

        return {
            coreValues: this.normalizeToObjectArray(
                source.coreValues || source.values,
                ['name', 'description']
            ),
            coreFocus: this.normalizeCoreFocus(source.coreFocus || source.purpose),
            marketingStrategy: source.marketingStrategy || {},
            tenYearTarget: source.tenYearTarget || source.vision?.tenYear,
            threeYearPicture: source.threeYearPicture || source.vision?.threeYear
        };
    }

    /**
     * Map ICP data
     */
    mapICPData(sourceData) {
        const source = sourceData.icp || sourceData.idealCustomerProfile || {};

        return {
            avatar: source.avatar || source.primaryAvatar,
            niche: source.niche || source.marketNiche,
            trigger: source.trigger || source.buyingTrigger,
            before: this.normalizeToArray(source.before || source.painPoints),
            after: this.normalizeToArray(source.after || source.results),
            primaryGoals: source.primaryGoals || source.goals,
            secondaryGoals: source.secondaryGoals,
            dreams: source.dreams || source.aspirations,
            promises: source.promises || source.valuePropositions,
            primaryComplaint: source.primaryComplaint || source.complaints,
            secondaryComplaint: source.secondaryComplaint,
            objections: source.objections,
            badHabits: source.badHabits || source.negativePatterns,
            consequences: source.consequences,
            enemy: source.enemy || source.competition,
            biggestFear: source.biggestFear || source.fears,
            statistics: source.statistics || { negative: [], general: [] },
            pastExperiences: this.normalizeToObjectArray(
                source.pastExperiences || source.failedAttempts,
                ['title', 'whatTried', 'whyTried', 'whyFailed']
            )
        };
    }

    /**
     * Map Personas data
     */
    mapPersonasData(sourceData) {
        const source = sourceData.personas || sourceData.customerSegments || [];

        if (!Array.isArray(source)) return [];

        return source.map(persona => ({
            name: persona.name || persona.title,
            motivation: this.normalizeToArray(persona.motivation || persona.motivations),
            fears: this.normalizeToArray(persona.fears || persona.concerns),
            goals: this.normalizeToArray(persona.goals || persona.objectives),
            reasons: this.normalizeToArray(persona.reasons || persona.buyingReasons),
            demographics: persona.demographics,
            painPoints: this.normalizeToArray(persona.painPoints),
            percentage: persona.percentage || persona.marketShare
        }));
    }

    /**
     * Map Psychographic data
     */
    mapPsychographicData(sourceData) {
        const source = sourceData.psychographic || sourceData.psychographics || {};

        return {
            culturalValues: source.culturalValues || source.values,
            behavioralPatterns: source.behavioralPatterns || source.behaviors,
            emotionalTriggers: source.emotionalTriggers || source.triggers,
            trustFactors: source.trustFactors || source.trust,
            communicationPreferences: source.communicationPreferences || source.communication
        };
    }

    /**
     * Map Market Intelligence data
     */
    mapMarketData(sourceData) {
        const source = sourceData.marketIntelligence || sourceData.market || {};

        return {
            opportunityScore: source.opportunityScore || 85,
            totalMarketSize: source.totalMarketSize || source.marketSize,
            competitiveIntensity: source.competitiveIntensity || 'Moderate',
            competitors: this.normalizeToObjectArray(
                source.competitors,
                ['name', 'strengths', 'weaknesses', 'marketShare']
            ),
            swot: source.swot || {},
            positioning: source.positioning || {},
            growthRoadmap: source.growthRoadmap
        };
    }

    /**
     * Map Brand data
     */
    mapBrandData(sourceData) {
        const source = sourceData.brand || sourceData.branding || {};

        return {
            voicePillars: source.voicePillars || source.voice,
            visualIdentity: source.visualIdentity || source.visual,
            messagingFramework: source.messagingFramework || source.messaging,
            positioning: source.positioning
        };
    }

    /**
     * Map Business Context data
     */
    mapBusinessData(sourceData) {
        const source = sourceData.business || sourceData.businessContext || {};

        return {
            financials: source.financials || {},
            operations: source.operations || {},
            staffing: source.staffing || {},
            modelSummary: source.modelSummary || source.businessModel
        };
    }

    /**
     * Normalize data to array format
     */
    normalizeToArray(input) {
        if (Array.isArray(input)) return input;
        if (typeof input === 'string') {
            return input.split(/\n/).map(line => line.trim()).filter(line => line.length > 0);
        }
        return [];
    }

    /**
     * Normalize data to array of objects
     */
    normalizeToObjectArray(input, requiredFields) {
        if (!input) return [];
        if (Array.isArray(input)) {
            // If already objects, ensure they have required fields
            return input.map(item => {
                if (typeof item === 'object') return item;
                // If strings, convert to objects
                const obj = {};
                obj[requiredFields[0]] = item;
                return obj;
            });
        }
        return [];
    }

    /**
     * Normalize core focus data
     */
    normalizeCoreFocus(input) {
        if (typeof input === 'object' && input !== null) {
            return {
                purpose: input.purpose || input.mission,
                niche: input.niche || input.focus
            };
        }
        if (typeof input === 'string') {
            return {
                purpose: input,
                niche: ''
            };
        }
        return { purpose: 'Not specified', niche: '' };
    }

    /**
     * Calculate data completeness percentage
     */
    calculateCompleteness(data) {
        const requiredSections = ['eos', 'icp', 'personas', 'psychographic', 'marketIntelligence'];
        const presentSections = requiredSections.filter(section =>
            data[section] || data[this.toCamelCase(section)]
        );
        return Math.round((presentSections.length / requiredSections.length) * 100);
    }

    toCamelCase(str) {
        return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
    }

    /**
     * Create project metadata
     */
    createProjectMetadata(clientName, projectId, sourceData) {
        return {
            clientName,
            projectId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            type: 'client-intelligence',
            importedFrom: sourceData.systemName || 'External System',
            dataVersion: '1.0'
        };
    }

    /**
     * Create crystalline memory entities
     */
    createMemoryEntities(clientName, projectId, data) {
        const entities = [];
        const relations = [];

        // Client entity
        const clientEntity = {
            entityType: 'Client',
            name: clientName,
            observations: [
                `Project ID: ${projectId}`,
                `Imported: ${new Date().toISOString()}`,
                `Data completeness: ${data.metadata.completeness}%`,
                `Source: ${data.metadata.importedFrom}`
            ]
        };
        entities.push(clientEntity);

        // Project entity
        const projectEntity = {
            entityType: 'Project',
            name: `${clientName} Intelligence Project`,
            observations: [
                `Type: Client Intelligence`,
                `Status: Active`,
                `Created: ${new Date().toISOString()}`
            ]
        };
        entities.push(projectEntity);

        // Personas entities
        if (data.personas && Array.isArray(data.personas)) {
            data.personas.forEach(persona => {
                const personaEntity = {
                    entityType: 'CustomerPersona',
                    name: `${clientName} - ${persona.name}`,
                    observations: [
                        `Primary motivation: ${persona.motivation?.[0] || 'N/A'}`,
                        `Primary goal: ${persona.goals?.[0] || 'N/A'}`,
                        `Key fear: ${persona.fears?.[0] || 'N/A'}`
                    ]
                };
                entities.push(personaEntity);

                // Relation: Client has persona
                relations.push({
                    from: clientName,
                    to: `${clientName} - ${persona.name}`,
                    relationType: 'has_persona'
                });
            });
        }

        // Relations
        relations.push({
            from: clientName,
            to: `${clientName} Intelligence Project`,
            relationType: 'has_project'
        });

        relations.push({
            from: `${clientName} Intelligence Project`,
            to: 'Client Intelligence Domain',
            relationType: 'managed_by'
        });

        return {
            entities,
            relations,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Main import function
     */
    async importClientData(sourceDataPath, clientName) {
        console.log('='.repeat(70));
        console.log('ORCHESTRAI Client Data Import');
        console.log('='.repeat(70));
        console.log('');

        // 1. Load source data
        console.log('📂 Loading source data...');
        const sourceData = JSON.parse(fs.readFileSync(sourceDataPath, 'utf8'));
        console.log(`   ✓ Loaded from: ${sourceDataPath}`);
        console.log('');

        // 2. Create project structure
        console.log('📁 Creating project structure...');
        const uuid = this.generateUUID();
        const { projectId, projectPath } = this.createProjectStructure(clientName, uuid);
        console.log(`   ✓ Project ID: ${projectId}`);
        console.log(`   ✓ Project path: ${projectPath}`);
        console.log('');

        // 3. Map data to ORCHESTRAI format
        console.log('🔄 Mapping data to ORCHESTRAI format...');
        const mappedData = this.mapDataToORCHESTRAIFormat(sourceData, clientName);
        console.log(`   ✓ Data completeness: ${mappedData.metadata.completeness}%`);
        console.log(`   ✓ Source system: ${mappedData.metadata.importedFrom}`);
        console.log('');

        // 4. Save mapped data
        console.log('💾 Saving data files...');
        const dataPath = path.join(projectPath, 'client-intelligence/comprehensive-intelligence-aggregated.json');
        fs.writeFileSync(dataPath, JSON.stringify(mappedData, null, 2), 'utf8');
        console.log(`   ✓ Saved: comprehensive-intelligence-aggregated.json`);

        // 5. Save project metadata
        const metadata = this.createProjectMetadata(clientName, projectId, sourceData);
        const metadataPath = path.join(projectPath, 'project-metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
        console.log(`   ✓ Saved: project-metadata.json`);

        // 6. Create memory entities
        console.log('');
        console.log('🧠 Creating crystalline memory entities...');
        const memoryData = this.createMemoryEntities(clientName, projectId, mappedData);
        const memoryPath = path.join(projectPath, 'crystalline-memory-index.json');
        fs.writeFileSync(memoryPath, JSON.stringify(memoryData, null, 2), 'utf8');
        console.log(`   ✓ Created ${memoryData.entities.length} entities`);
        console.log(`   ✓ Created ${memoryData.relations.length} relations`);
        console.log(`   ✓ Saved: crystalline-memory-index.json`);

        // 7. Summary
        console.log('');
        console.log('='.repeat(70));
        console.log('✅ Import Complete!');
        console.log('='.repeat(70));
        console.log('');
        console.log('📊 Import Summary:');
        console.log(`   Client: ${clientName}`);
        console.log(`   Project ID: ${projectId}`);
        console.log(`   Project Path: ${projectPath}`);
        console.log(`   Data Completeness: ${mappedData.metadata.completeness}%`);
        console.log(`   Personas: ${mappedData.personas?.length || 0}`);
        console.log(`   Memory Entities: ${memoryData.entities.length}`);
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('   1. Generate HTML reports:');
        console.log(`      node orchestrai-domains/client-intelligence/scripts/generate-reports.js ${projectId}`);
        console.log('   2. Review imported data:');
        console.log(`      open ${dataPath}`);
        console.log('   3. Register in global memory (optional):');
        console.log(`      node orchestrai-shared/memory/register-project.js ${projectId}`);
        console.log('');

        return {
            success: true,
            projectId,
            projectPath,
            dataCompleteness: mappedData.metadata.completeness
        };
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node import-client-data.js <source-data-path> <client-name>');
        console.log('');
        console.log('Example:');
        console.log('  node import-client-data.js /path/to/client-data.json "QuartzIQ"');
        console.log('');
        process.exit(1);
    }

    const [sourceDataPath, clientName] = args;
    const importer = new ClientDataImporter();

    importer.importClientData(sourceDataPath, clientName)
        .then(result => {
            if (result.success) {
                process.exit(0);
            } else {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Import failed:', error.message);
            console.error(error.stack);
            process.exit(1);
        });
}

module.exports = ClientDataImporter;
