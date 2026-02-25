import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import GBPDatabaseManager from './database/db-manager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001
const db = new GBPDatabaseManager()

// Middleware
app.use(cors())
app.use(express.json())

// Helper function to map database fields to API fields
function mapPostToAPI(post) {
  if (!post) return null

  // Handle tags - might be JSON string, array, or plain string
  let tags = []
  if (post.tags) {
    try {
      tags = JSON.parse(post.tags)
      if (!Array.isArray(tags)) {
        tags = [post.tags]
      }
    } catch {
      // If not valid JSON, treat as plain string
      tags = [post.tags]
    }
  }

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    type: post.post_type, // Map post_type to type
    status: post.status,
    language: post.language,
    category: post.category,
    tags: tags,
    scheduled_at: post.scheduled_date, // Map scheduled_date to scheduled_at
    ai_detection_score: post.ai_detection_risk,
    publish_error: post.publish_error,
    ghl_post_id: post.ghl_post_id,
    exported_at: post.exported_at,
    apply_watermark: post.apply_watermark === 1,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at
  }
}

// API Routes

// GET /api/posts - Fetch posts with filters
app.get('/api/posts', async (req, res) => {
  try {
    const { status, type, language, search } = req.query
    const filters = {}

    if (status && status !== 'all') filters.status = status
    if (type && type !== 'all') filters.post_type = type // Map type -> post_type for DB
    if (language && language !== 'all') filters.language = language
    if (search) filters.search = search

    const posts = await db.getPosts(filters)
    const mappedPosts = posts.map(mapPostToAPI)
    res.json(mappedPosts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

// GET /api/posts/:id - Fetch single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await db.getPost(req.params.id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.json(mapPostToAPI(post))
  } catch (error) {
    console.error('Error fetching post:', error)
    res.status(500).json({ error: 'Failed to fetch post' })
  }
})

// PUT /api/posts/:id - Update post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, content, type, category, tags, language, scheduled_at, apply_watermark } = req.body

    // Map API fields to database fields
    const updates = {}
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (type !== undefined) updates.post_type = type // Map type -> post_type
    if (category !== undefined) updates.category = category
    if (tags !== undefined) updates.tags = tags
    if (language !== undefined) updates.language = language
    if (scheduled_at !== undefined) updates.scheduled_date = scheduled_at // Map scheduled_at -> scheduled_date
    if (apply_watermark !== undefined) updates.apply_watermark = apply_watermark ? 1 : 0

    await db.updatePost(req.params.id, updates)

    const updatedPost = await db.getPost(req.params.id)
    res.json(mapPostToAPI(updatedPost))
  } catch (error) {
    console.error('Error updating post:', error)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

// POST /api/posts/:id/approve - Approve post
app.post('/api/posts/:id/approve', async (req, res) => {
  try {
    await db.updatePost(req.params.id, { status: 'approved' })
    const post = await db.getPost(req.params.id)
    res.json(mapPostToAPI(post))
  } catch (error) {
    console.error('Error approving post:', error)
    res.status(500).json({ error: 'Failed to approve post' })
  }
})

// POST /api/posts/:id/reject - Reject post
app.post('/api/posts/:id/reject', async (req, res) => {
  try {
    await db.updatePost(req.params.id, { status: 'rejected' })
    const post = await db.getPost(req.params.id)
    res.json(mapPostToAPI(post))
  } catch (error) {
    console.error('Error rejecting post:', error)
    res.status(500).json({ error: 'Failed to reject post' })
  }
})

// POST /api/posts/bulk-approve - Bulk approve posts
app.post('/api/posts/bulk-approve', async (req, res) => {
  try {
    const { postIds } = req.body

    if (!Array.isArray(postIds)) {
      return res.status(400).json({ error: 'postIds must be an array' })
    }

    const results = []
    for (const postId of postIds) {
      await db.updatePost(postId, { status: 'approved' })
      const post = await db.getPost(postId)
      results.push(mapPostToAPI(post))
    }

    res.json({ success: true, posts: results })
  } catch (error) {
    console.error('Error bulk approving posts:', error)
    res.status(500).json({ error: 'Failed to bulk approve posts' })
  }
})

// GET /api/stats - Get post statistics
app.get('/api/stats', async (req, res) => {
  try {
    const allPosts = await db.getPosts({})

    const stats = {
      draft: allPosts.filter(p => p.status === 'draft').length,
      approved: allPosts.filter(p => p.status === 'approved').length,
      published: allPosts.filter(p => p.status === 'published').length,
      failed: allPosts.filter(p => p.status === 'failed').length,
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Helper function to strip markdown for GHL export
function stripMarkdownForExport(text) {
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

// POST /api/export-csv - Export posts to GHL-compatible CSV
app.post('/api/export-csv', async (req, res) => {
  try {
    // Get approved posts only for GHL export
    const posts = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM posts WHERE status = 'approved' ORDER BY scheduled_date ASC`
      db.db.all(sql, [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })

    if (posts.length === 0) {
      return res.status(404).json({ error: 'No approved posts to export. Approve posts first.' })
    }

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
      const content = stripMarkdownForExport(post.content)
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

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Mark posts as exported
    const postIds = posts.map(p => p.id)
    const exportedAt = new Date().toISOString()
    for (const id of postIds) {
      await db.updatePost(id, { exported_at: exportedAt })
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="ghl-import-${new Date().toISOString().split('T')[0]}.csv"`)
    res.send(csvContent)
  } catch (error) {
    console.error('Error exporting CSV:', error)
    res.status(500).json({ error: 'Failed to export CSV' })
  }
})

// POST /api/export-csv-advanced - Export posts to GHL-compatible CSV (Advanced Format)
app.post('/api/export-csv-advanced', async (req, res) => {
  try {
    // Get approved posts only for GHL export
    const posts = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM posts WHERE status = 'approved' ORDER BY scheduled_date ASC`
      db.db.all(sql, [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })

    if (posts.length === 0) {
      return res.status(404).json({ error: 'No approved posts to export. Approve posts first.' })
    }

    // GHL Advanced CSV format - Full 39 columns
    // Row 1: Platform names
    const platformRow = [
      'All Social','All Social','All Social','All Social','All Social','All Social','All Social','All Social','All Social','All Social','All Social',
      'Facebook','Instagram','LinkedIn','LinkedIn',
      'Google (GBP)','Google (GBP)','Google (GBP)','Google (GBP)','Google (GBP)','Google (GBP)','Google (GBP)','Google (GBP)','Google (GBP)','Google (GBP)',
      'YouTube','YouTube','YouTube',
      'TikTok','TikTok','TikTok','TikTok','TikTok','TikTok','TikTok',
      'Community','Community','Pinterest','Pinterest'
    ]

    // Row 2: Column headers with descriptions
    const headerRow = [
      'postAtSpecificTime (YYYY-MM-DD HH:mm:ss)',
      'content',
      'OGmetaUrl (url)',
      'imageUrls (comma-separated)',
      'gifUrl',
      'videoUrls (comma-separated)',
      'mediaOptimization (true/false)',
      'applyWatermark (true/false)',
      'tags (comma-separated)',
      'category',
      'followUpComment',
      'type (post/story/reel)',
      'type (post/story/reel)',
      'pdfTitle',
      'postAsPdf (true/false)',
      'eventType (call_to_action/event/offer)',
      'actionType (none/order/book/shop/learn_more/call/sign_up)',
      'title',
      'offerTitle',
      'startDate (YYYY-MM-DD HH:mm:ss)',
      'endDate (YYYY-MM-DD HH:mm:ss)',
      'termsConditions',
      'couponCode',
      'redeemOnlineUrl',
      'actionUrl',
      'title',
      'privacyLevel (private/public/unlisted)',
      'type (video/short)',
      'privacyLevel (everyone/friends/only_me)',
      'promoteOtherBrand (true/false)',
      'enableComment (true/false)',
      'enableDuet (true/false)',
      'enableStitch (true/false)',
      'videoDisclosure (true/false)',
      'promoteYourBrand (true/false)',
      'title',
      'notifyAllGroupMembers (true/false)',
      'title',
      'link'
    ]

    // Map post_type to GBP eventType
    const mapEventType = (postType) => {
      const mapping = {
        'whats_new': 'call_to_action',
        'event': 'event',
        'offer': 'offer',
        'product': 'call_to_action'
      }
      return mapping[postType] || 'call_to_action'
    }

    // Map cta_type to GBP actionType
    const mapActionType = (ctaType) => {
      if (!ctaType) return 'none'
      const mapping = {
        'CALL': 'call',
        'BOOK': 'book',
        'ORDER': 'order',
        'SHOP': 'shop',
        'LEARN_MORE': 'learn_more',
        'SIGN_UP': 'sign_up'
      }
      return mapping[ctaType] || 'none'
    }

    // Data rows
    const dataRows = posts.map(post => {
      // Parse schedule date
      const dateTime = post.scheduled_date ? new Date(post.scheduled_date) : new Date()
      const year = dateTime.getFullYear()
      const month = String(dateTime.getMonth() + 1).padStart(2, '0')
      const day = String(dateTime.getDate()).padStart(2, '0')
      const hours = String(dateTime.getHours()).padStart(2, '0')
      const minutes = String(dateTime.getMinutes()).padStart(2, '0')
      const seconds = String(dateTime.getSeconds()).padStart(2, '0')
      const postAtSpecificTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

      // Clean content
      const content = stripMarkdownForExport(post.content)
        .replace(/"/g, '""')
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

      // Parse image URLs
      let imageUrls = ''
      if (post.image_urls) {
        try {
          const urlArray = JSON.parse(post.image_urls)
          imageUrls = Array.isArray(urlArray) ? urlArray.join(', ') : post.image_urls
        } catch {
          imageUrls = post.image_urls
        }
      }

      // Format dates for event/offer
      const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
      }

      return [
        postAtSpecificTime,                           // 1: postAtSpecificTime
        content,                                      // 2: content
        'https://nasmehpg.si',                       // 3: OGmetaUrl
        imageUrls,                                    // 4: imageUrls
        '',                                           // 5: gifUrl
        '',                                           // 6: videoUrls
        'FALSE',                                      // 7: mediaOptimization
        post.apply_watermark ? 'TRUE' : 'FALSE',     // 8: applyWatermark (from database)
        tags,                                         // 9: tags
        post.category || '',                          // 10: category
        '',                                           // 11: followUpComment (default empty)
        '',                                           // 12: Facebook type
        '',                                           // 13: Instagram type
        '',                                           // 14: LinkedIn pdfTitle
        '',                                           // 15: LinkedIn postAsPdf
        mapEventType(post.post_type),                // 16: GBP eventType
        mapActionType(post.cta_type),                // 17: GBP actionType
        post.event_title || post.title || '',        // 18: GBP title
        post.offer_title || '',                       // 19: GBP offerTitle
        formatDate(post.event_start_date || post.offer_start_date), // 20: GBP startDate
        formatDate(post.event_end_date || post.offer_end_date),     // 21: GBP endDate
        post.terms_conditions || '',                  // 22: GBP termsConditions
        post.coupon_code || '',                       // 23: GBP couponCode
        post.cta_url || '',                          // 24: GBP redeemOnlineUrl (using cta_url as default)
        post.cta_url || '',                          // 25: GBP actionUrl
        '',                                           // 26: YouTube title
        '',                                           // 27: YouTube privacyLevel
        '',                                           // 28: YouTube type
        '',                                           // 29: TikTok privacyLevel
        '',                                           // 30: TikTok promoteOtherBrand
        '',                                           // 31: TikTok enableComment
        '',                                           // 32: TikTok enableDuet
        '',                                           // 33: TikTok enableStitch
        '',                                           // 34: TikTok videoDisclosure
        '',                                           // 35: TikTok promoteYourBrand
        '',                                           // 36: Community title
        '',                                           // 37: Community notifyAllGroupMembers
        '',                                           // 38: Pinterest title
        ''                                            // 39: Pinterest link
      ]
    })

    // Create CSV content with platform row, header row, and data rows
    const csvContent = [
      platformRow.join(','),
      headerRow.join(','),
      ...dataRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="ghl-advanced-import-${new Date().toISOString().split('T')[0]}.csv"`)
    res.send(csvContent)
  } catch (error) {
    console.error('Error exporting advanced CSV:', error)
    res.status(500).json({ error: 'Failed to export advanced CSV' })
  }
})

// POST /api/generate-posts - Generate GBP posts from URL or description
app.post('/api/generate-posts', async (req, res) => {
  try {
    const { method, input, language, count } = req.body

    if (!method || !input) {
      return res.status(400).json({ error: 'Method and input are required' })
    }

    if (method !== 'url' && method !== 'description') {
      return res.status(400).json({ error: 'Method must be "url" or "description"' })
    }

    // Import the generation function
    const { default: generateGBPPosts } = await import('./scripts/generate-gbp-posts.js')

    // Generate posts
    const posts = await generateGBPPosts(
      method,
      input,
      language || 'SL',
      count || 3
    )

    res.json({ success: true, posts })
  } catch (error) {
    console.error('Error generating posts:', error)
    res.status(500).json({ error: 'Failed to generate posts', details: error.message })
  }
})

// POST /api/posts/bulk-create - Create multiple posts at once (from generation)
app.post('/api/posts/bulk-create', async (req, res) => {
  try {
    const { posts } = req.body

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ error: 'Posts array is required' })
    }

    const createdIds = []

    for (const post of posts) {
      // Remove temporary ID and selected flag
      const { id, selected, ...postData } = post

      // Create post with draft status
      const newPost = await db.createPost({
        ...postData,
        status: 'draft'
      })

      createdIds.push(newPost.id)
    }

    res.json({
      success: true,
      message: `${createdIds.length} posts created as drafts`,
      ids: createdIds
    })
  } catch (error) {
    console.error('Error creating posts:', error)
    res.status(500).json({ error: 'Failed to create posts', details: error.message })
  }
})

// GET /api/ai-status - Check Anthropic API availability
app.get('/api/ai-status', async (req, res) => {
  try {
    const { checkAnthropicAPI } = await import('./services/anthropic-gbp-generator.js')
    const status = await checkAnthropicAPI()
    res.json(status)
  } catch (error) {
    res.json({
      available: false,
      error: error.message
    })
  }
})

// GET /api/test-ai-direct - Test direct API call from Express
app.get('/api/test-ai-direct', async (req, res) => {
  try {
    console.log('Testing direct API call from Express endpoint...')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: 'Say hello'
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return res.json({ success: false, error: error.error?.message || response.statusText })
    }

    const data = await response.json()
    res.json({ success: true, response: data.content[0].text })
  } catch (error) {
    console.error('Direct API test failed:', error)
    res.json({ success: false, error: error.message, cause: error.cause?.message })
  }
})

