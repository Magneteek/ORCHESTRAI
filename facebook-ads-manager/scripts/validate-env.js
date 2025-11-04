#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are set before deployment
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
};

// Required environment variables by category
const requiredVariables = {
  application: [
    'NEXT_PUBLIC_APP_URL',
    'NODE_ENV',
    'PORT',
  ],
  database: [
    'DATABASE_URL',
  ],
  authentication: [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ],
  facebook: [
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET',
    'FACEBOOK_API_VERSION',
    'NEXT_PUBLIC_FACEBOOK_APP_ID',
  ],
  redis: [
    'REDIS_URL',
  ],
  ai: [
    'ANTHROPIC_API_KEY',
  ],
  realtime: [
    'NEXT_PUBLIC_SOCKET_URL',
  ],
};

// Optional but recommended variables
const recommendedVariables = [
  'SENTRY_DSN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
];

// Validation rules
const validationRules = {
  NEXTAUTH_SECRET: {
    minLength: 32,
    description: 'Should be at least 32 characters long',
  },
  DATABASE_URL: {
    pattern: /^postgresql:\/\/.+/,
    description: 'Must be a valid PostgreSQL connection string',
  },
  REDIS_URL: {
    pattern: /^redis:\/\/.+/,
    description: 'Must be a valid Redis connection string',
  },
  NEXT_PUBLIC_APP_URL: {
    pattern: /^https?:\/\/.+/,
    description: 'Must be a valid URL',
  },
  FACEBOOK_API_VERSION: {
    pattern: /^v\d+\.\d+$/,
    description: 'Must be in format v22.0',
  },
};

function loadEnvFile(envPath) {
  try {
    if (!fs.existsSync(envPath)) {
      return null;
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};

    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });

    return env;
  } catch (error) {
    console.error(`${colors.red}Error loading ${envPath}: ${error.message}${colors.reset}`);
    return null;
  }
}

function validateVariable(key, value) {
  const rule = validationRules[key];
  if (!rule) return { valid: true };

  const errors = [];

  if (rule.minLength && value.length < rule.minLength) {
    errors.push(`Minimum length ${rule.minLength}, got ${value.length}`);
  }

  if (rule.pattern && !rule.pattern.test(value)) {
    errors.push(rule.description);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function checkEnvironment(env, environmentName) {
  console.log(`\n${colors.blue}==================================${colors.reset}`);
  console.log(`${colors.blue}Validating ${environmentName} Environment${colors.reset}`);
  console.log(`${colors.blue}==================================${colors.reset}\n`);

  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  console.log(`${colors.yellow}Required Variables:${colors.reset}\n`);

  Object.entries(requiredVariables).forEach(([category, variables]) => {
    console.log(`  ${category.toUpperCase()}:`);

    variables.forEach(variable => {
      const value = env[variable] || process.env[variable];
      const isSet = value && value.length > 0 && !value.includes('your-') && !value.includes('CHANGE_ME');

      if (isSet) {
        const validation = validateVariable(variable, value);

        if (validation.valid) {
          console.log(`    ${colors.green}✓${colors.reset} ${variable}`);
        } else {
          console.log(`    ${colors.red}✗${colors.reset} ${variable} - ${validation.errors.join(', ')}`);
          hasErrors = true;
        }
      } else {
        console.log(`    ${colors.red}✗${colors.reset} ${variable} - NOT SET`);
        hasErrors = true;
      }
    });

    console.log('');
  });

  // Check recommended variables
  console.log(`${colors.yellow}Recommended Variables:${colors.reset}\n`);

  recommendedVariables.forEach(variable => {
    const value = env[variable] || process.env[variable];
    const isSet = value && value.length > 0 && !value.includes('your-') && !value.includes('CHANGE_ME');

    if (isSet) {
      console.log(`  ${colors.green}✓${colors.reset} ${variable}`);
    } else {
      console.log(`  ${colors.yellow}!${colors.reset} ${variable} - NOT SET (optional)`);
      hasWarnings = true;
    }
  });

  console.log('');

  // Summary
  console.log(`${colors.blue}==================================${colors.reset}`);
  if (hasErrors) {
    console.log(`${colors.red}❌ VALIDATION FAILED${colors.reset}`);
    console.log(`${colors.red}Please set all required environment variables before deployment.${colors.reset}`);
  } else if (hasWarnings) {
    console.log(`${colors.yellow}⚠️  VALIDATION PASSED WITH WARNINGS${colors.reset}`);
    console.log(`${colors.yellow}Consider setting recommended variables for production.${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ VALIDATION PASSED${colors.reset}`);
    console.log(`${colors.green}All required and recommended variables are set.${colors.reset}`);
  }
  console.log(`${colors.blue}==================================${colors.reset}\n`);

  return !hasErrors;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'production';

  let envFile;
  if (environment === 'production') {
    envFile = path.join(__dirname, '../.env.production');
  } else if (environment === 'staging') {
    envFile = path.join(__dirname, '../.env.staging');
  } else {
    envFile = path.join(__dirname, '../.env');
  }

  console.log(`${colors.blue}Loading environment from: ${envFile}${colors.reset}`);

  const env = loadEnvFile(envFile);
  if (!env) {
    console.error(`${colors.red}Failed to load environment file: ${envFile}${colors.reset}`);
    console.error(`${colors.yellow}Falling back to process environment variables${colors.reset}`);
  }

  const isValid = checkEnvironment(env || {}, environment);

  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { checkEnvironment, validateVariable };
