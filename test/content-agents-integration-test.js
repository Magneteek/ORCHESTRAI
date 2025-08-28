const ContentEnhancedDomainHub = require('../orchestrai-domains/content-enhanced/content-domain-hub');

/**
 * Mock Crystalline Memory for testing
 */
class MockCrystallineMemory {
    constructor() {
        this.memory = new Map();
    }
    
    async storeMemory(key, data) {
        this.memory.set(key, { data, timestamp: Date.now() });
        return true;
    }
    
    async retrieveMemory(key) {
        return this.memory.get(key);
    }
    
    async createMemoryPool(poolId) {
        this.memory.set(`pool:${poolId}`, new Map());
        return true;
    }
}

/**
 * Mock Quality Service for testing
 */
class MockQualityService {
    async validateContent(content) {
        return {
            isValid: true,
            score: 0.85,
            issues: [],
            recommendations: []
        };
    }
}

/**
 * Integration Test Suite for Content Enhanced Agents
 * Tests all four specialized content agents with real scenarios
 */

class ContentAgentsIntegrationTest {
    constructor() {
        this.crystallineMemory = new MockCrystallineMemory();
        this.qualityService = new MockQualityService();
        this.domainHub = new ContentEnhancedDomainHub();
        this.testResults = {
            contentClusterSuggester: null,
            contentTitleGenerator: null,
            contentOutlineArchitect: null,
            backlinkStrategyArchitect: null
        };
    }

    async runAllTests() {
        console.log('\n🧪 Starting Content Agents Integration Tests\n');
        
        try {
            // Initialize the domain hub
            console.log('🚀 Initializing Content Domain Hub...');
            await this.domainHub.initialize(this.crystallineMemory, this.qualityService);
            console.log('✅ Domain Hub initialized successfully\n');
            
            // Test Content Cluster Suggester
            await this.testContentClusterSuggester();
            
            // Test Content Title Generator
            await this.testContentTitleGenerator();
            
            // Test Content Outline Architect
            await this.testContentOutlineArchitect();
            
            // Test Backlink Strategy Architect
            await this.testBacklinkStrategyArchitect();
            
            // Display results
            this.displayTestResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            throw error;
        }
    }

    async testContentClusterSuggester() {
        console.log('🎯 Testing Content Cluster Suggester Agent...');
        
        const testData = {
            primaryKeyword: 'dental 3D printing',
            industry: 'healthcare technology',
            targetAudience: 'dental professionals',
            competitorUrls: ['https://formlabs.com/dental', 'https://3dsystems.com/dental'],
            businessGoals: ['increase brand awareness', 'generate qualified leads'],
            contentTypes: ['blog posts', 'case studies', 'technical guides'],
            budgetRange: '$10000-$25000',
            timeline: '6 months'
        };

        const task = {
            type: 'content_cluster_suggestion',
            priority: 'high',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            requirements: ['semantic analysis', 'competitor research', 'search volume analysis']
        };

        try {
            // Get the specific agent and call its createContent method
            const agent = this.domainHub.agents.get('content-cluster-suggester');
            if (!agent) {
                throw new Error('Content Cluster Suggester agent not found');
            }
            const result = await agent.createContent(task, testData);
            
            this.testResults.contentClusterSuggester = {
                success: true,
                hasClusterData: !!(result.primaryClusters && result.supportingClusters),
                hasSearchVolume: !!(result.searchVolumeAnalysis),
                hasCompetitorAnalysis: !!(result.competitorAnalysis),
                hasPillarStrategy: !!(result.pillarContentStrategy),
                executionTime: result.performanceMetrics?.executionTime || 0
            };
            
            console.log('✅ Content Cluster Suggester: PASSED');
            console.log(`   - Generated ${result.primaryClusters?.length || 0} primary clusters`);
            console.log(`   - Generated ${result.supportingClusters?.length || 0} supporting clusters`);
            console.log(`   - Execution time: ${result.performanceMetrics?.executionTime}ms`);
            
        } catch (error) {
            this.testResults.contentClusterSuggester = { success: false, error: error.message };
            console.log('❌ Content Cluster Suggester: FAILED -', error.message);
        }
    }

