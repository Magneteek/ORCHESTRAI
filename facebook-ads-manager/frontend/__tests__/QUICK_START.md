# Integration Tests - Quick Start Guide

Get up and running with integration tests in 5 minutes.

## 1. Setup Test Database

### Option A: Docker (Recommended)

```bash
# Start PostgreSQL test database
docker run -d \
  --name fb-ads-test-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=facebook_ads_test \
  -p 5433:5432 \
  postgres:15-alpine

# Verify it's running
docker ps | grep fb-ads-test-db
```

### Option B: Local PostgreSQL

```bash
# Create test database
createdb facebook_ads_test

# Verify connection
psql -d facebook_ads_test -c "SELECT 1;"
```

## 2. Configure Environment

Create `.env.test` in project root:

```bash
# Copy and edit
cp .env.example .env.test
```

Edit `.env.test`:

```env
# Test Database (note different port if using Docker)
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/facebook_ads_test"

# Or for local PostgreSQL
# TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/facebook_ads_test"

# NextAuth
NEXTAUTH_SECRET="test-secret-key-for-testing"
NEXTAUTH_URL="http://localhost:3000"

# Facebook (mock values for testing)
FACEBOOK_APP_ID="test-app-id"
FACEBOOK_APP_SECRET="test-app-secret"
```

## 3. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations on test database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/facebook_ads_test" \
  npx prisma migrate deploy
```

## 4. Run Tests

```bash
# Run all integration tests
npm test -- __tests__/integration

# Run specific test suite
npm test -- __tests__/integration/template-launch.test.ts

# Run with coverage
npm test -- --coverage __tests__/integration

# Watch mode (for development)
npm test -- --watch __tests__/integration
```

## 5. Verify Setup

Expected output:

```
PASS  __tests__/integration/template-launch.test.ts
PASS  __tests__/integration/analytics.test.ts
PASS  __tests__/integration/admin-templates.test.ts
PASS  __tests__/integration/user-management.test.ts
PASS  __tests__/integration/performance-sync.test.ts

Test Suites: 5 passed, 5 total
Tests:       50+ passed, 50+ total
Snapshots:   0 total
Time:        27s
```

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution 1**: Check Docker container is running
```bash
docker ps | grep fb-ads-test-db
docker logs fb-ads-test-db
```

**Solution 2**: Verify connection string
```bash
psql "postgresql://postgres:postgres@localhost:5433/facebook_ads_test" -c "SELECT 1;"
```

**Solution 3**: Check port availability
```bash
lsof -i :5433
```

### Issue: "Prisma Client not generated"

```bash
npx prisma generate
```

### Issue: "Migration not applied"

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/facebook_ads_test" \
  npx prisma migrate deploy
```

### Issue: "Jest timeout"

Increase timeout in `jest.setup.js`:
```javascript
jest.setTimeout(60000); // 60 seconds
```

## Clean Up

### Stop Test Database

```bash
# Stop container
docker stop fb-ads-test-db

# Remove container
docker rm fb-ads-test-db
```

### Reset Test Database

```bash
# Drop and recreate
docker exec fb-ads-test-db psql -U postgres -c "DROP DATABASE facebook_ads_test;"
docker exec fb-ads-test-db psql -U postgres -c "CREATE DATABASE facebook_ads_test;"

# Re-run migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/facebook_ads_test" \
  npx prisma migrate deploy
```

## Next Steps

1. Read full documentation: `__tests__/README.md`
2. Explore test helpers: `__tests__/setup/test-helpers.ts`
3. Add new tests following existing patterns
4. Run tests before committing changes

## Common Commands

```bash
# Run all tests
npm test

# Run integration tests only
npm test -- __tests__/integration

# Run specific test file
npm test -- template-launch

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Test Scripts (Optional)

Add to `package.json`:

```json
{
  "scripts": {
    "test:integration": "jest __tests__/integration",
    "test:integration:watch": "jest __tests__/integration --watch",
    "test:integration:coverage": "jest __tests__/integration --coverage",
    "test:db:setup": "docker run -d --name fb-ads-test-db -e POSTGRES_PASSWORD=postgres -p 5433:5432 postgres:15-alpine && sleep 3 && npm run db:migrate:test",
    "test:db:reset": "docker exec fb-ads-test-db psql -U postgres -c 'DROP DATABASE facebook_ads_test;' && docker exec fb-ads-test-db psql -U postgres -c 'CREATE DATABASE facebook_ads_test;' && npm run db:migrate:test",
    "db:migrate:test": "DATABASE_URL=postgresql://postgres:postgres@localhost:5433/facebook_ads_test prisma migrate deploy"
  }
}
```

Then use:

```bash
npm run test:integration
npm run test:integration:watch
npm run test:integration:coverage
npm run test:db:setup
npm run test:db:reset
```

## Pro Tips

1. **Keep test DB running**: Leave Docker container running during development
2. **Use watch mode**: `npm test -- --watch` for rapid feedback
3. **Focus tests**: Use `.only` to run single test during debugging
4. **Skip tests**: Use `.skip` to temporarily disable tests
5. **Check coverage**: Aim for >85% coverage on new code

```typescript
// Run only this test
it.only('should do something', async () => {
  // test code
});

// Skip this test
it.skip('should do something else', async () => {
  // test code
});
```

## Help & Support

- Read full docs: `__tests__/README.md`
- Check test examples in `__tests__/integration/`
- Review test helpers in `__tests__/setup/`
- Ask team for help if stuck

Happy testing! 🎉
