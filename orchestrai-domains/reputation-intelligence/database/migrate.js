#!/usr/bin/env node

/**
 * Database Migration Script
 * Automatically sets up the PostgreSQL database schema
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const db = require('./db-client');
const fs = require('fs').promises;
const path = require('path');

class DatabaseMigration {
    constructor() {
        this.steps = [];
        this.errors = [];
    }

    async run() {
        console.log('🚀 Starting Database Migration...\n');

        try {
            // Step 1: Connect to database
            await this.connectDatabase();

            // Step 2: Run schema migration
            await this.runSchemaMigration();

            // Step 3: Verify migration
            await this.verifyMigration();

            // Step 4: Display summary
            this.displaySummary();

        } catch (error) {
            console.error('\n❌ Migration failed:', error.message);
            console.error(error.stack);
            process.exit(1);
        } finally {
            await db.disconnect();
        }
    }

    async connectDatabase() {
        console.log('📋 Step 1: Connecting to database...');

        const config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || '5432',
            database: process.env.DB_NAME || 'reputation_intelligence',
            user: process.env.DB_USER || 'postgres'
        };

        console.log(`   Host: ${config.host}:${config.port}`);
        console.log(`   Database: ${config.database}`);
        console.log(`   User: ${config.user}\n`);

        await db.connect();

        this.steps.push({ step: 'Database connection', status: 'success' });
    }

    async runSchemaMigration() {
        console.log('📋 Step 2: Running schema migration...\n');

        try {
            // Initialize schema (creates tables, views, functions, triggers)
            await db.initializeSchema();

            this.steps.push({ step: 'Schema migration', status: 'success' });

        } catch (error) {
            // If error is "already exists", it's okay (idempotent)
            if (error.message.includes('already exists')) {
                console.log('   ℹ️  Schema already exists, skipping creation');
                this.steps.push({ step: 'Schema migration', status: 'skipped' });
            } else {
                throw error;
            }
        }
    }

    async verifyMigration() {
        console.log('\n📋 Step 3: Verifying migration...\n');

        // Verify tables
        const tablesResult = await db.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        const expectedTables = [
            'businesses',
            'reviews',
            'contact_enrichments',
            'api_cost_tracking',
            'workflow_executions'
        ];

        console.log('   Tables created:');
        const createdTables = tablesResult.rows.map(r => r.table_name);
        expectedTables.forEach(table => {
            const exists = createdTables.includes(table);
            console.log(`   ${exists ? '✅' : '❌'} ${table}`);
            if (!exists) {
                this.errors.push(`Table ${table} not found`);
            }
        });

        // Verify views
        const viewsResult = await db.query(`
            SELECT table_name
            FROM information_schema.views
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        const expectedViews = [
            'businesses_needing_enrichment',
            'enrichment_summary',
            'daily_cost_summary',
            'business_review_stats'
        ];

        console.log('\n   Views created:');
        const createdViews = viewsResult.rows.map(r => r.table_name);
        expectedViews.forEach(view => {
            const exists = createdViews.includes(view);
            console.log(`   ${exists ? '✅' : '❌'} ${view}`);
        });

        // Verify functions
        const functionsResult = await db.query(`
            SELECT routine_name
            FROM information_schema.routines
            WHERE routine_schema = 'public'
              AND routine_type = 'FUNCTION'
            ORDER BY routine_name
        `);

        console.log('\n   Functions created:');
        functionsResult.rows.forEach(row => {
            console.log(`   ✅ ${row.routine_name}`);
        });

        // Verify triggers
        const triggersResult = await db.query(`
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            ORDER BY trigger_name
        `);

        console.log('\n   Triggers created:');
        triggersResult.rows.forEach(row => {
            console.log(`   ✅ ${row.trigger_name} on ${row.event_object_table}`);
        });

        // Get database statistics
        const stats = await db.getStatistics();
        console.log('\n   Database statistics:');
        console.log(`   📊 Total businesses: ${stats.total_businesses}`);
        console.log(`   📊 Total reviews: ${stats.total_reviews}`);
        console.log(`   📊 Total enrichments: ${stats.total_enrichments}`);
        console.log(`   💰 Total API cost: $${parseFloat(stats.total_api_cost).toFixed(4)}`);

        this.steps.push({ step: 'Migration verification', status: 'success' });
    }

    displaySummary() {
        console.log('\n' + '='.repeat(60));
        console.log('Migration Summary');
        console.log('='.repeat(60));

        this.steps.forEach(step => {
            const icon = step.status === 'success' ? '✅' :
                        step.status === 'skipped' ? 'ℹ️' : '❌';
            console.log(`${icon} ${step.step}: ${step.status}`);
        });

        if (this.errors.length > 0) {
            console.log('\n⚠️  Errors encountered:');
            this.errors.forEach(error => console.log(`   - ${error}`));
        }

        console.log('\n' + '='.repeat(60));

        if (this.errors.length === 0) {
            console.log('✅ Migration completed successfully!');
            console.log('\nNext steps:');
            console.log('   1. Test connection: node database/test-connection.js');
            console.log('   2. Run workflow: node test-workflow.js');
            console.log('   3. View data: psql reputation_intelligence');
        } else {
            console.log('⚠️  Migration completed with errors');
            console.log('   Please review errors above and re-run migration');
        }

        console.log('='.repeat(60) + '\n');
    }
}

// Run migration
if (require.main === module) {
    const migration = new DatabaseMigration();
    migration.run()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = DatabaseMigration;