    async testContentTitleGenerator() {
        console.log('\n📝 Testing Content Title Generator Agent...');
        
        const testData = {
            targetKeyword: 'best dental 3D printer 2024',
            contentType: 'comparison guide',
            targetAudience: 'dental practice owners',
            brandVoice: 'professional and authoritative',
            competitors: ['formlabs', '3dsystems', 'asiga'],
            industryTrends: ['sustainability', 'precision', 'cost-effectiveness'],
            emotionalTriggers: ['fear of missing out', 'desire for efficiency'],
            searchIntent: 'commercial investigation'
        };

        const task = {
            type: 'content_title_generation',
            priority: 'medium',
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            requirements: ['emotional triggers', 'SEO optimization', 'brand alignment']
        };

        try {
            // Get the specific agent and call its createContent method
            const agent = this.domainHub.agents.get('content-title-generator');
            if (!agent) {
                throw new Error('Content Title Generator agent not found');
            }
            const result = await agent.createContent(task, testData);
            
            this.testResults.contentTitleGenerator = {
                success: true,
                hasTitles: !!(result.optimizedTitles && result.optimizedTitles.length > 0),
                hasScoring: !!(result.seoScoring),
                hasAbTesting: !!(result.abTestingRecommendations),
                hasEmotionalAnalysis: !!(result.emotionalImpactAnalysis),
                titleCount: result.optimizedTitles?.length || 0,
                executionTime: result.performanceMetrics?.executionTime || 0
            };
            
            console.log('✅ Content Title Generator: PASSED');
            console.log(`   - Generated ${result.optimizedTitles?.length || 0} optimized titles`);
            console.log(`   - Top title score: ${result.optimizedTitles?.[0]?.totalScore || 'N/A'}`);
            console.log(`   - Execution time: ${result.performanceMetrics?.executionTime}ms`);
            
        } catch (error) {
            this.testResults.contentTitleGenerator = { success: false, error: error.message };
            console.log('❌ Content Title Generator: FAILED -', error.message);
        }
    }

    async testContentOutlineArchitect() {
        console.log('\n🏗️ Testing Content Outline Architect Agent...');
        
        const testData = {
            title: 'Complete Guide to Dental 3D Printing: Technology, Applications, and Best Practices',
            primaryKeyword: 'dental 3D printing guide',
            secondaryKeywords: ['dental 3D printing applications', 'dental 3D printing materials', 'dental 3D printing workflow'],
            targetAudience: 'dental professionals and technicians',
            contentGoals: ['educate', 'establish authority', 'generate leads'],
            competitorContent: [
                { title: 'Dental 3D Printing Overview', headingCount: 12 },
                { title: 'Guide to Dental Manufacturing', headingCount: 8 }
            ],
            readabilityTarget: 'grade 10-12',
            wordCountTarget: 3500,
            featuredSnippetTargets: ['what is dental 3D printing', 'dental 3D printing benefits']
        };

        const task = {
            type: 'content_outline_creation',
            priority: 'high',
            deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
            requirements: ['hierarchical structure', 'keyword optimization', 'readability planning']
        };

        try {
            // Get the specific agent and call its createContent method
            const agent = this.domainHub.agents.get('content-outline-architect');
            if (!agent) {
                throw new Error('Content Outline Architect agent not found');
            }
            const result = await agent.createContent(task, testData);
            
            this.testResults.contentOutlineArchitect = {
                success: true,
                hasOutline: !!(result.detailedOutline),
                hasHierarchy: !!(result.hierarchicalStructure),
                hasKeywordVelocity: !!(result.keywordVelocityPlan),
                hasSnippetTargeting: !!(result.featuredSnippetStrategy),
                headingCount: result.hierarchicalStructure?.totalHeadings || 0,
                executionTime: result.performanceMetrics?.executionTime || 0
            };
            
            console.log('✅ Content Outline Architect: PASSED');
            console.log(`   - Generated ${result.hierarchicalStructure?.totalHeadings || 0} total headings`);
            console.log(`   - H2 count: ${result.hierarchicalStructure?.h2Count || 0}`);
            console.log(`   - H3 count: ${result.hierarchicalStructure?.h3Count || 0}`);
            console.log(`   - H4 count: ${result.hierarchicalStructure?.h4Count || 0}`);
            console.log(`   - Execution time: ${result.performanceMetrics?.executionTime}ms`);
            
        } catch (error) {
            this.testResults.contentOutlineArchitect = { success: false, error: error.message };
            console.log('❌ Content Outline Architect: FAILED -', error.message);
        }
    }

