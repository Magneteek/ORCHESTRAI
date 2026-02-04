# E2E Test Execution Guide

Complete guide for running and managing E2E tests.

## Prerequisites Checklist

Before running tests, ensure:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database running
- [ ] Test database created
- [ ] Dependencies installed
- [ ] Playwright browsers installed
- [ ] Test data seeded

## Setup Commands

```bash
# 1. Navigate to project
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps

# 4. Set up database
npm run prisma:generate
npm run prisma:migrate

# 5. Seed test data
npm run db:seed
```

## Running Tests

### All Tests (Recommended)

```bash
# Run all E2E tests across all browsers
npm run test:e2e
```

**Duration:** ~15 minutes
**Browsers:** Chromium, Firefox, WebKit
**Output:** Console + HTML report

### Interactive UI Mode (Best for Development)

```bash
# Open Playwright UI
npm run test:e2e:ui
```

**Features:**
- Visual test explorer
- Watch mode
- Time travel debugging
- See test code and browser side-by-side

### Debug Mode (Best for Troubleshooting)

```bash
# Debug with step-through
npm run test:e2e:debug
```

**Features:**
- Pause before each action
- Step through test line-by-line
- Inspect page state
- Modify selectors on the fly

### Headed Mode (Watch Tests Run)

```bash
# See browser while tests run
npm run test:e2e:headed
```

**Use when:**
- Verifying visual behavior
- Understanding test flow
- Demonstrating tests to team

### Specific Browser

```bash
# Chromium only (fastest)
npm run test:e2e:chromium

# Firefox
npm run test:e2e:firefox

# WebKit (Safari)
npm run test:e2e:webkit
```

### Specific Test Suite

```bash
# Template launch workflow
npx playwright test template-launch-workflow

# Admin template creation
npx playwright test admin-template-creation

# Cross-account analytics
npx playwright test cross-account-analytics

# User management
npx playwright test admin-user-management
```

### Specific Test Case

```bash
# Run tests matching pattern
npx playwright test -g "should launch campaign"

# Run specific file and test
npx playwright test template-launch-workflow.spec.ts -g "should select template"
```

## Viewing Results

### HTML Report (Recommended)

```bash
npm run test:e2e:report
```

**Shows:**
- Pass/fail status for each test
- Execution time
- Screenshots on failure
- Videos of test runs
- Full test traces

**Access:** Opens in default browser automatically

### Console Output

Run tests normally to see:
- Real-time test execution
- Pass/fail indicators
- Error messages
- Summary statistics

### Trace Viewer (Advanced Debugging)

```bash
# View trace for failed test
npx playwright show-trace playwright-report/trace.zip
```

**Shows:**
- Complete timeline of test execution
- Network requests
- Console logs
- DOM snapshots at each step
- Action details

## Test Workflow

### 1. Development Workflow

```bash
# Start dev server
npm run dev

# In another terminal, run tests in UI mode
npm run test:e2e:ui

# Make changes, tests re-run automatically
```

### 2. Pre-Commit Workflow

```bash
# Run all tests before committing
npm run test:e2e

# If tests pass, commit changes
git add .
git commit -m "feat: add new feature"
```

### 3. CI/CD Workflow

```bash
# Run in CI mode (no browser UI)
CI=true npm run test:e2e

# Or use GitHub Actions (automatic)
```

## Test Data Management

### Reset Test Database

```bash
# Clean up all test data
npm run db:reset

# Re-seed test data
npm run db:seed
```

### Clean Up After Tests

```bash
# Remove test campaigns, templates, users
npx ts-node tests/e2e/helpers/cleanup.ts
```

### Create Additional Test Data

```typescript
// tests/e2e/helpers/create-test-data.ts
import { createTestTemplate } from './create-test-data';

await createTestTemplate({
  name: 'Custom Test Template',
  category: 'e-commerce',
  objective: 'OUTCOME_SALES',
  organizationId: 'org-id'
});
```

## Debugging Failed Tests

### Step 1: Check Error Message

```bash
npm run test:e2e
```

Look for:
- Test name that failed
- Error message
- Stack trace

### Step 2: View Screenshot

```
test-results/
└── template-launch-workflow-should-launch-campaign-chromium/
    └── test-failed-1.png
```

### Step 3: Watch Video

```
test-results/
└── template-launch-workflow-should-launch-campaign-chromium/
    └── video.webm
```

### Step 4: View Trace

```bash
npx playwright show-trace playwright-report/trace.zip
```

### Step 5: Debug with UI

```bash
# Run failed test in debug mode
npx playwright test template-launch-workflow.spec.ts -g "should launch campaign" --debug
```

