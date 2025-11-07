#!/bin/bash

# N8N MCP Server Wrapper Script
# This ensures environment variables are properly set before launching the MCP server

# MCP Server Configuration (required for proper MCP operation)
export MCP_MODE="stdio"
export LOG_LEVEL="error"
export DISABLE_CONSOLE_OUTPUT="true"

# N8N API Configuration (enables workflow management features)
# These should be set in your .env file
if [ -z "$N8N_API_URL" ]; then
  echo "Warning: N8N_API_URL not set in environment"
  export N8N_API_URL="https://aia.magneteek.com"
fi

if [ -z "$N8N_API_KEY" ]; then
  echo "Error: N8N_API_KEY must be set in your .env file"
  exit 1
fi

# Optional: Webhook security mode (recommended for local development)
# export WEBHOOK_SECURITY_MODE="moderate"

# Launch N8N MCP server with full configuration
exec npx -y n8n-mcp
