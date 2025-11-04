# ORCHESTRAI Slash Commands - Quick Reference

## 🎯 Quick Command List

```bash
/init-client-project [name]  # Start new client engagement
/analyze-project [name]      # Review existing client work
/review-agent [name]         # Validate agent implementation
/qa-content [filename]       # Quality check content
/create-agent [purpose]      # Build new specialized agent
/debug-pipeline [name]       # Troubleshoot pipeline issues
/status                      # System health overview
```

## 📋 Common Workflows

### New Client Onboarding
```
1. /init-client-project ClientName
2. [Provide details]
3. [Create deliverables with Task tool]
4. /qa-content [files]
5. /analyze-project ClientName
```

### Content Publication
```
1. [Create outline with agent]
2. [Write content with agent]
3. /qa-content filename.md
4. [Revise based on feedback]
5. /qa-content filename.md (verify)
```

### System Maintenance
```
1. /status (weekly)
2. /analyze-project [active-clients]
3. /review-agent [new-agents]
4. /debug-pipeline [if issues]
```

## 💡 When to Use What

| Situation | Command |
|-----------|---------|
| New client arrives | `/init-client-project` |
| Need to check client status | `/analyze-project` |
| Created/modified an agent | `/review-agent` |
| Before publishing content | `/qa-content` |
| Adding new capability | `/create-agent` |
| Something's not working | `/debug-pipeline` |
| Weekly health check | `/status` |

## 📚 Full Documentation

See [SLASH-COMMANDS-GUIDE.md](../SLASH-COMMANDS-GUIDE.md) for complete details, examples, and advanced techniques.

## 🆘 Troubleshooting

**Command not working?**
- Check filename matches: `command-name.md`
- Verify location: `.claude/commands/`
- Use exact syntax: `/command-name`

**Need help?**
- Type `/help` for system commands
- Read the full guide linked above
- Check existing commands for examples
