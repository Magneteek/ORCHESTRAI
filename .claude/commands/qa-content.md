# Content Quality Assurance

**Usage**: `/qa-content [filename]` or `/qa-content` (for most recent content)

Run comprehensive quality assurance checks on content following ORCHESTRAI content creation standards.

## Quality Validation Checklist

### 1. AI Detection Analysis
- [ ] Run content-ai-phrase-detector agent
- [ ] Verify detection rate <30% threshold
- [ ] Identify and flag AI-typical phrases
- [ ] Assess natural flow and human voice

### 2. Structural Compliance
- [ ] Matches approved outline requirements
- [ ] Proper heading hierarchy (H2, H3, H4)
- [ ] Appropriate paragraph distribution
- [ ] Table usage is justified and well-formatted
- [ ] Word count within ±10% of target

### 3. SEO Optimization
- [ ] Primary keyword placement (title, H2, intro, conclusion)
- [ ] Secondary keyword integration (natural, not forced)
- [ ] Meta description quality (150-160 chars)
- [ ] Meta title optimization (55-60 chars)
- [ ] Internal linking opportunities

### 4. Language & Readability
- [ ] Grammar and spelling accuracy
- [ ] Consistent tone and voice
- [ ] Reading level appropriate for audience
- [ ] Transition quality between sections
- [ ] Active voice predominance

### 5. Factual Accuracy (if healthcare/technical)
- [ ] Medical/technical claims properly sourced
- [ ] No health claims requiring FDA approval
- [ ] Compliance with industry regulations
- [ ] Expert review requirements noted

### 6. Competitive Analysis
- [ ] Competitive depth analysis vs top 10 SERP
- [ ] Unique value propositions identified
- [ ] Content differentiation achieved
- [ ] Better than competitor average

## Output Format
Provide:
1. **Quality Score**: 0-100 with breakdown by category
2. **Critical Issues**: Must-fix items blocking publication
3. **Recommended Improvements**: Enhance content quality
4. **AI Detection Report**: Specific phrases to revise
5. **SEO Recommendations**: Optimization opportunities
6. **Approval Status**: APPROVED / NEEDS REVISION / REJECTED

If NEEDS REVISION, provide specific revision instructions.
