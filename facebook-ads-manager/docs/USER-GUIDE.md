# Facebook Ads Manager - User Guide

**Version:** 1.0.0
**Last Updated:** January 2026
**Audience:** USER role - dental industry professionals launching Facebook ad campaigns

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Launching Campaigns from Templates](#launching-campaigns-from-templates)
3. [Managing Your Campaigns](#managing-your-campaigns)
4. [Understanding Analytics](#understanding-analytics)
5. [Tips & Best Practices](#tips--best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Logging In

1. Go to your organization's Facebook Ads Manager URL
2. Enter your email address (provided in your invitation)
3. Enter your password
4. Click **Sign In**

First time logging in? You'll be prompted to:
- Set a secure password
- Complete your profile (name, phone)
- Connect your Facebook Ad Account (optional - can do later)

[Screenshot: Login Page]

### Dashboard Overview

Your dashboard is your command center for managing Facebook advertising campaigns.

**Key Sections:**

**Templates** - Browse and search proven ad templates
- View template marketplace
- Filter by category (General Dentist, Orthodontist, B2B)
- See performance metrics (ROAS, usage count)
- Preview templates before using

**Campaigns** - Your active and past campaigns
- View campaign status (Active, Paused, Completed)
- Monitor performance metrics
- Adjust budgets
- Pause or resume campaigns

**Analytics** - Your campaign performance data
- View key metrics (spend, leads, ROAS)
- Track trends over time
- Compare campaign performance
- Export reports

[Screenshot: User Dashboard]

### Understanding Templates

**What is a template?**

A template is a pre-built ad campaign created by your admin team. Templates include:
- Proven ad copy that converts
- Professional creative guidelines
- Optimized targeting settings
- Recommended budgets
- Dynamic fields for personalization

**Why use templates?**

✓ **Save time** - Launch campaigns in 10 minutes instead of hours
✓ **Better results** - Templates are tested and optimized
✓ **Less risk** - Avoid common mistakes and wasted budget
✓ **Easy customization** - Add your practice details without starting from scratch

**Example:**

Instead of creating a new patient offer from scratch, use the "New Patient Special" template and simply fill in:
- Your practice name
- Your offer price ($99, $149, FREE, etc.)
- Your location
- Your phone number
- Your website

The template handles everything else: ad copy structure, targeting, bidding, and placements.

### Your Permissions

As a USER, you can:
- ✓ Browse all available templates
- ✓ Launch campaigns from templates
- ✓ View your own campaign performance
- ✓ Manage your campaigns (pause, resume, adjust budget)
- ✓ Export your campaign reports

You cannot:
- ✗ Create or edit templates (contact admin if you need custom template)
- ✗ View other users' campaigns
- ✗ Access organization-wide analytics
- ✗ Invite or manage other users

Need more access? Contact your administrator about upgrading to ADMIN role.

---

## Launching Campaigns from Templates

### The 4-Step Campaign Launch Wizard

Launching a campaign is easy with our step-by-step wizard. The entire process takes 10-15 minutes.

[Screenshot: 4-Step Progress Indicator]

---

### Step 1: Select Template

#### Browsing the Template Marketplace

When you click **Launch Campaign**, you'll see the template marketplace.

[Screenshot: Template Marketplace Grid]

**What you'll see:**

Each template shows:
- **Template name** - Descriptive title
- **Category badge** - General Dentist, Orthodontist, or B2B
- **Description** - What the template is for
- **Performance metrics:**
  - Average ROAS (e.g., 3.5x)
  - Times used (e.g., 45 campaigns)
  - Accounts using (e.g., 12 practices)
- **Featured badge** - Top-performing templates

#### Using Search and Filters

**Search Bar:**
Type keywords to find templates:
- "new patient" - New patient acquisition offers
- "invisalign" - Invisalign promotions
- "emergency" - Emergency dental services
- "whitening" - Teeth whitening offers

**Category Filter:**
- **All Categories** - Show everything
- **General Dentist** - Family dental, general services
- **Orthodontist** - Braces, Invisalign, orthodontics
- **Dental Supply B2B** - For dental supply companies

**Sort Options:**
- **Most Popular** - Templates used most often
- **Highest ROAS** - Best-performing templates
- **Newest** - Recently created templates

#### Understanding Template Metrics

**ROAS (Return on Ad Spend):**
- Shows how much revenue is generated per dollar spent
- Example: 3.5x ROAS = $3.50 revenue for every $1 spent
- **Excellent:** >4.0x
- **Good:** 3.0-4.0x
- **Average:** 2.0-3.0x
- **Needs work:** <2.0x

**Times Used:**
- How many campaigns have been launched with this template
- Higher number = more proven and tested
- Look for templates with 20+ uses

**Accounts Using:**
- How many different practices use this template
- Shows template versatility
- 10+ accounts = widely trusted

#### Viewing Template Previews

Before selecting, click **Preview** to see:

1. **Ad Copy Preview:**
   - Headline example
   - Body text example
   - Call-to-action button

2. **Dynamic Fields Required:**
   - List of fields you'll need to fill
   - Field types (text, number, URL)
   - Required vs optional fields

3. **Targeting Summary:**
   - Age range
   - Location radius
   - Interests targeted

4. **Budget Recommendation:**
   - Suggested daily budget
   - Expected cost per lead

[Screenshot: Template Preview Modal]

#### Identifying Dynamic Field Requirements

Dynamic fields are placeholders you'll customize with your practice information.

**Common fields you'll see:**

| Field Name | What to Provide | Example |
|------------|----------------|---------|
| company_name | Your practice name | "Bright Smile Dental" |
| offer_price | Your special offer price | "$99" or "FREE" |
| business_location | Your city/neighborhood | "Downtown Denver" |
| phone_number | Your practice phone | "(555) 123-4567" |
| website_url | Your website | "https://www.brightsmile.com" |
| years_in_business | How long you've been open | "15" |
| offer_description | What's included in offer | "exam, x-rays, and cleaning" |

**Field icons:**
- 🔴 Red asterisk (*) = Required (must fill in)
- ⚪ No asterisk = Optional (can leave blank)

#### Selecting Your Template

Once you've found the right template:

1. Review the template details
2. Check the performance metrics
3. View the preview to confirm it fits your needs
4. Click **Use Template** button

You'll advance to Step 2: Fill Dynamic Fields.

---

### Step 2: Fill Dynamic Fields

Now you'll personalize the template with your practice information.

[Screenshot: Dynamic Fields Form]

#### What Are Dynamic Fields?

Dynamic fields are placeholders in the template that get replaced with your specific information.

**Example:**

Template text:
```
"{{company_name}} is offering {{offer_price}} for new patients!
Call {{phone_number}} to schedule."
```

After you fill fields:
```
"Bright Smile Dental is offering $99 for new patients!
Call (555) 123-4567 to schedule."
```

#### Filling in Required Fields

Required fields have a red asterisk (*) and MUST be filled before you can continue.

**Tips for each field type:**

**Company Name**
```yaml
Field: company_name
Example: "Bright Smile Dental Associates"
Tips:
  - Use your official business name
  - Match how it appears on your website
  - Keep professional (avoid nicknames)
  - Max 50 characters
```

**Offer Price**
```yaml
Field: offer_price
Example: "$99" or "FREE" or "$149"
Tips:
  - Include $ symbol if desired
  - Use exact price from your promotion
  - Can say "FREE" for free offers
  - Keep it simple and clear
```

**Business Location**
```yaml
Field: business_location
Example: "Downtown Denver" or "Boulder, CO"
Tips:
  - Use city and/or neighborhood
  - Match targeting location
  - Be specific enough for locals
  - Avoid full address in ad copy
```

**Phone Number**
```yaml
Field: phone_number
Example: "(555) 123-4567"
Tips:
  - Use your main practice line
  - Include area code
  - Format: (XXX) XXX-XXXX preferred
  - Make sure number is correct!
```

**Website URL**
```yaml
Field: website_url
Example: "https://www.brightsmile.com"
Tips:
  - Must start with https://
  - Use your main homepage or landing page
  - Make sure page loads and looks good
  - Test URL before submitting
```

**Offer Description**
```yaml
Field: offer_description
Example: "comprehensive exam, digital x-rays, and professional cleaning"
Tips:
  - Be specific about what's included
  - Use benefit-focused language
  - Keep concise (under 100 characters)
  - Match your actual service offering
```

**Years in Business** (often optional)
```yaml
Field: years_in_business
Example: "15"
Tips:
  - Just the number, no "years" text
  - Round to nearest year
  - If under 1 year, use "1"
  - Leave blank if very new practice
```

#### Understanding Field Validation

The system checks your inputs to prevent errors:

**Text Fields:**
- Cannot be empty (if required)
- Must be under max length
- May check for special characters

**Number Fields:**
- Must be a valid number
- Must be within min/max range
- No letters or symbols

**URL Fields:**
- Must be valid URL format
- Must start with http:// or https://
- System will test if URL is reachable

**Validation Errors:**

If you see a red error message under a field:
- Read the error carefully
- Fix the issue (e.g., add https://)
- Error will clear when valid

[Screenshot: Field Validation Error]

Common errors:
- "This field is required" → Fill it in
- "Invalid URL format" → Check for https://
- "Number must be positive" → Use positive number
- "Text is too long" → Shorten your text

#### Using Placeholders to Preview

As you fill in fields, you can see how they'll appear in your ad:

1. Fill in a field
2. Look at the preview panel (right side)
3. See your text replace the placeholder
4. Adjust wording if needed

[Screenshot: Live Preview Panel]

**Preview shows:**
- Ad headline with your text
- Body copy with your details
- How ad will look on Facebook/Instagram

**Not happy with how it looks?**
- Adjust your field values
- Try different wording
- Keep it concise and clear

#### Common Field Types and Examples

**Dental Practice Examples:**

**General Dentist:**
```yaml
company_name: "Family Dental Care"
offer_price: "$99"
offer_description: "new patient exam, x-rays & cleaning"
business_location: "Highlands Ranch, CO"
phone_number: "(303) 555-1234"
website_url: "https://www.familydentalcare.com"
years_in_business: "20"
```

**Orthodontist:**
```yaml
company_name: "Modern Orthodontics"
offer_price: "FREE"
offer_description: "Invisalign consultation & treatment plan"
business_location: "Cherry Creek, Denver"
phone_number: "(720) 555-5678"
website_url: "https://www.modernortho.com/invisalign"
years_in_business: "12"
```

**Dental Supply Company:**
```yaml
company_name: "Denver Dental Supply Co."
offer_price: "20% OFF"
offer_description: "bulk orders of impression materials"
business_location: "Colorado (ships nationwide)"
phone_number: "(877) 555-9999"
website_url: "https://www.dentalsupp.com/promo"
years_in_business: "35"
```

#### Finishing Step 2

Once all required fields are filled and valid:
1. Review your entries one more time
2. Check the preview to see how ad looks
3. Click **Next: Configure Targeting & Budget**

You'll advance to Step 3.

---

### Step 3: Configure Targeting & Budget

Now you'll set who sees your ads and how much to spend.

[Screenshot: Targeting & Budget Configuration]

#### Setting Campaign Name

First, give your campaign a descriptive name:

```yaml
Campaign Name: "New Patient Special - March 2026"

Tips:
  - Include offer type
  - Include date/month
  - Keep it memorable
  - Use consistent naming scheme
```

**Good Examples:**
- "New Patient $99 - Spring 2026"
- "Invisalign Promo - Q1 2026"
- "Emergency Dental - Always On"

**Poor Examples:**
- "Test Campaign"
- "Campaign 1"
- "Asdf"

Why it matters: You'll have multiple campaigns running. Good names help you identify them in reports.

#### Setting Locations

**Where to Show Your Ads:**

**Option 1: Single Location (Most Common)**
```yaml
Type: Radius around address
Address: "123 Main St, Denver, CO 80202"
Radius: 15 miles
```

**Option 2: Multiple Locations**
```yaml
Location 1: Denver, CO (15 mile radius)
Location 2: Aurora, CO (10 mile radius)
Location 3: Lakewood, CO (10 mile radius)
```

**Option 3: Entire Region**
```yaml
State: Colorado
Cities: Denver, Boulder, Fort Collins, Colorado Springs
```

[Screenshot: Location Targeting Interface]

**Best Practices:**

For **General Dentists:**
- Use 10-15 mile radius from office
- Include surrounding neighborhoods
- Consider patient travel time (20-30 min drive)

For **Orthodontists:**
- Can use larger radius (15-25 miles)
- Patients willing to travel further
- Cover entire metro area if in city

For **Dental Supply B2B:**
- State-wide or regional
- Or target multiple specific cities
- Consider shipping zones

**Common Mistake:** Targeting too broadly (entire state) for local practices wastes budget on people too far away.

#### Choosing Age Range

**Recommended Age Ranges:**

**New Patient Offers (General):**
- Min: 25
- Max: 65
- Why: Decision-makers for family dental care

**Invisalign/Braces (Teen):**
- Min: 35
- Max: 55
- Why: Parents of teenagers

**Invisalign (Adult):**
- Min: 25
- Max: 45
- Why: Young professionals who want discreet braces

**Dental Implants:**
- Min: 45
- Max: 65+
- Why: Older demographic more likely to need implants

**Pediatric Dentist:**
- Min: 25
- Max: 45
- Why: Parents with young children

[Screenshot: Age Range Slider]

**Tips:**
- Don't target too narrow (at least 20-year range)
- Consider your ideal patient demographic
- Match age range to offer type
- Can test and adjust after 2 weeks

#### Daily vs Lifetime Budget

**Daily Budget (Recommended):**
- Spend up to $X per day
- Runs continuously until you pause
- Budget resets each day
- Best for ongoing campaigns

**Lifetime Budget:**
- Total budget for campaign duration
- Set start and end dates
- Facebook paces spend across dates
- Best for time-limited promotions

[Screenshot: Budget Selection]

**How Much Should I Spend?**

**Minimum Recommendations:**

| Practice Type | Minimum Daily Budget | Expected Results |
|---------------|---------------------|------------------|
| General Dentist | $30-50/day | 15-25 leads/month |
| Orthodontist | $50-75/day | 10-20 leads/month |
| Dental Supply | $75-100/day | 5-15 leads/month |

**Budget Calculation:**

```
Daily Budget = (Target Leads/Month × Cost Per Lead) / 30 days

Example:
- Want 30 new patient leads/month
- Typical cost per lead: $40
- Daily budget: (30 × $40) / 30 = $40/day
```

**Starting Budget Advice:**

If you're new to Facebook ads:
1. Start with $30-50/day
2. Run for 2 weeks
3. Analyze cost per lead
4. Increase budget if performing well (ROAS >2.5x)
5. Decrease if not getting good results

**Budget Do's and Don'ts:**

✓ **Do:**
- Start conservative
- Increase based on results
- Give campaigns 7-14 days before judging
- Keep budget consistent (don't change daily)

✗ **Don't:**
- Start too low (<$20/day = insufficient data)
- Change budget every day
- Turn campaigns on/off frequently
- Set lifetime budget without end date

#### Scheduling Campaigns (Optional)

**Ad Schedule:**

Run ads:
- **All day, every day** (default, recommended to start)
- **Specific hours** (e.g., 9am-6pm when office is open)
- **Specific days** (e.g., Monday-Friday only)

[Screenshot: Ad Scheduling Interface]

**When to Use Scheduling:**

**All Day, Every Day:**
- Best for lead generation
- Capture interest whenever it happens
- Let Facebook optimize delivery
- **Recommended for most dental campaigns**

**Business Hours Only (9am-6pm):**
- When you offer instant phone response
- "Call Now" campaigns
- When you want to answer calls immediately

**Weekdays Only (Mon-Fri):**
- B2B dental supply campaigns
- When office is closed weekends
- Professional services targeting

**Best Practice:** Start with 24/7, then optimize based on data after 30 days. You may find that ads work well outside business hours for lead forms and booking requests.

#### Best Practices for Targeting

**Start Broad, Then Narrow:**

Week 1-2:
- Broader targeting (larger radius, wider age range)
- Let Facebook's algorithm learn
- Gather data on what works

Week 3+:
- Analyze performance by demographics
- Narrow to best-performing segments
- Exclude poorly performing areas/ages

**Layering Targeting:**

The template includes interest and behavior targeting. You're setting:
- Locations (where)
- Age range (who)
- Budget (how much)

The template already optimizes:
- Interests (health, wellness, dental care)
- Behaviors (engaged shoppers, likely to convert)
- Demographics (parents, homeowners, etc.)

**Avoiding Over-Targeting:**

Too narrow = Not enough people = High costs

Warning signs:
- Audience size under 50,000 people
- "Audience too specific" warning
- Costs increasing daily

Solution:
- Expand radius by 5 miles
- Widen age range by 10 years
- Remove detailed targeting layers

#### Finishing Step 3

Review your configuration:
- Campaign name is descriptive
- Locations cover your service area
- Age range matches your target patient
- Budget is sustainable for your practice
- Schedule fits your goals

Click **Next: Preview & Launch** to proceed to final step.

---

### Step 4: Preview & Launch

Final review before your campaign goes live!

[Screenshot: Campaign Preview Screen]

#### Reviewing Ad Creative

**Preview Panels Show:**

**Desktop News Feed:**
- How ad appears on desktop Facebook
- Full-size image
- Complete headline and text
- Call-to-action button

**Mobile News Feed:**
- How ad looks on phones
- Optimized sizing
- Abbreviated text if needed

**Instagram Feed:**
- Instagram version of ad
- Square or vertical format
- Instagram-optimized copy

**Stories Placement:**
- Full-screen vertical format
- How ad appears in Stories
- Interactive elements

[Screenshot: Multi-Placement Preview]

**What to Check:**

✓ **Image quality:** Is it clear and professional?
✓ **Text legibility:** Can you read all text?
✓ **Your details:** Are all your placeholders filled correctly?
✓ **Call-to-action:** Does the button make sense?
✓ **Offer clarity:** Is your offer clear and compelling?

**Common Issues to Fix:**

❌ Placeholder still showing: `{{company_name}}`
- **Fix:** Go back to Step 2, fill in missing field

❌ Text is cut off on mobile
- **Fix:** Shorten primary text under 125 characters

❌ Image looks pixelated
- **Fix:** Contact admin to update template with higher-res image

❌ Phone number or URL is wrong
- **Fix:** Go back to Step 2, correct the field

#### Verifying Dynamic Field Values

**Review Each Personalized Field:**

```yaml
Company Name: ✓ Bright Smile Dental Associates
Offer Price: ✓ $99
Offer Description: ✓ comprehensive exam, x-rays, and cleaning
Location: ✓ Downtown Denver
Phone: ✓ (303) 555-1234
Website: ✓ https://www.brightsmile.com
```

**Double-Check Critical Fields:**

🔴 **Phone Number**
- Call it to make sure it works
- Verify it goes to your practice
- Ensure voicemail is set up

🔴 **Website URL**
- Click the link to test
- Page should load in under 3 seconds
- Page should be mobile-friendly
- Booking/contact form should work

🔴 **Offer Details**
- Price matches your current promotion
- Services listed are accurate
- Terms are honored at your practice

**Why This Matters:** These are live ads spending real money. Errors mean wasted budget and poor brand impression.

#### Checking Targeting and Budget Summary

**Review the Summary Card:**

```yaml
Campaign: "New Patient Special - March 2026"

Targeting:
  📍 Location: Denver, CO (15 mile radius)
  👥 Age: 25-65
  🎯 Audience Size: ~350,000 people

Budget:
  💰 Daily Budget: $50/day
  📊 Estimated Leads: 20-30/month
  💵 Est. Cost/Lead: $35-45

Schedule:
  📅 Start: Immediately after approval
  ⏰ Hours: All day, every day
  🔄 Duration: Ongoing (until paused)
```

[Screenshot: Campaign Summary Card]

**Red Flags to Watch For:**

⚠️ Audience size under 50,000
- Solution: Expand radius or age range

⚠️ Daily budget under $25
- Solution: Increase to at least $30/day for better results

⚠️ Wrong location selected
- Solution: Go back to Step 3, fix location

⚠️ Campaign name is generic ("Test")
- Solution: Choose descriptive name

#### Launching the Campaign

**Ready to Launch?**

Final checklist:
- [ ] Ad preview looks good on all placements
- [ ] All dynamic fields are filled correctly
- [ ] Phone number and website work
- [ ] Targeting covers your service area
- [ ] Budget is appropriate for your goals
- [ ] Campaign name is descriptive

**Click "Launch Campaign"**

[Screenshot: Launch Button]

**What Happens Next:**

1. **Campaign submits to Facebook** (30-60 seconds)
   - System creates campaign structure
   - Uploads ads with your customizations
   - Sets targeting and budget

2. **Facebook reviews your ad** (5 minutes - 24 hours)
   - Checks for policy compliance
   - Verifies image and text quality
   - Approves or requests changes

3. **Campaign goes live**
   - Ads start showing to target audience
   - Spend begins accruing
   - Leads start coming in

**You'll see confirmation:**
```
✅ Campaign Launched Successfully!

Campaign Name: New Patient Special - March 2026
Status: Pending Review
Est. Approval Time: 15-30 minutes

You'll receive an email when your ads are approved and running.
```

#### What Happens After Launch

**Within 1 Hour:**
- Campaign appears in your Campaigns dashboard
- Status shows "In Review" or "Active"
- You can monitor in real-time

**Within 24 Hours:**
- First impressions and clicks
- Initial cost data
- Early performance indicators

**After 48-72 Hours:**
- Enough data to see trends
- Cost per lead estimates
- First conversions likely

**After 7 Days:**
- Reliable performance metrics
- Can optimize if needed
- Can increase budget if performing well

**After 30 Days:**
- Full performance analysis
- Compare to other campaigns
- Decision point: continue, optimize, or pause

---

## Managing Your Campaigns

### Viewing Active Campaigns

Access your campaigns dashboard:
1. Click **Campaigns** in main navigation
2. View list of all your campaigns

[Screenshot: Campaigns Dashboard]

**Campaign Table Shows:**

| Column | What It Means |
|--------|---------------|
| **Campaign Name** | Your descriptive name |
| **Status** | Active, Paused, Completed |
| **Budget** | Daily spend amount |
| **Spend** | Total spent so far |
| **Impressions** | How many times ad shown |
| **Clicks** | Number of people who clicked |
| **Leads** | Form submissions/conversions |
| **ROAS** | Return on ad spend |
| **Actions** | Pause, Edit, View Details |

**Status Indicators:**

🟢 **Active** - Campaign is running and spending
- Ads are showing
- Budget is being used
- Leads are coming in

🟡 **Paused** - Campaign is stopped
- Ads are not showing
- No budget being spent
- Can resume anytime

🔴 **Completed** - Campaign has ended
- Lifetime budget exhausted
- Or manually ended by you
- Historical data preserved

⚪ **Pending Review** - Awaiting Facebook approval
- Submitted but not yet live
- Usually resolves in 30 minutes
- Check back soon

### Monitoring Performance

**Key Metrics to Watch:**

#### 1. Spend
**What it is:** Total amount spent on campaign so far

**Good:**
- Pacing as expected
- Not exceeding daily budget by more than 20%
- Consistent daily spend

**Concerning:**
- Spending way above daily budget
- Sudden spikes in spend
- Zero spend for multiple days

#### 2. Cost Per Lead
**What it is:** How much you pay for each new patient inquiry

**Calculate:** Total Spend ÷ Number of Leads

**Benchmarks:**
- Excellent: $20-30
- Good: $30-50
- Average: $50-80
- High: $80+

**Example:**
```
Spend: $350
Leads: 10
Cost Per Lead: $350 ÷ 10 = $35 (Good!)
```

#### 3. ROAS (Return on Ad Spend)
**What it is:** Revenue generated per dollar spent

**Calculate:** Revenue ÷ Ad Spend

**Benchmarks:**
- Excellent: >4.0x
- Good: 3.0-4.0x
- Break-even: 2.0-3.0x
- Losing money: <2.0x

**Example:**
```
Spend: $500
Revenue from patients: $1,750
ROAS: $1,750 ÷ $500 = 3.5x (Good!)
```

#### 4. Click-Through Rate (CTR)
**What it is:** Percentage of people who click after seeing ad

**Calculate:** (Clicks ÷ Impressions) × 100

**Benchmarks:**
- Excellent: >2.0%
- Good: 1.5-2.0%
- Average: 1.0-1.5%
- Low: <1.0%

**Example:**
```
Impressions: 10,000
Clicks: 180
CTR: (180 ÷ 10,000) × 100 = 1.8% (Good!)
```

Low CTR means:
- Ad creative not compelling
- Offer not attractive
- Wrong audience targeted

### Pausing Campaigns

**When to Pause:**

✓ Campaign cost per lead is too high (>$100)
✓ ROAS is below break-even (<2.0x)
✓ You've hit patient capacity temporarily
✓ Seasonal closure (vacation, holidays)
✓ Need to fix something (phone number, website)
✓ Budget needs to be reallocated

**How to Pause:**

1. Go to Campaigns dashboard
2. Find campaign to pause
3. Click **More Actions** (⋮) or **Pause** button
4. Confirm: "Are you sure?"
5. Campaign stops immediately

[Screenshot: Pause Campaign Button]

**What Happens When You Pause:**

✓ Ads stop showing immediately
✓ Budget stops accruing
✓ Existing leads are preserved
✓ Historical data remains
✓ Can resume anytime
✓ No penalty or loss

**Common Mistake:** Pausing too early. Give campaigns 7-10 days before judging performance. Facebook's algorithm needs time to optimize.

### Resuming Campaigns

**How to Resume:**

1. Go to Campaigns dashboard
2. Filter by "Paused" status
3. Find campaign to resume
4. Click **Resume** button
5. Confirm: "Resume campaign?"
6. Campaign goes live again

**What Happens:**

✓ Ads start showing within 15 minutes
✓ Budget starts accruing again
✓ Picks up where it left off
✓ Historical data preserved
✓ May take 24-48 hours to re-optimize

**Pro Tip:** If you pause for more than 7 days, campaign may need 2-3 days to re-stabilize performance as Facebook's algorithm re-learns your audience.

### Adjusting Budgets

**When to Increase Budget:**

✓ Campaign is performing well (ROAS >3.0x)
✓ Cost per lead is low ($30-40)
✓ Consistently generating quality leads
✓ Want to scale up patient acquisition
✓ Have capacity for more patients

**When to Decrease Budget:**

✓ Cost per lead is too high
✓ Lead quality is poor
✓ Need to conserve budget
✓ Testing phase complete

**How to Adjust Budget:**

1. Go to Campaigns dashboard
2. Click on campaign name
3. Click **Edit Budget** button
4. Enter new daily budget amount
5. Click **Save Changes**

[Screenshot: Edit Budget Modal]

**Budget Adjustment Guidelines:**

**Increasing:**
- Increase by 20-30% at a time
- Wait 3-5 days between increases
- Monitor cost per lead closely
- Don't double budget overnight

**Example:**
```
Current: $50/day
Increase to: $60-65/day (20-30%)
Wait: 5 days
If still performing well, increase to: $75-80/day
```

**Decreasing:**
- Decrease by 20-50% at a time
- Immediate effect (no waiting needed)
- Monitor for 2-3 days
- Can pause completely if needed

**Example:**
```
Current: $100/day (cost per lead too high at $95)
Decrease to: $50-60/day (40-50%)
Monitor for 3 days
If improves, keep. If not, pause.
```

**Warning:** Large budget changes (>50%) may disrupt Facebook's optimization. Campaign may need 48-72 hours to restabilize.

### Understanding Campaign Status

**Campaign Lifecycle:**

```
Created → Pending Review → Active → Paused → Active → Completed
```

**Status Definitions:**

**In Review**
- Submitted to Facebook
- Awaiting approval
- Usually 15-30 minutes
- Can take up to 24 hours

**Active**
- Approved and running
- Spending budget
- Showing ads
- Generating leads

**Active with Issues**
- Running but has warnings
- May be: low delivery, high cost, policy issues
- Check notifications for details

**Paused by You**
- You manually paused
- No spend occurring
- Can resume anytime

**Paused by Facebook**
- Facebook detected policy violation
- Or spending limit reached
- Or payment issue
- Requires action to resume

**Completed**
- Campaign ended
- Lifetime budget exhausted
- Or you ended it manually
- Historical data preserved

**Deleted**
- Permanently removed
- Cannot be recovered
- Data may be lost (avoid deleting, pause instead)

---

## Understanding Analytics

### Viewing Your Campaign Performance

Access your analytics:
1. Click **Analytics** in main navigation
2. Or click campaign name in Campaigns dashboard
3. View performance data and charts

[Screenshot: Analytics Dashboard]

### Key Metrics Explained

#### Impressions
**What it is:** Number of times your ad was shown

**Why it matters:**
- Measures reach
- Shows ad visibility
- Indicates targeting effectiveness

**Good ranges:**
- 10,000+ impressions/week for local campaign
- 50,000+ impressions/month for good reach

**Low impressions?**
- Targeting too narrow
- Budget too low
- Bid too low
- Creative not approved by Facebook

#### Clicks
**What it is:** Number of times people clicked your ad

**Why it matters:**
- Shows ad engagement
- Leads to website visits
- First step to conversion

**What's good:**
- CTR >1.5%
- Consistent clicks daily
- Growing click volume

**Low clicks?**
- Ad creative not compelling
- Offer not attractive
- Wrong audience targeted
- Headline not clear

#### Conversions
**What it is:** Actions you want people to take (form submissions, calls, bookings)

**Why it matters:**
- Your ultimate goal
- Actual leads for your practice
- Basis for ROAS calculation

**Types:**
- Lead form submissions
- Phone calls
- Online bookings
- "Contact Us" form fills

**Good conversion rate:**
- 10-20% of clicks convert
- Example: 100 clicks → 15 leads

#### ROAS (Return on Ad Spend)
**What it is:** Revenue per dollar spent

**Why it matters:**
- Key profitability metric
- Shows if ads are worth it
- Basis for budget decisions

**How to calculate:**

1. Track revenue from campaign leads:
```
Lead 1: $500 (exam + cleaning)
Lead 2: $2,000 (crown)
Lead 3: $800 (filling + cleaning)
Lead 4: $1,200 (whitening + cleaning)
Total Revenue: $4,500
```

2. Divide by ad spend:
```
Ad Spend: $1,200
ROAS: $4,500 ÷ $1,200 = 3.75x
```

**Interpretation:**
- 3.75x ROAS = You made $3.75 for every $1 spent
- Profit = $4,500 - $1,200 = $3,300
- This is GOOD performance

**Tracking Revenue:**

You need to track which leads came from ads and how much they spent. Methods:

1. **Ask patients:** "How did you hear about us?"
2. **Use call tracking:** Unique phone number for ads
3. **Use lead forms:** Leads come directly from Facebook
4. **Use CRM:** Track lead source in patient management system

#### Cost Per Click (CPC)
**What it is:** Average cost for each click

**Calculate:** Total Spend ÷ Total Clicks

**Benchmarks:**
- Excellent: $0.50-1.00
- Good: $1.00-2.00
- Average: $2.00-4.00
- High: $4.00+

**Example:**
```
Spend: $300
Clicks: 150
CPC: $300 ÷ 150 = $2.00 (Good!)
```

High CPC means:
- Competitive targeting
- Low ad relevance score
- Bid too high
- Poor ad quality

#### Cost Per Mille (CPM)
**What it is:** Cost to show your ad 1,000 times

**Why it matters:**
- Measures efficiency of reach
- Shows competition in your market
- Helps evaluate ad quality

**Benchmarks:**
- Excellent: $5-10
- Good: $10-20
- Average: $20-40
- High: $40+

**Example:**
```
Spend: $100
Impressions: 5,000
CPM: ($100 ÷ 5,000) × 1,000 = $20 (Good!)
```

Low CPM = Less competition, ads are efficient
High CPM = More competition, might need better creative

### When to Optimize or Pause

#### Signs Campaign is Performing Well

✓ ROAS >3.0x
✓ Cost per lead $30-50
✓ CTR >1.5%
✓ Consistent daily results
✓ Quality leads (patients actually book)

**Action:** Keep running, consider increasing budget gradually.

#### Signs Campaign Needs Optimization

⚠️ ROAS 2.0-3.0x (break-even zone)
⚠️ Cost per lead $50-80
⚠️ CTR 1.0-1.5%
⚠️ Declining performance over time
⚠️ Inconsistent daily results

**Action:** Give it 7-10 days, then optimize targeting or creative. Contact admin for template updates.

#### Signs Campaign Should Be Paused

❌ ROAS <2.0x (losing money)
❌ Cost per lead >$100
❌ CTR <1.0%
❌ Zero conversions after $200 spent
❌ Poor quality leads (no-shows, not interested)

**Action:** Pause immediately. Review targeting, try different template, or consult with admin before resuming.

### Reading Performance Charts

**Spend Over Time (Line Chart)**
- Shows daily spend
- Should be relatively consistent
- Spikes indicate days with high activity
- Use to verify budget pacing

[Screenshot: Spend Over Time Chart]

**Metrics Comparison (Bar Chart)**
- Compare impressions, clicks, conversions
- Shows funnel effectiveness
- Identify where drop-offs occur

[Screenshot: Metrics Comparison Chart]

**Demographics Breakdown (Pie Chart)**
- Age ranges performing best
- Gender distribution
- Location performance
- Use to refine targeting

[Screenshot: Demographics Chart]

---

## Tips & Best Practices

### Choosing the Right Template

**Consider Your Goals:**

**Goal: New Patient Acquisition**
- Template: "New Patient Special"
- Features: First-visit offer, exam + cleaning bundle
- Budget: $40-60/day
- Expected: 20-30 leads/month

**Goal: Promote Specific Service (Invisalign)**
- Template: "Invisalign Promotion"
- Features: Free consultation, before/after images
- Budget: $60-100/day
- Expected: 10-20 leads/month

**Goal: Emergency Services**
- Template: "Emergency Dental - Same Day"
- Features: Immediate availability, pain relief focus
- Budget: $30-50/day
- Expected: 5-15 leads/month (high intent)

**Goal: Teeth Whitening**
- Template: "Teeth Whitening Special"
- Features: Cosmetic focus, before/after, limited time
- Budget: $40-60/day
- Expected: 15-25 leads/month

**Match Template to Season:**

**Spring (March-May):**
- New patient offers
- Teeth whitening (wedding season)
- Invisalign (before summer)

**Summer (June-August):**
- Teen braces/Invisalign
- Back-to-school checkups
- Family packages

**Fall (September-November):**
- Use insurance benefits before year-end
- New patient specials
- Holiday teeth whitening

**Winter (December-February):**
- New Year dental resolutions
- Insurance benefit renewal
- Emergency services (holiday candy)

### Setting Realistic Budgets

**Budget Planning Worksheet:**

1. **Determine Your Cost Per Lead:**
   - Industry average for dental: $35-50
   - Your target: $_____ (start with $45)

2. **Set Lead Goal:**
   - New patients needed per month: _____
   - Example: 20 new patients

3. **Calculate Total Monthly Budget:**
   ```
   Monthly Budget = Leads Needed × Cost Per Lead
   Example: 20 × $45 = $900/month
   ```

4. **Calculate Daily Budget:**
   ```
   Daily Budget = Monthly Budget ÷ 30 days
   Example: $900 ÷ 30 = $30/day
   ```

**Scaling Budget Over Time:**

**Month 1:** Start conservative
- Daily: $30-40
- Goal: Learn and optimize
- Focus: Cost per lead under $60

**Month 2:** Increase if performing well
- Daily: $50-70 (if ROAS >3.0x)
- Goal: Scale successful campaigns
- Focus: Maintain cost per lead

**Month 3+:** Maximize based on capacity
- Daily: $70-100+ (if you can handle lead volume)
- Goal: Consistent patient flow
- Focus: Long-term profitability

**Budget Red Flags:**

❌ Starting too low (<$20/day)
- Won't get enough data
- Facebook can't optimize properly
- Takes too long to see results

❌ Starting too high (>$150/day) without testing
- Risk wasting budget on unproven campaign
- Hard to pinpoint issues
- Expensive learning curve

✓ **Sweet Spot: $30-50/day for first 2 weeks, then scale based on results**

### Testing Different Offer Prices

**A/B Test Your Offers:**

**Test 1: Price Points**
- Campaign A: "$99 New Patient Special"
- Campaign B: "FREE Exam & X-Rays (Valued at $150)"
- Run both for 2 weeks
- Compare: Lead volume, lead quality, cost per lead

**Test 2: Service Bundles**
- Campaign A: "$99 Exam + X-rays + Cleaning"
- Campaign B: "$149 Exam + X-rays + Cleaning + Whitening"
- Run both for 2 weeks
- Compare: Which converts better, which patients spend more long-term

**Test 3: Urgency**
- Campaign A: "New Patient Special - $99"
- Campaign B: "Limited Time: $99 New Patient Special - Ends March 31"
- Run both for 2 weeks
- Compare: Does urgency increase conversion rate?

**Example Test Results:**

```yaml
Campaign A: "$99 Exam"
  Spend: $500
  Leads: 15
  Cost/Lead: $33
  Booking Rate: 60%
  Actual Patients: 9

Campaign B: "FREE Exam ($150 Value)"
  Spend: $500
  Leads: 25
  Cost/Lead: $20
  Booking Rate: 40%
  Actual Patients: 10
```

**Analysis:**
- Campaign B gets more leads (25 vs 15)
- Campaign B has lower cost per lead ($20 vs $33)
- But Campaign B has lower booking rate (40% vs 60%)
- Campaign B brings in slightly more actual patients (10 vs 9)
- **Winner: Campaign B (slightly) - but both are viable**

**Key Insight:** "FREE" attracts more leads but some are lower quality (less likely to book). "$99" attracts fewer but higher-intent leads.

**What to do:** Run both! Use "FREE" offer for volume, use "$99" offer for quality.

### When to Contact an Admin

**Contact Admin When:**

✓ You need a custom template (not in marketplace)
✓ Template has an error or outdated information
✓ You want to suggest template improvement based on your results
✓ You need help interpreting analytics
✓ Campaign is consistently underperforming (ROAS <2.0x)
✓ You want to share success story for case study
✓ You need training on advanced features
✓ You have questions about best practices

**How to Contact:**

**Email:**
```
To: admin@yourcompany.com
Subject: [Template Help] - Your Issue

Details:
- Your name and practice
- Campaign name or template name
- Specific question or issue
- Screenshots if relevant
```

**In-App:**
- Click "Help" icon
- Click "Contact Admin"
- Fill in support form
- Attach screenshots

**Slack (if available):**
- #facebook-ads-help channel
- Tag @admin
- Describe issue concisely

**Response Time:**
- Urgent issues: 4-6 hours
- General questions: 1 business day
- Optimization help: 2 business days
- Template requests: 3-5 business days

---

## Troubleshooting

### Campaign Not Delivering

**Symptoms:**
- Zero impressions after 24 hours
- Status shows "Active" but no spend
- "Low Delivery" warning

**Common Causes:**

1. **Audience Too Small**
   - Check audience size in targeting
   - Should be at least 50,000 people
   - **Fix:** Expand radius or age range

2. **Bid Too Low**
   - Facebook can't win auctions
   - **Fix:** Increase budget by 20%

3. **Ad Rejected**
   - Check notifications for policy violation
   - **Fix:** Review ad, remove violating content, resubmit

4. **Payment Issue**
   - Check Facebook Business Manager for billing alerts
   - **Fix:** Update payment method

5. **Daily Budget Too Low**
   - Budget under $20/day struggles to deliver
   - **Fix:** Increase to minimum $30/day

### Low Performance

**Symptoms:**
- High cost per lead (>$80)
- Low ROAS (<2.0x)
- CTR <1.0%

**Diagnosis:**

**Step 1: Check Spend**
- Have you spent at least $200?
- If no: Give it more time
- If yes: Proceed to Step 2

**Step 2: Review Metrics**

| Metric | Your Value | Benchmark | Issue? |
|--------|-----------|-----------|--------|
| CTR | 0.8% | >1.5% | Yes - creative |
| CPC | $4.50 | <$2.00 | Yes - targeting |
| CVR | 5% | >10% | Yes - landing page |

**Step 3: Identify Problem Area**

**Low CTR (creative issue):**
- Ad not engaging enough
- Image not compelling
- Headline not clear
- **Fix:** Try different template with better creative

**High CPC (targeting issue):**
- Too competitive
- Audience too narrow
- Relevance score low
- **Fix:** Broaden targeting, adjust age range

**Low Conversion Rate (offer/landing issue):**
- Offer not attractive
- Landing page confusing
- Phone number doesn't work
- **Fix:** Check all links work, test on mobile

**Action Plan:**

```yaml
Week 1-2:
  - Let campaign run, gather data
  - Minimum spend: $200
  - Don't make changes yet

Week 3:
  - If cost/lead >$80: Pause campaign
  - Review metrics (CTR, CPC, CVR)
  - Identify issue area
  - Make ONE change (targeting OR creative, not both)

Week 4:
  - Test change for 7 days
  - Compare to Week 1-2 baseline
  - If improved: Continue
  - If not: Try different template
```

### Ad Rejected by Facebook

**Common Rejection Reasons:**

1. **Before/After Images**
   - Facebook doesn't allow dramatic before/after
   - **Fix:** Use separate images or testimonials instead

2. **Personal Attributes**
   - Can't imply you know viewer's attributes
   - Bad: "Tired of yellow teeth?"
   - Good: "Want whiter teeth?"
   - **Fix:** Rewrite headline to be inclusive

3. **Misleading Claims**
   - Can't claim unrealistic results
   - Bad: "Lose 10 years with our whitening!"
   - Good: "Professional teeth whitening"
   - **Fix:** Make claims more conservative

4. **Low-Quality Image**
   - Image is pixelated or has too much text
   - **Fix:** Contact admin for higher-res image

5. **Prohibited Content**
   - Mentions specific health conditions
   - Bad: "Diabetes-related dental problems"
   - Good: "Dental health for everyone"
   - **Fix:** Remove specific medical terms

**What to Do:**

1. Check notification for specific reason
2. Click "Edit Ad"
3. Fix the issue identified
4. Click "Submit for Review"
5. Wait 15-30 minutes for re-review

If rejected multiple times, contact admin for help.

### Can't Fill Required Field

**Issue:** Field validation won't let you proceed

**Common Fixes:**

**"Invalid URL format"**
```
Problem: http://www.mysite.com
Fix: https://www.mysite.com
(Must use https, not http)
```

**"Text is too long"**
```
Problem: "My Super Amazing Dental Practice With The Best Service"
Fix: "My Amazing Dental Practice"
(Shorten to under max length)
```

**"Phone number invalid"**
```
Problem: 555-1234
Fix: (303) 555-1234
(Include area code in standard format)
```

**"This field is required"**
```
Problem: Left blank
Fix: Fill it in with appropriate value
(Required fields must have a value)
```

**"Number out of range"**
```
Problem: Entered 5 (budget too low)
Fix: Enter at least 30
(Must meet minimum requirement)
```

Still stuck? Screenshot the error and contact admin.

### Budget Not Spending

**Symptoms:**
- Daily budget is $50
- Actual spend is $5-10/day
- Campaign active but underspending

**Causes:**

1. **Learning Phase**
   - First 3-5 days, Facebook learns
   - Spend ramps up gradually
   - **Fix:** Be patient, let it optimize

2. **Audience Overlap**
   - Running multiple similar campaigns
   - Competing against yourself
   - **Fix:** Consolidate campaigns or narrow targeting

3. **Ad Fatigue**
   - Same people seeing ad repeatedly
   - Engagement dropping
   - **Fix:** Refresh creative (contact admin) or expand audience

4. **Bid Cap Too Low**
   - Campaign can't win enough auctions
   - **Fix:** Remove bid cap or increase by 30%

**Action Steps:**

```yaml
Day 1-3:
  - Underspending is normal
  - Facebook is learning
  - Wait for optimization

Day 4-7:
  - Still underspending?
  - Check audience size (should be 50k+)
  - Increase budget by 20%

Day 8-10:
  - Still not spending?
  - Try expanding location radius
  - Or try different template
```

### Contact Support

**When to Contact Support:**

- Issue persists after following troubleshooting steps
- Error messages you don't understand
- Technical problems (site not loading, buttons not working)
- Campaign suspended by Facebook and you don't know why
- Need personalized help with optimization

**How to Contact:**

```yaml
Email: support@yourcompany.com
Subject: [Help] - Brief Description

Include:
  - Your name
  - Practice name
  - Campaign name (if applicable)
  - What you've tried already
  - Screenshots of error/issue
  - Expected behavior vs what's happening
```

**Response Times:**
- Technical issues: 4-6 hours
- Campaign help: 1 business day
- General questions: 2 business days

---

## Appendix

### Glossary

**Ad Account** - Your Facebook advertising account where campaigns run and budget is charged

**Admin** - User with advanced permissions (template management, analytics, user management)

**Call-to-Action (CTA)** - Button on ad (e.g., "Book Now", "Learn More", "Call Now")

**Campaign** - The top-level structure that holds your ads, budget, and targeting

**Click-Through Rate (CTR)** - Percentage of people who click your ad (clicks ÷ impressions × 100)

**Conversion** - Desired action taken (form submission, phone call, booking)

**Cost Per Click (CPC)** - Average cost for each ad click (spend ÷ clicks)

**Cost Per Lead (CPL)** - How much you pay for each lead (spend ÷ leads)

**CPM** - Cost per 1,000 impressions (ad views)

**Creative** - The visual part of your ad (image, video, carousel)

**Dynamic Field** - Customizable placeholder in template (e.g., {{company_name}})

**Impression** - One time your ad is shown to someone

**Landing Page** - The webpage people visit after clicking your ad

**Lead** - A potential patient who expressed interest (form fill, call, message)

**Objective** - Goal of your campaign (leads, traffic, awareness, sales)

**Placement** - Where your ad appears (Facebook Feed, Instagram Stories, etc.)

**ROAS** - Return on Ad Spend (revenue ÷ ad spend)

**Template** - Pre-built ad campaign with dynamic fields for customization

**Targeting** - Who sees your ads (location, age, interests)

**User** - Standard account permission level (can launch campaigns from templates)

### Keyboard Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| Search templates | Cmd+K | Ctrl+K |
| View campaigns | Cmd+1 | Ctrl+1 |
| View analytics | Cmd+2 | Ctrl+2 |
| Launch campaign | Cmd+L | Ctrl+L |
| Refresh data | Cmd+R | Ctrl+R |
| Help | Cmd+/ | Ctrl+/ |

### FAQs

**Q: How long before I see results?**
A: First leads typically come within 24-72 hours. Reliable performance data takes 7-10 days as Facebook optimizes your campaign.

**Q: What's a good cost per lead for dental?**
A: $30-50 is good, $50-80 is average, under $30 is excellent. Over $100 suggests optimization needed.

**Q: Can I run multiple campaigns at once?**
A: Yes, but start with one campaign for 2 weeks to learn, then add more. Running too many similar campaigns can cause them to compete against each other.

**Q: How often should I check my campaigns?**
A: Daily for the first week (quick check), then weekly. Avoid making changes more than once per week.

**Q: Can I pause a campaign and resume later?**
A: Yes! Pause anytime with no penalty. Resume when ready. Note: campaign may need 48 hours to re-optimize after long pauses (>7 days).

**Q: What if I can't afford the recommended budget?**
A: Start with minimum $30/day. Lower budgets ($20/day) work but results take longer and may be less consistent.

**Q: Do I need different campaigns for different services?**
A: Yes, ideally. One campaign for new patient offers, another for Invisalign, etc. This allows better tracking and optimization.

**Q: What's the difference between ADMIN and USER roles?**
A: Users can browse templates and launch campaigns. Admins can also create templates, view all analytics, and manage users.

**Q: How do I track which leads came from Facebook?**
A: Ask patients "How did you hear about us?" or use call tracking numbers. Lead forms automatically track source.

**Q: Can I edit a campaign after it's launched?**
A: You can adjust budget and pause/resume. For other changes (targeting, ad copy), create a new campaign or contact admin.

### Support Resources

**Documentation:**
- User Guide (this document)
- Admin Guide: `/docs/ADMIN-GUIDE.md` (if you have admin access)
- Quick Start: `/docs/QUICK-START.md`
- API Documentation: `/docs/API.md` (for developers)

**Help Center:**
- In-app: Click "?" icon in top-right
- Online: https://help.yourcompany.com
- Videos: https://videos.yourcompany.com/tutorials

**Contact Support:**
- Email: support@yourcompany.com
- Phone: (555) 123-4567 (Mon-Fri 9am-5pm MST)
- Live Chat: Click chat icon in bottom-right

**Community:**
- Slack: #facebook-ads-users channel
- Monthly Q&A Sessions: Last Wednesday of each month, 2pm MST
- Best Practices Newsletter: Weekly email with tips

**Emergency Contact:**
- Critical issues: (555) 123-4567
- After hours: emergency@yourcompany.com

---

**Document Version:** 1.0.0
**Last Updated:** January 2026
**Maintained by:** ORCHESTRAI Documentation Team
**Feedback:** documentation@yourcompany.com
