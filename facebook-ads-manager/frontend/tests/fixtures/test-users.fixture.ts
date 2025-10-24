/**
 * Test Users Fixture
 * Defines test user accounts and their properties
 */

export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export interface TestUserWithContext extends TestUser {
  organizationId?: string;
  adAccountId?: string;
}

/**
 * Primary test users
 */
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'TestPassword123!',
    name: 'Admin User',
    role: 'ADMIN' as const,
  },
  user1: {
    email: 'user1@test.com',
    password: 'TestPassword123!',
    name: 'Test User 1',
    role: 'USER' as const,
  },
  user2: {
    email: 'user2@test.com',
    password: 'TestPassword123!',
    name: 'Test User 2',
    role: 'USER' as const,
  },
} as const;

/**
 * Get test user by email
 */
export function getTestUser(email: string): TestUser | undefined {
  return Object.values(testUsers).find((user) => user.email === email);
}

/**
 * Generate random test user credentials
 */
export function generateRandomUser(): TestUser {
  const timestamp = Date.now();
  return {
    email: `test.user.${timestamp}@test.com`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
    role: 'USER',
  };
}

/**
 * Validation patterns for user data
 */
export const validationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },
  name: {
    minLength: 2,
    maxLength: 100,
  },
} as const;

/**
 * Invalid test credentials for negative testing
 */
export const invalidCredentials = {
  invalidEmail: {
    email: 'invalid-email',
    password: 'TestPassword123!',
  },
  invalidPassword: {
    email: 'test@test.com',
    password: 'short',
  },
  nonExistentUser: {
    email: 'nonexistent@test.com',
    password: 'TestPassword123!',
  },
  wrongPassword: {
    email: testUsers.user1.email,
    password: 'WrongPassword123!',
  },
} as const;
