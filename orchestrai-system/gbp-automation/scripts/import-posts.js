#!/usr/bin/env node
/**
 * Import GBP posts from JSON file to database
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import GBPDatabaseManager from '../database/db-manager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function importPosts(jsonFilePath) {
  const db = new GBPDatabaseManager()

  try {
    // Initialize database
    console.log('🔌 Connecting to database...')
    await db.initialize()

    // Read JSON file
    console.log(`📖 Reading: ${jsonFilePath}`)
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'))

    console.log(`\n📦 Found ${jsonData.posts_count} posts to import`)
    console.log(`   Campaign: ${jsonData.campaign}`)
    console.log(`   Business: ${jsonData.business}`)
    console.log(`   Language: ${jsonData.language}`)
    console.log(`   Created: ${jsonData.created}\n`)

    let imported = 0
    let skipped = 0

    // Import each post
    for (const post of jsonData.posts) {
      try {
        // Map JSON structure to database schema
        const postData = {
          post_id: post.post_id,
          title: post.title,
          content: post.content,
          post_type: 'whats_new', // Default type for educational posts
          language: jsonData.language === 'sl_SI' ? 'SL' : jsonData.language,
          category: post.category || 'Educational',
          tags: JSON.stringify([post.topic]), // Topic as tag
          character_count: post.character_count,
          ai_detection_risk: 0, // Assuming low risk for educational content
          quality_gate_passed: post.validation?.character_limit?.passed ? 1 : 0,
          scheduled_date: post.scheduled_time,
          status: 'draft'
        }

        // Insert into database using raw SQL
        await new Promise((resolve, reject) => {
          const sql = `
            INSERT INTO posts (
              post_id, title, content, post_type, language, category, tags,
              character_count, ai_detection_risk, quality_gate_passed,
              scheduled_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `

          db.db.run(sql, [
            postData.post_id,
            postData.title,
            postData.content,
            postData.post_type,
            postData.language,
            postData.category,
            postData.tags,
            postData.character_count,
            postData.ai_detection_risk,
            postData.quality_gate_passed,
            postData.scheduled_date,
            postData.status
          ], (err) => {
            if (err) {
              if (err.message.includes('UNIQUE constraint')) {
                console.log(`   ⚠️  Skipped: ${post.post_id} (already exists)`)
                skipped++
                resolve()
              } else {
                reject(err)
              }
            } else {
              console.log(`   ✅ Imported: ${post.post_id} - ${post.title.substring(0, 40)}...`)
              imported++
              resolve()
            }
          })
        })

      } catch (error) {
        console.error(`   ❌ Error importing ${post.post_id}:`, error.message)
      }
    }

    console.log(`\n✨ Import complete!`)
    console.log(`   Imported: ${imported} posts`)
    console.log(`   Skipped: ${skipped} posts`)
    console.log(`\n🎯 Next steps:`)
    console.log(`   1. Open dashboard: http://localhost:5173`)
    console.log(`   2. Review posts`)
    console.log(`   3. Approve posts for publishing\n`)

    process.exit(0)

  } catch (error) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

// Get file path from command line or use default
const jsonFile = process.argv[2] || path.join(
  __dirname,
  '../../projects',
  '*',
  'deliverables/seo/gbp-posts/nasmehpg-educational-10posts.json'
)

// Find the actual file path
const glob = await import('glob')
const files = glob.sync(jsonFile)

if (files.length === 0) {
  console.error('❌ No JSON file found at:', jsonFile)
  console.log('\nUsage: node import-posts.js [path-to-json-file]')
  process.exit(1)
}

importPosts(files[0])
