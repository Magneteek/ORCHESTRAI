# GHL Integration - Complete Solution

## Current Situation

✅ **What We Have:**
- GHL Private Integration API Key: `pit-54dd9135-0f4d-40ef-b794-709632001970`
- Location ID: `gvbH3doajPohEJ6JL2lH`
- Company ID: `tBwDCerngY01TnfKJD8x`
- Google Places ID: `ChIJb9nDVJ3RekcR5fbYqRKiuVE`

❌ **What We're Missing:**
- `userId` - Required for API posts
- `accountIds` - Social media account IDs (GBP account)

## Problem

The GHL Social Planner API requires:
```json
{
  "accountIds": ["acc_123"],  // ❌ Can't get - endpoint returns 404
  "userId": "user_123",        // ❌ Not in location response
  "type": "post",
  "message": "Content here",
  "media": [],
  "scheduledTime": 1738742400000
}
```

## Solutions

### Option A: Fix API Integration (Requires More Setup)

#### Step 1: Connect Google Business Profile in GHL

1. Go to GHL → **Settings** → **Integrations**
2. Find **Google Business Profile**
3. Click **Connect** and authenticate
4. Note the connected account information

#### Step 2: Get Account IDs

**Try Alternative Endpoints:**

```bash
# Try 1: List all connected accounts
curl -X GET "https://services.leadconnectorhq.com/social-media-posting/gvbH3doajPohEJ6JL2lH/accounts" \
  -H "Authorization: Bearer pit-54dd9135-0f4d-40ef-b794-709632001970" \
  -H "Version: 2021-07-28"

# Try 2: List posts to see structure
curl -X POST "https://services.leadconnectorhq.com/social-media-posting/gvbH3doajPohEJ6JL2lH/posts/list" \
  -H "Authorization: Bearer pit-54dd9135-0f4d-40ef-b794-709632001970" \
  -H "Content-Type: application/json" \
  -H "Version: 2021-07-28" \
  -d '{"limit": 1}'
```

#### Step 3: Get User ID

**Try These:**

```bash
# Try 1: Current user endpoint
curl -X GET "https://services.leadconnectorhq.com/users/me" \
  -H "Authorization: Bearer pit-54dd9135-0f4d-40ef-b794-709632001970" \
  -H "Version: 2021-07-28"

# Try 2: Location users
curl -X GET "https://services.leadconnectorhq.com/locations/gvbH3doajPohEJ6JL2lH/users" \
  -H "Authorization: Bearer pit-54dd9135-0f4d-40ef-b794-709632001970" \
  -H "Version: 2021-07-28"
```

#### Step 4: Update Publish Script

Once you have `accountIds` and `userId`, update `scripts/publish-to-ghl.js`:

```javascript
// NEW FORMAT
const postData = {
  accountIds: ["your_account_id_here"],  // From Step 2
  userId: "your_user_id_here",           // From Step 3
  type: "post",
  message: stripMarkdown(post.content),
  media: [],
  scheduledTime: new Date(post.scheduled_date).getTime()
}

const response = await axios.post(
  `https://services.leadconnectorhq.com/social-media-posting/${credentials.locationId}/posts`,
  postData,
  {
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    }
  }
)
```

---

### Option B: CSV Export + Manual Import ✅ (WORKS NOW)

**Advantages:**
- ✅ Works immediately
- ✅ No API debugging needed
- ✅ Proven GHL import method
- ✅ Full control over schedule

**Steps:**

#### 1. Export from Dashboard

Click **"Export CSV"** button in the UI, or run:
```bash
npm run export
```

#### 2. CSV Format

The export creates a file with:
```csv
ID,Title,Content,Type,Status,Language,Category,Tags,Created At
1,"Kako Beljenje...","Beljenje zob...","whats_new","approved","SL","Educational","Teeth Whitening",2026-02-19
```

#### 3. Convert to GHL Format

GHL expects this CSV structure:
```csv
Date,Time,Account,Message,Image URL,Video URL
2026-02-05,09:00,Google Business Profile,"Post content here",,
2026-02-07,10:30,Google Business Profile,"Next post content",,
```

#### 4. Import to GHL

1. Go to GHL → **Social Planner**
2. Click **Import** or **Bulk Schedule**
3. Upload the CSV file
4. Map columns if needed
5. Confirm import

#### 5. Automated Conversion Script

Create `scripts/export-ghl-csv.js`:

```javascript
import GBPDatabaseManager from '../database/db-manager.js'
import fs from 'fs'

const db = new GBPDatabaseManager()
await db.initialize()

const posts = await db.getPosts({ status: 'approved' })

// GHL CSV format
const headers = ['Date', 'Time', 'Account', 'Message', 'Image URL', 'Video URL']
const rows = posts.map(post => {
  const dateTime = new Date(post.scheduled_date)
  const date = dateTime.toISOString().split('T')[0]
  const time = dateTime.toTimeString().slice(0, 5)

  return [
    date,
    time,
    'Google Business Profile',
    post.content.replace(/\*\*/g, '').replace(/\n/g, ' '),
    '',
    ''
  ]
})

const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
fs.writeFileSync('ghl-import.csv', csv)
console.log('✅ GHL CSV created: ghl-import.csv')
```

---

### Option C: Alternative - Zapier/Make Integration

1. **Create Zap/Make Scenario:**
   - Trigger: Webhook (from our app)
   - Action: Create GHL Social Post

2. **Add Webhook Endpoint** to our app:
```javascript
app.post('/api/trigger-zapier', async (req, res) => {
  const { postId } = req.body
  const post = await db.getPost(postId)

  // Send to Zapier webhook
  await axios.post('https://hooks.zapier.com/hooks/catch/...', {
    content: post.content,
    scheduledDate: post.scheduled_date,
    accountId: 'Google Business Profile'
  })
})
```

---

## Recommendation

**For Immediate Use: Option B (CSV Export)**
- Fastest to implement
- Most reliable
- No API debugging needed

**For Long-term: Option A (Fix API)**
- Fully automated
- Better for high volume
- Requires finding `accountIds` and `userId`

**Quick Win: Option C (Zapier)**
- Middle ground
- Some automation
- No code changes needed

---

## Testing Checklist

- [ ] GBP connected in GHL Settings → Integrations
- [ ] Can manually create posts in GHL Social Planner
- [ ] Export CSV from dashboard works
- [ ] CSV format matches GHL import template
- [ ] Successfully import 1 test post via CSV
- [ ] Scheduled time appears correctly in GHL

---

## Support Resources

- [GHL Social Planner - Advanced CSV](https://help.gohighlevel.com/support/solutions/articles/155000005542)
- [GHL Bulk Schedule](https://help.gohighlevel.com/support/solutions/articles/48001223431)
- [GHL API Documentation](https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post/)
- GHL Support: marketplace@gohighlevel.com

---

## Next Steps

1. **Try Option B first** (CSV export)
2. **Contact GHL support** to ask how to get `accountIds` and `userId` with Private Integration
3. **Check GHL documentation** for account listing endpoints
4. **Consider Zapier** as middle-ground solution

The CSV export is ready to use NOW - no additional coding needed! 🚀
