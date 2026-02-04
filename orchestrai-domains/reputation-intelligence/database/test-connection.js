#!/usr/bin/env node

/**
 * Database Connection Test
 * Verifies database connectivity and displays statistics
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const db = require('./db-client');

async function testConnection() {
    console.log('🧪 Testing Database Connection\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Connection
        console.log('\n📋 Test 1: Database Connection');
        await db.connect();
        console.log('   ✅ Connection successful');

        // Test 2: Health Check
        console.log('\n📋 Test 2: Health Check');
        const health = await db.healthCheck();
        console.log(`   ✅ Database is ${health.healthy ? 'healthy' : 'unhealthy'}`);
        console.log(`   ✅ Connection status: ${health.connected ? 'connected' : 'disconnected'}`);

        // Test 3: Database Statistics
        console.log('\n📋 Test 3: Database Statistics');
        const stats = await db.getStatistics();
        console.log(`   📊 Total businesses: ${stats.total_businesses}`);
        console.log(`   📊 Businesses with qualifying reviews: ${stats.businesses_with_qualifying_reviews}`);
        console.log(`   📊 Enriched businesses: ${stats.enriched_businesses}`);
        console.log(`   📊 Total reviews: ${stats.total_reviews}`);
        console.log(`   📊 Qualifying reviews: ${stats.qualifying_reviews}`);
        console.log(`   📊 Total enrichments: ${stats.total_enrichments}`);
        console.log(`   💰 Total API cost: $${parseFloat(stats.total_api_cost).toFixed(4)}`);

        // Test 4: Test Queries
        console.log('\n📋 Test 4: Sample Queries');

        // Query tables
        const tablesResult = await db.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        console.log(`   ✅ Found ${tablesResult.rows.length} tables:`);
        tablesResult.rows.forEach(row => {
            console.log(`      - ${row.table_name}`);
        });

        // Query views
        const viewsResult = await db.query(`
            SELECT table_name
            FROM information_schema.views
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log(`   ✅ Found ${viewsResult.rows.length} views:`);
        viewsResult.rows.forEach(row => {
            console.log(`      - ${row.table_name}`);
        });

        // Test 5: Insert Test Business (Optional)
        if (process.argv.includes('--insert-test')) {
            console.log('\n📋 Test 5: Insert Test Business');

            const testBusiness = await db.upsertBusiness({
                id: 'test_business_123',
                name: 'Test Business',
                place_id: 'ChIJ_test_123',
                address: '123 Test Street',
                city: 'Amsterdam',
                country: 'NL',
                overall_rating: 4.5,
                total_reviews: 100,
                rating_distribution: { 1: 5, 2: 10, 3: 15, 4: 30, 5: 40 }
            });

            console.log(`   ✅ Test business created: ${testBusiness.name} (${testBusiness.id})`);

            // Clean up test data
            await db.query('DELETE FROM businesses WHERE id = $1', ['test_business_123']);
            console.log(`   ✅ Test business cleaned up`);
        }

        // Final Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ All tests passed successfully!');
        console.log('='.repeat(60));

        console.log('\n📚 Available Commands:');
        console.log('   npm run db:stats    - View business review statistics');
        console.log('   npm run db:costs    - View API cost summary');
        console.log('   npm run db:backup   - Create database backup');
        console.log('   npm run db:shell    - Open PostgreSQL shell');

        console.log('\n📚 Useful Queries:');
        console.log('   SELECT * FROM business_review_stats;');
        console.log('   SELECT * FROM daily_cost_summary;');
        console.log('   SELECT * FROM businesses_needing_enrichment;');
        console.log('   SELECT * FROM enrichment_summary;\n');

    } catch (error) {
        console.log('\n' + '='.repeat(60));
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
        console.log('='.repeat(60));

        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check PostgreSQL is running:');
        console.log('      brew services list | grep postgresql');
        console.log('      OR: docker ps | grep postgres');
        console.log('');
        console.log('   2. Verify database exists:');
        console.log('      psql -l | grep reputation_intelligence');
        console.log('');
        console.log('   3. Check environment variables:');
        console.log('      printenv | grep DB_');
        console.log('');
        console.log('   4. Test manual connection:');
        console.log('      psql -h localhost -U postgres -d reputation_intelligence');
        console.log('');

        process.exit(1);
    } finally {
        await db.disconnect();
    }
}

// Run test
testConnection();
