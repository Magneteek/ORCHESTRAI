# Installed Claude Plugins Reference

**Installation Date**: December 16, 2025
**Location**: `/Users/kris/.claude/plugins/`

---

## Currently Installed Plugins

### 1. **plugin-dev** (`plugin-dev@claude-plugins-official`)
**Purpose**: Plugin development tools
**Features**:
- Create custom slash commands
- Develop custom skills
- Configure plugin settings
- Organize plugin components
- Hook development

**Usage**:
- Slash commands: `/plugin-dev:create-plugin`
- Skills: Various plugin development skills

---

### 2. **playwright** (`playwright@claude-plugins-official`)
**Purpose**: Browser automation and testing
**Features**:
- Automated web testing
- Browser interaction
- Screenshot capture
- Form filling
- Navigation automation

**Usage**: MCP tools available (`mcp__plugin_playwright_playwright__*`)

**Integration with ORCHESTRAI**:
- Complements `e2e-test-automator` agent
- Use for browser automation tasks
- Integrates with `comprehensive-testing-pipeline.js`

---

### 3. **agent-sdk-dev** (`agent-sdk-dev@claude-plugins-official`)
**Purpose**: Claude Agent SDK development
**Features**:
- Create new Agent SDK applications
- TypeScript and Python support
- Verification and validation tools

**Usage**:
- Slash commands: `/agent-sdk-dev:new-sdk-app [project-name]`
- Agents: `agent-sdk-verifier-ts`, `agent-sdk-verifier-py`

**Integration with ORCHESTRAI**: ⭐ HIGH STRATEGIC VALUE
- **NEW DELIVERABLE TYPE**: Standalone agent products for clients
- Complements ORCHESTRAI (not replacement)
- Use Cases:
  * Customer support chatbots
  * Code review agents
  * Content creation agents
  * SRE automation tools
- **Estimated Value**: $140K-$200K/year in new revenue
- **See**: [AGENT-SDK-PLUGIN-GUIDE.md](AGENT-SDK-PLUGIN-GUIDE.md) for complete strategy

---

### 4. **frontend-design** (`frontend-design@claude-plugins-official`) ⭐ NEW
**Purpose**: Creative, distinctive frontend UI/UX design
**Features**:
- Bold aesthetic direction
- Distinctive typography
- Creative animations
- Unexpected layouts
- Production-grade code

**Usage**:
- Skill: `frontend-design:frontend-design`
- Invoked via: `Skill` tool

**Integration with ORCHESTRAI**:
- Complements existing frontend agents
- Use for creative, one-off designs
- Perfect for landing pages with bold aesthetics
- See [FRONTEND-PLUGIN-INTEGRATION-GUIDE.md](FRONTEND-PLUGIN-INTEGRATION-GUIDE.md)

---

### 5. **hookify** (`hookify@claude-plugins-official`)
**Purpose**: Claude Code hooks management
**Features**:
- Webhook configuration
- Event tracking
- Workflow analytics
- Token usage monitoring

**Usage**: Enhances Claude Code hooks system

**Integration with ORCHESTRAI**:
- Already integrated via `CLAUDE-CODE-HOOKS.md`
- Webhook endpoints on `localhost:5501`
- Complements existing token monitoring

---

## Plugin Usage Quick Reference

### When to Use Each Plugin

| Task | Plugin to Use | Notes |
|------|--------------|-------|
| **Creative landing page** | `frontend-design` skill | Bold, distinctive design |
| **Browser automation** | `playwright` MCP tools | Testing, screenshots |
| **Build Agent SDK app** | `agent-sdk-dev` commands | Separate from ORCHESTRAI |
| **Create custom command** | `plugin-dev` skills | Extend Claude Code |
| **Hook management** | `hookify` | Webhook configuration |

---

## Integration Status

### ✅ Fully Integrated
- **hookify**: Hooks system already configured
- **playwright**: MCP tools available
- **frontend-design**: Skill ready to use

### ⚠️ Separate Systems
- **agent-sdk-dev**: Creates standalone apps (different architecture)
- **plugin-dev**: For extending Claude Code itself

---

## Comparison: Plugins vs ORCHESTRAI Agents

### Plugins (Claude Code Extensions)
- **Scope**: Extend Claude Code functionality
- **Invocation**: Skills, slash commands, MCP tools
- **Examples**: `frontend-design` skill, `playwright` MCP

### ORCHESTRAI Agents (Custom Multi-Agent System)
- **Scope**: Domain-specific autonomous execution
- **Invocation**: `Task` tool with specialized agents
- **Examples**: `frontend-architect-specialist`, `seo-keyword-research`

### Key Difference
- **Plugins**: Built-in Claude Code features (official/community)
- **ORCHESTRAI Agents**: Your custom agent ecosystem (103 agents)

Both systems **complement each other** - use plugins for built-in features, use agents for your custom workflows.

---

## Plugin Management Commands

### Check Installed Plugins
```bash
cat /Users/kris/.claude/plugins/installed_plugins.json
```

### View Plugin Cache
```bash
ls -la /Users/kris/.claude/plugins/cache/claude-plugins-official/
```

### Install New Plugin
```
/plugin search <plugin-name>
/plugin install <plugin-name>
```

### Restart After Installation
```
/restart
# or restart Claude Code application
```

---

## Recommended Additions

### Consider Installing

1. **Memory Plugin** (if available)
   - Persistent knowledge graphs
   - Complements crystalline memory system

2. **Database Plugin** (if available)
   - Direct database access
   - Complements PostgreSQL agents

3. **API Testing Plugin** (if available)
   - API validation and testing
   - Complements API development pipeline

---

## Next Steps

1. **Read Integration Guide**: [FRONTEND-PLUGIN-INTEGRATION-GUIDE.md](FRONTEND-PLUGIN-INTEGRATION-GUIDE.md)
2. **Test frontend-design Skill**: Create a distinctive landing page
3. **Explore playwright Tools**: Browser automation for testing
4. **Review Claude Code Hooks**: [CLAUDE-CODE-HOOKS.md](CLAUDE-CODE-HOOKS.md)

---

**Last Updated**: December 16, 2025
**Plugin Count**: 5 plugins installed
**Status**: ✅ All plugins operational
