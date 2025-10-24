# Analytics Dashboard Testing Guide

## Quick Start

### 1. Start the Development Server

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend
npm run dev
```

The application will be available at `http://localhost:3001`

### 2. Access the Analytics Dashboard

Navigate to: `http://localhost:3001/dashboard/analytics`

## Manual Testing Checklist

### Date Range Picker
- [ ] Test preset date ranges (7d, 14d, 30d, 90d)
- [ ] Test month-to-date (MTD)
- [ ] Test quarter-to-date (QTD)
- [ ] Test year-to-date (YTD)
- [ ] Test custom date range selection
- [ ] Verify date range displays correctly
- [ ] Test date range validation (from < to)

### Metric Cards
- [ ] Verify all 4 metric cards display (Spend, Impressions, Clicks, Conversions)
- [ ] Check loading states appear during data fetch
- [ ] Verify trend indicators (up/down arrows)
- [ ] Test sparkline charts render
- [ ] Check formatting (currency, numbers, percentages)

### Time Series Chart
- [ ] Verify chart renders with data
- [ ] Test hovering over data points (tooltip appears)
- [ ] Check multiple metrics display correctly
- [ ] Test legend functionality
- [ ] Verify axis labels and grid
- [ ] Test comparison mode (dotted lines for previous period)
- [ ] Check responsive behavior on mobile

### Campaign Comparison Chart
- [ ] Verify horizontal bars render
- [ ] Test hover effects on bars
- [ ] Check value labels display
- [ ] Verify top 10 campaigns shown
- [ ] Test sorting by different metrics

### Conversion Funnel Chart
- [ ] Verify funnel stages render
- [ ] Check drop-off rates display
- [ ] Test hover interactions
- [ ] Verify percentage calculations
- [ ] Check color coding

### Tabs
- [ ] Test "Overview" tab
- [ ] Test "Engagement" tab
- [ ] Test "Conversions" tab
- [ ] Test "ROI & Costs" tab
- [ ] Verify each tab shows correct charts

### Comparison Mode
- [ ] Toggle comparison mode ON
- [ ] Select comparison date range
- [ ] Verify comparison data displays
- [ ] Test toggling comparison mode OFF
- [ ] Check trend calculations with comparison

### Export Functionality
- [ ] Test CSV export
- [ ] Test PDF export (currently placeholder)
- [ ] Verify file downloads
- [ ] Check filename format
- [ ] Verify exported data completeness
- [ ] Test error handling (no data scenario)

### Performance
- [ ] Check initial load time (<2 seconds)
- [ ] Verify chart rendering speed (<500ms)
- [ ] Test with large datasets (>1000 data points)
- [ ] Check cache behavior (subsequent loads faster)
- [ ] Test refresh button functionality

### Error Handling
- [ ] Test with no ad accounts configured
- [ ] Test with invalid date range
- [ ] Test with network errors
- [ ] Verify error messages display in toasts
- [ ] Test empty state displays

### Accessibility
- [ ] Test keyboard navigation
- [ ] Verify ARIA labels on charts
- [ ] Test screen reader compatibility
- [ ] Check focus indicators
- [ ] Test high contrast mode

### Responsive Design
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Verify charts adapt to screen size
- [ ] Check horizontal scrolling behavior

## API Testing

### Analytics Endpoint

```bash
# Test basic analytics fetch
curl -X GET "http://localhost:3001/api/analytics?from=2024-01-01T00:00:00.000Z&to=2024-01-31T23:59:59.999Z" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Test with account filter
curl -X GET "http://localhost:3001/api/analytics?from=2024-01-01&to=2024-01-31&accountIds=act_123456" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Test with campaign filter
curl -X GET "http://localhost:3001/api/analytics?from=2024-01-01&to=2024-01-31&campaignIds=123456,789012" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Export Endpoint

```bash
# Test CSV export
curl -X GET "http://localhost:3001/api/analytics/export?from=2024-01-01&to=2024-01-31&format=csv" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -o analytics-export.csv

