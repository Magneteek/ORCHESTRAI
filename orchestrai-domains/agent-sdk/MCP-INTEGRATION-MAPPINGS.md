# MCP Integration Mappings for Packaged Agents

**Created**: 2026-01-17
**Purpose**: Define MCP server requirements for each packaged ORCHESTRAI agent
**Version**: 1.0.0

---

## Overview

This document maps each Tier 1 packaged agent to its **required and optional MCP servers**. Use these mappings when configuring Agent SDK applications to ensure all necessary integrations are included.

### MCP Server Categories

**Available MCP Servers**:
1. **dataforseo** - SEO data, keyword research, competitor analysis
2. **memory** - Persistent knowledge graphs, brand voice, context
3. **sequential-thinking** - Advanced problem-solving, planning
4. **ref-tools** - Documentation search, technical references
5. **notion** - Workspace integration, content management
6. **filesystem** - Local file operations, template access
7. **google-search-console** - Search performance data
8. **sanity** - CMS integration, content delivery

---

## Tier 1 Agent MCP Mappings

### 1. ContentWriter Pro

**Source Agent**: `content-writer-specialist`
**SDK Name**: `ContentWriter Pro`
**Market**: Content marketing, blog writing, agencies

#### Required MCP Servers

**dataforseo** (Critical)
```json
{
  "server": "dataforseo",
  "purpose": "Keyword research and SEO optimization",
  "tools_used": [
    "keyword_overview",
    "related_keywords",
    "search_intent"
  ],
  "configuration": {
    "api_key": "DATAFORSEO_API_KEY",
    "api_secret": "DATAFORSEO_API_SECRET"
  }
}
```

**memory** (Critical)
```json
{
  "server": "memory",
  "purpose": "Brand voice consistency and content history",
  "tools_used": [
    "create_entities",
    "add_observations",
    "search_nodes",
    "open_nodes"
  ],
  "configuration": {
    "storage_path": "./memory-store"
  }
}
```

**sequential-thinking** (Critical)
```json
{
  "server": "sequential-thinking",
  "purpose": "Content planning and outline creation",
  "tools_used": [
    "sequentialthinking"
  ],
  "configuration": {}
}
```

#### Optional MCP Servers

**notion**
```json
{
  "server": "notion",
  "purpose": "Content calendar management",
  "tools_used": [
    "API-post-database-query",
    "API-post-page",
    "API-patch-page"
  ],
  "configuration": {
    "api_key": "NOTION_API_KEY"
  }
}
```

**filesystem**
```json
{
  "server": "filesystem",
  "purpose": "Local content templates",
  "tools_used": [
    "read_text_file",
    "write_file",
    "list_directory"
  ],
  "configuration": {
    "allowed_directories": ["./templates", "./output"]
  }
}
```

#### Setup Instructions

**`.mcp.json` Configuration**:
```json
{
  "mcpServers": {
    "dataforseo": {
      "command": "node",
      "args": ["path/to/dataforseo-mcp-server.js"],
      "env": {
        "DATAFORSEO_API_KEY": "${DATAFORSEO_API_KEY}",
        "DATAFORSEO_API_SECRET": "${DATAFORSEO_API_SECRET}"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**`.env.example`**:
```bash
# Required MCP Credentials
DATAFORSEO_API_KEY=your_dataforseo_api_key
DATAFORSEO_API_SECRET=your_dataforseo_api_secret

