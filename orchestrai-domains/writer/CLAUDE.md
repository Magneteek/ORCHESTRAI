# Writer Domain

## Domain Overview

The Writer Domain provides general writing workflows and coordination, serving as an integration point for specialized writing agents across content, healthcare, technical documentation, and copywriting domains.

**Domain Focus**: Writing coordination, multi-domain writing integration

---

## Specialized Agents

This domain coordinates writers from specialized domains:

### Content Writing
- **`content-writer-specialist`** - General content creation (see [../content/CLAUDE.md](../content/CLAUDE.md))
- **`healthcare-content-specialist`** - Medical/dental content (see [../healthcare-content/CLAUDE.md](../healthcare-content/CLAUDE.md))
- **`technical-documentation-specialist`** - Technical writing

### Copywriting
- **`direct-response-copywriter`** - Sales copy (AIDA, PAS, PASTOR frameworks)
- **`nurture-email-copywriter`** - Email nurture sequences (see [../email-marketing/CLAUDE.md](../email-marketing/CLAUDE.md))
- **`cold-email-copywriter`** - Cold outreach sequences
- **`ad-copy-variation-generator`** - Ad copy and variations (see [../advertising-enhanced/CLAUDE.md](../advertising-enhanced/CLAUDE.md))

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Writing Workflows

### Content Creation
```
Refer to specialized domain workflows:
- General content: ../content/CLAUDE.md
- Healthcare content: ../healthcare-content/CLAUDE.md
- Email marketing: ../email-marketing/CLAUDE.md
- Ad copywriting: ../advertising-enhanced/CLAUDE.md
```

### Universal Writing Principles
```
All writing follows:
1. Outline-first approach
2. Psychographic targeting
3. Natural conversational flow
4. Quality assurance validation
5. AI detection prevention (<30%)
```

---

## Integration with Universal Agent Pattern

```javascript
// Use specialized writing agents based on content type
Task(subagent_type="content-writer-specialist", ...) // General content
Task(subagent_type="healthcare-content-specialist", ...) // Medical
Task(subagent_type="direct-response-copywriter", ...) // Sales copy
Task(subagent_type="nurture-email-copywriter", ...) // Email nurture
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main architecture
- **[../../CONTENT-CREATION-GUIDE.md](../../CONTENT-CREATION-GUIDE.md)** - Writing standards
- **[../content/CLAUDE.md](../content/CLAUDE.md)** - Content domain
- **[../healthcare-content/CLAUDE.md](../healthcare-content/CLAUDE.md)** - Healthcare writing
- **[../email-marketing/CLAUDE.md](../email-marketing/CLAUDE.md)** - Email copywriting
- **[../advertising-enhanced/CLAUDE.md](../advertising-enhanced/CLAUDE.md)** - Ad copywriting

---

**This domain coordinates writing across all specialized domains. Refer to domain-specific CLAUDE.md files for detailed workflows.**
