# End-to-End Tests for Facebook Ads Manager

Comprehensive E2E tests covering template launch workflow and admin features using Playwright.

## Test Suites

### 1. Template Launch Workflow (`template-launch-workflow.spec.ts`)
Tests the complete user journey of launching a campaign from a template:

- **Step 1: Template Selection**
  - Display template grid
  - Filter by category
  - Search templates
  - Display performance metrics
  - Select template

- **Step 2: Fill Dynamic Fields**
  - Display selected template info
  - Fill required fields
  - Validation errors for missing/invalid fields
  - Navigate back and preserve selection

- **Step 3: Configure Targeting & Budget**
  - Set campaign name
  - Configure targeting (location, age)
  - Configure budget (daily/lifetime)
  - Validation errors

- **Step 4: Preview & Launch**
  - Display campaign preview
  - Show resolved field values
  - Launch campaign successfully
  - Handle launch errors
  - Edit previous steps

- **Integration Tests**
  - Complete workflow end-to-end
  - Preserve form state across navigation

### 2. Admin Template Creation (`admin-template-creation.spec.ts`)
Tests admin functionality for creating and managing global templates:

- **Access Control**
  - ADMIN can access
  - USER is blocked (403 Forbidden)

- **Template List View**
  - Display statistics
  - Filter by category
  - Filter by type (global/organization)
  - Search templates
  - Display performance metrics

- **Template Creation**
  - Create with basic information
  - Add dynamic fields with field builder
  - Use placeholders in ad copy
  - Validation errors
  - Remove fields

- **Template Editing**
  - Edit template details
  - Edit dynamic fields

- **Template Deletion**
  - Show confirmation dialog
  - Display usage statistics
  - Cancel deletion
  - Delete after confirmation

- **Template Availability**
  - Global templates available to all users
  - Organization templates isolated

### 3. Cross-Account Analytics (`cross-account-analytics.spec.ts`)
Tests admin analytics dashboard with cross-account data:

- **Access Control**
  - ADMIN can access
  - USER gets 403 Forbidden

- **Dashboard Overview**
  - Display metric cards (templates, campaigns, spend, ROAS)
  - Display metric values and icons
  - Format currency correctly
  - Loading states

- **Date Range Filter**
  - Display date picker
  - Update data on change
  - Support custom date range

- **Category Filter**
  - Display category dropdown
  - Filter data by category
  - Show category counts

- **Performance Table**
  - Display table headers and rows
  - Sort by ROAS, spend, etc.
  - Display accounts using count
  - Handle N/A values

- **Row Expansion - Per-Account Breakdown**
  - Expand to show breakdown
  - Display per-account metrics
  - Collapse row
  - Multiple rows expanded

- **Charts**
  - Display ROAS chart
  - Display spend distribution chart
  - Update on filter changes

- **Refresh & Error Handling**
  - Refresh data manually
  - Handle API errors
  - Display empty state

### 4. Admin User Management (`admin-user-management.spec.ts`)
Tests admin functionality for managing users and roles:

- **Access Control**
  - ADMIN can access
  - USER is blocked

- **User List View**
  - Display user statistics
  - Display user table with information
  - Search by name/email
  - Filter by role

- **Invite User**
  - Open invite dialog
  - Invite with USER/ADMIN role
  - Validation errors
  - Duplicate email handling

- **Change User Role**
  - Show confirmation dialog
  - Change USER to ADMIN
  - Change ADMIN to USER
  - Cancel role change
  - Prevent demoting last admin
  - Prevent changing own role

- **User Actions**
  - View user campaigns
  - Display last login

- **User Statistics**
  - Total users, admins, regular users
  - Total campaigns

- **Table Sorting**
  - Sort by name, email, role

## Setup

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Database Setup

```bash
# Set up test database
npm run prisma:generate
npm run db:setup

# Seed test data
npx ts-node tests/fixtures/database.fixture.ts
```

### Environment Variables

Create `.env.test`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/facebook_ads_test"
TEST_DATABASE_URL="postgresql://user:password@localhost:5432/facebook_ads_test"
NEXTAUTH_SECRET="test-secret-key"
NEXTAUTH_URL="http://localhost:3001"
```

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Specific Test Suite

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

### Run in Specific Browser

```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit (Safari) only
npx playwright test --project=webkit
```

### Run in Debug Mode

```bash
# Debug mode with UI
npx playwright test --debug

# Debug specific test
npx playwright test template-launch-workflow --debug
```

### Run in Headed Mode

```bash
# See browser while tests run
npx playwright test --headed

# Slow motion for better visibility
npx playwright test --headed --slow-mo=500
```

### Run with UI Mode (Interactive)

```bash
npx playwright test --ui
```

## Test Reports

### View HTML Report

```bash
npx playwright show-report
```

Reports are generated in `playwright-report/` and include:
- Test results with pass/fail status
- Screenshots on failure
- Videos of test runs (on failure)
- Traces for debugging

### View Test Traces

```bash
# View trace for failed test
npx playwright show-trace playwright-report/trace.zip
```

## Page Object Models

All tests use Page Object Models for maintainability:

- `launch-workflow.page.ts` - Template launch wizard
- `admin-templates.page.ts` - Admin template management
- `analytics.page.ts` - Analytics dashboard
- `user-management.page.ts` - User management

## Test Helpers

Helper functions in `helpers/`:

- `cleanup.ts` - Clean up test data
- `create-test-data.ts` - Create test fixtures
- `test-utils.ts` - Common utilities (wait, verify, etc.)

## Authentication

Tests use saved authentication states:

- `tests/.auth/user.json` - USER role session
- `tests/.auth/admin.json` - ADMIN role session

Authentication is set up once before all tests run.

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

### Configuration for CI

Tests automatically:
- Retry failed tests 2 times
- Run in parallel with 2 workers
- Generate JUnit XML reports
- Upload artifacts (screenshots, videos)

## Debugging Failed Tests

1. **Check screenshots** in `test-results/`
2. **Watch video** of failed test
3. **View trace** for detailed timeline
4. **Run with --debug** flag
5. **Check console logs** in trace viewer

## Common Issues

### Tests Timing Out

```bash
# Increase timeout
npx playwright test --timeout=60000
```

### Database Connection Issues

```bash
# Verify database is running
psql -h localhost -U user -d facebook_ads_test

# Reset test database
npm run db:reset
```

### Authentication Issues

```bash
# Delete auth files and re-run setup
rm -rf tests/.auth
npx playwright test auth-setup
```

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Page Object Models** for reusability
3. **Proper waits** instead of fixed timeouts
4. **Clean up test data** after tests
5. **Test isolation** - each test independent
6. **Meaningful test names** describing behavior
7. **Arrange-Act-Assert** pattern
8. **Mock external APIs** when needed

## Coverage

E2E tests cover:
- ✅ Template launch workflow (4 steps)
- ✅ Admin template CRUD operations
- ✅ Dynamic field builder
- ✅ Cross-account analytics
- ✅ User management
- ✅ Role-based access control
- ✅ Form validation
- ✅ Error handling
- ✅ Responsive design
- ✅ Accessibility (keyboard navigation, ARIA)

## Performance

- Full E2E suite runs in ~15 minutes
- Individual test files: ~3-5 minutes
- Parallel execution across browsers
- Automatic retries for flaky tests

## Contact

For issues or questions about E2E tests, contact the development team.
