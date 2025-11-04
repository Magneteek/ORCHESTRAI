# Email Marketing Domain

## Domain Overview

The Email Marketing Domain provides comprehensive email campaign creation, automation workflows, drip sequences, and nurture campaigns with focus on relationship building, behavioral triggers, and conversion optimization.

**Domain Focus**: Email automation, nurture sequences, behavioral triggers, relationship building

---

## Specialized Agents

### Email Campaign Agents
- **`email-marketing-automator`** - Automated campaigns, drip sequences, behavioral triggers
- **`nurture-email-copywriter`** - Relationship building, trust development, long-term engagement
- **`cold-email-copywriter`** - Cold outreach, personalized emails, high-reply sequences

### Optimization Agents
- **`conversion-optimization-specialist`** - Email funnel optimization, engagement metrics
- **`direct-response-copywriter`** - AIDA, PAS, PASTOR frameworks for sales emails

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Email Marketing Workflows

### 1. Nurture Sequence Creation

**Direct Agent Invocation**

```
Task tool → nurture-email-copywriter → Nurture Sequence

Sequence Structure:
- Welcome email (relationship foundation)
- Value delivery (3-5 emails)
- Trust building (case studies, testimonials)
- Soft pitch (problem-solution alignment)
- Direct offer (clear CTA)

Deliverables:
- Complete email sequence (5-10 emails)
- Subject line variations
- Send timing recommendations
- Behavioral trigger points
```

**Use When**: Building long-term customer relationships

### 2. Cold Email Outreach

**Direct Agent Invocation**

```
Task tool → cold-email-copywriter → Outreach Sequence

Cold Email Framework:
- Personalized hook (research-based)
- Value proposition (clear benefit)
- Social proof (quick credibility)
- Low-friction CTA (reply, not sale)

Optimization:
- Subject line A/B testing
- Personalization at scale
- Follow-up sequence (3-5 emails)
- Reply rate optimization
```

**Use When**: B2B outreach, partnership development, lead generation

### 3. Automated Email Workflows

**Direct Agent Invocation**

```
Task tool → email-marketing-automator → Automation Workflow

Trigger-Based Campaigns:
- Welcome series (new subscriber)
- Abandoned cart (e-commerce)
- Re-engagement (inactive subscribers)
- Post-purchase (customer onboarding)
- Birthday/anniversary (relationship)

Integration:
- CRM data triggers
- Website behavior tracking
- Purchase history
- Engagement scoring
```

**Use When**: Scaling email marketing with automation

---

## Email Copywriting Frameworks

### AIDA (Attention, Interest, Desire, Action)
```
Attention: Compelling subject line + opening hook
Interest: Problem identification + relevance
Desire: Solution benefits + transformation
Action: Clear, single CTA + urgency
```

### PAS (Problem, Agitate, Solve)
```
Problem: Identify pain point reader experiences
Agitate: Amplify consequences of not solving
Solve: Present solution + ease of implementation
```

### PASTOR Framework
```
Problem: Define the specific issue
Amplify: Increase emotional urgency
Story: Share relatable transformation
Testimony: Provide social proof
Offer: Present clear solution
Response: Compelling call-to-action
```

---

## Integration with Universal Agent Pattern

```javascript
// Nurture sequence creation
Task(
  subagent_type="nurture-email-copywriter",
  prompt="Create 7-email nurture sequence for dental implant patients..."
)

// Cold outreach campaign
Task(
  subagent_type="cold-email-copywriter",
  prompt="Create personalized cold email sequence for B2B SaaS outreach..."
)

// Automated workflow
Task(
  subagent_type="email-marketing-automator",
  prompt="Design welcome sequence automation with behavioral triggers..."
)
```

---

## Email Marketing Best Practices

### Subject Line Optimization
```
✅ Keep under 50 characters (mobile display)
✅ Personalization (name, company, pain point)
✅ Curiosity without clickbait
✅ A/B test multiple variations
❌ Avoid spam trigger words (FREE, ACT NOW, LIMITED TIME)
❌ ALL CAPS or excessive punctuation!!!
```

