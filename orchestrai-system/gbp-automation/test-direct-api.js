/**
 * Test Anthropic API with direct fetch (no SDK)
 */
import 'dotenv/config'

async function testDirectFetch() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  console.log('Testing direct fetch to Anthropic API...')
  console.log('API Key starts with:', apiKey?.substring(0, 15) + '...')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: 'Write a short GBP post about dental hygiene in JSON format with title and content fields'
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ API Error:', error)
      return false
    }

    const data = await response.json()
    console.log('✅ Success!')
    console.log('Response:', data.content[0].text.substring(0, 200) + '...')
    return true

  } catch (error) {
    console.error('❌ Fetch failed:', error.message)
    console.error('Error details:', error)
    return false
  }
}

testDirectFetch()
