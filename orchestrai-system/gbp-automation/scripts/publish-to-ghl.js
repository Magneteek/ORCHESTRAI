#!/usr/bin/env node
/**
 * Publish approved GBP posts to GoHighLevel
 * Usage: npm run publish
 */

import GBPDatabaseManager from '../database/db-manager.js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Strip markdown formatting for GBP
function stripMarkdown(text) {
  if (!text) return ''

  return text
    // Remove bold/italic
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')

    // Remove headers
    .replace(/^#+\s+/gm, '')

    // Remove bullet points but keep structure
    .replace(/^[•\-\*]\s+/gm, '• ')

    // Remove links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')

    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Get GHL credentials from .env
function getGHLCredentials() {
  const envPath = path.join(__dirname, '../.env')

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!')
    console.log('\nCreate .env file with:')
    console.log('GHL_ACCESS_TOKEN=your_token')
    console.log('GHL_LOCATION_ID=your_location_id\n')
    return null
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}

  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=')
    if (key && values.length > 0) {
      env[key.trim()] = values.join('=').trim()
    }
  })

  if (!env.GHL_ACCESS_TOKEN || !env.GHL_LOCATION_ID) {
    console.error('❌ Missing GHL credentials in .env')
    console.log('Required: GHL_ACCESS_TOKEN, GHL_LOCATION_ID\n')
    return null
  }

  return {
    accessToken: env.GHL_ACCESS_TOKEN,
    locationId: env.GHL_LOCATION_ID
  }
}

// Publish post to GoHighLevel
async function publishToGHL(post, credentials) {
  // Strip markdown from content
  const cleanContent = stripMarkdown(post.content)

  // Convert scheduled_date to Unix timestamp if present
  let scheduledTimestamp = null
  if (post.scheduled_date) {
    const scheduledDate = new Date(post.scheduled_date)
    scheduledTimestamp = Math.floor(scheduledDate.getTime() / 1000) // Unix timestamp in seconds
  }

  // Prepare GHL post data
  const postData = {
    locationId: credentials.locationId,
    title: post.title,
    content: cleanContent,
    postType: post.post_type || 'whats_new',
    language: post.language || 'en',
    ...(scheduledTimestamp && { scheduledAt: scheduledTimestamp })
  }

  // GHL Social Planner API endpoint
  const ghlApiUrl = `https://services.leadconnectorhq.com/social-media-posting/${credentials.locationId}/posts`

  try {
    const response = await axios.post(ghlApiUrl, postData, {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    })

    return {
      success: true,
      ghlPostId: response.data.id || response.data.postId,
      message: scheduledTimestamp ? 'Scheduled successfully' : 'Published successfully',
      isScheduled: !!scheduledTimestamp
    }
  } catch (error) {
    // Format error message properly
    let errorMessage = error.message

    if (error.response?.data) {
      // GHL API error response
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message
      } else {
        errorMessage = JSON.stringify(error.response.data)
      }
    }

    return {
      success: false,
      error: `GHL API Error: ${errorMessage} (Status: ${error.response?.status || 'N/A'})`
    }
  }
}

// Main publish workflow
async function publishApprovedPosts() {
  console.log('🚀 Publishing approved posts to GoHighLevel\n')

  const db = new GBPDatabaseManager()

  try {
    // Initialize database
    await db.initialize()

    // Get GHL credentials
    const credentials = getGHLCredentials()
    if (!credentials) {
      process.exit(1)
    }

    console.log('✅ GHL credentials loaded')
    console.log(`   Location ID: ${credentials.locationId}\n`)

    // Get approved posts
    const posts = await new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM posts
        WHERE status = 'approved'
        ORDER BY scheduled_date ASC
      `
      db.db.all(sql, [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })

    if (posts.length === 0) {
      console.log('ℹ️  No approved posts found')
      console.log('   Approve posts in the dashboard first!\n')
      process.exit(0)
    }

    console.log(`📋 Found ${posts.length} approved posts\n`)

    let published = 0
    let failed = 0

    for (const post of posts) {
      console.log(`📤 Publishing: "${post.title}"`)
      console.log(`   ID: ${post.post_id}`)
      console.log(`   Type: ${post.post_type}`)
      console.log(`   Language: ${post.language}`)

      const result = await publishToGHL(post, credentials)

      if (result.success) {
        // Update post status: 'scheduled' if has schedule date, 'published' if immediate
        const newStatus = result.isScheduled ? 'scheduled' : 'published'

        await new Promise((resolve, reject) => {
          const sql = `
            UPDATE posts
            SET status = ?,
                ghl_post_id = ?,
                published_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `
          db.db.run(sql, [newStatus, result.ghlPostId, post.id], (err) => {
            if (err) reject(err)
            else resolve()
          })
        })

        console.log(`   ✅ ${result.message}`)
        console.log(`   GHL Post ID: ${result.ghlPostId}`)
        if (result.isScheduled) {
          console.log(`   📅 Scheduled for: ${post.scheduled_date}`)
        }
        console.log()
        published++
      } else {
        // Update post status to failed
        await new Promise((resolve, reject) => {
          const sql = `
            UPDATE posts
            SET status = 'failed',
                publish_error = ?
            WHERE id = ?
          `
          db.db.run(sql, [result.error, post.id], (err) => {
            if (err) reject(err)
            else resolve()
          })
        })

        console.log(`   ❌ Failed: ${result.error}\n`)
        failed++
      }
    }

    console.log('✨ Publishing complete!')
    console.log(`   Sent to GHL: ${published}`)
    console.log(`   Failed: ${failed}`)
    console.log('\n🎯 Next steps:')
    console.log('   1. Check GHL Social Planner:')
    console.log('      - Immediate posts will be published now')
    console.log('      - Scheduled posts will appear in calendar')
    console.log('   2. Review failed posts in dashboard')
    console.log('   3. Retry failed posts after fixing issues\n')

    process.exit(0)

  } catch (error) {
    console.error('❌ Publishing failed:', error.message)
    process.exit(1)
  }
}

// Run the workflow
publishApprovedPosts()