# Test PDF export
curl -X GET "http://localhost:3001/api/analytics/export?from=2024-01-01&to=2024-01-31&format=pdf" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -o analytics-export.pdf
```

## Expected Response Structures

### Analytics API Response

```json
{
  "success": true,
  "data": {
    "metrics": {
      "spend": 1234.56,
      "impressions": 50000,
      "clicks": 1500,
      "conversions": 75,
      "ctr": 0.03,
      "cpc": 0.82,
      "cpm": 24.69,
      "roas": 3.2
    },
    "timeSeries": [
      {
        "date": "2024-01-01",
        "impressions": 2000,
        "clicks": 60,
        "spend": 50.00,
        "conversions": 3,
        "ctr": 0.03,
        "roas": 3.5
      }
    ],
    "topCampaigns": [
      {
        "id": "123456",
        "name": "Campaign Name",
        "impressions": 10000,
        "clicks": 300,
        "spend": 250.00,
        "conversions": 15,
        "ctr": 0.03,
        "roas": 4.2
      }
    ],
    "funnelData": [
      {
        "name": "Impressions",
        "value": 50000,
        "percentage": 100
      },
      {
        "name": "Clicks",
        "value": 1500,
        "percentage": 3.0,
        "dropoffRate": 97.0
      },
      {
        "name": "Conversions",
        "value": 75,
        "percentage": 0.15,
        "dropoffRate": 95.0
      }
    ]
  }
}
```

## Common Issues and Solutions

### Issue: Charts not rendering
**Symptoms**: White screen where charts should be
**Solutions**:
1. Check browser console for errors
2. Verify D3.js is loaded: `window.d3`
3. Check data format matches TypeScript interfaces
4. Ensure container has proper dimensions

### Issue: Date range not working
**Symptoms**: No data loads when changing dates
**Solutions**:
1. Verify date format is ISO 8601
2. Check "from" date is before "to" date
3. Ensure dates are within Facebook data retention period
4. Check Facebook account permissions

### Issue: Export not downloading
**Symptoms**: Export button spins but no download
**Solutions**:
1. Check browser console for errors
2. Verify Content-Disposition header
3. Check CORS settings
4. Ensure API endpoint returns proper content type

### Issue: Slow performance
**Symptoms**: Dashboard takes >5 seconds to load
**Solutions**:
1. Check Redis connection
2. Verify cache is working (check Redis keys)
3. Reduce date range
4. Enable data pagination
5. Check Facebook API rate limits

### Issue: Authentication errors
**Symptoms**: 401 Unauthorized errors
**Solutions**:
1. Verify NextAuth session is valid
2. Check Facebook access token hasn't expired
3. Verify Facebook app permissions
4. Re-authenticate with Facebook

## Performance Benchmarks

### Expected Load Times
- Initial page load: <2 seconds
- Chart rendering: <500ms
- Data fetching (cached): <100ms
- Data fetching (uncached): <3 seconds
- Export generation: <2 seconds

### Memory Usage
- Initial: ~50MB
- With charts loaded: ~80MB
- Peak during export: ~120MB

### Network Usage
- Initial analytics data: ~50KB
- With 90 days of data: ~200KB
- Export CSV: ~10-50KB
- Export PDF: ~100-500KB

## Browser Compatibility

### Tested Browsers
- [ ] Chrome 120+
- [ ] Firefox 120+
- [ ] Safari 17+
- [ ] Edge 120+

### Known Issues
- Safari: May have slight rendering differences in D3.js charts
- Firefox: Canvas fallback may be slower
- Edge: Tooltip positioning may vary slightly

## Integration Testing

### Test Scenarios

1. **Complete User Journey**
   - Login → Dashboard → Analytics → Select date range → View charts → Export CSV

2. **Comparison Workflow**
   - Enable comparison mode → Select comparison period → View differences → Interpret trends

3. **Multi-Account Scenario**
   - User with multiple ad accounts → Filter by account → View aggregated data

4. **Campaign Analysis**
   - Filter by specific campaigns → Analyze performance → Identify top performers

## Automated Testing (Future)

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Example Test Cases

```typescript
// Time series chart rendering
describe('TimeSeriesChart', () => {
  it('renders with valid data', () => {
    const data = [
      { date: '2024-01-01', impressions: 1000, clicks: 50, spend: 25, conversions: 2, ctr: 0.05, roas: 2.0 }
    ];
    render(<TimeSeriesChart data={data} metrics={['impressions', 'clicks']} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    // Test implementation
  });
});

// Analytics API
describe('Analytics API', () => {
  it('returns data for valid date range', async () => {
    const response = await fetch('/api/analytics?from=2024-01-01&to=2024-01-31');
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.metrics).toBeDefined();
  });

  it('handles authentication errors', async () => {
    // Test implementation
  });
});
```

## Monitoring

### Metrics to Track
- Page load time
- API response time
- Chart render time
- Cache hit rate
- Error rate
- User engagement (clicks, exports)

### Logging
Check logs for:
```bash
# API errors
grep "Analytics API error" logs/app.log

# Cache performance
grep "facebook:cache:analytics" logs/redis.log

# Export activity
grep "Export" logs/app.log
```

## Support

### Getting Help
1. Check this testing guide
2. Review implementation documentation
3. Check browser console for errors
4. Review server logs
5. Contact development team

### Reporting Issues
When reporting issues, include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console error messages
- Network tab screenshot
- Date range being tested

---

**Last Updated**: 2025-10-16
**Version**: 1.0.0
