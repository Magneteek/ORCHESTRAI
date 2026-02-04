# Facebook Ads Manager - Administrator Guide

**Version:** 1.0.0
**Last Updated:** January 2026
**Audience:** ADMIN role users managing global templates, cross-account analytics, and organization users

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Global Template Management](#global-template-management)
3. [Dynamic Fields System](#dynamic-fields-system)
4. [Cross-Account Analytics](#cross-account-analytics)
5. [User Management](#user-management)
6. [Organization Settings](#organization-settings)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Logging In

1. Navigate to your Facebook Ads Manager dashboard
2. Enter your email and password
3. Click "Sign In"
4. If you have ADMIN privileges, you'll see additional menu items: "Template Management", "Analytics Dashboard", and "User Management"

### Dashboard Overview

As an ADMIN, your dashboard provides:

- **Template Management** - Create and manage global templates available to all users
- **Cross-Account Analytics** - View aggregated performance data across all ad accounts in your organization
- **User Management** - Invite users, change roles, and manage permissions
- **Organization Settings** - Configure organization-wide defaults and preferences

[Screenshot: Admin Dashboard with Navigation]

### Navigation Structure

```
Dashboard
├── Templates (User View)
├── Template Management (Admin Only)
│   ├── Create Global Template
│   ├── Edit Templates
│   └── View Performance Metrics
├── Analytics (User View)
├── Analytics Dashboard (Admin Only)
│   ├── Cross-Account Performance
│   ├── Template Analytics
│   └── Per-Account Breakdown
├── User Management (Admin Only)
│   ├── View Users
│   ├── Invite Users
│   └── Manage Roles
└── Settings (Admin Only)
```

### Role Responsibilities

As an ADMIN, you are responsible for:

- Creating high-quality, reusable global templates for the dental industry
- Monitoring template performance across all user accounts
- Optimizing underperforming templates based on analytics
- Managing user access and permissions
- Ensuring data quality and campaign best practices
- Training users on template usage and campaign management

---

## Global Template Management

### What Are Global Templates?

Global templates are pre-configured ad templates that:

- Are available to ALL users in your organization
- Include dynamic fields for personalization (company name, offer price, location, etc.)
- Aggregate performance data across all accounts using the template
- Can be featured to highlight top performers
- Support versioning and continuous improvement

**Use Cases:**
- "New Patient Special" template for general dentists
- "Invisalign Promotion" template for orthodontists
- "Dental Supplies Sale" template for B2B dental suppliers

### Creating Global Templates

#### Step 1: Access Template Management

1. Click **Template Management** in the main navigation
2. Click the **Create Global Template** button (top right)
3. The template creation dialog will open

[Screenshot: Template Management Dashboard]

#### Step 2: Basic Information

Fill in the template details:

```yaml
Name: "New Patient Special - Dental"
Description: "Attract new patients with a compelling first-visit offer. Optimized for general dentists and family practices."
Category: "general-dentist"
Objective: "OUTCOME_LEADS"
Visibility: "global" (automatically set for admins)
```

**Categories Available:**
- `general-dentist` - General dental practices
- `orthodontist` - Orthodontic specialists
- `dental-supply-b2b` - Dental supply companies (B2B)

**Objectives:**
- `OUTCOME_LEADS` - Lead generation (most common for dental)
- `OUTCOME_TRAFFIC` - Website visits
- `OUTCOME_AWARENESS` - Brand awareness
- `OUTCOME_SALES` - Direct sales (e-commerce)
- `OUTCOME_ENGAGEMENT` - Social media engagement

#### Step 3: Configure Ad Copy

Define the ad copy with dynamic field placeholders:

```json
{
  "headline": "{{offer_headline}}",
  "primaryText": "{{company_name}} is offering {{offer_description}} for new patients! Limited time: {{offer_price}}. Call {{phone_number}} or visit {{website_url}} to schedule.",
  "description": "Professional dental care in {{business_location}}. {{years_in_business}} years of experience.",
  "callToAction": "BOOK_NOW"
}
```

**Call-to-Action Options:**
- `BOOK_NOW` - Schedule appointments (recommended for dental)
- `LEARN_MORE` - Drive to website
- `CALL_NOW` - Phone calls
- `GET_QUOTE` - Request pricing
- `APPLY_NOW` - Applications/forms
- `CONTACT_US` - General inquiries

Note: Use `{{placeholder_name}}` syntax for dynamic fields. These will be filled in by users when launching campaigns.

#### Step 4: Add Dynamic Fields

The Dynamic Fields Builder allows you to define customizable fields:

[Screenshot: Dynamic Fields Builder Interface]

**Example: Creating a "New Patient Special" Template**

Click **Add Field** for each dynamic field:

1. **Company Name Field**
   ```yaml
   Field Name: company_name
   Field Type: text
   Display Label: "Your Practice Name"
   Placeholder: "e.g., Smile Dental Associates"
   Required: Yes
   Default Value: (leave empty)
   Help Text: "Enter your dental practice name as you want it to appear in ads"
   ```

2. **Offer Price Field**
   ```yaml
   Field Name: offer_price
   Field Type: text
   Display Label: "Offer Price"
   Placeholder: "e.g., $99 or FREE"
   Required: Yes
   Default Value: "$99"
   Help Text: "The promotional price for your new patient special"
   ```

3. **Business Location Field**
   ```yaml
   Field Name: business_location
   Field Type: text
   Display Label: "Business Location"
   Placeholder: "e.g., Downtown Denver"
   Required: Yes
   Default Value: (leave empty)
   Help Text: "City or neighborhood where your practice is located"
   ```

4. **Phone Number Field**
   ```yaml
   Field Name: phone_number
   Field Type: text
   Display Label: "Practice Phone Number"
   Placeholder: "e.g., (555) 123-4567"
   Required: Yes
   Default Value: (leave empty)
   Help Text: "Your main practice phone number"
   ```

5. **Website URL Field**
   ```yaml
   Field Name: website_url
   Field Type: url
   Display Label: "Website URL"
   Placeholder: "e.g., https://www.yourpractice.com"
   Required: Yes
   Default Value: (leave empty)
   Help Text: "Your practice website (must include https://)"
   Validation: Valid URL format
   ```

6. **Offer Headline Field**
   ```yaml
   Field Name: offer_headline
   Field Type: text
   Display Label: "Offer Headline"
   Placeholder: "e.g., New Patient Special: $99 Exam & Cleaning"
   Required: Yes
   Default Value: "New Patient Special"
   Help Text: "The main headline for your offer"
   Max Length: 40 characters
   ```

7. **Offer Description Field**
   ```yaml
   Field Name: offer_description
   Field Type: text
   Display Label: "Offer Details"
   Placeholder: "e.g., comprehensive exam, x-rays, and cleaning"
   Required: Yes
   Default Value: (leave empty)
   Help Text: "Brief description of what's included in the offer"
   ```

8. **Years in Business Field**
   ```yaml
   Field Name: years_in_business
   Field Type: number
   Display Label: "Years in Business"
   Placeholder: "e.g., 15"
   Required: No
   Default Value: "10"
   Help Text: "How many years your practice has been serving patients"
   Min Value: 1
   Max Value: 100
   ```

**Field Types Explained:**

- **text** - Single-line text input (use for names, short descriptions, phone numbers)
- **number** - Numeric input (use for prices, quantities, years)
- **url** - URL input with validation (use for website links)
- **textarea** (future) - Multi-line text (for longer descriptions)
- **select** (future) - Dropdown selection (for predefined options)

**Field Validation:**

The system automatically validates:
- Required fields cannot be empty
- URL fields must be valid URLs (https://)
- Number fields must be valid numbers within min/max range
- Text fields respect max length limits

#### Step 5: Creative Specifications

Define the visual requirements:

```json
{
  "format": "single_image",
  "imageUrl": "https://example.com/template-images/dental-office.jpg",
  "dimensions": {
    "width": 1200,
    "height": 628
  },
  "guidelines": [
    "Use bright, professional dental office images",
    "Include smiling patients or dentist",
    "Avoid stock photos - use real practice photos when possible",
    "Image must be high-resolution (at least 1200x628px)",
    "Avoid text overlay exceeding 20% of image"
  ]
}
```

**Creative Format Options:**
- `single_image` - Static image ad
- `carousel` - Multiple scrollable images
- `video` - Video ad (MP4 format)
- `slideshow` - Slideshow of images

**Image Best Practices:**
- Resolution: Minimum 1200x628px (1.91:1 ratio)
- File size: Under 8MB
- Format: JPG or PNG
- Text overlay: Less than 20% of image area
- Content: Professional, high-quality, relevant to dental industry

#### Step 6: Targeting Configuration

Set default targeting parameters:

```json
{
  "locations": ["US"],
  "ageMin": 25,
  "ageMax": 65,
  "genders": ["all"],
  "interests": [
    "Health and wellness",
    "Family activities",
    "Dental care"
  ],
  "detailedTargeting": {
    "behaviors": ["Engaged shoppers"],
    "demographics": ["Parents"]
  }
}
```

**Targeting Best Practices for Dental:**

- **Age Range:** 25-65 (primary dental services audience)
- **Location Radius:** 10-25 miles from practice location
- **Interests:** Health-conscious, family-oriented
- **Behaviors:** Engaged shoppers, likely to convert
- **Exclude:** Existing patients (if pixel/audience available)

#### Step 7: Campaign Structure & Budget

Define default campaign settings:

```json
{
  "budgetType": "daily",
  "defaultBudget": 50,
  "bidStrategy": "LOWEST_COST_WITH_BID_CAP",
  "bidCap": 15.00,
  "placements": [
    "facebook_feed",
    "instagram_feed",
    "facebook_stories",
    "instagram_stories"
  ],
  "schedule": {
    "startHour": 6,
    "endHour": 20,
    "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
  }
}
```

**Budget Recommendations:**

| Practice Type | Daily Budget | Expected Leads/Month | Cost Per Lead |
|---------------|--------------|---------------------|---------------|
| General Dentist | $50-$100 | 30-60 | $25-$50 |
| Orthodontist | $75-$150 | 20-40 | $75-$125 |
| Dental Supply B2B | $100-$250 | 10-25 | $150-$300 |

**Bidding Strategy Options:**
- `LOWEST_COST_WITH_BID_CAP` - Recommended (control max cost per result)
- `COST_CAP` - Target specific cost per action
- `LOWEST_COST` - Automatic optimization (no bid limit)

**Placement Options:**
- Facebook Feed (highest conversion)
- Instagram Feed (visual engagement)
- Facebook Stories (mobile-first)
- Instagram Stories (younger demographics)
- Audience Network (extended reach)
- Messenger (direct interaction)

#### Step 8: Mark as Featured (Optional)

Check the **Mark as Featured** checkbox to highlight this template in the template marketplace. Featured templates appear at the top of the browse view and are recommended to new users.

**Feature templates that:**
- Have proven high ROAS (>3.0x)
- Are used by 10+ accounts successfully
- Follow all best practices
- Have complete, high-quality content

#### Step 9: Save Template

Click **Create Global Template** to save. The template will:
- Become immediately available to all users
- Appear in the Template Marketplace
- Begin collecting performance data as users launch campaigns

[Screenshot: Completed Template Form]

### Editing Global Templates

#### Accessing Templates

1. Go to **Template Management**
2. Use filters to find your template:
   - Search by name
   - Filter by category
   - Filter by global/organization
3. Click **Edit** on the template card

[Screenshot: Template Management Grid View]

#### Making Changes

You can edit:
- Template name and description
- Dynamic field definitions
- Ad copy and placeholders
- Targeting defaults
- Budget recommendations
- Creative specifications

Warning: Changes to global templates affect all users. Consider creating a new version instead of modifying existing templates in use.

#### Template Versioning

When making significant changes:

1. Click **Create New Version** instead of **Save Changes**
2. The system creates a copy with:
   - Version number incremented (v1 → v2)
   - Same dynamic fields
   - Updated content
3. Previous version remains available for existing campaigns
4. New campaigns use the latest version

### Deleting Global Templates

Before deleting a template, verify:

1. Click **Delete** on template card
2. Review the usage statistics:
   - Times used
   - Active campaigns
   - Accounts currently using
3. Confirm deletion

[Screenshot: Template Deletion Confirmation Dialog]

Warning: Deleting a global template:
- Removes it from the template marketplace
- Does NOT delete existing campaigns launched from this template
- Cannot be undone - consider archiving instead

**When to Delete:**
- Template is outdated or no longer relevant
- Template has consistently poor performance
- Template violates advertising policies
- Template has errors that cannot be fixed

**When to Archive (mark as inactive):**
- Template may be useful later
- Some users still have active campaigns
- Historical performance data should be preserved

### Template Categories Explained

#### General Dentist Templates

Target audience: Family dental practices, general dentistry

Common templates:
- New Patient Specials ($99 exam offers)
- Teeth Whitening Promotions
- Emergency Dental Services
- Family Dental Care
- Dental Implants Awareness

Best practices:
- Emphasize family-friendly atmosphere
- Highlight convenience (location, hours)
- Use warm, welcoming imagery
- Focus on comprehensive care

#### Orthodontist Templates

Target audience: Orthodontic specialists, Invisalign providers

Common templates:
- Invisalign Promotions
- Free Consultation Offers
- Teen Braces Specials
- Adult Orthodontics
- Payment Plan Highlights

Best practices:
- Showcase before/after transformations
- Emphasize modern, discreet options
- Target parents and young adults
- Highlight financing options

#### Dental Supply B2B Templates

Target audience: Dental supply companies, equipment vendors

Common templates:
- Equipment Sales & Promotions
- Bulk Order Discounts
- New Product Launches
- Trade Show Invitations
- Educational Webinars

Best practices:
- Target dental professionals (job title targeting)
- Professional, technical imagery
- Emphasize ROI and efficiency
- Include product specifications
- Use lead forms for B2B capture

---

## Dynamic Fields System

### What Are Dynamic Fields?

Dynamic fields allow templates to be personalized for each user's specific practice while maintaining the overall structure and proven performance of the template.

**Example:**
```
Template: "{{company_name}} is offering {{offer_price}} for new patients!"
User fills: company_name = "Smile Dental", offer_price = "$99"
Result: "Smile Dental is offering $99 for new patients!"
```

### How Dynamic Fields Work

1. **Template Creator (Admin)** defines placeholders using `{{field_name}}` syntax
2. **Field Definition** specifies type, validation, and requirements
3. **User** fills in values when launching campaign
4. **System** validates and replaces placeholders with actual values
5. **Campaign** launches with personalized content

### Using Placeholders in Ad Copy

#### Syntax

Use double curly braces: `{{field_name}}`

```javascript
// Correct
"Call {{phone_number}} today!"
"Visit {{company_name}} in {{location}}"

// Incorrect
"Call {phone_number} today!"    // Missing double braces
"Visit {{ company_name }} in {{ location }}"  // Extra spaces
```

#### Placement Rules

Placeholders can be used in:
- Headline text
- Primary text (body copy)
- Description text
- Call-to-action text (limited)
- Display URLs

Placeholders CANNOT be used in:
- Creative assets (images, videos)
- Technical settings (campaign ID, ad set ID)
- Targeting parameters (interests, behaviors)

#### Multiple Placeholders

You can use multiple placeholders in a single field:

```javascript
"{{company_name}} in {{city}}, {{state}} - {{phone_number}}"

// Result: "Bright Smile Dental in Denver, CO - (555) 123-4567"
```

#### Conditional Placeholders (Future Feature)

Currently in development:
```javascript
"{{company_name}}{{#if years_in_business}} - {{years_in_business}} Years of Excellence{{/if}}"
```

### Supported Field Types

#### Text Fields

For: Names, addresses, phone numbers, short descriptions

```yaml
type: text
maxLength: 100 (optional)
minLength: 1 (optional)
pattern: (optional regex validation)
```

Example:
```yaml
field_name: company_name
type: text
maxLength: 50
required: true
placeholder: "Your Practice Name"
```

#### Number Fields

For: Prices, quantities, years, percentages

```yaml
type: number
min: 0 (optional)
max: 100000 (optional)
step: 1 (optional)
```

Example:
```yaml
field_name: offer_price
type: number
min: 0
max: 1000
required: true
placeholder: "99"
helpText: "Enter the price (numbers only, no $ symbol)"
```

#### URL Fields

For: Website links, landing pages, booking systems

```yaml
type: url
requiresHttps: true (recommended)
validation: URL format
```

Example:
```yaml
field_name: website_url
type: url
required: true
placeholder: "https://www.yourpractice.com"
validation: "Must be a valid URL starting with https://"
```

#### Email Fields (Future)

For: Contact emails

```yaml
type: email
validation: Email format
```

#### Phone Fields (Future)

For: Phone numbers with format validation

```yaml
type: phone
format: "(###) ###-####"
country: "US"
```

### Field Validation Rules

#### Required vs Optional

**Required fields:**
- User MUST fill in before launching campaign
- Form shows error if left empty
- Critical for campaign functionality

**Optional fields:**
- User CAN leave empty
- Template uses default value if provided
- Enhances campaign but not essential

Example:
```yaml
# Required
company_name:
  required: true
  # User MUST provide practice name

# Optional
years_in_business:
  required: false
  default: "10"
  # Falls back to "10 years" if not provided
```

#### Default Values

Provide sensible defaults for optional fields:

```yaml
budget:
  type: number
  default: 50
  # Suggests $50/day if user doesn't specify

schedule_start_hour:
  type: number
  default: 9
  # Defaults to 9am if not specified
```

#### Validation Examples

**Phone Number (Text with Pattern)**
```yaml
phone_number:
  type: text
  pattern: "^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$"
  placeholder: "(555) 123-4567"
  errorMessage: "Please enter a valid phone number"
```

**Price (Number with Range)**
```yaml
offer_price:
  type: number
  min: 25
  max: 500
  errorMessage: "Price must be between $25 and $500"
```

**Website URL (URL with HTTPS)**
```yaml
website_url:
  type: url
  requiresHttps: true
  errorMessage: "Website must start with https://"
```

### Example: Creating a "Dental Special Offer" Template

Here's a complete example of a high-performing template:

#### 1. Template Metadata
```yaml
name: "New Patient Special - Comprehensive Exam"
description: "Attract new dental patients with a compelling first-visit offer including exam, x-rays, and cleaning."
category: "general-dentist"
objective: "OUTCOME_LEADS"
isGlobal: true
featured: true
```

#### 2. Dynamic Fields Definition
```json
{
  "fields": [
    {
      "name": "company_name",
      "type": "text",
      "label": "Practice Name",
      "placeholder": "e.g., Bright Smile Dental",
      "required": true,
      "maxLength": 50
    },
    {
      "name": "offer_price",
      "type": "text",
      "label": "Special Offer Price",
      "placeholder": "e.g., $99 or FREE",
      "required": true,
      "helpText": "The promotional price for your new patient special"
    },
    {
      "name": "offer_includes",
      "type": "text",
      "label": "What's Included",
      "placeholder": "e.g., exam, x-rays, and cleaning",
      "required": true,
      "maxLength": 100
    },
    {
      "name": "business_location",
      "type": "text",
      "label": "Location",
      "placeholder": "e.g., Downtown Denver",
      "required": true
    },
    {
      "name": "phone_number",
      "type": "text",
      "label": "Phone Number",
      "placeholder": "(555) 123-4567",
      "required": true
    },
    {
      "name": "website_url",
      "type": "url",
      "label": "Website URL",
      "placeholder": "https://www.yourpractice.com",
      "required": true
    },
    {
      "name": "years_in_business",
      "type": "number",
      "label": "Years in Business",
      "placeholder": "15",
      "required": false,
      "default": "10",
      "min": 1
    }
  ]
}
```

#### 3. Ad Copy with Placeholders
```json
{
  "headline": "New Patient Special: {{offer_price}}",
  "primaryText": "{{company_name}} welcomes new patients! Get {{offer_includes}} for just {{offer_price}}. With {{years_in_business}} years of trusted dental care in {{business_location}}, we're here to give you a healthy, beautiful smile. Call {{phone_number}} or visit {{website_url}} to book your appointment today. Limited time offer!",
  "description": "Professional dental care you can trust. Serving {{business_location}} families.",
  "callToAction": "BOOK_NOW"
}
```

#### 4. Preview Before & After

**Before (Template View):**
```
Headline: "New Patient Special: {{offer_price}}"
Text: "{{company_name}} welcomes new patients! Get {{offer_includes}} for just {{offer_price}}..."
```

**After (User Fills Fields):**
```
Headline: "New Patient Special: $99"
Text: "Bright Smile Dental welcomes new patients! Get exam, x-rays, and cleaning for just $99. With 15 years of trusted dental care in Downtown Denver..."
```

### Testing Templates Before Making Them Global

Before publishing a global template:

1. **Create as Organization Template First**
   - Set `isGlobal: false`
   - Test with 2-3 pilot users
   - Gather feedback on field clarity

2. **Run Test Campaign**
   - Launch with your own ad account
   - Monitor performance for 7-14 days
   - Verify all placeholders work correctly

3. **Review Analytics**
   - Check ROAS (target >2.0x)
   - Review CTR (target >1.5%)
   - Analyze cost per lead

4. **Refine Based on Data**
   - Update ad copy if needed
   - Adjust targeting parameters
   - Modify budget recommendations

5. **Promote to Global**
   - Set `isGlobal: true`
   - Mark as featured if high-performing
   - Document in template description

---

## Cross-Account Analytics

### Accessing the Analytics Dashboard

1. Click **Analytics Dashboard** in main navigation
2. Dashboard loads with default view (last 30 days, all categories)
3. Use filters to refine your view

[Screenshot: Analytics Dashboard Overview]

### Understanding Key Metrics

The analytics dashboard shows four primary metric cards:

#### 1. Total Templates
- **What it shows:** Number of global templates available
- **Why it matters:** Track template library growth
- **Typical range:** 5-20 templates per category

#### 2. Active Campaigns
- **What it shows:** Number of currently running campaigns using your templates
- **Why it matters:** Indicates template adoption and usage
- **Typical range:** 50-200 campaigns (organization-dependent)

#### 3. Total Spend
- **What it shows:** Aggregated ad spend across all accounts using templates
- **Why it matters:** Understanding overall marketing investment
- **Format:** USD currency ($10,450.00)

#### 4. Average ROAS
- **What it shows:** Return on Ad Spend averaged across all templates and accounts
- **Why it matters:** Key performance indicator for template effectiveness
- **Calculation:** Total Revenue / Total Spend
- **Benchmarks:**
  - Excellent: >4.0x
  - Good: 3.0x - 4.0x
  - Average: 2.0x - 3.0x
  - Needs Improvement: <2.0x

[Screenshot: Key Metrics Cards]

### Interpreting the Performance Table

The performance table shows template-by-template breakdown:

#### Table Columns

| Column | Description | How to Use |
|--------|-------------|------------|
| **Template Name** | Template identifier | Sort alphabetically, filter by name |
| **Category** | Template category | Filter by dental specialty |
| **Accounts Using** | Number of ad accounts | Identify popular templates |
| **Total Spend** | Sum of all spend | Find high-investment templates |
| **Avg ROAS** | Average return | Identify top performers |
| **Avg CTR** | Click-through rate | Measure ad engagement |
| **Avg CPC** | Cost per click | Evaluate efficiency |
| **Times Used** | Launch count | Track adoption rate |

[Screenshot: Performance Table with Data]

#### Sorting and Filtering

**Sort by Column:**
- Click column header to sort ascending
- Click again to sort descending
- Default: Sorted by Total Spend (highest first)

**Filter by Category:**
- Use category dropdown above table
- Options: All, General Dentist, Orthodontist, Dental Supply B2B
- Instantly filters table rows

**Search by Name:**
- Use search box to find specific templates
- Searches template name and description
- Updates results in real-time

### Expanding Rows for Per-Account Breakdown

Click the **expand arrow** (▶) on any template row to see:

- **Account-by-account performance**
- Individual ROAS per account
- Spend distribution across accounts
- Campaign count per account
- Launch dates and status

[Screenshot: Expanded Row Showing Per-Account Data]

**Example Breakdown:**

```
Template: "New Patient Special - $99 Offer"
├── Bright Smile Dental (Account #1)
│   ├── Spend: $1,250
│   ├── ROAS: 4.2x
│   ├── Campaigns: 3 active
│   └── Launched: 45 days ago
├── Family Dental Care (Account #2)
│   ├── Spend: $890
│   ├── ROAS: 3.8x
│   ├── Campaigns: 2 active
│   └── Launched: 30 days ago
└── Denver Dental Group (Account #3)
    ├── Spend: $2,100
    ├── ROAS: 5.1x
    ├── Campaigns: 4 active
    └── Launched: 60 days ago
```

This breakdown helps you:
- Identify which practices get the best results
- Spot outliers (very high or very low performance)
- Understand template versatility across different practices
- Provide targeted guidance to underperforming accounts

### Using Filters

#### Date Range Filter

Select time period for analysis:

**Preset Ranges:**
- Last 7 days
- Last 30 days (default)
- Last 90 days
- Last 6 months
- Last year
- All time

**Custom Range:**
- Click "Custom"
- Select start date
- Select end date
- Click "Apply"

[Screenshot: Date Range Picker]

**Use Cases:**
- Weekly reviews: Last 7 days
- Monthly reporting: Last 30 days
- Quarterly analysis: Last 90 days
- Year-end review: Last year

#### Category Filter

Filter templates by industry category:

- **All Categories** - Show all templates (default)
- **General Dentist** - Family dental practices
- **Orthodontist** - Orthodontic specialists
- **Dental Supply B2B** - Dental suppliers

**Why filter by category?**
- Compare performance within same vertical
- Identify category-specific trends
- Benchmark against similar practices
- Optimize category-specific strategies

### Reading Charts

#### ROAS Bar Chart

**What it shows:** Top 10 templates by average ROAS

**How to read:**
- X-axis: Template names
- Y-axis: ROAS value (e.g., 3.5x)
- Bars colored by performance tier:
  - Green: Excellent (>4.0x)
  - Blue: Good (3.0-4.0x)
  - Yellow: Average (2.0-3.0x)
  - Red: Needs improvement (<2.0x)

[Screenshot: ROAS Bar Chart]

**Insights:**
- Which templates drive the highest return
- Performance distribution across templates
- Templates that may need optimization

**Action Items:**
- Feature top performers
- Study high-ROAS template characteristics
- Optimize or retire low-ROAS templates

#### Spend Distribution Pie Chart

**What it shows:** Top 5 templates by total ad spend

**How to read:**
- Pie slices represent % of total spend
- Legend shows template names
- Hover for exact spend amount
- Color-coded for easy identification

[Screenshot: Spend Distribution Pie Chart]

**Insights:**
- Where budget is being allocated
- Most-used vs highest-performing templates
- Diversification of template usage

**Action Items:**
- Ensure high-spend templates have good ROAS
- Identify if budget is too concentrated
- Promote underutilized high-performers

### Identifying Top-Performing Templates

**Definition of "Top Performer":**
1. Avg ROAS >3.5x
2. Used by 5+ accounts
3. Total spend >$1,000
4. Avg CTR >1.5%
5. Consistent performance (not one-time spike)

**How to identify:**

1. **Sort by ROAS** (descending)
2. **Check "Accounts Using"** column (>5)
3. **Review Total Spend** (>$1,000)
4. **Expand row** to verify consistency across accounts
5. **Check date range** (at least 30 days of data)

**What to do with top performers:**

✅ **Mark as Featured**
- Highlight in template marketplace
- Show "Top Performer" badge
- Recommend to new users

✅ **Analyze Success Factors**
- What makes this template work?
- Copy structure and tone
- Targeting specificity
- Visual creative quality
- Offer attractiveness

✅ **Create Variations**
- Test different offers (e.g., $99 vs FREE)
- Try different call-to-actions
- Adjust targeting parameters
- A/B test headlines

✅ **Share Best Practices**
- Document what works
- Train users on how to use effectively
- Create case studies
- Include in onboarding materials

### Making Data-Driven Decisions

#### Scenario 1: Template with High Spend but Low ROAS

**Data:**
```
Template: "Invisalign Promo"
Total Spend: $5,000
Avg ROAS: 1.2x
Accounts Using: 8
```

**Analysis:**
- High adoption (8 accounts using)
- Significant budget allocated
- Poor return (below 2.0x benchmark)
- Needs immediate attention

**Actions:**
1. **Investigate:** Expand row to see per-account performance
   - Are all accounts underperforming?
   - Or is one dragging down the average?

2. **Review Template:**
   - Is the offer competitive?
   - Is the targeting too broad?
   - Is the creative compelling?

3. **Test Improvements:**
   - Update ad copy
   - Refine targeting (narrow audience)
   - Increase offer value
   - Improve creative assets

4. **Communicate:**
   - Email users currently using this template
   - Provide optimization recommendations
   - Offer to help adjust campaigns

#### Scenario 2: Template with Low Usage but High ROAS

**Data:**
```
Template: "Emergency Dental"
Total Spend: $800
Avg ROAS: 5.5x
Accounts Using: 2
Times Used: 3
```

**Analysis:**
- Excellent performance (5.5x ROAS)
- Very low adoption (only 2 accounts)
- Underutilized gem

**Actions:**
1. **Feature the Template:**
   - Mark as featured
   - Add "Hidden Gem" badge
   - Highlight in newsletter

2. **Promote to Users:**
   - Send email blast about performance
   - Create case study
   - Include in template recommendations

3. **Lower Barriers:**
   - Simplify dynamic fields
   - Add better instructions
   - Provide example use cases

4. **Gather Feedback:**
   - Ask why usage is low
   - Identify obstacles
   - Make it easier to use

#### Scenario 3: Declining Template Performance

**Data:**
```
Template: "New Patient $99"
Month 1 ROAS: 4.2x
Month 2 ROAS: 3.5x
Month 3 ROAS: 2.8x
```

**Analysis:**
- Performance declining over time
- Could indicate ad fatigue or market saturation
- Needs refresh

**Actions:**
1. **Refresh Creative:**
   - Update images
   - Rotate ad copy
   - Try new headlines

2. **Adjust Targeting:**
   - Expand to new audiences
   - Exclude converted users
   - Test lookalike audiences

3. **Update Offer:**
   - Make offer more attractive
   - Add urgency ("Limited time!")
   - Bundle services

4. **Create New Version:**
   - Launch Template v2
   - Keep original as comparison
   - A/B test against old version

---

## User Management

### Viewing Organization Users

1. Click **User Management** in navigation
2. View table of all users in your organization
3. See user details:
   - Name and email
   - Role (ADMIN or USER)
   - Status (Active, Invited, Inactive)
   - Last login
   - Campaigns launched
   - Join date

[Screenshot: User Management Table]

### Inviting New Users

#### Step 1: Click "Invite User"

1. Navigate to User Management
2. Click **Invite User** button (top right)
3. Invitation dialog opens

[Screenshot: Invite User Dialog]

#### Step 2: Enter User Details

```yaml
Email: user@example.com
Role: USER (default) or ADMIN
Send Welcome Email: Yes (checked)
Include Getting Started Guide: Yes (checked)
```

**Role Selection:**
- **USER** - Can browse templates, launch campaigns, view own analytics
- **ADMIN** - Full access including template management, user management, cross-account analytics

#### Step 3: Send Invitation

1. Click **Send Invitation**
2. System sends email with:
   - Invitation link
   - Temporary password
   - Getting started instructions
   - Link to User Guide

3. Invitation appears in user table with status: "Invited"

[Screenshot: Invitation Email Preview]

#### Step 4: User Accepts

1. User clicks invitation link
2. User sets password
3. User completes profile
4. Status changes to "Active"

**Invitation Expiry:** 7 days

**Resending Invitations:**
- Click **Resend** button next to invited user
- Sends new invitation email
- Resets 7-day expiry timer

### Changing User Roles

#### USER to ADMIN Promotion

**When to promote:**
- User demonstrates expertise with templates
- User needs to create organization-specific templates
- User responsible for team training
- User manages multiple campaigns across accounts

**How to promote:**

1. Find user in User Management table
2. Click **Change Role** button
3. Select "ADMIN" from dropdown
4. Confirmation dialog appears:

```
Promote [User Name] to ADMIN?

This user will gain access to:
✓ Template Management (create, edit, delete)
✓ Cross-Account Analytics Dashboard
✓ User Management (invite, manage roles)
✓ Organization Settings

This action requires confirmation.
```

5. Type user's email to confirm
6. Click **Promote to ADMIN**
7. User receives notification email
8. Changes take effect immediately

[Screenshot: Role Change Confirmation]

#### ADMIN to USER Demotion

**When to demote:**
- User changing responsibilities
- Reducing number of admins
- User no longer needs admin access
- Security/compliance requirement

**How to demote:**

1. Find user in User Management table
2. Click **Change Role** button
3. Select "USER" from dropdown
4. Confirmation dialog appears:

```
Change [User Name] to USER role?

This user will lose access to:
✗ Template Management
✗ Cross-Account Analytics Dashboard
✗ User Management
✗ Organization Settings

Active campaigns will not be affected.
This action requires confirmation.
```

5. Type user's email to confirm
6. Click **Change to USER**
7. User receives notification email
8. Changes take effect immediately

Note: Demoted users retain access to their own campaigns and can still use templates.

### Role Change Confirmations and Restrictions

#### Confirmation Requirements

All role changes require:
1. Admin initiating change must re-authenticate
2. User email must be typed exactly
3. Confirmation reason (optional but recommended)
4. Cannot change your own role (prevents accidental lockout)

#### Restrictions

**Cannot demote:**
- The last ADMIN in an organization
- User currently managing active template campaigns
- Self (your own user account)

**Cannot promote:**
- Users with "Invited" status (must be Active first)
- Suspended or inactive users
- Users without email verification

[Screenshot: Role Change Restrictions Warning]

### Deactivating Users

**When to deactivate:**
- User left the organization
- User no longer needs access
- Security incident
- Account compromise suspected

**How to deactivate:**

1. Find user in table
2. Click **More Actions** (⋮)
3. Select **Deactivate User**
4. Confirmation dialog:

```
Deactivate [User Name]?

Effects:
- User will be logged out immediately
- User cannot access the platform
- User's campaigns will remain active
- User's analytics data will be preserved
- You can reactivate this user later

Are you sure?
```

5. Click **Deactivate**
6. User status changes to "Inactive"
7. User cannot log in

[Screenshot: Deactivate User Confirmation]

**Reactivating Users:**

1. Filter by "Inactive" status
2. Click **Reactivate** button
3. User receives reactivation email
4. User can log in again
5. Previous campaigns and data intact

### Managing Permissions

#### Permission Matrix

| Permission | USER | ADMIN |
|------------|------|-------|
| Browse templates | ✓ | ✓ |
| Launch campaigns from templates | ✓ | ✓ |
| View own campaign analytics | ✓ | ✓ |
| Create organization templates | ✗ | ✓ |
| Create global templates | ✗ | ✓ |
| Edit templates | ✗ | ✓ |
| Delete templates | ✗ | ✓ |
| View cross-account analytics | ✗ | ✓ |
| Invite users | ✗ | ✓ |
| Change user roles | ✗ | ✓ |
| Deactivate users | ✗ | ✓ |
| Manage organization settings | ✗ | ✓ |
| Access API | ✗ | ✓ |

#### Custom Permissions (Future Feature)

Coming soon:
- Template Editor (can edit but not delete)
- Analytics Viewer (can view but not edit)
- Campaign Manager (full campaign control)
- Billing Admin (manage billing only)

---

## Organization Settings

### Accessing Settings

1. Click **Settings** in navigation
2. Select **Organization Settings** tab
3. View/edit organization-wide configuration

[Screenshot: Organization Settings Page]

### Configuring Default Field Values

Set default values for dynamic fields across all templates:

```yaml
Default Company Name Suffix: "Dental"
Default Location: "United States"
Default Age Range: 25-65
Default Budget: $50
Default Currency: USD
Default Timezone: America/Denver
Default Business Hours: 9:00 AM - 6:00 PM
```

**Benefits:**
- Speeds up campaign creation
- Ensures consistency
- Reduces user errors
- Pre-fills common values

**How to set:**

1. Go to Settings > Default Values
2. Edit field default values
3. Click **Save Changes**
4. Defaults apply to all new campaigns

[Screenshot: Default Field Values Configuration]

### Managing Template Categories

Add, edit, or remove template categories:

**Default Categories:**
- general-dentist
- orthodontist
- dental-supply-b2b

**Adding New Category:**

1. Go to Settings > Template Categories
2. Click **Add Category**
3. Enter:
   ```yaml
   Category ID: pediatric-dentist
   Display Name: "Pediatric Dentist"
   Description: "Templates for pediatric dental practices"
   Icon: tooth-icon
   ```
4. Click **Save**
5. New category available in template creation

**Editing Category:**

1. Click **Edit** next to category
2. Update display name or description
3. Save changes
4. Existing templates automatically updated

**Removing Category:**

Warning: Cannot remove category if templates are using it. Must reassign or delete templates first.

### Setting Performance Data Retention

Configure how long to keep historical performance data:

**Options:**
- 30 days (minimum)
- 90 days (default)
- 180 days
- 1 year
- Forever (not recommended for performance)

**Storage Impact:**

| Retention | Storage | Query Speed | Use Case |
|-----------|---------|-------------|----------|
| 30 days | 5 GB | Fast | Quick insights |
| 90 days | 15 GB | Good | Standard analysis |
| 180 days | 30 GB | Moderate | Trend analysis |
| 1 year | 60 GB | Slower | Long-term trends |
| Forever | Growing | Slowest | Compliance/legal |

**Recommendation:** 90 days provides good balance of insight depth and performance.

**How to configure:**

1. Go to Settings > Data Retention
2. Select retention period
3. Click **Save**
4. System schedules cleanup of older data

[Screenshot: Data Retention Settings]

### Enabling/Disabling Feature Flags

Control access to beta features and advanced functionality:

#### Available Feature Flags

**Beta Features:**
```yaml
Advanced Targeting: OFF
  - Enables custom audiences
  - Lookalike audience creation
  - Detailed demographic targeting

AI-Powered Optimization: OFF
  - Automatic bid adjustments
  - AI copy suggestions
  - Predictive analytics

Multi-Language Support: OFF
  - Spanish translations
  - Multi-language templates
  - Localized campaigns
```

**Experimental Features:**
```yaml
Template Versioning: ON
  - A/B test template versions
  - Track performance changes
  - Rollback capability

Collaborative Editing: OFF
  - Multiple admins edit templates
  - Real-time collaboration
  - Change tracking

API Access: OFF
  - REST API for integrations
  - Webhook support
  - Programmatic campaign creation
```

**How to enable:**

1. Go to Settings > Feature Flags
2. Toggle feature switch
3. Read feature description and requirements
4. Click **Enable**
5. Feature activates immediately

Warning: Beta features may have bugs or limitations. Enable with caution in production environments.

---

## Best Practices

### Template Naming Conventions

Follow consistent naming for easy discovery:

**Format:**
```
[Category] - [Objective] - [Offer Type] - [Version]
```

**Examples:**
```
✓ General Dentist - New Patient Special - $99 Exam - v2
✓ Orthodontist - Invisalign Promo - Free Consultation - v1
✓ Dental Supply - Equipment Sale - 20% Off - v1

✗ Cool Template 1
✗ Test
✗ Untitled Campaign
```

**Guidelines:**
- Start with category for filtering
- Include objective for context
- Mention offer for differentiation
- Add version number for tracking
- Keep under 60 characters
- Use title case
- Avoid special characters

### When to Make Templates Global vs Organization-Specific

#### Use Global Templates When:

✓ Template applies to entire industry (e.g., "New Patient Special")
✓ Template has been tested and proven (ROAS >3.0x)
✓ Template benefits all users in your organization
✓ Template follows all advertising policies
✓ Template is fully documented with clear instructions

#### Use Organization Templates When:

✓ Template is specific to your practice style
✓ Template is experimental or untested
✓ Template contains proprietary strategies
✓ Template targets a niche market
✓ Template is still being refined

**Migration Path:**
1. Create as organization template
2. Test with 3-5 users
3. Collect 30 days of performance data
4. If successful (ROAS >3.0x), promote to global
5. Mark as featured if exceptional (ROAS >4.0x)

### How to Optimize Templates Based on Analytics

#### Step 1: Identify Optimization Opportunity

Review analytics to find:
- Templates with declining performance
- Templates with high spend but low ROAS
- Templates with low adoption despite good fit

#### Step 2: Diagnose the Issue

**Low ROAS Causes:**
- Offer not competitive
- Targeting too broad
- Ad copy not compelling
- Creative assets poor quality
- Landing page not optimized

**Low Adoption Causes:**
- Template too complex
- Dynamic fields confusing
- Category mismatch
- Not featured prominently
- Lacks usage examples

#### Step 3: Test Improvements

**A/B Test Framework:**

```yaml
Original Template:
  - Name: "New Patient $99"
  - Offer: $99
  - Headline: "New Patient Special"
  - ROAS: 2.5x

Test Variant A:
  - Name: "New Patient $99 v2"
  - Offer: FREE (value $150)
  - Headline: "FREE New Patient Special (Value $150)"
  - Test duration: 30 days

Test Variant B:
  - Name: "New Patient $99 v3"
  - Offer: $99 + Free Whitening
  - Headline: "$99 Exam + FREE Teeth Whitening"
  - Test duration: 30 days
```

Run variants simultaneously and compare:
- ROAS
- CTR
- Cost per lead
- Conversion rate

#### Step 4: Implement Winner

1. Identify best-performing variant
2. Update original template or create new version
3. Communicate changes to active users
4. Monitor performance for 30 days
5. Document learnings

#### Step 5: Share Learnings

- Document what worked and why
- Update template best practices guide
- Train users on optimized approach
- Apply learnings to similar templates

### Security and Access Control Guidelines

#### Template Security

**Before Publishing Global Templates:**

✓ Review for sensitive information (passwords, API keys)
✓ Remove test data and placeholder content
✓ Verify all URLs point to correct destinations
✓ Check for accidentally included personal data
✓ Ensure compliance with advertising policies
✓ Test dynamic field injection for XSS vulnerabilities

#### User Access Management

**Regular Audits:**
- Review user list monthly
- Deactivate inactive users (90+ days no login)
- Verify admin list is current
- Check for suspicious activity

**Password Policies:**
- Enforce strong passwords (12+ characters)
- Require 2FA for admin accounts
- Rotate admin passwords quarterly
- Never share login credentials

**Permission Reviews:**
- Audit admin permissions quarterly
- Apply principle of least privilege
- Remove access when roles change
- Document permission changes

#### Data Protection

**Sensitive Data Handling:**
- Never store passwords in templates
- Encrypt all access tokens
- Use environment variables for secrets
- Log access to sensitive operations

**Compliance:**
- Follow GDPR/CCPA requirements
- Obtain user consent for data usage
- Provide data export capability
- Honor deletion requests

**Backup and Recovery:**
- Daily automated backups
- Test restore procedures quarterly
- Store backups in separate location
- Encrypt backup data

---

## Troubleshooting

### Common Issues

#### Issue: Template Not Appearing for Users

**Symptoms:**
- Template created but not visible in marketplace
- Users report "No templates found"
- Template missing from browse view

**Causes:**
1. Template visibility set to "private" instead of "global"
2. Template not saved properly
3. Cache not refreshed
4. User filtering by wrong category

**Solutions:**

1. **Check Template Settings:**
   ```yaml
   Go to Template Management
   Find template
   Click Edit
   Verify: isGlobal = true
   Verify: visibility = "public"
   Save changes
   ```

2. **Clear Cache:**
   ```bash
   Settings > Advanced > Clear Template Cache
   ```

3. **Check User Filters:**
   - Ask user to reset filters (All Categories)
   - Clear search box
   - Refresh browser (Ctrl+R or Cmd+R)

4. **Verify Template Status:**
   - Ensure template is not marked as "Draft"
   - Check that template passed validation
   - Review error logs

#### Issue: Dynamic Fields Not Populating

**Symptoms:**
- User fills fields but ad shows `{{placeholder}}`
- Fields appear empty in preview
- Campaign launches with unfilled placeholders

**Causes:**
1. Typo in placeholder name
2. Field definition missing
3. Field not marked as required
4. JSON syntax error

**Solutions:**

1. **Verify Placeholder Syntax:**
   ```javascript
   // Correct
   "{{company_name}}"

   // Incorrect
   "{{ company_name }}"  // Extra spaces
   "{company_name}"      // Single braces
   "{{company-name}}"    // Hyphen instead of underscore
   ```

2. **Check Field Definition:**
   ```json
   {
     "fields": [
       {
         "name": "company_name",  // Must match placeholder exactly
         "type": "text",
         "required": true
       }
     ]
   }
   ```

3. **Test in Preview Mode:**
   - Go to Template Management
   - Click template
   - Click "Preview"
   - Fill fields
   - Verify placeholders replaced

4. **Check Error Console:**
   - Open browser developer tools (F12)
   - Go to Console tab
   - Look for JavaScript errors
   - Report errors to support

#### Issue: Analytics Not Updating

**Symptoms:**
- Dashboard shows old data
- Metrics not refreshing
- "Last updated" timestamp is old

**Causes:**
1. Facebook API sync delay
2. Cache not invalidated
3. Background job queue backed up
4. Database connection issue

**Solutions:**

1. **Manual Refresh:**
   - Click refresh button (↻) in top-right
   - Wait 30 seconds for data to load
   - Check "Last updated" timestamp

2. **Check Sync Status:**
   ```yaml
   Settings > Integrations > Facebook
   Check: Last Sync Time
   If > 4 hours ago: Click "Force Sync"
   ```

3. **Clear Analytics Cache:**
   ```bash
   Settings > Advanced > Clear Analytics Cache
   ```

4. **Verify API Connection:**
   ```yaml
   Settings > Integrations > Facebook
   Status: Connected (green)
   If not connected: Re-authorize Facebook
   ```

5. **Contact Support:**
   - If issue persists >24 hours
   - Provide screenshot of error
   - Include template ID and date range

#### Issue: User Cannot Launch Campaign

**Symptoms:**
- "Launch Campaign" button disabled
- Error message when attempting launch
- Form won't submit

**Causes:**
1. Required fields not filled
2. Validation errors
3. No ad account connected
4. Insufficient permissions
5. Facebook API error

**Solutions:**

1. **Check Required Fields:**
   - Review form for red asterisks (*)
   - Ensure all required fields filled
   - Look for validation error messages

2. **Verify Ad Account:**
   ```yaml
   Settings > Integrations
   Check: Ad Account Connected
   If not: Click "Connect Facebook Ad Account"
   Follow OAuth flow
   ```

3. **Check User Role:**
   ```yaml
   Settings > Profile
   Role: USER or ADMIN (both can launch)
   If VIEWER: Contact admin for permission upgrade
   ```

4. **Review Error Message:**
   - Error: "Invalid budget" → Budget must be >$5/day
   - Error: "Invalid URL" → Website URL must start with https://
   - Error: "Facebook API error" → Check Facebook connection

5. **Test with Different Template:**
   - Try launching different template
   - If works: Original template has issue
   - If doesn't work: Account/permission issue

### Getting Help

#### Built-in Help Resources

**Help Center:**
- Click "?" icon in top-right
- Search knowledge base
- Browse common questions
- Watch tutorial videos

**Tooltips:**
- Hover over (?) icons throughout app
- Read field descriptions
- View examples

**Documentation:**
- Admin Guide (this document)
- User Guide (`USER-GUIDE.md`)
- API Documentation (`API.md`)
- Quick Start Guide (`QUICK-START.md`)

#### Contacting Support

**Email Support:**
```
Email: support@yourcompany.com
Subject: [Admin] Your Issue Description
Include:
- Your email address
- Organization name
- Template ID (if applicable)
- Screenshot of issue
- Steps to reproduce
- Browser and version
```

**Response Times:**
- Critical (system down): 1 hour
- High (feature broken): 4 hours
- Medium (optimization help): 1 business day
- Low (general question): 2 business days

**Live Chat:**
- Click chat icon (bottom-right)
- Available Mon-Fri, 9am-5pm MST
- Average response time: 5 minutes

**Emergency Contact:**
- Phone: (555) 123-4567
- Only for critical issues outside business hours

---

## Appendix

### Glossary

**Ad Account** - Facebook advertising account where campaigns run

**ADMIN** - User role with full access to template management, analytics, and user management

**CTR (Click-Through Rate)** - Percentage of people who click ad after seeing it

**CPC (Cost Per Click)** - Average cost paid for each ad click

**CPM (Cost Per Mille)** - Cost per 1,000 impressions

**Dynamic Field** - Customizable placeholder in template (e.g., `{{company_name}}`)

**Global Template** - Template available to all users in organization

**Organization Template** - Template available only to specific organization

**Placeholder** - Variable in template using `{{field_name}}` syntax

**ROAS (Return on Ad Spend)** - Revenue generated per dollar spent (e.g., 3.0x = $3 revenue per $1 spent)

**Template** - Pre-configured ad campaign with dynamic fields for customization

**USER** - User role with access to browse templates and launch campaigns

### Keyboard Shortcuts

| Action | Shortcut (Mac) | Shortcut (Windows) |
|--------|----------------|-------------------|
| Search templates | Cmd+K | Ctrl+K |
| Create new template | Cmd+N | Ctrl+N |
| Save template | Cmd+S | Ctrl+S |
| Refresh data | Cmd+R | Ctrl+R |
| Open help | Cmd+/ | Ctrl+/ |
| Navigate to analytics | Cmd+1 | Ctrl+1 |
| Navigate to templates | Cmd+2 | Ctrl+2 |
| Navigate to users | Cmd+3 | Ctrl+3 |

### API Rate Limits

As an admin, you may encounter rate limits when:
- Syncing large numbers of campaigns
- Exporting analytics data
- Bulk template operations

**Limits:**
- Template API: 100 requests/minute
- Analytics API: 50 requests/minute
- Campaign Launch: 20 requests/minute
- Facebook Sync: 200 requests/hour

**Best Practices:**
- Use batch operations when possible
- Schedule large syncs during off-hours
- Cache analytics data
- Implement retry logic with exponential backoff

### Support Resources

**Documentation:**
- Admin Guide (this document)
- User Guide: `/docs/USER-GUIDE.md`
- API Documentation: `/docs/API.md`
- Quick Start: `/docs/QUICK-START.md`

**Video Tutorials:**
- Creating Your First Global Template (10 min)
- Understanding Dynamic Fields (8 min)
- Reading Analytics Dashboard (12 min)
- User Management Best Practices (15 min)

**Community:**
- Slack Channel: #facebook-ads-manager
- Monthly Admin Office Hours: First Tuesday, 2pm MST
- Best Practices Newsletter: Weekly

**Contact:**
- Email: support@yourcompany.com
- Phone: (555) 123-4567
- Live Chat: Mon-Fri 9am-5pm MST

---

**Document Version:** 1.0.0
**Last Updated:** January 2026
**Maintained by:** ORCHESTRAI Documentation Team
**Feedback:** documentation@yourcompany.com
