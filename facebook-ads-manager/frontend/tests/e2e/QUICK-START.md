# E2E Tests Quick Start Guide

Get up and running with E2E tests in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Facebook Ads Manager application set up

## Quick Setup

### 1. Install Dependencies

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend
npm install
npx playwright install --with-deps
```

### 2. Set Up Test Database

```bash
# Copy environment variables
cp .env .env.test

# Update .env.test with test database
DATABASE_URL="postgresql://user:password@localhost:5432/facebook_ads_test"

# Run migrations
npm run prisma:generate
npm run prisma:migrate
```

### 3. Seed Test Data

```bash
# Seed test users and data
npm run db:seed
```

This creates:
- Admin user: `admin@test.com` / `TestPassword123!`
- Test user: `user1@test.com` / `TestPassword123!`
- Sample templates
- Sample ad accounts

### 4. Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Or run specific test suite
npx playwright test template-launch-workflow
```

## Test Suites Available

### 1. Template Launch Workflow
```bash
npx playwright test template-launch-workflow
```
**Duration:** ~5 minutes
**Tests:** Complete campaign launch from template selection to preview

### 2. Admin Template Creation
```bash
npx playwright test admin-template-creation
```
**Duration:** ~4 minutes
**Tests:** Template CRUD, dynamic fields, admin access control

### 3. Cross-Account Analytics
```bash
npx playwright test cross-account-analytics
```
**Duration:** ~3 minutes
**Tests:** Analytics dashboard, metrics, charts, filters

### 4. User Management
```bash
npx playwright test admin-user-management
```
**Duration:** ~3 minutes
**Tests:** User invitation, role changes, access control

## Viewing Results

### HTML Report (Recommended)
```bash
npx playwright show-report
```

### Live Test UI
```bash
npx playwright test --ui
```

### Debug Mode
```bash
npx playwright test --debug
```

## Common Commands

```bash
# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with visible browser
npx playwright test --headed

# Run single test file
npx playwright test tests/e2e/template-launch-workflow.spec.ts

# Run tests matching pattern
npx playwright test -g "should launch campaign"

# Update snapshots
npx playwright test --update-snapshots
```

## Troubleshooting

### Tests Fail with "Cannot connect to database"
```bash
# Verify PostgreSQL is running
psql -h localhost -U user -d facebook_ads_test

# If not running, start PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo service postgresql start
```

### Tests Fail with "Navigation timeout"
```bash
# Make sure the dev server is running
npm run dev

# Or let Playwright start it automatically (default)
```

### Tests Fail with "Element not found"
```bash
# Clear auth state and re-run setup
rm -rf tests/.auth
npx playwright test auth-setup
```

### Browser Installation Issues
```bash
# Re-install browsers with dependencies
npx playwright install --with-deps

# Or install specific browser
npx playwright install chromium --with-deps
```

## Test Data

### Test Users

| Email | Password | Role |
|-------|----------|------|
| `admin@test.com` | `TestPassword123!` | ADMIN |
| `user1@test.com` | `TestPassword123!` | USER |
| `user2@test.com` | `TestPassword123!` | USER |

### Test Templates

- **E2E Test Product Launch** - E-commerce template with dynamic fields
- **E2E Test Lead Generation** - Lead gen template with location field

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Next Steps

1. **Read the full README** - `tests/e2e/README.md`
2. **Explore page objects** - `tests/page-objects/`
3. **Check test helpers** - `tests/helpers/`
4. **Write new tests** - Follow existing patterns

## Tips

- Use `--headed` flag to watch tests run
- Use `--debug` flag to step through tests
- Use `--ui` flag for interactive test explorer
- Check `playwright-report/` for screenshots of failures
- Use data-testid attributes for stable selectors
- Keep tests independent and isolated

## Support

For issues or questions:
1. Check the full README: `tests/e2e/README.md`
2. View Playwright docs: https://playwright.dev
3. Contact the development team

---

**Ready to run!** 🚀

```bash
npm run test:e2e
```
