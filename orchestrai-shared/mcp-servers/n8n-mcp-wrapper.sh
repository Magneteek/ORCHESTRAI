#!/bin/bash

# N8N MCP Server Wrapper Script
# This ensures environment variables are properly set before launching the MCP server

# MCP Server Configuration (required for proper MCP operation)
export MCP_MODE="stdio"
export LOG_LEVEL="error"
export DISABLE_CONSOLE_OUTPUT="true"

# N8N API Configuration (enables workflow management features)
export N8N_API_URL="https://aia.magneteek.com"
export N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNmQ3MDViNi1lNWZkLTQ0NzgtODBjYS0yY2QzZDhiZmMyN2UiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwMDE4OTA1LCJleHAiOjE3Njc3NDA0MDB9.NAD_rjVV-5gntaVm50z4AbX9GqpVwrQTM0lc1U7biLg"

# Optional: Webhook security mode (recommended for local development)
# export WEBHOOK_SECURITY_MODE="moderate"

# Launch N8N MCP server with full configuration
exec npx -y n8n-mcp
