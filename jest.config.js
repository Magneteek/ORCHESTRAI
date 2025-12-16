/**
 * Jest Configuration for ORCHESTRAI
 * 
 * Test categories:
 * - Unit: Individual components and utilities
 * - Integration: Pipeline and domain hub tests
 * - Agents: Agent definition validation
 * - E2E: End-to-end workflow tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory
  rootDir: './',
  
  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'orchestrai-shared/**/*.js',
    'orchestrai-domains/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/temp/**',
    '!**/*.config.js'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module paths
  modulePaths: ['<rootDir>'],
  
  // Test timeout (10 seconds for integration tests)
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/temp/',
    '/projects/',
    '/Orchestrai-frontend/'
  ],
  
  // Transform (if using TypeScript in future)
  transform: {},
  
  // Global setup/teardown
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js'
};
