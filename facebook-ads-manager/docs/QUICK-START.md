# Facebook Ads Manager - Quick Start Guide

**Version:** 1.0.0
**Last Updated:** January 2026
**Purpose:** Fast reference for common tasks

---

## Table of Contents

1. [For Admins](#for-admins)
2. [For Users](#for-users)
3. [Common Tasks Quick Reference](#common-tasks-quick-reference)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Support Contact](#support-contact)

---

## For Admins

### Create Global Template in 5 Steps

**Time:** 15 minutes

1. **Navigate**
   ```
   Template Management → Create Global Template
   ```

2. **Basic Info**
   ```yaml
   Name: "New Patient Special - $99"
   Description: "Attract new dental patients with proven offer"
   Category: general-dentist
   Objective: OUTCOME_LEADS
   ```

3. **Add Dynamic Fields**
   ```javascript
   // Essential fields:
   - company_name (text, required)
   - offer_price (text, required)
   - business_location (text, required)
   - phone_number (text, required)
   - website_url (url, required)
   ```

4. **Create Ad Copy**
   ```javascript
   Headline: "{{offer_price}} New Patient Special"
   Text: "{{company_name}} welcomes new patients..."
   ```

5. **Set Defaults**
   ```yaml
   Budget: $50/day
   Location: US
   Age: 25-65
   Placements: Facebook Feed, Instagram Feed
   ```

**Click Save → Template live immediately**

---

### View Analytics in 3 Clicks

**Time:** 30 seconds

```
1. Click "Analytics Dashboard" in nav
2. Select date range (default: Last 30 days)
3. View metrics + charts
```

**Key Metrics to Check:**
- Total Templates
- Active Campaigns
- Total Spend
- Avg ROAS

**Drill Down:**
- Click template row → Expand for per-account breakdown
- Sort by ROAS → Find top performers
- Filter by category → Focus on specific vertical

---

### Invite User in 2 Minutes

**Time:** 2 minutes

```
1. User Management → Invite User button
2. Enter:
   - Email: user@example.com
   - Role: USER (or ADMIN)
   - ✓ Send welcome email
3. Click Send Invitation
```

**User receives:**
- Invitation link (expires in 7 days)
- Temporary password
- Link to User Guide
- Getting started instructions

---

## For Users

### Launch Campaign in 4 Steps

**Time:** 10-15 minutes

#### Step 1: Select Template (2 min)
```
Dashboard → Launch Campaign → Browse templates
→ Filter by category → Click "Use Template"
```

**Look for:**
- 🌟 Featured badge (top performer)
- High ROAS (>3.0x)
- Many uses (20+)
- Relevant to your service

#### Step 2: Fill Fields (5 min)
```
Required fields (marked with red *):
✓ company_name: "Your Practice Name"
✓ offer_price: "$99" or "FREE"
✓ business_location: "Your City"
✓ phone_number: "(555) 123-4567"
✓ website_url: "https://www.yoursite.com"
```

**Pro Tips:**
- Phone: Use main practice number
- URL: Test before submitting
- Location: Be specific (neighborhood + city)
- Preview: Check how it looks as you type

#### Step 3: Configure Targeting (3 min)
```yaml
Campaign Name: "New Patient Special - March 2026"
Location: Your city + 15 mile radius
Age Range: 25-65 (adults)
Daily Budget: $50 (minimum $30)
Schedule: All day, every day (recommended)
```

**Budget Guide:**
- General Dentist: $40-60/day
- Orthodontist: $60-100/day
- B2B Dental Supply: $75-150/day

#### Step 4: Preview & Launch (2 min)
```
1. Review ad preview (desktop + mobile)
2. Verify all fields filled correctly
3. Check targeting summary
4. Click "Launch Campaign"
5. Wait for Facebook approval (15-30 min)
```

**Done!** Campaign starts running within 1 hour.

---

### Check Campaign Performance

**Time:** 2 minutes

```
1. Click "Campaigns" in navigation
2. View your active campaigns table
3. Check key metrics:
   - Status (Active/Paused)
   - Spend (daily/total)
   - Leads (conversions)
   - ROAS (return on spend)
```

**Quick Health Check:**

| Metric | Good | Concerning |
|--------|------|------------|
| ROAS | >3.0x | <2.0x |
| Cost/Lead | $30-50 | >$80 |
| CTR | >1.5% | <1.0% |
| Status | Active | Paused/Issues |

**Actions:**
- ✓ Good: Keep running, consider increasing budget
- ⚠️ Concerning: Give it 7-10 days, then optimize or pause

---

### Get Help

**Time:** Varies

**Quick Answers:**
```
1. Click "?" icon (top-right)
2. Search knowledge base
3. Watch tutorial videos
```

**Contact Support:**
```
Email: support@yourcompany.com
Subject: [Help] Your Issue
Include: Campaign name, screenshots
Response: 4-24 hours
```

**Live Chat:**
```
Click chat icon (bottom-right)
Available: Mon-Fri 9am-5pm MST
Avg response: 5 minutes
```

---

## Common Tasks Quick Reference

### Navigation Paths

| Task | Path | Role |
|------|------|------|
| **Browse templates** | Templates → Browse | All |
| **Launch campaign** | Dashboard → Launch Campaign | All |
| **View campaigns** | Campaigns | All |
| **View analytics** | Analytics | All |
| **Create template** | Template Management → Create | Admin |
| **View cross-account analytics** | Analytics Dashboard | Admin |
| **Invite user** | User Management → Invite | Admin |
| **Edit template** | Template Management → Edit | Admin |

---

### Campaign Management

#### Pause Campaign
```
Campaigns → Find campaign → Pause button → Confirm
Effect: Immediate (ads stop showing, spend stops)
```

#### Resume Campaign
```
Campaigns → Filter: Paused → Find campaign → Resume button → Confirm
Effect: Ads start showing within 15 minutes
```

#### Adjust Budget
```
Campaigns → Click campaign name → Edit Budget → Enter new amount → Save
Guidelines:
  - Increase by 20-30% at a time
  - Wait 3-5 days between changes
  - Decrease by 20-50% if needed
```

#### View Detailed Analytics
```
Campaigns → Click campaign name → View full analytics page
Shows: Impressions, clicks, conversions, spend over time, charts
```

---

### Template Management (Admins Only)

#### Edit Template
```
Template Management → Find template → Edit button
Can change: Name, description, fields, ad copy, targeting
Warning: Changes affect all users
```

#### Delete Template
```
Template Management → Find template → Delete button → Confirm
Shows: Usage stats, active campaigns, accounts using
Cannot undo - consider pausing instead
```

#### Mark Template as Featured
```
Template Management → Edit template → ✓ Mark as Featured → Save
Effect: Appears at top of marketplace, highlighted for users
```

#### View Template Performance
```
Analytics Dashboard → Find template in table
Shows: ROAS, spend, accounts using, times used
Click row → Expand for per-account breakdown
```

---

### User Management (Admins Only)

#### Change User Role
```
User Management → Find user → Change Role → Select role → Confirm
USER → ADMIN: Gains template management, analytics access
ADMIN → USER: Loses admin permissions (keeps own campaigns)
```

#### Deactivate User
```
User Management → Find user → More Actions → Deactivate → Confirm
Effect: User logged out immediately, cannot access platform
Can reactivate later - data preserved
```

#### Resend Invitation
```
User Management → Filter: Invited → Find user → Resend button
Sends new invitation email, resets 7-day expiry
```

---

### Analytics Quick Checks

#### Check Template Performance (Admin)
```
Analytics Dashboard → Template Performance table
Sort by: ROAS (descending) → See top performers
Look for: ROAS >3.5x, high usage, multiple accounts
```

#### Compare Templates
```
Analytics Dashboard → Select templates (checkboxes)
→ Compare button → View side-by-side metrics
Compare: ROAS, CTR, CPC, spend, conversion rate
```

#### Export Report
```
Analytics → Export button → Select format (CSV/PDF)
→ Choose date range → Click Download
Use for: Monthly reports, client presentations
```

#### Filter by Date Range
```
Analytics Dashboard → Date Range dropdown
Presets: 7 days, 30 days, 90 days, custom
Custom: Click dates → Select start/end → Apply
```

---

## Keyboard Shortcuts

### Universal (Mac/Windows)

| Action | Mac | Windows |
|--------|-----|---------|
| Search templates | `Cmd+K` | `Ctrl+K` |
| Launch campaign | `Cmd+L` | `Ctrl+L` |
| View campaigns | `Cmd+1` | `Ctrl+1` |
| View analytics | `Cmd+2` | `Ctrl+2` |
| Template management (admin) | `Cmd+3` | `Ctrl+3` |
| User management (admin) | `Cmd+4` | `Ctrl+4` |
| Refresh data | `Cmd+R` | `Ctrl+R` |
| Help | `Cmd+/` | `Ctrl+/` |
| Save (in forms) | `Cmd+S` | `Ctrl+S` |

### Navigation Shortcuts

| Location | Shortcut |
|----------|----------|
| Dashboard | `G then D` |
| Templates | `G then T` |
| Campaigns | `G then C` |
| Analytics | `G then A` |
| Settings | `G then S` |

---

## Quick Troubleshooting

### Campaign Not Showing Ads

**Check:**
1. Status = Active? (not paused or in review)
2. Budget sufficient? (min $30/day)
3. Facebook connection? (Settings → Integrations)
4. Ad approved? (Check notifications)

**Fix:**
- If in review: Wait 30 minutes
- If paused: Click Resume
- If budget low: Increase to $30+
- If ad rejected: Check notification, edit, resubmit

---

### High Cost Per Lead

**Symptoms:** Cost >$80 per lead

**Quick Fixes:**
1. Check CTR:
   - If <1.0%: Try different template (creative issue)
2. Check targeting:
   - If too narrow: Expand radius +5 miles
3. Check spend:
   - If <$200: Give it more time (need data)

**When to Pause:** Cost >$100 after $300 spent

---

### Fields Won't Validate

**Common Errors:**

```
"Invalid URL format"
→ Fix: Use https:// not http://

"Text too long"
→ Fix: Shorten to under max length

"Phone invalid"
→ Fix: Include area code (XXX) XXX-XXXX

"Required field"
→ Fix: Fill in the field
```

---

## Benchmarks at a Glance

### Performance Targets

```yaml
ROAS (Return on Ad Spend):
  Excellent: >4.0x
  Good: 3.0-4.0x
  Break-even: 2.0-3.0x
  Poor: <2.0x

Cost Per Lead:
  Excellent: $20-30
  Good: $30-50
  Average: $50-80
  High: >$80

Click-Through Rate (CTR):
  Excellent: >2.0%
  Good: 1.5-2.0%
  Average: 1.0-1.5%
  Low: <1.0%

Cost Per Click (CPC):
  Excellent: $0.50-1.00
  Good: $1.00-2.00
  Average: $2.00-4.00
  High: >$4.00
```

### Budget Recommendations

```yaml
General Dentist:
  Daily Budget: $40-60
  Expected Leads/Month: 20-30
  Cost Per Lead: $35-50

Orthodontist:
  Daily Budget: $60-100
  Expected Leads/Month: 15-25
  Cost Per Lead: $75-125

Dental Supply B2B:
  Daily Budget: $75-150
  Expected Leads/Month: 10-20
  Cost Per Lead: $150-300
```

---

## Support Contact

### Primary Support

```yaml
Email: support@yourcompany.com

Subject Format: [Role] - Issue Description
Examples:
  - [User] - Campaign not delivering
  - [Admin] - Template performance question

Response Times:
  - Critical (system down): 1 hour
  - High (feature broken): 4 hours
  - Medium (help needed): 1 business day
  - Low (general question): 2 business days
```

### Live Chat

```yaml
Hours: Monday-Friday, 9am-5pm MST
Access: Click chat icon (bottom-right corner)
Average Response: 5 minutes
Best For: Quick questions, immediate help
```

### Phone Support

```yaml
Phone: (555) 123-4567
Hours: Monday-Friday, 9am-5pm MST
Use For: Urgent issues, complex problems
```

### Emergency Contact

```yaml
After Hours: emergency@yourcompany.com
Phone: (555) 123-4567
Use For: Critical system outages only
```

---

## Resources

### Documentation

- **User Guide** - `/docs/USER-GUIDE.md` (comprehensive user documentation)
- **Admin Guide** - `/docs/ADMIN-GUIDE.md` (admin features and best practices)
- **API Documentation** - `/docs/API.md` (for developers)
- **This Guide** - `/docs/QUICK-START.md` (quick reference)

### Training

- **Video Tutorials** - https://videos.yourcompany.com
- **Knowledge Base** - https://help.yourcompany.com
- **Monthly Webinars** - Last Wednesday, 2pm MST
- **Office Hours** - First Tuesday, 2pm MST (admins only)

### Community

- **Slack Channels:**
  - `#facebook-ads-users` - General questions
  - `#facebook-ads-help` - Support requests
  - `#facebook-ads-tips` - Best practices sharing

- **Newsletter:**
  - Weekly tips and case studies
  - Subscribe: newsletter@yourcompany.com

---

## Tips & Tricks

### Pro Tips for Users

**Launching Campaigns:**
- ✓ Start with featured templates (proven performers)
- ✓ Use consistent naming: "Service - Month Year"
- ✓ Test phone number before launching
- ✓ Preview on mobile (where most people see ads)

**Managing Campaigns:**
- ✓ Check performance every 2-3 days (not daily)
- ✓ Wait 7-10 days before making major changes
- ✓ Increase budget gradually (20-30% at a time)
- ✓ Pause if cost/lead >$100 after $300 spent

**Optimizing Performance:**
- ✓ Track lead source (ask "How did you hear about us?")
- ✓ Calculate actual ROAS (patient lifetime value)
- ✓ Run campaigns continuously (not on/off)
- ✓ Give Facebook's algorithm time to optimize (14 days)

### Pro Tips for Admins

**Creating Templates:**
- ✓ Test as organization template first (2 weeks)
- ✓ Use simple, clear field names
- ✓ Provide helpful field descriptions
- ✓ Include usage examples in template description

**Managing Templates:**
- ✓ Review analytics monthly
- ✓ Feature templates with ROAS >3.5x
- ✓ Update underperforming templates
- ✓ Archive outdated templates (don't delete)

**Analyzing Performance:**
- ✓ Look for consistent performers (not one-time spikes)
- ✓ Check per-account breakdown for outliers
- ✓ Compare similar templates to find patterns
- ✓ Share insights with users (newsletter, Slack)

---

## Cheat Sheet

### Campaign Lifecycle

```
Created → Pending Review → Active → Monitored → Optimized → Paused/Completed
         (15-30 min)    (ongoing)  (7-10 days)  (as needed)
```

### Decision Tree: Is My Campaign Performing Well?

```
ROAS >3.0x AND Cost/Lead <$60?
├─ YES → Keep running, consider increasing budget
└─ NO → Has it run for 7+ days with $200+ spend?
    ├─ YES → Optimize or pause
    └─ NO → Give it more time, continue monitoring
```

### When to Make Changes

```yaml
Day 1-7:
  Action: Monitor only
  Don't: Make any changes
  Why: Facebook is learning

Day 7-14:
  Action: Review metrics
  Consider: Small targeting adjustments
  Why: Enough data to see trends

Day 14+:
  Action: Optimize or scale
  Consider: Budget increase, creative refresh
  Why: Campaign fully optimized
```

---

**Document Version:** 1.0.0
**Last Updated:** January 2026
**Print-Friendly:** Yes (single-sided, 10 pages)
**Maintained by:** ORCHESTRAI Documentation Team

For detailed information, see:
- **User Guide:** `/docs/USER-GUIDE.md`
- **Admin Guide:** `/docs/ADMIN-GUIDE.md`
- **API Documentation:** `/docs/API.md`

**Feedback:** documentation@yourcompany.com
