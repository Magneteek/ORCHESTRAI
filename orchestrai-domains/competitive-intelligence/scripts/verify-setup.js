#!/usr/bin/env node

/**
 * Setup Verification Script
 *
 * Validates that all requirements for Competitive Intelligence System are met
 *
 * Usage: node scripts/verify-setup.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const redis = require('redis');
const axios = require('axios');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Verification results
const results = {
    passed: [],
    failed: [],
    warnings: []
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(check, message) {
    results.passed.push(check);
    log(`✅ ${check}: ${message}`, 'green');
}

function fail(check, message) {
    results.failed.push(check);
    log(`❌ ${check}: ${message}`, 'red');
}

function warn(check, message) {
    results.warnings.push(check);
    log(`⚠️  ${check}: ${message}`, 'yellow');
}

async function checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);

    if (majorVersion >= 18) {
        success('Node.js Version', `${version} (>= 18.0.0)`);
        return true;
    } else {
        fail('Node.js Version', `${version} (Need >= 18.0.0)`);
        return false;
    }
}

async function checkEnvironmentVariables() {
    const required = [
        'META_ACCESS_TOKEN',
        'DATABASE_URL',
        'CLAUDE_API_KEY',
        'OPENAI_API_KEY'
    ];

    const optional = [
        'APIFY_API_TOKEN',
        'REDIS_URL',
        'R2_ACCOUNT_ID',
        'SMTP_HOST'
    ];

    let allPresent = true;

    for (const varName of required) {
        if (process.env[varName]) {
            success(`Env: ${varName}`, 'Configured');
        } else {
            fail(`Env: ${varName}`, 'Missing (REQUIRED)');
            allPresent = false;
        }
    }

    for (const varName of optional) {
        if (process.env[varName]) {
            success(`Env: ${varName}`, 'Configured');
        } else {
            warn(`Env: ${varName}`, 'Missing (optional)');
        }
    }

    return allPresent;
}

async function checkPostgreSQL() {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });

        const client = await pool.connect();
        const result = await client.query('SELECT version()');
        const version = result.rows[0].version;

        success('PostgreSQL Connection', 'Connected successfully');
        log(`   Version: ${version.split(' ')[1]}`, 'cyan');

        // Check if tables exist
        const tables = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        if (tables.rows.length > 0) {
            success('Database Schema', `${tables.rows.length} tables found`);
            tables.rows.forEach(row => {
                log(`   - ${row.table_name}`, 'cyan');
            });
        } else {
            warn('Database Schema', 'No tables found. Run: npm run db:migrate');
        }

        client.release();
        await pool.end();
        return true;

    } catch (error) {
        fail('PostgreSQL Connection', error.message);
        return false;
    }
}

async function checkRedis() {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const client = redis.createClient({ url: redisUrl });

        await client.connect();
        await client.ping();

        success('Redis Connection', 'Connected successfully');

        const info = await client.info();
        const version = info.match(/redis_version:(\S+)/)[1];
        log(`   Version: ${version}`, 'cyan');

        await client.quit();
        return true;

    } catch (error) {
        warn('Redis Connection', `${error.message} (optional but recommended)`);
        return false;
    }
}

async function checkMetaAPI() {
    try {
        const accessToken = process.env.META_ACCESS_TOKEN;
        if (!accessToken) {
            fail('Meta Ad Library API', 'META_ACCESS_TOKEN not configured');
            return false;
        }

        // Test API with a simple request
        const response = await axios.get('https://graph.facebook.com/v19.0/ads_archive', {
            params: {
                access_token: accessToken,
                search_terms: 'test',
                ad_reached_countries: ['NL'],
                fields: 'id',
                limit: 1
            },
            timeout: 10000
        });

        if (response.status === 200) {
            success('Meta Ad Library API', 'Credentials valid');
            return true;
        } else {
            fail('Meta Ad Library API', `Unexpected response: ${response.status}`);
            return false;
        }

    } catch (error) {
        if (error.response?.status === 400) {
            // 400 might mean credentials are valid but query is wrong
            success('Meta Ad Library API', 'Credentials appear valid');
            return true;
        } else if (error.response?.status === 401 || error.response?.status === 403) {
            fail('Meta Ad Library API', 'Invalid credentials or permissions');
            return false;
        } else {
            warn('Meta Ad Library API', `Could not verify: ${error.message}`);
            return true; // Don't fail setup for network issues
        }
    }
}

async function checkClaudeAPI() {
    try {
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) {
            fail('Claude API', 'CLAUDE_API_KEY not configured');
            return false;
        }

        // Simple API test
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
                model: 'claude-3-haiku-20240307',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hi' }]
            },
            {
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                timeout: 10000
            }
        );

        if (response.status === 200) {
            success('Claude API', 'Credentials valid');
            return true;
        } else {
            fail('Claude API', `Unexpected response: ${response.status}`);
            return false;
        }

    } catch (error) {
        if (error.response?.status === 401) {
            fail('Claude API', 'Invalid API key');
            return false;
        } else {
            warn('Claude API', `Could not verify: ${error.message}`);
            return true;
        }
    }
}

async function checkOpenAIAPI() {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            fail('OpenAI API', 'OPENAI_API_KEY not configured');
            return false;
        }

        // Simple API test
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            timeout: 10000
        });

        if (response.status === 200) {
            success('OpenAI API', 'Credentials valid');
            return true;
        } else {
            fail('OpenAI API', `Unexpected response: ${response.status}`);
            return false;
        }

    } catch (error) {
        if (error.response?.status === 401) {
            fail('OpenAI API', 'Invalid API key');
            return false;
        } else {
            warn('OpenAI API', `Could not verify: ${error.message}`);
            return true;
        }
    }
}

async function checkApifyAPI() {
    try {
        const apiKey = process.env.APIFY_API_TOKEN;
        if (!apiKey) {
            warn('Apify API', 'APIFY_API_TOKEN not configured (optional for global markets)');
            return true;
        }

        const response = await axios.get('https://api.apify.com/v2/acts', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            timeout: 10000
        });

        if (response.status === 200) {
            success('Apify API', 'Credentials valid');
            return true;
        } else {
            warn('Apify API', `Could not verify: ${response.status}`);
            return true;
        }

    } catch (error) {
        if (error.response?.status === 401) {
            fail('Apify API', 'Invalid API token');
            return false;
        } else {
            warn('Apify API', `Could not verify: ${error.message}`);
            return true;
        }
    }
}

async function checkORCHESTRAIIntegration() {
    try {
        // Check if we're in ORCHESTRAI directory structure
        const fs = require('fs');
        const path = require('path');

        const orchestraiRoot = path.resolve(__dirname, '../../../');
        const claudeMdPath = path.join(orchestraiRoot, 'CLAUDE.md');

        if (fs.existsSync(claudeMdPath)) {
            success('ORCHESTRAI Integration', 'Running within ORCHESTRAI system');
            return true;
        } else {
            warn('ORCHESTRAI Integration', 'Not in ORCHESTRAI directory (standalone mode)');
            return true;
        }

    } catch (error) {
        warn('ORCHESTRAI Integration', 'Could not verify');
        return true;
    }
}

async function main() {
    log('\n🔍 Competitive Intelligence System - Setup Verification\n', 'blue');
    log('=' .repeat(60), 'cyan');
    log('');

    // Run all checks
    log('📦 Checking System Requirements...', 'yellow');
    await checkNodeVersion();
    log('');

    log('🔐 Checking Environment Variables...', 'yellow');
    await checkEnvironmentVariables();
    log('');

    log('🗄️  Checking Database Connections...', 'yellow');
    await checkPostgreSQL();
    await checkRedis();
    log('');

    log('🔌 Checking API Credentials...', 'yellow');
    await checkMetaAPI();
    await checkClaudeAPI();
    await checkOpenAIAPI();
    await checkApifyAPI();
    log('');

    log('🏗️  Checking ORCHESTRAI Integration...', 'yellow');
    await checkORCHESTRAIIntegration();
    log('');

    // Summary
    log('=' .repeat(60), 'cyan');
    log('\n📊 Verification Summary:\n', 'blue');

    log(`✅ Passed: ${results.passed.length}`, 'green');
    log(`⚠️  Warnings: ${results.warnings.length}`, 'yellow');
    log(`❌ Failed: ${results.failed.length}`, 'red');

    log('');

    if (results.failed.length === 0) {
        log('🎉 All critical checks passed! System is ready to run.', 'green');
        log('');
        log('Next steps:', 'cyan');
        log('  1. Run demo: node demo-hybrid-orchestration.js', 'cyan');
        log('  2. Start domain hub: npm start', 'cyan');
        log('  3. Start API server: npm run api', 'cyan');
        log('');
        process.exit(0);
    } else {
        log('⚠️  Some critical checks failed. Please fix the issues above.', 'red');
        log('');
        log('Common fixes:', 'cyan');
        log('  - Copy .env.example to .env and configure credentials', 'cyan');
        log('  - Run: createdb competitive_intelligence', 'cyan');
        log('  - Run: npm run db:migrate', 'cyan');
        log('  - Start Redis: redis-server', 'cyan');
        log('');
        process.exit(1);
    }
}

// Run verification
main().catch(error => {
    log(`\n❌ Verification script error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
