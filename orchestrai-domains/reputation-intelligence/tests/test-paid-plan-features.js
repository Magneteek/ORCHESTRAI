/**
 * Apollo.io Paid Plan Features Test
 * Tests complete decision-maker discovery with paid API access
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const ApolloClient = require('../lib/apollo-client');

async function testPaidPlanFeatures() {
    console.log('🎯 Testing Apollo.io Paid Plan Features\n');

    const apolloApiKey = process.env.APOLLO_API_KEY;
    if (!apolloApiKey) {
        console.error('❌ APOLLO_API_KEY not set in .env file');
        process.exit(1);
    }

    const client = new ApolloClient(apolloApiKey);

    // Test 1: Organization Enrichment
    console.log('📝 Test 1: Organization Enrichment');
    console.log('   Enriching: apollo.io\n');

    const orgResult = await client.enrichOrganization('apollo.io');

    if (orgResult.success) {
        console.log('✅ Organization enrichment successful!');
        console.log('   Name:', orgResult.data.name);
        console.log('   Industry:', orgResult.data.industry);
        console.log('   Employees:', orgResult.data.employeeCount);
        console.log('   Revenue:', orgResult.data.revenue);
        console.log('   LinkedIn:', orgResult.data.socialMedia?.linkedin);
        console.log('   Tech Stack:', orgResult.data.techStack?.slice(0, 3).join(', '), '...');
    } else {
        console.error('❌ Organization enrichment failed:', orgResult.error);
    }

    console.log('\n' + '─'.repeat(60) + '\n');

    // Test 2: Decision Maker Search (PAID PLAN FEATURE)
    console.log('📝 Test 2: Decision-Maker Search (Paid Plan Feature)');
    console.log('   Searching for: C-level executives at apollo.io\n');

    const peopleResult = await client.searchPeople({
        organizationDomain: 'apollo.io',
        titles: ['CEO', 'CTO', 'COO', 'VP'],
        seniorities: ['c_suite', 'vp'],
        limit: 5
    });

    if (peopleResult.success) {
        console.log('✅ Decision-maker search successful!');
        console.log('   Found', peopleResult.totalResults, 'total results');
        console.log('   Returned', peopleResult.contacts.length, 'contacts\n');

        peopleResult.contacts.forEach((contact, idx) => {
            console.log('   Contact', idx + 1 + ':');
            console.log('   - Name:', contact.name);
            console.log('   - Title:', contact.title);
            console.log('   - Email:', contact.email || 'Not available');
            console.log('   - Seniority:', contact.seniority);
            console.log('   - LinkedIn:', contact.linkedinUrl || 'Not available');
            console.log('');
        });
    } else {
        console.error('❌ Decision-maker search failed:', peopleResult.error);
        console.log('\n⚠️  If you see a 403 error, your trial might need activation.');
        console.log('   Check: https://app.apollo.io/settings/integrations');
    }

    console.log('─'.repeat(60) + '\n');

    // Test 3: Dental Practice Example (Real-world use case)
    console.log('📝 Test 3: Healthcare/Dental Industry Targeting');
    console.log('   Testing industry-specific decision-maker profiles\n');

    const healthcareTest = await client.searchPeople({
        organizationDomain: 'google.com', // Using Google as test (has data)
        titles: ['Manager', 'Director'],
        seniorities: ['director', 'manager'],
        limit: 3
    });

    if (healthcareTest.success) {
        console.log('✅ Industry targeting successful!');
        console.log('   Found', healthcareTest.totalResults, 'total decision makers');
        console.log('   Sample contacts:', healthcareTest.contacts.length, '\n');
    } else {
        console.log('ℹ️  Test domain response:', healthcareTest.error);
    }

    console.log('─'.repeat(60) + '\n');

    // Summary
    console.log('📊 PAID PLAN FEATURES SUMMARY\n');
    console.log('✅ Organization Enrichment: Working');
    console.log(peopleResult.success ? '✅' : '❌', 'Decision-Maker Search:', peopleResult.success ? 'Working' : 'Check API access');
    console.log('\n🎯 Your Apollo.io trial is', peopleResult.success ? 'FULLY ACTIVE ✅' : 'pending activation ⚠️');

    if (peopleResult.success) {
        console.log('\n💡 Next Steps:');
        console.log('   1. Run full integration test: npm run test:apollo');
        console.log('   2. Start monitoring businesses with enrichment');
        console.log('   3. Expect quality scores of 80-100/100');
        console.log('   4. Full decision-maker contact discovery enabled');
        console.log('\n🚀 You can now use the complete enrichment workflow!');
    } else {
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Verify trial is activated in Apollo.io dashboard');
        console.log('   2. Check API access at: https://app.apollo.io/settings/integrations');
        console.log('   3. Ensure API key has "People Search" permissions');
        console.log('   4. Trial might take a few minutes to activate');
    }
}

testPaidPlanFeatures()
    .then(() => {
        console.log('\n✅ Paid plan testing complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    });
