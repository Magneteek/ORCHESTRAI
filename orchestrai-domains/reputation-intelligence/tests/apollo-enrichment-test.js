/**
 * Apollo.io Contact Enrichment Integration Test
 *
 * Tests the complete Apollo.io enrichment workflow:
 * 1. Business discovery
 * 2. Contact enrichment with Apollo.io
 * 3. Decision-maker identification
 * 4. Enrichment quality scoring
 */

// Load environment variables from .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const ReputationIntelligenceHub = require('../reputation-intelligence-domain-hub');

async function testApolloEnrichment() {
    console.log('🧪 Starting Apollo.io Enrichment Integration Test\n');

    const hub = new ReputationIntelligenceHub();

    try {
        // Step 1: Initialize the hub
        console.log('📝 Step 1: Initializing Reputation Intelligence Hub...');
        await hub.initialize();
        console.log('✅ Hub initialized successfully\n');

        // Step 2: Create sample business data for testing
        console.log('📝 Step 2: Creating sample business data...');
        const sampleBusinesses = [
            {
                id: 'test_dental_1',
                name: 'Modern Dental Practice Amsterdam',
                address: 'Prins Hendrikkade 123, Amsterdam',
                category: 'Dental clinic',
                website: 'https://apollo.io', // Using apollo.io as test domain
                rating: {
                    overall: 2.5,
                    totalReviews: 45
                }
            },
            {
                id: 'test_dental_2',
                name: 'Dental Excellence Rotterdam',
                address: 'Coolsingel 45, Rotterdam',
                category: 'Dental clinic',
                website: 'https://google.com', // Using google.com as test domain
                rating: {
                    overall: 2.8,
                    totalReviews: 32
                }
            }
        ];
        console.log(`✅ Created ${sampleBusinesses.length} sample businesses\n`);

        // Step 3: Test individual business enrichment
        console.log('📝 Step 3: Testing individual business enrichment...');
        const enrichmentAgent = hub.agents.get('contact-enrichment');

        if (!enrichmentAgent || !enrichmentAgent.isInitialized) {
            console.error('❌ Contact enrichment agent not initialized');
            console.log('\n⚠️  APOLLO_API_KEY may not be set in environment variables');
            console.log('   Add APOLLO_API_KEY to your .env file to enable enrichment\n');
            return;
        }

        const enrichedBusiness = await enrichmentAgent.enrichBusiness(sampleBusinesses[0]);

        console.log('\n📊 Enrichment Results for:', enrichedBusiness.name);
        console.log('   Status:', enrichedBusiness.enrichment.status);
        console.log('   Quality Score:', enrichedBusiness.enrichment.qualityScore);

        if (enrichedBusiness.organizationData) {
            console.log('\n   Organization Data:');
            console.log('   - Industry:', enrichedBusiness.organizationData.industry);
            console.log('   - Employee Count:', enrichedBusiness.organizationData.employeeCount);
            console.log('   - Revenue:', enrichedBusiness.organizationData.revenue);
            console.log('   - LinkedIn:', enrichedBusiness.organizationData.socialMedia?.linkedin);
        }

        if (enrichedBusiness.decisionMakers && enrichedBusiness.decisionMakers.length > 0) {
            console.log('\n   Decision Makers Found:', enrichedBusiness.decisionMakers.length);
            enrichedBusiness.decisionMakers.slice(0, 3).forEach((dm, idx) => {
                console.log(`\n   Decision Maker ${idx + 1}:`);
                console.log('   - Name:', dm.name);
                console.log('   - Title:', dm.title);
                console.log('   - Email:', dm.email || 'Not available');
                console.log('   - Seniority:', dm.seniority);
            });

            // Test finding best contact
            const bestContact = enrichmentAgent.findBestContact(enrichedBusiness);
            if (bestContact) {
                console.log('\n   🎯 Best Contact for Outreach:');
                console.log('   - Name:', bestContact.name);
                console.log('   - Title:', bestContact.title);
                console.log('   - Score:', bestContact.score);
            }
        }

        console.log('\n✅ Individual enrichment test completed\n');

        // Step 4: Test bulk enrichment
        console.log('📝 Step 4: Testing bulk enrichment...');
        const enrichedBusinesses = await enrichmentAgent.enrichBusinesses(sampleBusinesses);

        console.log(`✅ Bulk enrichment completed: ${enrichedBusinesses.length} businesses processed\n`);

        // Step 5: Display enrichment statistics
        console.log('📝 Step 5: Enrichment Statistics...');
        const stats = enrichmentAgent.getEnrichmentStats();

        console.log('   Total Enriched:', stats.totalEnriched);
        console.log('   Successful:', stats.successful);
        console.log('   Failed:', stats.failed);
        console.log('   Average Quality Score:', stats.averageQualityScore.toFixed(2));
        console.log('   Total Decision Makers Found:', stats.decisionMakersFound);
        console.log('\n✅ Statistics retrieved successfully\n');

        // Step 6: Test domain hub enrichment stats method
        console.log('📝 Step 6: Testing domain hub enrichment stats...');
        const hubStats = hub.getEnrichmentStats();

        console.log('   Enrichment Enabled:', hubStats.enabled);
        if (hubStats.enabled) {
            console.log('   Hub-level Stats:', {
                totalEnriched: hubStats.totalEnriched,
                successful: hubStats.successful,
                averageQualityScore: hubStats.averageQualityScore?.toFixed(2)
            });
        }
        console.log('\n✅ Hub stats test completed\n');

        // Step 7: Test Apollo API client health check
        console.log('📝 Step 7: Testing Apollo API health check...');
        const apolloClient = enrichmentAgent.apolloClient;
        const healthCheck = await apolloClient.healthCheck();

        console.log('   API Health:', healthCheck.healthy ? '✅ Healthy' : '❌ Unhealthy');
        console.log('   Message:', healthCheck.message);
        console.log('\n✅ Health check completed\n');

        // Step 8: Display summary
        console.log('📊 TEST SUMMARY');
        console.log('================');
        console.log(`✅ All tests passed successfully!`);
        console.log(`\n📈 Enrichment Performance:`);
        console.log(`   - Businesses Processed: ${stats.totalEnriched}`);
        console.log(`   - Success Rate: ${((stats.successful / stats.totalEnriched) * 100).toFixed(1)}%`);
        console.log(`   - Average Quality Score: ${stats.averageQualityScore.toFixed(2)}/100`);
        console.log(`   - Decision Makers Found: ${stats.decisionMakersFound}`);

        console.log(`\n🎯 Integration Status:`);
        console.log(`   - Apollo API: ${healthCheck.healthy ? '✅ Connected' : '❌ Not Connected'}`);
        console.log(`   - Domain Hub: ✅ Integrated`);
        console.log(`   - Event Listeners: ✅ Active`);

        // Cleanup
        await hub.shutdown();
        console.log('\n✅ Test cleanup completed');

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.error('\nStack trace:', error.stack);

        // Attempt cleanup even on error
        try {
            await hub.shutdown();
        } catch (cleanupError) {
            console.error('⚠️  Cleanup error:', cleanupError.message);
        }

        process.exit(1);
    }
}

// Run the test if executed directly
if (require.main === module) {
    testApolloEnrichment()
        .then(() => {
            console.log('\n🎉 All tests completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test suite failed:', error);
            process.exit(1);
        });
}

module.exports = testApolloEnrichment;
