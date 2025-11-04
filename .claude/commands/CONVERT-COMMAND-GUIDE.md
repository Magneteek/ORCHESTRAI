# `/convert` Slash Command Guide

## Quick Start

Simply type `/convert` in Claude Code to instantly convert all DRNL markdown articles to WordPress HTML.

---

## Usage Examples

### 1. Convert DRNL Articles (Default)
```
/convert
```
or
```
/convert drnl
```

**What it does**:
- Finds all `*artikel*.md` files in DRNL content directory
- Converts to WordPress HTML in ~0.01 seconds per file
- Outputs to `wordpress-html/` directory
- Shows summary report

---

### 2. Convert Specific Project
```
/convert quartziq
```

**What it does**:
- Searches for QuartzIQ project directory
- Converts all articles found
- Auto-detects input/output directories

---

### 3. Convert Custom Directories
```
/convert /path/to/markdown /path/to/output
```

**What it does**:
- Converts files from specified input directory
- Saves HTML to specified output directory
- Useful for non-standard project structures

---

## Command Flow

```
Type /convert
    ↓
Claude executes fast script
    ↓
0.07 seconds later...
    ↓
13 articles converted ✅
    ↓
Summary report displayed
```

---

## What Gets Converted

The script converts:
- ✅ Headers (h1, h2, h3)
- ✅ Bold, italic, bold+italic
- ✅ Tables with proper WordPress structure
- ✅ Lists (bullets, numbered, checkboxes)
- ✅ Info boxes and framework boxes
- ✅ Links (internal and external)
- ✅ Blockquotes
- ✅ Paragraphs with proper spacing

---

## Performance

| Metric | Value |
|--------|-------|
| **Speed** | 0.01s per article |
| **Batch (13 files)** | 0.07s total |
| **vs AI Agent** | 13,714x faster |
| **Cost** | $0.00 (no API calls) |

---

## Output Format

After running `/convert`, you'll see:

```
🚀 Batch Markdown → HTML Converter

Input:  projects/drnl-[uuid]/deliverables/content
Output: projects/drnl-[uuid]/deliverables/content/wordpress-html

Found 13 article(s) to convert:

📄 Converting: onterechte-review-aanpakken-artikel.md
   ✅ 64.6KB - Completed in 0.01s

[... more files ...]

════════════════════════════════════════════════════════════
📊 CONVERSION SUMMARY
════════════════════════════════════════════════════════════
Total files:      13
Successful:       13 ✅
Failed:           0
Total time:       0.07s
Avg per file:     0.01s
Speed vs AI:      13714x faster
════════════════════════════════════════════════════════════

✨ Conversion complete!
```

---

## File Naming Convention

Input: `onterechte-review-aanpakken-artikel.md`
Output: `onterechte-review-aanpakken-artikel-WORDPRESS.html`

The `-WORDPRESS.html` suffix makes it easy to identify converted files.

---

## Troubleshooting

### "No markdown files found"
**Solution**: Ensure files match pattern `*artikel*.md`

### "Directory not found"
**Solution**: Check project path or use absolute paths

### "Script error"
**Solution**: Verify Node.js is installed: `node --version`

---

## When NOT to Use `/convert`

The fast script handles 99% of conversions perfectly. Only use AI agent if:
- ❌ Script output has formatting errors
- ❌ Article has extremely complex nested structures
- ❌ You need context-aware conversion decisions

For these rare cases, use:
```
Task tool with subagent_type="content-writer-specialist"
```

---

## Integration with Publishing Workflow

### Recommended Workflow:

1. **Write articles** in markdown
2. **Run `/convert`** to generate HTML
3. **Spot-check** 1-2 files for quality
4. **Copy-paste** HTML into WordPress
5. **Publish** immediately

**Time saved**: 64 minutes per batch of 4 articles

---

## Behind the Scenes

The `/convert` command executes:
```bash
node scripts/batch-convert-markdown-to-html.js
```

This Node.js script:
- Uses regex for fast pattern matching
- Handles WordPress-specific formatting
- Processes files in parallel
- Provides detailed progress reporting

---

## Pro Tips

💡 **Tip 1**: Run `/convert` before publishing to ensure all files are up-to-date

💡 **Tip 2**: Use `/convert` after editing multiple articles to batch convert efficiently

💡 **Tip 3**: Check the summary report to verify all files converted successfully

💡 **Tip 4**: Keep the fast script for routine work, AI agent for exceptions

---

## Comparison to Old Method

| Aspect | Old (AI Agent) | New (/convert) |
|--------|----------------|----------------|
| **Time per article** | 15-17 minutes | 0.01 seconds |
| **Time for 4 articles** | 68 minutes | 0.04 seconds |
| **Cost** | $0.50-$2.00 | $0.00 |
| **Reliability** | Variable | Consistent |
| **User effort** | Type command, wait 17 min | Type command, done in 1 sec |

---

## Questions?

- **Script location**: `scripts/batch-convert-markdown-to-html.js`
- **Command definition**: `.claude/commands/convert.md`
- **Full documentation**: `MARKDOWN-HTML-CONVERSION-GUIDE.md`

---

**Ready to try it?** Just type `/convert` and watch the magic happen! ⚡