# Optional MCP Credentials
NOTION_API_KEY=your_notion_api_key # (if using Notion integration)
```

---

### 2. SEO Competitor Intelligence

**Source Agent**: `seo-competitor-analysis`
**SDK Name**: `SEO Competitor Intelligence`
**Market**: SEO agencies, growth teams, digital marketing

#### Required MCP Servers

**dataforseo** (Critical - Full Suite)
```json
{
  "server": "dataforseo",
  "purpose": "Complete SEO data analysis",
  "tools_used": [
    "keyword_overview",
    "related_keywords",
    "serp_competitors",
    "domain_keywords",
    "competitor_domains",
    "domain_intersection",
    "search_intent"
  ],
  "configuration": {
    "api_key": "DATAFORSEO_API_KEY",
    "api_secret": "DATAFORSEO_API_SECRET"
  }
}
```

**memory** (Critical)
```json
{
  "server": "memory",
  "purpose": "Competitive intelligence tracking over time",
  "tools_used": [
    "create_entities",
    "create_relations",
    "add_observations",
    "search_nodes"
  ],
  "configuration": {
    "storage_path": "./seo-intelligence-memory"
  }
}
```

**sequential-thinking** (Critical)
```json
{
  "server": "sequential-thinking",
  "purpose": "Strategic SEO analysis and recommendation formulation",
  "tools_used": [
    "sequentialthinking"
  ],
  "configuration": {}
}
```

#### Optional MCP Servers

**google-search-console**
```json
{
  "server": "google-search-console",
  "purpose": "Client's own search performance data",
  "tools_used": [
    "search_analytics",
    "list_sites"
  ],
  "configuration": {
    "credentials_path": "./gsc-credentials.json"
  }
}
```

#### Setup Instructions

**`.mcp.json` Configuration**:
```json
{
  "mcpServers": {
    "dataforseo": {
      "command": "node",
      "args": ["path/to/dataforseo-mcp-server.js"],
      "env": {
        "DATAFORSEO_API_KEY": "${DATAFORSEO_API_KEY}",
        "DATAFORSEO_API_SECRET": "${DATAFORSEO_API_SECRET}"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**`.env.example`**:
```bash
# Required MCP Credentials
DATAFORSEO_API_KEY=your_dataforseo_api_key
DATAFORSEO_API_SECRET=your_dataforseo_api_secret

# Optional MCP Credentials (for client data integration)
GSC_CREDENTIALS_PATH=./gsc-credentials.json # Google Search Console
```

---

### 3. Healthcare Content Specialist

**Source Agent**: `healthcare-content-specialist`
**SDK Name**: `Healthcare Content Specialist`
**Market**: Healthcare providers, pharma, medical device manufacturers
**Compliance**: HIPAA, FDA

#### Required MCP Servers

**ref-tools** (Critical)
```json
{
  "server": "ref-tools",
  "purpose": "Medical literature and documentation search",
  "tools_used": [
    "ref_search_documentation",
    "ref_read_url"
  ],
  "configuration": {
    "sources": ["medical", "scientific", "healthcare"]
  }
}
```

**memory** (Critical)
```json
{
  "server": "memory",
  "purpose": "Medical knowledge base and compliance tracking",
  "tools_used": [
    "create_entities",
    "add_observations",
    "search_nodes",
    "create_relations"
  ],
  "configuration": {
    "storage_path": "./medical-knowledge-memory",
    "hipaa_compliant": true
  }
}
```

**sequential-thinking** (Critical)
```json
{
  "server": "sequential-thinking",
  "purpose": "Clinical accuracy validation and reasoning",
  "tools_used": [
    "sequentialthinking"
  ],
  "configuration": {}
}
```

#### Special Considerations

**HIPAA Compliance**:
- All MCP servers must handle PHI securely
- Memory storage must be encrypted at rest
- No PHI should be logged or cached
- Audit trail required for all operations

**Configuration Additions**:
```json
{
  "compliance": {
    "hipaa": true,
    "phi_detection": true,
    "audit_logging": true,
    "encryption_at_rest": true
  }
}
```

#### Setup Instructions

**`.mcp.json` Configuration**:
```json
{
  "mcpServers": {
    "ref-tools": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-ref-tools"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {
        "MEMORY_ENCRYPTION": "true",
        "HIPAA_COMPLIANT": "true"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**`.env.example`**:
```bash
# HIPAA Compliance Settings
MEMORY_ENCRYPTION=true
HIPAA_COMPLIANT=true
AUDIT_LOGGING_PATH=./audit-logs

# Medical Literature Access
REF_TOOLS_MEDICAL_SOURCES=true
```

---

### 4. Cold Email Outreach Agent

**Source Agent**: `cold-email-copywriter`
**SDK Name**: `Cold Email Outreach Agent`
**Market**: B2B sales teams, SDR organizations, agencies

#### Required MCP Servers

**memory** (Critical)
```json
{
  "server": "memory",
  "purpose": "Prospect intelligence and personalization data",
  "tools_used": [
    "create_entities",
    "add_observations",
    "search_nodes",
    "create_relations"
  ],
  "configuration": {
    "storage_path": "./prospect-intelligence"
  }
}
```

**sequential-thinking** (Critical)
```json
{
  "server": "sequential-thinking",
  "purpose": "Email sequence strategy and psychology",
  "tools_used": [
    "sequentialthinking"
  ],
  "configuration": {}
}
```

#### Optional MCP Servers

**notion**
```json
{
  "server": "notion",
  "purpose": "CRM integration and campaign tracking",
  "tools_used": [
    "API-post-database-query",
    "API-post-page",
    "API-patch-page"
  ],
  "configuration": {
    "api_key": "NOTION_API_KEY"
  }
}
```

#### Setup Instructions

**`.mcp.json` Configuration**:
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**`.env.example`**:
```bash
# Optional CRM Integration
NOTION_API_KEY=your_notion_api_key # (if using Notion CRM)
```

---

## MCP Server Setup Guide

### Installation

All MCP servers can be installed via NPM:

```bash
# Install all common MCP servers
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-sequential-thinking

# Or use npx (no global install needed)
# They'll be downloaded on first use
```

### Configuration Template

Create `.mcp.json` in project root:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node|npx",
      "args": ["server-path-or-package"],
      "env": {
        "VAR_NAME": "${VAR_NAME}"
      }
    }
  }
}
```

### Environment Variables

Create `.env` file (never commit this):

```bash
# Copy from .env.example
cp .env.example .env

# Edit with your credentials
nano .env
```

### Testing MCP Connections

```typescript
// Test MCP server connection
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({
  name: 'Test Agent',
  tools: [/* MCP tools */]
});

// Test each MCP tool
await agent.testMCPConnection('dataforseo');
await agent.testMCPConnection('memory');
```

---

## Troubleshooting

### Common Issues

**1. MCP Server Not Found**
```bash
# Solution: Install server globally or use npx
npm install -g @modelcontextprotocol/server-memory
```

**2. Environment Variables Not Loading**
```bash
# Solution: Check .env file exists and is in project root
ls -la .env
# Verify variables are set
echo $DATAFORSEO_API_KEY
```

**3. Connection Timeout**
```bash
# Solution: Check server is running
ps aux | grep mcp
# Restart if needed
```

**4. HIPAA Compliance Issues (Healthcare Agent)**
```bash
# Solution: Enable encryption and audit logging
export MEMORY_ENCRYPTION=true
export AUDIT_LOGGING_PATH=./audit-logs
```

---

## Quick Reference: MCP Server by Agent

| Agent | dataforseo | memory | sequential-thinking | ref-tools | notion | filesystem | gsc |
|-------|-----------|--------|---------------------|-----------|--------|------------|-----|
| **ContentWriter Pro** | ✅ | ✅ | ✅ | ❌ | ⭕ | ⭕ | ❌ |
| **SEO Competitor** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ⭕ |
| **Healthcare Content** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Cold Email** | ❌ | ✅ | ✅ | ❌ | ⭕ | ❌ | ❌ |

**Legend**: ✅ Required | ⭕ Optional | ❌ Not used

---

## Next Steps

1. **Review agent requirements** - Understand which MCP servers are needed
2. **Install MCP servers** - Use npm or npx for installation
3. **Configure .mcp.json** - Set up MCP server connections
4. **Set environment variables** - Add credentials to .env
5. **Test connections** - Verify each MCP server works
6. **Proceed with packaging** - Use agent-sdk-packaging-pipeline.js

---

**Status**: Complete MCP mappings for Tier 1 agents
**Last Updated**: 2026-01-17
**Next**: Tier 2 agent mappings (Google Ads, Email Marketing, Meta Ads, Technical SEO)
