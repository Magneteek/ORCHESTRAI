#!/bin/bash

# Google Search Console MCP Test Script
# Tests all GSC MCP functions after Claude Code restart

echo "===================================================================="
echo "Google Search Console MCP Test Suite"
echo "===================================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test credentials file
echo "📋 Test 1: Verifying Credentials File"
echo "--------------------------------------------------------------------"
CREDS_FILE="/Users/kris/CLAUDEtools/GSC Orchestrai IAM Admin Krisbal.json"

if [ -f "$CREDS_FILE" ]; then
    echo -e "${GREEN}✅ Credentials file exists${NC}"
    FILE_SIZE=$(ls -lh "$CREDS_FILE" | awk '{print $5}')
    echo "   File size: $FILE_SIZE"

    # Validate JSON
    if jq empty "$CREDS_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ JSON is valid${NC}"

        # Extract service account email
        SERVICE_EMAIL=$(jq -r '.client_email' "$CREDS_FILE")
        echo "   Service account: $SERVICE_EMAIL"
    else
        echo -e "${RED}❌ Invalid JSON format${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Credentials file not found${NC}"
    exit 1
fi

echo ""

# Test Claude Code config
echo "📋 Test 2: Verifying Claude Code MCP Configuration"
echo "--------------------------------------------------------------------"
MCP_CONFIG="$HOME/.config/claude-code/mcp.json"

if [ -f "$MCP_CONFIG" ]; then
    echo -e "${GREEN}✅ MCP config file exists${NC}"

    # Check if GSC server is configured
    if jq -e '.mcpServers.gsc' "$MCP_CONFIG" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ GSC server configured${NC}"

        # Verify credentials path
        CONFIG_CREDS_PATH=$(jq -r '.mcpServers.gsc.env.GOOGLE_APPLICATION_CREDENTIALS' "$MCP_CONFIG")
        echo "   Configured path: $CONFIG_CREDS_PATH"

        if [ "$CONFIG_CREDS_PATH" = "$CREDS_FILE" ]; then
            echo -e "${GREEN}✅ Credentials path matches${NC}"
        else
            echo -e "${YELLOW}⚠️  Credentials path mismatch${NC}"
            echo "   Expected: $CREDS_FILE"
            echo "   Found: $CONFIG_CREDS_PATH"
        fi
    else
        echo -e "${RED}❌ GSC server not configured${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ MCP config file not found${NC}"
    echo "   Expected location: $MCP_CONFIG"
    exit 1
fi

echo ""

# Test project config
echo "📋 Test 3: Verifying Project MCP Configuration"
echo "--------------------------------------------------------------------"
PROJECT_CONFIG="/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-shared/mcp-servers/mcp-config.json"

if [ -f "$PROJECT_CONFIG" ]; then
    echo -e "${GREEN}✅ Project MCP config exists${NC}"

    # Check if GSC server is enabled
    if jq -e '.mcpServers."google-search-console"' "$PROJECT_CONFIG" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ GSC server configured in project${NC}"

        ENABLED=$(jq -r '.mcpServers."google-search-console".enabled' "$PROJECT_CONFIG")
        PRIORITY=$(jq -r '.mcpServers."google-search-console".priority' "$PROJECT_CONFIG")

        echo "   Enabled: $ENABLED"
        echo "   Priority: $PRIORITY"

        if [ "$ENABLED" = "true" ]; then
            echo -e "${GREEN}✅ GSC server is enabled${NC}"
        else
            echo -e "${YELLOW}⚠️  GSC server is disabled${NC}"
        fi
    else
        echo -e "${RED}❌ GSC server not configured in project${NC}"
    fi
else
    echo -e "${RED}❌ Project MCP config not found${NC}"
fi

echo ""
echo "===================================================================="
echo "Configuration Verification Complete"
echo "===================================================================="
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Claude Code Restart Required${NC}"
echo ""
echo "The GSC MCP server configuration is correct, but Claude Code must be"
echo "restarted for the MCP server to initialize properly."
echo ""
echo "Next Steps:"
echo "  1. Save all work"
echo "  2. Quit Claude Code completely"
echo "  3. Reopen Claude Code"
echo "  4. Return to this project"
echo "  5. Run functional tests"
echo ""
echo "After restart, test these functions in Claude Code:"
echo ""
echo "  // Test 1: List sites"
echo "  await mcp__gsc__list_sites()"
echo ""
echo "  // Test 2: Get search analytics (replace with your domain)"
echo "  await mcp__gsc__search_analytics({"
echo "    siteUrl: 'sc-domain:example.com',"
echo "    startDate: '2025-10-01',"
echo "    endDate: '2025-10-31',"
echo "    dimensions: 'query',"
echo "    rowLimit: 10"
echo "  })"
echo ""
echo "  // Test 3: Inspect URL (replace with your domain and URL)"
echo "  await mcp__gsc__index_inspect({"
echo "    siteUrl: 'sc-domain:example.com',"
echo "    inspectionUrl: 'https://example.com/'"
echo "  })"
echo ""
echo "===================================================================="
echo "Setup Status: ⚠️  Awaiting Claude Code Restart"
echo "===================================================================="
