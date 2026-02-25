/**
 * Test Anthropic API with minimal request
 */
import Anthropic from '@anthropic-ai/sdk'
import 'dotenv/config'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

async function testMinimal() {
  console.log('Testing minimal request...')
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say hello in 5 words'
      }]
    })
    console.log('✅ Success:', message.content[0].text)
    return true
  } catch (error) {
    console.error('❌ Failed:', error.message)
    return false
  }
}

async function testMedium() {
  console.log('\nTesting medium request...')
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: 'Write a 100-word business post about dental hygiene. Return as JSON with this format: {"title": "...", "content": "..."}'
      }]
    })
    console.log('✅ Success:', message.content[0].text.substring(0, 100) + '...')
    return true
  } catch (error) {
    console.error('❌ Failed:', error.message)
    console.error('Error details:', error.cause || error)
    return false
  }
}

async function testFull() {
  console.log('\nTesting full GBP prompt...')
  const prompt = `You are an expert GBP content creator. Create 1 post.

**Topic**: Dental hygiene tips
**Language**: EN
**Posts needed**: 1

Create a JSON response with this format:
{
  "posts": [{
    "title": "Post title",
    "content": "Post content 200-400 characters",
    "post_type": "whats_new",
    "language": "EN"
  }]
}

Return ONLY the JSON.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
    console.log('✅ Success:', message.content[0].text.substring(0, 100) + '...')
    return true
  } catch (error) {
    console.error('❌ Failed:', error.message)
    console.error('Error cause:', error.cause || 'No cause')
    return false
  }
}

// Run tests
(async () => {
  const minimalOk = await testMinimal()
  if (!minimalOk) {
    console.log('\n❌ Minimal test failed - API key or network issue')
    process.exit(1)
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  const mediumOk = await testMedium()
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  const fullOk = await testFull()
  
  console.log('\n=== Results ===')
  console.log('Minimal:', minimalOk ? '✅' : '❌')
  console.log('Medium:', mediumOk ? '✅' : '❌')
  console.log('Full:', fullOk ? '✅' : '❌')
})()
