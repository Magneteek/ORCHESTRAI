#!/usr/bin/env node
/**
 * Initialize GBP Automation Database
 * Creates SQLite database and tables
 */

import GBPDatabaseManager from '../database/db-manager.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function initDatabase() {
  console.log('🗄️  Initializing GBP Automation Database...\n');

  try {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/gbp-posts.db');

    const db = new GBPDatabaseManager(dbPath);
    await db.initialize();

    console.log('\n✅ Database initialized successfully!');
    console.log(`📁 Database location: ${dbPath}`);

    // Get initial stats
    const stats = await db.getStats();
    console.log('\n📊 Database Statistics:');
    console.log(`   Total posts: ${stats.total_posts}`);
    console.log(`   Total campaigns: ${stats.total_campaigns}`);

    await db.close();

    console.log('\n🎉 Setup complete! You can now:');
    console.log('   1. Generate posts: npm run generate');
    console.log('   2. Start review UI: npm run server');
    console.log('   3. Publish posts: npm run publish\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

// Run initialization
initDatabase()
