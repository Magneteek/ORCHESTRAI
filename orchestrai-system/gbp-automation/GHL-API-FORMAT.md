# GoHighLevel Social Planner API - Correct Format

## Error Analysis

From the actual API error we received:
```
property locationId should not exist
property title should not exist
property content should not exist
property postType should not exist
property language should not exist
property scheduledAt should not exist
accountIds must be an array with Account IDs
accountIds should not be empty
media must be an array with media objects or an empty array
Post Type must be one of: post, story, reel
userId must be a string
userId should not be empty
```

## Correct Request Format

```json
{
  "accountIds": ["account_id_1", "account_id_2"],
  "userId": "user_id_here",
  "type": "post",
  "media": [],
  "message": "Your post content here",
  "scheduledTime": 1738742400000
}
```

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `accountIds` | Array | Social media account IDs to post to | `["acc_123", "acc_456"]` |
| `userId` | String | GHL user ID | `"user_abc123"` |
| `type` | String | Must be: `"post"`, `"story"`, or `"reel"` | `"post"` |
| `media` | Array | Media objects or empty array | `[]` or `[{...}]` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `message` | String | Post content/caption | `"Check out our services!"` |
| `scheduledTime` | Number | Unix timestamp in milliseconds | `1738742400000` |
| `tags` | Array | Tags for organization | `["dental", "promotion"]` |
| `category` | String | Category for organization | `"Educational"` |

## Getting Required IDs

### 1. Get Account IDs (Social Media Accounts)

**Endpoint:** `GET /social-media-posting/{locationId}/oauth/accounts`

**Request:**
```bash
curl -X GET \
  "https://services.leadconnectorhq.com/social-media-posting/gvbH3doajPohEJ6JL2lH/oauth/accounts" \
  -H "Authorization: Bearer pit-54dd9135-0f4d-40ef-b794-709632001970" \
  -H "Version: 2021-07-28"
```

**Response:**
```json
{
  "socialMediaAccounts": [
    {
      "id": "acc_google_123",
      "name": "Hiša lepega nasmeha PG",
      "platform": "google",
      "accountId": "acc_google_123"
    }
  ]
}
```

### 2. Get User ID

**Option A:** From location details
```bash
curl -X GET \
  "https://services.leadconnectorhq.com/locations/gvbH3doajPohEJ6JL2lH" \
  -H "Authorization: Bearer pit-54dd9135-0f4d-40ef-b794-709632001970" \
  -H "Version: 2021-07-28"
```

**Option B:** From current user endpoint (if available with Private Integration)

## Complete Working Example

```javascript
// Step 1: Get Account IDs
const accountsResponse = await axios.get(
  `https://services.leadconnectorhq.com/social-media-posting/${locationId}/oauth/accounts`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Version': '2021-07-28'
    }
  }
)

const accountIds = accountsResponse.data.socialMediaAccounts
  .filter(acc => acc.platform === 'google') // Filter for GBP only
  .map(acc => acc.id)

// Step 2: Get User ID from location
const locationResponse = await axios.get(
  `https://services.leadconnectorhq.com/locations/${locationId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Version': '2021-07-28'
    }
  }
)

const userId = locationResponse.data.userId || locationResponse.data.owner?.id

// Step 3: Create Post
const postData = {
  accountIds: accountIds,
  userId: userId,
  type: "post",
  message: stripMarkdown(post.content), // Clean content
  media: [],
  scheduledTime: new Date(post.scheduled_date).getTime() // Unix timestamp in ms
}

const response = await axios.post(
  `https://services.leadconnectorhq.com/social-media-posting/${locationId}/posts`,
  postData,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    }
  }
)
```

## Media Format (if needed)

```json
{
  "media": [
    {
      "url": "https://example.com/image.jpg",
      "type": "image",
      "altText": "Dental clinic"
    }
  ]
}
```

## Platform-Specific Parameters

### Google Business Profile
```json
{
  "google": {
    "postType": "whats_new",  // or "event", "offer"
    "callToAction": {
      "actionType": "LEARN_MORE",
      "url": "https://nasmehpg.si"
    }
  }
}
```

## Next Steps

1. **Test Getting Account IDs:**
   ```bash
   curl -X GET "https://services.leadconnectorhq.com/social-media-posting/gvbH3doajPohEJ6JL2lH/oauth/accounts" \
     -H "Authorization: Bearer pit-54dd9135-0f4d-40ef-b794-709632001970" \
     -H "Version: 2021-07-28"
   ```

2. **Update publish script** with correct format

3. **Test with one post** to verify it works

## Sources

- [Create post | HighLevel API](https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post/index.html)
- [Social Media Posting API | HighLevel API](https://marketplace.gohighlevel.com/docs/ghl/social-planner/social-media-posting-api/index.html)
- [Public APIs for Social Planner | HighLevel Changelog](https://ideas.gohighlevel.com/changelog/public-apis-are-now-available-for-social-planner)
- [Social Planner - Advanced CSV for Bulk Scheduling](https://help.gohighlevel.com/support/solutions/articles/155000005542-social-planner-advanced-csv-for-bulk-scheduling)
