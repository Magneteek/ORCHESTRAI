# Local SEO Domain

This domain handles local search engine optimization, Google Business Profile optimization, local citations, and review management for businesses targeting geographic markets.

## Domain Overview

**Primary Focus**: Local search visibility and Google Maps ranking optimization

**Key Capabilities**:
- Google Business Profile (GBP) optimization and management
- Local citation building and NAP consistency
- Review generation and reputation management
- Local content creation and optimization
- Local link building strategies
- Map pack ranking optimization

## Pipelines

### Local SEO Pipeline
**File**: `pipelines/local-seo-pipeline.js`
**Duration**: ~90 minutes
**Agents Used**: seo-local-seo, reviews-intelligence-specialist

**Stages**:
1. GBP Audit & Optimization (20 min)
2. Local Citation Building (25 min)
3. Review Management Strategy (15 min)
4. Local Content Creation (20 min)
5. Local Link Building (10 min)

**Deliverables**:
- Google Business Profile optimization report
- Local citation directory list
- Review generation strategy
- Localized content recommendations
- Local backlink opportunities

## Agents

### Primary Agent: seo-local-seo
**Definition**: `.claude/agents/seo-local-seo.md`

**Capabilities**:
- GBP optimization (categories, business description, attributes)
- NAP (Name, Address, Phone) consistency auditing
- Local citation building strategy
- Review monitoring and response strategies
- Local schema markup implementation
- Google Maps ranking factors optimization

### Supporting Agent: reviews-intelligence-specialist
**Definition**: `.claude/agents/reviews-intelligence-specialist.md`

**Capabilities**:
- Google reviews monitoring and analysis
- Negative review identification and response strategies
- Competitor review intelligence
- Review generation campaigns
- Sentiment analysis

## Integration Points

**Crystalline Memory**:
- Store GBP optimization strategies in `local-seo-strategies` memory pool
- Share citation building tactics across SEO agents
- Track review response best practices
- Build knowledge base of local ranking factors by industry

**MCP Tools**:
- `mcp__dataforseo__business_data_search` - Find local businesses
- `mcp__dataforseo__business_data_info` - Get GBP details
- `mcp__dataforseo__business_data_reviews` - Monitor reviews
- `mcp__memory__create_entities` - Store local business data
- `mcp__sequential-thinking` - Complex local SEO strategy development

## Success Metrics

**Primary KPIs**:
- Google Maps ranking position (target: top 3 in map pack)
- GBP views and actions (calls, website visits, directions)
- Review quantity and average rating (target: 4.5+ stars, 50+ reviews)
- Local citation count and consistency (target: 50+ citations, 100% NAP consistency)
- Local organic traffic growth (target: 30%+ increase in 3 months)

**Secondary KPIs**:
- Local keyword rankings
- Click-through rate from maps
- Review response rate and time
- Schema markup implementation
- Local backlink acquisition

## Usage Examples

### Execute Local SEO Pipeline

```javascript
const pipelineRegistry = require('../../shared/pipeline-assembly/pipeline-registry');

const projectSpec = {
  clientId: 'local-business-123',
  businessName: 'Downtown Dental Clinic',
  location: 'Seattle, WA',
  industry: 'dental',
  targetKeywords: ['dentist seattle', 'dental clinic downtown'],
  competitors: ['competitor1.com', 'competitor2.com']
};

const result = await pipelineRegistry.executePipeline('local-seo', projectSpec);
console.log('Local SEO deliverables:', result.deliverablePaths);
```

## Development Guidelines

**Pipeline Implementation**:
- Follow existing pipeline pattern (EventEmitter-based)
- Include comprehensive error handling
- Emit progress events for each stage
- Store results in crystalline memory
- Generate detailed reports in deliverables folder

**Testing**:
- Unit tests for each pipeline stage
- Integration tests with MCP tools
- Validation of GBP optimization recommendations
- Citation accuracy verification
- Review strategy effectiveness testing

## Related Domains

- **SEO Domain**: Share keyword research and technical SEO insights
- **Content Domain**: Collaborate on localized content creation
- **Reputation Domain**: Integrate review management strategies

## Version History

- **v1.0** (2025-10-21): Initial implementation
  - GBP optimization pipeline
  - Local citation building
  - Review management integration
  - Local content strategy
  - Local link building
