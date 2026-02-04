# Integration Tests - Facebook Ads Manager

This directory contains comprehensive integration tests for the Facebook Ads Manager API routes, testing the full request/response cycle with real database interactions.

## Test Structure

```
__tests__/
├── setup/
│   ├── test-db.ts           # Database setup utilities
│   └── test-helpers.ts      # Test data factories and mocking utilities
└── integration/
    ├── template-launch.test.ts      # Template launch API tests
    ├── analytics.test.ts            # Analytics API tests
    ├── admin-templates.test.ts      # Admin template management tests
    ├── user-management.test.ts      # User management API tests
    └── performance-sync.test.ts     # Background job tests
```

## Prerequisites

### 1. Test Database Setup

Create a separate test database to avoid polluting your development database:

```bash
# Option 1: Using Docker (Recommended)
docker run -d \
  --name fb-ads-test-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=facebook_ads_test \
  -p 5433:5432 \
  postgres:15-alpine

# Option 2: Using local PostgreSQL
createdb facebook_ads_test
```

### 2. Environment Variables

Create a `.env.test` file in the project root:

```bash
# Test Database
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/facebook_ads_test"

# NextAuth (use test secret)
NEXTAUTH_SECRET="test-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Facebook (mock values for testing)
FACEBOOK_APP_ID="test-app-id"
FACEBOOK_APP_SECRET="test-app-secret"
```

### 3. Install Dependencies

The required testing dependencies are already in `package.json`:

```bash
npm install
```

Required packages:
- `jest@29.7.0` - Testing framework
- `@testing-library/jest-dom@6.6.3` - DOM matchers
- `@testing-library/react@16.0.1` - React testing utilities

## Running Tests

### Run All Integration Tests

```bash
npm test -- __tests__/integration
```

### Run Specific Test Suite

```bash
# Template Launch tests
npm test -- __tests__/integration/template-launch.test.ts

# Analytics tests
npm test -- __tests__/integration/analytics.test.ts

# Admin Templates tests
npm test -- __tests__/integration/admin-templates.test.ts

# User Management tests
npm test -- __tests__/integration/user-management.test.ts

# Performance Sync tests
npm test -- __tests__/integration/performance-sync.test.ts
```

### Run with Coverage

```bash
npm test -- --coverage __tests__/integration
```

### Watch Mode (for development)

```bash
npm test -- --watch __tests__/integration
```

## Test Coverage Goals

Target coverage (defined in `jest.config.js`):
- **Branches**: 80%
- **Functions**: 90%
- **Lines**: 85%
- **Statements**: 85%

## Test Scenarios

### 1. Template Launch API (`template-launch.test.ts`)

Tests the campaign launch workflow from templates:

- ✅ Successful launch with valid data
- ✅ Validation of required fields
- ✅ Type validation for field values
- ✅ Template not found (404)
- ✅ Unauthorized access (401)
- ✅ Template usage counter increment
- ✅ Global template access
- ✅ Budget constraints validation
- ✅ Targeting requirements validation

**Database Interactions:**
- Creates templates with dynamic fields
- Creates ad accounts
- Validates field values against template schema
- (Would) Create campaign records

### 2. Analytics API (`analytics.test.ts`)

Tests admin-only analytics endpoints:

- ✅ Template performance aggregation
- ✅ Date range filtering
- ✅ Category filtering
- ✅ Permission enforcement (ADMIN only)
- ✅ ROAS calculation accuracy
- ✅ CTR calculation accuracy
- ✅ Account-level breakdown
- ✅ Multi-account performance comparison

**Database Interactions:**
- Queries template performance metrics
- Aggregates data across campaigns
- Filters by date and category

### 3. Admin Templates API (`admin-templates.test.ts`)

Tests template management by admins:

- ✅ Create global templates (ADMIN)
- ✅ Persist templates to database
- ✅ Save dynamic fields schema
- ✅ Update template properties
- ✅ Delete templates with cascade
- ✅ Permission enforcement
- ✅ Validation errors
- ✅ Filter by category and global flag

**Database Interactions:**
- CRUD operations on AdTemplate
- Cascade deletes to TemplateLaunch
- Template performance aggregate handling

### 4. User Management API (`user-management.test.ts`)

Tests admin user management:

- ✅ List users in organization
- ✅ Promote USER to ADMIN
- ✅ Demote ADMIN to USER
- ✅ Prevent demoting last admin
- ✅ Prevent self-role change
- ✅ Invite new users
- ✅ Duplicate email validation
- ✅ Organization isolation
- ✅ Permission enforcement

**Database Interactions:**
- User role updates
- Admin count verification
- Cross-organization isolation checks

### 5. Performance Sync Job (`performance-sync.test.ts`)

Tests background job for aggregating template performance:

- ✅ Aggregate metrics from multiple campaigns
- ✅ Calculate ROAS, CTR, CPC, CPM
- ✅ Count unique ad accounts
- ✅ Handle templates with no campaigns
- ✅ Handle zero spend scenarios
- ✅ Handle missing performance data
- ✅ Update existing aggregate records
- ✅ Multi-account performance aggregation