// GET /api/test-service - Test generateGBPPostsWithAI function
app.get('/api/test-service', async (req, res) => {
  try {
    console.log('Testing generateGBPPostsWithAI function...')
    const { generateGBPPostsWithAI } = await import('./services/anthropic-gbp-generator.js')
    const posts = await generateGBPPostsWithAI(
      'description',
      'Professional dental cleaning',
      'EN',
      1,
      {}
    )
    res.json({ success: true, posts })
  } catch (error) {
    console.error('Service test failed:', error)
    res.json({ success: false, error: error.message, stack: error.stack })
  }
})

// GET /api/test-simple-prompt - Test with minimal prompt
app.get('/api/test-simple-prompt', async (req, res) => {
  try {
    console.log('Testing with minimal prompt...')
    const prompt = `Create 1 GBP post about dental hygiene. Return JSON: {"posts":[{"title":"...","content":"...","post_type":"whats_new"}]}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return res.json({ success: false, error: error.error?.message || response.statusText })
    }

    const data = await response.json()
    res.json({ success: true, response: data.content[0].text.substring(0, 200) })
  } catch (error) {
    console.error('Simple prompt test failed:', error)
    res.json({ success: false, error: error.message, cause: error.cause?.message })
  }
})

// GET /api/test-full-generation - Test complete generation logic inline
app.get('/api/test-full-generation', async (req, res) => {
  try {
    const input = 'Professional dental cleaning'
    const language = 'EN'
    const count = 2
    const businessName = 'the business'
    const location = 'infer location'

    // Build prompt inline (same structure as service)
    const parts = [
      'Expert GBP content creator. Topic: ' + input + ' | Language: ' + language + ' | Business: ' + businessName + ' | Location: ' + location,
      '',
      'RULES:',
      '1. Character counts: whats_new(400), offer(320), product(400), event(500) - stay within +/-50',
      '2. Local SEO: City/location in first 100 chars',
      '3. Specifics: Use numbers, percentages, timeframes - NO generic fluff',
      '4. Style: Natural, short sentences, active voice',
      '5. BANNED: delve, leverage, cutting-edge, seamless, revolutionize, unlock, elevate, innovative',
      '6. CTA: End with "Call now", "Book today", "Visit us", etc.',
      '7. AI risk target: below 25%',
      '',
      'GOOD: "Spring AC tune-up for Denver! 22-point inspection, refrigerant check, coil cleaning. Normally $149, now $99 through April 30. Book online!"',
      'BAD: "Exciting update! Leverage our cutting-edge HVAC services to revolutionize your comfort!"',
      '',
      'Return ONLY JSON:',
      '{',
      '  "posts": [{',
      '    "title": "5-8 word title",',
      '    "content": "Local context + specific details + numbers + CTA",',
      '    "post_type": "whats_new|offer|product|event",',
      '    "language": "' + language + '",',
      '    "character_count": 397,',
      '    "ai_detection_risk": 18,',
      '    "quality_gate_passed": true,',
      '    "local_keywords": ["kw1","kw2"]',
      '  }]',
      '}',
      '',
      'Generate ' + count + ' diverse posts. JSON only.'
    ]
    const prompt = parts.join('\n')

    console.log(`Testing inline generation (${prompt.length} chars)...`)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return res.json({ success: false, error: error.error?.message || response.statusText })
    }

    const data = await response.json()
    console.log('Success! Response length:', data.content[0].text.length)
    res.json({ success: true, prompt_length: prompt.length, response: data.content[0].text })
  } catch (error) {
    console.error('Inline generation test failed:', error)
    res.json({ success: false, error: error.message, cause: error.cause?.message })
  }
})

// POST /api/posts/:id/reset-export - Reset export status
app.post('/api/posts/:id/reset-export', async (req, res) => {
  try {
    await db.updatePost(req.params.id, { exported_at: null })
    const post = await db.getPost(req.params.id)
    res.json(mapPostToAPI(post))
  } catch (error) {
    console.error('Error resetting export status:', error)
    res.status(500).json({ error: 'Failed to reset export status' })
  }
})

// POST /api/publish - Trigger publish script for approved posts
app.post('/api/publish', async (req, res) => {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    // Run publish script
    const { stdout, stderr } = await execAsync('node scripts/publish-to-ghl.js', {
      cwd: path.join(__dirname)
    })

    res.json({
      success: true,
      message: 'Publish script executed',
      output: stdout
    })
  } catch (error) {
    console.error('Error running publish script:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      output: error.stdout || error.stderr
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    await db.initialize()

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✨ GBP Automation API Server running on http://localhost:${PORT}`)
      console.log(`📊 Database: ${db.dbPath}`)
      console.log(`\n🔗 API Endpoints:`)
      console.log(`   GET    /api/posts          - List posts with filters`)
      console.log(`   GET    /api/posts/:id      - Get single post`)
      console.log(`   PUT    /api/posts/:id      - Update post`)
      console.log(`   POST   /api/posts/:id/approve - Approve post`)
      console.log(`   POST   /api/posts/:id/reject  - Reject post`)
      console.log(`   POST   /api/posts/bulk-approve - Bulk approve`)
      console.log(`   POST   /api/publish        - Publish approved posts to GHL`)
      console.log(`   GET    /api/stats          - Get statistics`)
      console.log(`   POST   /api/export-csv     - Export Basic CSV (6 columns)`)
      console.log(`   POST   /api/export-csv-advanced - Export Advanced CSV (39 columns)\n`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  }
}

// Start the server
startServer()

export default app
