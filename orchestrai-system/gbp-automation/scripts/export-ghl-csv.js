#!/usr/bin/env node
/**
 * Export approved posts to GHL-compatible CSV format
 * Usage: npm run export-ghl
 */

import GBPDatabaseManager from '../database/db-manager.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function stripMarkdown(text) {
  if (!text) return ''

  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^[•\-\*]\s+/gm, '• ')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function exportGHLCSV() {
  console.log('📤 Exporting approved posts to GHL CSV format\n')

  const db = new GBPDatabaseManager()

  try {
    await db.initialize()

    // Get approved posts only
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
      console.log('⚠️  No approved posts found')
      console.log('   Approve posts in the dashboard first!\n')
      process.exit(0)
    }

    console.log(`📋 Found ${posts.length} approved posts\n`)

    // GHL CSV format (Basic Format) - EXACT column names as shown in error
    const headers = [
      'postAtSpecificTime (YYYY-MM-DD HH:mm:ss)',
      'content',
      'link (OGmetaUrl)',
      'imageUrls',
      'gifUrl',
      'videoUrls'
    ]

    const rows = posts.map(post => {
      // Parse schedule date
      const dateTime = post.scheduled_date ? new Date(post.scheduled_date) : new Date()

      // Format: YYYY-MM-DD HH:mm:ss
      const year = dateTime.getFullYear()
      const month = String(dateTime.getMonth() + 1).padStart(2, '0')
      const day = String(dateTime.getDate()).padStart(2, '0')
      const hours = String(dateTime.getHours()).padStart(2, '0')
      const minutes = String(dateTime.getMinutes()).padStart(2, '0')
      const seconds = String(dateTime.getSeconds()).padStart(2, '0')

      const postAtSpecificTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

      // Clean content
      const content = stripMarkdown(post.content)
        .replace(/"/g, '""')
        .replace(/\n/g, ' ')
        .slice(0, 1500)

      // Parse tags
      let tags = ''
      if (post.tags) {
        try {
          const tagArray = JSON.parse(post.tags)
          tags = Array.isArray(tagArray) ? tagArray.join(',') : post.tags
        } catch {
          tags = post.tags
        }
      }

      return [
        postAtSpecificTime,       // postAtSpecificTime (YYYY-MM-DD HH:mm:ss)
        content,                  // text
        'https://nasmehpg.si',   // link (OGmetaUrl)
        '',                       // imageUrls (comma-separated)
        '',                       // gifUrl
        ''                        // videoUrls (comma-separated)
      ]
    })

    // Create CSV content with simple header
    const csvContent = [
      headers.join(','),                                         // Header row
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')) // Data rows
    ].join('\n')

    // Save to file
    const outputPath = path.join(__dirname, '../ghl-import.csv')
    fs.writeFileSync(outputPath, csvContent)

    console.log('✅ GHL CSV created successfully!')
    console.log(`   File: ${outputPath}`)
    console.log(`   Posts: ${posts.length}`)
    console.log('\n📅 Schedule Summary:')

    // Show schedule summary
    const scheduleMap = rows.reduce((acc, row) => {
      const date = row[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    Object.keys(scheduleMap).sort().forEach(date => {
      console.log(`   ${date}: ${scheduleMap[date]} post${scheduleMap[date] !== 1 ? 's' : ''}`)
    })

    console.log('\n🎯 Next Steps:')
    console.log('   1. Go to GHL → Social Planner')
    console.log('   2. Click "Import" or "Bulk Schedule"')
    console.log('   3. Upload: ghl-import.csv')
    console.log('   4. Map columns if needed')
    console.log('   5. Confirm import\n')

  } catch (error) {
    console.error('❌ Export failed:', error.message)
    process.exit(1)
  }
}

exportGHLCSV()
