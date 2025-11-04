#!/bin/bash
# Send token usage from Claude Code PostToolUse hook
# Reads stdin (hook data), extracts transcript path, reads tokens, sends to hooks server

# Read hook data from stdin
data=$(cat)

# Extract transcript path
transcript=$(echo "$data" | jq -r '.transcript_path // ""')

# Check if transcript exists
if [ -z "$transcript" ] || [ ! -f "$transcript" ]; then
  exit 0  # Silent exit if no transcript
fi

# Wait briefly for transcript to be written
sleep 0.3

# Find the most recent line with actual token usage data
# Search last 10 lines for an assistant message with usage data
json=$(tail -n 10 "$transcript" | \
  grep '"type":"assistant"' | \
  tail -n 1 | \
  jq -c '{
    inputTokens: (.message.usage.input_tokens // 0),
    outputTokens: (.message.usage.output_tokens // 0),
    model: (.message.model // "claude-sonnet-4-5-20250929"),
    workflowId: (now | tostring),
    timestamp: now
  }' 2>/dev/null)

# Only send if we have non-zero tokens
if [ -n "$json" ]; then
  input=$(echo "$json" | jq -r '.inputTokens')
  output=$(echo "$json" | jq -r '.outputTokens')
  if [ "$input" = "0" ] && [ "$output" = "0" ]; then
    exit 0  # Skip if both are zero
  fi
fi

# Send to hooks server if extraction succeeded
if [ -n "$json" ] && [ "$json" != "null" ]; then
  curl -s -X POST http://localhost:5501/hooks/token-usage \
    -H 'Content-Type: application/json' \
    -d "$json" > /dev/null 2>&1 || true
fi