    async testBacklinkStrategyArchitect() {
        console.log('\n🔗 Testing Backlink Strategy Architect Agent...');
        
        const testData = {
            targetUrl: 'https://example.com/dental-3d-printing-guide',
            primaryKeyword: 'dental 3D printing',
            secondaryKeywords: ['dental 3D printers', 'dental manufacturing', 'dental technology'],
            domainAuthority: 35,
            currentBacklinks: 150,
            competitorAnalysis: [
                { domain: 'formlabs.com', da: 72, backlinks: 12500 },
                { domain: '3dsystems.com', da: 68, backlinks: 8900 }
            ],
            industry: 'dental technology',
            budgetRange: '$15000-$30000',
            timeline: '8 months',
            riskTolerance: 'moderate',
            linkBuildingGoals: ['increase domain authority', 'improve keyword rankings', 'drive referral traffic']
        };

        const task = {
            type: 'backlink_strategy_development',
            priority: 'high',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            requirements: ['anchor text distribution', 'risk assessment', 'competitive analysis']
        };

        try {
            // Get the specific agent and call its createContent method
            const agent = this.domainHub.agents.get('backlink-strategy-architect');
            if (!agent) {
                throw new Error('Backlink Strategy Architect agent not found');
            }
            const result = await agent.createContent(task, testData);
            
            this.testResults.backlinkStrategyArchitect = {
                success: true,
                hasStrategy: !!(result.comprehensiveStrategy),
                hasAnchorDistribution: !!(result.anchorTextDistribution),
                hasRiskAssessment: !!(result.riskAssessmentFramework),
                hasLinkVelocity: !!(result.linkVelocityPlanning),
                prospectCount: result.linkBuildingProspects?.length || 0,
                executionTime: result.performanceMetrics?.executionTime || 0
            };
            
            console.log('✅ Backlink Strategy Architect: PASSED');
            console.log(`   - Generated ${result.linkBuildingProspects?.length || 0} link prospects`);
            console.log(`   - Risk level: ${result.riskAssessmentFramework?.overallRiskLevel || 'N/A'}`);
            console.log(`   - Strategy timeline: ${result.comprehensiveStrategy?.timelineMonths || 'N/A'} months`);
            console.log(`   - Execution time: ${result.performanceMetrics?.executionTime}ms`);
            
        } catch (error) {
            this.testResults.backlinkStrategyArchitect = { success: false, error: error.message };
            console.log('❌ Backlink Strategy Architect: FAILED -', error.message);
        }
    }

    displayTestResults() {
        console.log('\n📊 CONTENT AGENTS INTEGRATION TEST RESULTS\n');
        console.log('=' .repeat(60));
        
        const allPassed = Object.values(this.testResults).every(result => result?.success);
        const passCount = Object.values(this.testResults).filter(result => result?.success).length;
        const totalCount = Object.keys(this.testResults).length;
        
        console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        console.log(`Success Rate: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)\n`);
        
        // Detailed results
        Object.entries(this.testResults).forEach(([agentName, result]) => {
            const displayName = agentName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            if (result.success) {
                console.log(`✅ ${displayName}:`);
                if (result.executionTime) console.log(`   Execution Time: ${result.executionTime}ms`);
                
                // Agent-specific metrics
                if (agentName === 'contentClusterSuggester') {
                    console.log(`   Cluster Data: ${result.hasClusterData ? '✓' : '✗'}`);
                    console.log(`   Search Volume: ${result.hasSearchVolume ? '✓' : '✗'}`);
                    console.log(`   Competitor Analysis: ${result.hasCompetitorAnalysis ? '✓' : '✗'}`);
                } else if (agentName === 'contentTitleGenerator') {
                    console.log(`   Generated Titles: ${result.titleCount}`);
                    console.log(`   SEO Scoring: ${result.hasScoring ? '✓' : '✗'}`);
                    console.log(`   A/B Testing: ${result.hasAbTesting ? '✓' : '✗'}`);
                } else if (agentName === 'contentOutlineArchitect') {
                    console.log(`   Total Headings: ${result.headingCount}`);
                    console.log(`   Hierarchical Structure: ${result.hasHierarchy ? '✓' : '✗'}`);
                    console.log(`   Keyword Velocity: ${result.hasKeywordVelocity ? '✓' : '✗'}`);
                } else if (agentName === 'backlinkStrategyArchitect') {
                    console.log(`   Link Prospects: ${result.prospectCount}`);
                    console.log(`   Risk Assessment: ${result.hasRiskAssessment ? '✓' : '✗'}`);
                    console.log(`   Anchor Distribution: ${result.hasAnchorDistribution ? '✓' : '✗'}`);
                }
                
            } else {
                console.log(`❌ ${displayName}: ${result.error}`);
            }
            console.log('');
        });
        
        console.log('=' .repeat(60));
        console.log('🎉 Content Agents Integration Testing Complete!\n');
    }
}

// Export for use in other test suites
module.exports = { ContentAgentsIntegrationTest };

// Run tests if called directly
if (require.main === module) {
    async function runTests() {
        const testSuite = new ContentAgentsIntegrationTest();
        
        try {
            await testSuite.runAllTests();
            process.exit(0);
        } catch (error) {
            console.error('Test suite failed:', error);
            process.exit(1);
        }
    }
    
    runTests();
}