**Database Interactions:**
- Complex joins across Campaign → AdSet → Ad → PerformanceMetric
- Upsert operations on TemplatePerformanceAggregate
- BigInt aggregations for large numbers

## Test Helpers

### Database Utilities (`test-db.ts`)

```typescript
import { setupTestDatabase, cleanupTestDatabase } from '../setup/test-db';

beforeAll(async () => {
  await setupTestDatabase(); // Connect and clean
});

afterAll(async () => {
  await cleanupTestDatabase(); // Clean and disconnect
});
```

### Test Data Factories (`test-helpers.ts`)

```typescript
import {
  createTestOrganization,
  createTestUser,
  createTestAdmin,
  createTestTemplate,
  createDynamicTestTemplate,
  createGlobalTestTemplate,
  mockUserSession,
  mockAdminSession,
} from '../setup/test-helpers';

// Create test data
const org = await createTestOrganization();
const user = await createTestUser(org.id);
const admin = await createTestAdmin(org.id);
const template = await createDynamicTestTemplate(org.id);

// Mock authentication
mockGetServerSession.mockResolvedValue(mockAdminSession(admin));
```

## Mocking Strategy

### NextAuth Sessions

```typescript
jest.mock('next-auth');
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Mock admin session
mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

// Mock user session
mockGetServerSession.mockResolvedValue(mockUserSession(testUser));

// Mock unauthenticated
mockGetServerSession.mockResolvedValue(null);
```

### External Services

- **Facebook API**: Not called (template launch is stubbed)
- **Email Service**: Mocked (invitation emails)
- **Redis/BullMQ**: Not used in integration tests (sync job is inline)

### Real Database

All tests use a real PostgreSQL test database for authentic integration testing:
- ✅ Real database constraints
- ✅ Actual transaction behavior
- ✅ Real foreign key cascades
- ✅ Actual query performance

## Cleanup Strategy

### Per-Test Cleanup

```typescript
afterEach(async () => {
  // Clean in reverse dependency order
  await testPrisma.performanceMetric.deleteMany();
  await testPrisma.ad.deleteMany();
  await testPrisma.adSet.deleteMany();
  await testPrisma.campaign.deleteMany();
  await testPrisma.adTemplate.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.organization.deleteMany();

  jest.clearAllMocks();
});
```

### Test Isolation

Each test:
1. Creates its own test data
2. Runs independently
3. Cleans up after itself
4. Does not affect other tests

## Common Issues & Solutions

### Issue: Tests fail with "Database not found"

**Solution**: Ensure test database is created and `TEST_DATABASE_URL` is set:

```bash
docker run -d --name fb-ads-test-db -p 5433:5432 postgres:15-alpine
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/facebook_ads_test"
```

### Issue: "Foreign key constraint violation"

**Solution**: Ensure cleanup order matches foreign key dependencies. Delete child records before parents:

```
PerformanceMetric → Ad → AdSet → Campaign → AdTemplate
TemplateLaunch → Campaign
User → Organization
```

### Issue: "Jest timeout"

**Solution**: Increase timeout for database operations:

```typescript
jest.setTimeout(30000); // 30 seconds
```

### Issue: "Mock not working"

**Solution**: Clear mocks between tests:

```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

## Debugging Tests

### Enable Verbose Logging

```bash
npm test -- --verbose __tests__/integration
```

### Debug Specific Test

```bash
npm test -- -t "should successfully launch a campaign" __tests__/integration/template-launch.test.ts
```

### Inspect Database State

Add this to your test:

```typescript
it('should do something', async () => {
  // ... test code ...

  // Pause and inspect database
  const templates = await testPrisma.adTemplate.findMany();
  console.log('Templates:', templates);

  // ... assertions ...
});
```

## Best Practices

1. **Test Independence**: Each test should create its own data and clean up
2. **Real Database**: Use test database, not mocks, for integration tests
3. **Clear Naming**: Test names should describe the scenario clearly
4. **Arrange-Act-Assert**: Follow AAA pattern for test structure
5. **Mock Externals**: Mock external services (Facebook API, email), use real DB
6. **Cleanup**: Always clean up test data to prevent test pollution
7. **Assertions**: Test both success and error paths
8. **Database State**: Verify database state changes, not just API responses

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: facebook_ads_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/facebook_ads_test

      - name: Run integration tests
        run: npm test -- __tests__/integration --coverage
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/facebook_ads_test
          NEXTAUTH_SECRET: test-secret

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Estimated Test Execution Time

- **Template Launch Tests**: ~5 seconds
- **Analytics Tests**: ~4 seconds
- **Admin Templates Tests**: ~6 seconds
- **User Management Tests**: ~5 seconds
- **Performance Sync Tests**: ~7 seconds

**Total**: ~27 seconds

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use test helpers from `test-helpers.ts`
3. Clean up test data in `afterEach`
4. Test both success and error scenarios
5. Verify database state changes
6. Update this README with new test scenarios
