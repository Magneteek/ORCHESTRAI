#!/bin/bash

# Google Search Console MCP Setup Verification Script
# This script verifies that the GSC MCP server is properly configured

echo "=========================================="
echo "Google Search Console MCP Setup Verification"
echo "=========================================="
echo ""

# Check 1: OAuth Credentials File
echo "✓ Checking OAuth credentials file..."
if [ -f "/Users/kris/CLAUDEtools/OAuth Client ID - Krisbal-orchestrai.json" ]; then
    echo "  ✅ OAuth credentials file exists"
else
    echo "  ❌ OAuth credentials file NOT found"
    exit 1
fi

# Check 2: Environment Variable
echo ""
echo "✓ Checking environment variable..."
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "  ✅ GOOGLE_APPLICATION_CREDENTIALS is set to: $GOOGLE_APPLICATION_CREDENTIALS"
else
    echo "  ⚠️  GOOGLE_APPLICATION_CREDENTIALS not set in current shell"
    echo "  This is OK - it's configured in .env and MCP settings"
fi

# Check 3: Claude Code MCP Configuration
echo ""
echo "✓ Checking Claude Code MCP configuration..."
if [ -f "/Users/kris/.config/claude-code/mcp.json" ]; then
    if grep -q "mcp-server-gsc" "/Users/kris/.config/claude-code/mcp.json"; then
        echo "  ✅ GSC MCP server configured in Claude Code"
    else
        echo "  ❌ GSC MCP server NOT found in Claude Code config"
        exit 1
    fi
else
    echo "  ❌ Claude Code MCP config file not found"
    exit 1
fi

# Check 4: Project .env file
echo ""
echo "✓ Checking project .env file..."
if [ -f "/Users/kris/CLAUDEtools/ORCHESTRAI/.env" ]; then
    if grep -q "GOOGLE_APPLICATION_CREDENTIALS" "/Users/kris/CLAUDEtools/ORCHESTRAI/.env"; then
        echo "  ✅ GOOGLE_APPLICATION_CREDENTIALS configured in .env"
    else
        echo "  ❌ GOOGLE_APPLICATION_CREDENTIALS NOT found in .env"
        exit 1
    fi
else
    echo "  ❌ .env file not found"
    exit 1
fi

# Check 5: MCP Package
echo ""
echo "✓ Checking mcp-server-gsc package..."
if npx -y mcp-server-gsc --version 2>/dev/null; then
    echo "  ✅ mcp-server-gsc package available"
else
    echo "  ⚠️  Package check failed (this is normal if not installed yet)"
fi

echo ""
echo "=========================================="
echo "Setup Verification Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Restart Claude Code to reload MCP configuration"
echo "2. The first time you use GSC functions, you may need to:"
echo "   - Complete OAuth authentication in your browser"
echo "   - Grant permissions to access Search Console data"
echo "3. Test the connection by listing your sites"
echo ""
echo "Available GSC Functions:"
echo "  • mcp__gsc__list_sites - List all sites in your account"
echo "  • mcp__gsc__search_analytics - Get search performance data"
echo "  • mcp__gsc__index_inspect - Check URL indexing status"
echo "  • mcp__gsc__list_sitemaps - List site sitemaps"
echo "  • mcp__gsc__submit_sitemap - Submit new sitemap"
echo ""
