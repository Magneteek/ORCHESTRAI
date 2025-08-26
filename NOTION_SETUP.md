# Notion MCP Integration Setup Guide

## 🎯 Overview
This guide walks you through setting up Notion MCP integration with ORCHESTRAI for automatic syncing of research documents, articles, and webpage content.

## 📋 Prerequisites
- ORCHESTRAI system running (Phase 1 complete)
- Notion account with workspace admin access
- Node.js and npm installed

## 🚀 Step-by-Step Setup

### 1. Create Notion Integration

1. **Go to Notion Integrations Page**
   - Navigate to: https://www.notion.so/profile/integrations
   - Click "Create new integration"

2. **Configure Integration Settings**
   - **Name**: `ORCHESTRAI Content Sync`
   - **Description**: `Auto-sync research documents and content from ORCHESTRAI system`
   - **Workspace**: Select your target workspace
   - **Content Capabilities**: ✅ Read content, ✅ Update content, ✅ Insert content
   - **Comment Capabilities**: ✅ Read comments, ✅ Insert comments (optional)
   - **User Capabilities**: ✅ Read user information (optional)

3. **Generate API Token**
   - After creating the integration, copy the "Internal Integration Token"
   - It should start with `secret_` or `ntn_`
   - **Keep this token secure - never commit it to git!**

### 2. Configure Environment Variables

1. **Copy Environment Template**
   ```bash
   cp .env.example .env
   ```

2. **Add Notion Token**
   ```bash
   # Open .env file and update:
   NOTION_TOKEN=your_actual_notion_token_here
   ```

### 3. Connect Pages to Integration

Choose one of these approaches:

#### Option A: Connect Specific Pages
1. Go to any Notion page you want ORCHESTRAI to access
2. Click the "..." menu in the top-right
3. Click "Connect to integration"
4. Select "ORCHESTRAI Content Sync"

#### Option B: Bulk Connection (Recommended)
1. Go back to your integration settings: https://www.notion.so/profile/integrations
2. Click on your "ORCHESTRAI Content Sync" integration
3. Go to the "Access" tab
4. Click "Edit access"
5. Select pages/databases you want to sync:
   - Research workspace/database
   - Content creation workspace
   - Marketing materials database
   - Any other relevant pages

### 4. Test Connection

Run the connection test:
```bash
npm run test:notion
```

Expected output:
```
✅ Notion API connection successful
📋 Connected to: [Your Workspace Name]
👤 User: [Your Name]
```

### 5. Verify MCP Server

Test the MCP server startup:
```bash
npm run mcp:start notion
```

Expected output:
```
🚀 Starting MCP server: notion
✅ MCP server notion started successfully
```

## 📁 Recommended Notion Workspace Structure

Set up these pages/databases for optimal ORCHESTRAI integration:

### Research Database
```
📊 Research Hub
├── 🔍 Market Research
├── 👥 User Research  
├── 🏢 Competitor Analysis
├── 📈 Analytics & Data
└── 🧠 Insights & Findings
```

### Content Database
```
✍️ Content Creation
├── 📝 Blog Articles
├── 🌐 Website Content
├── 📧 Email Campaigns
├── 📱 Social Media Content
└── 🎯 Marketing Copy
```

### Project Tracking
```
🎯 ORCHESTRAI Projects
├── 📋 Active Projects
├── ✅ Completed Projects
├── 🔄 In Progress
└── 📊 Project Analytics
```

## 🔧 Auto-Sync Configuration

ORCHESTRAI will automatically sync:

### Research Documents
- **Market research findings** → Research Hub
- **User insights** → User Research  
- **Competitor analysis** → Competitor Analysis
- **Data analysis reports** → Analytics & Data

### Content Creation
- **Blog articles** → Blog Articles
- **Website copy** → Website Content
- **Marketing materials** → Marketing Copy
- **Social media content** → Social Media Content

### Metadata Tracking
Each synced document includes:
- **Creation timestamp**
- **ORCHESTRAI project ID**
- **Agent/domain that created it**
- **Source crystalline memory nodes**
- **Related research links**

## 🔍 Testing Your Setup

### 1. Basic Connection Test
```bash
node -e "
const MCPManager = require('./orchestrai-shared/mcp-servers/mcp-manager');
const manager = new MCPManager();
manager.testNotionConnection().then(console.log);
"
```

### 2. Create Test Page
```bash
# This will create a test page in your connected workspace
npm run test:notion:create
```

### 3. Full Integration Test
```bash
# Start orchestrator with MCP integration
npm run orchestrator:mcp
```

## 🚨 Troubleshooting

### Common Issues

**❌ "Unauthorized" Error**
- Verify your NOTION_TOKEN is correct
- Check that the integration has access to target pages
- Ensure token starts with `secret_` or `ntn_`

**❌ "Object not found" Error**  
- Page/database isn't connected to integration
- Go to page → "..." → "Connect to integration"
- Or use bulk connection method in integration settings

**❌ "Insufficient permissions" Error**
- Integration needs "Insert content" permission
- Check integration capabilities in Notion settings
- Recreate integration with correct permissions

**❌ MCP Server Won't Start**
- Verify @notionhq/notion-mcp-server is installed
- Check if port is already in use
- Review logs: `npm run mcp:logs notion`

### Debug Commands

```bash
# Check MCP server status
npm run mcp:status

# View MCP server logs
npm run mcp:logs notion

# Restart specific MCP server
npm run mcp:restart notion

# Test all MCP servers
npm run mcp:test
```

## 🎯 Next Steps

After successful setup:

1. **Configure Auto-Sync Rules** in the dashboard
2. **Set up Content Templates** for consistent formatting
3. **Create Notion Database Views** for better organization
4. **Enable Real-time Notifications** for content updates
5. **Explore Advanced Features** like semantic tagging

## 🔒 Security Best Practices

- ✅ Never commit `.env` file to git
- ✅ Use workspace-scoped integrations (not public)
- ✅ Regularly rotate integration tokens
- ✅ Monitor integration access logs
- ✅ Limit page access to what's needed
- ✅ Use separate integrations for dev/prod

## 📞 Support

If you encounter issues:
1. Check logs in the ORCHESTRAI dashboard
2. Review this setup guide
3. Test connection using debug commands
4. Check Notion integration status page

---

🧠 **ORCHESTRAI Notion Integration** - Revolutionizing AI-Human Content Collaboration