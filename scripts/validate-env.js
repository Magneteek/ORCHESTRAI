#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates all required environment variables before starting ORCHESTRAI
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Required environment variables by category
const requiredEnvVars = {
  'Core APIs': [
    { name: 'CLAUDE_API_KEY', description: 'Claude AI API key' }
  ],
  'Databases': [
    { name: 'REDIS_URL', description: 'Redis connection URL', optional: false },
    { name: 'DATABASE_URL', description: 'PostgreSQL connection URL', optional: true }
  ],
  'MCP Servers': [
    { name: 'DATAFORSEO_USERNAME', description: 'DataForSEO username' },
    { name: 'DATAFORSEO_PASSWORD', description: 'DataForSEO password' }
  ],
  'Optional Services': [
    { name: 'NOTION_TOKEN', description: 'Notion integration token', optional: true },
    { name: 'OPENAI_API_KEY', description: 'OpenAI API key', optional: true },
    { name: 'REF_API_KEY', description: 'Ref.tools API key', optional: true }
  ]
};

console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}🔍 ORCHESTRAI Environment Variable Validation${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log(`${colors.red}❌ .env file not found!${colors.reset}`);
  console.log(`${colors.yellow}   Create .env from template: cp .env.example .env${colors.reset}\n`);
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

let hasErrors = false;
let hasWarnings = false;
const results = {};

// Validate each category
for (const [category, vars] of Object.entries(requiredEnvVars)) {
  console.log(`${colors.blue}📋 ${category}${colors.reset}`);
  
  for (const { name, description, optional } of vars) {
    const value = process.env[name];
    const isSet = value && value.trim() !== '';
    
    if (isSet) {
      console.log(`   ${colors.green}✅${colors.reset} ${name} - ${description}`);
      results[name] = { status: 'ok', value: value.substring(0, 10) + '...' };
    } else if (optional) {
      console.log(`   ${colors.yellow}⚠️${colors.reset}  ${name} - ${description} (optional, not set)`);
      results[name] = { status: 'warning', value: null };
      hasWarnings = true;
    } else {
      console.log(`   ${colors.red}❌${colors.reset} ${name} - ${description} (REQUIRED, not set)`);
      results[name] = { status: 'error', value: null };
      hasErrors = true;
    }
  }
  console.log('');
}

// System Configuration Check
console.log(`${colors.blue}📋 System Configuration${colors.reset}`);

const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`   ${colors.green}✅${colors.reset} NODE_ENV: ${nodeEnv}`);

const port = process.env.PORT || '5500';
console.log(`   ${colors.green}✅${colors.reset} PORT: ${port}`);

console.log('');

// Final Summary
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}📊 Validation Summary${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

const totalChecks = Object.keys(results).length;
const passed = Object.values(results).filter(r => r.status === 'ok').length;
const warnings = Object.values(results).filter(r => r.status === 'warning').length;
const failed = Object.values(results).filter(r => r.status === 'error').length;

console.log(`Total Checks: ${totalChecks}`);
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
if (warnings > 0) {
  console.log(`${colors.yellow}Warnings: ${warnings}${colors.reset}`);
}
if (failed > 0) {
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
}
console.log('');

if (hasErrors) {
  console.log(`${colors.red}❌ Environment validation FAILED${colors.reset}`);
  console.log(`${colors.yellow}   Please set all required environment variables in .env${colors.reset}\n`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`${colors.yellow}⚠️  Environment validation PASSED with warnings${colors.reset}`);
  console.log(`${colors.yellow}   Some optional services may not be available${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.green}✅ Environment validation PASSED${colors.reset}`);
  console.log(`${colors.green}   All required variables are set${colors.reset}\n`);
  process.exit(0);
}
