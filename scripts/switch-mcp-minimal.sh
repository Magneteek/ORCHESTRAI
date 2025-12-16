#!/bin/bash

##
# Switch to Minimal MCP Configuration
# Use this for general development work to reduce memory usage
##

echo "🔄 Switching to MINIMAL MCP configuration..."
echo ""

if [ ! -f ".mcp.minimal.json" ]; then
    echo "❌ Error: .mcp.minimal.json not found"
    exit 1
fi

# Backup current .mcp.json if it exists and isn't a symlink
if [ -f ".mcp.json" ] && [ ! -L ".mcp.json" ]; then
    cp .mcp.json .mcp.backup.json
    echo "✅ Backed up current config to .mcp.backup.json"
fi

# Copy minimal config to .mcp.json
cp .mcp.minimal.json .mcp.json

echo "✅ Switched to MINIMAL MCP configuration"
echo ""
echo "📊 Active MCP Servers (4 total):"
echo "   - filesystem (core file operations)"
echo "   - memory (crystalline memory)"
echo "   - sequential-thinking (advanced reasoning)"
echo "   - dataforseo (SEO data)"
echo ""
echo "⚡ Benefits:"
echo "   - ~60% less memory usage"
echo "   - Faster VS Code startup"
echo "   - Reduced crash risk"
echo ""
echo "💡 To restore full configuration: ./scripts/switch-mcp-full.sh"
echo ""