### Step 6: Inspect Element

```bash
# Use headed mode to see what's happening
npx playwright test --headed --grep "should launch campaign"
```

## Common Issues & Solutions

### Issue: Tests time out

```bash
# Increase timeout
npx playwright test --timeout=60000
```

**Solution:**
- Check if dev server is running
- Verify database connection
- Look for slow API calls

### Issue: Element not found

```bash
# Debug to see actual page state
npx playwright test --debug
```

**Solution:**
- Verify data-testid attributes exist
- Check if element is hidden
- Wait for page load

### Issue: Authentication fails

```bash
# Clear auth state and re-setup
rm -rf tests/.auth
npx playwright test auth-setup
```

**Solution:**
- Verify test users exist in database
- Check credentials in fixtures
- Ensure session not expired

### Issue: Database connection error

```bash
# Check PostgreSQL is running
psql -h localhost -U user -d facebook_ads_test

# Restart PostgreSQL if needed
brew services restart postgresql  # macOS
```

**Solution:**
- Verify DATABASE_URL in .env.test
- Check PostgreSQL is running
- Ensure test database exists

### Issue: Flaky tests

```bash
# Run test multiple times
npx playwright test --repeat-each=5
```

**Solution:**
- Add proper waits (avoid fixed timeouts)
- Check for race conditions
- Verify test isolation

## Performance Optimization

### Run Tests in Parallel

```bash
# Use all CPU cores
npx playwright test --workers=4
```

### Run Only Changed Tests

```bash
# Run tests affected by git changes
npx playwright test --only-changed
```

### Run Tests by Tag

```typescript
// Add tags to tests
test('should work @smoke', async ({ page }) => {
  // test code
});

// Run only smoke tests
npx playwright test --grep @smoke
```

### Skip Slow Tests Locally

```typescript
// Mark slow tests
test('long running test @slow', async ({ page }) => {
  // test code
});

// Skip slow tests
npx playwright test --grep-invert @slow
```

## Test Maintenance

### Update Test Snapshots

```bash
# Update all snapshots
npx playwright test --update-snapshots
```

### Regenerate Test Code

```bash
# Record new test
npx playwright codegen http://localhost:3001
```

### Lint Test Code

```bash
# Run linter
npm run lint tests/
```

### Format Test Code

```bash
# Format with Prettier
npx prettier --write "tests/**/*.ts"
```

## CI/CD Integration

### GitHub Actions

Tests automatically run on:
- Push to main/develop
- Pull requests
- Manual workflow dispatch

### View CI Results

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. View test results and artifacts

### Download Artifacts

- HTML report
- Screenshots
- Videos
- Traces

## Best Practices

### DO ✅

- Use data-testid for selectors
- Wait for elements properly
- Keep tests independent
- Clean up test data
- Use page objects
- Add meaningful test names
- Test one thing per test
- Use test fixtures
- Mock external APIs
- Review test reports

### DON'T ❌

- Use fixed timeouts (sleep)
- Depend on test order
- Share state between tests
- Use CSS classes for selectors
- Ignore flaky tests
- Skip error handling
- Hard-code test data
- Test implementation details
- Leave tests commented out
- Commit failing tests

## Monitoring & Reporting

### Test Metrics to Track

- Total test count
- Pass rate (should be >95%)
- Execution time
- Flaky test rate (should be <5%)
- Code coverage
- Browser compatibility

### Weekly Review

1. Check test pass rate
2. Identify flaky tests
3. Review execution time trends
4. Update test data
5. Clean up obsolete tests

## Getting Help

### Resources

- **Playwright Docs:** https://playwright.dev
- **Test README:** tests/e2e/README.md
- **Quick Start:** tests/e2e/QUICK-START.md
- **Issue Tracker:** GitHub Issues

### Support Channels

1. Check documentation first
2. Search existing issues
3. Ask in team chat
4. Create GitHub issue
5. Contact test maintainer

## Test Execution Checklist

Before running tests:
- [ ] Dev server is running
- [ ] Database is running
- [ ] Test data is seeded
- [ ] No uncommitted changes
- [ ] Latest dependencies installed

After running tests:
- [ ] All tests passed
- [ ] No flaky tests detected
- [ ] Review HTML report
- [ ] Check execution time
- [ ] Clean up test data

## Quick Reference

```bash
# Most common commands
npm run test:e2e              # Run all tests
npm run test:e2e:ui           # Interactive UI
npm run test:e2e:debug        # Debug mode
npm run test:e2e:report       # View report
npx playwright test -g "..."  # Run specific test
npm run db:seed               # Reset test data
```

---

**Happy Testing!** 🧪✨
