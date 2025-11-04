#!/bin/bash

# Update GSC MCP Configuration Script

echo "============================================"
echo "GSC MCP Configuration Update"
echo "============================================"
echo ""

SERVICE_ACCOUNT_PATH="/Users/kris/CLAUDEtools/gsc-service-account.json"
MCP_CONFIG="$HOME/.config/claude-code/mcp.json"
ENV_FILE="/Users/kris/CLAUDEtools/ORCHESTRAI/.env"

# Check if service account file exists
if [ ! -f "$SERVICE_ACCOUNT_PATH" ]; then
  echo "❌ Service account file not found at: $SERVICE_ACCOUNT_PATH"
  echo ""
  echo "Please download your service account JSON key and save it to:"
  echo "  $SERVICE_ACCOUNT_PATH"
  echo ""
  exit 1
fi

echo "✅ Service account file found"

# Update MCP configuration
echo ""
echo "Updating MCP configuration..."

# Create backup
cp "$MCP_CONFIG" "$MCP_CONFIG.backup"

# Update the configuration with proper JSON handling
cat > "$MCP_CONFIG" <<'EOF'
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://aia.magneteek.com",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNmQ3MDViNi1lNWZkLTQ0NzgtODBjYS0yY2QzZDhiZmMyN2UiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMDE4OTA1LCJleHAiOjE3Njc3NDA0MDB9.NAD_rjVV-5gntaVm50z4AbX9GqpVwrQTM0lc1U7biLg"
      }
    },
    "gsc": {
      "command": "npx",
      "args": ["-y", "mcp-server-gsc"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/Users/kris/CLAUDEtools/gsc-service-account.json"
      }
    }
  }
}
EOF

echo "✅ MCP configuration updated"

# Update .env file
echo ""
echo "Updating .env file..."

if grep -q "GOOGLE_APPLICATION_CREDENTIALS" "$ENV_FILE"; then
  # Update existing line
  sed -i '' "s|GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=$SERVICE_ACCOUNT_PATH|" "$ENV_FILE"
else
  # Add new line
  echo "GOOGLE_APPLICATION_CREDENTIALS=$SERVICE_ACCOUNT_PATH" >> "$ENV_FILE"
fi

echo "✅ .env file updated"

echo ""
echo "============================================"
echo "Configuration Update Complete!"
echo "============================================"
echo ""
echo "Next Steps:"
echo "1. Restart Claude Code"
echo "2. Run: mcp__gsc__list_sites()"
echo ""
echo "The service account email needs to be added to your Search Console properties:"
echo "  - Go to Search Console → Settings → Users and permissions"
echo "  - Add the service account email from your JSON file"
echo ""