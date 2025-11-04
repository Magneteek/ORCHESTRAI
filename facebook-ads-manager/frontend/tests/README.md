# Facebook Ads Manager - E2E Testing Suite

Comprehensive Playwright E2E testing suite providing 80%+ coverage of critical user workflows.

## Test Structure

```
tests/
├── auth.spec.ts              # Authentication and session management
├── campaigns.spec.ts         # Campaign CRUD operations
├── templates.spec.ts         # Template marketplace and usage
├── analytics.spec.ts         # Analytics dashboard and exports
├── ai-insights.spec.ts       # AI predictions and recommendations
├── integration.spec.ts       # End-to-end workflows
├── accessibility.spec.ts     # WCAG 2.1 compliance
├── performance.spec.ts       # Page load and Core Web Vitals
├── fixtures/                 # Test data and helpers
│   ├── auth.fixture.ts
│   ├── database.fixture.ts
│   ├── mock-facebook-api.fixture.ts
│   └── test-users.fixture.ts
├── page-objects/            # Page Object Models
│   ├── campaigns.page.ts
│   └── templates.page.ts
└── helpers/                 # Test utilities
    └── test-utils.ts
```

## Prerequisites

1. **Node.js 18+** installed
2. **Test database** configured
3. **Environment variables** set in `.env.test`

```bash
# .env.test
TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/fb_ads_test"
NEXTAUTH_SECRET="test-secret-key"
NEXTAUTH_URL="http://localhost:3001"
```

## Installation

Install Playwright and dependencies:

```bash
npm install --save-dev @playwright/test @axe-core/playwright
npx playwright install
```

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test Suite
```bash
# Authentication tests
npx playwright test auth.spec.ts

# Campaign tests
npx playwright test campaigns.spec.ts

# Accessibility tests
npx playwright test accessibility.spec.ts
```

### Run Tests in UI Mode (Recommended for Development)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode
```bash
npx playwright test --headed
```

### Run Tests with Debugging
```bash
npx playwright test --debug
```

### Run Specific Test
```bash
npx playwright test -g "should successfully login"
```

## Test Reports

### HTML Report (Interactive)
```bash
npx playwright show-report
```

### Generate Report Without Running Tests
```bash
npx playwright show-report playwright-report
```

Reports are generated in `playwright-report/` directory.

## Continuous Integration

Tests are configured for CI/CD with:
- Automatic retry on failure (2 retries in CI)
- Parallel execution (2 workers in CI)
- Screenshot capture on failures
- Video recording on failures
- GitHub Actions integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Coverage

### Authentication (auth.spec.ts)
- ✅ User registration with validation
- ✅ Login/logout flows
- ✅ Session persistence
- ✅ Protected route access
- ✅ Password validation
- ✅ Error handling

### Campaigns (campaigns.spec.ts)
- ✅ Campaign list with pagination
- ✅ Search and filter campaigns
- ✅ Create campaign wizard (all steps)
- ✅ Edit campaign details
- ✅ Pause/resume campaigns
- ✅ Delete campaigns
- ✅ Campaign statistics display

### Templates (templates.spec.ts)
- ✅ Browse template marketplace
- ✅ Search and filter templates
- ✅ Create new templates
- ✅ Use template to create campaign
- ✅ Fork public templates
- ✅ Template leaderboard

### Analytics (analytics.spec.ts)
- ✅ Dashboard with key metrics
- ✅ Date range selection
- ✅ Chart interactions
- ✅ Export to CSV/PDF
- ✅ Real-time updates
- ✅ Campaign breakdown

### AI Insights (ai-insights.spec.ts)
- ✅ Performance predictions
- ✅ Anomaly detection
- ✅ Copy optimization
- ✅ Audience insights
- ✅ Budget recommendations

### Integration (integration.spec.ts)
- ✅ Template → Campaign flow
- ✅ Full campaign lifecycle
- ✅ Multi-account switching
- ✅ Error recovery
- ✅ Concurrent operations

### Accessibility (accessibility.spec.ts)
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Color contrast
- ✅ Focus management

### Performance (performance.spec.ts)
- ✅ Page load times
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ Bundle size optimization
- ✅ Image optimization
- ✅ Caching strategies
- ✅ Memory management

## Writing New Tests

### 1. Follow Page Object Model Pattern

```typescript
// page-objects/my-feature.page.ts
export class MyFeaturePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/my-feature');
  }

  async performAction() {
    await this.page.click('[data-testid="action-button"]');
  }
}
```

### 2. Use data-testid Attributes

Always use `data-testid` for reliable element selection:

```tsx
<button data-testid="submit-button">Submit</button>
```

```typescript
await page.click('[data-testid="submit-button"]');
```

### 3. Implement Proper Waits

```typescript
// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.waitForSelector('[data-testid="result"]');

// Wait for navigation
await page.waitForURL('/dashboard');
```

### 4. Mock External APIs

```typescript
await page.route('**/api/facebook/**', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: mockData }),
  });
});
```

## Best Practices

### ✅ DO

- Use Page Object Models for reusability
- Add `data-testid` attributes to components
- Mock external API calls
- Test user workflows, not implementation details
- Write descriptive test names
- Use proper waits instead of arbitrary timeouts
- Clean up test data after tests

### ❌ DON'T

- Test implementation details
- Use CSS selectors that may change
- Write tests dependent on test order
- Leave test data in database
- Use `page.waitForTimeout()` excessively
- Test third-party library functionality

## Debugging

### Visual Debugging
```bash
# Open Playwright Inspector
npx playwright test --debug

# Pause test execution
await page.pause();
```

### Trace Viewer
```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Screenshots
```bash
# Take screenshot
await page.screenshot({ path: 'screenshot.png' });

# Screenshot on failure (automatic)
# Configured in playwright.config.ts
```

## Troubleshooting

### Tests Failing Locally

1. **Check database connection**
   ```bash
   npm run test-db-connection
   ```

2. **Clear test database**
   ```bash
   npm run db:reset:test
   ```

3. **Restart development server**
   ```bash
   npm run dev
   ```

### Tests Timing Out

1. Increase timeout in `playwright.config.ts`:
   ```typescript
   timeout: 60 * 1000, // 60 seconds
   ```

2. Check for missing `waitForLoadState()` calls

3. Verify API mocks are working

### Flaky Tests

1. Add proper waits instead of timeouts
2. Ensure test isolation (no shared state)
3. Mock unstable external dependencies
4. Use `test.describe.serial()` for dependent tests

## Performance Optimization

### Parallel Execution
```bash
# Run with specific workers
npx playwright test --workers=4
```

### Sharding for CI
```bash
# Shard 1 of 4
npx playwright test --shard=1/4
```

### Selective Test Execution
```bash
# Run only changed tests
npx playwright test --only-changed
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Support

For issues or questions:
1. Check existing test examples
2. Review Playwright documentation
3. Run tests in debug mode
4. Create issue with reproduction steps
