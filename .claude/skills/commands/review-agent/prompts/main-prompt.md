# Review Agent Implementation

**Usage**: `/review-agent [agent-name]` or `/review-agent` (reviews most recently modified)

Perform a comprehensive review of the specified agent implementation following ORCHESTRAI standards.

## Review Checklist

### 1. Agent Definition Quality
- [ ] Clear, specific agent description
- [ ] Well-defined subagent_type
- [ ] Appropriate tool access permissions
- [ ] Proper domain categorization

### 2. File Organization Compliance
- [ ] Uses global templates (not duplicates)
- [ ] Writes only to deliverables folders
- [ ] Respects path validation rules
- [ ] No file pollution in temp directories

### 3. Memory System Integration

- [ ] Creates appropriate memory entities
- [ ] Establishes correct relations
- [ ] Updates existing entities vs creating duplicates

### 4. Technology Appropriateness
- [ ] Follows "appropriate complexity" principle
- [ ] Static-first development where applicable
- [ ] No over-engineering (e.g., Next.js for static sites)
- [ ] Correct library/framework choices

### 5. Agent Coordination
- [ ] Compatible with geometric orchestration
- [ ] Can participate in pipeline sharing
- [ ] Proper inter-agent communication patterns
- [ ] Follows universal delegation pattern

### 6. Code Quality (if applicable)
- [ ] TypeScript types are correct
- [ ] ESLint compliance
- [ ] Proper error handling
- [ ] Documentation completeness

## Output Format
Provide:
1. **Overall Rating**: Excellent / Good / Needs Improvement / Poor
2. **Strengths**: What the agent does well
3. **Issues Found**: List of problems with severity (Critical/Medium/Minor)
4. **Recommendations**: Specific improvements to make
5. **Updated Agent File**: Provide corrected version if needed