### Email Body Best Practices
```
✅ One primary CTA per email
✅ Conversational, personal tone
✅ Short paragraphs (1-3 sentences)
✅ Value-first, not pitch-first
✅ Mobile-optimized formatting
❌ Image-heavy emails (low deliverability)
❌ Multiple competing CTAs
❌ Long-winded introductions
```

### Deliverability Optimization
```
✅ Warm up new email domains gradually
✅ Clean email list regularly (remove bounces)
✅ Authenticate with SPF, DKIM, DMARC
✅ Monitor sender reputation
✅ Engagement-based list segmentation
❌ Purchased email lists
❌ Generic "noreply@" sender addresses
❌ Deceptive subject lines
```

---

## Behavioral Trigger Automation

### Website Behavior Triggers
```
- Page visit (specific product/service)
- Time on site (engagement level)
- Exit intent (abandonment)
- Download (lead magnet)
- Video watch (content engagement)
```

### Engagement Triggers
```
- Email open (interested)
- Link click (highly engaged)
- No open (re-engagement needed)
- Unsubscribe attempt (win-back opportunity)
```

### Transaction Triggers
```
- Cart abandonment (reminder + incentive)
- Purchase completion (thank you + upsell)
- Renewal approaching (retention)
- Subscription cancellation (win-back)
```

---

## Integration with Client Intelligence

```javascript
// Use ICP psychographics for email messaging
const icp = await memory.retrieve(`${clientName}-ICP`)

// Segment-specific email variations
Segment 1 (Anxious): Reassuring, detailed, supportive tone
Segment 2 (Confident): Efficient, fact-based, quick value

// Personalization tokens
const personalization = {
  painPoint: icp.segments[0].painPoints[0],
  motivation: icp.segments[0].motivations[0],
  objection: icp.segments[0].objections[0]
}
```

---

## File Organization

```
/projects/[client-uuid]/
├── deliverables/
│   └── email-marketing/
│       ├── nurture-sequences/
│       │   ├── dental-implant-nurture-7-email.md
│       │   ├── subject-line-variations.json
│       │   └── timing-recommendations.json
│       ├── cold-outreach/
│       │   ├── b2b-saas-outreach-sequence.md
│       │   └── personalization-templates.json
│       ├── automation-workflows/
│       │   ├── welcome-series-automation.json
│       │   ├── abandoned-cart-workflow.json
│       │   └── re-engagement-campaign.json
│       └── performance/
│           ├── ab-test-results.json
│           └── engagement-metrics.json
```

---

## Performance Metrics

### Email Engagement Targets
```
Open Rate:
- Cold email: 30-40%
- Nurture: 40-50%
- Promotional: 20-30%

Click-Through Rate (CTR):
- Nurture: 10-15%
- Promotional: 5-10%
- Cold email: 8-12%

Reply Rate (Cold Email):
- Initial: 10-15%
- With follow-up: 20-30%

Conversion Rate:
- Lead to customer: 2-5%
- Engagement to action: 5-10%
```

### Deliverability Targets
```
Inbox Placement: >95%
Bounce Rate: <2%
Spam Complaint Rate: <0.1%
Unsubscribe Rate: <0.5%
```

---

## Troubleshooting

### Low Open Rates
```
Solutions:
- A/B test subject lines
- Improve sender name recognition
- Clean email list (remove non-engagers)
- Send time optimization
- Re-warm email domain
```

### Low Click Rates
```
Solutions:
- Clarify CTA (single, prominent)
- Improve value proposition
- Reduce friction
- Better email-landing page alignment
- Segment for relevance
```

### Deliverability Issues
```
Solutions:
- Check SPF/DKIM/DMARC setup
- Monitor sender reputation
- Reduce email frequency
- Improve list quality
- Remove spam trigger words
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[../../.claude/agents/email-marketing-automator.md](../../.claude/agents/email-marketing-automator.md)** - Email automation agent
- **[../client-intelligence/CLAUDE.md](../client-intelligence/CLAUDE.md)** - ICP integration for personalization

---

**This domain focuses on relationship-first email marketing with behavioral automation. Use psychographic targeting for personalized messaging at scale.**
