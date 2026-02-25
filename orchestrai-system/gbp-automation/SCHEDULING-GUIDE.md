# GBP Post Scheduling Guide

## Overview

The GBP Automation system uses **GoHighLevel (GHL) for scheduling**. When you approve and publish posts, they are sent to GHL with a schedule timestamp, and GHL handles the actual publishing at the scheduled time.

## Workflow

```
┌─────────────┐
│ Draft Post  │ ← Generated or imported
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Review in   │ ← Edit title, content, schedule date
│ Dashboard   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Approve     │ ← Status: draft → approved
│ Post        │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Run Publish │ ← npm run publish
│ Script      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Send to GHL │ ← With scheduledAt timestamp
│ via API     │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Immediate   │    │ Scheduled   │    │ Failed      │
│ Publish     │    │ in GHL      │    │ (Retry)     │
│ Status:     │    │ Status:     │    │ Status:     │
│ published   │    │ scheduled   │    │ failed      │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Status Flow

| Status     | Meaning                                           |
|------------|---------------------------------------------------|
| `draft`    | Post created, not approved                        |
| `approved` | Reviewed and ready to publish                     |
| `scheduled`| Sent to GHL, will publish at scheduled time       |
| `published`| Posted immediately (no schedule date)             |
| `failed`   | API error, check error message and retry          |

## JSON Structure for GHL API

### Request Payload

```json
{
  "locationId": "your_ghl_location_id",
  "title": "Zakaj je beljenje zob tako priljubljeno?",
  "content": "Ali ste vedeli, da je beljenje zob eden najbolj iskanih estetskih posegov v Sloveniji?\n\n• Belina zob vpliva na samozavest\n• Zobje se zaradi staranja in hrane potemnijo\n• Profesionalno beljenje je varno in učinkovito",
  "postType": "whats_new",
  "language": "sl",
  "scheduledAt": 1738742400
}
```

### Field Details

| Field         | Type     | Required | Description                                      |
|---------------|----------|----------|--------------------------------------------------|
| locationId    | string   | Yes      | Your GHL location ID                             |
| title         | string   | No       | Post title (optional for some platforms)         |
| content       | string   | Yes      | Post content (markdown stripped)                 |
| postType      | string   | Yes      | Type: `whats_new`, `event`, `offer`, `product`   |
| language      | string   | Yes      | Language code: `en`, `sl`, `de`, etc.            |
| scheduledAt   | integer  | No       | Unix timestamp (seconds). Omit for immediate     |

### scheduledAt Format

**Database:** `2026-02-05 09:00:00` (SQLite datetime)
**API:** `1738742400` (Unix timestamp in seconds)

**Conversion:**
```javascript
const scheduledDate = new Date('2026-02-05 09:00:00')
const scheduledAt = Math.floor(scheduledDate.getTime() / 1000)
```

## API Endpoint

```
POST https://services.leadconnectorhq.com/social-media-posting/{locationId}/posts
```

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
Version: 2021-07-28
```

## Response

### Success (201 Created)
```json
{
  "id": "post_abc123xyz",
  "status": "scheduled",
  "scheduledAt": 1738742400,
  "platforms": ["google_business_profile"]
}
```

### Error (400/422)
```json
{
  "error": "Invalid scheduledAt timestamp",
  "message": "Scheduled time must be in the future"
}
```

## Environment Variables

Create `.env` file:
```env
GHL_ACCESS_TOKEN=your_access_token_here
GHL_LOCATION_ID=your_location_id_here
```

## Publishing Command

```bash
# Publish all approved posts
npm run publish

# This will:
# 1. Load approved posts from database
# 2. Strip markdown from content
# 3. Convert schedule dates to Unix timestamps
# 4. Send to GHL API
# 5. Update status to 'scheduled' or 'published'
# 6. Display results
```

## Example Output

```
🚀 Publishing approved posts to GoHighLevel

✅ GHL credentials loaded
   Location ID: abc123

📋 Found 3 approved posts

📤 Publishing: "Zakaj je beljenje zob tako priljubljeno?"
   ID: post-001
   Type: whats_new
   Language: SL
   ✅ Scheduled successfully
   GHL Post ID: ghl_post_xyz789
   📅 Scheduled for: 2026-02-05 09:00:00

📤 Publishing: "Ortodontska zdravljenja za odrasle"
   ID: post-002
   Type: whats_new
   Language: SL
   ✅ Published successfully
   GHL Post ID: ghl_post_abc456

✨ Publishing complete!
   Sent to GHL: 2
   Failed: 0

🎯 Next steps:
   1. Check GHL Social Planner:
      - Immediate posts will be published now
      - Scheduled posts will appear in calendar
   2. Review failed posts in dashboard
   3. Retry failed posts after fixing issues
```

## Troubleshooting

### Error: "Invalid access token"
- Check `.env` file has correct `GHL_ACCESS_TOKEN`
- Token may have expired, regenerate in GHL settings

### Error: "Location not found"
- Verify `GHL_LOCATION_ID` matches your GHL location
- Check location permissions in GHL

### Error: "Scheduled time must be in the future"
- Check post's `scheduled_date` is not in the past
- Update schedule date in dashboard

### Posts not appearing in GHL
- Check GHL Social Planner calendar view
- Verify location permissions
- Check GHL account is connected to Google Business Profile

## Best Practices

1. **Review before approval:** Always check content in dashboard first
2. **Stagger schedules:** Space posts 2-3 days apart for better engagement
3. **Peak times:** Schedule for 9 AM - 12 PM on weekdays
4. **Test with immediate:** First post should publish immediately to verify connection
5. **Monitor GHL:** Check Social Planner calendar after publishing

## Advanced: Webhook Integration (Optional)

To automatically update post status when GHL publishes:

1. Set up webhook in GHL: `https://your-domain.com/webhooks/ghl-post-published`
2. Listen for `post.published` event
3. Update database status from `scheduled` to `published`

```javascript
// Example webhook handler
app.post('/webhooks/ghl-post-published', async (req, res) => {
  const { postId, status } = req.body

  await db.run(`
    UPDATE posts
    SET status = ?
    WHERE ghl_post_id = ?
  `, ['published', postId])

  res.sendStatus(200)
})
```

## References

- [GoHighLevel API Documentation](https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post/index.html)
- [Social Planner Support](https://help.gohighlevel.com/support/solutions/articles/155000005063)
- [GHL Changelog: Social Planner API](https://ideas.gohighlevel.com/changelog/public-apis-are-now-available-for-social-planner)
