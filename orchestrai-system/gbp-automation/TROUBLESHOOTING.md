# GBP Automation - Troubleshooting Guide

## Publishing to GoHighLevel Issues

### Common Problems

#### 1. **Posts Stuck in "Failed" Status**

**Symptoms:**
- Posts show "failed" status after trying to publish
- No retry button available
- Can't re-approve posts

**Solution:**
✅ **FIXED** - Now you can:
- Click "Reset to Approved" button in the table
- Or open the post modal and click "Reset to Approved"
- Error messages now display in the modal

#### 2. **GHL API Connection Errors**

**Likely Causes:**
1. **Wrong API Endpoint** - The endpoint might have changed
2. **Google Business Profile Not Connected** - GHL needs GBP linked
3. **API Permissions** - Private Integration needs correct scopes
4. **Invalid Credentials** - Token expired or incorrect

**Current Configuration:**
```
Endpoint: https://services.leadconnectorhq.com/social-media-posting/{locationId}/posts
Location ID: gvbH3doajPohEJ6JL2lH
API Token: pit-54dd9135-0f4d-40ef-b794-709632001970
```

**How to Fix:**

1. **Verify GBP Connection in GHL:**
   - Go to GHL → Settings → Integrations
   - Check if Google Business Profile is connected
   - Re-authenticate if needed

2. **Test API Endpoint:**
   ```bash
   curl -X POST \
     https://services.leadconnectorhq.com/social-media-posting/gvbH3doajPohEJ6JL2lH/oauth/accounts \
     -H "Authorization: Bearer pit-54dd9135-0f4d-40ef-b794-709632001970" \
     -H "Version: 2021-07-28"
   ```

3. **Check GHL Documentation:**
   - Visit: https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post/
   - Verify endpoint URL and request format
   - Check if API version changed

4. **Alternative: Manual CSV Export**
   If GHL API doesn't work, use CSV export:
   ```bash
   npm run export
   ```
   Then import manually in GHL Social Planner or use Quartz

## Error Display

**New Features:**
- ✅ Error messages now show in post modal
- ✅ "Reset to Approved" button for failed posts
- ✅ Detailed error messages with HTTP status codes
- ✅ Retry publishing after fixing issues

## Testing Publishing

**Test with a Single Post:**
1. Approve one post
2. Click "Publish to GHL"
3. Check error message if it fails
4. Fix the issue based on the error
5. Reset to approved and retry

## Getting Help

**Check Logs:**
```bash
tail -f /tmp/gbp-server.log
```

**Check Database:**
```bash
sqlite3 database/gbp-posts.db "SELECT id, title, status, publish_error FROM posts WHERE status = 'failed';"
```

**Common Error Messages:**

| Error | Cause | Solution |
|-------|-------|----------|
| "404 Not Found" | Wrong endpoint or location ID | Verify endpoint URL and location ID |
| "401 Unauthorized" | Invalid API token | Regenerate Private Integration token |
| "403 Forbidden" | Missing permissions | Add social-planner.write scope |
| "422 Unprocessable" | Invalid post data | Check post format matches GHL requirements |
| "ECONNREFUSED" | Network issue | Check internet connection |

## Next Steps

1. **Check GBP Connection** in GHL first
2. **Test with one post** to see specific error
3. **Check GHL documentation** for latest API format
4. **Use CSV export** as backup method if API fails
