# ORCHESTRAI Slash Commands Reference

Quick reference for all available slash commands in the ORCHESTRAI system.

---

## Content & Publishing

### `/convert` - Fast Markdown to HTML Conversion ⚡

**Purpose**: Convert markdown articles to WordPress-ready HTML in seconds

**Speed**: 13,714x faster than AI agent conversion (0.01s vs 17 min per article)

**Usage**:
```
/convert                    # Convert DRNL articles (default)
/convert drnl              # Same as above
/convert [project-name]    # Convert specific project
/convert [input] [output]  # Custom directories
```

**Output**: WordPress-ready HTML files with:
- Clean semantic tags (h1/h2/h3, p, ul, table)
- Proper table formatting
- Styled info boxes
- Internal linking structure
- No doctype/wrapper (paste-ready)

**When to use**:
- ✅ Publishing articles today (batch conversion)
- ✅ Routine weekly publishing workflow
- ✅ Converting 4+ articles at once
- ❌ NOT for complex edge cases (use AI agent)

**Documentation**: `.claude/commands/CONVERT-COMMAND-GUIDE.md`

---

## SEO Commands

### `/seo-audit` - Comprehensive SEO Analysis

**Purpose**: Run full technical SEO audit using DataForSEO

**Usage**:
```
/seo-audit [domain]
```

### `/seo-keyword` - Keyword Research

**Purpose**: Research keywords and search volume data

**Usage**:
```
/seo-keyword [seed-keyword]
```

### `/seo-serp` - SERP Analysis

**Purpose**: Analyze search engine results pages

**Usage**:
```
/seo-serp [keyword]
```

### `/seo-compare` - Competitor Comparison

**Purpose**: Compare your site against competitors

**Usage**:
```
/seo-compare [your-domain] [competitor-domain]
```

### `/seo-status` - Domain Status Check

**Purpose**: Quick SEO health check

**Usage**:
```
/seo-status [domain]
```

### `/seo-report` - Generate SEO Report

**Purpose**: Create comprehensive SEO report

**Usage**:
```
/seo-report [domain]
```

---

## Project Management

### `/init-client-project` - Initialize Client Project

**Purpose**: Set up new client project structure

**Usage**:
```
/init-client-project [client-name]
```

### `/analyze-project` - Project Analysis

**Purpose**: Analyze existing project structure and health

**Usage**:
```
/analyze-project [project-path]
```

### `/status` - System Status Check

**Purpose**: Check ORCHESTRAI system health

**Usage**:
```
/status
```

---

## Development

### `/init-app` - Initialize Application

**Purpose**: Scaffold new web application

**Usage**:
```
/init-app [stack-type]
```

**Stack types**: nextjs, static-html, nodejs-api, react-native

### `/init-tool` - Initialize Tool/Library

**Purpose**: Scaffold new tool or library project

**Usage**:
```
/init-tool [language]
```

**Languages**: typescript, javascript, python, rust

---

## Agent Management

### `/create-agent` - Create New Agent

**Purpose**: Generate new specialized agent definition

**Usage**:
```
/create-agent [agent-type]
```

### `/review-agent` - Review Agent Performance

**Purpose**: Analyze agent effectiveness and optimization

**Usage**:
```
/review-agent [agent-name]
```

---

## Quality Assurance

### `/qa-content` - Content Quality Check

**Purpose**: Run AI phrase detection and quality validation

**Usage**:
```
/qa-content [file-path]
```

### `/debug-pipeline` - Debug Pipeline

**Purpose**: Troubleshoot pipeline execution issues

**Usage**:
```
/debug-pipeline [pipeline-name]
```

---

## Quick Start Guide

### Most Frequently Used Commands

1. **`/convert`** - Convert articles to HTML (use weekly)
2. **`/seo-audit [domain]`** - Run SEO audit (use monthly)
3. **`/init-client-project [name]`** - Start new client (use per client)
4. **`/qa-content [file]`** - Check content quality (use before publish)

---

## Command Development

### Creating New Slash Commands

1. Create file in `.claude/commands/[name].md`
2. Write command prompt with clear instructions
3. Include usage patterns and examples
4. Document in this reference file

### Command Best Practices

- ✅ Clear, action-oriented names
- ✅ Default behavior for no arguments
- ✅ Multiple usage patterns supported
- ✅ Error handling instructions
- ✅ Output format specification

---

## Performance Comparison

| Task | Manual | AI Agent | Slash Command |
|------|--------|----------|---------------|
| **Convert 4 articles** | 30 min | 68 min | 8 seconds ⚡ |
| **SEO audit** | 2 hours | 45 min | 5 min ⚡ |
| **Keyword research** | 1 hour | 30 min | 3 min ⚡ |
| **Init project** | 45 min | 20 min | 2 min ⚡ |

---

## Troubleshooting

### Command Not Found

**Issue**: Slash command doesn't appear in autocomplete

**Solution**:
1. Check file exists: `.claude/commands/[name].md`
2. Restart Claude Code
3. Verify markdown formatting

### Command Errors

**Issue**: Command runs but produces errors

**Solution**:
1. Check command definition for syntax errors
2. Verify all required tools are installed (Node.js, etc.)
3. Check file paths are correct

### Slow Performance

**Issue**: Command takes longer than expected

**Solution**:
1. Check if using AI agent when script would be faster
2. Verify network connection for API-based commands
3. Review command logs for bottlenecks

---

## Documentation Files

- **System Overview**: `CLAUDE.md`
- **Conversion Guide**: `MARKDOWN-HTML-CONVERSION-GUIDE.md`
- **Convert Command**: `.claude/commands/CONVERT-COMMAND-GUIDE.md`
- **This Reference**: `SLASH-COMMANDS-REFERENCE.md`

---

**For detailed command documentation, see individual guides in `.claude/commands/`**
