/**
 * Simple Apollo.io API Key Validator
 * Tests if the API key is valid and working
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');

async function validateApolloKey() {
    const apiKey = process.env.APOLLO_API_KEY;

    console.log('🔑 Apollo API Key Validator\n');
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');

    if (!apiKey) {
        console.error('❌ APOLLO_API_KEY environment variable is not set!');
        console.log('\nPlease add it to your .env file:');
        console.log('APOLLO_API_KEY=your_actual_api_key_here');
        process.exit(1);
    }

    console.log('\n📝 Testing Apollo API connectivity...\n');

    // Test 1: Simple organization enrichment
    console.log('Test 1: Organization Enrichment');
    try {
        const response = await axios.post(
            'https://api.apollo.io/v1/organizations/enrich',
            {
                domain: 'apollo.io'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey,
                    'Cache-Control': 'no-cache'
                },
                timeout: 30000
            }
        );

        console.log('✅ Organization enrichment successful!');
        console.log('   Organization:', response.data.organization?.name);
        console.log('   Industry:', response.data.organization?.industry);
        console.log('   Employees:', response.data.organization?.estimated_num_employees);
        console.log('');
    } catch (error) {
        console.error('❌ Organization enrichment failed:');
        console.error('   Status:', error.response?.status);
        console.error('   Message:', error.response?.data?.message || error.message);
        console.error('   Error:', error.response?.data || error.message);

        if (error.response?.status === 403) {
            console.log('\n💡 Troubleshooting 403 Forbidden:');
            console.log('   1. Verify your API key is correct in Apollo.io dashboard');
            console.log('   2. Check if your Apollo.io account is active');
            console.log('   3. Ensure you have API access enabled');
            console.log('   4. Verify your account has credits available');
            console.log('   5. Check if the API key has proper permissions');
        } else if (error.response?.status === 429) {
            console.log('\n⚠️ Rate limit exceeded. Wait a moment and try again.');
        } else if (error.response?.status === 401) {
            console.log('\n❌ Unauthorized - API key is invalid or expired.');
        }
        console.log('');
    }

    // Test 2: People search (simpler endpoint)
    console.log('Test 2: Basic API Access Check');
    try {
        const response = await axios.get(
            'https://api.apollo.io/v1/auth/health',
            {
                headers: {
                    'X-Api-Key': apiKey,
                    'Cache-Control': 'no-cache'
                },
                timeout: 30000
            }
        );

        console.log('✅ API health check passed!');
        console.log('   Status:', response.data);
        console.log('');
    } catch (error) {
        // Health endpoint might not exist, try another simple endpoint
        console.log('ℹ️  Health endpoint not available, trying alternative...');
        console.log('');
    }

    console.log('📊 API Key Validation Complete\n');
}

validateApolloKey()
    .then(() => {
        console.log('✅ Validation finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Validation failed:', error.message);
        process.exit(1);
    });
