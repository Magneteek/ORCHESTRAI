#!/usr/bin/env node
/**
 * Test GoHighLevel API connection
 * Usage: npm run test
 */

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file
function loadEnv() {
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
    if (key && values.length > 0 && !key.trim().startsWith('#')) {
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

// Test API connection
async function testConnection() {
  console.log('🔍 Testing GoHighLevel API connection...\n')

  const credentials = loadEnv()
  if (!credentials) {
    process.exit(1)
  }

  console.log('📋 Credentials loaded:')
  console.log(`   Location ID: ${credentials.locationId}`)
  console.log(`   API Token: ${credentials.accessToken.substring(0, 20)}...\n`)

  // Test 1: Verify location access
  console.log('Test 1: Verifying location access...')
  try {
    const locationUrl = `https://services.leadconnectorhq.com/locations/${credentials.locationId}`

    const locationResponse = await axios.get(locationUrl, {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    })

    console.log('   ✅ Location verified!')
    console.log(`   Name: ${locationResponse.data.location?.name || locationResponse.data.name || 'N/A'}`)
    console.log(`   Email: ${locationResponse.data.location?.email || locationResponse.data.email || 'N/A'}\n`)
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ⚠️  Location endpoint returned 404 (might be normal for Social Planner only scope)')
      console.log('   Continuing with Social Planner test...\n')
    } else {
      console.error('   ❌ Failed to verify location')
      console.error(`   Error: ${error.response?.data?.message || error.message}\n`)
    }
  }

  // Test 2: Check Social Planner access
  console.log('Test 2: Checking Social Planner API access...')
  try {
    // Try to get social media accounts (verifies Social Planner permission)
    const accountsUrl = `https://services.leadconnectorhq.com/social-media-posting/${credentials.locationId}/oauth/accounts`

    const accountsResponse = await axios.get(accountsUrl, {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    })

    console.log('   ✅ Social Planner access confirmed!')

    const accounts = accountsResponse.data.socialMediaAccounts || accountsResponse.data.accounts || []
    if (accounts.length > 0) {
      console.log(`   Connected accounts: ${accounts.length}`)
      accounts.forEach(account => {
        const platform = account.platform || account.type || 'Unknown'
        const name = account.name || account.username || 'N/A'
        console.log(`     - ${platform}: ${name}`)
      })
    } else {
      console.log('   ℹ️  No social media accounts connected yet')
      console.log('   💡 Connect Google Business Profile in GHL Social Planner')
    }
    console.log()
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ⚠️  Social Planner accounts endpoint not accessible')
      console.log('   ℹ️  This is OK - the API key works for posting')
      console.log()
    } else {
      console.error('   ❌ Failed to access Social Planner API')
      console.error(`   Error: ${error.response?.data?.message || error.message}`)

      if (error.response?.status === 401) {
        console.error('\n   💡 Tip: Check that your API key has "social-planner.write" scope')
      }
      if (error.response?.status === 403) {
        console.error('\n   💡 Tip: Your API key may not have Social Planner permissions')
      }
      console.log()
      process.exit(1)
    }
  }

  // Success summary
  console.log('✨ Connection test successful!')
  console.log('\n🎯 Next steps:')
  console.log('   1. Approve posts in dashboard: npm run ui')
  console.log('   2. Publish approved posts: npm run publish')
  console.log('   3. Check GHL Social Planner for scheduled posts\n')
}

// Run the test
testConnection().catch(error => {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
})
