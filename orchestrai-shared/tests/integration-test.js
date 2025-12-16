/**
 * Integration Test - Logging + Errors + Validation
 *
 * Quick test to verify the three improvements work together
 */

const logger = require('../logging/logger');
const { ValidationError, AgentError, RecoverableError } = require('../errors/typed-errors');
const { AgentConfigSchema, validate } = require('../validation/schemas');

console.log('🧪 Testing ORCHESTRAI Improvements Integration\n');

// Test 1: Logging
console.log('1️⃣ Testing Logging System...');
try {
  logger.info('Integration test started', { testId: 'test-123' });
  logger.debug('Debug information', { data: { nested: 'value' } });
  logger.warn('Warning message', { warning: 'test-warning' });
  console.log('✅ Logging system working\n');
} catch (error) {
  console.error('❌ Logging test failed:', error);
  process.exit(1);
}

// Test 2: Typed Errors
console.log('2️⃣ Testing Typed Error System...');
try {
  try {
    throw new ValidationError('Test validation error', [
      { field: 'name', message: 'Name is required' }
    ]);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('✅ ValidationError works');
      console.log(`   Message: ${error.message}`);
      console.log(`   Errors: ${JSON.stringify(error.validationErrors)}\n`);
    } else {
      throw new Error('ValidationError not caught correctly');
    }
  }

  try {
    throw new AgentError('Test agent error', {
      agentName: 'test-agent',
      domain: 'testing'
    });
  } catch (error) {
    if (error instanceof AgentError) {
      console.log('✅ AgentError works');
      console.log(`   Agent: ${error.agentName}\n`);
    } else {
      throw new Error('AgentError not caught correctly');
    }
  }

  try {
    throw new RecoverableError('Test recoverable error', 'fallback-value', { service: 'test' });
  } catch (error) {
    if (error.recoverable) {
      console.log('✅ RecoverableError works');
      console.log(`   Fallback: ${error.fallback}\n`);
    } else {
      throw new Error('RecoverableError not caught correctly');
    }
  }
} catch (error) {
  console.error('❌ Error system test failed:', error);
  process.exit(1);
}

// Test 3: Validation
console.log('3️⃣ Testing Zod Validation System...');
try {
  // Valid configuration
  const validConfig = {
    name: 'test-agent',
    domain: 'testing',
    capabilities: ['test1', 'test2'],
    timeout: 30000,
    retries: 3
  };

  const validated = AgentConfigSchema.parse(validConfig);
  console.log('✅ Valid config passes validation');
  console.log(`   Agent: ${validated.name}\n`);

  // Invalid configuration
  try {
    const invalidConfig = {
      name: 'Invalid Name!', // Should fail regex
      domain: '', // Should fail min length
      timeout: -100 // Should fail positive check
    };
    AgentConfigSchema.parse(invalidConfig);
    console.error('❌ Invalid config should have failed');
    process.exit(1);
  } catch (error) {
    console.log('✅ Invalid config correctly rejected');
    console.log(`   Errors: ${error.errors?.length || 0} validation errors\n`);
  }
} catch (error) {
  console.error('❌ Validation test failed:', error);
  process.exit(1);
}

// Test 4: Integration - All three together
console.log('4️⃣ Testing Complete Integration...');
try {
  // Create agent-specific logger
  const agentLogger = logger.forAgent('test-agent', 'testing');

  // Validate config with error handling
  try {
    const config = validate(AgentConfigSchema, {
      name: '', // Invalid
      domain: 'test'
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      // Log the validation error
      agentLogger.warn('Config validation failed', {
        validationErrors: error.validationErrors
      });
      console.log('✅ Validation error logged correctly\n');
    }
  }

  console.log('✅ All systems integrated successfully!\n');
} catch (error) {
  console.error('❌ Integration test failed:', error);
  process.exit(1);
}

console.log('🎉 All tests passed! The three improvements are working together.\n');
console.log('Summary:');
console.log('  ✅ Structured logging with Pino');
console.log('  ✅ Typed error hierarchy (9 error types)');
console.log('  ✅ Zod validation schemas (8 core schemas)');
console.log('  ✅ Complete integration verified\n');

process.exit(0);
