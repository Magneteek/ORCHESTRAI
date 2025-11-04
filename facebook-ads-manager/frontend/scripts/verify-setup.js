#!/usr/bin/env node

/**
 * Backend Setup Verification Script
 *
 * Verifies that all required files, environment variables, and dependencies
 * are correctly configured for the Facebook Ads Manager backend API.
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - File not found: ${filePath}`, 'red');
    return false;
  }
}

function checkEnvVar(varName, required = true) {
  const value = process.env[varName];

  if (value) {
    log(`✅ ${varName} is set`, 'green');
    return true;
  } else {
    const severity = required ? 'red' : 'yellow';
    const prefix = required ? '❌' : '⚠️';
    log(`${prefix} ${varName} is not set${required ? ' (REQUIRED)' : ' (optional)'}`, severity);
    return !required;
  }
}

async function main() {
  log('\n🔍 Facebook Ads Manager Backend - Setup Verification\n', 'blue');

  // Check required files
  log('📁 Checking required files...', 'blue');
  const files = [
    ['prisma/schema.prisma', 'Prisma schema'],
    ['lib/db/prisma.ts', 'Prisma client singleton'],
    ['lib/db/organizations.ts', 'Organization service'],
    ['lib/db/users.ts', 'User service'],
    ['lib/db/facebook-accounts.ts', 'Facebook account service'],
    ['lib/db/templates.ts', 'Template service'],
    ['lib/auth/config.ts', 'NextAuth configuration'],
    ['lib/auth/session.ts', 'Session helpers'],
    ['lib/utils/encryption.ts', 'Token encryption'],
    ['lib/utils/errors.ts', 'Error classes'],
    ['lib/utils/api-response.ts', 'API response formatters'],
    ['lib/utils/validation.ts', 'Zod schemas'],
    ['middleware.ts', 'Route protection middleware'],
    ['app/api/auth/[...nextauth]/route.ts', 'NextAuth handler'],
    ['app/api/auth/register/route.ts', 'Registration endpoint'],
    ['app/api/organizations/route.ts', 'Organization endpoints'],
    ['app/api/facebook/connect/route.ts', 'Facebook OAuth initiation'],
    ['app/api/facebook/callback/route.ts', 'Facebook OAuth callback'],
    ['app/api/templates/route.ts', 'Template endpoints'],
    ['app/api/ad-accounts/route.ts', 'Ad account endpoints'],
    ['types/api.ts', 'API types'],
    ['types/database.ts', 'Database types'],
    ['types/next-auth.d.ts', 'NextAuth type extensions'],
  ];

  let fileChecksPassed = true;
  for (const [filePath, description] of files) {
    if (!checkFile(filePath, description)) {
      fileChecksPassed = false;
    }
  }

  // Check environment variables
  log('\n🔐 Checking environment variables...', 'blue');

  // Load .env file if it exists
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    log('Found .env file', 'green');
    require('dotenv').config({ path: envPath });
  } else {
    log('⚠️  No .env file found. Using system environment variables.', 'yellow');
  }

  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'ENCRYPTION_SECRET',
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET',
  ];

  const optionalEnvVars = [
    'REDIS_URL',
    'ANTHROPIC_API_KEY',
  ];

  let envChecksPassed = true;
  for (const varName of requiredEnvVars) {
    if (!checkEnvVar(varName, true)) {
      envChecksPassed = false;
    }
  }

  log('\nOptional environment variables:', 'blue');
  for (const varName of optionalEnvVars) {
    checkEnvVar(varName, false);
  }

  // Check encryption secret length
  if (process.env.ENCRYPTION_SECRET) {
    if (process.env.ENCRYPTION_SECRET.length < 32) {
      log('❌ ENCRYPTION_SECRET must be at least 32 characters long', 'red');
      envChecksPassed = false;
    } else {
      log('✅ ENCRYPTION_SECRET length is valid', 'green');
    }
  }

  // Check dependencies
  log('\n📦 Checking dependencies...', 'blue');
  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      'next-auth',
      '@auth/prisma-adapter',
      '@prisma/client',
      'bcryptjs',
      'zod',
    ];

    let depsInstalled = true;
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep]) {
        log(`✅ ${dep} is in dependencies`, 'green');
      } else {
        log(`❌ ${dep} is missing from dependencies`, 'red');
        depsInstalled = false;
      }
    }

    if (depsInstalled) {
      // Check if node_modules exists
      const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        log('✅ node_modules directory exists', 'green');
      } else {
        log('❌ node_modules not found. Run: npm install', 'red');
        depsInstalled = false;
      }
    }
  } else {
    log('❌ package.json not found', 'red');
  }

  // Summary
  log('\n📊 Verification Summary\n', 'blue');

  if (fileChecksPassed && envChecksPassed) {
    log('✅ All checks passed! Your backend is ready.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Run: npm run db:setup', 'reset');
    log('2. Run: npm run dev', 'reset');
    log('3. Test registration: POST http://localhost:3000/api/auth/register', 'reset');
    process.exit(0);
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');

    if (!fileChecksPassed) {
      log('\n🔧 To fix missing files, ensure you copied the schema correctly:', 'yellow');
      log('cp /path/to/schema.prisma prisma/schema.prisma', 'reset');
    }

    if (!envChecksPassed) {
      log('\n🔧 To fix environment variables:', 'yellow');
      log('1. Copy .env.example to .env', 'reset');
      log('2. Generate secrets: openssl rand -base64 32', 'reset');
      log('3. Configure Facebook app credentials', 'reset');
    }

    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Verification failed with error: ${error.message}`, 'red');
  process.exit(1);
});
