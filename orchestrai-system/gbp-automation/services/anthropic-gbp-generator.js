/**
 * Anthropic API-powered GBP Post Generator
 * Uses Claude AI for research-driven, optimized GBP post creation
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

/**
 * Generate optimized GBP posts using Anthropic API
 * @param {string} method - 'url' or 'description'
 * @param {string} input - URL or description text
 * @param {string} language - Language code (EN, SL, NL, etc.)
 * @param {number} count - Number of posts to generate (1-5)
 * @param {Object} businessContext - Optional business details
 * @returns {Promise<Array>} Generated posts with quality metrics
 */
export async function generateGBPPostsWithAI(method, input, language = 'EN', count = 3, businessContext = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set')
  }

  console.log(`🤖 Generating ${count} GBP posts with Claude AI...`)

  // Build comprehensive prompt with research instructions
  const prompt = buildGBPPrompt(method, input, language, count, businessContext)

  try {
    console.log('Sending request to Anthropic API...')
    console.log('Prompt length:', prompt.length)

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION
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
      throw new Error(`API Error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    console.log('Received response from Anthropic API')

    // Extract and parse the response
    const responseText = data.content[0].text
    const posts = parseAIResponse(responseText, language, method)

    console.log(`✅ Generated ${posts.length} AI-powered posts`)
    return posts

  } catch (error) {
    console.error('Anthropic API error:', error)
    console.error('Error details:', JSON.stringify({
      message: error.message,
      status: error.status,
      error: error.error,
      type: error.type
    }, null, 2))
    throw new Error(`AI generation failed: ${error.message}`)
  }
}

/**
 * Build comprehensive prompt for GBP post generation
 */
function buildGBPPrompt(method, input, language, count, businessContext) {
  const { businessName = 'the business', location = '', targetAudience = '' } = businessContext

  // Minimal working prompt - complex prompts cause ECONNRESET
  const parts = [
    'Create ' + count + ' Google Business Profile posts about: ' + input,
    'Language: ' + language,
    'Business: ' + businessName + (location ? ' in ' + location : ''),
    '',
    'Requirements:',
    '- Post types: whats_new(350-450 chars), offer(280-350 chars), product(350-450 chars), event(450-550 chars)',
    '- Include location/city in first 100 characters',
    '- Use specific numbers and data points',
    '- Natural tone, avoid AI phrases (delve, leverage, cutting-edge)',
    '- End with clear CTA (Call, Book, Visit)',
    '',
    'Return ONLY JSON:',
    '{"posts":[{"title":"...","content":"...","post_type":"whats_new|offer|product|event","language":"' + language + '","character_count":400,"ai_detection_risk":20,"quality_gate_passed":true,"local_keywords":["kw1","kw2"]}]}'
  ]

  return parts.join('\n')
}

/**
 * Parse AI response and extract posts
 */
function parseAIResponse(responseText, language, method) {
  // Try to extract JSON from response
  let jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)

  if (!jsonMatch) {
    // Try without code fence
    jsonMatch = responseText.match(/\{[\s\S]*"posts"[\s\S]*\}/)
  }

  if (!jsonMatch) {
    throw new Error('No JSON found in AI response')
  }

  try {
    const data = JSON.parse(jsonMatch[1] || jsonMatch[0])

    if (!data.posts || !Array.isArray(data.posts)) {
      throw new Error('Invalid JSON structure - missing posts array')
    }

    // Map to database format
    return data.posts.map(post => ({
      title: post.title || `Generated ${post.post_type} post`,
      content: post.content,
      post_type: post.post_type || 'whats_new',
      language: post.language || language,
      category: method === 'url' ? 'education' : 'general',
      tags: JSON.stringify([
        'ai-generated',
        post.post_type || 'whats_new',
        language.toLowerCase(),
        ...(post.local_keywords || [])
      ]),
      character_count: post.character_count || post.content.length,
      ai_detection_risk: post.ai_detection_risk || 20,
      quality_gate_passed: post.quality_gate_passed ? 1 : 0
    }))

  } catch (error) {
    console.error('Failed to parse JSON:', error.message)
    console.error('Response text:', responseText)
    throw new Error(`JSON parsing failed: ${error.message}`)
  }
}

/**
 * Health check for Anthropic API
 */
export async function checkAnthropicAPI() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { available: false, error: 'API key not configured' }
  }

  try {
    // Simple test request
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: 'Reply with just "OK"'
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        available: false,
        error: error.error?.message || response.statusText
      }
    }

    const data = await response.json()
    return {
      available: true,
      model: 'claude-3-haiku-20240307',
      response: data.content[0].text
    }
  } catch (error) {
    return {
      available: false,
      error: error.message
    }
  }
}
