# Quick Start Guide - E2E Testing

Get up and running with E2E tests in 5 minutes.

## Setup (One-Time)

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Configure Test Database
```bash
# Create test database
createdb fb_ads_test

# Set environment variable
echo "TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/fb_ads_test" >> .env.test
```

### 3. Seed Test Data
```bash
npm run db:seed:test
```

## Running Tests

### Quick Test Run
```bash
npm run test:e2e
```

### Interactive UI Mode (Recommended)
```bash
npx playwright test --ui
```

This opens an interactive interface where you can:
- Select tests to run
- Watch tests in real-time
- Debug failures visually
- Inspect DOM at any step

### Run Specific Tests
```bash
# Only authentication tests
npx playwright test auth

# Only campaign tests
npx playwright test campaigns

# Single test by name
npx playwright test -g "should successfully login"
```

## Viewing Results

### HTML Report
After tests complete:
```bash
npx playwright show-report
```

Opens interactive report in browser showing:
- Pass/fail status
- Screenshots on failures
- Error traces
- Performance metrics

## Common Commands

```bash
# Run all tests
npm run test:e2e

# Run with headed browser (see what's happening)
npx playwright test --headed

# Debug mode (step through tests)
npx playwright test --debug

# Run only failed tests
npx playwright test --last-failed

# Update snapshots
npx playwright test --update-snapshots
```

## Test Categories

| Category | Command | Purpose |
|----------|---------|---------|
| Auth | `npx playwright test auth` | Login, logout, registration |
| Campaigns | `npx playwright test campaigns` | Campaign CRUD operations |
| Templates | `npx playwright test templates` | Template marketplace |
| Analytics | `npx playwright test analytics` | Dashboard and charts |
| AI Insights | `npx playwright test ai-insights` | AI predictions |
| Integration | `npx playwright test integration` | End-to-end workflows |
| Accessibility | `npx playwright test accessibility` | WCAG compliance |
| Performance | `npx playwright test performance` | Speed and optimization |

## Debugging Failed Tests

### 1. Run in Debug Mode
```bash
npx playwright test auth --debug
```

### 2. View Trace
```bash
# Tests automatically create traces on failure
npx playwright show-trace test-results/.../trace.zip
```

### 3. Take Manual Screenshots
Add to test:
```typescript
await page.screenshot({ path: 'debug.png', fullPage: true });
```

### 4. Console Logs
Add to test:
```typescript
console.log(await page.textContent('[data-testid="element"]'));
```

## Tips

### Speed Up Tests
```bash
# Run in parallel
npx playwright test --workers=4

# Run only chromium
npx playwright test --project=chromium
```

### Watch Mode
```bash
# Re-run on file changes
npx playwright test --watch
```

### Generate Tests
```bash
# Record interactions to generate test code
npx playwright codegen localhost:3001
```

## Troubleshooting

### "Cannot find test fixtures"
```bash
# Regenerate test data
npm run db:seed:test
```

### "Port 3001 already in use"
```bash
# Stop existing dev server
lsof -ti:3001 | xargs kill -9
```

### "Tests timing out"
1. Check dev server is running: `npm run dev`
2. Check database connection: `npm run test-db-connection`
3. Increase timeout in test

### "Flaky test failures"
1. Run test 10 times: `npx playwright test auth --repeat-each=10`
2. Add proper waits: `await page.waitForLoadState('networkidle')`
3. Check for race conditions

## CI/CD Integration

Tests run automatically on:
- Push to main
- Pull requests
- Nightly builds

View results in GitHub Actions tab.

## Next Steps

1. Read full documentation: `tests/README.md`
2. Explore test examples in `tests/` directory
3. Write your first test using Page Objects
4. Set up pre-commit hooks for local testing

## Support

- Slack: #e2e-testing
- Docs: `/tests/README.md`
- Issues: Create GitHub issue with `[E2E]` tag
