#!/bin/bash

##
# Switch to Full MCP Configuration
# Use this when you need all MCP servers (Notion, GSC, n8n, etc.)
##

echo "🔄 Switching to FULL MCP configuration..."
echo ""

if [ ! -f ".mcp.full.json" ]; then
    echo "❌ Error: .mcp.full.json not found"
    exit 1
fi

# Backup current .mcp.json if it exists and isn't a symlink
if [ -f ".mcp.json" ] && [ ! -L ".mcp.json" ]; then
    cp .mcp.json .mcp.backup.json
    echo "✅ Backed up current config to .mcp.backup.json"
fi

# Copy full config to .mcp.json
cp .mcp.full.json .mcp.json

echo "✅ Switched to FULL MCP configuration"
echo ""
echo "📊 Active MCP Servers (8 total):"
echo "   - filesystem (core file operations)"
echo "   - memory (crystalline memory)"
echo "   - sequential-thinking (advanced reasoning)"
echo "   - dataforseo (SEO data)"
echo "   - ref-tools (documentation access)"
echo "   - notion (database management)"
echo "   - shadcn-ui (component library)"
echo "   - n8n (workflow automation)"
echo ""
echo "⚠️  Warning:"
echo "   - Higher memory usage (~1.2-1.6GB)"
echo "   - May cause VS Code sluggishness on heavy workloads"
echo ""
echo "💡 To reduce memory usage: ./scripts/switch-mcp-minimal.sh"
echo ""
