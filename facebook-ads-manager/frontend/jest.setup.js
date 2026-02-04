// Jest setup file for global test configuration
import '@testing-library/jest-dom';

global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));

// Set test timeout to 30 seconds for database operations
jest.setTimeout(30000);

// Mock environment variables for tests
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-key';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
process.env.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Global test utilities
global.console = {
  ...console,
  // Suppress console.error during tests unless explicitly needed
  error: jest.fn(),
  warn: jest.fn(),
};

// Clean up after all tests
afterAll(async () => {
  // Give time for async cleanup
  await new Promise((resolve) => setTimeout(resolve, 500));
});
